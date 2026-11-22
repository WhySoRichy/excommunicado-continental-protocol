import { Vector3 } from 'three';
import type { EnemyManager } from '../combat/EnemyManager';
import type { CombatListener, PlayerCombat } from '../combat/PlayerCombat';
import type { Pickups } from '../combat/Pickups';
import { type PlayerRoster, type PlayerSlot, remoteAudio } from '../combat/PlayerRoster';
import type { CombatAudio, CombatVfx } from '../combat/ports';
import { Rng } from '../core/rng';
import { type CivilianManager, type CivilianNet, emptyCivilianNet } from '../entities/Civilian';
import { emptyEnemyNet, type EnemyNet } from '../entities/Enemy';
import { CROUCH_HALF, emptyMoveNet, MOVE, type MoveNet, PLAYER_RADIUS, type PlayerController, STAND_HALF } from '../entities/PlayerController';
import type { UpgradeId } from '../combat/weapons';
import type { LevelId } from '../levels/types';
import type { MissionId } from '../missions/types';
import type { MissionHud } from '../missions/ports';
import { type PhysicsWorld, QueryGroups } from '../physics/Physics';
import type { FxRecorder } from './fx';
import { ShotHistory } from './lagComp';
import type { Link } from './link';
import {
  type CoopResults,
  decodeGuestCtl,
  decodeInput,
  emptyInputFrame,
  emptyMissionNet,
  encodeHostCtl,
  encodeSnapshotBody,
  type HostCtl,
  type InputFrame,
  MAX_PLAYERS,
  type MissionNet,
  type OwnerEvent,
  type OwnerNet,
  type PickupNet,
  type PlayerNet,
  PROTOCOL,
  shotSeed,
  simKind,
  SNAPSHOT_TICKS,
  TABLES_HASH,
  withOwner,
} from './protocol';

/**
 * Lo que el anfitrión necesita de la partida en curso. La `LevelSession` lo cumple; las pruebas, un mundo sin pantalla.
 */
export interface HostWorld {
  readonly physics: PhysicsWorld;
  readonly roster: PlayerRoster;
  readonly enemies: EnemyManager;
  readonly civilians: CivilianManager | null;
  readonly pickups: Pickups;
  /** Los puertos de verdad de este equipo (sin el registro de efectos): lo que ve y oye el anfitrión. */
  readonly ports: { vfx: CombatVfx; audio: CombatAudio };
  /** El cuerpo y el combate de un invitado, con sus mejoras (aún fuera del registro). */
  createPlayer(at: Vector3, yaw: number, upgrades: ReadonlySet<UpgradeId>): { controller: PlayerController; combat: PlayerCombat };
  /** Un punto libre cerca de `base` para el jugador `index` (para que no aparezcan unos encima de otros). */
  spawnNear(base: Vector3, yaw: number, index: number, out: Vector3): Vector3;
}

export interface HostOptions {
  /** Hora en ms (el reloj del navegador en el juego; el de la red en las pruebas). */
  now(): number;
  recorder: FxRecorder;
  /** Alguien entró o se fue de la sala o de la partida (para la interfaz). */
  onPlayersChanged?(): void;
  /** Un invitado cayó (la misión gasta un marcador; si no quedan, la partida termina). */
  onGuestDied?(slot: PlayerSlot): void;
  /** Un invitado se fue: su id (para avisarlo en pantalla). */
  onGuestLeft?(id: number): void;
}

/** Sin noticias de un invitado durante este tiempo (ms), se le da por ido. */
export const PEER_TIMEOUT = 8000;
/** Velocidad horizontal máxima creíble (m/s): por encima de la de la plancha y la del deslizamiento. */
const MAX_SPEED = MOVE.maxHorizontal + 2;
/** Subida máxima por paso (m/s) y margen para el vault y el encaramarse. */
const MAX_RISE = MOVE.jumpSpeed + 2;
const RISE_SLACK = MOVE.vaultMaxH + 0.3;
/** Caída máxima (m/s): la de la gravedad, con margen. */
const MAX_FALL = MOVE.maxFall + 4;
/** Pasos guardados como mucho por invitado (si llegan más, se descartan los más viejos). */
const MAX_QUEUED = 30;
/** Con más pasos en cola que esto, se aplican dos por paso hasta recuperar el ritmo. */
const CATCH_UP = 8;
/** Pasos que se esperan en cola antes de empezar a aplicarlos tras quedarse sin ninguno (amortigua la variación). */
const PREBUFFER = 2;

