import { Quaternion, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { emptyPlayerLook } from '../../src/combat/playerLook';
import { CharacterRig, idlePose, PLAYER_LOOK, type RigPose, type WeaponModel } from '../../src/entities/CharacterRig';
import { grabVictim, PlayerBody } from '../../src/entities/playerPose';
import type { PlayerController } from '../../src/entities/PlayerController';
import { footAt, stepAt, type Stride, strideAt } from '../../src/entities/rig/gait';
import { reach, solveLimb } from '../../src/entities/rig/limbs';
import { FOREARM, GRIP_Y, GRIP_Z, SHIN, THIGH, UPPER_ARM } from '../../src/entities/rig/skeleton';
import { GRIP } from '../../src/entities/rig/weapons';

const DT = 1 / 60;

function settle(rig: CharacterRig, pose: RigPose, frames = 120): void {
  for (let i = 0; i < frames; i++) rig.update(pose, DT);
  rig.root.updateMatrixWorld(true);
}

const make = (weapon: WeaponModel): CharacterRig => new CharacterRig('prueba:animacion', { ...PLAYER_LOOK, weapon });

/** Hacia dónde mira el pecho (en el mundo; el frente del personaje es −Z). */
function chest(rig: CharacterRig): Vector3 {
  return new Vector3(0, 0, -1).applyQuaternion(rig.bones.chest.getWorldQuaternion(new Quaternion()));
}

describe('cinemática inversa de una extremidad', () => {
  const q = new Quaternion();
  /** El extremo que resulta de los giros que da `solveLimb`. */
  const end = (l1: number, l2: number, flex: number, knee: boolean): Vector3 => {
    const lower = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), knee ? -flex : flex);
    return new Vector3(0, -l2, 0)
      .applyQuaternion(lower)
      .add(new Vector3(0, -l1, 0))
      .applyQuaternion(q);
  };

  it('llega a donde se le pide, en cualquier dirección, y dobla hacia donde se le dice', () => {
    const pole = new Vector3(0, 0, -1);
    for (const [l1, l2, knee] of [
      [THIGH, SHIN, true],
      [UPPER_ARM, FOREARM, false],
    ] as const) {
      for (const d of [0.25, 0.4, 0.5]) {
        for (let a = 0; a < 6.2; a += 0.7) {
          const target = new Vector3(Math.sin(a) * 0.6, -0.8, Math.cos(a) * 0.5).normalize().multiplyScalar(d);
          const flex = solveLimb(target, pole, l1, l2, knee, q);
          expect(end(l1, l2, flex, knee).distanceTo(target), `${knee ? 'pierna' : 'brazo'} a ${d} m`).toBeLessThan(0.004);
          expect(flex).toBeGreaterThanOrEqual(0);
          // La articulación queda del lado del polo.
          const joint = new Vector3(0, -l1, 0).applyQuaternion(q);
          const line = target.clone().normalize();
          const bend = joint.addScaledVector(line, -joint.dot(line));
          expect(bend.dot(pole.clone().addScaledVector(line, -pole.dot(line)))).toBeGreaterThan(-1e-6);
        }
      }
    }
  });

  it('fuera de alcance se estira hacia el objetivo, y el final del recorrido es suave', () => {
    const flex = solveLimb(new Vector3(0, -3, 0), new Vector3(0, 0, -1), THIGH, SHIN, true, q);
    expect(flex).toBeLessThan(0.3);
    expect(end(THIGH, SHIN, flex, true).y).toBeCloseTo(-(THIGH + SHIN), 1);
    let prev = reach(0.7, THIGH, SHIN);
    let slope = 1;
    for (let d = 0.701; d < 1; d += 0.001) {
      const r = reach(d, THIGH, SHIN);
      expect(r, 'nunca más de lo que da la pierna').toBeLessThan(THIGH + SHIN);
      expect(Math.abs(r - prev - slope * 0.001), 'sin frenar en seco').toBeLessThan(0.0001);
      slope = (r - prev) / 0.001;
      prev = r;
    }
  });
});

