import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from 'three';
import { Rng } from '../core/rng';

/**
 * Texturas 100 % procedurales (Canvas 2D): cero imágenes externas, carga instantánea.
 * Regla R2: todas las texturas de color usan SRGBColorSpace.
 */

export type TexKind =
  | 'grid'
  | 'gridDark'
  | 'gridOrange'
  | 'concrete'
  | 'plaster'
  | 'marble'
  | 'marbleDark'
  | 'marbleChecker'
  | 'wood'
  | 'carpet'
  | 'brushed'
  | 'crate'
  | 'corrugated'
  | 'asphalt'
  | 'tiles'
  | 'danceFloor'
  | 'brick'
  | 'wallpaper'
  | 'gravel'
  | 'hazard'
  | 'target'
  | 'noise';

const cache = new Map<string, Texture>();
let maxAnisotropy = 4;

export function setMaxAnisotropy(v: number): void {
  maxAnisotropy = Math.max(1, Math.min(8, v));
}

function makeCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D no disponible');
  return [c, ctx];
}

function finish(canvas: HTMLCanvasElement, srgb = true): CanvasTexture {
  const t = new CanvasTexture(canvas);
  t.wrapS = RepeatWrapping;
  t.wrapT = RepeatWrapping;
  t.anisotropy = maxAnisotropy;
  if (srgb) t.colorSpace = SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

function hex(c: number): string {
  return `#${c.toString(16).padStart(6, '0')}`;
}

function speckle(ctx: CanvasRenderingContext2D, size: number, rng: Rng, count: number, alpha: number, light: boolean): void {
  for (let i = 0; i < count; i++) {
    const v = light ? 255 : 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${rng.range(alpha * 0.3, alpha)})`;
    const s = rng.range(1, 3);
    ctx.fillRect(rng.range(0, size), rng.range(0, size), s, s);
  }
}

function gridTex(base: number, major: number, minor: number): CanvasTexture {
  // Un tile = 2 m (texScale 2): 2 celdas mayores de 1 m y subdivisión de 0,25 m.
  const size = 512;
  const [c, ctx] = makeCanvas(size);
  ctx.fillStyle = hex(base);
  ctx.fillRect(0, 0, size, size);
  // Damero sutil por metro.
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0, 0, size / 2, size / 2);
  ctx.fillRect(size / 2, size / 2, size / 2, size / 2);
  ctx.strokeStyle = hex(minor);
  ctx.lineWidth = 1.5;
  for (let i = 0; i <= 8; i++) {
    const p = (i * size) / 8;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
    ctx.stroke();
  }
  ctx.strokeStyle = hex(major);
  ctx.lineWidth = 4;
  for (let i = 0; i <= 2; i++) {
    const p = (i * size) / 2;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
    ctx.stroke();
  }
  return finish(c);
}

function concreteTex(seed: number): CanvasTexture {
  const size = 256;
  const [c, ctx] = makeCanvas(size);
  const rng = new Rng(seed);
  ctx.fillStyle = '#9a9a98';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 40; i++) {
    const g = ctx.createRadialGradient(rng.range(0, size), rng.range(0, size), 2, rng.range(0, size), rng.range(0, size), rng.range(20, 70));
    const v = rng.range(0, 1) > 0.5 ? 255 : 0;
    g.addColorStop(0, `rgba(${v},${v},${v},0.06)`);
    g.addColorStop(1, `rgba(${v},${v},${v},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  speckle(ctx, size, rng, 1400, 0.18, false);
  speckle(ctx, size, rng, 600, 0.12, true);
  return finish(c);
}

function plasterTex(seed: number): CanvasTexture {
  const size = 256;
  const [c, ctx] = makeCanvas(size);
  const rng = new Rng(seed);
  ctx.fillStyle = '#c8c2b6';
  ctx.fillRect(0, 0, size, size);
  speckle(ctx, size, rng, 900, 0.07, false);
  speckle(ctx, size, rng, 500, 0.06, true);
  // Moldura horizontal (zócalo) en la parte baja de cada repetición.
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  ctx.fillRect(0, size - 18, size, 4);
  return finish(c);
}

function marbleTex(seed: number, base: string, vein: string, accent: string): CanvasTexture {
  const size = 512;
  const [c, ctx] = makeCanvas(size);
  const rng = new Rng(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  speckle(ctx, size, rng, 1500, 0.05, true);
  const drawVein = (color: string, width: number, alpha: number, count: number): void => {
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    for (let v = 0; v < count; v++) {
      let x = rng.range(0, size);
      let y = -10;
      ctx.beginPath();
      ctx.moveTo(x, y);
      while (y < size + 10) {
        x += rng.range(-22, 22);
        y += rng.range(12, 30);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };
  drawVein(vein, 2.2, 0.35, 7);
  drawVein(vein, 1, 0.5, 9);
  drawVein(accent, 1.4, 0.45, 4);
  // Juntas de baldosa (1 baldosa = medio tile).
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, size / 2 - 2, size / 2 - 2);
  ctx.strokeRect(size / 2 + 1, 1, size / 2 - 2, size / 2 - 2);
  ctx.strokeRect(1, size / 2 + 1, size / 2 - 2, size / 2 - 2);
  ctx.strokeRect(size / 2 + 1, size / 2 + 1, size / 2 - 2, size / 2 - 2);
  return finish(c);
}

function marbleCheckerTex(seed: number): CanvasTexture {
  // Damero de mármol crema y negro: cada repetición son 2 × 2 losas.
  const size = 512;
  const half = size / 2;
  const [c, ctx] = makeCanvas(size);
  const rng = new Rng(seed);
  const slab = (x: number, y: number, base: string, vein: string, accent: string): void => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, half, half);
    ctx.clip();
    ctx.fillStyle = base;
    ctx.fillRect(x, y, half, half);
    ctx.lineCap = 'round';
    const veins = (color: string, width: number, alpha: number, count: number): void => {
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = width;
      for (let v = 0; v < count; v++) {
        let px = x + rng.range(0, half);
        let py = y - 10;
        ctx.beginPath();
        ctx.moveTo(px, py);
        while (py < y + half + 10) {
          px += rng.range(-20, 20);
          py += rng.range(12, 28);
          ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };
    veins(vein, 2, 0.35, 3);
    veins(vein, 1, 0.5, 4);
    veins(accent, 1.2, 0.4, 2);
    ctx.restore();
  };
  slab(0, 0, '#cfc8ba', '#8f8a80', '#c9a227');
  slab(half, half, '#cfc8ba', '#8f8a80', '#c9a227');
  slab(half, 0, '#1e1e23', '#77777e', '#d4af37');
  slab(0, half, '#1e1e23', '#77777e', '#d4af37');
  speckle(ctx, size, rng, 1200, 0.05, true);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, half, half);
  ctx.strokeRect(half, 0, half, half);
  ctx.strokeRect(0, half, half, half);
  ctx.strokeRect(half, half, half, half);
  return finish(c);
}

function woodTex(seed: number): CanvasTexture {
  const size = 256;
  const [c, ctx] = makeCanvas(size);
  const rng = new Rng(seed);
  ctx.fillStyle = '#7a5538';
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 2) {
    const tone = Math.sin(y * 0.09 + rng.range(0, 0.6)) * 14;
    ctx.fillStyle = `rgba(${40 + tone},${22 + tone * 0.5},${10},0.18)`;
    ctx.fillRect(0, y, size, 2);
  }
  // Paneles.
  ctx.strokeStyle = 'rgba(30,15,5,0.45)';
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, size - 12, size - 12);
  ctx.strokeStyle = 'rgba(255,220,170,0.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, size - 24, size - 24);
  return finish(c);
}

function carpetTex(seed: number): CanvasTexture {
  const size = 256;
  const [c, ctx] = makeCanvas(size);
  const rng = new Rng(seed);
  ctx.fillStyle = '#9a9a9a';
  ctx.fillRect(0, 0, size, size);
  speckle(ctx, size, rng, 2500, 0.1, false);
  ctx.strokeStyle = 'rgba(255,230,150,0.35)';
  ctx.lineWidth = 3;
  const s = size / 4;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const cx = i * s + s / 2;
      const cy = j * s + s / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - s * 0.35);
      ctx.lineTo(cx + s * 0.35, cy);
      ctx.lineTo(cx, cy + s * 0.35);
      ctx.lineTo(cx - s * 0.35, cy);
      ctx.closePath();
      ctx.stroke();
    }
  }
  return finish(c);
}

