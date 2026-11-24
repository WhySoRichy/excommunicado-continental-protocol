import { MeshStandardMaterial, type Texture } from 'three';

/**
 * Cuánto refleja el metal de las armas el entorno: más que el escenario (los niveles nocturnos lo atenúan a 0,4), para
 * que un pavonado o un cromado se lean como metal también de noche.
 */
const ENV_INTENSITY = 0.75;

let material: MeshStandardMaterial | null = null;
let environment: Texture | null = null;

/**
 * Un material de armas: color, rugosidad y metalicidad salen de cada vértice (atributos `color` y `pbr`, ver
 * `entities/rig/weaponParts.ts`). El juego usa uno compartido (`weaponMaterial`); la vista previa de la armería, que
 * dibuja con otro renderer, el suyo con su propio entorno (una textura de un renderer no sirve en otro).
 */
export function createWeaponMaterial(env: Texture | null, envIntensity = ENV_INTENSITY): MeshStandardMaterial {
  const m = new MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 1, envMapIntensity: envIntensity });
  m.envMap = env;
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec2 pbr;\nvarying vec2 vPbr;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPbr = pbr;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vPbr;')
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = roughness * vPbr.x;')
      .replace('#include <metalnessmap_fragment>', 'float metalnessFactor = metalness * vPbr.y;');
  };
  m.customProgramCacheKey = () => 'weapon-pbr-v1';
  m.name = 'weapon';
  return m;
}

/** El material de todas las armas del juego: compartido y nunca liberado; cada arma es una draw call. */
export function weaponMaterial(): MeshStandardMaterial {
  material ??= createWeaponMaterial(environment);
  return material;
}

/** El entorno que reflejan las armas (el del renderer; se rehace si se pierde el contexto). */
export function setWeaponEnvironment(t: Texture | null): void {
  environment = t;
  if (material) {
    material.envMap = t;
    material.needsUpdate = true;
  }
}