type PeerState = 'hello' | 'lobby' | 'loading' | 'playing';

interface Peer {
  readonly link: Link;
  id: number;
  state: PeerState;
  upgrades: ReadonlySet<UpgradeId>;
  slot: PlayerSlot | null;
  readonly queue: InputFrame[];
  lastQueued: number;
  /** El último paso aplicado: su número (`ack`), su apuntado y lo que se mantiene pulsado. */
  readonly held: InputFrame;
  ack: number;
  epoch: number;
  buffering: boolean;
  lastHeard: number;
  readonly rng: Rng;
  /** Última posición aceptada y pasos desde entonces (para la comprobación de plausibilidad). */
  readonly accepted: Vector3;
  sinceAccepted: number;
  rejected: number;
}

const _spawn = new Vector3();
const _center = new Vector3();

/**
 * El anfitrión de una partida en red (fase 3 de docs/ESCALABILIDAD.md). Simula la partida entera como siempre y además:
 *
 * - recibe a los invitados (versión, plaza libre) y les dice qué nivel cargar;
 * - aplica en cada paso el de cada invitado: su movimiento, si es creíble (velocidad, altura, sin atravesar paredes;
 *   si no, lo devuelve a donde estaba), y su combate, con la misma semilla de dispersión que usó él al predecirlo;
 * - resuelve los disparos de cada invitado contra la partida que él veía (compensación de latencia);
 * - envía a cada uno, 20 veces por segundo, el estado de todo lo que se ve y lo suyo propio, y por el canal fiable lo
 *   que le pasa (impactos, estilo, daño, muerte, reaparición) y los textos de la misión.
 *
 * Es solo simulación: no sabe de pantallas ni de transportes, y corre igual en las pruebas sin pantalla.
 */
export class NetHost {
  private readonly peers: Peer[] = [];
  private world: HostWorld | null = null;
  private level: LevelId | null = null;
  private mission: MissionId | null = null;
  private tick = 0;
  private readonly history = new ShotHistory();
  /** Lo que el invitado necesita de la misión (lo rellena el juego). */
  readonly missionNet: MissionNet = emptyMissionNet();
  /** Textos de la misión en pantalla (para enviarlos a quien llega tarde). */
  private readonly hudState = { objective: '', zone: '', combat: true };
  private readonly enemyPool: EnemyNet[] = [];
  private readonly civPool: CivilianNet[] = [];
  private readonly playerPool: PlayerNet[] = [];
  private closed = false;

  constructor(private readonly opts: HostOptions) {}

  /** Los invitados conectados, en el orden de sus ids. */
  get guests(): ReadonlyArray<{ id: number; state: PeerState }> {
    return this.peers
      .filter((p) => p.id > 0)
      .map((p) => ({ id: p.id, state: p.state }))
      .sort((a, b) => a.id - b.id);
  }

  /** Ids en la sala, el anfitrión (0) incluido. */
  get lobbyIds(): number[] {
    return [0, ...this.guests.map((g) => g.id)];
  }

  /** Un equipo nuevo quiere unirse (aún no se sabe si es compatible). */
  accept(link: Link): void {
    if (this.closed) {
      link.close();
      return;
    }
    const peer: Peer = {
      link,
      id: 0,
      state: 'hello',
      upgrades: new Set(),
      slot: null,
      queue: [],
      lastQueued: -1,
      held: emptyInputFrame(),
      ack: 0,
      epoch: 0,
      buffering: true,
      lastHeard: this.opts.now(),
      rng: new Rng(),
      accepted: new Vector3(),
      sinceAccepted: 0,
      rejected: 0,
    };
    this.peers.push(peer);
    link.onMessage = (ch, data) => {
      peer.lastHeard = this.opts.now();
      if (ch === 'ctl') this.onCtl(peer, data);
      else this.onSim(peer, data);
    };
    link.onClose = () => this.drop(peer);
  }