describe('ciclo de marcha', () => {
  const stride: Stride = { length: 1, duty: 0.6, front: 0.3, back: 0.4, lift: 0.1, run: 0 };
  const foot = footAt();

  it('el pie apoyado retrocede justo a la velocidad a la que avanza el cuerpo', () => {
    for (const speed of [0.5, 1.2, 2.6, 4.6, 7]) {
      const s = strideAt(speed, 0, stride);
      expect(s.duty, 'apoyado menos de dos tercios del ciclo').toBeLessThan(0.67);
      const rate = speed / s.length;
      for (let k = 0.1; k < 0.9; k += 0.1) {
        const u = k * s.duty;
        const a = stepAt(u, s, foot).along;
        const b = stepAt(u + 0.001, s, foot).along;
        expect(foot.lift, 'apoyado, la suela no se levanta').toBe(0);
        expect((a - b) / 0.001, `a ${speed} m/s`).toBeCloseTo(speed / rate, 1);
      }
    }
  });

  it('despega y pisa sin saltos, y en el aire se levanta', () => {
    for (const speed of [1.2, 4.6, 7]) {
      const s = strideAt(speed, 0, stride);
      for (const edge of [0, s.duty]) {
        const before = stepAt(edge - 1e-4, s, footAt());
        const after = stepAt(edge + 1e-4, s, footAt());
        expect(Math.abs(after.along - before.along)).toBeLessThan(0.002);
        expect(Math.abs(after.pitch - before.pitch)).toBeLessThan(0.01);
        expect(Math.abs(after.lift - before.lift)).toBeLessThan(0.001);
      }
      expect(stepAt((1 + s.duty) / 2, s, foot).lift).toBeGreaterThan(0.04);
    }
  });

  it('de lado y hacia atrás, pasos más cortos; corriendo, más largos y con más vuelo', () => {
    const at = (v: number, across = 0, back = 0): Stride => ({ ...strideAt(v, 0, stride, across, back) });
    expect(at(2.6, 1).length).toBeLessThan(at(2.6).length * 0.8);
    expect(at(2.6, 0, 1).length).toBeLessThan(at(2.6).length);
    expect(at(7).length).toBeGreaterThan(at(4.6).length);
    expect(at(7).duty).toBeLessThan(0.3);
    expect(at(1.2).duty).toBeGreaterThan(0.5);
  });

  it('corriendo va erguido y hacia delante, no sentado: la rodilla de apoyo no pasa de 55° y el talón sube por detrás', () => {
    for (const speed of [4.6, 7]) {
      const rig = make('pistol');
      const pose = idlePose();
      pose.speed = speed;
      settle(rig, pose);
      const s = rig['gait'].stride;
      let stance = 0;
      let heel = 9;
      for (let i = 0; i < 120; i++) {
        rig.update(pose, DT);
        const u = rig['gait'].u;
        const m = rig.motionSample();
        if (u < s.duty) stance = Math.min(stance, m.shinL!);
        else heel = Math.min(heel, m.shinL!);
      }
      expect(stance, `a ${speed} m/s, apoyada`).toBeGreaterThan(-0.96);
      expect(heel, `a ${speed} m/s, en el aire`).toBeLessThan(-1.5);
      expect(rig.motionSample().torsoX!, 'inclinado hacia delante').toBeLessThan(-0.14);
      rig.dispose();
    }
  });

  it.each([
    ['andando', 1.4, 0],
    ['corriendo', 4.6, 0],
    ['esprintando', 7, 0],
    ['de lado', 2.6, -Math.PI / 2],
    ['hacia atrás', 2.4, Math.PI],
  ])('%s, el personaje no patina', (_name, speed, angle) => {
    const rig = make('pistol');
    const pose = idlePose();
    pose.speed = speed;
    pose.moveAngle = angle;
    settle(rig, pose);
    const s = rig['gait'].stride;
    let slip = 0;
    let n = 0;
    let last: Vector3 | null = null;
    for (let i = 0; i < 240; i++) {
      rig.root.position.x -= Math.sin(angle) * speed * DT;
      rig.root.position.z -= Math.cos(angle) * speed * DT;
      rig.update(pose, DT);
      const k = rig['gait'].u / s.duty;
      // En medio del apoyo: con el pie plano y cargado.
      const planted = k > 0.15 && k < 0.6;
      const at = rig.footSample().left;
      if (planted) expect(at.y, 'la suela, en el suelo').toBeLessThan(0.06);
      if (planted && last) {
        slip += at.distanceTo(last);
        n++;
      }
      last = planted ? at : null;
    }
    expect(n).toBeGreaterThan(5);
    // El cuerpo avanza `speed`: con los pies sueltos patinaría a esa velocidad.
    expect(slip / n / DT, 'metros por segundo que resbala').toBeLessThan(speed * 0.13 + 0.12);
    rig.dispose();
  });
});

