import { describe, expect, it } from 'vitest';
import {
  bell,
  bodyYaw,
  cadence,
  footPitch,
  footStep,
  type LegAngles,
  legFoot,
  lookAngles,
  lookWeight,
  SHIN_LEN,
  smooth,
  smoother,
  solveArm,
  spring,
  solveLeg,
  THIGH_LEN,
  updateBodyYaw,
} from '../../src/entities/rigMath';

const leg: LegAngles = { thigh: 0, shin: 0 };

describe('rig: cinemática inversa de la pierna', () => {
  it('el pie llega al objetivo en todo el rango alcanzable', () => {
    for (let f = -0.5; f <= 0.8; f += 0.1) {
      for (let d = 0.2; d <= 0.9; d += 0.1) {
        const r = Math.hypot(f, d);
        if (r > THIGH_LEN + SHIN_LEN - 0.02) continue;
        const foot = legFoot(solveLeg(f, d, leg));
        if (r <= THIGH_LEN + SHIN_LEN - 0.07) {
          expect(foot.forward).toBeCloseTo(f, 5);
          expect(foot.down).toBeCloseTo(d, 5);
        } else {
          // Al final del alcance la pierna se satura con suavidad: el pie se queda a menos de 2 cm, en la misma dirección.
          expect(Math.hypot(foot.forward - f, foot.down - d)).toBeLessThan(0.02);
        }
      }
    }
  });

  it('al estirarse, la rodilla llega a su tope sin frenar en seco', () => {
    // Pie alejándose en línea recta: la flexión de la rodilla debe cambiar de forma continua, sin un codo al llegar al tope.
    let prev = solveLeg(0, 0.8, leg).shin;
    let prevStep = 0;
    let maxJump = 0;
    for (let d = 0.801; d <= 1.0; d += 0.001) {
      const s = solveLeg(0, d, leg).shin;
      const step = s - prev;
      maxJump = Math.max(maxJump, Math.abs(step - prevStep));
      prev = s;
      prevStep = step;
    }
    // Con el tope seco el codo era de 0,013 rad.
    expect(maxJump).toBeLessThan(0.006);
  });

  it('la rodilla nunca se dobla hacia atrás', () => {
    for (let f = -0.5; f <= 0.8; f += 0.05) {
      for (let d = 0.15; d <= 0.95; d += 0.05) {
        const a = solveLeg(f, d, leg);
        expect(a.shin).toBeLessThanOrEqual(0);
        // La rodilla queda por delante de la línea cadera-pie.
        const kneeF = THIGH_LEN * Math.sin(a.thigh);
        const kneeD = THIGH_LEN * Math.cos(a.thigh);
        expect(kneeF * d - kneeD * f).toBeGreaterThanOrEqual(-1e-9);
      }
    }
  });

  it('agachado: los pies siguen en el suelo y las rodillas van hacia delante', () => {
    const a = solveLeg(0.16, 0.56, leg);
    expect(a.thigh).toBeGreaterThan(0.8);
    expect(a.shin).toBeLessThan(-1.2);
    expect(legFoot(a).down).toBeCloseTo(0.56, 5);
  });

  it('un objetivo fuera de alcance estira la pierna hacia él sin NaN', () => {
    const a = solveLeg(2, 2, leg);
    expect(Number.isFinite(a.thigh) && Number.isFinite(a.shin)).toBe(true);
    expect(a.shin).toBeGreaterThan(-0.4);
    expect(a.thigh).toBeCloseTo(Math.PI / 4, 0);
    const b = solveLeg(0, 0, leg);
    expect(Number.isFinite(b.thigh) && Number.isFinite(b.shin)).toBe(true);
  });
});

