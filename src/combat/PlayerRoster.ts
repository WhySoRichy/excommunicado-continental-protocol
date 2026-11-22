import { Vector3 } from 'three';
import type { Enemy, PlayerTarget } from '../entities/Enemy';
import { emptyIntent, type PlayerController, type PlayerIntent } from '../entities/PlayerController';
import { type CombatCtx, type CombatIntent, emptyCombatIntent, type PlayerCombat } from './PlayerCombat';
import { makePlayerTarget, updatePlayerTarget } from './playerTarget';
import { type CombatAudio, type CombatCamera, SILENT_AUDIO, STILL_CAMERA } from './ports';

/** Segundos que tarda en reaparecer un jugador que no es el local (el local reaparece desde su pantalla de muerte). */
export const REMOTE_RESPAWN = 5;

/** La plaza de un jugador en la partida: su cuerpo, su combate, lo que ven de él los enemigos y lo que pide hacer. */
export interface PlayerSlot {
  /** Estable durante la partida; 0 es el jugador local. */
  readonly id: number;
  /** El que juega en este equipo: el que tiene cámara, HUD y avisos de primera persona. */
  readonly local: boolean;
  readonly controller: PlayerController;
  readonly combat: PlayerCombat;
  readonly target: PlayerTarget;
  /** Su contexto de combate: el mundo es común; el cuerpo, la cámara y el sonido, suyos. */
  readonly ctx: CombatCtx;
  /** Lo que pide hacer en el paso siguiente (el local lo rellena el juego desde el teclado; el resto, su origen). */
  readonly intent: PlayerIntent;
  readonly combatIntent: CombatIntent;
  /** Segundos que lleva caído (solo los que no son el local: el registro los hace reaparecer). */
  downFor: number;
}

/**
 * El sonido de un jugador que no es el local: sus disparos suenan donde está; lo de primera persona (marcadores de
 * impacto, recarga, Foco, interfaz) es solo para quien juega en este equipo.
 */
function remoteAudio(audio: CombatAudio, body: PlayerController): CombatAudio {
  const at = new Vector3();
  return {
    ...SILENT_AUDIO,
    shot: (kind) => audio.shot(kind, at.set(body.feet.x, body.feet.y + 1.4, body.feet.z)),
  };
}

/**
 * Los jugadores de una partida (fase 2 de docs/ESCALABILIDAD.md). Da a cada uno su plaza, mantiene la lista de
 * objetivos que leen los enemigos, lleva cada disparo enemigo al combate del jugador alcanzado, simula a los que no
 * son el local y los hace reaparecer. Solo simulación: corre igual sin pantalla.
 */
export class PlayerRoster {
  readonly slots: PlayerSlot[] = [];
  /** Un objetivo por jugador, en el orden de sus plazas. */
  readonly targets: PlayerTarget[] = [];
  /** Dónde reaparecen los que no son el local: el último punto de control (lo mantiene el juego al día). */
  readonly respawn = { pos: new Vector3(), yaw: 0 };
  /** Modo dios de QA: los disparos enemigos no hacen daño a nadie. */
  god = false;

  /** `world`: lo que comparten todos los jugadores (física, enemigos, efectos, sonido...). */
  constructor(private readonly world: Omit<CombatCtx, 'player' | 'camera'>) {}

  /**
   * Añade un jugador. El local recibe la cámara (retroceso y sacudidas) y todo el sonido; el resto, sin cámara y solo
   * con el sonido de sus disparos.
   */
  add(controller: PlayerController, combat: PlayerCombat, opts: { local?: boolean; camera?: CombatCamera } = {}): PlayerSlot {
    const id = this.slots.length;
    const local = opts.local ?? false;
    const slot: PlayerSlot = {
      id,
      local,
      controller,
      combat,
      target: makePlayerTarget(id, controller),
      ctx: {
        ...this.world,
        audio: local ? this.world.audio : remoteAudio(this.world.audio, controller),
        player: controller,
        camera: opts.camera ?? STILL_CAMERA,
      },
      intent: emptyIntent(),
      combatIntent: emptyCombatIntent(),
      downFor: 0,
    };
    this.slots.push(slot);
    this.targets.push(slot.target);
    return slot;
  }

  /** Actualiza lo que los enemigos ven de cada jugador (sin asignaciones). */
  updateTargets(dt: number): readonly PlayerTarget[] {
    for (const s of this.slots) updatePlayerTarget(s.target, s.controller, s.combat, dt, this.god);
    return this.targets;
  }

  /** Un enemigo disparó a un jugador: si acertó, el daño va a ese jugador. */
  shotAt(enemy: Enemy, target: PlayerTarget, hit: boolean, damage: number): void {
    if (!hit || this.god) return;
    const s = this.slots[target.id];
    if (s) s.combat.takeHit(enemy, damage, s.ctx);
  }

  /**
   * Simula un paso de los jugadores con id ≥ `from` con lo que pide su intención (el local lo mueve el juego). Los que
   * no son el local y llevan `REMOTE_RESPAWN` segundos caídos reaparecen en `respawn`.
   */
  step(dt: number, from = 1): void {
    for (let i = from; i < this.slots.length; i++) {
      const s = this.slots[i]!;
      if (!s.local && s.combat.dead) {
        s.downFor += dt;
        if (s.downFor >= REMOTE_RESPAWN) this.revive(s);
      }
      s.controller.fixedUpdate(dt, s.intent);
      s.combat.fixedUpdate(dt, s.combatIntent, s.ctx);
    }
  }

  /** La parte en tiempo real del combate (Foco, pausa de impacto, retroceso) de los que no son el local. */
  frameUpdate(realDt: number): void {
    for (const s of this.slots) if (!s.local) s.combat.frameUpdate(realDt, s.ctx.audio);
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
  }
}
