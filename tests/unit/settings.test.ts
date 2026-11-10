import { describe, expect, it } from 'vitest';
import { DEFAULT_BINDINGS } from '../../src/core/actions';
import { MemoryStore, SETTINGS_KEY } from '../../src/core/Save';
import { bindingConflicts, defaultSettings, loadSettings, rebind, saveSettings, SETTING_RANGES, suggestPreset, validateSettings } from '../../src/core/Settings';

describe('ajustes', () => {
  it('los de fábrica no tienen teclas en conflicto', () => {
    expect(bindingConflicts(defaultSettings().bindings)).toEqual([]);
  });

  it('valida: límites, tipos erróneos y campos que faltan vuelven a su valor', () => {
    const s = validateSettings({ mouseSens: 99, fov: 'mucho', invertY: 1, preset: 'ultra', master: -3, uiScale: 1.2, hints: false });
    expect(s.mouseSens).toBe(SETTING_RANGES.mouseSens[1]);
    expect(s.fov).toBe(68);
    expect(s.invertY).toBe(false);
    expect(s.preset).toBe('medium');
    expect(s.master).toBe(0);
    expect(s.uiScale).toBe(1.2);
    expect(s.hints).toBe(false);
    expect(validateSettings(null)).toEqual(defaultSettings());
  });

  it('teclas guardadas: se filtran códigos basura y reservados; nunca se queda una acción sin tecla', () => {
    const s = validateSettings({ bindings: { jump: ['KeyJ', 'Pad0', 42, '<script>'], reload: ['Escape'], fire: [] } });
    expect(s.bindings.jump).toEqual(['KeyJ', 'Pad0']);
    expect(s.bindings.reload).toEqual(DEFAULT_BINDINGS.reload);
    expect(s.bindings.fire).toEqual(DEFAULT_BINDINGS.fire);
    // Pausa y debug no se pueden tocar desde el guardado.
    expect(validateSettings({ bindings: { pause: ['KeyP'] } }).bindings.pause).toEqual(DEFAULT_BINDINGS.pause);
  });

  it('se guardan y se cargan; JSON corrupto → fábrica', () => {
    const kv = new MemoryStore();
    const s = defaultSettings();
    s.fov = 80;
    s.music = 0.2;
    saveSettings(kv, s);
    expect(loadSettings(kv)).toEqual(s);
    kv.set(SETTINGS_KEY, '{roto');
    expect(loadSettings(kv)).toEqual(defaultSettings());
  });

  it('reasignar a una tecla libre sustituye la principal y conserva la alternativa', () => {
    const r = rebind(DEFAULT_BINDINGS, 'moveForward', 'KeyI');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.bindings.moveForward).toEqual(['KeyI', 'ArrowUp']);
    expect(r.displaced).toBeNull();
  });

  it('reasignar a una tecla ocupada intercambia y no deja conflictos', () => {
    const r = rebind(DEFAULT_BINDINGS, 'reload', 'KeyE');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.displaced).toBe('interact');
    expect(r.bindings.reload).toEqual(['KeyE', 'Pad2']);
    expect(r.bindings.interact).toEqual(['KeyR', 'Pad0']);
    expect(bindingConflicts(r.bindings)).toEqual([]);
  });

  it('los botones del gamepad no se tocan y Esc/F3 están reservadas', () => {
    expect(rebind(DEFAULT_BINDINGS, 'jump', 'Escape')).toEqual({ ok: false, reason: 'reserved' });
    expect(rebind(DEFAULT_BINDINGS, 'jump', 'Pad4')).toEqual({ ok: false, reason: 'pad' });
    expect(rebind(DEFAULT_BINDINGS, 'pause', 'KeyP')).toEqual({ ok: false, reason: 'not-rebindable' });
    const r = rebind(DEFAULT_BINDINGS, 'jump', 'KeyX');
    expect(r.ok && r.bindings.jump).toEqual(['KeyX', 'Pad0']);
  });

  it('cadena de reasignaciones al azar: nunca hay conflictos ni acciones sin tecla', () => {
    const codes = ['KeyE', 'KeyR', 'KeyF', 'KeyQ', 'KeyC', 'Space', 'ShiftLeft', 'Digit1', 'Digit2', 'KeyV', 'Mouse2', 'KeyW', 'KeyX'];
    const actions = ['jump', 'interact', 'reload', 'takedown', 'focus', 'crouch', 'sprint', 'weapon1', 'shoulder', 'aim', 'moveForward'] as const;
    let b = defaultSettings().bindings;
    for (let i = 0; i < 400; i++) {
      const r = rebind(b, actions[(i * 7) % actions.length]!, codes[(i * 5 + 3) % codes.length]!);
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      b = r.bindings;
      expect(bindingConflicts(b)).toEqual([]);
      for (const a of actions) expect(b[a].some((c) => !c.startsWith('Pad')), a).toBe(true);
    }
  });
});

describe('preset sugerido por GPU', () => {
  it('integradas de Intel, móviles y software → Bajo; dedicadas, Arc y Apple → Medio', () => {
    expect(suggestPreset('ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)')).toBe('low');
    expect(suggestPreset('ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11)')).toBe('low');
    expect(suggestPreset('ANGLE (Intel, Intel(R) Arc(TM) A770 Graphics Direct3D11)')).toBe('medium');
    expect(suggestPreset('ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)')).toBe('low');
    expect(suggestPreset('Mali-G78')).toBe('low');
    expect(suggestPreset('Adreno (TM) 650')).toBe('low');
    expect(suggestPreset('ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Direct3D11 vs_5_0 ps_5_0, D3D11)')).toBe('medium');
    expect(suggestPreset('ANGLE (AMD, AMD Radeon RX 6600 Direct3D11)')).toBe('medium');
    expect(suggestPreset('Apple M2')).toBe('medium');
  });
});
