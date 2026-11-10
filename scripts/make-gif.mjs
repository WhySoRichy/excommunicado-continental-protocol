// Monta docs/media/gameplay.gif a partir de los fotogramas de `npm run media`.
// Requiere ffmpeg en el PATH. Paleta propia (palettegen) para que el GIF pese poco y no tenga bandas.
import { spawnSync } from 'node:child_process';
import { existsSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const media = join(process.cwd(), 'docs', 'media');
const frames = join(media, 'frames');
const out = join(media, 'gameplay.gif');
const FPS = 12;
const WIDTH = 720;

if (!existsSync(join(frames, 'frame-000.png'))) {
  console.error('[gif] no hay fotogramas en docs/media/frames: ejecuta primero `npm run media`.');
  process.exit(1);
}
const filter = `fps=${FPS},scale=${WIDTH}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`;
const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(frames, 'frame-%03d.png'), '-vf', filter, '-loop', '0', out], { stdio: 'inherit' });
if (r.error) {
  console.error('[gif] no se pudo ejecutar ffmpeg (¿está instalado y en el PATH?):', r.error.message);
  process.exit(1);
}
if (r.status !== 0) process.exit(r.status ?? 1);
rmSync(frames, { recursive: true, force: true });
console.log(`[gif] ${out} (${(statSync(out).size / 1024 / 1024).toFixed(2)} MB)`);
