import { Matrix4, type Quaternion, Vector3 } from 'three';
import { clamp } from '../../core/math';

const _dir = new Vector3();
const _bend = new Vector3();
const _upper = new Vector3();
const _lower = new Vector3();
const _x = new Vector3();
const _y = new Vector3();
const _z = new Vector3();
const _m = new Matrix4();

/** Margen para no estirar del todo (evita el "pop" de la articulación) y tramo en el que se acerca a su tope con suavidad. */
const MARGIN = 0.003;
const SOFT = 0.03;

/** Distancia alcanzable: igual que la pedida y, en los últimos `soft` m, se acerca al tope sin frenar en seco. */
export function reach(d: number, l1: number, l2: number, span = SOFT): number {
  const max = l1 + l2 - MARGIN;
  const knee = max - span;
  const soft = d > knee ? max - span * Math.exp((knee - d) / span) : d;
  return Math.max(Math.abs(l1 - l2) + 0.03, soft);
}

/**
 * Cinemática inversa de una extremidad de dos huesos que en reposo cuelga hacia −Y. `target`: dónde debe quedar su
 * extremo, desde la articulación y en el espacio del padre; `pole`: hacia dónde apunta el codo o la rodilla. Deja en `out`
 * el giro del hueso de arriba y devuelve la flexión (≥ 0): el codo la aplica en positivo sobre X y la rodilla (`knee`),
 * en negativo. Fuera de alcance, se estira hacia el objetivo (con
 * `span` se le dice en cuántos metros se acerca a su tope: quieto puede ser poco; en marcha, un tope brusco da tirones).
 */
export function solveLimb(target: Vector3, pole: Vector3, l1: number, l2: number, knee: boolean, out: Quaternion, span = SOFT): number {
  const len = target.length();
  if (len < 1e-5) _dir.set(0, -1, 0);
  else _dir.copy(target).multiplyScalar(1 / len);
  const d = reach(len, l1, l2, span);
  // Hacia dónde dobla, perpendicular a la línea entre los extremos.
  _bend.copy(pole).addScaledVector(_dir, -pole.dot(_dir));
  if (_bend.lengthSq() < 1e-6) _bend.set(Math.abs(_dir.x) < 0.9 ? 1 : 0, 0, Math.abs(_dir.x) < 0.9 ? 0 : 1).addScaledVector(_dir, -_bend.dot(_dir));
  _bend.normalize();
  const ca = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const sa = Math.sqrt(1 - ca * ca);
  _upper.copy(_dir).multiplyScalar(ca).addScaledVector(_bend, sa);
  _lower
    .copy(_dir)
    .multiplyScalar(d)
    .addScaledVector(_upper, -l1)
    .multiplyScalar(1 / l2);
  const cos = clamp(_upper.dot(_lower), -1, 1);
  // Hacia dónde se va el segundo hueso respecto al primero: al contrario que la articulación.
  _z.copy(_lower).addScaledVector(_upper, -cos);
  if (_z.lengthSq() < 1e-8) _z.copy(_bend).negate();
  _z.normalize();
  if (!knee) _z.negate();
  _y.copy(_upper).negate();
  _x.crossVectors(_y, _z);
  out.setFromRotationMatrix(_m.makeBasis(_x, _y, _z));
  return Math.acos(cos);
}
