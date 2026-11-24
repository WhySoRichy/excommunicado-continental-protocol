// Hojas de diseño: armas, personajes y efectos dibujados con el motor del juego, aislados y con luz de
// estudio, para revisar el aspecto sin entrar en el juego.
// Uso: `npm run sheets` (todas) o `npm run sheets -- armas cara`. Salida: qa-screenshots/sheets/ (no se versiona).
// Hojas: armas, efectos, cara, wick, sommelier. Arranca su propio servidor de desarrollo de Vite en el puerto 5173.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const PROJECT = process.cwd();
const OUT = join(PROJECT, 'qa-screenshots', 'sheets');
const URL = 'http://localhost:5173';

// Vistas. `target`: 'body' | 'head' | 'chest' | [x, y, z]; `cam`: desplazamiento de la cámara desde el objetivo.
const W = (model, d, zc) => ({ label: model, show: [`w:${model}`], target: [0, 1, zc], cam: [d, 0, 0], fov: 30 });
const SHEETS = {
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
            weapon: d.weapon.model,
            uniqueMaterial: true,
          }),
        );
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
        if (a.rig) {
          if (v.weapon !== undefined) a.rig.setWeapon(v.weapon);
          const p = Rig.idlePose();
          p.aim = v.aim ?? 0;
          for (let k = 0; k < 120; k++) a.rig.update(p, 1 / 60);
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
        else if (v.target === 'head') t = a.rig.head.getWorldPosition(v3.clone()).add(new THREE.Vector3(0, 0.1, 0));
        else if (v.target === 'chest') t = a.rig.torso.getWorldPosition(v3.clone()).add(new THREE.Vector3(0, 0.38, 0));
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
