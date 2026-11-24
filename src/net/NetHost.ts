import { Vector3 } from 'three';
import type { EnemyManager } from '../combat/EnemyManager';
import type { Grenades } from '../combat/Grenades';
import type { CombatListener, PlayerCombat } from '../combat/PlayerCombat';
import type { Pickups } from '../combat/Pickups';
import { type PlayerRoster, type PlayerSlot, remoteAudio } from '../combat/PlayerRoster';
import type { CombatAudio, CombatVfx } from '../combat/ports';
import { Rng } from '../core/rng';
import { type CivilianManager, type CivilianNet, emptyCivilianNet } from '../entities/Civilian';
import { emptyEnemyNet, type EnemyNet } from '../entities/Enemy';
import { CROUCH_HALF, emptyMoveNet, MOVE, type MoveNet, PLAYER_RADIUS, type PlayerController, STAND_HALF } from '../entities/PlayerController';
import { DEFAULT_LOADOUT, type Loadout, normalizeLoadout, type UpgradeId } from '../combat/weapons';
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
  type GrenadeNet,
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
  readonly grenades: Grenades;
  /** Los puertos de verdad de este equipo (sin el registro de efectos): lo que ve y oye el anfitrión. */
  readonly ports: { vfx: CombatVfx; audio: CombatAudio };
  /** El cuerpo y el combate de un invitado, con sus mejoras y su equipo (aún fuera del registro). */
  createPlayer(at: Vector3, yaw: number, upgrades: ReadonlySet<UpgradeId>, loadout: Loadout): { controller: PlayerController; combat: PlayerCombat };
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
  /** Un invitado se fue (`dropped`: se cortó sin despedirse y su plaza queda guardada un rato). */
  onGuestLeft?(id: number, dropped: boolean): void;
  /** Un invitado quiere usar un objeto de la misión: el juego comprueba que pueda (alcance, que siga sin usar). */
  onInteract?(slot: PlayerSlot, id: string): void;
}

