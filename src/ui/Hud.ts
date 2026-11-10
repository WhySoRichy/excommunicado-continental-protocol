import { h, keycap, setText, setVisible } from './dom';

export interface PromptSpec {
  key: string;
  text: string;
}

/** Instantánea de datos que el HUD pinta en cada frame (solo escribe en el DOM si algo cambió). */
export interface HudData {
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  weaponName: string;
  mag: number;
  magMax: number;
  reserve: number;
  isGun: boolean;
  slots: Array<{ key: string; name: string; active: boolean }>;
  reload: number;
  perfect: [number, number] | null;
  spreadPx: number;
  blocked: boolean;
  aimOverEnemy: boolean;
  aimOverCivilian: boolean;
  hitKind: 'none' | 'body' | 'head' | 'kill' | 'armor';
  hitT: number;
  /** Ángulos (rad, 0 = delante, + izquierda) de los indicadores de daño y su intensidad 0..1. */
  damage: Array<{ angle: number; k: number }>;
  multiplier: number;
  rankName: string;
  gauge: number;
  score: number;
  feed: Array<{ text: string; points: number; t: number }>;
  focus: number;
  focusActive: boolean;
  focusReady: boolean;
  focusKey: string;
}

/**
 * HUD de juego (DOM). Siempre legible (texto grande, contraste, sin tapar el centro).
 */
export class Hud {
  readonly root: HTMLDivElement;
  private readonly crosshair: HTMLDivElement;
  private readonly hitmark: HTMLDivElement;
  private readonly prompt: HTMLDivElement;
  private readonly promptKey: HTMLElement;
  private readonly promptText: HTMLSpanElement;
  private readonly zone: HTMLDivElement;
  private readonly objective: HTMLDivElement;
  private readonly beacon: HTMLDivElement;
  private readonly beaconDist: HTMLSpanElement;
  private readonly beaconArrow: HTMLDivElement;
  private readonly beaconArrowDist: HTMLSpanElement;
  private readonly markers: HTMLDivElement;
  private readonly hints: HTMLDivElement;
  private hintsEnabled = true;
  private readonly vitals: HTMLDivElement;
  private readonly armorBar: HTMLDivElement;
  private readonly healthBar: HTMLDivElement;
  private readonly vitalsText: HTMLDivElement;
  private readonly weaponPanel: HTMLDivElement;
  private readonly weaponName: HTMLDivElement;
  private readonly ammoMag: HTMLSpanElement;
  private readonly ammoRes: HTMLSpanElement;
  private readonly slots: HTMLDivElement;
  private readonly reloadBar: HTMLDivElement;
  private readonly reloadFill: HTMLDivElement;
  private readonly reloadWindow: HTMLDivElement;
  private readonly reloadLabel: HTMLDivElement;
  private readonly dmgRing: HTMLDivElement;
  private readonly dmgArcs: HTMLDivElement[] = [];
  private readonly style: HTMLDivElement;
  private readonly styleMult: HTMLDivElement;
  private readonly styleRank: HTMLDivElement;
  private readonly styleGauge: HTMLDivElement;
  private readonly styleScore: HTMLDivElement;
  private readonly feed: HTMLDivElement;
  private readonly focusBox: HTMLDivElement;
  private readonly focusFill: HTMLDivElement;
  private readonly focusLabel: HTMLDivElement;
  private readonly vignette: HTMLDivElement;
  private readonly death: HTMLDivElement;
  private readonly deathCause: HTMLParagraphElement;
  private readonly deathHint: HTMLParagraphElement;
  private readonly toast: HTMLDivElement;
  private toastT = 0;
  private lastPrompt = '';
  private cache = new Map<string, string>();
  private combatVisible = true;

