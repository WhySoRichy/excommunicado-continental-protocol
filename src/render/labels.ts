import { CanvasTexture, Sprite, SpriteMaterial, SRGBColorSpace } from 'three';

/** Etiqueta de texto en el mundo (nombre de NPC, baliza). Un canvas por etiqueta. */
export function makeTextSprite(text: string, color = '#d4af37', bg = 'rgba(12,14,18,0.78)'): Sprite {
  const ppm = 96;
  const font = `700 ${Math.round(ppm * 0.42)}px system-ui, "Segoe UI", Arial, sans-serif`;
  const measure = document.createElement('canvas').getContext('2d');
  if (!measure) throw new Error('Canvas 2D no disponible');
  measure.font = font;
  const textW = measure.measureText(text).width;
  const padX = ppm * 0.3;
  const w = Math.min(1024, Math.ceil(textW + padX * 2));
  const h = Math.round(ppm * 0.7);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D no disponible');
  ctx.fillStyle = bg;
  const r = h / 2;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.arc(w - r, r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(r, h);
  ctx.arc(r, r, r, Math.PI / 2, (Math.PI * 3) / 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 + 2);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  const mat = new SpriteMaterial({ map: tex, depthTest: false, depthWrite: false, transparent: true, toneMapped: false });
  const s = new Sprite(mat);
  // Alto fijo en el mundo (0,26 m); el ancho sigue la proporción del texto.
  const worldH = 0.26;
  s.scale.set((w / h) * worldH, worldH, 1);
  s.renderOrder = 15;
  return s;
}

export function disposeSprite(s: Sprite): void {
  const m = s.material;
  m.map?.dispose();
  m.dispose();
  s.removeFromParent();
}
