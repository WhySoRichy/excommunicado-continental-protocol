import { Vector3 } from 'three';
import type { EnemyManager } from '../combat/EnemyManager';
import type { CombatIntent } from '../combat/PlayerCombat';
import type { Pickups } from '../combat/Pickups';
import { emptyPlayerLook } from '../combat/playerLook';
import type { PlayerRoster, PlayerSlot } from '../combat/PlayerRoster';
import type { CombatAudio, CombatCamera, CombatVfx } from '../combat/ports';
import type { UpgradeId } from '../combat/weapons';
import { type CivilianManager, type CivilianNet, emptyCivilianNet } from '../entities/Civilian';
import { emptyEnemyNet, type EnemyNet } from '../entities/Enemy';
import { ENEMY_TYPES } from '../entities/ai/enemyTypes';
import { emptyMoveNet, type MoveNet } from '../entities/PlayerController';
import type { LevelId } from '../levels/types';
import type { MissionId } from '../missions/types';
import { playFx } from './fx';
import { lerpCivilian, lerpEnemy, lerpLook, lerpMove, SnapshotClock } from './interp';
import type { Link } from './link';
import {
  type CoopResults,
  decodeHostCtl,
  decodeSnapshot,
  emptyInputFrame,
  emptyMissionNet,
  encodeGuestCtl,
  encodeInput,
  type GuestCtl,
  type HostCtl,
  INPUT_REDUNDANCY,
  type InputFrame,
  type MissionNet,
  type OwnerEvent,
  type OwnerNet,
  PROTOCOL,
  type RejectReason,
  type RejoinTicket,
  shotSeed,
  simKind,
  type Snapshot,
  TABLES_HASH,
} from './protocol';

/** Lo que el invitado necesita de su partida (la `LevelSession` en modo réplica, o un mundo sin pantalla). */
export interface GuestWorld {
  readonly roster: PlayerRoster;
  readonly local: PlayerSlot;
  readonly enemies: EnemyManager;
  readonly civilians: CivilianManager | null;
  readonly pickups: Pickups;
  /** Sonido y efectos de este equipo (lo que pasa en la partida se ve y se oye con ellos). */
  readonly ports: { vfx: CombatVfx; audio: CombatAudio };
  /** Plaza para dibujar a otro jugador (lo mueve lo que llega del anfitrión). */
  createReplica(id: number, at: MoveNet): PlayerSlot;
}

/** Lo que el juego hace con lo que llega (pantallas, HUD, cámara). */
export interface GuestEvents {
  welcome?(id: number): void;
  reject?(why: RejectReason): void;
  /** Quién está en la sala y el nivel en juego (null: la partida volvió a la sala). */
  lobby?(ids: number[], level: LevelId | null): void;
  start?(level: LevelId, mission: MissionId | null): void;
  hud?(m: Extract<HostCtl, { t: 'hud' }>): void;
  /** El anfitrión le colocó (al entrar o al reaparecer): la cámara se recoloca. */
  spawned?(revived: boolean): void;
  died?(): void;
  results?(r: CoopResults): void;
  /** Se acabó la conexión: `byHost` si el anfitrión cerró la partida; si no, se perdió. */
  closed?(byHost: boolean): void;
}

export interface GuestOptions {
  now(): number;
  upgrades: ReadonlySet<UpgradeId>;
  /** Vuelve tras un corte: la plaza que tenía y su contraseña. */
  rejoin?: RejoinTicket;
  events: GuestEvents;
  /** La cámara del jugador local (sacudidas de los impactos y el daño que confirma el anfitrión). */
  camera: CombatCamera;
}

/** Instantáneas guardadas como mucho (1,6 s). */
const MAX_SNAPSHOTS = 32;
/** Cada cuánto se mide la latencia (ms). */
const PING_EVERY = 1000;
/** Sin noticias del anfitrión durante este tiempo (ms), se da la conexión por perdida. */
export const HOST_TIMEOUT = 10_000;
/** Pasos de los que se recuerda la munición predicha (para corregirla con la del anfitrión). */
const AMMO_HISTORY = 256;

