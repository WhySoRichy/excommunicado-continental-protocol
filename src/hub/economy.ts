import type { UpgradeId } from '../combat/weapons';
import type { Profile } from '../core/Save';
import { MISSIONS, type MissionId, type Rank } from '../missions/types';

/** Economía de Monedas Continental (lógica pura). GAME_DESIGN §5.2. */
export interface ShopItem {
  id: UpgradeId;
  name: string;
  desc: string;
  price: number;
  /** Mejora previa necesaria. */
  requires?: UpgradeId;
}

export const SHOP: readonly ShopItem[] = [
  { id: 'extMag', name: 'Cargador extendido', desc: 'Carabina +8 balas, pistola +4.', price: 5 },
  { id: 'suppressor', name: 'Silenciador', desc: 'La pistola solo alerta a 8 m.', price: 6 },
  { id: 'hollowPoint', name: 'Punta hueca', desc: '+15 % de daño con armas de fuego.', price: 7 },
  { id: 'compensator', name: 'Compensador', desc: '−35 % de retroceso.', price: 5 },
  { id: 'suit1', name: 'Traje balístico I', desc: '+20 de integridad del traje.', price: 4 },
  { id: 'suit2', name: 'Traje balístico II', desc: '+20 de integridad (requiere el I).', price: 7, requires: 'suit1' },
  { id: 'suit3', name: 'Traje balístico III', desc: '+20 de integridad (requiere el II).', price: 10, requires: 'suit2' },
  { id: 'tacticalKnife', name: 'Cuchillo táctico', desc: 'Alcance 2,2 m y golpe más rápido.', price: 4 },
  { id: 'shotgun', name: 'Escopeta "Sommelier"', desc: 'Nueva arma primaria (tecla 1 alterna con la carabina).', price: 8 },
  { id: 'extraMarker', name: 'Marcador adicional', desc: '4 marcadores de sangre (vidas) por contrato.', price: 12 },
];

export type BuyCheck = 'ok' | 'owned' | 'poor' | 'locked' | 'unknown';

export function shopItem(id: UpgradeId): ShopItem | undefined {
  return SHOP.find((s) => s.id === id);
}

export function canBuy(p: Profile, id: UpgradeId): BuyCheck {
  const item = shopItem(id);
  if (!item) return 'unknown';
  if (p.upgrades.includes(id)) return 'owned';
  if (item.requires && !p.upgrades.includes(item.requires)) return 'locked';
  if (p.coins < item.price) return 'poor';
  return 'ok';
}

/** Compra una mejora (muta el perfil). Devuelve false si no se puede. */
export function buy(p: Profile, id: UpgradeId): boolean {
  if (canBuy(p, id) !== 'ok') return false;
  const item = shopItem(id);
  if (!item) return false;
  p.coins -= item.price;
  p.upgrades.push(id);
  return true;
}

export const RANK_MULTIPLIER: Record<Rank, number> = { S: 2, A: 1.5, B: 1.25, C: 1, D: 0.75 };
export const FIRST_TIME_BONUS = 3;
/** Multa de la Alta Mesa al ser Excomunicado: se pierde el 30 % de las monedas. */
export const EXCOMMUNICADO_FINE = 0.3;
/** Recompensa del simulacro (solo la primera vez que se completa). */
export const PRACTICE_DRILL_REWARD = 2;

/** Monedas por completar un contrato con un rango. */
export function contractReward(id: MissionId, rank: Rank, firstTime: boolean): number {
  const base = MISSIONS[id].baseReward;
  return Math.round(base * RANK_MULTIPLIER[rank]) + (firstTime ? FIRST_TIME_BONUS : 0);
}

/** Monedas del Gauntlet: 1 por cada 2 oleadas superadas. */
export function gauntletReward(waves: number): number {
  return Math.floor(Math.max(0, waves) / 2);
}

/** Aplica la multa del Excomunicado. Devuelve las monedas perdidas. */
export function applyExcommunicadoFine(p: Profile): number {
  const lost = Math.floor(p.coins * EXCOMMUNICADO_FINE);
  p.coins -= lost;
  p.excommunicados++;
  return lost;
}

export function addCoins(p: Profile, n: number): void {
  p.coins = Math.max(0, Math.min(9999, p.coins + Math.floor(n)));
}
