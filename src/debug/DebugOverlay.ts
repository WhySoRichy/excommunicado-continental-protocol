import { BufferAttribute, BufferGeometry, LineBasicMaterial, LineSegments, type Scene } from 'three';
import type { PhysicsWorld } from '../physics/Physics';

interface DebugCommand {
  id: string;
  label: string;
  hotkey?: string;
  run: () => void;
  isOn?: () => boolean;
  button: HTMLButtonElement;
}

/**
 * Overlay de depuración (F3): métricas en texto (refresco a 4 Hz para no
 * costar nada) y comandos con botón + tecla rápida (solo con el overlay abierto).
 */
export class DebugOverlay {
  visible = false;
  private readonly el: HTMLDivElement;
  private readonly text: HTMLPreElement;
  private readonly cmds: HTMLDivElement;
  private readonly commands: DebugCommand[] = [];
  private acc = 1;

  constructor(parent: HTMLElement) {
    this.el = document.createElement('div');
    this.el.id = 'debug-overlay';
    this.el.setAttribute('role', 'region');
    this.el.setAttribute('aria-label', 'Overlay de depuración');
    this.el.hidden = true;
    this.text = document.createElement('pre');
    this.text.id = 'debug-text';
    this.cmds = document.createElement('div');
    this.cmds.className = 'debug-cmds';
    const title = document.createElement('div');
    title.className = 'debug-title';
    title.textContent = 'DEBUG · F3';
    this.el.append(title, this.text, this.cmds);
    parent.appendChild(this.el);
  }

  setVisible(v: boolean): void {
    this.visible = v;
    this.el.hidden = !v;
    this.acc = 1;
  }

  toggle(): void {
    this.setVisible(!this.visible);
  }

  addCommand(id: string, label: string, run: () => void, opts: { hotkey?: string; isOn?: () => boolean } = {}): void {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'debug-btn';
    button.dataset.cmd = id;
    button.textContent = opts.hotkey ? `${label} [${opts.hotkey.replace('Key', '').replace('Digit', '')}]` : label;
    const cmd: DebugCommand = { id, label, run, button, hotkey: opts.hotkey, isOn: opts.isOn };
    button.addEventListener('click', (e) => {
      e.preventDefault();
      cmd.run();
      this.refreshButtons();
    });
    this.commands.push(cmd);
    this.cmds.appendChild(button);
  }

  /** Ejecuta un comando por id (lo usa la API de QA). */
  run(id: string): boolean {
    const c = this.commands.find((x) => x.id === id);
    if (!c) return false;
    c.run();
    this.refreshButtons();
    return true;
  }

  handleHotkey(code: string): boolean {
    if (!this.visible) return false;
    const c = this.commands.find((x) => x.hotkey === code);
    if (!c) return false;
    c.run();
    this.refreshButtons();
    return true;
  }

  private refreshButtons(): void {
    for (const c of this.commands) {
      if (c.isOn) c.button.classList.toggle('on', c.isOn());
    }
  }

  update(dt: number, provider: () => string): void {
    if (!this.visible) return;
    this.acc += dt;
    if (this.acc < 0.25) return;
    this.acc = 0;
    this.text.textContent = provider();
    this.refreshButtons();
  }

  get textContent(): string {
    return this.text.textContent ?? '';
  }
}

/** Wireframe de todos los colliders de Rapier (verifica R4 a simple vista). */
export class CollisionDebugView {
  readonly lines: LineSegments;
  private readonly geo = new BufferGeometry();
  enabled = false;

  constructor(private readonly scene: Scene) {
    const mat = new LineBasicMaterial({ vertexColors: true, depthTest: false, transparent: true, opacity: 0.85 });
    this.lines = new LineSegments(this.geo, mat);
    this.lines.renderOrder = 999;
    this.lines.frustumCulled = false;
    this.lines.visible = false;
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    this.lines.visible = on;
    if (on && !this.lines.parent) this.scene.add(this.lines);
    if (!on && this.lines.parent) this.scene.remove(this.lines);
  }

  refresh(physics: PhysicsWorld): void {
    if (!this.enabled) return;
    const { vertices, colors } = physics.debugLines();
    this.geo.setAttribute('position', new BufferAttribute(vertices, 3));
    this.geo.setAttribute('color', new BufferAttribute(colors, 4));
    this.geo.computeBoundingSphere();
  }
}
