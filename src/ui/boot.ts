/** Pantalla de carga estática (definida en index.html para que aparezca antes del JS). */

export function setBootProgress(p: number, label: string): void {
  const bar = document.getElementById('boot-progress');
  const lab = document.getElementById('boot-label');
  if (bar) bar.style.width = `${Math.round(Math.max(0, Math.min(1, p)) * 100)}%`;
  if (lab) lab.textContent = label;
  document.getElementById('boot')?.setAttribute('aria-valuenow', String(Math.round(p * 100)));
}

/**
 * Quita la pantalla de carga. Usa la Web Animations API: su promesa `finished` se
 * resuelve por tiempo aunque el hilo esté ocupado (los eventos `transitionend` no llegan
 * si la transición nunca empieza). Con `instant` o movimiento reducido se quita de inmediato.
 */
export function hideBoot(instant = false): void {
  const el = document.getElementById('boot');
  if (!el) return;
  el.style.pointerEvents = 'none';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (instant || reduced || typeof el.animate !== 'function') {
    el.remove();
    return;
  }
  const anim = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: 'ease', fill: 'forwards' });
  anim.finished.then(
    () => el.remove(),
    () => el.remove(),
  );
}

/** Error fatal visible (nunca se traga un error en silencio). */
export function showFatal(err: unknown): void {
  const msg = err instanceof Error ? `${err.message}\n\n${err.stack ?? ''}` : String(err);
  console.error(err);
  const el = document.getElementById('boot') ?? document.body.appendChild(document.createElement('div'));
  el.id = 'boot';
  el.classList.remove('boot-done');
  el.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'fatal';
  const h = document.createElement('h1');
  h.textContent = 'No se pudo iniciar el juego';
  const p = document.createElement('p');
  p.textContent = 'Tu navegador necesita WebGL2 y WebAssembly. Prueba con Chrome, Edge o Firefox actualizados.';
  const pre = document.createElement('pre');
  pre.textContent = msg;
  box.append(h, p, pre);
  el.appendChild(box);
}