  /** Empieza un nivel (ya cargado en este equipo): los invitados lo cargan y entran cuando están listos. */
  start(world: HostWorld, level: LevelId, mission: MissionId | null): void {
    this.world = world;
    this.level = level;
    this.mission = mission;
    this.tick = 0;
    this.history.clear();
    this.hudState.objective = '';
    this.hudState.zone = '';
    this.hudState.combat = true;
    world.roster.onRevive = (s) => this.onRevive(s);
    for (const p of this.peers) {
      if (p.state === 'hello') continue;
      p.slot = null;
      p.state = 'loading';
      this.send(p, { t: 'start', level, mission });
    }
    this.opts.onPlayersChanged?.();
  }

  /** El nivel termina (vuelta a la sala): los invitados vuelven a la sala con él. */
  stop(): void {
    if (this.world) this.world.roster.onRevive = null;
    this.world = null;
    this.level = null;
    this.mission = null;
    for (const p of this.peers) {
      p.slot = null;
      if (p.state !== 'hello') p.state = 'lobby';
    }
    this.broadcastLobby();
  }

  /** Cierra la partida para todos (el anfitrión sale). */
  close(): void {
    if (this.closed) return;
    this.closed = true;
    for (const p of this.peers.slice()) {
      this.send(p, { t: 'bye' });
      p.link.close();
    }
    this.peers.length = 0;
  }

  /**
   * Un paso de los invitados, después del jugador local y antes que los enemigos: aplica el siguiente paso de cada uno
   * (o mantiene el último si aún no ha llegado) y simula su combate.
   */
  step(dt: number): void {
    const now = this.opts.now();
    for (const p of this.peers.slice()) {
      if (now - p.lastHeard > PEER_TIMEOUT) {
        this.drop(p);
        continue;
      }
      if (p.state !== 'playing' || !p.slot) continue;
      this.stepPeer(p, dt);
    }
  }

  /** Al terminar el paso: guarda el pasado para los disparos y, cada tres pasos, envía la instantánea. */
  endStep(): void {
    const w = this.world;
    if (!w) return;
    this.tick++;
    this.history.record(this.tick, w.enemies.enemies, w.civilians?.list ?? null);
    if (this.tick % SNAPSHOT_TICKS === 0) this.sendSnapshots(w);
  }

  /** Los puertos del HUD de la misión, que además envían sus textos a los invitados. */
  hud(base: MissionHud): MissionHud {
    return {
      showToast: (text, seconds = 2.5) => {
        base.showToast(text, seconds);
        this.broadcast({ t: 'hud', k: 'toast', text: text.slice(0, 240), seconds });
      },
      setObjective: (text) => {
        base.setObjective(text);
        this.hudState.objective = text;
        this.broadcast({ t: 'hud', k: 'objective', text: text.slice(0, 240) });
      },
      setZone: (text) => {
        base.setZone(text);
        this.hudState.zone = text;
        this.broadcast({ t: 'hud', k: 'zone', text: text.slice(0, 240) });
      },
      setCombatVisible: (on) => {
        base.setCombatVisible(on);
        this.hudState.combat = on;
        this.broadcast({ t: 'hud', k: 'combat', on });
      },
    };
  }

  /** La misión terminó: los resultados para todos. */
  sendResults(r: CoopResults): void {
    this.broadcast({ t: 'end', r });
  }

