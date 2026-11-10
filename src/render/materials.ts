import { Color, DoubleSide, MeshBasicMaterial, MeshStandardMaterial } from 'three';
import type { MaterialId } from '../levels/types';
import { getTexture, type TexKind } from './textures';

interface MatSpec {
  color: number;
  tex?: TexKind;
  /** Metros por repetición de textura (las UV de nivel están en metros). */
  texScale: number;
  roughness: number;
  metalness: number;
  emissive?: number;
  emissiveIntensity?: number;
  emissiveFromMap?: boolean;
  transparent?: boolean;
  opacity?: number;
}

// R2: metalness ≤ 0,3 salvo dorados (el IBL tenue evita que el metal se vea negro).
const SPECS: Record<MaterialId, MatSpec> = {
  qaGrid: { color: 0xffffff, tex: 'grid', texScale: 2, roughness: 0.85, metalness: 0 },
  qaGridDark: { color: 0xffffff, tex: 'gridDark', texScale: 2, roughness: 0.85, metalness: 0 },
  qaOrange: { color: 0xffffff, tex: 'gridOrange', texScale: 2, roughness: 0.7, metalness: 0 },
  concrete: { color: 0xd8d8d6, tex: 'concrete', texScale: 3, roughness: 0.92, metalness: 0 },
  concreteDark: { color: 0x8a8a88, tex: 'concrete', texScale: 3, roughness: 0.92, metalness: 0 },
  plaster: { color: 0xffffff, tex: 'plaster', texScale: 2.5, roughness: 0.9, metalness: 0 },
  plasterDark: { color: 0x8c857a, tex: 'plaster', texScale: 2.5, roughness: 0.9, metalness: 0 },
  marble: { color: 0xffffff, tex: 'marble', texScale: 3, roughness: 0.32, metalness: 0 },
  marbleDark: { color: 0xffffff, tex: 'marbleDark', texScale: 3, roughness: 0.28, metalness: 0 },
  woodPanel: { color: 0xffffff, tex: 'wood', texScale: 1.6, roughness: 0.6, metalness: 0 },
  woodDark: { color: 0x9b8576, tex: 'wood', texScale: 1.6, roughness: 0.6, metalness: 0 },
  carpetRed: { color: 0xb8414f, tex: 'carpet', texScale: 2, roughness: 0.95, metalness: 0 },
  carpetGreen: { color: 0x3f8063, tex: 'carpet', texScale: 2, roughness: 0.95, metalness: 0 },
  gold: { color: 0xd4af37, texScale: 1, roughness: 0.35, metalness: 0.65, emissive: 0x3a2a05, emissiveIntensity: 0.5 },
  brass: { color: 0xb88c3e, texScale: 1, roughness: 0.4, metalness: 0.5 },
  metal: { color: 0xc4c8ce, tex: 'brushed', texScale: 1.5, roughness: 0.5, metalness: 0.3 },
  metalDark: { color: 0x737880, tex: 'brushed', texScale: 1.5, roughness: 0.55, metalness: 0.3 },
  steelBlue: { color: 0x8499b6, tex: 'brushed', texScale: 1.5, roughness: 0.5, metalness: 0.3 },
  crate: { color: 0xffffff, tex: 'crate', texScale: 1.2, roughness: 0.82, metalness: 0 },
  containerRed: { color: 0xc04a36, tex: 'corrugated', texScale: 2.6, roughness: 0.7, metalness: 0.15 },
  containerBlue: { color: 0x3a6cb0, tex: 'corrugated', texScale: 2.6, roughness: 0.7, metalness: 0.15 },
  containerGreen: { color: 0x47875a, tex: 'corrugated', texScale: 2.6, roughness: 0.7, metalness: 0.15 },
  containerYellow: { color: 0xd4a32f, tex: 'corrugated', texScale: 2.6, roughness: 0.7, metalness: 0.15 },
  asphalt: { color: 0xffffff, tex: 'asphalt', texScale: 4, roughness: 0.95, metalness: 0 },
  tilesBlack: { color: 0xffffff, tex: 'tiles', texScale: 2, roughness: 0.35, metalness: 0 },
  danceFloor: { color: 0xffffff, tex: 'danceFloor', texScale: 4, roughness: 0.3, metalness: 0, emissive: 0xffffff, emissiveIntensity: 0.85, emissiveFromMap: true },
  glass: { color: 0xa8dcff, texScale: 1, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.22 },
  leather: { color: 0x5a372c, texScale: 1, roughness: 0.55, metalness: 0 },
  velvet: { color: 0x8a1e42, tex: 'noise', texScale: 1, roughness: 0.92, metalness: 0 },
  brick: { color: 0xffffff, tex: 'brick', texScale: 2, roughness: 0.9, metalness: 0 },
  water: { color: 0x23557a, texScale: 1, roughness: 0.12, metalness: 0.1 },
  roofGravel: { color: 0xffffff, tex: 'gravel', texScale: 2, roughness: 0.96, metalness: 0 },
  hazard: { color: 0xffffff, tex: 'hazard', texScale: 1, roughness: 0.7, metalness: 0 },
  targetBoard: { color: 0xffffff, tex: 'target', texScale: 1, roughness: 0.8, metalness: 0 },
};

