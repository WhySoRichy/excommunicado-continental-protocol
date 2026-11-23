import { Color, DoubleSide, MeshBasicMaterial, MeshStandardMaterial, ShaderChunk, type Texture } from 'three';
import type { MaterialId } from '../levels/types';
import { onPbrLoaded, type PbrSetId, pbrMaps } from './pbrTextures';
import { getTexture, type TexKind } from './textures';

/**
 * Textura fotoescaneada de un material (`pbrTextures.ts`). Con `color: false` se conserva el dibujo procedural (el
 * damero, las cajas, la moqueta) y la foto solo pone el relieve y la rugosidad. `repeat`: cuántas veces cabe la foto en
 * una repetición del material (cuando su tamaño real no coincide con `texScale`).
 */
interface PbrSpec {
  set: PbrSetId;
  color?: boolean;
  repeat?: number;
  /** Intensidad del relieve y de la oclusión, y multiplicador de la rugosidad de la foto. */
  normal?: number;
  ao?: number;
  rough?: number;
}

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
  pbr?: PbrSpec;
  /** Aclara (o oscurece) el color más allá de blanco: para fotos muy oscuras que dejarían un nivel sin luz. */
  gain?: number;
}

// R2: metalness ≤ 0,3 salvo dorados (el IBL tenue evita que el metal se vea negro).
// Con foto, `texScale` es su tamaño real (m) y `color` la tiñe; sin foto, `roughness` es la del material entero.
const SPECS: Record<MaterialId, MatSpec> = {
  qaGrid: { color: 0xffffff, tex: 'grid', texScale: 2, roughness: 0.85, metalness: 0 },
  qaGridDark: { color: 0xffffff, tex: 'gridDark', texScale: 2, roughness: 0.85, metalness: 0 },
  qaOrange: { color: 0xffffff, tex: 'gridOrange', texScale: 2, roughness: 0.7, metalness: 0 },
  concrete: { color: 0xffffff, tex: 'concrete', texScale: 3, roughness: 0.92, metalness: 0, pbr: { set: 'concrete_floor_worn_001' } },
  concreteDark: { color: 0xd2d6da, tex: 'concrete', texScale: 3, roughness: 0.92, metalness: 0, pbr: { set: 'concrete_floor_worn_001' } },
  plaster: { color: 0xffffff, tex: 'plaster', texScale: 2, roughness: 0.9, metalness: 0, pbr: { set: 'plastered_wall' } },
  plasterDark: { color: 0x8c857a, tex: 'plaster', texScale: 2, roughness: 0.9, metalness: 0, pbr: { set: 'plastered_wall' } },
  marble: { color: 0xffffff, tex: 'marble', texScale: 1.5, roughness: 0.48, metalness: 0, pbr: { set: 'marble_01' } },
  marbleChecker: {
    color: 0xffffff,
    tex: 'marbleChecker',
    texScale: 2,
    roughness: 0.42,
    metalness: 0,
    pbr: { set: 'marble_01', color: false, repeat: 1.33 },
  },
  marbleDark: { color: 0x55504b, tex: 'marbleDark', texScale: 1.5, roughness: 0.4, metalness: 0, pbr: { set: 'marble_01' } },
  woodPanel: { color: 0xffffff, tex: 'wood', texScale: 2.43, roughness: 0.6, metalness: 0, pbr: { set: 'rosewood_veneer1' } },
  woodDark: { color: 0xffffff, tex: 'wood', texScale: 2, roughness: 0.6, metalness: 0, pbr: { set: 'dark_wood' } },
  carpetRed: {
    color: 0xb8414f,
    tex: 'carpet',
    texScale: 2,
    roughness: 0.95,
    metalness: 0,
    pbr: { set: 'velour_velvet', color: false, repeat: 7, normal: 0.6, rough: 1.1 },
  },
  carpetGreen: {
    color: 0x3f8063,
    tex: 'carpet',
    texScale: 2,
    roughness: 0.95,
    metalness: 0,
    pbr: { set: 'velour_velvet', color: false, repeat: 7, normal: 0.6, rough: 1.1 },
  },
  gold: { color: 0xd4af37, texScale: 1, roughness: 0.35, metalness: 0.65, emissive: 0x3a2a05, emissiveIntensity: 0.5 },
  brass: { color: 0xb88c3e, texScale: 1, roughness: 0.4, metalness: 0.5 },
  metal: { color: 0xc4c8ce, tex: 'brushed', texScale: 0.5, roughness: 0.5, metalness: 0.3, pbr: { set: 'metal_plate' } },
  metalDark: { color: 0x737880, tex: 'brushed', texScale: 1.5, roughness: 0.55, metalness: 0.3, pbr: { set: 'metal_plate_02', color: false, repeat: 0.75 } },
  steelBlue: { color: 0xffffff, tex: 'brushed', texScale: 2.5, roughness: 0.5, metalness: 0.3, pbr: { set: 'blue_metal_plate' } },
  crate: { color: 0xffffff, tex: 'crate', texScale: 1.2, roughness: 0.82, metalness: 0, pbr: { set: 'plywood', color: false, repeat: 2.4 } },
  containerRed: { color: 0xd0533d, tex: 'corrugated', texScale: 1.94, roughness: 0.7, metalness: 0.15, pbr: { set: 'container_side' } },
  containerBlue: { color: 0x4378c0, tex: 'corrugated', texScale: 1.94, roughness: 0.7, metalness: 0.15, pbr: { set: 'container_side' } },
  containerGreen: { color: 0x52966a, tex: 'corrugated', texScale: 1.94, roughness: 0.7, metalness: 0.15, pbr: { set: 'container_side' } },
  containerYellow: { color: 0xe0b03a, tex: 'corrugated', texScale: 1.94, roughness: 0.7, metalness: 0.15, pbr: { set: 'container_side' } },
  asphalt: { color: 0xffffff, tex: 'asphalt', texScale: 3.5, roughness: 0.95, metalness: 0, pbr: { set: 'asphalt_02' } },
  tilesBlack: { color: 0x8c8c8c, tex: 'tiles', texScale: 2.3, roughness: 0.42, metalness: 0, pbr: { set: 'granite_tile', rough: 0.6 } },
  danceFloor: {
    color: 0xffffff,
    tex: 'danceFloor',
    texScale: 4,
    roughness: 0.3,
    metalness: 0,
    emissive: 0xffffff,
    emissiveIntensity: 0.85,
    emissiveFromMap: true,
  },
  glass: { color: 0xa8dcff, texScale: 1, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.22 },
  leather: { color: 0xffffff, texScale: 0.4, roughness: 0.55, metalness: 0, pbr: { set: 'brown_leather' } },
  velvet: { color: 0xffb0c8, tex: 'noise', texScale: 0.3, roughness: 0.92, metalness: 0, pbr: { set: 'velour_velvet' } },
  brick: { color: 0xffffff, tex: 'brick', texScale: 1, roughness: 0.9, metalness: 0, pbr: { set: 'red_brick_03' } },
  wallpaper: { color: 0xffffff, tex: 'wallpaper', texScale: 2, roughness: 0.85, metalness: 0, pbr: { set: 'plastered_wall', color: false, normal: 0.5 } },
  water: { color: 0x23557a, texScale: 1, roughness: 0.12, metalness: 0.1 },
  // La grava alquitranada es muy oscura: sin aclararla, las azoteas de noche quedaban por debajo de la claridad mínima.
  roofGravel: { color: 0xffffff, gain: 1.9, tex: 'gravel', texScale: 2.2, roughness: 0.96, metalness: 0, pbr: { set: 'tarred_gravel' } },
  hazard: { color: 0xffffff, tex: 'hazard', texScale: 1, roughness: 0.7, metalness: 0, pbr: { set: 'metal_plate_02', color: false, repeat: 0.5 } },
  targetBoard: { color: 0xffffff, tex: 'target', texScale: 1, roughness: 0.8, metalness: 0 },
};