  constructor(uiRoot: HTMLElement) {
    this.root = h('div', { id: 'hud', ariaLabel: 'HUD' });
    this.crosshair = h('div', { class: 'crosshair', ariaLabel: 'Mira' }, [h('i', { class: 'ch ch-t' }), h('i', { class: 'ch ch-b' }), h('i', { class: 'ch ch-l' }), h('i', { class: 'ch ch-r' }), h('i', { class: 'ch-dot' })]);
    this.hitmark = h('div', { class: 'hitmark' }, [h('i'), h('i'), h('i'), h('i')]);
    this.promptKey = keycap('E');
    this.promptText = h('span', { class: 'prompt-text' });
    this.prompt = h('div', { class: 'prompt', role: 'status' }, [this.promptKey, this.promptText]);
    this.prompt.hidden = true;
    this.zone = h('div', { class: 'zone-label' });
    this.objective = h('div', { class: 'objective', role: 'status', ariaLabel: 'Objetivo actual' });
    this.objective.hidden = true;
    this.beaconDist = h('span', { class: 'beacon-dist' });
    this.beacon = h('div', { class: 'beacon', ariaLabel: 'Baliza del objetivo' }, [h('i', { class: 'beacon-diamond' }), this.beaconDist]);
    this.beacon.hidden = true;
    this.beaconArrowDist = h('span', { class: 'beacon-dist' });
    this.beaconArrow = h('div', { class: 'beacon-arrow' }, [h('i', { class: 'beacon-tri' }), this.beaconArrowDist]);
    this.beaconArrow.hidden = true;
    this.markers = h('div', { class: 'markers', ariaLabel: 'Marcadores de sangre' });
    this.markers.hidden = true;
    this.hints = h('div', { class: 'hints' });

    this.armorBar = h('div', { class: 'bar-fill armor' });
    this.healthBar = h('div', { class: 'bar-fill health' });
    this.vitalsText = h('div', { class: 'vitals-text' });
    this.vitals = h('div', { class: 'vitals', ariaLabel: 'Integridad del traje y salud' }, [
      h('div', { class: 'vitals-label', text: 'INTEGRIDAD' }),
      h('div', { class: 'bar' }, [this.armorBar]),
      h('div', { class: 'vitals-label', text: 'SALUD' }),
      h('div', { class: 'bar' }, [this.healthBar]),
      this.vitalsText,
    ]);

    this.weaponName = h('div', { class: 'weapon-name' });
    this.ammoMag = h('span', { class: 'ammo-mag' });
    this.ammoRes = h('span', { class: 'ammo-res' });
    this.slots = h('div', { class: 'slots' });
    this.weaponPanel = h('div', { class: 'weapon-panel', ariaLabel: 'Arma y munición' }, [this.weaponName, h('div', { class: 'ammo' }, [this.ammoMag, this.ammoRes]), this.slots]);

    this.reloadFill = h('div', { class: 'reload-fill' });
    this.reloadWindow = h('div', { class: 'reload-window' });
    this.reloadLabel = h('div', { class: 'reload-label', text: 'R en la zona dorada = recarga perfecta' });
    this.reloadBar = h('div', { class: 'reload' }, [h('div', { class: 'reload-track' }, [this.reloadWindow, this.reloadFill]), this.reloadLabel]);
    this.reloadBar.hidden = true;

    this.dmgRing = h('div', { class: 'dmg-ring' });
    for (let i = 0; i < 6; i++) {
      const a = h('div', { class: 'dmg-arc' });
      this.dmgArcs.push(a);
      this.dmgRing.appendChild(a);
    }

    this.styleMult = h('div', { class: 'style-mult' });
    this.styleRank = h('div', { class: 'style-rank' });
    this.styleGauge = h('div', { class: 'style-gauge-fill' });
    this.styleScore = h('div', { class: 'style-score' });
    this.feed = h('div', { class: 'feed' });
    this.style = h('div', { class: 'style', ariaLabel: 'Medidor de estilo' }, [this.styleMult, this.styleRank, h('div', { class: 'style-gauge' }, [this.styleGauge]), this.styleScore, this.feed]);

    this.focusFill = h('div', { class: 'focus-fill' });
    this.focusLabel = h('div', { class: 'focus-label' });
    this.focusBox = h('div', { class: 'focus', ariaLabel: 'Foco' }, [h('div', { class: 'focus-track' }, [this.focusFill]), this.focusLabel]);

    this.vignette = h('div', { class: 'vignette' });
    this.deathCause = h('p', { class: 'death-cause' });
    this.deathHint = h('p', { class: 'death-hint' });
    this.death = h('div', { class: 'death', role: 'alertdialog', ariaLabel: 'Has caído' }, [h('h2', { text: 'HAS CAÍDO' }), this.deathCause, this.deathHint]);
    this.death.hidden = true;
    this.toast = h('div', { class: 'toast', role: 'status' });
    this.toast.hidden = true;

    this.root.append(this.vignette, this.beacon, this.beaconArrow, this.crosshair, this.hitmark, this.dmgRing, this.prompt, this.zone, this.objective, this.markers, this.hints, this.vitals, this.weaponPanel, this.reloadBar, this.style, this.focusBox, this.toast, this.death);
    this.root.hidden = true;
    uiRoot.appendChild(this.root);
  }