interface AmmoEntry {
  seq: number;
  mag: number[];
  reserve: number[];
}

/**
 * Un invitado en una partida en red (fase 3 de docs/ESCALABILIDAD.md). Su personaje lo mueve él (el anfitrión solo
 * comprueba que sea creíble) y su disparo se predice aquí con la misma semilla que usará el anfitrión; todo lo demás
 * (enemigos, civiles, el resto de jugadores, objetos) son réplicas que dibujan lo que llega, interpolado. Lo que el
 * anfitrión confirma (impactos, estilo, salud, munición) manda sobre lo predicho.
 */
export class NetGuest {
  /** Su id en la partida (0 hasta que el anfitrión le da plaza). */
  id = 0;
  /** Ida y vuelta medida (ms). */
  rtt = 0;
  /** Contraseña de su plaza (para volver tras un corte). */
  private token = '';
  /** Lo último que dijo el anfitrión de la misión. */
  readonly mission: MissionNet = emptyMissionNet();
  readonly clock = new SnapshotClock();
  private world: GuestWorld | null = null;
  /** Nivel en el que está (null en la sala). */
  level: LevelId | null = null;
  private readonly snaps: Snapshot[] = [];
  private seq = 0;
  private epoch = 0;
  private readonly sent: InputFrame[] = [];
  private readonly ammo: AmmoEntry[] = [];
  private lastOwnerTick = -1;
  private lastPing = -1e9;
  private lastHeard: number;
  private pingN = 0;
  private readonly pingAt = new Map<number, number>();
  private readonly enemyTmp: EnemyNet = emptyEnemyNet();
  private readonly civTmp: CivilianNet = emptyCivilianNet();
  private readonly moveTmp: MoveNet = emptyMoveNet();
  private readonly lookTmp = emptyPlayerLook();
  private closed = false;

  constructor(
    private readonly link: Link,
    private readonly opts: GuestOptions,
  ) {
    this.lastHeard = opts.now();
    link.onMessage = (ch, data) => {
      this.lastHeard = this.opts.now();
      if (ch === 'ctl') this.onCtl(data);
      else this.onSim(data);
    };
    link.onClose = () => this.end(false);
    this.send({ t: 'hello', v: PROTOCOL, tables: TABLES_HASH, upgrades: [...opts.upgrades], ...(opts.rejoin ? { rejoin: opts.rejoin } : {}) });
  }

  /** Lo que necesita para recuperar su plaza si se corta (null hasta tener plaza). */
  get ticket(): RejoinTicket | null {
    return this.id > 0 && this.token ? { id: this.id, token: this.token } : null;
  }

  get connected(): boolean {
    return !this.closed && this.link.open;
  }

  /** El nivel que pidió el anfitrión ya está cargado: a partir de aquí llegan sus instantáneas. */
  attach(world: GuestWorld, level: LevelId): void {
    this.world = world;
    this.level = level;
    this.snaps.length = 0;
    this.clock.reset();
    this.sent.length = 0;
    this.ammo.length = 0;
    this.lastOwnerTick = -1;
    world.local.combat.authority = false;
    world.local.combat.allowFocus = false;
    this.send({ t: 'ready', level });
  }

  /** El nivel se va a descargar. */
  detach(): void {
    this.world = null;
    this.level = null;
    this.snaps.length = 0;
  }

  /** Pide al anfitrión usar un objeto de la misión (él decide si está a su alcance). */
  requestInteract(id: string): void {
    this.send({ t: 'interact', id });
  }

  /** Corta la conexión sin despedirse, como un corte de red (para probar la vuelta tras un corte). */
  disconnect(): void {
    this.link.close();
  }

  /** Sale de la partida. */
  leave(): void {
    if (this.closed) return;
    this.send({ t: 'bye' });
    this.closed = true;
    this.link.close();
  }

