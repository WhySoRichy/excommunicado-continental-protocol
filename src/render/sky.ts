import { BackSide, CanvasTexture, CylinderGeometry, Mesh, MeshBasicMaterial, RepeatWrapping, SRGBColorSpace } from 'three';
import { Rng } from '../core/rng';

/**
 * Cielo nocturno con silueta de ciudad para los niveles exteriores: un cilindro enorme con una
 * textura procedural (degradado, estrellas y dos capas de edificios con ventanas encendidas).
 * Una sola draw call, sin niebla ni iluminación; el horizonte se funde con el color de la niebla.
 */
const SKY_RADIUS = 230;
const SKY_HEIGHT = 170;
/** El borde inferior queda por debajo del suelo para que nunca se vea el vacío. */
const SKY_BOTTOM = -30;
/** La textura da una vuelta completa sin repetirse (unos 35 cm por píxel a esa distancia). */
const TEX_W = 4096;
const TEX_H = 512;

function hex(c: number): string {
  return `#${c.toString(16).padStart(6, '0')}`;
}

function buildings(ctx: CanvasRenderingContext2D, rng: Rng, o: { base: number; minH: number; maxH: number; minW: number; maxW: number; body: string; lit: number; win: string[] }): void {
  let x = -10;
  while (x < TEX_W) {
    const w = rng.range(o.minW, o.maxW);
    const h = rng.range(o.minH, o.maxH);
    const top = o.base - h;
    ctx.fillStyle = o.body;
    ctx.fillRect(x, top, w, h + 4);
    // Remate: antena o azotea escalonada en algunos.
    if (rng.next() < 0.3) ctx.fillRect(x + w * 0.3, top - 8, w * 0.4, 8);
    if (rng.next() < 0.18) {
      ctx.fillRect(x + w / 2 - 1, top - 26, 2, 26);
      ctx.fillStyle = '#ff3b3b';
      ctx.fillRect(x + w / 2 - 2, top - 29, 4, 4);
    }
    // Ventanas en rejilla; solo algunas encendidas.
    const cols = Math.max(2, Math.floor(w / 7));
    const rows = Math.max(2, Math.floor(h / 9));
    const cw = w / cols;
    const rh = h / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (rng.next() > o.lit) continue;
        ctx.fillStyle = o.win[rng.int(0, o.win.length - 1)] ?? '#ffd9a0';
        ctx.globalAlpha = rng.range(0.45, 1);
        ctx.fillRect(x + c * cw + cw * 0.25, top + r * rh + rh * 0.25, cw * 0.5, rh * 0.45);
      }
    }
    ctx.globalAlpha = 1;
    x += w + rng.range(-2, 10);
  }
}

function skylineTexture(horizon: number): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = TEX_W;
  c.height = TEX_H;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D no disponible');
  const rng = new Rng(4242);
  // Altura del horizonte en la textura (el suelo del nivel queda a esta fila).
  const base = Math.round(TEX_H * (1 - -SKY_BOTTOM / SKY_HEIGHT));
  const g = ctx.createLinearGradient(0, 0, 0, base);
  g.addColorStop(0, '#05070f');
  g.addColorStop(0.45, '#0d1326');
  g.addColorStop(0.8, '#27213f');
  g.addColorStop(1, '#5a3550');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, TEX_W, base);
  // Estrellas tenues en la mitad alta.
  for (let i = 0; i < 1100; i++) {
    const v = rng.range(120, 255);
    ctx.fillStyle = `rgba(${v},${v},${Math.min(255, v + 20)},${rng.range(0.25, 0.9)})`;
    const s = rng.next() < 0.1 ? 2 : 1;
    ctx.fillRect(rng.range(0, TEX_W), rng.range(0, base * 0.6), s, s);
  }
  // Luna con halo.
  const mx = TEX_W * 0.62;
  const my = base * 0.3;
  const halo = ctx.createRadialGradient(mx, my, 6, mx, my, 110);
  halo.addColorStop(0, 'rgba(190,205,255,0.32)');
  halo.addColorStop(1, 'rgba(190,205,255,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(mx - 110, my - 110, 220, 220);
  ctx.fillStyle = '#e6ebf7';
  ctx.beginPath();
  ctx.arc(mx, my, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(150,160,185,0.5)';
  for (const [dx, dy, r] of [[-4, -3, 3], [5, 2, 2.4], [-1, 6, 2]] as const) {
    ctx.beginPath();
    ctx.arc(mx + dx, my + dy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // Resplandor de la ciudad sobre el horizonte.
  const glow = ctx.createLinearGradient(0, base - 120, 0, base);
  glow.addColorStop(0, 'rgba(255,140,90,0)');
  glow.addColorStop(1, 'rgba(255,150,100,0.28)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, base - 120, TEX_W, 120);
  buildings(ctx, rng, { base, minH: 40, maxH: 150, minW: 26, maxW: 60, body: '#161a2e', lit: 0.16, win: ['#ffd9a0', '#bcd8ff'] });
  buildings(ctx, rng, { base, minH: 20, maxH: 95, minW: 34, maxW: 80, body: '#0a0c16', lit: 0.22, win: ['#ffcf8a', '#fff1d0', '#9fd0ff', '#ff6fae'] });
  // Bajo el horizonte: el color de la niebla del nivel, para fundirse con el suelo lejano.
  ctx.fillStyle = hex(horizon);
  ctx.fillRect(0, base, TEX_W, TEX_H - base);
  const haze = ctx.createLinearGradient(0, base - 26, 0, base + 2);
  haze.addColorStop(0, 'rgba(0,0,0,0)');
  haze.addColorStop(1, hex(horizon));
  ctx.fillStyle = haze;
  ctx.fillRect(0, base - 26, TEX_W, 28);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

export interface Skyline {
  mesh: Mesh;
  dispose(): void;
}

/** Cilindro de cielo centrado en (cx, cz); `y` desplaza el horizonte. `horizon` = color de la niebla del nivel. */
export function createSkyline(cx: number, cz: number, y: number, horizon: number): Skyline {
  const tex = skylineTexture(horizon);
  const geo = new CylinderGeometry(SKY_RADIUS, SKY_RADIUS, SKY_HEIGHT, 48, 1, true);
  const mat = new MeshBasicMaterial({ map: tex, side: BackSide, fog: false, depthWrite: false, toneMapped: false });
  const mesh = new Mesh(geo, mat);
  mesh.name = 'skyline';
  mesh.position.set(cx, y + SKY_BOTTOM + SKY_HEIGHT / 2, cz);
  mesh.renderOrder = -10;
  mesh.frustumCulled = false;
  return {
    mesh,
    dispose(): void {
      geo.dispose();
      mat.dispose();
      tex.dispose();
    },
  };
}
