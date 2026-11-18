import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { CharacterRig, idlePose, PLAYER_LOOK, type RigPose } from '../../src/entities/CharacterRig';

describe('material de los personajes', () => {
  it('uno compartido sobrevive a quien lo suelta; uno propio se libera con su personaje', () => {
    // Antes, al salir del vestíbulo cada NPC liberaba el material compartido que la caché seguía entregando.
    const a = new CharacterRig('npc:prueba', { ...PLAYER_LOOK });
    const b = new CharacterRig('npc:prueba', { ...PLAYER_LOOK });
    expect(b.material).toBe(a.material);
    let shared = 0;
    a.material.addEventListener('dispose', () => shared++);
    a.dispose();
    b.dispose();
    expect(shared, 'la caché conserva el material compartido').toBe(0);
    expect(new CharacterRig('npc:prueba', { ...PLAYER_LOOK }).material).toBe(a.material);

    const own = new CharacterRig('enemigo:prueba', { ...PLAYER_LOOK, uniqueMaterial: true });
    let owned = 0;
    own.material.addEventListener('dispose', () => owned++);
    own.dispose();
    expect(owned, 'el material propio se libera con el personaje').toBe(1);
  });
});

/** Mantiene la pose hasta que las articulaciones se asientan (el personaje mira a −Z; su derecha es +X). */
function settle(rig: CharacterRig, pose: RigPose, frames = 90): void {
  for (let i = 0; i < frames; i++) rig.update(pose, 1 / 60);
  rig.root.updateMatrixWorld(true);
}

describe('animaciones', () => {
  it('el tajo del cuchillo se arma junto a la oreja derecha y corta cruzando el cuerpo hacia la izquierda', () => {
    const rig = new CharacterRig('prueba:tajo', { ...PLAYER_LOOK, weapon: 'knife' });
    const pose = idlePose();
    const hand = new Vector3();
    settle(rig, pose);
    const guard = rig.weaponMount.getWorldPosition(new Vector3());

    pose.slash = 0.28;
    settle(rig, pose);
    rig.weaponMount.getWorldPosition(hand);
    expect(hand.y, 'armado: la mano sube por encima de los hombros').toBeGreaterThan(guard.y + 0.35);
    expect(hand.x, 'armado: por el lado derecho').toBeGreaterThan(guard.x);

    pose.slash = 0.5;
    settle(rig, pose);
    rig.weaponMount.getWorldPosition(hand);
    expect(hand.x, 'corte: la mano cruza al lado izquierdo').toBeLessThan(0);
    expect(hand.z, 'corte: por delante del cuerpo').toBeLessThan(-0.2);
    rig.dispose();
  });

  it('la cabeza mira a un lado, pero no por encima del hombro ni estando muerto', () => {
    const rig = new CharacterRig('prueba:mirada', { ...PLAYER_LOOK, weapon: 'none' });
    const head = rig['head'];
    const pose = idlePose();
    pose.look = 1;
    pose.lookYaw = 0.8;
    settle(rig, pose);
    expect(head.rotation.y, 'gira hacia lo que mira').toBeCloseTo(0.8, 1);

    pose.lookYaw = 2.6;
    settle(rig, pose);
    expect(Math.abs(head.rotation.y), 'lo que queda a la espalda no se sigue').toBeLessThan(0.05);

    pose.lookYaw = 0.8;
    pose.state = 'dead';
    pose.stateTime = 2;
    settle(rig, pose);
    expect(Math.abs(head.rotation.y), 'un cuerpo caído no mira').toBeLessThan(0.05);
    rig.dispose();
  });
});
