import type { MusicMood } from '../levels/types';
import { midiToHz, type NoteEvent, stepEvents, stepSeconds } from './music';

/** Cuánto se programa por adelantado (s). El bucle de render rellena esta ventana cada frame. */
const LOOKAHEAD = 0.15;
/** Si el reloj se quedó atrás (pestaña oculta), se salta en vez de ponerse al día de golpe. */
const MAX_BEHIND = 0.1;
/** Suavizado de la intensidad (por segundo) para que las capas entren y salgan sin saltos. */
const INTENSITY_RATE = 0.8;
/** Fundido de cambio de ambiente (s). */
const MOOD_FADE = 1.2;
/** Mezcla base de cada voz dentro del bus de música. */
const VOICE_GAIN = { pad: 0.09, bass: 0.16, kick: 0.5, hat: 0.07, lead: 0.06 } as const;

/**
 * Reproductor de la música adaptativa: programa notas con el reloj de Web Audio
 * (sin temporizadores) a partir de los patrones puros de `music.ts`.
 */
export class MusicPlayer {
  private mood: MusicMood | null = null;
  private target = 0;
  private intensity = 0;
  private step = 0;
  private nextTime = 0;
  private out: GainNode | null = null;
  private readonly events: NoteEvent[] = [];
  private lastUpdate = 0;

  constructor(
    private readonly ctx: AudioContext,
    private readonly bus: GainNode,
    private readonly noise: AudioBuffer,
  ) {}

  get currentMood(): MusicMood | null {
    return this.mood;
  }

  get currentIntensity(): number {
    return this.intensity;
  }

  /** Cambia de ambiente con fundido (null = silencio). */
  setMood(mood: MusicMood | null): void {
    if (mood === this.mood) return;
    const t = this.ctx.currentTime;
    if (this.out) {
      const old = this.out;
      old.gain.setTargetAtTime(0.0001, t, MOOD_FADE / 4);
      // El nodo viejo se desconecta cuando ya no suena (las notas pendientes terminan solas).
      const killAt = t + MOOD_FADE * 2;
      const src = this.ctx.createConstantSource();
      // Fuente muda (offset 0): solo sirve de reloj para desconectar al terminar el fundido.
      src.offset.value = 0;
      src.connect(old);
      src.start(t);
      src.stop(killAt);
      src.addEventListener('ended', () => old.disconnect());
    }
    this.mood = mood;
    this.out = null;
    if (!mood) return;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(1, t + MOOD_FADE);
    g.connect(this.bus);
    this.out = g;
    this.step = 0;
    this.nextTime = t + 0.05;
  }

  /** Intensidad objetivo 0..1 (se suaviza en `update`). */
  setIntensity(k: number): void {
    this.target = Math.max(0, Math.min(1, k));
  }

  /** Llamar cada frame de render. */
  update(): void {
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const dt = Math.min(0.25, Math.max(0, now - this.lastUpdate));
    this.lastUpdate = now;
    const d = this.target - this.intensity;
    this.intensity += Math.sign(d) * Math.min(Math.abs(d), INTENSITY_RATE * dt);
    const mood = this.mood;
    const out = this.out;
    if (!mood || !out) return;
    if (this.nextTime < now - MAX_BEHIND) this.nextTime = now + 0.02;
    const stepDur = stepSeconds(mood);
    while (this.nextTime < now + LOOKAHEAD) {
      const n = stepEvents(mood, this.step, this.intensity, this.events);
      for (let i = 0; i < n; i++) this.play(this.events[i]!, this.nextTime, stepDur, out);
      this.step++;
      this.nextTime += stepDur;
    }
  }

  private play(e: NoteEvent, t: number, stepDur: number, out: GainNode): void {
    const ctx = this.ctx;
    const dur = e.steps * stepDur;
    const g = ctx.createGain();
    const peak = VOICE_GAIN[e.voice] * e.vel;
    g.connect(out);
    switch (e.voice) {
      case 'pad': {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = midiToHz(e.midi);
        o.detune.value = (e.midi % 3) * 4 - 4;
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.value = 700 + 1400 * this.intensity;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(peak, t + dur * 0.25);
        g.gain.setTargetAtTime(0.0001, t + dur * 0.8, dur * 0.12);
        o.connect(f).connect(g);
        o.start(t);
        o.stop(t + dur * 1.3);
        break;
      }
      case 'bass': {
        const o = ctx.createOscillator();
        o.type = 'square';
        o.frequency.value = midiToHz(e.midi);
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.value = 420;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(peak, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(f).connect(g);
        o.start(t);
        o.stop(t + dur + 0.02);
        break;
      }
      case 'kick': {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(130, t);
        o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
        g.gain.setValueAtTime(peak, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        o.connect(g);
        o.start(t);
        o.stop(t + 0.25);
        break;
      }
      case 'hat': {
        const src = ctx.createBufferSource();
        src.buffer = this.noise;
        const f = ctx.createBiquadFilter();
        f.type = 'highpass';
        f.frequency.value = 7000;
        g.gain.setValueAtTime(peak, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        src.connect(f).connect(g);
        src.start(t, (e.midi + this.step * 0.37) % 1);
        src.stop(t + 0.07);
        break;
      }
      case 'lead': {
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = midiToHz(e.midi);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(peak, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 1.5);
        o.connect(g);
        o.start(t);
        o.stop(t + dur * 1.6);
        break;
      }
    }
  }
}
