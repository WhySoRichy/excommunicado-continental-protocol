import { ENEMY_TYPES } from '../entities/ai/enemyTypes';
import { CIVILIAN_COLOR } from '../entities/Civilian';
import type { EnemyType } from '../levels/types';
import { h } from './dom';

/** Lo que muestra la Intel (mantener Tab): contrato, objetivo, reglas y leyenda de enemigos. */
export interface IntelView {
  title: string;
  place: string;
  objective: string;
  markers: { used: number; total: number } | null;
  /** Reglas o avisos del contrato (una frase cada una). */
  notes: string[];
  enemies: EnemyType[];
  civilians: boolean;
  /** Enemigos vivos ahora mismo (null = no aplica). */
  alive: number | null;
}

const ORDER: readonly EnemyType[] = ['thug', 'escort', 'marksman', 'heavy', 'boss'];
const hex = (c: number): string => `#${c.toString(16).padStart(6, '0')}`;

/** Fila de la leyenda: glifo con su color (nunca solo color) + nombre + cómo enfrentarlo. */
function legendRow(glyph: string, color: number, name: string, desc: string): HTMLElement {
  return h('li', { class: 'intel-enemy' }, [
    h('span', { class: 'intel-glyph', text: glyph, style: { color: hex(color), borderColor: hex(color) } }),
    h('span', { class: 'intel-name', text: name }),
    h('span', { class: 'intel-desc', text: desc }),
  ]);
}

export function buildIntel(v: IntelView): HTMLElement {
  const legend: HTMLElement[] = [];
  for (const t of ORDER) {
    if (!v.enemies.includes(t)) continue;
    const d = ENEMY_TYPES[t];
    legend.push(legendRow(d.glyph, d.color, d.label, d.description));
  }
  if (v.civilians) legend.push(legendRow('✚', CIVILIAN_COLOR, 'Civil', 'No dispares: herirlos baja la nota y matar a uno limita el rango a C.'));
  const facts: string[] = [];
  if (v.markers) facts.push(`Marcadores ${v.markers.total - v.markers.used}/${v.markers.total}`);
  if (v.alive !== null) facts.push(`Enemigos a la vista ${v.alive}`);
  return h('section', { class: 'intel', role: 'dialog', ariaLabel: 'Intel' }, [
    h('div', { class: 'intel-kicker', text: 'INTEL' }),
    h('h2', { class: 'intel-title', text: v.title.toUpperCase() }),
    h('div', { class: 'intel-place', text: v.place }),
    v.objective ? h('p', { class: 'intel-objective' }, [h('b', { text: 'Objetivo: ' }), v.objective]) : null,
    facts.length ? h('div', { class: 'intel-facts', text: facts.join(' · ') }) : null,
    v.notes.length ? h('ul', { class: 'intel-notes' }, v.notes.map((n) => h('li', { text: n }))) : null,
    legend.length ? h('div', { class: 'intel-sub', text: 'Leyenda' }) : null,
    legend.length ? h('ul', { class: 'intel-legend' }, legend) : null,
  ]);
}