describe('rig: ciclo de marcha', () => {
  it('el pie apoya mientras retrocede y se levanta mientras avanza', () => {
    const s = { along: 0, lift: 0 };
    let prev = footStep(0, 0.3, 0.1, s).along;
    for (let p = 0.1; p < Math.PI; p += 0.1) {
      footStep(p, 0.3, 0.1, s);
      expect(s.lift).toBe(0);
      expect(s.along).toBeLessThan(prev);
      prev = s.along;
    }
    for (let p = Math.PI + 0.1; p < 2 * Math.PI; p += 0.1) {
      footStep(p, 0.3, 0.1, s);
      expect(s.lift).toBeGreaterThan(0);
      expect(s.along).toBeGreaterThan(prev);
      prev = s.along;
    }
  });

  it('la cadencia sube con la velocidad y las curvas auxiliares están acotadas', () => {
    expect(cadence(7)).toBeGreaterThan(cadence(2.6));
    expect(cadence(100)).toBe(cadence(7));
    expect(bell(0)).toBeCloseTo(0);
    expect(bell(0.5)).toBeCloseTo(1);
    expect(bell(2)).toBeCloseTo(0);
    expect(smooth(0, 1, -1)).toBe(0);
    expect(smooth(0, 1, 0.5)).toBeCloseTo(0.5);
    expect(smooth(0, 1, 3)).toBe(1);
  });
});

describe('IK del brazo y cabeceo del pie', () => {
  it('la mano queda a la distancia pedida del hombro', () => {
    const out = { elbow: 0, hy: 0, hz: 0 };
    for (const d of [0.15, 0.3, 0.45, 0.6]) {
      const a = solveArm(d, 0.32, 0.315, out);
      expect(Math.hypot(a.hy, a.hz)).toBeCloseTo(d, 5);
      expect(a.elbow).toBeGreaterThan(0);
      // El codo flexiona hacia delante: la mano nunca queda por detrás del hombro.
      expect(a.hz).toBeLessThanOrEqual(0);
    }
  });

  it('fuera de alcance, el brazo se estira', () => {
    const a = solveArm(2, 0.32, 0.315, { elbow: 0, hy: 0, hz: 0 });
    expect(a.elbow).toBeLessThan(0.3);
    expect(Math.hypot(a.hy, a.hz)).toBeGreaterThan(0.62);
  });

  it('el pie va plano en medio del apoyo y con la punta arriba antes de pisar', () => {
    expect(footPitch(Math.PI * 0.4)).toBeCloseTo(0, 5);
    expect(footPitch(Math.PI * 0.98)).toBeLessThan(-0.3);
    expect(footPitch(Math.PI * 1.8)).toBeGreaterThan(0.1);
    expect(Math.abs(footPitch(Math.PI * 2 - 1e-6))).toBeLessThan(0.02);
  });
});

describe('mirada de la cabeza', () => {
  const out = { yaw: 0, pitch: 0 };
  it('de frente no gira; a la izquierda gira en positivo; arriba inclina en positivo', () => {
    expect(lookAngles(0, 1.6, 0, 0, 0, 1.6, -5, out).yaw).toBeCloseTo(0, 6);
    expect(lookAngles(0, 1.6, 0, 0, -5, 1.6, 0, out).yaw).toBeCloseTo(Math.PI / 2, 6);
    expect(lookAngles(0, 1.6, 0, 0, 5, 1.6, 0, out).yaw).toBeCloseTo(-Math.PI / 2, 6);
    expect(lookAngles(0, 1.6, 0, 0, 0, 6.6, -5, out).pitch).toBeCloseTo(Math.PI / 4, 6);
  });

  it('el giro es relativo al cuerpo y queda entre −π y π', () => {
    // Cuerpo mirando a la izquierda (+π/2); el punto, a su derecha en mundo, queda justo delante.
    expect(lookAngles(0, 0, 0, Math.PI / 2, -5, 0, 0, out).yaw).toBeCloseTo(0, 6);
    const a = lookAngles(0, 0, 0, 3, 0.1, 0, 5, out).yaw;
    expect(Math.abs(a)).toBeLessThanOrEqual(Math.PI);
  });

  it('la cabeza no persigue lo que queda a la espalda', () => {
    expect(lookWeight(0)).toBe(1);
    expect(lookWeight(1.2)).toBe(1);
    expect(lookWeight(-Math.PI)).toBe(0);
    expect(lookWeight(1.9)).toBeGreaterThan(0);
    expect(lookWeight(1.9)).toBeLessThan(1);
  });
});

