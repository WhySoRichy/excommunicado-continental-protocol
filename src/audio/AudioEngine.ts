import type { Vec3Like } from '../physics/Physics';

/**
 * Audio 100 % procedural (Web Audio): ningún archivo con copyright, carga instantánea.
 * Buses: maestro → compresor → salida; sfx / música / ui / ambiente con su volumen.
 * Se inicia tras el primer gesto del usuario (política de autoplay).
 */
export interface AudioVolumes {
  master: number;
  sfx: number;
  music: number;
  ui: number;
}

export type ShotSound = 'carbine' | 'pistol' | 'pistolSilenced' | 'shotgun' | 'enemyPistol' | 'enemySmg' | 'enemyRifle' | 'enemyShotgun';

export class AudioEngine {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfxBus!: GainNode;
  musicBus!: GainNode;
  private uiBus!: GainNode;
  ambBus!: GainNode;
  private lowpass!: BiquadFilterNode;
  private noise: AudioBuffer | null = null;
  private volumes: AudioVolumes = { master: 0.8, sfx: 0.9, music: 0.55, ui: 0.7 };
  /** Límite de voces simultáneas por tipo (evita saturar con ráfagas). */
  private voices = 0;
  private readonly maxVoices = 28;
  private muffle = 0;

  get ready(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  /** Llamar desde un gesto del usuario (clic/tecla). Idempotente. */
  init(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const Ctor = window.AudioContext;
    if (!Ctor) return;
    const ctx = new Ctor({ latencyHint: 'interactive' });
    this.ctx = ctx;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 12;
    comp.ratio.value = 4;
    comp.attack.value = 0.004;
    comp.release.value = 0.2;
    this.lowpass = ctx.createBiquadFilter();
    this.lowpass.type = 'lowpass';
    this.lowpass.frequency.value = 20000;
    this.master = ctx.createGain();
    this.master.connect(this.lowpass);
    this.lowpass.connect(comp);
    comp.connect(ctx.destination);
    this.sfxBus = ctx.createGain();
    this.musicBus = ctx.createGain();
    this.uiBus = ctx.createGain();
    this.ambBus = ctx.createGain();
    for (const b of [this.sfxBus, this.musicBus, this.uiBus, this.ambBus]) b.connect(this.master);
    this.noise = makeNoise(ctx, 1.5);
    this.applyVolumes();
  }

  setVolumes(v: Partial<AudioVolumes>): void {
    this.volumes = { ...this.volumes, ...v };
    this.applyVolumes();
  }

  getVolumes(): AudioVolumes {
    return { ...this.volumes };
  }

  private applyVolumes(): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(this.volumes.master, t, 0.02);
    this.sfxBus.gain.setTargetAtTime(this.volumes.sfx, t, 0.02);
    this.musicBus.gain.setTargetAtTime(this.volumes.music * 0.8, t, 0.05);
    this.uiBus.gain.setTargetAtTime(this.volumes.ui, t, 0.02);
    this.ambBus.gain.setTargetAtTime(this.volumes.sfx * 0.6, t, 0.05);
  }

  /** Filtro paso bajo global (Foco, daño fuerte). 0 = limpio, 1 = muy apagado. */
  setMuffle(k: number): void {
    if (!this.ctx) return;
    const m = Math.max(0, Math.min(1, k));
    if (Math.abs(m - this.muffle) < 0.01) return;
    this.muffle = m;
    this.lowpass.frequency.setTargetAtTime(20000 * Math.pow(1 - m * 0.93, 2) + 300, this.ctx.currentTime, 0.05);
  }

