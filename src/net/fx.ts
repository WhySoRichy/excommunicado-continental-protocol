import type { CombatAudio, CombatVfx } from '../combat/ports';
import type { Vec3Like } from '../physics/Physics';
import { FX, type FxTuple, fxTables } from './protocol';

const q = (v: number): number => Math.round(v * 100) / 100;

/**
 * Los efectos que viajan con la instantánea (fase 3): disparos, trazadoras, impactos, fogonazos, alertas. En el
 * anfitrión, los puertos de sonido y efectos de cada fuente (el mundo y cada jugador) pasan por aquí, que los apunta
 * con su autor; el invitado los reproduce menos los suyos, que ya predijo al disparar.
 */
export class FxRecorder {
  private list: number[][] = [];

  /**
   * Puertos que hacen lo de siempre y además apuntan cada efecto con su autor (−1: el mundo). `voice` dice de dónde
   * sale un disparo cuando el puerto no lo dice (el jugador local suena en primera persona, sin posición).
   */
  tee(owner: number, vfx: CombatVfx, audio: CombatAudio, voice?: () => Vec3Like): { vfx: CombatVfx; audio: CombatAudio } {
    const push = (f: number[]): void => {
      this.list.push(f);
    };
    return {
      vfx: {
        impact: (p, n, kind, count = 6) => {
          vfx.impact(p, n, kind, count);
          push([FX.impact, owner, q(p.x), q(p.y), q(p.z), q(n.x), q(n.y), q(n.z), fxTables.impact.indexOf(kind), count]);
        },
        tracer: (from, to, color, width = 0.022) => {
          vfx.tracer(from, to, color, width);
          push([FX.tracer, owner, q(from.x), q(from.y), q(from.z), q(to.x), q(to.y), q(to.z), color, Math.round(width * 1000) / 1000]);
        },
        muzzle: (p, d, player) => {
          vfx.muzzle(p, d, player);
          push([FX.muzzle, owner, q(p.x), q(p.y), q(p.z), q(d.x), q(d.y), q(d.z), player ? 1 : 0]);
        },
        decal: (p, n) => {
          vfx.decal(p, n);
          push([FX.decal, owner, q(p.x), q(p.y), q(p.z), q(n.x), q(n.y), q(n.z)]);
        },
        casing: (p, d, floorY) => {
          vfx.casing(p, d, floorY);
          push([FX.casing, owner, q(p.x), q(p.y), q(p.z), q(d.x), q(d.y), q(d.z), q(floorY ?? p.y - 1.4)]);
        },
      },
      audio: {
        ...audio,
        shot: (kind, pos) => {
          audio.shot(kind, pos);
          const at = pos ?? voice?.();
          if (at) push([FX.shot, owner, fxTables.shot.indexOf(kind), q(at.x), q(at.y), q(at.z)]);
        },
        alert: (pos) => {
          audio.alert(pos);
          if (pos) push([FX.alert, owner, q(pos.x), q(pos.y), q(pos.z)]);
        },
        laserBeep: (progress, pos) => {
          audio.laserBeep(progress, pos);
          if (pos) push([FX.beep, owner, Math.round(progress * 100) / 100, q(pos.x), q(pos.y), q(pos.z)]);
        },
      },
    };
  }

  /** Lo apuntado desde la última vez (y empieza de cero). */
  take(): number[][] {
    const out = this.list;
    this.list = [];
    return out;
  }
}

const _a = { x: 0, y: 0, z: 0 };
const _b = { x: 0, y: 0, z: 0 };

/** Reproduce un efecto recibido (ya validado por el protocolo). */
export function playFx(f: FxTuple, vfx: CombatVfx, audio: CombatAudio): void {
  const set = (o: typeof _a, i: number): typeof _a => {
    o.x = f[i]!;
    o.y = f[i + 1]!;
    o.z = f[i + 2]!;
    return o;
  };
  switch (f[0]) {
    case FX.impact:
      vfx.impact(set(_a, 2), set(_b, 5), fxTables.impact[f[8]!]!, f[9]);
      break;
    case FX.tracer:
      vfx.tracer(set(_a, 2), set(_b, 5), f[8]!, f[9]);
      break;
    case FX.muzzle:
      vfx.muzzle(set(_a, 2), set(_b, 5), f[8] === 1);
      break;
    case FX.decal:
      vfx.decal(set(_a, 2), set(_b, 5));
      break;
    case FX.casing:
      vfx.casing(set(_a, 2), set(_b, 5), f[8]);
      break;
    case FX.shot:
      audio.shot(fxTables.shot[f[2]!]!, set(_a, 3));
      break;
    case FX.alert:
      audio.alert(set(_a, 2));
      break;
    case FX.beep:
      audio.laserBeep(f[2]!, set(_a, 3));
      break;
    default:
      // El protocolo ya descartó los códigos desconocidos.
      break;
  }
}