  /**
   * Antes del paso del jugador local: pone las réplicas en el instante que toca en pantalla, reproduce los efectos que
   * ya han llegado a él y aplica lo último que dijo el anfitrión del propio jugador. Devuelve la semilla de la
   * dispersión de este paso (la misma que usará el anfitrión al resolverlo).
   */
  preStep(): number {
    const w = this.world;
    if (w) {
      this.clock.advance();
      this.applyReplicas(w);
    }
    return shotSeed(this.id, this.seq + 1);
  }

  /**
   * Latido (lo llama el juego cada medio segundo, también en la sala y con la pestaña oculta): mide la latencia y, si
   * el anfitrión lleva demasiado sin decir nada, da la conexión por perdida.
   */
  tick(): void {
    if (this.closed) return;
    const now = this.opts.now();
    if (now - this.lastHeard > HOST_TIMEOUT) {
      this.link.close();
      this.end(false);
      return;
    }
    if (now - this.lastPing > PING_EVERY && this.connected) {
      this.lastPing = now;
      this.pingAt.set(++this.pingN, now);
      // Las que nunca volvieron no se acumulan.
      for (const n of this.pingAt.keys()) if (n < this.pingN - 8) this.pingAt.delete(n);
      this.send({ t: 'ping', n: this.pingN });
    }
  }

  private end(byHost: boolean): void {
    if (this.closed) return;
    this.closed = true;
    this.opts.events.closed?.(byHost);
  }

  /** Tras el paso del jugador local: envía el paso (con los anteriores, por si se perdieron). */
  postStep(ci: CombatIntent): void {
    const w = this.world;
    if (!w || !this.connected) return;
    const f = this.sent.length >= INPUT_REDUNDANCY ? this.sent.shift()! : emptyInputFrame();
    f.seq = ++this.seq;
    f.view = Math.max(0, this.clock.tick);
    f.epoch = this.epoch;
    w.local.controller.writeNet(f.move);
    f.fireHeld = ci.fireHeld;
    f.firePressed = ci.firePressed;
    f.aim = ci.aim;
    f.reloadPressed = ci.reloadPressed;
    f.takedownPressed = ci.takedownPressed;
    f.focusPressed = false;
    f.select = ci.select;
    f.cycle = ci.cycle;
    f.aimFrom.x = ci.aimFrom.x;
    f.aimFrom.y = ci.aimFrom.y;
    f.aimFrom.z = ci.aimFrom.z;
    f.aimDir.x = ci.aimDir.x;
    f.aimDir.y = ci.aimDir.y;
    f.aimDir.z = ci.aimDir.z;
    this.sent.push(f);
    this.link.send('sim', encodeInput(this.sent));
    this.rememberAmmo(w, f.seq);
  }

  // ================================================================ mensajes
  private onCtl(data: string): void {
    const m = decodeHostCtl(data);
    if (!m) return;
    const ev = this.opts.events;
    switch (m.t) {
      case 'welcome':
        this.id = m.id;
        this.token = m.token;
        ev.welcome?.(m.id);
        return;
      case 'reject':
        ev.reject?.(m.why);
        return;
      case 'lobby':
        ev.lobby?.(m.ids, m.level);
        return;
      case 'start':
        ev.start?.(m.level, m.mission);
        return;
      case 'hud':
        ev.hud?.(m);
        return;
      case 'me':
        this.onEvent(m.ev);
        return;
      case 'end':
        ev.results?.(m.r);
        return;
      case 'pong': {
        const at = this.pingAt.get(m.n);
        if (at !== undefined) {
          this.pingAt.delete(m.n);
          const rtt = this.opts.now() - at;
          this.rtt = this.rtt === 0 ? rtt : this.rtt * 0.7 + rtt * 0.3;
        }
        return;
      }
      case 'bye':
        this.end(true);
        this.link.close();
        return;
    }
  }

