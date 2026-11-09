import { type PerspectiveCamera, Vector3 } from 'three';
import { clamp, damp } from '../core/math';
import type { Rng } from '../core/rng';
import type { PhysicsWorld } from '../physics/Physics';
import { QueryGroups } from '../physics/Physics';
import type { Posture } from '../entities/PlayerController';

export interface CameraSettings {
  /** Sensibilidad del ratón (rad por píxel). */
  mouseSens: number;
  /** Sensibilidad del stick (rad/s a fondo). */
  padSens: number;
  invertY: boolean;
  fov: number;
  /** 0..1: escala de la sacudida de cámara (accesibilidad). */
  shake: number;
}

export const DEFAULT_CAMERA: CameraSettings = { mouseSens: 0.0022, padSens: 3.2, invertY: false, fov: 68, shake: 1 };

const PITCH_MIN = -1.25;
const PITCH_MAX = 1.05;
// Encuadre: el personaje en el tercio izquierdo (hombro derecho) sin tapar la mira.
const SHOULDER_OFFSET = 0.7;
/**
 * Al apuntar el hombro NO se separa más: si la cámara ve más allá de la cobertura que el
 * arma, la mira queda "bloqueada" a menudo (lo midió el bot 1vN). La distancia y el FOV dan el zoom.
 */
const SHOULDER_OFFSET_AIM = 0.7;
const UP_OFFSET = 0.2;
const DIST_NORMAL = 3.1;
const DIST_AIM = 2.2;
const DIST_SPRINT = 3.4;
/** Zoom de FOV al apuntar (compensa la distancia mayor: el objetivo se ve igual de grande). */
const AIM_FOV_FACTOR = 0.7;
const CAM_RADIUS = 0.2;
const MARGIN = 0.06;
const MIN_DIST = 0.25;
const PIVOT_STAND = 1.55;
const PIVOT_CROUCH = 1.0;

const _head = new Vector3();
const _right = new Vector3();
const _fwd = new Vector3();
const _shoulder = new Vector3();
const _dir = new Vector3();
const _desired = new Vector3();

export interface CameraFrameInput {
  feet: Vector3;
  posture: Posture;
  aiming: boolean;
  sprinting: boolean;
  dt: number;
}

/**
 * Cámara sobre el hombro con colisión (sphere casts contra geometría estática):
 * 1) cabeza → hombro, 2) hombro → posición deseada, 3) cabeza → cámara final (línea directa).
 * Si algo tapa se acerca AL INSTANTE; al despejarse se aleja suavemente. Nunca entra en geometría.
 */
export class CameraRig {
  yaw = 0;
  pitch = -0.12;
  settings: CameraSettings = { ...DEFAULT_CAMERA };
  /** +1 hombro derecho, −1 izquierdo. */
  shoulderSide = 1;
  readonly position = new Vector3();
  /** Punto de pivote (cabeza) del último frame. */
  readonly pivot = new Vector3();
  readonly forward = new Vector3(0, 0, -1);
  /** Distancia efectiva cámara-cabeza del último frame (para transparentar al jugador). */
  distanceToHead = DIST_NORMAL;
  private shoulderCur = 1;
  private dist = DIST_NORMAL;
  private pivotH = PIVOT_STAND;
  private fovCur = 68;
  private aimK = 0;
  private trauma = 0;
  private recoilPitch = 0;
  private recoilYaw = 0;
  private time = 0;

  constructor(
    private readonly camera: PerspectiveCamera,
    private readonly rng: Rng,
  ) {}

  /** Mirada con ratón (px) y stick (−1..1). */
  look(mouseDX: number, mouseDY: number, padX: number, padY: number, realDt: number): void {
    const s = this.settings;
    const inv = s.invertY ? -1 : 1;
    // Al apuntar, sensibilidad algo menor para precisión.
    const k = 1 - this.aimK * 0.35;
    this.yaw -= mouseDX * s.mouseSens * k + padX * s.padSens * realDt * k;
    this.pitch -= (mouseDY * s.mouseSens * k + padY * s.padSens * realDt * k * 0.8) * inv;
    this.pitch = clamp(this.pitch, PITCH_MIN, PITCH_MAX);
    if (this.yaw > Math.PI * 4 || this.yaw < -Math.PI * 4) this.yaw = Math.atan2(Math.sin(this.yaw), Math.cos(this.yaw));
  }

  setYawPitch(yaw: number, pitch: number): void {
    this.yaw = yaw;
    this.pitch = clamp(pitch, PITCH_MIN, PITCH_MAX);
  }

  toggleShoulder(): void {
    this.shoulderSide *= -1;
  }

  addTrauma(v: number): void {
    this.trauma = clamp(this.trauma + v, 0, 1);
  }

  /** Retroceso del arma: sube la mira (patrón fijo lo decide el arma). Se recupera parcialmente. */
  kick(pitchRad: number, yawRad: number): void {
    this.pitch = clamp(this.pitch + pitchRad, PITCH_MIN, PITCH_MAX);
    this.yaw += yawRad;
    this.recoilPitch += pitchRad;
    this.recoilYaw += yawRad;
  }