  /** Oyente = cámara. */
  setListener(pos: Vec3Like, fwd: Vec3Like): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const l = ctx.listener;
    const t = ctx.currentTime;
    if (l.positionX) {
      l.positionX.setTargetAtTime(pos.x, t, 0.02);
      l.positionY.setTargetAtTime(pos.y, t, 0.02);
      l.positionZ.setTargetAtTime(pos.z, t, 0.02);
      l.forwardX.setTargetAtTime(fwd.x, t, 0.02);
      l.forwardY.setTargetAtTime(fwd.y, t, 0.02);
      l.forwardZ.setTargetAtTime(fwd.z, t, 0.02);
      l.upX.value = 0;
      l.upY.value = 1;
      l.upZ.value = 0;
    }
  }

  /** Salida de una voz: con panner 3D si hay posición. */
  private out(bus: GainNode, pos?: Vec3Like): AudioNode {
    const ctx = this.ctx!;
    if (!pos) return bus;
    const p = ctx.createPanner();
    p.panningModel = 'equalpower';
    p.distanceModel = 'inverse';
    p.refDistance = 3;
    p.rolloffFactor = 1.1;
    p.maxDistance = 120;
    p.positionX.value = pos.x;
    p.positionY.value = pos.y;
    p.positionZ.value = pos.z;
    p.connect(bus);
    return p;
  }

  private voice(): boolean {
    if (!this.ready || this.voices >= this.maxVoices) return false;
    this.voices++;
    return true;
  }

  private release(src: AudioScheduledSourceNode): void {
    src.addEventListener('ended', () => {
      this.voices = Math.max(0, this.voices - 1);
    });
  }

  /** Ráfaga de ruido filtrado con envolvente. */
  private noiseHit(dest: AudioNode, opts: { freq: number; q?: number; type?: BiquadFilterType; gain: number; attack?: number; decay: number; delay?: number }): void {
    const ctx = this.ctx!;
    if (!this.noise || !this.voice()) return;
    const t = ctx.currentTime + (opts.delay ?? 0);
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = 0.9 + Math.random() * 0.2;
    const f = ctx.createBiquadFilter();
    f.type = opts.type ?? 'bandpass';
    f.frequency.value = opts.freq;
    f.Q.value = opts.q ?? 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(opts.gain, t + (opts.attack ?? 0.003));
    g.gain.exponentialRampToValueAtTime(0.0001, t + (opts.attack ?? 0.003) + opts.decay);
    src.connect(f).connect(g).connect(dest);
    src.start(t, Math.random() * 0.8);
    src.stop(t + opts.decay + 0.05);
    this.release(src);
  }

  /** Tono con barrido de frecuencia. */
  private tone(dest: AudioNode, opts: { type?: OscillatorType; f0: number; f1?: number; gain: number; attack?: number; decay: number; delay?: number }): void {
    const ctx = this.ctx!;
    if (!this.voice()) return;
    const t = ctx.currentTime + (opts.delay ?? 0);
    const o = ctx.createOscillator();
    o.type = opts.type ?? 'sine';
    o.frequency.setValueAtTime(opts.f0, t);
    if (opts.f1 !== undefined) o.frequency.exponentialRampToValueAtTime(Math.max(20, opts.f1), t + opts.decay);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(opts.gain, t + (opts.attack ?? 0.004));
    g.gain.exponentialRampToValueAtTime(0.0001, t + (opts.attack ?? 0.004) + opts.decay);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + opts.decay + 0.05);
    this.release(o);
  }

  // ======================= SFX =======================

  shot(kind: ShotSound, pos?: Vec3Like): void {
    if (!this.ready) return;
    const d = this.out(this.sfxBus, pos);
    switch (kind) {
      case 'carbine':
        this.noiseHit(d, { freq: 1800, q: 0.5, gain: 0.55, decay: 0.12 });
        this.tone(d, { type: 'triangle', f0: 160, f1: 45, gain: 0.5, decay: 0.12 });
        break;
      case 'pistol':
        this.noiseHit(d, { freq: 2400, q: 0.6, gain: 0.5, decay: 0.1 });
        this.tone(d, { type: 'triangle', f0: 210, f1: 60, gain: 0.45, decay: 0.1 });
        break;
      case 'pistolSilenced':
        this.noiseHit(d, { freq: 900, q: 1.2, gain: 0.35, decay: 0.07 });
        this.tone(d, { type: 'sine', f0: 320, f1: 120, gain: 0.15, decay: 0.05 });
        break;
      case 'shotgun':
        this.noiseHit(d, { freq: 900, q: 0.4, gain: 0.7, decay: 0.25 });
        this.tone(d, { type: 'triangle', f0: 110, f1: 35, gain: 0.7, decay: 0.22 });
        break;
      case 'enemyPistol':
        this.noiseHit(d, { freq: 2000, q: 0.7, gain: 0.4, decay: 0.09 });
        this.tone(d, { type: 'triangle', f0: 190, f1: 60, gain: 0.3, decay: 0.08 });
        break;
      case 'enemySmg':
        this.noiseHit(d, { freq: 2600, q: 0.8, gain: 0.32, decay: 0.06 });
        break;
      case 'enemyRifle':
        this.noiseHit(d, { freq: 1300, q: 0.5, gain: 0.6, decay: 0.2 });
        this.tone(d, { type: 'sawtooth', f0: 140, f1: 40, gain: 0.35, decay: 0.18 });
        break;
      case 'enemyShotgun':
        this.noiseHit(d, { freq: 800, q: 0.4, gain: 0.6, decay: 0.24 });
        this.tone(d, { type: 'triangle', f0: 100, f1: 35, gain: 0.5, decay: 0.2 });
        break;
    }
  }

  /** Impacto confirmado (hit marker sonoro): cuerpo, cabeza o baja. */
  hit(kind: 'body' | 'head' | 'kill' | 'armor'): void {
    if (!this.ready) return;
    const d = this.uiBus;
    if (kind === 'head') this.tone(d, { type: 'sine', f0: 1800, f1: 1500, gain: 0.25, decay: 0.12 });
    else if (kind === 'kill') {
      this.tone(d, { type: 'sine', f0: 900, gain: 0.22, decay: 0.08 });
      this.tone(d, { type: 'sine', f0: 1350, gain: 0.2, decay: 0.12, delay: 0.06 });
    } else if (kind === 'armor') this.tone(d, { type: 'square', f0: 520, f1: 400, gain: 0.08, decay: 0.05 });
    else this.tone(d, { type: 'triangle', f0: 1100, f1: 900, gain: 0.14, decay: 0.05 });
  }

  reload(phase: 'start' | 'end'): void {
    if (!this.ready) return;
    const d = this.sfxBus;
    if (phase === 'start') this.noiseHit(d, { freq: 3200, q: 4, gain: 0.18, decay: 0.05 });
    else {
      this.noiseHit(d, { freq: 2600, q: 5, gain: 0.22, decay: 0.04 });
      this.noiseHit(d, { freq: 1800, q: 5, gain: 0.2, decay: 0.05, delay: 0.07 });
    }
  }

  perfectReload(): void {
    if (!this.ready) return;
    this.tone(this.uiBus, { type: 'sine', f0: 1320, gain: 0.2, decay: 0.12 });
    this.tone(this.uiBus, { type: 'sine', f0: 1980, gain: 0.16, decay: 0.18, delay: 0.05 });
  }

  jam(): void {
    if (!this.ready) return;
    this.tone(this.uiBus, { type: 'square', f0: 140, f1: 90, gain: 0.12, decay: 0.12 });
  }

  empty(): void {
    if (!this.ready) return;
    this.noiseHit(this.sfxBus, { freq: 4000, q: 6, gain: 0.15, decay: 0.03 });
  }

  /** Aviso de que un enemigo te detectó. */
  alert(pos?: Vec3Like): void {
    if (!this.ready) return;
    const d = this.out(this.sfxBus, pos);
    this.tone(d, { type: 'triangle', f0: 520, f1: 880, gain: 0.18, decay: 0.16 });
  }

  /** Pitido del láser del tirador (más agudo cuanto más cerca del disparo). */
  laserBeep(progress: number, pos?: Vec3Like): void {
    if (!this.ready) return;
    const d = this.out(this.sfxBus, pos);
    this.tone(d, { type: 'square', f0: 700 + progress * 900, gain: 0.07 + progress * 0.08, decay: 0.05 });
  }

  takedown(): void {
    if (!this.ready) return;
    this.tone(this.sfxBus, { type: 'sine', f0: 120, f1: 50, gain: 0.6, decay: 0.2 });
    this.noiseHit(this.sfxBus, { freq: 400, q: 0.7, gain: 0.4, decay: 0.12 });
  }

  knife(): void {
    if (!this.ready) return;
    this.noiseHit(this.sfxBus, { freq: 5000, q: 2, type: 'highpass', gain: 0.18, decay: 0.08 });
  }

  hurt(heavy: boolean): void {
    if (!this.ready) return;
    this.tone(this.sfxBus, { type: 'sine', f0: heavy ? 90 : 140, f1: 50, gain: heavy ? 0.5 : 0.3, decay: 0.18 });
  }

  dodge(): void {
    if (!this.ready) return;
    this.noiseHit(this.sfxBus, { freq: 700, q: 0.6, type: 'lowpass', gain: 0.22, attack: 0.04, decay: 0.2 });
  }

  focus(on: boolean): void {
    if (!this.ready) return;
    this.tone(this.uiBus, { type: 'sine', f0: on ? 300 : 600, f1: on ? 120 : 900, gain: 0.25, decay: 0.35 });
  }

  ui(kind: 'click' | 'hover' | 'coin' | 'error' | 'confirm'): void {
    if (!this.ready) return;
    const d = this.uiBus;
    switch (kind) {
      case 'click':
        this.tone(d, { type: 'triangle', f0: 880, gain: 0.08, decay: 0.04 });
        break;
      case 'hover':
        this.tone(d, { type: 'sine', f0: 1200, gain: 0.03, decay: 0.03 });
        break;
      case 'coin':
        for (const [i, f] of [2093, 3135, 4186].entries()) this.tone(d, { type: 'sine', f0: f, gain: 0.12 / (i + 1), decay: 0.6, delay: i * 0.02 });
        break;
      case 'error':
        this.tone(d, { type: 'square', f0: 220, f1: 160, gain: 0.1, decay: 0.18 });
        break;
      case 'confirm':
        this.tone(d, { type: 'sine', f0: 660, gain: 0.12, decay: 0.08 });
        this.tone(d, { type: 'sine', f0: 990, gain: 0.12, decay: 0.12, delay: 0.07 });
        break;
    }
  }
}

function makeNoise(ctx: AudioContext, seconds: number): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let seed = 22222;
  for (let i = 0; i < len; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    data[i] = (seed / 4294967296) * 2 - 1;
  }
  return buf;
}
