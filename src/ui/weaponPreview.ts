import {
  Box3,
  type BufferGeometry,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  type MeshStandardMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { GearId } from '../combat/weapons';
import type { WeaponModel } from '../entities/rig/types';
import { gearGeometry, weaponGeometry } from '../entities/rig/weapons';
import { createWeaponMaterial } from '../render/weaponMaterial';

const _box = new Box3();
const _center = new Vector3();
const _size = new Vector3();

/**
 * Vista previa de un arma en la armería: un renderer pequeño y propio (con su luz de estudio y su entorno) que la hace
 * girar despacio, de perfil. Se crea al abrir la armería y se libera al cerrarla; si el navegador no da otro contexto
 * WebGL, no hay vista previa y la armería funciona igual.
 */
export class WeaponPreview {
  readonly canvas: HTMLCanvasElement;
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(26, 2, 0.01, 10);
  private readonly material: MeshStandardMaterial;
  private readonly disposeEnv: () => void;
  private mesh: Mesh | null = null;
  private geometry: BufferGeometry | null = null;
  private model: WeaponModel | GearId = 'none';
  private raf = 0;
  private start = performance.now();

  /** Lanza si no hay WebGL: quien la crea lo comprueba con un try. */
  constructor(width: number, height: number) {
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    const r = this.renderer;
    r.outputColorSpace = SRGBColorSpace;
    r.toneMapping = NeutralToneMapping;
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    // El tamaño en pantalla lo pone la hoja de estilos: con el suyo en línea, se salía de su hueco.
    r.setSize(width, height, false);
    this.canvas = r.domElement;
    this.canvas.className = 'weapon-preview';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    const pmrem = new PMREMGenerator(r);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04);
    room.dispose();
    pmrem.dispose();
    this.disposeEnv = () => env.dispose();
    this.material = createWeaponMaterial(env.texture, 1);
    const key = new DirectionalLight(0xfff1de, 2.2);
    key.position.set(1.5, 2, 2.5);
    const rim = new DirectionalLight(0x9fc4ff, 1.4);
    rim.position.set(-2, 1, -2);
    this.scene.add(key, rim, new HemisphereLight(0xdfe7ff, 0x1a1c22, 0.6));
  }

  /** Muestra un arma o un equipo (`accent`: el color de sus detalles). */
  show(model: WeaponModel | GearId, accent: number): void {
    if (model === this.model) return;
    this.model = model;
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.geometry?.dispose();
      this.mesh = null;
      this.geometry = null;
    }
    if (model === 'none') return;
    const g = model === 'stun' ? gearGeometry(model, accent) : weaponGeometry(model, accent);
    g.computeBoundingBox();
    _box.copy(g.boundingBox!);
    _box.getCenter(_center);
    _box.getSize(_size);
    g.translate(-_center.x, -_center.y, -_center.z);
    this.geometry = g;
    this.mesh = new Mesh(g, this.material);
    this.scene.add(this.mesh);
    // Que quepa entera: la distancia según su largo (Z) y su alto, con algo de margen.
    const fit = Math.max(_size.z / this.camera.aspect, _size.y) * 0.62;
    const dist = fit / Math.tan((this.camera.fov * Math.PI) / 360);
    this.camera.position.set(dist, dist * 0.12, 0);
    this.camera.lookAt(0, 0, 0);
    this.start = performance.now();
  }

  /** Empieza a girar y dibujar (hasta `stop`). */
  run(): void {
    if (this.raf) return;
    const frame = (): void => {
      this.raf = requestAnimationFrame(frame);
      const t = (performance.now() - this.start) / 1000;
      // De perfil, balanceándose: así se ven sus dos lados sin que deje de leerse la silueta.
      if (this.mesh) this.mesh.rotation.y = Math.sin(t * 0.7) * 0.55;
      this.renderer.render(this.scene, this.camera);
    };
    frame();
  }

  stop(): void {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  dispose(): void {
    this.stop();
    this.geometry?.dispose();
    this.material.dispose();
    this.disposeEnv();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
