import type { BoxDef, LevelData, Vec3 } from './types';

/**
 * Validación pura de datos de nivel. Se ejecuta en Vitest para todos los niveles:
 * un nivel mal escrito falla en CI antes de llegar al navegador.
 */

/** Pisos mínimos de luz (R1). */
export const LIGHT_FLOOR = { hemi: 0.6, ambient: 0.1, ibl: 0.15, exposure: 0.8 } as const;
/** Máximo de point lights por nivel (R7: coste por fragmento en forward rendering). */
export const MAX_POINT_LIGHTS = 10;

function finite(v: Vec3): boolean {
  return v.every((n) => Number.isFinite(n));
}

function inside(p: Vec3, d: LevelData, margin = 0): boolean {
  const { min, max } = d.bounds;
  return (
    p[0] >= min[0] - margin &&
    p[0] <= max[0] + margin &&
    p[1] >= min[1] - margin &&
    p[1] <= max[1] + margin &&
    p[2] >= min[2] - margin &&
    p[2] <= max[2] + margin
  );
}

/** ¿El punto está dentro de la caja (OBB con giro en Y)? */
export function pointInBox(p: Vec3, b: BoxDef, inflate = 0): boolean {
  const dx = p[0] - b.c[0];
  const dy = p[1] - b.c[1];
  const dz = p[2] - b.c[2];
  const r = -(b.rotY ?? 0);
  const lx = dx * Math.cos(r) + dz * Math.sin(r);
  const lz = -dx * Math.sin(r) + dz * Math.cos(r);
  return (
    Math.abs(lx) <= b.s[0] / 2 + inflate && Math.abs(dy) <= b.s[1] / 2 + inflate && Math.abs(lz) <= b.s[2] / 2 + inflate
  );
}

/** ¿Un cuerpo de pie en `feet` choca con alguna caja sólida? Muestrea pies, cintura y cabeza. */
export function standingBlocked(feet: Vec3, boxes: readonly BoxDef[], radius = 0.3): BoxDef | null {
  const samples: Vec3[] = [
    [feet[0], feet[1] + 0.35, feet[2]],
    [feet[0], feet[1] + 0.9, feet[2]],
    [feet[0], feet[1] + 1.6, feet[2]],
  ];
  for (const b of boxes) {
    if (b.collide === false) continue;
    for (const s of samples) if (pointInBox(s, b, radius)) return b;
  }
  return null;
}

function luma(c: number): number {
  const r = ((c >> 16) & 255) / 255;
  const g = ((c >> 8) & 255) / 255;
  const b = (c & 255) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function validateLevel(d: LevelData): string[] {
  const errs: string[] = [];
  const e = (m: string): void => {
    errs.push(`[${d.id}] ${m}`);
  };
  if (!d.name) e('sin nombre');

  // R1: piso de luz ambiental.
  const a = d.ambient;
  if (a.hemi < LIGHT_FLOOR.hemi) e(`hemi ${a.hemi} < ${LIGHT_FLOOR.hemi}`);
  if (a.ambient < LIGHT_FLOOR.ambient) e(`ambient ${a.ambient} < ${LIGHT_FLOOR.ambient}`);
  if (a.ibl < LIGHT_FLOOR.ibl) e(`ibl ${a.ibl} < ${LIGHT_FLOOR.ibl}`);
  if (a.exposure < LIGHT_FLOOR.exposure) e(`exposure ${a.exposure} < ${LIGHT_FLOOR.exposure}`);
  if (luma(a.sky) < 0.15) e('cielo de hemisferio demasiado oscuro');
  if (a.fog && a.fog.near < 15) e('niebla demasiado cercana (reduce visibilidad jugable)');

  if (d.lights.length > MAX_POINT_LIGHTS) e(`${d.lights.length} point lights > ${MAX_POINT_LIGHTS}`);
  if (d.killY >= d.bounds.min[1]) e('killY debe estar por debajo de bounds.min.y');

  d.boxes.forEach((b, i) => {
    if (!finite(b.c) || !finite(b.s)) e(`caja ${i} con valores no finitos`);
    if (b.s.some((v) => v <= 0)) e(`caja ${i} con tamaño no positivo`);
    if (!inside(b.c, d, 2)) e(`caja ${i} (${b.tag ?? b.mat}) fuera de bounds`);
  });
  d.ramps.forEach((r, i) => {
    if (!finite(r.from) || !finite(r.to)) e(`rampa ${i} no finita`);
    if (r.w <= 0) e(`rampa ${i} con ancho no positivo`);
  });

  const solids = d.boxes.filter((b) => b.collide !== false);
  const checkFree = (label: string, p: Vec3): void => {
    if (!finite(p)) e(`${label} no finito`);
    if (!inside(p, d)) e(`${label} fuera de bounds`);
    const hit = standingBlocked(p, solids, 0.25);
    if (hit) e(`${label} dentro de geometría (${hit.tag ?? hit.mat} en ${hit.c.join(',')})`);
  };
  checkFree('spawn', d.spawn.pos);
  for (const c of d.checkpoints) checkFree(`checkpoint ${c.id}`, c.pos);
  for (const en of d.enemies) checkFree(`enemigo ${en.id}`, en.pos);
  for (const cv of d.civilians) checkFree(`civil ${cv.id}`, cv.pos);

  const ids = new Set<string>();
  const uniq = (kind: string, id: string): void => {
    const k = `${kind}:${id}`;
    if (ids.has(k)) e(`id duplicado ${k}`);
    ids.add(k);
  };
  d.checkpoints.forEach((c) => uniq('cp', c.id));
  d.enemies.forEach((x) => uniq('enemy', x.id));
  d.civilians.forEach((x) => uniq('civ', x.id));
  d.pickups.forEach((x) => uniq('pickup', x.id));
  d.interactables.forEach((x) => uniq('int', x.id));
  d.triggers.forEach((x) => uniq('trig', x.id));
  return errs;
}
