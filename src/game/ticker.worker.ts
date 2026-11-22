/**
 * Reloj de la pestaña oculta. Con la pestaña en segundo plano el navegador para `requestAnimationFrame` y frena los
 * temporizadores de la página, pero no los de un worker: este avisa unas 60 veces por segundo para que el anfitrión
 * de una partida en red siga simulando (si no, la partida se congelaría para todos sus invitados).
 */
const post = (self as unknown as { postMessage(m: number): void }).postMessage.bind(self);
setInterval(() => post(0), 1000 / 60);