const levelCache = new Map<MaterialId, MeshStandardMaterial>();

export function texScaleOf(id: MaterialId): number {
  return SPECS[id].texScale;
}

/** Los juegos de fotos que usan estos materiales (los que hay que descargar antes de construir un nivel). */
export function pbrSetsOf(ids: Iterable<MaterialId>): PbrSetId[] {
  const out = new Set<PbrSetId>();
  for (const id of ids) {
    const set = SPECS[id].pbr?.set;
    if (set) out.add(set);
  }
  return [...out];
}

/** Relieve y rugosidad de las fotos (el preset Bajo solo usa el color). */
let detail = true;

/** Copias de los mapas con otra repetición: comparten la imagen y la textura de la GPU. */
const repeated = new Map<string, Texture>();

function withRepeat(t: Texture, repeat: number): Texture {
  if (repeat === 1) return t;
  const key = `${t.name}:${repeat}`;
  let c = repeated.get(key);
  if (!c) {
    c = t.clone();
    c.repeat.set(repeat, repeat);
    c.name = key;
    repeated.set(key, c);
  }
  return c;
}

/** Pone en el material las fotos de su juego, si ya se descargaron; si no, se queda con lo procedural. */
function applyPbr(m: MeshStandardMaterial, s: MatSpec): void {
  const p = s.pbr;
  const maps = p ? pbrMaps(p.set) : null;
  if (!p || !maps) return;
  const r = p.repeat ?? 1;
  if (p.color !== false) m.map = withRepeat(maps.color, r);
  const arm = detail ? withRepeat(maps.arm, r) : null;
  m.normalMap = detail ? withRepeat(maps.normal, r) : null;
  m.normalScale.setScalar(p.normal ?? 1);
  m.aoMap = arm;
  m.aoMapIntensity = p.ao ?? 0.8;
  // Con mapa, la rugosidad del material multiplica la de la foto.
  m.roughnessMap = arm;
  m.roughness = arm ? (p.rough ?? 1) : s.roughness;
  m.needsUpdate = true;
}

