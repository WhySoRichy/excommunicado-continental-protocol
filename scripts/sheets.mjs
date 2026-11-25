// Hojas de diseño: armas, personajes y efectos dibujados con el motor del juego, aislados y con luz de
// estudio, para revisar el aspecto sin entrar en el juego.
// Uso: `npm run sheets` (todas) o `npm run sheets -- armas cara`. Salida: qa-screenshots/sheets/ (no se versiona).
// Hojas: posturas, marcha, cobertura, acciones, gestos, armas, efectos, cara, huesped, enemigos, golpes, caidas, civiles,
// hotel, manos... Arranca su propio servidor de desarrollo de Vite en el puerto 5173.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const PROJECT = process.cwd();
const OUT = join(PROJECT, 'qa-screenshots', 'sheets');
const URL = 'http://localhost:5173';

// Vistas. `target`: 'body' | 'head' | 'chest' | [x, y, z]; `cam`: desplazamiento de la cámara desde el objetivo.
const W = (model, d, zc) => ({ label: model, show: [`w:${model}`], target: [0, 1, zc], cam: [d, 0, 0], fov: 30 });
/** Un golpe (o una caída) en varios instantes: `t` en segundos desde que le dan. */
const HIT = (label, o, times) =>
  times.map((t) => ({
    label: `${label} ${t.toFixed(2)} s`,
    show: [o.type ?? 'thug'],
    aim: 1,
    hit: { ...o, t },
    target: 'body',
    cam: [3.9, 0.35, -2.1],
    fov: 34,
  }));
const FALL = (label, o, times) => HIT(label, o, times).map((v) => ({ ...v, target: [0, 0.75, 0.25], cam: [4.4, 0.6, -1.5] }));
const HIT_T = [0.03, 0.09, 0.2, 0.4, 0.65];
const FALL_T = [0.1, 0.22, 0.36, 0.55, 0.8, 1.2];
/** El protagonista en una postura, visto en tres cuartos; `pose` son campos de la postura y `t` cuánto la mantiene (s). */
const P = (label, weapon, pose = {}, o = {}) => ({ label, show: ['player'], weapon, pose, t: 1.2, target: 'body', cam: [2.5, 0.35, -3.3], fov: 32, ...o });
/** La marcha en `n` instantes de un ciclo. */
const GAIT = (label, pose, n = 6, o = {}) =>
  Array.from({ length: n }, (_, i) =>
    P(`${label} ${((i / n) * 100).toFixed(0)} %`, 'pistol', { ready: 0, ...pose }, { phase: i / n, cam: [4.1, 0.1, -0.6], ...o }),
  );
const COVER = (label, weapon, cover, pose = {}, o = {}) =>
  P(
    label,
    weapon,
    { state: 'cover', cover, coverBack: true, posture: cover === 'low' ? 'crouch' : 'stand', ready: 1, look: 1, coverTop: cover === 'low' ? 1 : 2.6, ...pose },
    { wall: cover, cam: [2.6, 0.9, 3.2], ...o },
  );
