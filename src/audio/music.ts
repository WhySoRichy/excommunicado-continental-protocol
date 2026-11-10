import type { MusicMood } from '../levels/types';

/**
 * Música adaptativa procedural (lógica pura): cada ambiente define tempo, escala,
 * progresión y patrones de 16 pasos. La intensidad (0..1) abre capas: pad → bajo →
 * charles → bombo → arpegio. Sin archivos: todo se sintetiza en `MusicPlayer`.
 */
export type Voice = 'pad' | 'bass' | 'kick' | 'hat' | 'lead';

export interface NoteEvent {
  voice: Voice;
  /** Nota MIDI (pad/bajo/arpegio); 0 en percusión. */
  midi: number;
  /** 0..1 */
  vel: number;
  /** Duración en pasos de semicorchea. */
  steps: number;
}

export interface MoodDef {
  bpm: number;
  /** Nota MIDI raíz. */
  root: number;
  /** Intervalos de la escala (semitonos desde la raíz). */
  scale: readonly number[];
  /** Grados de la progresión (índices de escala), uno por compás. */
  progression: readonly number[];
  /** 16 pasos: grado relativo al acorde (null = silencio). */
  bass: readonly (number | null)[];
  /** 16 pasos: velocidad del charles (0 = nada). */
  hat: readonly number[];
  /** 16 pasos: velocidad del bombo. */
  kick: readonly number[];
  /** Pasos en los que suena el arpegio. */
  lead: readonly number[];
}

const MINOR = [0, 2, 3, 5, 7, 8, 10] as const;
const DORIAN = [0, 2, 3, 5, 7, 9, 10] as const;
const PHRYGIAN = [0, 1, 3, 5, 7, 8, 10] as const;
const _ = null;

export const MOODS: Record<MusicMood, MoodDef> = {
  // Vestíbulo: lounge lento, sin percusión fuerte.
  hub: {
    bpm: 84,
    root: 50,
    scale: DORIAN,
    progression: [0, 3, 5, 4],
    bass: [0, _, _, _, _, _, 4, _, 0, _, _, _, 2, _, _, _],
    hat: [0, 0, 0.3, 0, 0, 0, 0.3, 0, 0, 0, 0.3, 0, 0, 0, 0.3, 0],
    kick: [0.5, 0, 0, 0, 0, 0, 0, 0, 0.4, 0, 0, 0, 0, 0, 0, 0],
    lead: [0, 6, 10, 14],
  },
  practice: {
    bpm: 100,
    root: 45,
    scale: MINOR,
    progression: [0, 0, 5, 6],
    bass: [0, _, _, 0, _, _, 0, _, 0, _, _, 0, _, _, 4, _],
    hat: [0.4, 0, 0.6, 0, 0.4, 0, 0.6, 0, 0.4, 0, 0.6, 0, 0.4, 0, 0.6, 0],
    kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0.6, 0, 0, 0, 0, 0],
    lead: [0, 3, 8, 11],
  },
  // Club: synth de cuatro por cuatro.
  club: {
    bpm: 118,
    root: 45,
    scale: MINOR,
    progression: [0, 5, 2, 6],
    bass: [0, _, 0, _, 0, _, 0, 4, 0, _, 0, _, 0, _, 4, 2],
    hat: [0, 0, 0.7, 0, 0, 0, 0.7, 0.3, 0, 0, 0.7, 0, 0, 0, 0.7, 0.3],
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    lead: [0, 2, 4, 6, 8, 10, 12, 14],
  },
  docks: {
    bpm: 96,
    root: 43,
    scale: PHRYGIAN,
    progression: [0, 1, 0, 6],
    bass: [0, _, _, 0, _, _, 1, _, 0, _, _, 0, _, 6, _, _],
    hat: [0.5, 0, 0.3, 0, 0.5, 0, 0.3, 0, 0.5, 0, 0.3, 0, 0.5, 0, 0.3, 0.3],
    kick: [1, 0, 0, 0.5, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    lead: [0, 5, 10],
  },
  tower: {
    bpm: 110,
    root: 47,
    scale: MINOR,
    progression: [0, 5, 3, 4],
    bass: [0, 0, _, 0, _, 0, _, 0, 0, 0, _, 0, _, 4, _, 4],
    hat: [0.6, 0.3, 0.6, 0.3, 0.6, 0.3, 0.6, 0.3, 0.6, 0.3, 0.6, 0.3, 0.6, 0.3, 0.6, 0.3],
    kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    lead: [0, 3, 6, 9, 12],
  },
  tension: {
    bpm: 112,
    root: 46,
    scale: PHRYGIAN,
    progression: [0, 1, 0, 1],
    bass: [0, _, 0, _, 0, _, 0, _, 0, _, 0, _, 1, _, 1, _],
    hat: [0.5, 0, 0.5, 0.3, 0.5, 0, 0.5, 0.3, 0.5, 0, 0.5, 0.3, 0.5, 0, 0.5, 0.3],
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0.6, 0],
    lead: [0, 4, 8, 12],
  },
  gauntlet: {
    bpm: 128,
    root: 45,
    scale: PHRYGIAN,
    progression: [0, 1, 5, 6],
    bass: [0, 0, 0, _, 0, 0, 1, _, 0, 0, 0, _, 6, _, 5, _],
    hat: [0.7, 0.3, 0.7, 0.3, 0.7, 0.3, 0.7, 0.3, 0.7, 0.3, 0.7, 0.3, 0.7, 0.3, 0.7, 0.3],
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0],
    lead: [0, 2, 3, 6, 8, 10, 11, 14],
  },
};