  // ================================================================ mensajes
  private onCtl(p: Peer, data: string): void {
    const m = decodeGuestCtl(data);
    if (!m) return;
    switch (m.t) {
      case 'hello': {
        if (p.state !== 'hello') return;
        if (m.v !== PROTOCOL || m.tables !== TABLES_HASH) {
          this.reject(p, 'version');
          return;
        }
        const id = this.freeId();
        if (id < 0) {
          this.reject(p, 'full');
          return;
        }
        p.id = id;
        p.upgrades = new Set(m.upgrades);
        p.state = 'lobby';
        this.send(p, { t: 'welcome', id });
        this.broadcastLobby();
        if (this.level) {
          p.state = 'loading';
          this.send(p, { t: 'start', level: this.level, mission: this.mission });
        }
        return;
      }
      case 'ready':
        if (p.state === 'loading' && m.level === this.level && this.world) this.spawnPeer(p, this.world);
        return;
      case 'ping':
        this.send(p, { t: 'pong', n: m.n });
        return;
      case 'bye':
        this.drop(p);
        return;
    }
  }

  private onSim(p: Peer, data: string): void {
    if (p.state !== 'playing' || simKind(data) !== 'i') return;
    const frames = decodeInput(data);
    if (!frames) return;
    for (const f of frames) {
      if (f.seq <= p.lastQueued) continue;
      p.lastQueued = f.seq;
      p.queue.push(f);
    }
    if (p.queue.length > MAX_QUEUED) p.queue.splice(0, p.queue.length - MAX_QUEUED);
  }

  // ================================================================ invitados en la partida
  private spawnPeer(p: Peer, w: HostWorld): void {
    const r = w.roster.respawn;
    const at = w.spawnNear(r.pos, r.yaw, p.id, _spawn);
    const { controller, combat } = w.createPlayer(at, r.yaw, p.upgrades);
    combat.allowFocus = false;
    combat.listener = this.listenerFor(p);
    const ports = this.opts.recorder.tee(p.id, w.ports.vfx, remoteAudio(w.ports.audio, controller));
    p.slot = w.roster.add(controller, combat, {
      id: p.id,
      drive: 'remote',
      ports: {
        ...ports,
        rng: p.rng,
        // Sus disparos, contra lo que veía él.
        shotCast: (o, d, range, out, exclude) => this.history.cast(w.physics, p.held.view, o, d, range, out, exclude),
      },
    });
    p.state = 'playing';
    this.placePeer(p, at, r.yaw);
    const h = this.hudState;
    if (h.zone) this.send(p, { t: 'hud', k: 'zone', text: h.zone });
    if (h.objective) this.send(p, { t: 'hud', k: 'objective', text: h.objective });
    if (!h.combat) this.send(p, { t: 'hud', k: 'combat', on: false });
    this.opts.onPlayersChanged?.();
  }

  /** Coloca a un invitado (aparición, reaparición o corrección): vida nueva y lo que estaba en camino ya no vale. */
  private placePeer(p: Peer, at: Vector3, yaw: number): void {
    p.epoch++;
    p.queue.length = 0;
    p.buffering = true;
    p.accepted.copy(at);
    p.sinceAccepted = 0;
    this.sendEvent(p, { e: 'spawn', x: at.x, y: at.y, z: at.z, yaw, epoch: p.epoch });
  }