describe('posturas', () => {
  it('relajado, de pie casi recto y con el arma baja; en guardia, la levanta con las dos manos', () => {
    const rig = make('pistol');
    const pose = idlePose();
    pose.ready = 0;
    settle(rig, pose);
    expect(rig.motionSample().shinL!, 'rodillas casi estiradas').toBeGreaterThan(-0.4);
    const low = rig.weaponMount.getWorldPosition(new Vector3()).y;
    expect(low, 'el arma, junto al muslo').toBeLessThan(1);
    pose.ready = 1;
    settle(rig, pose);
    expect(rig.weaponMount.getWorldPosition(new Vector3()).y).toBeGreaterThan(low + 0.25);
    rig.dispose();
  });

  it.each(['pistol', 'revolver', 'smg', 'rifle', 'dmr', 'shotgun', 'shotgunTactical'] as const)('%s: las dos manos están en el arma', (model) => {
    const rig = make(model);
    const pose = idlePose();
    for (const [name, set] of [
      ['en guardia', { ready: 1, aim: 0 }],
      ['apuntando', { ready: 1, aim: 1 }],
      ['apuntando arriba', { ready: 1, aim: 1, aimPitch: 0.5 }],
      ['agachado', { ready: 1, aim: 1, aimPitch: 0, posture: 'crouch' as const }],
    ] as const) {
      Object.assign(pose, set);
      settle(rig, pose);
      const right = rig.bones.handR.localToWorld(new Vector3(0, GRIP_Y, GRIP_Z));
      expect(right.distanceTo(rig.weaponMount.getWorldPosition(new Vector3())), `${name}: la derecha, en la empuñadura`).toBeLessThan(0.02);
      const at = GRIP[model]!;
      const left = rig.bones.handL.localToWorld(new Vector3(0, GRIP_Y, GRIP_Z));
      expect(left.distanceTo(rig.weaponMount.localToWorld(new Vector3(at[0], at[1], at[2]))), `${name}: la izquierda, en su agarre`).toBeLessThan(0.06);
    }
    rig.dispose();
  });

  it('al soltar el arma (cae), las manos no saltan de un fotograma al siguiente', () => {
    const rig = make('rifle');
    const pose = idlePose();
    pose.aim = 1;
    settle(rig, pose);
    const before = rig.motionSample();
    pose.state = 'dead';
    pose.stateTime = DT;
    rig.update(pose, DT);
    const after = rig.motionSample();
    for (const k of ['handLx', 'handLy', 'handLz', 'handRx', 'handRy', 'handRz']) expect(Math.abs(after[k]! - before[k]!), k).toBeLessThan(0.09);
    rig.dispose();
  });

  it('al aterrizar, las piernas absorben el golpe y se recuperan', () => {
    const rig = make('pistol');
    const pose = idlePose();
    settle(rig, pose);
    const hips = (): number => rig.motionSample().hipsY!;
    const stand = hips();
    Object.assign(pose, { state: 'air', grounded: false });
    settle(rig, pose, 40);
    Object.assign(pose, { state: 'ground', grounded: true });
    let low = 9;
    for (let i = 0; i < 40; i++) {
      rig.update(pose, DT);
      if (i > 15) low = Math.min(low, hips());
    }
    expect(low).toBeLessThan(stand - 0.02);
    settle(rig, pose);
    expect(hips()).toBeCloseTo(stand, 2);
    rig.dispose();
  });

  it('los gestos del hotel: las manos por delante, a la espalda o en la barra', () => {
    const rig = make('none');
    const pose = idlePose();
    pose.ready = 0;
    const hands = (): [Vector3, Vector3] => [rig.bones.handL.getWorldPosition(new Vector3()), rig.bones.handR.getWorldPosition(new Vector3())];
    pose.gesture = 'formal';
    settle(rig, pose);
    let [l, r] = hands();
    expect(l.distanceTo(r), 'cogidas').toBeLessThan(0.2);
    expect(l.z).toBeLessThan(-0.1);
    pose.gesture = 'behind';
    settle(rig, pose);
    [l, r] = hands();
    expect(l.distanceTo(r)).toBeLessThan(0.25);
    expect(Math.min(l.z, r.z)).toBeGreaterThan(0.05);
    pose.gesture = 'counter';
    settle(rig, pose);
    [l, r] = hands();
    expect(l.distanceTo(r), 'apoyadas y separadas').toBeGreaterThan(0.35);
    rig.dispose();
  });

  it('bailando, el cuerpo sube y baja con cada golpe', () => {
    const rig = make('none');
    const pose = idlePose();
    pose.gesture = 'dance0';
    settle(rig, pose);
    const at = (beat: number): number => {
      pose.beat = beat;
      settle(rig, pose, 60);
      return rig.motionSample().hipsY!;
    };
    expect(at(0) - at(0.5)).toBeGreaterThan(0.02);
    expect(at(2)).toBeCloseTo(at(0), 2);
    rig.dispose();
  });
});