/** Umbrales de intensidad a partir de los que entra cada capa. */
export const LAYER_FROM: Record<Voice, number> = { pad: 0, bass: 0.2, hat: 0.4, kick: 0.55, lead: 0.8 };
export const STEPS_PER_BAR = 16;

/** Duración de una semicorchea en segundos. */
export function stepSeconds(mood: MusicMood): number {
  return 60 / MOODS[mood].bpm / 4;
}

/** Nota MIDI del grado `degree` de la escala (admite grados > 7: octava arriba). */
export function degreeMidi(m: MoodDef, degree: number): number {
  const n = m.scale.length;
  const oct = Math.floor(degree / n);
  const idx = ((degree % n) + n) % n;
  return m.root + oct * 12 + m.scale[idx]!;
}

export function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Eventos del paso `step` (contador global de semicorcheas) con la intensidad dada.
 * Escribe en `out` (reutilizado) y devuelve cuántos hay.
 */
export function stepEvents(mood: MusicMood, step: number, intensity: number, out: NoteEvent[]): number {
  const m = MOODS[mood];
  const s = ((step % STEPS_PER_BAR) + STEPS_PER_BAR) % STEPS_PER_BAR;
  const bar = Math.floor(step / STEPS_PER_BAR);
  const chord = m.progression[((bar % m.progression.length) + m.progression.length) % m.progression.length]!;
  let n = 0;
  const push = (voice: Voice, midi: number, vel: number, steps: number): void => {
    const e = out[n] ?? (out[n] = { voice, midi, vel, steps });
    e.voice = voice;
    e.midi = midi;
    e.vel = vel;
    e.steps = steps;
    n++;
  };
  // Pad: acorde de tres notas al empezar cada compás.
  if (s === 0) for (const d of [0, 2, 4]) push('pad', degreeMidi(m, chord + d) + 12, 0.5, STEPS_PER_BAR);
  if (intensity >= LAYER_FROM.bass) {
    const b = m.bass[s];
    if (b !== null && b !== undefined) push('bass', degreeMidi(m, chord + b) - 12, 0.6 + 0.3 * intensity, 2);
  }
  if (intensity >= LAYER_FROM.hat && (m.hat[s] ?? 0) > 0) push('hat', 0, m.hat[s]! * (0.5 + 0.5 * intensity), 1);
  if (intensity >= LAYER_FROM.kick && (m.kick[s] ?? 0) > 0) push('kick', 0, m.kick[s]!, 1);
  if (intensity >= LAYER_FROM.lead && m.lead.includes(s)) {
    // Arpegio ascendente sobre el acorde (1-3-5-8).
    const k = m.lead.indexOf(s) % 4;
    push('lead', degreeMidi(m, chord + [0, 2, 4, 7][k]!) + 24, 0.45, 2);
  }
  return n;
}

export interface IntensityInput {
  /** Enemigos en combate / cobertura / flanqueo. */
  fighting: number;
  /** Enemigos buscándote o alerta. */
  searching: number;
  boss: boolean;
  escape: boolean;
  /** Hub en Excomunicado o Gauntlet en oleada. */
  hostile: boolean;
  /** Contrato o campo de práctica (no hub neutral). */
  onMission: boolean;
}

/** Intensidad objetivo de la música (0..1) según lo que pasa en el juego. */
export function musicIntensity(x: IntensityInput): number {
  // Hub neutral: pad y bajo (lounge); en un contrato, algo más de pulso aunque no haya nadie.
  let k = x.onMission ? 0.3 : 0.22;
  if (x.searching > 0) k = Math.max(k, 0.5);
  if (x.fighting > 0) k = Math.max(k, Math.min(0.95, 0.62 + 0.06 * x.fighting));
  if (x.hostile) k = Math.max(k, 0.82);
  // El jefe siempre por encima de cualquier combate (que satura en 0,95).
  if (x.boss) k = Math.max(k, 0.96);
  if (x.escape) k = 1;
  return Math.max(0, Math.min(1, k));
}