const SHEETS = {
  posturas: {
    tile: [250, 360],
    cols: 6,
    views: [
      ...['none', 'pistol', 'smg', 'rifle', 'shotgun', 'knife'].map((w) => P(`${w}: relajado`, w, { ready: 0 })),
      ...['none', 'pistol', 'smg', 'rifle', 'shotgun', 'knife'].map((w) => P(`${w}: en guardia`, w)),
      ...['none', 'pistol', 'smg', 'rifle', 'shotgun', 'dmr'].map((w) => P(`${w}: apuntando`, w, { aim: 1 })),
      ...['pistol', 'rifle'].flatMap((w) => [
        P(`${w}: agachado`, w, { posture: 'crouch' }),
        P(`${w}: agachado apuntando`, w, { posture: 'crouch', aim: 1 }),
        P(`${w}: de frente`, w, {}, { cam: [0.3, 0.2, -4] }),
      ]),
      ...['pistol', 'rifle'].flatMap((w) => [
        P(`${w}: apunta, frente`, w, { aim: 1 }, { cam: [0.3, 0.2, -4] }),
        P(`${w}: apunta, espalda`, w, { aim: 1 }, { cam: [0.9, 0.6, 3.6] }),
        P(`${w}: desde arriba`, w, {}, { cam: [0.4, 2.6, 2.6] }),
      ]),
      P('mira arriba', 'pistol', { aim: 1, aimPitch: 0.6 }),
      P('mira abajo', 'pistol', { aim: 1, aimPitch: -0.6 }),
      P('fusil arriba', 'rifle', { aim: 1, aimPitch: 0.6 }),
      P('fusil abajo', 'rifle', { aim: 1, aimPitch: -0.6 }),
      P('perfil relajado', 'pistol', { ready: 0 }, { cam: [4.1, 0.2, 0] }),
      P('espalda relajado', 'pistol', { ready: 0 }, { cam: [0.6, 0.3, 4] }),
    ],
  },
  manos: {
    tile: [330, 300],
    cols: 4,
    views: [
      ...['pistol', 'revolver', 'smg', 'rifle', 'shotgun', 'dmr'].flatMap((w) => [
        P(`${w}: por la izquierda`, w, { aim: 1 }, { target: [0, 1.5, -0.45], cam: [-1.15, 0.2, -0.5], fov: 30 }),
        P(`${w}: por la derecha`, w, { aim: 1 }, { target: [0.05, 1.5, -0.4], cam: [1.15, 0.2, -0.3], fov: 30 }),
        P(`${w}: desde abajo`, w, { aim: 1 }, { target: [0, 1.5, -0.45], cam: [-0.4, -0.9, -0.6], fov: 30 }),
        P(`${w}: en guardia`, w, {}, { target: [0.05, 1.3, -0.3], cam: [-0.7, 0.25, -1.1], fov: 30 }),
      ]),
      P('sin arma', 'none', { ready: 0 }, { target: [0.2, 0.95, 0], cam: [0.9, 0.1, -0.7], fov: 30 }),
      P('pistola relajada', 'pistol', { ready: 0 }, { target: [0.22, 0.9, 0], cam: [0.9, 0.1, -0.7], fov: 30 }),
    ],
  },
  marcha: {
    tile: [220, 320],
    cols: 6,
    views: [
      ...GAIT('andar', { speed: 1.6 }),
      ...GAIT('trote', { speed: 4.2 }),
      ...GAIT('sprint', { speed: 6.8 }),
      ...GAIT('de lado', { speed: 2.6, moveAngle: -Math.PI / 2, ready: 1 }, 6, { cam: [0.5, 0.2, -4.2] }),
      ...GAIT('hacia atrás', { speed: 2.4, moveAngle: Math.PI, ready: 1 }),
      ...GAIT('apuntando', { speed: 2.4, aim: 1, ready: 1 }),
      ...GAIT('diagonal', { speed: 2.6, moveAngle: 0.78, ready: 1 }, 6, { cam: [2.8, 0.2, -3] }),
      ...GAIT('agachado', { speed: 2.2, posture: 'crouch', ready: 1 }),
      ...GAIT('fusil corriendo', { speed: 5, ready: 1 }, 6, { weapon: 'rifle' }),
    ],
  },
  carrera: {
    tile: [230, 330],
    cols: 8,
    views: [
      ...GAIT('trote', { speed: 4.6 }, 8, { cam: [4.2, 0.1, 0] }),
      ...GAIT('trote, detrás', { speed: 4.6 }, 8, { cam: [0.6, 0.45, 4] }),
      ...GAIT('trote, delante', { speed: 4.6 }, 8, { cam: [-0.8, 0.1, -4] }),
      ...GAIT('sprint', { speed: 7 }, 8, { cam: [4.2, 0.1, 0] }),
      ...GAIT('sprint, detrás', { speed: 7 }, 8, { cam: [0.6, 0.45, 4] }),
      ...GAIT('fusil, trote', { speed: 4.6, ready: 1 }, 8, { weapon: 'rifle', cam: [4.2, 0.1, 0] }),
      ...GAIT('fusil, sprint', { speed: 7, ready: 1 }, 8, { weapon: 'rifle', cam: [3.4, 0.2, -2.4] }),
      ...GAIT('pistola en guardia', { speed: 4.6, ready: 1 }, 8, { cam: [4.2, 0.1, 0] }),
    ],
  },
  cobertura: {
    tile: [260, 340],
    cols: 5,
    views: ['pistol', 'rifle'].flatMap((w) => [
      COVER(`${w}: alta`, w, 'high'),
      COVER(`${w}: alta, borde derecho`, w, 'high', { coverSide: 1 }),
      COVER(`${w}: alta, borde izquierdo`, w, 'high', { coverSide: -1 }),
      COVER(`${w}: alta, de frente`, w, 'high', { coverSide: 1 }, { cam: [3.3, 0.3, 0.6] }),
      COVER(`${w}: alta, andando`, w, 'high', { speed: 1.3, moveAngle: -Math.PI / 2 }),
      COVER(`${w}: asomado`, w, 'high', { aim: 1, peek: 1, coverSide: 1 }, { wallEdge: 0.25 }),
      COVER(`${w}: a ciegas, borde`, w, 'high', { blind: 2, coverSide: 1 }, { wallEdge: 0.25 }),
      COVER(`${w}: baja`, w, 'low'),
      COVER(`${w}: baja, perfil`, w, 'low', {}, { cam: [3.6, 0.4, 0] }),
      COVER(`${w}: baja, andando`, w, 'low', { speed: 1.4, moveAngle: -Math.PI / 2 }),
      COVER(`${w}: baja, apunta`, w, 'low', { aim: 1 }),
      COVER(`${w}: baja, a ciegas`, w, 'low', { blind: 1 }),
    ]),
  },
  acciones: {
    tile: [230, 320],
    cols: 6,
    views: [
      ...[0.1, 0.25, 0.4, 0.55, 0.7, 0.9].map((r) => P(`recarga pistola ${r}`, 'pistol', { reload: r, aim: 0 })),
      ...[0.1, 0.25, 0.4, 0.55, 0.7, 0.9].map((r) => P(`recarga fusil ${r}`, 'rifle', { reload: r, aim: 0 })),
      ...[0.2, 0.4, 0.5, 0.6, 0.75, 0.9].map((r) => P(`lanzar ${r}`, 'pistol', { throw: r }, { t: 0.5 })),
      ...[0.1, 0.24, 0.36, 0.5, 0.7, 0.9].map((r) => P(`tajo ${r}`, 'knife', { slash: r }, { t: 0.4 })),
      ...[0.1, 0.25, 0.4, 0.55, 0.7, 0.9].map((r) => P(`derribo ${r}`, 'pistol', { takedown: r, state: 'locked' }, { t: 0.4 })),
      ...[0.05, 0.12, 0.2, 0.28, 0.36, 0.45].map((r) => P(`voltereta ${r}`, 'pistol', { state: 'roll', stateTime: r }, { t: 0.2, cam: [4.1, 0.2, 0] })),
      ...[0.02, 0.1, 0.2, 0.4].map((r) => P(`deslizar ${r}`, 'pistol', { state: 'slide', stateTime: r, speed: 6 }, { t: 0.15 + r, cam: [4.1, 0.2, -1] })),
      P('en el aire', 'pistol', { state: 'air', grounded: false }, { t: 0.4, cam: [4.1, 0.2, -1] }),
      P('cambio de arma', 'pistol', { swap: 1 }),
      ...[0.1, 0.3, 0.45, 0.6, 0.8, 0.95].map((r) => P(`salvar ${r}`, 'pistol', { state: 'vault', vault: r }, { t: 0.4, cam: [4.1, 0.2, -1] })),
      P('aturdido', 'pistol', { daze: 1 }),
      P('arrodillado', 'pistol', { kneel: 1 }),
      P('fusil, retroceso', 'rifle', { aim: 1, recoil: 1 }),
      P('pistola, retroceso', 'pistol', { aim: 1, recoil: 1 }),
      P('girando', 'pistol', {}, { turn: 3, phase: 0.2 }),
      P('aterrizaje', 'pistol', { state: 'ground' }, { t: 0.05 }),
    ],
  },
  gestos: {
    tile: [250, 360],
    cols: 6,
    views: [
      { label: 'formal', show: ['charon'], pose: { gesture: 'formal' } },
      { label: 'formal, habla', show: ['charon'], pose: { gesture: 'formal', talk: 1 } },
      { label: 'manos atrás', show: ['winston'], pose: { gesture: 'behind' } },
      { label: 'manos atrás, habla', show: ['winston'], pose: { gesture: 'behind', talk: 1 } },
      { label: 'bolsillo', show: ['winston'], pose: { gesture: 'pocket' } },
      { label: 'barra', show: ['sommelier'], pose: { gesture: 'counter' } },
      ...[0, 0.5, 1, 1.5].map((b) => ({ label: `baile 0: ${b}`, show: ['civ0'], pose: { gesture: 'dance0', beat: b } })),
      ...[0, 0.5].map((b) => ({ label: `baile 1: ${b}`, show: ['civ1'], pose: { gesture: 'dance1', beat: b } })),
      ...[0, 0.5].map((b) => ({ label: `baile 2: ${b}`, show: ['civ2'], pose: { gesture: 'dance2', beat: b } })),
      { label: 'pánico', show: ['civ3'], pose: { gesture: 'panic', speed: 4.5 } },
      { label: 'encogido', show: ['civ1'], pose: { gesture: 'cower', posture: 'crouch' } },
      { label: 'de pie', show: ['civ2'], pose: {} },
      { label: 'manos atrás, espalda', show: ['winston'], pose: { gesture: 'behind' }, cam: [-1.4, 0.4, 3.6] },
    ].map((v) => ({ t: 1.2, target: 'body', cam: [1.2, 0.3, -3.9], fov: 32, ...v, pose: { ready: 0, ...v.pose } })),
  },
  golpes: {
    tile: [260, 330],
    cols: 5,
    views: [
      ...HIT('torso', { part: 'torso' }, HIT_T),
      ...HIT('torso, por detrás', { part: 'torso', back: true }, HIT_T),
      ...HIT('cabeza', { part: 'head', stagger: true }, HIT_T),
      ...HIT('brazo derecho', { part: 'armR', disarm: true }, HIT_T),
      ...HIT('brazo izquierdo', { part: 'armL', disarm: true }, HIT_T),
      ...HIT('pierna', { part: 'legR', stagger: true, limp: 1 }, HIT_T),
      ...HIT('descolocado', { part: 'torso', stagger: true }, HIT_T),
    ],
  },
  maquinas: {
    tile: [300, 300],
    cols: 4,
    views: [
      { label: 'sabueso: 3/4', show: ['hound'], target: [0, 0.45, -0.1], cam: [1.5, 0.5, -1.7], fov: 34 },
      { label: 'perfil', show: ['hound'], target: [0, 0.45, 0], cam: [2.4, 0.2, 0], fov: 34 },
      { label: 'de frente', show: ['hound'], target: [0, 0.5, 0], cam: [0, 0.2, -2.3], fov: 34 },
      { label: 'por detrás', show: ['hound'], target: [0, 0.45, 0], cam: [-1.2, 0.8, 1.9], fov: 34 },
      ...[0.15, 0.4, 0.65, 0.9].map((t) => ({
        label: `trote ${t}`,
        show: ['hound'],
        pose: { speed: 2.4 },
        t,
        target: [0, 0.4, 0],
        cam: [2.4, 0.2, -0.4],
        fov: 34,
      })),
      ...[0.15, 0.3, 0.45, 0.6].map((t) => ({
        label: `galope ${t}`,
        show: ['hound'],
        pose: { speed: 6.4 },
        t,
        target: [0, 0.4, 0],
        cam: [2.4, 0.2, -0.4],
        fov: 34,
      })),
      { label: 'agazapado', show: ['hound'], pose: { melee: 1, aim: 1 }, t: 0.6, target: [0, 0.4, 0], cam: [2.1, 0.4, -1], fov: 34 },
      ...[0.15, 0.5, 0.85].map((t) => ({
        label: `salto ${t}`,
        show: ['hound'],
        pose: { slash: t, speed: 10, aim: 1 },
        t: 0.25,
        target: [0, 0.45, 0],
        cam: [2.2, 0.3, -0.8],
        fov: 34,
      })),
      { label: 'apagado', show: ['hound'], pose: { daze: 1, state: 'locked' }, t: 0.8, target: [0, 0.4, 0], cam: [2, 0.4, -1], fov: 34 },
      { label: 'caído', show: ['hound'], pose: { state: 'dead', death: 0, stateTime: 1 }, t: 1, target: [0, 0.3, 0], cam: [2, 0.6, -1], fov: 34 },
      { label: 'caído de lado', show: ['hound'], pose: { state: 'dead', death: 2, stateTime: 1 }, t: 1, target: [0, 0.3, 0], cam: [2, 0.6, -1], fov: 34 },
      { label: 'impacto', show: ['hound'], pose: { flinch: 1, flinchSide: 1 }, t: 0.1, target: [0, 0.4, 0], cam: [2, 0.4, -1], fov: 34 },
      { label: 'dron: 3/4', show: ['drone'], target: [0, 0.4, 0], cam: [1.1, 0.4, -1.4], fov: 34 },
      { label: 'de frente', show: ['drone'], target: [0, 0.4, 0], cam: [0, 0.1, -1.7], fov: 34 },
      { label: 'desde abajo', show: ['drone'], pose: { aim: 1, aimPitch: -0.5 }, t: 1, target: [0, 0.4, 0], cam: [0.7, -0.3, -1.4], fov: 34 },
      { label: 'avanza', show: ['drone'], pose: { speed: 4 }, t: 1, target: [0, 0.4, 0], cam: [1.8, 0.1, 0], fov: 34 },
    ],
  },
  escudo: {
    tile: [300, 400],
    cols: 4,
    views: [
      { label: 'de frente', show: ['shield'], shield: 'up', aim: 1, target: 'body', cam: [0.6, 0.3, -4.2], fov: 30 },
      { label: 'perfil', show: ['shield'], shield: 'up', aim: 1, target: 'body', cam: [4.2, 0.3, -0.3], fov: 30 },
      { label: 'por detrás', show: ['shield'], shield: 'up', aim: 1, target: 'body', cam: [-1.2, 0.5, 4], fov: 30 },
      { label: 'bajado', show: ['shield'], shield: 'down', target: 'body', cam: [1.2, 0.3, -4], fov: 30 },
    ],
  },
  cojo: {
    tile: [260, 330],
    cols: 6,
    views: [0.1, 0.3, 0.5, 0.7, 0.9, 1.1].flatMap((t) => HIT('cojea', { part: 'legL', limp: -1, walk: 2.2 }, [t])),
  },
  caidas: {
    tile: [260, 260],
    cols: 6,
    views: [
      ...FALL('de bruces', { fall: 0 }, FALL_T),
      ...FALL('de espaldas', { fall: 1 }, FALL_T),
      ...FALL('de lado', { fall: 2 }, FALL_T),
      ...FALL('en seco', { fall: 3 }, FALL_T),
      ...FALL('despedido', { fall: 4 }, FALL_T),
      ...FALL('de rodillas', { fall: 5 }, FALL_T),
    ],
  },
  armas: {
    tile: [420, 300],
    cols: 2,
    views: [
      W('pistol', 0.45, -0.095),
      W('revolver', 0.48, -0.09),
      W('rifle', 1.5, -0.18),
      W('dmr', 1.9, -0.27),
      W('smg', 0.95, -0.08),
      W('knife', 0.5, -0.08),
      W('shotgun', 1.65, -0.175),
      W('shotgunTactical', 1.55, -0.18),
    ],
  },
  efectos: {
    tile: [420, 300],
    cols: 2,
    views: [
      {
        label: 'disparo: trazadora, fogonazo y casquillos',
        show: ['player'],
        weapon: 'rifle',
        aim: 1,
        fx: true,
        target: 'muzzle',
        lead: 1.0,
        cam: [2.8, 0.3, 0],
        fov: 40,
      },
      { label: 'boca del arma de cerca', show: ['player'], weapon: 'rifle', aim: 1, target: 'muzzle', cam: [0.75, 0.12, 0.25], fov: 32 },
    ],
  },
  cara: {
    tile: [300, 400],
    cols: 4,
    views: [
      { label: 'frente', show: ['player'], weapon: 'pistol', target: 'body', cam: [0, 0.1, -4.3], fov: 30 },
      { label: 'cara', show: ['player'], weapon: 'pistol', target: 'head', cam: [0, 0.01, -0.85], fov: 30 },
      { label: 'cara 3/4', show: ['player'], weapon: 'pistol', target: 'head', cam: [0.55, 0.03, -0.65], fov: 30 },
      { label: 'perfil', show: ['player'], weapon: 'pistol', target: 'head', cam: [0.85, 0.01, 0], fov: 30 },
    ],
  },
  wick: {
    tile: [300, 400],
    cols: 4,
    views: [
      { label: 'espalda (vista de juego)', show: ['player'], weapon: 'pistol', target: 'body', cam: [0.9, 0.55, 3.6], fov: 30 },
      { label: 'cabeza', show: ['player'], weapon: 'pistol', target: 'head', cam: [0, 0.02, -1.0], fov: 30 },
      { label: 'cabeza 3/4', show: ['player'], weapon: 'pistol', target: 'head', cam: [0.65, 0.05, -0.75], fov: 30 },
      { label: 'cabeza por detrás', show: ['player'], weapon: 'pistol', target: 'head', cam: [0.35, 0.12, 0.95], fov: 30 },
    ],
  },
  enemigos: {
    tile: [300, 420],
    cols: 5,
    views: ['thug', 'escort', 'marksman', 'heavy', 'boss']
      .flatMap((t) => [{ label: `${t}: frente`, show: [t], target: 'body', cam: [0.9, 0.35, -4.2], fov: 30 }])
      .concat(
        ['thug', 'escort', 'marksman', 'heavy', 'boss'].map((t) => ({ label: `${t}: espalda`, show: [t], target: 'body', cam: [-1.2, 0.35, 4.1], fov: 30 })),
        ['thug', 'escort', 'marksman', 'heavy', 'boss'].map((t) => ({ label: `${t}: busto`, show: [t], target: 'head', cam: [0.45, 0.02, -1.15], fov: 30 })),
      ),
  },
  huesped: {
    tile: [300, 420],
    cols: 4,
    views: [
      { label: 'frente', show: ['player'], weapon: 'pistol', target: 'body', cam: [0.5, 0.2, -4.3], fov: 30 },
      { label: 'perfil', show: ['player'], weapon: 'pistol', target: 'body', cam: [4.3, 0.2, 0], fov: 30 },
      { label: 'espalda', show: ['player'], weapon: 'rifle', target: 'body', cam: [-0.9, 0.5, 4.2], fov: 30 },
      { label: 'apuntando', show: ['player'], weapon: 'rifle', aim: 1, target: 'body', cam: [2.6, 0.5, -3.2], fov: 30 },
      { label: 'cabeza', show: ['player'], weapon: 'pistol', target: 'head', cam: [0, 0.01, -0.95], fov: 30 },
      { label: 'cabeza 3/4', show: ['player'], weapon: 'pistol', target: 'head', cam: [0.65, 0.04, -0.7], fov: 30 },
      { label: 'cabeza por detrás', show: ['player'], weapon: 'pistol', target: 'head', cam: [0.4, 0.1, 0.95], fov: 30 },
      { label: 'manos', show: ['player'], weapon: 'pistol', target: [0.2, 0.98, -0.25], cam: [0.5, 0.2, -0.9], fov: 30 },
    ],
  },
  caras: {
    tile: [300, 340],
    cols: 4,
    views: ['player', 'charon', 'sommelier', 'winston', 'civ0', 'civ1', 'civ2', 'civ3', 'thug', 'boss'].flatMap((t) => [
      { label: `${t}: frente`, show: [t], target: 'head', cam: [0, 0, -0.62], fov: 30 },
      { label: `${t}: tres cuartos`, show: [t], target: 'head', cam: [0.42, 0.02, -0.46], fov: 30 },
    ]),
  },
  civiles: {
    tile: [300, 420],
    cols: 4,
    views: ['civ0', 'civ1', 'civ2', 'civ3'].map((t) => ({ label: t, show: [t], target: 'body', cam: [0.8, 0.3, -4.2], fov: 30 })),
  },
  hotel: {
    tile: [300, 420],
    cols: 3,
    views: ['charon', 'sommelier', 'winston']
      .flatMap((t) => [{ label: t, show: [t], target: 'body', cam: [0.6, 0.3, -4.2], fov: 30 }])
      .concat(['charon', 'sommelier', 'winston'].map((t) => ({ label: `${t}: busto`, show: [t], target: 'head', cam: [0.4, 0.02, -1.15], fov: 30 }))),
  },
  sommelier: {
    tile: [300, 400],
    cols: 4,
    views: [
      { label: 'frente', show: ['sommelier'], target: 'body', cam: [0, 0.1, -4.3], fov: 30 },
      { label: 'busto', show: ['sommelier'], target: 'chest', cam: [0, 0.1, -1.25], fov: 30 },
      { label: 'cabeza', show: ['sommelier'], target: 'head', cam: [0, 0.02, -1.0], fov: 30 },
      { label: 'cabeza 3/4', show: ['sommelier'], target: 'head', cam: [0.65, 0.05, -0.75], fov: 30 },
    ],
  },
};

