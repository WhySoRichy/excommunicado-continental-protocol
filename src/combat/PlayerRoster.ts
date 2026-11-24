import { Vector3 } from 'three';
import type { Enemy, PlayerTarget } from '../entities/Enemy';
import { emptyIntent, type PlayerController, type PlayerIntent } from '../entities/PlayerController';
import { type CombatCtx, type CombatIntent, emptyCombatIntent, type PlayerCombat } from './PlayerCombat';
import { emptyPlayerLook, fillPlayerLook, type PlayerLook } from './playerLook';
import { makePlayerTarget, updatePlayerTarget } from './playerTarget';
import { type CombatAudio, type CombatCamera, SILENT_AUDIO, STILL_CAMERA } from './ports';

/** Segundos que tarda en reaparecer un jugador que no es el local (el local reaparece desde su pantalla de muerte). */
export const REMOTE_RESPAWN = 5;

/**
 * Quién mueve a un jugador: `local`, el juego de este equipo (teclado y cámara); `sim`, el registro con lo que pide
 * su intención (pruebas); `remote`, la red en el anfitrión (el movimiento y la intención que envía su dueño);
 * `replica`, la red en un invitado (el estado que envía el anfitrión: aquí no se simula nada de él).
 */
export type SlotDrive = 'local' | 'sim' | 'remote' | 'replica';

/** La plaza de un jugador en la partida: su cuerpo, su combate, lo que ven de él los enemigos y lo que pide hacer. */
export interface PlayerSlot {
  /** Estable durante la partida y el mismo en todos los equipos (0 es el anfitrión o el único jugador). */
  readonly id: number;
  /** El que juega en este equipo: el que tiene cámara, HUD y avisos de primera persona. */
  readonly local: boolean;
  readonly drive: SlotDrive;
  readonly controller: PlayerController;
  readonly combat: PlayerCombat;
  readonly target: PlayerTarget;
  /** Su contexto de combate: el mundo es común; el cuerpo, la cámara y el sonido, suyos. */
  readonly ctx: CombatCtx;
  /** Lo que pide hacer en el paso siguiente (el local lo rellena el juego desde el teclado; el resto, su origen). */
  readonly intent: PlayerIntent;
  readonly combatIntent: CombatIntent;
  /** Lo que se ve de él además del movimiento (lo calcula el registro o llega por la red). */
  readonly look: PlayerLook;
  /** Segundos que lleva caído (solo los que no son el local: el registro los hace reaparecer). */
  downFor: number;
}

/** Lo que una plaza puede traer propio en su contexto de combate (la red en el anfitrión y en el invitado). */
export type SlotPorts = Partial<Pick<CombatCtx, 'audio' | 'vfx' | 'rng' | 'shotCast'>>;

export interface AddOptions {
  local?: boolean;
  /** Por defecto `local` para el local y `sim` para el resto. */
  drive?: SlotDrive;
  camera?: CombatCamera;
  /** Id que ya tiene en la partida (un invitado conoce el suyo y el de los demás por el anfitrión). */
  id?: number;
  ports?: SlotPorts;
}

/**
 * El sonido de un jugador que no es el local: sus disparos suenan donde está; lo de primera persona (marcadores de
 * impacto, recarga, Foco, interfaz) es solo para quien juega en este equipo.
 */
export function remoteAudio(audio: CombatAudio, body: PlayerController): CombatAudio {
  const at = new Vector3();
  return {
    ...SILENT_AUDIO,
    shot: (kind) => audio.shot(kind, at.set(body.feet.x, body.feet.y + 1.4, body.feet.z)),
    grenade: (kind) => audio.grenade(kind, at.set(body.feet.x, body.feet.y + 1.4, body.feet.z)),
  };
}

/**
 * Los jugadores de una partida (fases 2 y 3 de docs/ESCALABILIDAD.md). Da a cada uno su plaza, mantiene la lista de
 * objetivos que leen los enemigos, lleva cada disparo enemigo al combate del jugador alcanzado, simula a los que mueve
 * su intención y hace reaparecer a los que no son el local. Solo simulación: corre igual sin pantalla.
 */
export class PlayerRoster {
  readonly slots: PlayerSlot[] = [];
  /** Un objetivo por jugador, en el orden de sus plazas. */
  readonly targets: PlayerTarget[] = [];
  /** Dónde reaparecen los que no son el local: el último punto de control (lo mantiene el juego al día). */
  readonly respawn = { pos: new Vector3(), yaw: 0 };
  /** Modo dios de QA: los disparos enemigos no hacen daño a nadie. */
  god = false;
  /** Un jugador que no es el local acaba de reaparecer (la red se lo cuenta a su dueño). */
  onRevive: ((s: PlayerSlot) => void) | null = null;
  private nextId = 0;

