// Capturas de perfil de cada pose del jugador y de enemigos apuntando, para revisar animaciones.
// Uso: en una terminal `npm run build && npm run preview`; en otra, `npm run poses`.
// Salida: qa-screenshots/poses/ (no se versiona).
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const OUT = join(process.cwd(), 'qa-screenshots', 'poses');
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'] });
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
page.on('pageerror', (e) => console.log('ERROR', e.message));
await page.goto('http://localhost:4173/?qa=1&level=arena');
await page.waitForFunction(() => window.__EXCOM__?.ready === true);
await page.evaluate(() => window.__EXCOM__.setSettings({ hints: false, fov: 60 }));
await page.getByRole('button', { name: 'Arena de pruebas (QA)' }).click();
await page.waitForFunction(() => window.__EXCOM__.state() === 'playing');
const SIDE = Math.PI / 2;
const clip = { x: 100, y: 150, width: 640, height: 520 };
const shot = async (name) => {
  await page.evaluate(() => window.__EXCOM__.measureFps(0.25));
  await page.screenshot({ path: join(OUT, `${name}.png`), clip });
};
const reset = async (yawCam = SIDE) => {
  await page.evaluate((y) => {
    const q = window.__EXCOM__;
    q.setManual(true);
    q.releaseAll();
    q.teleport(0, 0, 8, 0);
    q.setLook(y, -0.18);
    q.step(30, {});
  }, yawCam);
};
const ev = (fn, arg) => page.evaluate(fn, arg);

await reset();
await shot('01-reposo');
await ev(() => window.__EXCOM__.step(26, { moveX: 1 }));
await shot('02-trote');
await reset();
await ev(() => window.__EXCOM__.step(40, { moveX: 1, sprint: true }));
await shot('03-sprint');
await reset();
await ev(() => { const q = window.__EXCOM__; q.step(1, { crouch: true }); q.step(40, {}); });
await shot('04-agachado');
await ev(() => window.__EXCOM__.step(25, { moveX: 1 }));
await shot('05-agachado-andando');
for (const [n, steps] of [['06-slide-a', 6], ['07-slide-b', 18], ['08-slide-c', 34]]) {
  await reset(0);
  await ev((s) => { const q = window.__EXCOM__; q.teleport(-10, 0, 9, Math.PI / 2); q.setLook(Math.PI / 2, -0.18); q.step(45, { moveY: 1, sprint: true }); q.step(1, { moveY: 1, sprint: true, crouch: true }); q.setLook(0, -0.18); q.step(s, {}); }, steps);
  console.log(n, await ev(() => { const p = window.__EXCOM__.player(); return p.state + ' v=' + p.speed.toFixed(1); }));
  await shot(n);
}
for (const [n, steps] of [['09-voltereta-a', 8], ['10-voltereta-b', 18]]) {
  await reset();
  await ev((s) => { const q = window.__EXCOM__; q.step(10, { moveX: 1 }); q.step(1, { moveX: 1, dodge: true }); q.step(s, { moveX: 1 }); }, steps);
  await shot(n);
}
await reset();
await ev(() => { const q = window.__EXCOM__; q.step(1, { moveX: 1, jump: true }); q.step(14, { moveX: 1 }); });
await shot('11-salto');
// Apuntando: el jugador mira hacia donde mira la cámara, así que se ve de espaldas y en 3/4.
await reset(0);
await ev(() => window.__EXCOM__.step(30, { aim: true }));
await shot('12-apuntando-espalda');
await ev(() => { const q = window.__EXCOM__; q.press('weapon1'); q.step(40, { aim: true }); });
await shot('13-apuntando-carabina');
await ev(() => { const q = window.__EXCOM__; q.press('fire'); q.step(8, { aim: true }); q.press('reload'); q.step(40, {}); });
await shot('14-recarga');
await reset();
await ev(() => { const q = window.__EXCOM__; q.press('weapon2'); q.step(40, {}); });
await shot('15-pistola-perfil');
await ev(() => { const q = window.__EXCOM__; q.press('weapon1'); q.step(40, {}); });
await shot('16-carabina-perfil');
// Enemigos apuntando al jugador, vistos de perfil (mismo rig): pistola, SMG, rifle y escopeta.
let i = 17;
for (const type of ['thug', 'escort', 'marksman', 'heavy']) {
  await reset();
  await ev((t) => { const q = window.__EXCOM__; q.setGod(true); q.runDebug('killAll'); q.step(2, {}); q.teleport(0, 0, 14, 0); q.spawnEnemy(t, 0, 0, 8, true); q.step(150, {}); const e = q.enemies().filter((x) => x.alive)[0]; q.teleport(e.x + 4.5, 0, e.z + 3.2, 0); q.setLook(Math.PI / 2, -0.12); q.step(3, {}); }, type);
  await shot(`${i++}-enemigo-${type}`);
}
// Jugador agachado apuntando y deslizándose apuntando (de espaldas en 3/4).
await reset(0.6);
await ev(() => { const q = window.__EXCOM__; q.runDebug('killAll'); q.step(1, { crouch: true }); q.step(40, { aim: true }); });
await shot(`${i++}-agachado-apuntando`);
console.log('capturas en', OUT);
await browser.close();
