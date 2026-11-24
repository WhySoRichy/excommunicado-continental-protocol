import { Color, DataTexture, LinearFilter, LinearMipmapLinearFilter, MeshStandardMaterial, RepeatWrapping, RGBAFormat, ShaderChunk, Vector2 } from 'three';
import type { RimUniforms } from './materials';

/**
 * El material de los personajes: color, rugosidad, metalicidad y trama de tela salen de cada vértice (atributos `color` y
 * `pbr`, ver `entities/rig/loft.ts`), así uno solo dibuja tela, cuero, piel, pelo y metal. El borde de color (rim) que
 * distingue a cada tipo es un uniform: los enemigos llevan su material, con el mismo programa, para que el destello de
 * un impacto sea solo del que lo recibe.
 */
const SIZE = 256;
/** Metros que cubre una repetición de la tela. */
const TILE = 0.55;

let fabric: DataTexture | null = null;

/** Ruido de valor que se repite cada `period` celdas. */
function noise(x: number, y: number, period: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const h = (ix: number, iy: number): number => {
    const a = ((ix % period) + period) % period;
    const b = ((iy % period) + period) % period;
    let n = Math.imul(a, 374761393) ^ Math.imul(b, 668265263) ^ Math.imul(seed, 1274126177);
    n = Math.imul(n ^ (n >>> 13), 1103515245);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  };
  const top = h(xi, yi) * (1 - u) + h(xi + 1, yi) * u;
  const bot = h(xi, yi + 1) * (1 - u) + h(xi + 1, yi + 1) * u;
  return top * (1 - v) + bot * v;
}

/** Relieve de la tela: arrugas suaves de varios centímetros y, encima, una trama fina que solo se ve de cerca. */
function fabricTexture(): DataTexture {
  if (fabric) return fabric;
  const height = new Float32Array(SIZE * SIZE);
  for (let j = 0; j < SIZE; j++) {
    for (let i = 0; i < SIZE; i++) {
      const u = i / SIZE;
      const v = j / SIZE;
      // Arrugas: crestas de un ruido deformado por otro.
      const wx = noise(u * 4, v * 4, 4, 3) - 0.5;
      const wy = noise(u * 4, v * 4, 4, 9) - 0.5;
      const a = 1 - Math.abs(2 * noise(u * 6 + wx * 1.6, v * 5 + wy * 1.6, 6, 1) - 1);
      const b = 1 - Math.abs(2 * noise(u * 12 + wy, v * 10 + wx, 12, 5) - 1);
      // Sarga: diagonales finas.
      const weave = Math.sin((i + j) * ((Math.PI * 2) / 4)) * 0.5;
      height[j * SIZE + i] = a * a * 0.8 + b * 0.12 + weave * 0.012;
    }
  }
  const data = new Uint8Array(SIZE * SIZE * 4);
  const at = (i: number, j: number): number => height[((j + SIZE) % SIZE) * SIZE + ((i + SIZE) % SIZE)]!;
  for (let j = 0; j < SIZE; j++) {
    for (let i = 0; i < SIZE; i++) {
      const dx = (at(i + 1, j) - at(i - 1, j)) * 5;
      const dy = (at(i, j + 1) - at(i, j - 1)) * 5;
      const l = Math.hypot(dx, dy, 1);
      const k = (j * SIZE + i) * 4;
      data[k] = Math.round((-dx / l) * 127.5 + 127.5);
      data[k + 1] = Math.round((-dy / l) * 127.5 + 127.5);
      data[k + 2] = Math.round((1 / l) * 127.5 + 127.5);
      data[k + 3] = 255;
    }
  }
  const t = new DataTexture(data, SIZE, SIZE, RGBAFormat);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.magFilter = LinearFilter;
  t.minFilter = LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.anisotropy = 4;
  t.repeat.set(1 / TILE, 1 / TILE);
  t.needsUpdate = true;
  fabric = t;
  return t;
}

export function createRigMaterial(rimColor: number, rimStrength: number, rimPower = 3.2): { mat: MeshStandardMaterial; rim: RimUniforms } {
  const mat = new MeshStandardMaterial({
    vertexColors: true,
    roughness: 1,
    metalness: 1,
    normalMap: fabricTexture(),
    normalScale: new Vector2(0.4, 0.4),
  });
  const rim: RimUniforms = { rimColor: { value: new Color(rimColor) }, rimStrength: { value: rimStrength }, rimPower: { value: rimPower } };
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.rimColor = rim.rimColor;
    shader.uniforms.rimStrength = rim.rimStrength;
    shader.uniforms.rimPower = rim.rimPower;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec3 pbr;\nvarying vec3 vPbr;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPbr = pbr;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vPbr;\nuniform vec3 rimColor;\nuniform float rimStrength;\nuniform float rimPower;')
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = roughness * vPbr.x;')
      .replace('#include <metalnessmap_fragment>', 'float metalnessFactor = metalness * vPbr.y;')
      // La tela solo se arruga donde hay tela.
      .replace('#include <normal_fragment_maps>', ShaderChunk.normal_fragment_maps.replace('mapN.xy *= normalScale;', 'mapN.xy *= normalScale * vPbr.z;'))
      .replace(
        '#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n{\n  float rimF = 1.0 - saturate( dot( normal, normalize( vViewPosition ) ) );\n  float rimUp = dot( normal, normalize( ( viewMatrix * vec4( 0.0, 1.0, 0.0, 0.0 ) ).xyz ) );\n  totalEmissiveRadiance += rimColor * ( rimStrength * pow( rimF, rimPower ) * ( 1.0 - 0.8 * smoothstep( 0.35, 0.9, rimUp ) ) );\n}',
      );
  };
  mat.customProgramCacheKey = () => 'rig-v2';
  mat.userData.rim = rim;
  return { mat, rim };
}
