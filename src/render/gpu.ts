/**
 * Nombre de la GPU sin crear el renderer del juego: contexto WebGL temporal que se libera
 * en el acto (sirve para elegir el preset ANTES de decidir el antialias, que es fijo).
 */
export function probeGpu(): string {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
  if (!gl) return '';
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return name;
}