const WANT = process.argv.length > 2 ? process.argv.slice(2) : Object.keys(SHEETS);
mkdirSync(OUT, { recursive: true });
const server = spawn(process.execPath, [join(PROJECT, 'node_modules', 'vite', 'bin', 'vite.js'), '--port', '5173', '--strictPort'], {
  cwd: PROJECT,
  stdio: 'ignore',
});
const stop = () => {
  try {
    server.kill();
  } catch {
    /* ya cerrado */
  }
};
process.on('exit', stop);
for (let i = 0; i < 150; i++) {
  try {
    if ((await fetch(URL)).ok) break;
  } catch {
    /* aun no escucha */
  }
  await new Promise((r) => setTimeout(r, 200));
}
await fetch(`${URL}/src/main.ts`).catch(() => {});

let code = 0;
try {
  const browser = await chromium.launch({ args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'] });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.route('**/__sheet.html', (r) =>
    r.fulfill({ contentType: 'text/html', body: '<!doctype html><html><body style="margin:0;background:#111"></body></html>' }),
  );
  await page.goto(`${URL}/__sheet.html`);
  for (const name of WANT) {
    const spec = SHEETS[name];
    if (!spec) throw new Error(`hoja desconocida: ${name}`);
    const url = await page.evaluate(async (s) => {
      // three se importa por la misma URL que usa el código del juego: una segunda copia rompería los instanceof.
      const rigSrc = await (await fetch('/src/entities/CharacterRig.ts')).text();
      const m = /["'](\/node_modules\/\.vite\/deps\/three\.js\?v=\w+)["']/.exec(rigSrc);
      if (!m) throw new Error('no encuentro three en el módulo transformado');
      // Módulos del juego por URL del servidor de Vite, dentro de la página (no son imports de Node).
      const load = (url) => import(url);
      const THREE = await load(m[1]);
      const Rig = await load('/src/entities/CharacterRig.ts');
      const { NPC_LOOKS } = await load('/src/entities/Npc.ts');
      const { ENEMY_TYPES } = await load('/src/entities/ai/enemyTypes.ts');
      const { CIVILIAN_LOOKS } = await load('/src/entities/CivilianView.ts');
      const { GameRenderer } = await load('/src/render/Renderer.ts');
      const [TW, TH] = s.tile;
      const host = document.createElement('div');
      host.style.cssText = `position:fixed;left:0;top:0;width:${TW * 2}px;height:${TH * 2}px`;
      document.body.appendChild(host);
      const r = new GameRenderer(host, 'high');
      r.dynamicResolution = false;
      r.setExposure(1.05);
      const scene = r.scene;
      scene.background = new THREE.Color(0x30343c);
      scene.environmentIntensity = 0.35;
      scene.add(new THREE.HemisphereLight(0xe8d2b0, 0x3b2f26, 0.9), new THREE.AmbientLight(0xffe9d0, 0.3));
      const key = new THREE.DirectionalLight(0xffe2bc, 1.7);
      key.position.set(-2, 4, -3);
      const fill = new THREE.DirectionalLight(0x9fb4d8, 0.6);
      fill.position.set(3, 2, 2);
      scene.add(key, fill);
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0x4a4e57, roughness: 0.95 }));
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);
      // Cobertura: una pared alta o un murete delante del personaje, a la distancia a la que se pega.
      const walls = {};
      for (const [k, h] of [
        ['high', 2.6],
        ['low', 1],
      ]) {
        const w = new THREE.Mesh(new THREE.BoxGeometry(4, h, 0.2), new THREE.MeshStandardMaterial({ color: 0x6b5f52, roughness: 0.9 }));
        w.position.set(0, h / 2, -0.42 - 0.1);
        scene.add(w);
        walls[k] = w;
      }
      const playerLook = Rig.PLAYER_LOOK;
      const actors = {};
      const add = (name, rig) => {
        scene.add(rig.root);
        actors[name] = { rig, obj: rig.root };
      };
      add('player', new Rig.CharacterRig('player', playerLook));
      for (const id of ['charon', 'sommelier', 'winston']) {
        const l = NPC_LOOKS[id];
        add(
          id,
          new Rig.CharacterRig(`npc:${id}`, {
            colors: l.colors,
            rimColor: 0xd4af37,
            rimStrength: 0.4,
            hair: l.hair,
            beard: l.beard,
            bulk: l.bulk,
            outfit: l.outfit,
            features: l.features,
            face: 'calm',
            weapon: 'none',
          }),
        );
      }
      for (const [i, l] of CIVILIAN_LOOKS.entries())
        add(`civ${i}`, new Rig.CharacterRig('civ', { ...l, rimColor: 0x5ee6c8, rimStrength: 0.5, weapon: 'none' }));
      for (const t of ['thug', 'escort', 'marksman', 'heavy', 'boss']) {
        const d = ENEMY_TYPES[t];
        add(
          t,
          new Rig.CharacterRig(`enemy:${t}`, {
            colors: d.colors,
            rimColor: d.color,
            rimStrength: 0.5,
            hair: d.hair,
            beard: d.beard,
            bulk: d.bulk,
            outfit: d.outfit,
            features: d.features,
            weapon: d.weapon.model,
            uniqueMaterial: true,
          }),
        );
      }
      const Robots = await load('/src/entities/RobotRigs.ts');
      const { shieldGeometry } = await load('/src/entities/rig/weapons.ts');
      const { weaponMaterial } = await load('/src/render/weaponMaterial.ts');
      for (const [t, C] of [
        ['hound', Robots.HoundRig],
        ['drone', Robots.DroneRig],
      ]) {
        const d = ENEMY_TYPES[t];
        add(t, new C(`enemy:${t}`, { colors: d.robot, rimColor: d.color, rimStrength: 0.5 }));
      }
      {
        const d = ENEMY_TYPES.shield;
        const opts = {
          colors: d.colors,
          rimColor: d.color,
          rimStrength: 0.5,
          hair: d.hair,
          bulk: d.bulk,
          outfit: d.outfit,
          weapon: d.weapon.model,
          uniqueMaterial: true,
        };
        add('shield', new Rig.CharacterRig('enemy:shield', opts));
        actors.shield.plate = new THREE.Mesh(shieldGeometry(d.color), weaponMaterial());
        actors.shield.rig.root.add(actors.shield.plate);
      }
      for (const model of ['pistol', 'revolver', 'knife', 'smg', 'rifle', 'dmr', 'shotgun', 'shotgunTactical']) {
        const tmp = new Rig.CharacterRig('w', { ...playerLook, weapon: model });
        const src = tmp.weaponMount.children[0];
        const mesh = new THREE.Mesh(src.geometry, src.material);
        mesh.position.set(0, 1, 0);
        scene.add(mesh);
        actors[`w:${model}`] = { rig: null, obj: mesh };
      }
      const cols = s.cols;
      const rows = Math.ceil(s.views.length / cols);
      const sheet = document.createElement('canvas');
      sheet.width = cols * TW;
      sheet.height = rows * TH;
      const ctx = sheet.getContext('2d');
      const v3 = new THREE.Vector3();
      for (const [i, v] of s.views.entries()) {
        for (const [name, a] of Object.entries(actors)) a.obj.visible = v.show.includes(name);
        const a = actors[v.show[0]];
        for (const [k, w] of Object.entries(walls)) {
          w.visible = v.wall === k;
          w.position.x = v.wallEdge !== undefined ? v.wallEdge - 2 : 0;
        }
        if (a.rig) {
          if (v.weapon !== undefined) a.rig.setWeapon(v.weapon);
          const p = Rig.idlePose();
          p.aim = v.aim ?? 0;
          if (v.shield) {
            p.shield = v.shield === 'up' ? 1 : 0.45;
            a.plate.position.set(...(v.shield === 'up' ? [-0.12, 0.92, -0.45] : [-0.36, 0.66, -0.18]));
            a.plate.rotation.set(v.shield === 'up' ? 0 : 0.12, v.shield === 'up' ? 0 : 0.9, 0);
          }
          if (v.hit?.walk) p.speed = v.hit.walk;
          for (let k = 0; k < 120; k++) a.rig.update(p, 1 / 60);
          a.rig.root.position.set(0, 0, 0);
          if (v.pose) {
            Object.assign(p, v.pose);
            const spins = v.turn ?? 0;
            for (let k = 0, n = Math.round((v.t ?? 1) * 60); k < n; k++) {
              a.rig.root.rotation.y += spins / 60;
              if (v.phase !== undefined) a.rig.gait.u = v.phase;
              a.rig.update(p, 1 / 60);
            }
            a.rig.root.rotation.y = 0;
          }
          if (v.hit) {
            // El golpe, paso a paso, como lo hace la simulación (decaimientos de `Enemy`).
            const h = v.hit;
            let flinch = 1;
            let stagger = h.stagger ? 1 : 0;
            let vz = h.fall === 4 ? 5.5 : 0;
            p.flinchFront = !h.back;
            p.flinchSide = 1;
            p.hitPart = h.part ?? 'torso';
            p.limp = h.limp ?? 0;
            if (h.disarm) p.aim = 0;
            for (let k = 0, n = Math.round(h.t * 60); k < n; k++) {
              if (h.fall !== undefined) {
                p.state = 'dead';
                p.death = h.fall;
                p.stateTime = (k + 1) / 60;
                a.rig.root.position.z += vz / 60;
                vz *= 0.85;
              } else if (!h.walk) {
                p.flinch = flinch * flinch;
                p.stagger = stagger;
                p.aim = h.disarm || stagger > 0.35 ? 0 : 1;
                flinch = Math.max(0, flinch - 4.5 / 60);
                stagger = Math.max(0, stagger - 1.9 / 60);
              }
              a.rig.update(p, 1 / 60);
            }
          }
        }
        scene.updateMatrixWorld(true);
        const muzzleAt = () => a.rig.weaponMount.localToWorld(new THREE.Vector3(0, 0.035, -0.635));
        const forward = () => new THREE.Vector3(0, 0, -1).transformDirection(a.rig.weaponMount.matrixWorld);
        if (v.fx) {
          // Un instante congelado del disparo: casquillos en el aire, trazadora en vuelo y fogonazo.
          const { Vfx } = await load('/src/render/vfx.ts');
          const vfx = new Vfx(scene, 1);
          const m0 = muzzleAt();
          const d0 = forward();
          for (let k = 0; k < 4; k++) {
            vfx.casing(m0, d0, 0);
            vfx.update(0.09);
          }
          vfx.tracer(m0, m0.clone().addScaledVector(d0, 40), 0xffe2a0);
          vfx.muzzle(m0, d0, true);
          vfx.update(0.007);
        }
        let t;
        if (Array.isArray(v.target)) t = new THREE.Vector3(...v.target);
        else if (v.target === 'muzzle') t = muzzleAt().addScaledVector(forward(), v.lead ?? 0);
        else if (v.target === 'head') t = a.rig.bones.head.getWorldPosition(v3.clone()).add(new THREE.Vector3(0, 0.1, 0));
        else if (v.target === 'chest') t = a.rig.bones.chest.getWorldPosition(v3.clone()).add(new THREE.Vector3(0, 0.15, 0));
        else t = new THREE.Vector3(0, 0.95, 0);
        const cam = r.camera;
        cam.fov = v.fov;
        cam.position.copy(t).add(new THREE.Vector3(...v.cam));
        cam.lookAt(t);
        cam.updateProjectionMatrix();
        r.render();
        const x = (i % cols) * TW;
        const y = Math.floor(i / cols) * TH;
        ctx.drawImage(r.canvas, x, y, TW, TH);
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(x, y, TW, 20);
        ctx.fillStyle = '#f2efe6';
        ctx.font = '600 13px system-ui, sans-serif';
        ctx.fillText(v.label, x + 6, y + 14);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(x + 0.5, y + 0.5, TW - 1, TH - 1);
      }
      r.dispose();
      host.remove();
      return sheet.toDataURL('image/png');
    }, spec);
    const file = join(OUT, `sheet-${name}.png`);
    writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
    console.log(`hoja ${name}: ${file}`);
  }
  if (errors.length) console.log('errores en la página:', errors.slice(0, 5));
  await browser.close();
} catch (err) {
  console.error(err);
  code = 1;
} finally {
  stop();
}
process.exit(code);