  setVisible(v: boolean): void {
    setVisible(this.root, v);
  }

  /** Muestra/oculta los paneles de combate (en el hub neutral no hacen falta). */
  setCombatVisible(v: boolean): void {
    if (v === this.combatVisible) return;
    this.combatVisible = v;
    for (const el of [this.vitals, this.weaponPanel, this.style, this.focusBox]) el.hidden = !v;
  }

  setZone(text: string): void {
    setText(this.zone, text);
  }

  setCrosshairVisible(v: boolean): void {
    setVisible(this.crosshair, v);
  }

  /** Objetivo actual (arriba, centrado). Vacío = oculto. */
  setObjective(text: string): void {
    setText(this.objective, text);
    setVisible(this.objective, text.length > 0);
    if (!text) this.setBeacon(null);
  }

  /**
   * Baliza del objetivo: marcador en pantalla con distancia si el punto está a la vista;
   * si no, flecha en el borde que apunta hacia él. `null` la oculta.
   */
  setBeacon(b: { x: number; y: number; onScreen: boolean; angle: number; distance: number } | null): void {
    if (!b) {
      setVisible(this.beacon, false);
      setVisible(this.beaconArrow, false);
      return;
    }
    const dist = `${Math.round(b.distance)} m`;
    if (b.onScreen) {
      setVisible(this.beaconArrow, false);
      setVisible(this.beacon, true);
      this.beacon.style.transform = `translate(${Math.round(b.x)}px, ${Math.round(b.y)}px)`;
      setText(this.beaconDist, dist);
    } else {
      setVisible(this.beacon, false);
      setVisible(this.beaconArrow, true);
      this.beaconArrow.style.transform = `translate(${Math.round(b.x)}px, ${Math.round(b.y)}px) rotate(${b.angle.toFixed(1)}deg)`;
      setText(this.beaconArrowDist, dist);
      this.beaconArrowDist.style.transform = `rotate(${(-b.angle).toFixed(1)}deg)`;
    }
  }

  /** Contador de marcadores de sangre (vidas). Vacío = oculto. */
  setMarkers(used: number, total: number): void {
    if (total <= 0) {
      setVisible(this.markers, false);
      return;
    }
    setVisible(this.markers, true);
    const key = `${used}/${total}`;
    if (this.markersKey === key) return;
    this.markersKey = key;
    this.markers.replaceChildren(h('span', { class: 'markers-label', text: 'MARCADORES' }), ...Array.from({ length: total }, (_, i) => h('i', { class: `marker${i < total - used ? ' on' : ''}` })));
  }

  private markersKey = '';

  /** Ajuste de accesibilidad: ocultar la columna de pistas de teclas. */
  setHintsEnabled(on: boolean): void {
    this.hintsEnabled = on;
    this.hints.hidden = !on || this.hints.childElementCount === 0;
  }

  setHints(lines: PromptSpec[]): void {
    this.hints.replaceChildren(...lines.map((l) => h('div', { class: 'hint' }, [keycap(l.key), h('span', { text: l.text })])));
    this.hints.hidden = !this.hintsEnabled || lines.length === 0;
  }

  setPrompt(p: PromptSpec | null): void {
    const key = p ? `${p.key}|${p.text}` : '';
    if (key === this.lastPrompt) return;
    this.lastPrompt = key;
    if (!p) {
      this.prompt.hidden = true;
      return;
    }
    setText(this.promptKey, p.key);
    setText(this.promptText, p.text);
    this.prompt.hidden = false;
  }

  showToast(text: string, seconds = 2.5): void {
    setText(this.toast, text);
    this.toast.hidden = false;
    this.toastT = seconds;
  }

  showDeath(cause: string, hint: string): void {
    setText(this.deathCause, cause);
    setText(this.deathHint, hint);
    this.death.hidden = false;
  }

  hideDeath(): void {
    this.death.hidden = true;
  }

  /** Escribe una propiedad CSS solo si cambió (caché por elemento). */
  private set(el: HTMLElement, prop: string, value: string): void {
    let m = this.styleCache.get(el);
    if (!m) {
      m = new Map();
      this.styleCache.set(el, m);
    }
    if (m.get(prop) === value) return;
    m.set(prop, value);
    el.style.setProperty(prop, value);
  }

  private readonly styleCache = new WeakMap<HTMLElement, Map<string, string>>();