describe('suavizado sin tirones', () => {
  it('el muelle llega sin rebote y su velocidad no salta al cambiar el objetivo', () => {
    // `damp` arranca a toda velocidad en el primer fotograma; el muelle crítico, casi parado.
    const s = { x: 0, v: 0 };
    const dt = 1 / 60;
    spring(s, 1, 12, dt);
    expect(s.v, 'arranque suave').toBeLessThan(3);
    let max = 0;
    for (let i = 0; i < 120; i++) max = Math.max(max, spring(s, 1, 12, dt));
    expect(max, 'sin pasarse').toBeLessThanOrEqual(1 + 1e-9);
    expect(s.x).toBeCloseTo(1, 3);
    // Exacto para cualquier paso: dos medios pasos equivalen a uno entero.
    const a = { x: 0, v: 0 };
    const b = { x: 0, v: 0 };
    spring(a, 1, 12, 0.1);
    spring(b, 1, 12, 0.05);
    spring(b, 1, 12, 0.05);
    expect(a.x).toBeCloseTo(b.x, 9);
    expect(a.v).toBeCloseTo(b.v, 9);
  });

  it('la curva C2 sale y llega con pendiente nula', () => {
    expect(smoother(0, 1, 0)).toBe(0);
    expect(smoother(0, 1, 1)).toBe(1);
    expect(smoother(0, 1, 0.5)).toBeCloseTo(0.5, 9);
    expect(smoother(0, 1, 0.01)).toBeLessThan(1e-4);
  });

  it('el pie despega y se posa con velocidad vertical nula', () => {
    const s = { along: 0, lift: 0 };
    const h = 1e-4;
    for (const p of [Math.PI, 2 * Math.PI]) {
      const a = footStep(p - h, 0.3, 0.1, s).lift;
      const b = footStep(p + h, 0.3, 0.1, s).lift;
      expect(Math.abs(b - a) / (2 * h), `fase ${p.toFixed(2)}`).toBeLessThan(1e-3);
    }
  });
});

describe('giro visual del cuerpo', () => {
  const dt = 1 / 60;
  /** La simulación gira media vuelta a 14 rad/s, como al cambiar de sentido. */
  function halfTurn(aiming: boolean): { maxAcc: number; end: number } {
    const b = bodyYaw();
    let sim = 0;
    let prev = updateBodyYaw(b, sim, aiming, dt);
    let prevV = 0;
    let maxAcc = 0;
    for (let i = 0; i < 60; i++) {
      sim = Math.min(Math.PI, sim + 14 * dt);
      const y = updateBodyYaw(b, sim, aiming, dt);
      const v = (y - prev) / dt;
      maxAcc = Math.max(maxAcc, Math.abs(v - prevV) / dt);
      prev = y;
      prevV = v;
    }
    return { maxAcc, end: prev };
  }

  it('sigue un giro brusco sin tirón y acaba alineado', () => {
    const r = halfTurn(false);
    // La simulación pasa de 0 a 14 rad/s en un fotograma: 840 rad/s².
    expect(r.maxAcc).toBeLessThan(300);
    expect(r.end).toBeCloseTo(Math.PI, 3);
  });

  it('apuntando, el cuerpo va exactamente con la simulación', () => {
    const b = bodyYaw();
    updateBodyYaw(b, 0, true, dt);
    for (let i = 0; i < 30; i++) updateBodyYaw(b, 0, true, dt);
    expect(updateBodyYaw(b, 0.3, true, dt)).toBeCloseTo(0.3, 2);
  });

  it('un teletransporte se aplica de golpe y cruzar ±π no da la vuelta entera', () => {
    const b = bodyYaw();
    updateBodyYaw(b, 0, false, dt);
    expect(updateBodyYaw(b, 2.5, false, dt)).toBeCloseTo(2.5, 6);
    const c = bodyYaw();
    updateBodyYaw(c, Math.PI - 0.05, false, dt);
    const y = updateBodyYaw(c, -Math.PI + 0.05, false, dt);
    // 0,1 rad de giro real, no 2π − 0,1.
    expect(Math.abs(Math.atan2(Math.sin(y - (Math.PI - 0.05)), Math.cos(y - (Math.PI - 0.05))))).toBeLessThan(0.11);
  });
});