onPbrLoaded((set) => {
  for (const [id, m] of levelCache) if (SPECS[id].pbr?.set === set) applyPbr(m, SPECS[id]);
});

/** Activa o quita el relieve de las fotos en todos los materiales (al cambiar de preset). */
export function setMaterialDetail(on: boolean): void {
  if (on === detail) return;
  detail = on;
  for (const [id, m] of levelCache) applyPbr(m, SPECS[id]);
}

/**
 * Sin repetición: una foto que se repite cada pocos metros deja ver su cuadrícula (las mismas grietas del asfalto una y
 * otra vez). Cada zona de la superficie toma la foto con otro desplazamiento y las zonas se funden con suavidad (la
 * técnica de Íñigo Quílez), y el tono varía un poco a gran escala. El color solo se toca si viene de la foto: en los
 * dibujos procedurales (damero, cajas) desplazarlo los rompería.
 */
const NO_TILE_GLSL = `
float ntHash( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 ); }
float ntNoise( vec2 p ) {
  vec2 i = floor( p );
  vec2 f = fract( p );
  vec2 u = f * f * ( 3.0 - 2.0 * f );
  return mix( mix( ntHash( i ), ntHash( i + vec2( 1.0, 0.0 ) ), u.x ), mix( ntHash( i + vec2( 0.0, 1.0 ) ), ntHash( i + vec2( 1.0, 1.0 ) ), u.x ), u.y );
}
vec4 noTile( sampler2D s, vec2 uv ) {
  float l = ntNoise( uv * 0.35 ) * 8.0;
  float f = fract( l );
  float ia = floor( l );
  vec2 offa = sin( vec2( 3.0, 7.0 ) * ia );
  vec2 offb = sin( vec2( 3.0, 7.0 ) * ( ia + 1.0 ) );
  vec2 dx = dFdx( uv );
  vec2 dy = dFdy( uv );
  vec4 a = textureGrad( s, uv + offa, dx, dy );
  vec4 b = textureGrad( s, uv + offb, dx, dy );
  return mix( a, b, smoothstep( 0.2, 0.8, f - 0.1 * ( a.x + a.y + a.z - b.x - b.y - b.z ) ) );
}
`;

function addNoTile(m: MeshStandardMaterial, color: boolean): void {
  // Un solo programa para todos: si el color sale sin repetición lo decide un uniforme de cada material, no el código.
  const ntColor = { value: color ? 1 : 0 };
  m.onBeforeCompile = (shader) => {
    shader.uniforms.ntColor = ntColor;
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nuniform float ntColor;\n${NO_TILE_GLSL}`)
      .replace(
        '#include <map_fragment>',
        `${ShaderChunk.map_fragment.replace('texture2D( map, vMapUv )', '( ntColor > 0.5 ? noTile( map, vMapUv ) : texture2D( map, vMapUv ) )')}\n#ifdef USE_MAP\n  diffuseColor.rgb *= mix( 1.0, 0.88 + 0.24 * ntNoise( vMapUv * 0.13 ), ntColor );\n#endif`,
      )
      .replace('#include <normal_fragment_maps>', ShaderChunk.normal_fragment_maps.replaceAll('texture2D( normalMap,', 'noTile( normalMap,'))
      .replace('#include <roughnessmap_fragment>', ShaderChunk.roughnessmap_fragment.replace('texture2D( roughnessMap,', 'noTile( roughnessMap,'))
      .replace('#include <aomap_fragment>', ShaderChunk.aomap_fragment.replace('texture2D( aoMap,', 'noTile( aoMap,'));
  };
  m.customProgramCacheKey = () => 'notile-v2';
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
  if (s.gain) m.color.multiplyScalar(s.gain);
  if (s.tex) m.map = getTexture(s.tex);
  applyPbr(m, s);
  if (s.pbr) addNoTile(m, s.pbr.color !== false);
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

/** Los emisores van en HDR, por encima del umbral del bloom (`BLOOM_THRESHOLD` en Renderer.ts). */
export const EMISSIVE_HDR = 2.6;

/** Material de neón (no iluminado, siempre legible). Su color en HDR alimenta el bloom. */
export function getNeonMaterial(color: number, intensity = 1.6): MeshBasicMaterial {
  const key = `${color}:${intensity}`;
  const hit = neonCache.get(key);
  if (hit) return hit;
  const c = new Color(color).multiplyScalar(intensity * EMISSIVE_HDR);
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
