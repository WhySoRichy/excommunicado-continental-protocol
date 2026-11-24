import { GEAR, type WeaponId, type WeaponSlot, WEAPONS } from '../combat/weapons';
import type { CoverSpot } from '../entities/coverSensor';
import type { Vec3Like } from '../physics/Physics';
import type { Action } from '../core/actions';
import { wrapAngle } from '../core/math';
import { HUB_TEXT } from '../hub/dialogue';
import type { EnemyType, InteractableDef, LevelId } from '../levels/types';
import type { MissionDirector } from '../missions/MissionDirector';
import { MISSIONS } from '../missions/types';
import type { HudData, PromptSpec } from '../ui/Hud';
import type { IntelView } from '../ui/Intel';
import type { LevelSession } from './LevelSession';

/**
 * Traduce el estado del juego a lo que muestran el HUD, el aviso contextual y la Intel. No toca el DOM:
 * `Game` reúne lo que hace falta de la cámara y la entrada y pasa el resultado a `Hud`.
 */

/** La tecla de cada hueco del equipo. */
const SLOT_ACTIONS: Record<WeaponSlot, Action> = { primary: 'weapon1', secondary: 'weapon2', melee: 'weapon3' };
/** Nombre corto de cada arma en el HUD. */
const SLOT_NAMES: Record<WeaponId, string> = {
  carbine: 'Carabina',
  shotgun: 'Escopeta',
  dmr: 'Rifle',
  pistol: 'Pistola',
  revolver: 'Revólver',
  knife: 'Cuchillo',
};

/** Lo que el HUD necesita de la vista: se reutiliza el mismo objeto cada frame. */
export interface HudView {
  /** Orientación de la cámara (rad). */
  yaw: number;
  /** Campo de visión vertical de la cámara (grados) y alto del viewport (px), para el spread en pantalla. */
  fovDeg: number;
  viewportHeight: number;
  /** Etiqueta de la tecla de una acción ("E", "Clic izq.", "RT"). */
  label: (a: Action) => string;
}

/** Rellena los datos del HUD sin asignar memoria (salvo si cambia el número de armas). */
export function fillHudData(d: HudData, s: LevelSession, v: HudView): void {
  const c = s.combat;
  const w = c.weapon;
  d.health = c.vitals.health;
  d.maxHealth = c.vitals.maxHealth;
  d.armor = c.vitals.armor;
  d.maxArmor = c.vitals.maxArmor;
  d.weaponName = w.def.name;
  d.isGun = w.isGun;
  d.mag = w.mag;
  d.magMax = w.def.mag;
  d.reserve = w.reserve;
  if (d.slots.length !== c.loadout.length) d.slots = c.loadout.map(() => ({ key: '', name: '', active: false }));
  for (let i = 0; i < c.loadout.length; i++) {
    const id = c.loadout[i]!;
    const slot = d.slots[i]!;
    slot.key = v.label(SLOT_ACTIONS[WEAPONS[id].slot]);
    slot.name = SLOT_NAMES[id];
    slot.active = id === c.current;
  }
  d.gear.on = c.gear !== null;
  if (c.gear) {
    d.gear.key = v.label('gear');
    d.gear.name = GEAR[c.gear].name;
    d.gear.left = c.gearLeft;
  }
  d.reload = w.reloadProgress;
  d.perfect = w.perfectAvailable ? w.perfectWindow : null;
  const fov = (v.fovDeg * Math.PI) / 180;
  const pxPerRad = v.viewportHeight / 2 / Math.tan(fov / 2);
  d.spreadPx = Math.max(4, Math.min(60, Math.tan((c.spreadDeg * Math.PI) / 180) * pxPerRad));
  d.blocked = c.blocked;
  d.aimOverEnemy = c.aimOver === 'enemy';
  d.aimOverCivilian = c.aimOver === 'civilian';
  d.hitKind = c.hitMarker.kind;
  d.hitT = c.hitMarker.t;
  for (let i = 0; i < d.damage.length; i++) {
    const src = c.damageDirs[i]!;
    const slot = d.damage[i]!;
    slot.k = src.t > 0 ? Math.min(1, src.t / 0.6) : 0;
    if (slot.k > 0) slot.angle = wrapAngle(Math.atan2(-(src.from.x - s.player.feet.x), -(src.from.z - s.player.feet.z)) - v.yaw);
  }
  d.multiplier = c.style.multiplier;
  d.rankName = c.style.rankName;
  d.gauge = c.style.gauge;
  d.score = c.style.score;
  d.feed = c.feed;
  d.focus = c.focus;
  d.focusActive = c.focusActive;
  d.focusReady = c.focus >= 30;
  d.focusKey = v.label('focus');
}

/** Lo que decide el aviso contextual además de la sesión. */
export interface PromptInput {
  near: InteractableDef | null;
  /** Segundos que lleva mantenida la tecla de interactuar (interactivos con `hold`). */
  holdT: number;
  yaw: number;
  moveX: number;
  moveY: number;
  /** Rayo de la cámara: la cobertura a la que se correría manteniendo C. */
  lookFrom: Vec3Like;
  lookDir: Vec3Like;
  /** En pleno combate (o en un nivel de práctica) se avisa también de la cobertura que se mira, no solo de la cercana. */
  combat: boolean;
  label: (a: Action) => string;
}

