import { describe, expect, it } from 'vitest';
import { newProfile } from '../../src/core/Save';
import { applyExcommunicadoFine, buy, canBuy, contractReward, gauntletReward, SHOP } from '../../src/hub/economy';
import { MISSIONS } from '../../src/missions/types';

describe('economía', () => {
  it('la tienda tiene los precios del diseño y cada mejora una sola vez', () => {
    const ids = SHOP.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(SHOP.find((s) => s.id === 'compensator')?.price).toBe(5);
    expect(SHOP.find((s) => s.id === 'extraMarker')?.price).toBe(12);
  });

  it('comprar descuenta monedas y marca la mejora; no se puede comprar dos veces ni sin fondos', () => {
    const p = newProfile();
    p.coins = 9;
    expect(canBuy(p, 'compensator')).toBe('ok');
    expect(buy(p, 'compensator')).toBe(true);
    expect(p.coins).toBe(4);
    expect(p.upgrades).toEqual(['compensator']);
    expect(canBuy(p, 'compensator')).toBe('owned');
    expect(canBuy(p, 'hollowPoint')).toBe('poor');
    expect(buy(p, 'hollowPoint')).toBe(false);
    expect(p.coins).toBe(4);
  });

  it('los trajes se compran en orden', () => {
    const p = newProfile();
    p.coins = 100;
    expect(canBuy(p, 'suit2')).toBe('locked');
    expect(buy(p, 'suit1')).toBe(true);
    expect(canBuy(p, 'suit2')).toBe('ok');
    expect(canBuy(p, 'suit3')).toBe('locked');
  });

  it('recompensas por rango y bonus de primera vez', () => {
    expect(contractReward('nightclub', 'S', true)).toBe(6 * 2 + 3);
    expect(contractReward('nightclub', 'C', false)).toBe(6);
    expect(contractReward('docks', 'D', false)).toBe(Math.round(8 * 0.75));
    expect(contractReward('practice', 'B', true)).toBe(Math.round(MISSIONS.practice.baseReward * 1.25) + 3);
    expect(gauntletReward(7)).toBe(3);
    expect(gauntletReward(0)).toBe(0);
  });

  it('el Excomunicado cuesta el 30 % de las monedas y queda registrado', () => {
    const p = newProfile();
    p.coins = 10;
    expect(applyExcommunicadoFine(p)).toBe(3);
    expect(p.coins).toBe(7);
    expect(p.excommunicados).toBe(1);
    p.coins = 1;
    expect(applyExcommunicadoFine(p)).toBe(0);
    expect(p.coins).toBe(1);
  });
});