describe('remate cuerpo a cuerpo', () => {
  it('la izquierda agarra la ropa de la víctima y el arma acaba mirando al suelo', () => {
    const killer = make('pistol');
    const victim = make('none');
    victim.root.position.set(0, 0, -0.82);
    victim.root.rotation.y = Math.PI;
    const a = idlePose();
    const b = idlePose();
    settle(killer, a);
    settle(victim, b);
    let closest = 9;
    let low = 9;
    let down = 0;
    for (let i = 0; i < 50; i++) {
      const t = i * DT;
      Object.assign(a, { state: 'locked', takedown: t });
      Object.assign(b, { state: 'dead', thrown: t });
      victim.update(b, DT);
      victim.root.updateMatrixWorld(true);
      grabVictim(a, victim);
      killer.update(a, DT);
      killer.root.updateMatrixWorld(true);
      const hand = killer.bones.handL.getWorldPosition(new Vector3());
      const lapel = victim.bones.chest.localToWorld(new Vector3(0.07, 0.13, -0.15));
      if (a.grab > 0.9) closest = Math.min(closest, hand.distanceTo(lapel));
      low = Math.min(low, victim.bones.chest.getWorldPosition(new Vector3()).y);
      if (t > 0.52 && t < 0.7) down = Math.min(down, new Vector3(0, 0, -1).applyQuaternion(killer.weaponMount.getWorldQuaternion(new Quaternion())).y);
    }
    expect(closest, 'la mano llega a la solapa').toBeLessThan(0.05);
    expect(low, 'acaba en el suelo').toBeLessThan(0.35);
    expect(down, 'el cañón, hacia abajo').toBeLessThan(-0.6);
    killer.dispose();
    victim.dispose();
  });
});

describe('postura en cobertura', () => {
  const cover = (height: 'high' | 'low'): RigPose => {
    const p = idlePose();
    Object.assign(p, { state: 'cover', cover: height, coverBack: true, posture: height === 'low' ? 'crouch' : 'stand', coverTop: height === 'low' ? 1 : 2.4 });
    return p;
  };

  it.each(['pistol', 'rifle'] as const)('%s: de espaldas a la pared; al apuntar se gira hacia el enemigo', (weapon) => {
    const rig = make(weapon);
    for (const height of ['high', 'low'] as const) {
      const pose = cover(height);
      settle(rig, pose);
      expect(chest(rig).z, `${height}: el pecho mira hacia fuera`).toBeGreaterThan(0.8);
      pose.aim = 1;
      settle(rig, pose);
      expect(chest(rig).z, `${height}: apuntando, al frente`).toBeLessThan(-0.6);
    }
    rig.dispose();
  });

  it('gira por el lado por el que se asomaría: por fuera de la esquina', () => {
    for (const side of [-1, 1]) {
      const rig = make('pistol');
      const pose = cover('high');
      pose.coverSide = side;
      settle(rig, pose);
      pose.aim = 1;
      let reached = 0;
      for (let i = 0; i < 60; i++) {
        rig.update(pose, DT);
        rig.root.updateMatrixWorld(true);
        const c = chest(rig);
        // A medio giro mira hacia ese lado (+X es su derecha).
        if (Math.abs(c.z) < 0.5) reached = Math.max(reached, c.x * side);
      }
      expect(reached, side > 0 ? 'por la derecha' : 'por la izquierda').toBeGreaterThan(0.7);
      rig.dispose();
    }
  });

  it('agachado tras la baja, la cabeza queda por debajo de su borde', () => {
    const rig = make('rifle');
    const pose = cover('low');
    settle(rig, pose);
    expect(rig.silhouetteHeight()).toBeLessThan(1.3);
    // A ciegas por encima: solo asoman el arma y los brazos.
    pose.blind = 1;
    settle(rig, pose);
    expect(rig.bones.head.getWorldPosition(new Vector3()).y).toBeLessThan(0.95);
    expect(rig.weaponMount.getWorldPosition(new Vector3()).y).toBeGreaterThan(1);
    rig.dispose();
  });
});

describe('lo que el cuerpo del jugador recuerda', () => {
  it('sigue en guardia un rato después de combatir y acusa los golpes que le bajan la salud', () => {
    const body = new PlayerBody();
    const pose = idlePose();
    const look = emptyPlayerLook();
    const p = { state: 'ground', posture: 'stand' } as PlayerController;
    const run = (seconds: number, threat = false): void => {
      for (let i = 0; i < seconds * 60; i++) body.update(pose, p, look, threat, DT);
    };
    run(1);
    expect(pose.ready, 'tranquilo').toBe(0);
    look.aim = true;
    run(0.1);
    look.aim = false;
    run(2);
    expect(pose.ready, 'recién apuntado').toBe(1);
    run(6);
    expect(pose.ready).toBe(0);
    run(0.1, true);
    expect(pose.ready, 'con enemigos peleando').toBe(1);

    expect(pose.flinch).toBe(0);
    look.health = 0.8;
    run(DT);
    expect(pose.flinch, 'se sacude').toBeGreaterThan(0.3);
    run(1);
    expect(pose.flinch).toBe(0);
    look.health = 1;
    run(DT);
    expect(pose.flinch, 'curarse no es un golpe').toBe(0);
  });
});