/** Aviso contextual: interactuar, takedown, cobertura, vault o cubrirse, por ese orden. */
export function contextPrompt(s: LevelSession, i: PromptInput): PromptSpec | null {
  const p = s.player;
  const lab = i.label;
  if (s.combat.throwReady) return { key: `Suelta ${lab('gear')}`, text: `Lanzar  ·  ${lab('reload')}: guardarla` };
  const near = i.near;
  if (near) {
    const hold = near.hold ?? 0;
    if (hold > 0)
      return {
        key: `Mantén ${lab('interact')}`,
        text: i.holdT > 0 ? `${near.prompt} · ${Math.min(99, Math.round((i.holdT / hold) * 100))} %` : near.prompt,
      };
    return { key: lab('interact'), text: near.prompt };
  }
  if (s.combat.takedownCandidate(s.ctx)) return { key: lab('takedown'), text: 'Takedown' };
  const hint = p.peekContext(i.yaw, i.moveX, i.moveY, i.lookFrom, i.lookDir);
  const far = hint.spot ? Math.max(1, Math.round(Math.hypot(hint.spot.x - p.feet.x, hint.spot.z - p.feet.z))) : 0;
  if (p.state === 'cover' && p.cover) {
    const c = p.cover;
    if (c.wrap >= 0) return null;
    const next = hint.spot ? `Mantén ${lab('crouch')}: a la cobertura que miras (${far} m)` : `${lab('crouch')}: salir`;
    const shoot = `${lab('aim')} / ${lab('fire')}`;
    if (c.height === 'low') return { key: shoot, text: `Asomarse · disparar a ciegas  ·  ${lab('jump')}: saltarla  ·  ${next}` };
    // En la alta se asoma (o dispara a ciegas) desde un borde; lejos de él, al apuntar va solo al más cercano.
    const side = c.peekSide || c.edgeNear;
    if (side !== 0) return { key: shoot, text: `Asomarse por la ${side < 0 ? 'izquierda' : 'derecha'} · a ciegas  ·  ${next}` };
    if (hint.edge !== 0) return { key: lab('aim'), text: `Asomarse por el borde ${hint.edge < 0 ? 'izquierdo' : 'derecho'}  ·  ${next}` };
    return { key: `${lab('moveLeft')} / ${lab('moveRight')}`, text: `Ve hasta un borde para asomarte  ·  ${next}` };
  }
  if (hint.vault) return { key: lab('jump'), text: hint.vault === 'vault' ? 'Saltar por encima' : 'Subir' };
  if (hint.cover) return { key: lab('crouch'), text: hint.cover === 'low' ? 'Cubrirse (cobertura baja)' : 'Cubrirse' };
  if (hint.spot && i.combat) return { key: `Mantén ${lab('crouch')}`, text: `Correr a cubierto (${far} m)` };
  return null;
}

/** Dónde marcar la cobertura a la que iría C, o null: la cercana siempre; la que se mira, a cubierto o en combate. */
export function coverMarkerSpot(s: LevelSession, combat: boolean): CoverSpot | null {
  const p = s.player;
  const h = p.moveHint;
  if (!h.spot || (p.state !== 'cover' && p.state !== 'ground')) return null;
  return h.cover || p.state === 'cover' || combat ? h.spot : null;
}

/** Panel de Intel: el contrato en curso, o el vestíbulo (neutral u hostil). */
export function buildIntelView(s: LevelSession | null, m: MissionDirector | null, hostile: boolean, level: LevelId): IntelView {
  const data = s?.data;
  const types = new Set<EnemyType>();
  if (m?.id === 'gauntlet') for (const t of ['thug', 'escort', 'marksman', 'heavy'] as const) types.add(t);
  else if (m) for (const e of data?.enemies ?? []) types.add(e.type);
  else if (hostile) for (const e of data?.enemies ?? []) if (e.spawnOn?.startsWith('excom-')) types.add(e.type);
  const notes: string[] = [];
  if (m) {
    const def = MISSIONS[m.id];
    notes.push(def.briefing[1] ?? '');
    notes.push(def.briefing[2] ?? '');
    if (data?.mission?.alarm && !m.alarmDisabled)
      notes.push(m.alarmSounded ? 'La alarma ya ha sonado.' : 'Si alguien da la voz de alarma llegan refuerzos. Busca el panel para desactivarla.');
  } else if (level === 'hub') {
    notes.push(hostile ? HUB_TEXT.intelHostile : HUB_TEXT.intelNeutral);
    notes.push(HUB_TEXT.intelContracts);
  }
  return {
    title: m ? MISSIONS[m.id].name : (data?.name ?? ''),
    place: m ? MISSIONS[m.id].place : (data?.subtitle ?? ''),
    objective: m ? m.currentText : '',
    markers: m ? { used: m.markersUsed, total: m.markersTotal } : null,
    notes: notes.filter((n) => n.length > 0),
    enemies: [...types],
    civilians: (data?.civilians.length ?? 0) > 0,
    alive: s && (m || hostile) ? s.enemies.aliveCount : null,
  };
}