  private stepPeer(p: Peer, dt: number): void {
    const slot = p.slot!;
    const h = p.held;
    // Lo pulsado vale un paso; lo mantenido sigue mientras no llegue otro.
    h.firePressed = h.reloadPressed = h.takedownPressed = h.focusPressed = false;
    h.select = null;
    h.cycle = 0;
    let moved = false;
    while (p.queue.length && p.queue[0]!.epoch !== p.epoch) p.queue.shift();
    if (p.buffering && p.queue.length >= PREBUFFER) p.buffering = false;
    if (!p.buffering && p.queue.length) {
      const n = p.queue.length > CATCH_UP ? 2 : 1;
      for (let i = 0; i < n; i++) mergeFrame(h, p.queue.shift()!);
      p.ack = h.seq;
      moved = true;
    } else if (!p.buffering) p.buffering = true;
    const c = slot.controller;
    p.sinceAccepted++;
    if (moved && !slot.combat.dead) {
      if (this.plausible(p, h.move, c)) {
        c.applyNet(h.move);
        p.accepted.set(h.move.x, h.move.y, h.move.z);
        p.sinceAccepted = 0;
      } else {
        // No cuadra (trampa o un salto de red enorme): vuelve a donde lo tenía el anfitrión.
        p.rejected++;
        c.prevFeet.copy(c.feet);
        this.placePeer(p, c.feet, c.yaw);
      }
    } else {
      c.prevFeet.copy(c.feet);
      c.prevYaw = c.yaw;
    }
    const ci = slot.combatIntent;
    ci.fireHeld = h.fireHeld;
    ci.firePressed = h.firePressed;
    ci.aim = h.aim;
    ci.reloadPressed = h.reloadPressed;
    ci.takedownPressed = h.takedownPressed;
    ci.focusPressed = false;
    ci.select = h.select;
    ci.cycle = h.cycle;
    ci.aimFrom.set(h.aimFrom.x, h.aimFrom.y, h.aimFrom.z);
    ci.aimDir.set(h.aimDir.x, h.aimDir.y, h.aimDir.z);
    // La misma semilla que usó el invitado en ese paso: los perdigones salen igual en los dos equipos.
    p.rng.reseed(shotSeed(p.id, p.ack));
    slot.combat.fixedUpdate(dt, ci, slot.ctx);
  }

  /** ¿Puede haber llegado ahí desde la última posición aceptada? (velocidad, altura y sin meterse en una pared) */
  private plausible(p: Peer, m: MoveNet, c: PlayerController): boolean {
    const k = p.sinceAccepted / 60;
    const a = p.accepted;
    const dy = m.y - a.y;
    if (Math.hypot(m.x - a.x, m.z - a.z) > MAX_SPEED * k + 0.75) return false;
    if (dy > MAX_RISE * k + RISE_SLACK || dy < -(MAX_FALL * k + 1)) return false;
    if (m.y < c.killY) return false;
    const half = m.posture === 'stand' ? STAND_HALF : CROUCH_HALF;
    _center.set(m.x, m.y + half + PLAYER_RADIUS, m.z);
    return this.world!.physics.overlapsCapsule(_center, PLAYER_RADIUS - 0.08, half - 0.04, QueryGroups.STATIC, c.collider) === null;
  }

  private onRevive(s: PlayerSlot): void {
    const p = this.peers.find((x) => x.slot === s);
    if (p) this.placePeer(p, s.controller.feet, s.controller.yaw);
  }

  private listenerFor(p: Peer): CombatListener {
    return {
      marker: (kind) => this.sendEvent(p, { e: 'marker', kind }),
      award: (action, points) => this.sendEvent(p, { e: 'award', action, points }),
      pickup: (kind) => this.sendEvent(p, { e: 'pickup', kind }),
      hurt: (enemy, damage) => {
        const f = enemy.feet;
        const me = p.slot?.controller.feet ?? f;
        this.sendEvent(p, { e: 'hurt', x: f.x, y: f.y, z: f.z, damage, enemy: enemy.def.type, distance: f.distanceTo(me) });
      },
      died: () => {
        this.sendEvent(p, { e: 'died' });
        if (p.slot) this.opts.onGuestDied?.(p.slot);
      },
    };
  }

