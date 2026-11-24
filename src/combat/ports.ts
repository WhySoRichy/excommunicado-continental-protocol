import type { Vec3Like } from '../physics/Physics';

/**
 * Puertos del combate: lo único que la simulación necesita de la vista. Combate y enemigos avisan a través de estas
 * interfaces y nunca importan el motor de audio, los efectos ni la cámara. Las implementan `AudioEngine`, `Vfx` y
 * `CameraRig`; sin pantalla (un servidor, una prueba) basta un objeto que no haga nada, y en red, uno que registre los
 * avisos para enviarlos. Ver docs/ESCALABILIDAD.md.
 */

/** Sonido de cada arma (jugador y enemigos). */
export type ShotSound = 'carbine' | 'pistol' | 'pistolSilenced' | 'revolver' | 'dmr' | 'shotgun' | 'enemyPistol' | 'enemySmg' | 'enemyRifle' | 'enemyShotgun';

/** Sonido de una granada: quitar la anilla, lanzarla, rebotar y estallar. */
export type GrenadeSound = 'pin' | 'throw' | 'bounce' | 'burst';

/** Tipo de impacto de una bala: chispa en superficies, sangre en personajes, polvo en el suelo. */
export type ImpactKind = 'spark' | 'blood' | 'dust';

export interface CombatAudio {
  shot(kind: ShotSound, pos?: Vec3Like): void;
  hit(kind: 'body' | 'head' | 'kill' | 'armor'): void;
  reload(phase: 'start' | 'end'): void;
  perfectReload(): void;
  jam(): void;
  empty(): void;
  knife(): void;
  takedown(): void;
  hurt(heavy: boolean): void;
  dodge(): void;
  focus(on: boolean): void;
  ui(kind: 'click' | 'coin' | 'error' | 'confirm'): void;
  alert(pos?: Vec3Like): void;
  laserBeep(progress: number, pos?: Vec3Like): void;
  grenade(kind: GrenadeSound, pos?: Vec3Like): void;
}

export interface CombatVfx {
  impact(point: Vec3Like, normal: Vec3Like, kind: ImpactKind, count?: number): void;
  tracer(from: Vec3Like, to: Vec3Like, color: number, width?: number): void;
  muzzle(pos: Vec3Like, dir: Vec3Like, player: boolean): void;
  decal(point: Vec3Like, normal: Vec3Like): void;
  casing(pos: Vec3Like, dir: Vec3Like, floorY?: number): void;
  /** Estallido de una aturdidora: destello, chispas y humo. */
  burst(pos: Vec3Like): void;
}

/**
 * La respuesta de la cámara del jugador al disparo y a los golpes (retroceso y sacudida). Hacia dónde apunta no sale de
 * aquí: llega en su intención (`CombatIntent.aimFrom` y `aimDir`).
 */
export interface CombatCamera {
  kick(pitchRad: number, yawRad: number): void;
  addTrauma(v: number): void;
}

/** Cámara que no reacciona: para simular sin pantalla. */
export const STILL_CAMERA: CombatCamera = { kick() {}, addTrauma() {} };

/** Puertos que no hacen nada: para simular sin pantalla. */
export const SILENT_AUDIO: CombatAudio = {
  shot() {},
  hit() {},
  reload() {},
  perfectReload() {},
  jam() {},
  empty() {},
  knife() {},
  takedown() {},
  hurt() {},
  dodge() {},
  focus() {},
  ui() {},
  alert() {},
  laserBeep() {},
  grenade() {},
};

export const NO_VFX: CombatVfx = {
  impact() {},
  tracer() {},
  muzzle() {},
  decal() {},
  casing() {},
  burst() {},
};