  private onSim(data: string): void {
    if (!this.world || simKind(data) !== 's') return;
    const s = decodeSnapshot(data);
    if (!s) return;
    const snaps = this.snaps;
    if (snaps.length && s.tick <= snaps[snaps.length - 1]!.tick) {
      // Llegó tarde: si aún sirve para interpolar, en su sitio; si no, fuera.
      if (s.tick <= this.clock.tick || snaps.some((x) => x.tick === s.tick)) return;
      snaps.push(s);
      snaps.sort((a, b) => a.tick - b.tick);
    } else snaps.push(s);
    if (snaps.length > MAX_SNAPSHOTS) snaps.shift();
    this.clock.received(s.tick);
    Object.assign(this.mission, s.mission);
    if (s.owner && s.tick > this.lastOwnerTick) {
      this.lastOwnerTick = s.tick;
      this.applyOwner(this.world, s.owner);
    }
  }

  private onEvent(e: OwnerEvent): void {
    const w = this.world;
    if (!w) return;
    const c = w.local.combat;
    const o = this.opts;
    const audio = w.ports.audio;
    switch (e.e) {
      case 'marker':
        c.showMarker(e.kind, audio, o.camera);
        return;
      case 'award':
        c.showAward(e.action, e.points);
        return;
      case 'pickup':
        c.showPickup(e.kind);
        audio.ui('confirm');
        return;
      case 'hurt': {
        const from = new Vector3(e.x, e.y, e.z);
        c.showHurt(from, e.damage, audio, o.camera);
        const def = ENEMY_TYPES[e.enemy];
        c.lastDamage = { label: def.label, type: def.type, from, distance: e.distance };
        return;
      }
      case 'died':
        if (c.dead) return;
        c.dead = true;
        c.lastPlayerPos.copy(w.local.controller.feet);
        c.focusActive = false;
        c.weapon.cancelReload();
        c.takedown = null;
        w.local.controller.setLocked(false);
        w.local.controller.kill();
        o.events.died?.();
        return;
      case 'spawn': {
        if (e.epoch <= this.epoch) return;
        const revived = this.epoch > 0;
        this.epoch = e.epoch;
        w.local.controller.revive(new Vector3(e.x, e.y, e.z), e.yaw);
        if (c.dead) c.respawnReset();
        this.ammo.length = 0;
        o.events.spawned?.(revived);
        return;
      }
    }
  }

  // ================================================================ réplicas
  private applyReplicas(w: GuestWorld): void {
    const snaps = this.snaps;
    if (!snaps.length) return;
    const t = this.clock.tick;
    // Las dos instantáneas que rodean al instante en pantalla (o la más cercana si no hay dos).
    let ai = -1;
    for (let i = 0; i < snaps.length; i++) if (snaps[i]!.tick <= t) ai = i;
    const a = snaps[Math.max(0, ai)]!;
    const b = ai >= 0 && ai + 1 < snaps.length ? snaps[ai + 1]! : a;
    const k = b.tick > a.tick ? Math.min(1, Math.max(0, (t - a.tick) / (b.tick - a.tick))) : 0;
    // Los efectos de las instantáneas que ya están en pantalla, una vez cada una.
    for (let i = 0; i <= ai; i++) {
      const s = snaps[i]!;
      if (s.fx.length === 0) continue;
      for (const f of s.fx) if (f[1] !== this.id) playFx(f, w.ports.vfx, w.ports.audio);
      s.fx = [];
    }
    // Lo anterior a `a` ya no hace falta.
    if (ai > 0) snaps.splice(0, ai);
    this.applyEnemies(w, a, b, k);
    this.applyPlayers(w, a, b, k);
    this.applyCivilians(w, a, b, k);
    w.pickups.applyNet(b.pickups);
  }

  private applyEnemies(w: GuestWorld, a: Snapshot, b: Snapshot, k: number): void {
    const em = w.enemies;
    for (const ea of a.enemies) {
      let eb = ea;
      for (const x of b.enemies)
        if (x.uid === ea.uid) {
          eb = x;
          break;
        }
      const s = lerpEnemy(ea, eb, k, this.enemyTmp);
      const e = em.byNetId(s.uid);
      if (e) e.applyNet(s);
      else em.spawnReplica(s.uid, s.type, s.move).applyNet(s, true);
    }
    // Los que el anfitrión ya retiró.
    for (let i = em.enemies.length - 1; i >= 0; i--) {
      const e = em.enemies[i]!;
      if (!a.enemies.some((x) => x.uid === e.uid)) em.remove(e);
    }
  }

