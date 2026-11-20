import type { Enemy, PlayerTarget } from '../entities/Enemy';
import { emptyIntent, type PlayerController, type PlayerIntent } from '../entities/PlayerController';
import { type CombatCtx, type CombatIntent, emptyCombatIntent, type PlayerCombat } from './PlayerCombat';
import { makePlayerTarget, updatePlayerTarget } from './playerTarget';
import { type CombatCamera, STILL_CAMERA } from './ports';

/** La plaza de un jugador en la partida: su cuerpo, su combate, lo que ven de él los enemigos y lo que pide hacer. */
export interface PlayerSlot {
  /** Estable durante la partida; 0 es el jugador local. */
  readonly id: number;
  readonly controller: PlayerController;
  readonly combat: PlayerCombat;
  readonly target: PlayerTarget;
  /** Su contexto de combate: el mundo es común; el cuerpo y la cámara, suyos. */
  readonly ctx: CombatCtx;
  /** Lo que pide hacer en el paso siguiente (el local lo rellena el juego desde el teclado; el resto, su origen). */
  readonly intent: PlayerIntent;
  readonly combatIntent: CombatIntent;
}

/**
 * Los jugadores de una partida (fase 2 de docs/ESCALABILIDAD.md). Da a cada uno su plaza, mantiene la lista de
 * objetivos que leen los enemigos, lleva cada disparo enemigo al combate del jugador alcanzado y simula a los que no
 * son el local. Solo simulación: corre igual sin pantalla.
 */
export class PlayerRoster {
  readonly slots: PlayerSlot[] = [];
  /** Un objetivo por jugador, en el orden de sus plazas. */
  readonly targets: PlayerTarget[] = [];
  /** Modo dios de QA: los disparos enemigos no hacen daño a nadie. */
  god = false;

  /** `world`: lo que comparten todos los jugadores (física, enemigos, efectos, sonido...). */
  constructor(private readonly world: Omit<CombatCtx, 'player' | 'camera'>) {}

  /** Añade un jugador. La cámara solo recibe retroceso y sacudidas: la del jugador local, o ninguna. */
  add(controller: PlayerController, combat: PlayerCombat, camera: CombatCamera = STILL_CAMERA): PlayerSlot {
    const id = this.slots.length;
    const slot: PlayerSlot = {
      id,
      controller,
      combat,
      target: makePlayerTarget(id, controller),
      ctx: { ...this.world, player: controller, camera },
      intent: emptyIntent(),
      combatIntent: emptyCombatIntent(),
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

  /** Simula un paso de los jugadores con id ≥ `from` con lo que pide su intención (el local lo mueve el juego). */
  step(dt: number, from = 1): void {
    for (let i = from; i < this.slots.length; i++) {
      const s = this.slots[i]!;
      s.controller.fixedUpdate(dt, s.intent);
      s.combat.fixedUpdate(dt, s.combatIntent, s.ctx);
    }
  }

  /** Suelta los cuerpos físicos de todos los jugadores. */
  dispose(): void {
    for (const s of this.slots) s.controller.dispose();
    this.slots.length = 0;
    this.targets.length = 0;
  }
}