const levelCache = new Map<MaterialId, MeshStandardMaterial>();

export function texScaleOf(id: MaterialId): number {
  return SPECS[id].texScale;
}

/** Material compartido de geometría de nivel (uno por id). */
export function getLevelMaterial(id: MaterialId): MeshStandardMaterial {
  const hit = levelCache.get(id);
  if (hit) return hit;
  const s = SPECS[id];
  const m = new MeshStandardMaterial({
    color: s.color,
    roughness: s.roughness,
    metalness: s.metalness,
  });
  if (s.tex) m.map = getTexture(s.tex);
  if (s.emissive !== undefined) {
    m.emissive = new Color(s.emissive);
    m.emissiveIntensity = s.emissiveIntensity ?? 1;
    if (s.emissiveFromMap && m.map) m.emissiveMap = m.map;
  }
  if (s.transparent) {
    m.transparent = true;
    m.opacity = s.opacity ?? 0.5;
    m.depthWrite = false;
    m.side = DoubleSide;
  }
  m.name = `level:${id}`;
  levelCache.set(id, m);
  return m;
}

const neonCache = new Map<string, MeshBasicMaterial>();

/** Material de neón (no iluminado, siempre legible). `intensity` > 1 alimenta el bloom opcional. */
export function getNeonMaterial(color: number, intensity = 1.6): MeshBasicMaterial {
  const key = `${color}:${intensity}`;
  const hit = neonCache.get(key);
  if (hit) return hit;
  const c = new Color(color).multiplyScalar(intensity);
  const m = new MeshBasicMaterial({ color: c });
  m.name = `neon:${key}`;
  neonCache.set(key, m);
  return m;
}

export interface RimUniforms {
  rimColor: { value: Color };
  rimStrength: { value: number };
  rimPower: { value: number };
}

/**
 * Rim light Fresnel inyectado en MeshStandardMaterial (regla R1, docs/ARQUITECTURA.md):
 * enemigos, civiles e interactivos se distinguen aunque estén en sombra.
 * Todas las variantes comparten programa (customProgramCacheKey) y cada
 * material conserva sus propios uniforms.
 */
export function addRim(mat: MeshStandardMaterial, color: number, strength: number, power = 2.4): RimUniforms {
  const u: RimUniforms = {
    rimColor: { value: new Color(color) },
    rimStrength: { value: strength },
    rimPower: { value: power },
  };
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.rimColor = u.rimColor;
    shader.uniforms.rimStrength = u.rimStrength;
    shader.uniforms.rimPower = u.rimPower;
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 rimColor;\nuniform float rimStrength;\nuniform float rimPower;')
      .replace(
        '#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n{\n  float rimF = 1.0 - saturate( dot( normal, normalize( vViewPosition ) ) );\n  totalEmissiveRadiance += rimColor * ( rimStrength * pow( rimF, rimPower ) );\n}',
      );
  };
  mat.customProgramCacheKey = () => 'rim-v1';
  mat.userData.rim = u;
  return u;
}