  /** Recuperación del retroceso (vuelve ~60 % hacia la mira original). */
  private recover(dt: number): void {
    const back = 1 - Math.exp(-7 * dt);
    const dp = this.recoilPitch * back * 0.6;
    const dy = this.recoilYaw * back * 0.6;
    this.pitch = clamp(this.pitch - dp, PITCH_MIN, PITCH_MAX);
    this.yaw -= dy;
    this.recoilPitch -= this.recoilPitch * back;
    this.recoilYaw -= this.recoilYaw * back;
  }

  /** Coloca la cámara para este frame. `physics` puede ser null (menús sin nivel). */
  update(f: CameraFrameInput, physics: PhysicsWorld | null): void {
    const dt = f.dt;
    this.time += dt;
    this.recover(dt);
    this.aimK = damp(this.aimK, f.aiming ? 1 : 0, 14, dt);
    this.shoulderCur = damp(this.shoulderCur, this.shoulderSide, 10, dt);
    this.pivotH = damp(this.pivotH, f.posture === 'crouch' ? PIVOT_CROUCH : PIVOT_STAND, 12, dt);

    _head.set(f.feet.x, f.feet.y + this.pivotH, f.feet.z);
    this.pivot.copy(_head);
    const cy = Math.cos(this.yaw);
    const sy = Math.sin(this.yaw);
    const cp = Math.cos(this.pitch);
    const sp = Math.sin(this.pitch);
    _right.set(cy, 0, -sy);
    _fwd.set(-sy * cp, sp, -cy * cp);
    this.forward.copy(_fwd);

    // 1) Hombro (lateral + algo arriba).
    const side = (SHOULDER_OFFSET + (SHOULDER_OFFSET_AIM - SHOULDER_OFFSET) * this.aimK) * this.shoulderCur;
    _dir.copy(_right).multiplyScalar(Math.sign(side) || 1);
    let lateral = Math.abs(side);
    if (physics && lateral > 1e-3) {
      const free = physics.sphereCast(_head, _dir, lateral, CAM_RADIUS * 0.8, QueryGroups.STATIC);
      lateral = Math.max(0, free - MARGIN);
    }
    _shoulder.copy(_head).addScaledVector(_dir, lateral);
    _shoulder.y += UP_OFFSET;

    // 2) Hacia atrás desde el hombro.
    const sprintK = f.sprinting ? 1 : 0;
    let want = DIST_NORMAL + (DIST_SPRINT - DIST_NORMAL) * sprintK;
    want += (DIST_AIM - want) * this.aimK;
    let target = want;
    _dir.copy(_fwd).multiplyScalar(-1);
    if (physics) {
      const free = physics.sphereCast(_shoulder, _dir, want, CAM_RADIUS, QueryGroups.STATIC);
      target = Math.max(MIN_DIST, free - MARGIN);
    }
    // Acercarse al instante (nunca atraviesa), alejarse suave.
    this.dist = target < this.dist ? target : damp(this.dist, target, 6, dt);
    _desired.copy(_shoulder).addScaledVector(_dir, this.dist);

    // 3) Línea directa cabeza → cámara (garantiza que el jugador nunca queda tapado).
    if (physics) {
      _dir.subVectors(_desired, _head);
      const len = _dir.length();
      if (len > 1e-4) {
        _dir.multiplyScalar(1 / len);
        const free = physics.sphereCast(_head, _dir, len, CAM_RADIUS, QueryGroups.STATIC);
        if (free < len) _desired.copy(_head).addScaledVector(_dir, Math.max(MIN_DIST * 0.5, free - MARGIN));
      }
    }
    this.position.copy(_desired);
    this.distanceToHead = this.position.distanceTo(_head);

    // Sacudida por trauma (escalada por ajuste de accesibilidad).
    this.trauma = Math.max(0, this.trauma - dt * 1.6);
    const shake = this.trauma * this.trauma * this.settings.shake;
    let shakeP = 0;
    let shakeY = 0;
    if (shake > 1e-4) {
      shakeP = (this.rng.next() * 2 - 1) * 0.035 * shake;
      shakeY = (this.rng.next() * 2 - 1) * 0.035 * shake;
    }

    const cam = this.camera;
    cam.position.copy(this.position);
    cam.rotation.set(this.pitch + shakeP, this.yaw + shakeY, 0, 'YXZ');
    const baseFov = this.settings.fov;
    let fovTarget = baseFov + 6 * sprintK;
    fovTarget += (baseFov * AIM_FOV_FACTOR - fovTarget) * this.aimK;
    this.fovCur = damp(this.fovCur, fovTarget, 8, dt);
    if (Math.abs(cam.fov - this.fovCur) > 0.01) {
      cam.fov = this.fovCur;
      cam.updateProjectionMatrix();
    }
  }

  /** Coloca la cámara al instante (teleport/respawn): sin interpolación desde la posición vieja. */
  snap(): void {
    this.dist = MIN_DIST;
  }
}
