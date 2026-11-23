// Texturas fotoescaneadas de los escenarios: las descarga de Poly Haven (licencia CC0) y las deja en
// public/textures/<id>/ como WebP: color, normal (convención OpenGL) y «arm» (oclusión, rugosidad y metal en los canales
// rojo, verde y azul, como los lee three.js). Las convertidas se versionan; este script solo hace falta para cambiarlas.
// Uso: `npm run textures` (todas) o `npm run textures -- marble_01 plywood`. Necesita ffmpeg con libwebp.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'public', 'textures');
const API = 'https://api.polyhaven.com/files/';
const HEADERS = { 'User-Agent': 'excom-texture-fetch/1.0' };

/**
 * Las texturas del juego. `gray`: el color se guarda en escala de grises para teñirlo desde el material (los
 * contenedores de cuatro colores comparten una).
 */
const SETS = [
  { id: 'concrete_floor_worn_001' },
  { id: 'plastered_wall' },
  { id: 'marble_01' },
  { id: 'rosewood_veneer1' },
  { id: 'dark_wood' },
  { id: 'velour_velvet' },
  { id: 'brown_leather' },
  { id: 'metal_plate' },
  { id: 'metal_plate_02' },
  { id: 'blue_metal_plate' },
  { id: 'container_side', gray: true },
  { id: 'asphalt_02' },
  { id: 'granite_tile' },
  { id: 'red_brick_03' },
  { id: 'tarred_gravel' },
  { id: 'plywood' },
];

/** Calidad WebP de cada mapa y, si se reduce, su tamaño: la rugosidad y la oclusión no necesitan 1024 px. */
const MAPS = [
  { key: 'Diffuse', file: 'color', quality: 82 },
  { key: 'nor_gl', file: 'normal', quality: 84 },
  { key: 'arm', file: 'arm', quality: 72, size: 512 },
];

async function json(url) {
  const r = await fetch(url, { headers: HEADERS });
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.json();
}

async function download(url, to) {
  const r = await fetch(url, { headers: HEADERS });
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  writeFileSync(to, Buffer.from(await r.arrayBuffer()));
}

const only = new Set(process.argv.slice(2));
const work = mkdtempSync(join(tmpdir(), 'excom-textures-'));
let total = 0;
try {
  for (const set of SETS) {
    if (only.size && !only.has(set.id)) continue;
    const files = await json(API + set.id);
    const dir = join(OUT, set.id);
    mkdirSync(dir, { recursive: true });
    const sizes = [];
    for (const m of MAPS) {
      const src = files[m.key]?.['1k']?.jpg?.url;
      if (!src) throw new Error(`${set.id}: falta ${m.key} a 1k`);
      const raw = join(work, `${set.id}-${m.file}.jpg`);
      await download(src, raw);
      const out = join(dir, `${m.file}.webp`);
      const vf = [m.size ? `scale=${m.size}:${m.size}:flags=lanczos` : '', m.file === 'color' && set.gray ? 'format=gray,format=rgb24' : ''].filter(Boolean);
      const filter = vf.length ? ['-vf', vf.join(',')] : [];
      execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', raw, ...filter, '-c:v', 'libwebp', '-quality', String(m.quality), out]);
      const kb = statSync(out).size / 1024;
      total += kb;
      sizes.push(`${m.file} ${kb.toFixed(0)} KB`);
    }
    console.log(set.id.padEnd(26), sizes.join(' · '));
  }
  console.log(`total: ${(total / 1024).toFixed(2)} MB`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
