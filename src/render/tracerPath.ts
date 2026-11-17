/**
 * Tramo visible de una trazadora a lo largo de su recorrido (lógica pura). La cabeza avanza a
 * `speed` hasta el impacto y se queda allí; la cola la sigue a `len` metros (como mucho, el 60 % del
 * recorrido) y, cuando también llega al impacto, la trazadora termina.
 */
export interface TracerSpan {
  /** Distancia de la cabeza a la boca del arma (m). */
  head: number;
  /** Distancia de la cola a la boca del arma (m). */
  tail: number;
  done: boolean;
}

export function tracerSpan(age: number, dist: number, speed: number, len: number, out: TracerSpan): TracerSpan {
  // `front` no se limita al impacto: la cola sigue avanzando aunque la cabeza ya haya llegado.
  const front = speed * Math.max(0, age);
  const streak = Math.min(len, dist * 0.6);
  out.head = Math.min(dist, front);
  out.tail = Math.min(out.head, Math.max(0, front - streak));
  out.done = front - streak >= dist;
  return out;
}
