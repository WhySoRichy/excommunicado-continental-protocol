import { describe, expect, it } from 'vitest';
import { bell, cadence, footStep, type LegAngles, legFoot, SHIN_LEN, smooth, solveArm, solveLeg, THIGH_LEN, footPitch } from '../../src/entities/rigMath';

const leg: LegAngles = { thigh: 0, shin: 0 };

describe('rig: cinemática inversa de la pierna', () => {
  it('el pie llega al objetivo en todo el rango alcanzable', () => {
    for (let f = -0.5; f <= 0.8; f += 0.1) {
      for (let d = 0.2; d <= 0.9; d += 0.1) {
        if (Math.hypot(f, d) > THIGH_LEN + SHIN_LEN - 0.02) continue;
        const foot = legFoot(solveLeg(f, d, leg));
        expect(foot.forward).toBeCloseTo(f, 5);
        expect(foot.down).toBeCloseTo(d, 5);
      }
    }
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