/** Sin noticias de un invitado durante este tiempo (ms), se le da por ido. */
export const PEER_TIMEOUT = 8000;
/** Lo que se guarda la plaza de quien se corta sin despedirse (ms). */
export const REJOIN_WINDOW = 60_000;
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
  /** Su equipo, saneado con sus mejoras: lo lleva desde la siguiente vez que aparece. */
  loadout: Loadout;
  /** Contraseña para recuperar la plaza tras un corte. */
  token: string;
  /** El combate que tenía antes del corte (salud, munición, estilo): lo recupera al volver. */
  restore: PlayerCombat | null;
  /** Se despidió (`bye`): su plaza no se guarda. */
  leaving: boolean;
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
  /** Última petición de usar un objeto (ms): una cada medio segundo como mucho. */
  lastInteract: number;
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
  /** Plazas de quien se cortó sin despedirse: su id, su contraseña, hasta cuándo y su combate. */
  private readonly reserved: Array<{ id: number; token: string; until: number; combat: PlayerCombat | null }> = [];
  /** Azar de las contraseñas (cada partida, distinto: la semilla sale del reloj). */
  private readonly tokenRng = new Rng((Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0);
  private world: HostWorld | null = null;
  private level: LevelId | null = null;
  private mission: MissionId | null = null;
  /** Pasos simulados desde que empezó el nivel (el reloj de las instantáneas). */
  private simTick = 0;
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
  /** El equipo con el que aparecerá un invitado (para las pruebas y la sala). */
  peerLoadout(id: number): Loadout | null {
    return this.peers.find((p) => p.id === id)?.loadout ?? null;
  }

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
      loadout: { ...DEFAULT_LOADOUT },
      token: '',
      restore: null,
      leaving: false,
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
      lastInteract: -1e9,
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
    this.simTick = 0;
    this.history.clear();
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
    // Los textos de la misión eran de este nivel (el director del siguiente pondrá los suyos).
    this.hudState.objective = '';
    this.hudState.zone = '';
    this.hudState.combat = true;
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
    this.tick();
    for (const p of this.peers) if (p.state === 'playing' && p.slot) this.stepPeer(p, dt);
  }

  /** Latido (también en la sala): suelta a quien lleva demasiado sin dar señales (una pestaña cerrada, un corte). */
  tick(): void {
    const now = this.opts.now();
    for (let i = this.reserved.length - 1; i >= 0; i--) if (this.reserved[i]!.until <= now) this.reserved.splice(i, 1);
    for (const p of this.peers.slice()) if (now - p.lastHeard > PEER_TIMEOUT) this.drop(p);
  }

  /** Al terminar el paso: guarda el pasado para los disparos y, cada tres pasos, envía la instantánea. */
  endStep(): void {
    const w = this.world;
    if (!w) return;
    this.simTick++;
    this.history.record(this.simTick, w.enemies.enemies, w.civilians?.list ?? null);
    if (this.simTick % SNAPSHOT_TICKS === 0) this.sendSnapshots(w);
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

  /** Coloca a un invitado con autoridad (como al reaparecer): para la misión, para las pruebas. */
  placeGuest(id: number, at: Vector3, yaw: number): boolean {
    const p = this.peers.find((x) => x.id === id && x.slot);
    if (!p?.slot) return false;
    p.slot.controller.revive(at, yaw);
    this.placePeer(p, at, yaw);
    return true;
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
        // Vuelve tras un corte: su plaza, si la contraseña es la buena y aún no ha caducado.
        const now = this.opts.now();
        const back = m.rejoin ? this.reserved.find((r) => r.id === m.rejoin!.id && r.token === m.rejoin!.token && r.until > now) : undefined;
        if (back) this.reserved.splice(this.reserved.indexOf(back), 1);
        const id = back ? back.id : this.freeId();
        if (id < 0) {
          this.reject(p, 'full');
          return;
        }
        p.id = id;
        p.upgrades = new Set(m.upgrades);
        p.loadout = normalizeLoadout(m.loadout, p.upgrades);
        p.restore = back?.combat ?? null;
        p.token = this.newToken();
        p.state = 'lobby';
        this.send(p, { t: 'welcome', id, token: p.token });
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
      case 'loadout':
        // Vale para la siguiente vez que aparezca: a mitad de partida no se cambian las armas en la mano.
        p.loadout = normalizeLoadout(m.loadout, p.upgrades);
        return;
      case 'interact': {
        const now = this.opts.now();
        if (p.state !== 'playing' || !p.slot || p.slot.combat.dead || now - p.lastInteract < 500) return;
        p.lastInteract = now;
        this.opts.onInteract?.(p.slot, m.id);
        return;
      }
      case 'bye':
        p.leaving = true;
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
    const made = w.createPlayer(at, r.yaw, p.upgrades, p.loadout);
    const controller = made.controller;
    // Si vuelve tras un corte, con el combate que tenía (salud, munición, estilo); si había caído, ya repuesto.
    const combat = p.restore ?? made.combat;
    p.restore = null;
    if (combat.dead) combat.respawnReset();
    combat.allowFocus = false;
    combat.listener = this.listenerFor(p);
    const head = new Vector3();
    const ports = this.opts.recorder.tee(p.id, w.ports.vfx, remoteAudio(w.ports.audio, controller), () =>
      head.set(controller.feet.x, controller.feet.y + 1.5, controller.feet.z),
    );
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
    h.firePressed = h.reloadPressed = h.takedownPressed = h.focusPressed = h.gearPressed = false;
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
    ci.gearPressed = h.gearPressed;
    ci.gearHeld = h.gearHeld;
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
    const grenades: GrenadeNet[] = w.grenades.items.map((g) => ({ id: g.id, kind: g.kind, owner: g.owner, x: g.pos.x, y: g.pos.y, z: g.pos.z }));
    const body = encodeSnapshotBody({ tick: this.simTick, players, enemies, civilians, pickups, grenades, fx, mission: this.missionNet });
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
      gear: c.gearLeft,
      ammo: c.loadout.map((id) => {
        const ws = c.weapons.get(id)!;
        return { weapon: id, mag: ws.mag, reserve: ws.reserve };
      }),
    };
  }

  // ================================================================ utilidades
  /** El primer id libre: ni en uso ni guardado para alguien que se cortó. */
  private freeId(): number {
    const now = this.opts.now();
    for (let id = 1; id < MAX_PLAYERS; id++) if (!this.peers.some((p) => p.id === id) && !this.reserved.some((r) => r.id === id && r.until > now)) return id;
    return -1;
  }

  private newToken(): string {
    let s = '';
    for (let i = 0; i < 16; i++) s += 'abcdefghijkmnpqrstuvwxyz23456789'[Math.floor(this.tokenRng.next() * 32)];
    return s;
  }

  private reject(p: Peer, why: 'version' | 'full'): void {
    this.send(p, { t: 'reject', why });
    this.drop(p);
  }

  private drop(p: Peer): void {
    const i = this.peers.indexOf(p);
    if (i < 0) return;
    this.peers.splice(i, 1);
    // Se cortó sin despedirse: su plaza y su combate se guardan un rato por si vuelve.
    const dropped = p.id > 0 && !p.leaving && !this.closed && p.token !== '';
    if (dropped) this.reserved.push({ id: p.id, token: p.token, until: this.opts.now() + REJOIN_WINDOW, combat: p.slot?.combat ?? p.restore });
    if (p.slot && this.world) this.world.roster.remove(p.slot);
    p.slot = null;
    p.link.close();
    if (p.id > 0) {
      this.opts.onGuestLeft?.(p.id, dropped);
      this.broadcastLobby();
    }
  }

  private broadcastLobby(): void {
    const ids = this.lobbyIds;
    for (const p of this.peers) if (p.state !== 'hello') this.send(p, { t: 'lobby', ids, level: this.level });
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
  h.gearPressed ||= f.gearPressed;
  h.gearHeld = f.gearHeld;
  h.select = f.select ?? h.select;
  h.cycle = f.cycle || h.cycle;
  h.aimFrom.x = f.aimFrom.x;
  h.aimFrom.y = f.aimFrom.y;
  h.aimFrom.z = f.aimFrom.z;
  h.aimDir.x = f.aimDir.x;
  h.aimDir.y = f.aimDir.y;
  h.aimDir.z = f.aimDir.z;
}