  // ================================================================ instantáneas
  private sendSnapshots(w: HostWorld): void {
    const fx = this.opts.recorder.take();
    const playing = this.peers.filter((p) => p.state === 'playing' && p.slot);
    if (playing.length === 0) return;
    const slots = w.roster.slots;
    const players: PlayerNet[] = [];
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i]!;
      const pn = (this.playerPool[i] ??= { id: 0, move: emptyMoveNet(), look: s.look });
      pn.id = s.id;
      s.controller.writeNet(pn.move);
      pn.look = s.look;
      players.push(pn);
    }
    const es = w.enemies.enemies;
    const enemies: EnemyNet[] = [];
    for (let i = 0; i < es.length; i++) enemies.push(es[i]!.writeNet((this.enemyPool[i] ??= emptyEnemyNet())));
    const civilians: CivilianNet[] = [];
    const cs = w.civilians?.list ?? [];
    for (let i = 0; i < cs.length; i++) civilians.push(cs[i]!.writeNet((this.civPool[i] ??= emptyCivilianNet())));
    const pickups: PickupNet[] = [];
    for (const it of w.pickups.items) if (!it.taken) pickups.push({ id: it.id, kind: it.kind, x: it.pos.x, y: it.pos.y, z: it.pos.z });
    const body = encodeSnapshotBody({ tick: this.tick, players, enemies, civilians, pickups, fx, mission: this.missionNet });
    for (const p of playing) p.link.send('sim', withOwner(body, this.ownerOf(p)));
  }

  private ownerOf(p: Peer): OwnerNet {
    const c = p.slot!.combat;
    const v = c.vitals;
    return {
      ack: p.ack,
      epoch: p.epoch,
      health: v.health,
      armor: v.armor,
      maxHealth: v.maxHealth,
      maxArmor: v.maxArmor,
      dead: c.dead,
      score: c.style.score,
      multiplier: c.style.multiplier,
      gauge: c.style.gauge,
      ammo: c.loadout.map((id) => {
        const ws = c.weapons.get(id)!;
        return { weapon: id, mag: ws.mag, reserve: ws.reserve };
      }),
    };
  }

  // ================================================================ utilidades
  private freeId(): number {
    for (let id = 1; id < MAX_PLAYERS; id++) if (!this.peers.some((p) => p.id === id)) return id;
    return -1;
  }

  private reject(p: Peer, why: 'version' | 'full'): void {
    this.send(p, { t: 'reject', why });
    this.drop(p);
  }

  private drop(p: Peer): void {
    const i = this.peers.indexOf(p);
    if (i < 0) return;
    this.peers.splice(i, 1);
    if (p.slot && this.world) this.world.roster.remove(p.slot);
    p.slot = null;
    p.link.close();
    if (p.id > 0) {
      this.opts.onGuestLeft?.(p.id);
      this.broadcastLobby();
    }
  }

  private broadcastLobby(): void {
    const ids = this.lobbyIds;
    for (const p of this.peers) if (p.state !== 'hello') this.send(p, { t: 'lobby', ids });
    this.opts.onPlayersChanged?.();
  }

  private broadcast(m: HostCtl): void {
    for (const p of this.peers) if (p.state === 'loading' || p.state === 'playing') this.send(p, m);
  }

  private sendEvent(p: Peer, ev: OwnerEvent): void {
    this.send(p, { t: 'me', ev });
  }

  private send(p: Peer, m: HostCtl): void {
    if (p.link.open) p.link.send('ctl', encodeHostCtl(m));
  }
}

/** Junta el paso recibido con lo que ya se aplicó: el movimiento y el apuntado, los del último; lo pulsado, sumado. */
function mergeFrame(h: InputFrame, f: InputFrame): void {
  h.seq = f.seq;
  h.view = f.view;
  h.epoch = f.epoch;
  const m = h.move;
  Object.assign(m, f.move);
  m.cover = f.move.cover ? { ...f.move.cover } : null;
  h.fireHeld = f.fireHeld;
  h.firePressed ||= f.firePressed;
  h.aim = f.aim;
  h.reloadPressed ||= f.reloadPressed;
  h.takedownPressed ||= f.takedownPressed;
  h.focusPressed ||= f.focusPressed;
  h.select = f.select ?? h.select;
  h.cycle = f.cycle || h.cycle;
  h.aimFrom.x = f.aimFrom.x;
  h.aimFrom.y = f.aimFrom.y;
  h.aimFrom.z = f.aimFrom.z;
  h.aimDir.x = f.aimDir.x;
  h.aimDir.y = f.aimDir.y;
  h.aimDir.z = f.aimDir.z;
}