  update(d: HudData, dt: number): void {
    // Integridad y salud.
    this.set(this.armorBar, 'width', `${d.maxArmor > 0 ? Math.round((d.armor / d.maxArmor) * 100) : 0}%`);
    this.set(this.healthBar, 'width', `${Math.round((d.health / d.maxHealth) * 100)}%`);
    setText(this.vitalsText, `${Math.ceil(d.armor)} · ${Math.ceil(d.health)}`);
    this.vignette.style.opacity = d.health < 35 ? String(0.25 + (1 - d.health / 35) * 0.45) : '0';

    // Arma.
    setText(this.weaponName, d.weaponName);
    setText(this.ammoMag, d.isGun ? String(d.mag) : '—');
    setText(this.ammoRes, d.isGun ? ` / ${Number.isFinite(d.reserve) ? d.reserve : '∞'}` : '');
    this.ammoMag.classList.toggle('low', d.isGun && d.mag <= Math.max(2, Math.floor(d.magMax * 0.25)));
    const slotsKey = d.slots.map((s) => `${s.key}${s.name}${s.active ? 1 : 0}`).join('|');
    if (this.cache.get('slots') !== slotsKey) {
      this.cache.set('slots', slotsKey);
      this.slots.replaceChildren(...d.slots.map((s) => h('span', { class: `slot${s.active ? ' active' : ''}` }, [keycap(s.key), h('span', { text: s.name })])));
    }

    // Recarga con ventana perfecta.
    const reloading = d.reload >= 0;
    setVisible(this.reloadBar, reloading);
    if (reloading) {
      this.set(this.reloadFill, 'width', `${Math.round(d.reload * 100)}%`);
      if (d.perfect) {
        this.reloadWindow.hidden = false;
        this.set(this.reloadWindow, 'left', `${(d.perfect[0] * 100).toFixed(1)}%`);
        this.set(this.reloadWindow, 'width', `${((d.perfect[1] - d.perfect[0]) * 100).toFixed(1)}%`);
      } else this.reloadWindow.hidden = true;
      setVisible(this.reloadLabel, !!d.perfect);
    }

    // Mira.
    this.set(this.crosshair, '--gap', `${Math.round(d.spreadPx)}px`);
    this.crosshair.classList.toggle('blocked', d.blocked);
    this.crosshair.classList.toggle('enemy', d.aimOverEnemy && !d.blocked);
    this.crosshair.classList.toggle('civilian', d.aimOverCivilian && !d.blocked);
    this.hitmark.className = `hitmark ${d.hitT > 0 ? `on ${d.hitKind}` : ''}`;

    // Indicadores de daño.
    for (let i = 0; i < this.dmgArcs.length; i++) {
      const arc = this.dmgArcs[i]!;
      const e = d.damage[i];
      if (!e || e.k <= 0) {
        if (arc.style.opacity !== '0') arc.style.opacity = '0';
        continue;
      }
      arc.style.opacity = e.k.toFixed(2);
      arc.style.transform = `rotate(${(-e.angle * 180) / Math.PI}deg)`;
    }

    // Estilo.
    setText(this.styleMult, `×${d.multiplier}`);
    setText(this.styleRank, d.rankName.toUpperCase());
    this.set(this.styleGauge, 'width', `${Math.round(Math.min(1, Math.max(0, d.gauge)) * 100)}%`);
    setText(this.styleScore, d.score.toLocaleString('es'));
    this.style.dataset.mult = String(d.multiplier);
    const feedKey = d.feed.map((f) => `${f.text}${f.points}`).join('|');
    if (this.cache.get('feed') !== feedKey) {
      this.cache.set('feed', feedKey);
      this.feed.replaceChildren(...d.feed.map((f) => h('div', { class: 'feed-item' }, [h('span', { text: f.text }), f.points > 0 ? h('b', { text: `+${f.points}` }) : null])));
    }

    // Foco.
    this.set(this.focusFill, 'height', `${Math.round(d.focus)}%`);
    this.focusBox.classList.toggle('ready', d.focusReady && !d.focusActive);
    this.focusBox.classList.toggle('active', d.focusActive);
    setText(this.focusLabel, d.focusActive ? 'FOCO' : d.focusReady ? `${d.focusKey} FOCO` : 'FOCO');

    if (this.toastT > 0) {
      this.toastT -= dt;
      if (this.toastT <= 0) this.toast.hidden = true;
    }
  }
}