  /** `world`: lo que comparten todos los jugadores (física, enemigos, efectos, sonido...). */
  constructor(private readonly world: Omit<CombatCtx, 'player' | 'camera' | 'playerId'>) {
    // Lo que aturde una granada puntúa a quien la lanzó.
    world.grenades.onBurst = (owner, stunned) => {
      if (stunned > 0) this.byId(owner)?.combat.stunnedEnemies(stunned);
    };
  }

  /**
   * Añade un jugador. El local recibe la cámara (retroceso y sacudidas) y todo el sonido; el resto, sin cámara y solo
   * con el sonido de sus disparos, salvo que traiga sus propios puertos.
   */
  add(controller: PlayerController, combat: PlayerCombat, opts: AddOptions = {}): PlayerSlot {
    const id = opts.id ?? this.nextId;
    if (this.byId(id)) throw new Error(`Ya hay un jugador con el id ${id}`);
    this.nextId = Math.max(this.nextId, id + 1);
    const local = opts.local ?? false;
    const slot: PlayerSlot = {
      id,
      local,
      drive: opts.drive ?? (local ? 'local' : 'sim'),
      controller,
      combat,
      target: makePlayerTarget(id, controller),
      ctx: {
        ...this.world,
        audio: local ? this.world.audio : remoteAudio(this.world.audio, controller),
        ...opts.ports,
        player: controller,
        playerId: id,
        camera: opts.camera ?? STILL_CAMERA,
      },
      intent: emptyIntent(),
      combatIntent: emptyCombatIntent(),
      look: emptyPlayerLook(),
      downFor: 0,
    };
    fillPlayerLook(slot.look, controller, combat);
    this.slots.push(slot);
    this.targets.push(slot.target);
    return slot;
  }

  byId(id: number): PlayerSlot | null {
    for (const s of this.slots) if (s.id === id) return s;
    return null;
  }

  /** Retira a un jugador (se fue de la partida): su cuerpo deja de existir y los enemigos dejan de verlo. */
  remove(slot: PlayerSlot): void {
    const i = this.slots.indexOf(slot);
    if (i < 0) return;
    slot.controller.dispose();
    this.slots.splice(i, 1);
    this.targets.splice(this.targets.indexOf(slot.target), 1);
  }

  /** Actualiza lo que los enemigos ven de cada jugador (sin asignaciones). */
  updateTargets(dt: number): readonly PlayerTarget[] {
    for (const s of this.slots) updatePlayerTarget(s.target, s.controller, s.combat, dt, this.god);
    return this.targets;
  }

  /** Un enemigo disparó a un jugador: si acertó, el daño va a ese jugador. */
  shotAt(enemy: Enemy, target: PlayerTarget, hit: boolean, damage: number): void {
    if (!hit || this.god) return;
    const s = this.byId(target.id);
    if (s) s.combat.takeHit(enemy, damage, s.ctx);
  }

  /**
   * Un paso de los jugadores que simula el registro (los `sim`, con lo que pide su intención; también el local si
   * `includeLocal`). Los que no son el local y llevan `REMOTE_RESPAWN` segundos caídos reaparecen en `respawn`; a los
   * remotos los mueve la red, que aquí solo cuenta su tiempo caído.
   */
  step(dt: number, includeLocal = false): void {
    for (const s of this.slots) {
      if (s.drive === 'replica' || (s.drive === 'local' && !includeLocal)) continue;
      if (!s.local && s.combat.dead) {
        s.downFor += dt;
        if (s.downFor >= REMOTE_RESPAWN) this.revive(s);
      }
      if (s.drive === 'remote') continue;
      s.controller.fixedUpdate(dt, s.intent);
      s.combat.fixedUpdate(dt, s.combatIntent, s.ctx);
    }
  }

  /** Lo que se ve de cada jugador que se simula en este equipo (los de réplica lo traen de la red). */
  updateLooks(): void {
    for (const s of this.slots) if (s.drive !== 'replica') fillPlayerLook(s.look, s.controller, s.combat);
  }

  /** La parte en tiempo real del combate (Foco, pausa de impacto, retroceso) de los que no son el local. */
  frameUpdate(realDt: number): void {
    for (const s of this.slots) if (!s.local && s.drive !== 'replica') s.combat.frameUpdate(realDt, s.ctx.audio);
  }

  /** Suelta los cuerpos físicos de todos los jugadores. */
  dispose(): void {
    for (const s of this.slots) s.controller.dispose();
    this.slots.length = 0;
    this.targets.length = 0;
  }

  private revive(s: PlayerSlot): void {
    s.downFor = 0;
    s.controller.revive(this.respawn.pos, this.respawn.yaw);
    s.combat.respawnReset();
    this.onRevive?.(s);
  }
}
