// Monta docs/media/juego.webp (una imagen animada) con los fotogramas de `npm run media`.
// Requiere ffmpeg en el PATH. WebP animado: la tercera parte de lo que pesaría un GIF, y sin bandas de color.
import { spawnSync } from 'node:child_process';
import { existsSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const media = join(process.cwd(), 'docs', 'media');
const frames = join(media, 'frames');
const out = join(media, 'juego.webp');
const FPS = 15;
const WIDTH = 720;
const QUALITY = 50;

if (!existsSync(join(frames, 'frame-000.jpg'))) {
  console.error('[clip] no hay fotogramas en docs/media/frames: ejecuta primero `npm run media`.');
  process.exit(1);
}
const args = ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(frames, 'frame-%03d.jpg'), '-vf', `scale=${WIDTH}:-2:flags=lanczos`];
const r = spawnSync('ffmpeg', [...args, '-c:v', 'libwebp', '-lossless', '0', '-quality', String(QUALITY), '-compression_level', '6', '-loop', '0', out], {
  stdio: 'inherit',
});
if (r.error) {
  console.error('[clip] no se pudo ejecutar ffmpeg (¿está instalado y en el PATH?):', r.error.message);
  process.exit(1);
}
if (r.status !== 0) process.exit(r.status ?? 1);
rmSync(frames, { recursive: true, force: true });
console.log(`[clip] ${out} (${(statSync(out).size / 1024 / 1024).toFixed(2)} MB)`);