  private applyPlayers(w: GuestWorld, a: Snapshot, b: Snapshot, k: number): void {
    const roster = w.roster;
    for (const pa of a.players) {
      if (pa.id === this.id) continue;
      const pb = b.players.find((x) => x.id === pa.id) ?? pa;
      lerpMove(pa.move, pb.move, k, this.moveTmp);
      let s = roster.byId(pa.id);
      const fresh = !s;
      s ??= w.createReplica(pa.id, this.moveTmp);
      s.controller.applyNet(this.moveTmp, fresh);
      Object.assign(s.look, lerpLook(pa.look, pb.look, k, this.lookTmp));
    }
    for (let i = roster.slots.length - 1; i >= 0; i--) {
      const s = roster.slots[i]!;
      if (s.drive === 'replica' && !a.players.some((p) => p.id === s.id)) roster.remove(s);
    }
  }

  private applyCivilians(w: GuestWorld, a: Snapshot, b: Snapshot, k: number): void {
    const list = w.civilians?.list;
    if (!list) return;
    const n = Math.min(list.length, a.civilians.length);
    for (let i = 0; i < n; i++) list[i]!.applyNet(lerpCivilian(a.civilians[i]!, b.civilians[i] ?? a.civilians[i]!, k, this.civTmp));
  }

  // ================================================================ lo propio
  /** Salud, estilo y munición tal como los ve el anfitrión: mandan sobre lo predicho aquí. */
  private applyOwner(w: GuestWorld, o: OwnerNet): void {
    if (o.epoch !== this.epoch) return;
    const c = w.local.combat;
    const v = c.vitals;
    v.health = o.health;
    v.armor = o.armor;
    v.maxHealth = o.maxHealth;
    v.maxArmor = o.maxArmor;
    c.style.score = o.score;
    c.style.multiplier = o.multiplier;
    c.style.gauge = o.gauge;
    this.reconcileAmmo(w, o);
  }

  /**
   * Munición: se compara la del anfitrión en el último paso que aplicó con la que se predijo aquí en ese mismo paso, y
   * la diferencia (un objeto recogido, un disparo que allí no salió) se suma a la de ahora. Así no salta hacia atrás
   * por lo que aún está en camino.
   */
  private reconcileAmmo(w: GuestWorld, o: OwnerNet): void {
    const entry = this.ammo.find((x) => x.seq === o.ack);
    if (!entry) return;
    const c = w.local.combat;
    c.loadout.forEach((id, i) => {
      const host = o.ammo.find((x) => x.weapon === id);
      const ws = c.weapons.get(id);
      if (!host || !ws) return;
      const dMag = host.mag - entry.mag[i]!;
      const dRes = Number.isFinite(host.reserve) && Number.isFinite(entry.reserve[i]!) ? host.reserve - entry.reserve[i]! : 0;
      if (dMag === 0 && dRes === 0) return;
      ws.mag = Math.max(0, Math.min(ws.def.mag, ws.mag + dMag));
      if (Number.isFinite(ws.reserve)) ws.reserve = Math.max(0, ws.reserve + dRes);
      for (const x of this.ammo) {
        if (x.seq <= o.ack) continue;
        x.mag[i]! += dMag;
        x.reserve[i]! += dRes;
      }
    });
  }

  private rememberAmmo(w: GuestWorld, seq: number): void {
    const c = w.local.combat;
    const e = this.ammo.length >= AMMO_HISTORY ? this.ammo.shift()! : { seq: 0, mag: [], reserve: [] };
    e.seq = seq;
    e.mag.length = 0;
    e.reserve.length = 0;
    for (const id of c.loadout) {
      const ws = c.weapons.get(id)!;
      e.mag.push(ws.mag);
      e.reserve.push(ws.reserve);
    }
    this.ammo.push(e);
  }

  private send(m: GuestCtl): void {
    if (this.link.open) this.link.send('ctl', encodeGuestCtl(m));
  }
}