function brushedTex(seed: number): CanvasTexture {
  const size = 256;
  const [c, ctx] = makeCanvas(size);
  const rng = new Rng(seed);
  ctx.fillStyle = '#b4b8bd';
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y++) {
    const v = rng.range(0, 1) > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${rng.range(0.02, 0.08)})`;
    ctx.fillRect(0, y, size, 1);
  }
  // Remaches.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  for (const [x, y] of [
    [12, 12],
    [size - 12, 12],
    [12, size - 12],
    [size - 12, size - 12],
  ] as const) {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  return finish(c);
}

function crateTex(seed: number): CanvasTexture {
  const size = 256;
  const [c, ctx] = makeCanvas(size);
  const rng = new Rng(seed);
  ctx.fillStyle = '#a07a4c';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = `rgba(60,35,15,${rng.range(0.08, 0.2)})`;
    ctx.fillRect(0, i * (size / 5), size, size / 5 - 4);
    ctx.fillStyle = 'rgba(40,22,8,0.5)';
    ctx.fillRect(0, i * (size / 5) + size / 5 - 4, size, 4);
  }
  ctx.strokeStyle = '#5a3c1e';
  ctx.lineWidth = 18;
  ctx.strokeRect(9, 9, size - 18, size - 18);
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(14, 14);
  ctx.lineTo(size - 14, size - 14);
  ctx.stroke();
  return finish(c);
}

function corrugatedTex(): CanvasTexture {
  const size = 256;
  const [c, ctx] = makeCanvas(size);
  ctx.fillStyle = '#b0b0b0';
  ctx.fillRect(0, 0, size, size);
  for (let x = 0; x < size; x += 16) {
    const g = ctx.createLinearGradient(x, 0, x + 16, 0);
    g.addColorStop(0, 'rgba(0,0,0,0.28)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.18)');
    g.addColorStop(1, 'rgba(0,0,0,0.28)');
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, 16, size);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(0, 0, size, 6);
  ctx.fillRect(0, size - 6, size, 6);
  return finish(c);
}

function asphaltTex(seed: number): CanvasTexture {
  const size = 256;
  const [c, ctx] = makeCanvas(size);
  const rng = new Rng(seed);
  ctx.fillStyle = '#5a5d62';
  ctx.fillRect(0, 0, size, size);
  speckle(ctx, size, rng, 3000, 0.22, false);
  speckle(ctx, size, rng, 1400, 0.16, true);
  return finish(c);
}

function tilesTex(): CanvasTexture {
  const size = 256;
  const [c, ctx] = makeCanvas(size);
  ctx.fillStyle = '#6a6c72';
  ctx.fillRect(0, 0, size, size);
  const n = 4;
  const s = size / n;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      ctx.fillStyle = (i + j) % 2 === 0 ? '#2e3036' : '#34363d';
      ctx.fillRect(i * s + 3, j * s + 3, s - 6, s - 6);
    }
  }
  return finish(c);
}

function danceFloorTex(): CanvasTexture {
  const size = 256;
  const [c, ctx] = makeCanvas(size);
  const colors = ['#ff2e88', '#19e3ff', '#7a3cff', '#ffd23f', '#ff2e88', '#19e3ff'];
  const n = 4;
  const s = size / n;
  const rng = new Rng(77);
  ctx.fillStyle = '#101014';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      ctx.fillStyle = colors[rng.int(0, colors.length - 1)] ?? '#ff2e88';
      ctx.globalAlpha = rng.range(0.55, 1);
      ctx.fillRect(i * s + 4, j * s + 4, s - 8, s - 8);
    }
  }
  ctx.globalAlpha = 1;
  return finish(c);
}

function brickTex(seed: number): CanvasTexture {
  // Un tile = 2 m: hiladas de 12,5 cm y ladrillos de 25 cm, con mortero oscuro y hollín.
  const size = 512;
  const [c, ctx] = makeCanvas(size);
  const rng = new Rng(seed);
  ctx.fillStyle = '#2f2a28';
  ctx.fillRect(0, 0, size, size);
  const rows = 16;
  const bh = size / rows;
  const bw = size / 8;
  for (let r = 0; r < rows; r++) {
    const off = r % 2 === 0 ? 0 : bw / 2;
    for (let x = -bw; x < size; x += bw) {
      const v = rng.range(-12, 12);
      const soot = rng.chance(0.12) ? 0.62 : 1;
      ctx.fillStyle = `rgb(${Math.round((100 + v) * soot)},${Math.round((56 + v * 0.5) * soot)},${Math.round((48 + v * 0.4) * soot)})`;
      ctx.fillRect(x + off + 2, r * bh + 2, bw - 4, bh - 4);
      // Canto superior iluminado y base en sombra: relieve barato.
      ctx.fillStyle = 'rgba(255,220,200,0.10)';
      ctx.fillRect(x + off + 2, r * bh + 2, bw - 4, 2);
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(x + off + 2, r * bh + bh - 4, bw - 4, 2);
    }
  }
  // Manchas de humedad (lejos de los bordes para que el mosaico no se note).
  for (let i = 0; i < 12; i++) {
    const x = rng.range(70, size - 70);
    const y = rng.range(70, size - 70);
    const g = ctx.createRadialGradient(x, y, 2, x, y, rng.range(24, 64));
    g.addColorStop(0, 'rgba(0,0,0,0.20)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  return finish(c);
}

function wallpaperTex(seed: number): CanvasTexture {
  // Papel pintado del Continental: verde botella con rombos y florones dorados muy tenues.
  const size = 512;
  const [c, ctx] = makeCanvas(size);
  const rng = new Rng(seed);
  ctx.fillStyle = '#21403a';
  ctx.fillRect(0, 0, size, size);
  for (let x = 0; x < size; x += 32) {
    ctx.fillStyle = (x / 32) % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.07)';
    ctx.fillRect(x, 0, 32, size);
  }
  speckle(ctx, size, rng, 1400, 0.07, false);
  const n = 4;
  const s = size / n;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const cx = i * s + s / 2;
      const cy = j * s + s / 2;
      ctx.strokeStyle = 'rgba(212,175,55,0.22)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - s / 2);
      ctx.lineTo(cx + s / 2, cy);
      ctx.lineTo(cx, cy + s / 2);
      ctx.lineTo(cx - s / 2, cy);
      ctx.closePath();
      ctx.stroke();
      // Florón: cuatro pétalos y un botón central.
      ctx.fillStyle = 'rgba(212,175,55,0.30)';
      for (let k = 0; k < 4; k++) {
        const a = (k * Math.PI) / 2;
        ctx.beginPath();
        ctx.ellipse(cx + Math.cos(a) * s * 0.13, cy + Math.sin(a) * s * 0.13, s * 0.1, s * 0.045, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.035, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(i * s, j * s, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return finish(c);
}

function gravelTex(seed: number): CanvasTexture {
  const size = 256;
  const [c, ctx] = makeCanvas(size);
  const rng = new Rng(seed);
  ctx.fillStyle = '#86837d';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 1600; i++) {
    const v = rng.range(60, 200);
    ctx.fillStyle = `rgba(${v},${v * 0.98},${v * 0.94},0.55)`;
    ctx.beginPath();
    ctx.arc(rng.range(0, size), rng.range(0, size), rng.range(0.8, 2.6), 0, Math.PI * 2);
    ctx.fill();
  }
  return finish(c);
}

function hazardTex(): CanvasTexture {
  const size = 128;
  const [c, ctx] = makeCanvas(size);
  ctx.fillStyle = '#e8b81e';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#1a1a1a';
  for (let i = -size; i < size * 2; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 16, 0);
    ctx.lineTo(i + 16 - size, size);
    ctx.lineTo(i - size, size);
    ctx.closePath();
    ctx.fill();
  }
  return finish(c);
}

function targetTex(): CanvasTexture {
  const size = 256;
  const [c, ctx] = makeCanvas(size);
  ctx.fillStyle = '#efe9dc';
  ctx.fillRect(0, 0, size, size);
  const rings = ['#c8102e', '#efe9dc', '#c8102e', '#efe9dc', '#c8102e'];
  for (let i = 0; i < rings.length; i++) {
    ctx.fillStyle = rings[i] ?? '#c8102e';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.45 * (1 - i / rings.length), 0, Math.PI * 2);
    ctx.fill();
  }
  return finish(c);
}

function noiseTex(seed: number): CanvasTexture {
  const size = 128;
  const [c, ctx] = makeCanvas(size);
  const rng = new Rng(seed);
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);
  speckle(ctx, size, rng, 1200, 0.2, false);
  speckle(ctx, size, rng, 1200, 0.2, true);
  return finish(c);
}

export function getTexture(kind: TexKind): Texture {
  const hit = cache.get(kind);
  if (hit) return hit;
  let t: Texture;
  switch (kind) {
    case 'grid':
      t = gridTex(0xc9cdd4, 0x6f7680, 0x9aa1ab);
      break;
    case 'gridDark':
      t = gridTex(0x8b919b, 0x4c525b, 0x737a84);
      break;
    case 'gridOrange':
      t = gridTex(0xe58a3c, 0x9c4f17, 0xc96d27);
      break;
    case 'concrete':
      t = concreteTex(11);
      break;
    case 'plaster':
      t = plasterTex(12);
      break;
    case 'marble':
      t = marbleTex(13, '#d8d2c6', '#8f8a80', '#c9a227');
      break;
    case 'marbleDark':
      t = marbleTex(14, '#4c4c52', '#a9a6a0', '#d4af37');
      break;
    case 'marbleChecker':
      t = marbleCheckerTex(24);
      break;
    case 'wood':
      t = woodTex(15);
      break;
    case 'carpet':
      t = carpetTex(16);
      break;
    case 'brushed':
      t = brushedTex(17);
      break;
    case 'crate':
      t = crateTex(18);
      break;
    case 'corrugated':
      t = corrugatedTex();
      break;
    case 'asphalt':
      t = asphaltTex(19);
      break;
    case 'tiles':
      t = tilesTex();
      break;
    case 'danceFloor':
      t = danceFloorTex();
      break;
    case 'brick':
      t = brickTex(20);
      break;
    case 'wallpaper':
      t = wallpaperTex(23);
      break;
    case 'gravel':
      t = gravelTex(21);
      break;
    case 'hazard':
      t = hazardTex();
      break;
    case 'target':
      t = targetTex();
      break;
    case 'noise':
      t = noiseTex(22);
      break;
  }
  cache.set(kind, t);
  return t;
}

export interface SignTextOpts {
  text: string;
  sub?: string;
  color: number;
  bg?: number;
  font: 'serif' | 'sans';
  /** Píxeles por metro. */
  ppm?: number;
}

/** Textura de cartel con texto (neón o placa dorada). No se cachea: cada cartel es único. */
export function createSignTexture(w: number, h: number, o: SignTextOpts): CanvasTexture {
  const ppm = o.ppm ?? 128;
  const cw = Math.min(2048, Math.max(64, Math.round(w * ppm)));
  const ch = Math.min(1024, Math.max(32, Math.round(h * ppm)));
  const c = document.createElement('canvas');
  c.width = cw;
  c.height = ch;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D no disponible');
  if (o.bg !== undefined) {
    ctx.fillStyle = hex(o.bg);
    ctx.fillRect(0, 0, cw, ch);
  } else {
    ctx.clearRect(0, 0, cw, ch);
  }
  const family = o.font === 'serif' ? 'Georgia, "Times New Roman", serif' : 'system-ui, "Segoe UI", Arial, sans-serif';
  const mainSize = o.sub ? ch * 0.5 : ch * 0.66;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = hex(o.color);
  ctx.shadowColor = hex(o.color);
  ctx.shadowBlur = ch * 0.06;
  let size = mainSize;
  ctx.font = `700 ${size}px ${family}`;
  // Ajuste para que el texto quepa en el ancho.
  while (ctx.measureText(o.text).width > cw * 0.92 && size > 8) {
    size *= 0.92;
    ctx.font = `700 ${size}px ${family}`;
  }
  ctx.fillText(o.text, cw / 2, o.sub ? ch * 0.4 : ch / 2);
  if (o.sub) {
    let s2 = ch * 0.22;
    ctx.font = `500 ${s2}px ${family}`;
    while (ctx.measureText(o.sub).width > cw * 0.92 && s2 > 6) {
      s2 *= 0.92;
      ctx.font = `500 ${s2}px ${family}`;
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.85;
    ctx.fillText(o.sub, cw / 2, ch * 0.78);
    ctx.globalAlpha = 1;
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = maxAnisotropy;
  t.needsUpdate = true;
  return t;
}
