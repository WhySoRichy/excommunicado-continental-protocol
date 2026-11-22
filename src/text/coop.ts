/**
 * Textos del cooperativo. Es el primer módulo del catálogo de textos (docs/ESCALABILIDAD.md, regla 7): los textos
 * nuevos viven aquí y no repartidos por el código, para revisarlos y traducirlos sin tocar la lógica.
 */
export const COOP_TEXT = {
  menu: 'Cooperativo',
  heading: 'COOPERATIVO',
  intro: 'Juega con hasta tres personas más. El anfitrión elige la misión y la partida corre en su equipo.',
  create: 'Crear partida',
  joinCode: 'Unirse con un código',
  joinLocal: 'Unirse en este equipo',
  back: 'Volver',

  lobby: 'SALA',
  host: 'Anfitrión',
  guest: (id: number) => `Invitado ${id}`,
  you: 'tú',
  loading: 'cargando',
  playing: 'en la partida',
  waitingHost: 'Esperando a que el anfitrión elija la misión…',
  chooseMode: 'Elige qué jugar',
  arena: 'Arena (libre)',
  leaveLobby: 'Cerrar la sala',
  leaveGame: 'Salir de la partida',
  backToLobby: 'Volver a la sala',
  pauseHint: 'En cooperativo la partida sigue mientras estás en pausa: tu personaje se queda donde está.',

  inviteHeading: 'Invitar por código',
  inviteCreate: 'Crear invitación',
  inviteWorking: 'Preparando la invitación…',
  inviteHint: 'Envía este código a quien quieras invitar. Te devolverá otro: pégalo debajo.',
  answerLabel: 'Respuesta del invitado',
  answerConnect: 'Conectar',
  copy: 'Copiar',
  copied: 'Copiado',
  localHint: 'En este mismo equipo: abre el juego en otra pestaña y elige «Unirse en este equipo».',
  privacy: 'La conexión es directa entre los equipos: cada jugador verá la dirección IP del otro.',

  joinHeading: 'UNIRSE CON UN CÓDIGO',
  joinPaste: 'Código de invitación',
  joinAnswer: 'Generar respuesta',
  joinAnswerHint: 'Envía esta respuesta al anfitrión. Cuando la pegue, entrarás en su sala.',
  connecting: 'Conectando…',

  errors: {
    version: 'El anfitrión tiene otra versión del juego. Recargad los dos la página.',
    full: 'La partida está llena: cuatro jugadores como mucho.',
    closed: 'El anfitrión cerró la partida.',
    lost: 'Se perdió la conexión con el anfitrión.',
    badCode: 'Ese código no es válido. Cópialo entero, sin espacios.',
    rtc: 'No se pudo conectar. Algunas redes no permiten la conexión directa entre equipos.',
    noLocalHost: 'No hay ninguna partida abierta en este equipo.',
    unsupported: 'Este navegador no permite el cooperativo en red.',
  },

  joined: (name: string) => `${name} se ha unido`,
  left: (name: string) => `${name} se ha ido`,
  noFocus: 'Sin Foco en cooperativo: el tiempo es de todos',
  down: 'Abatido',
  respawnIn: (s: number) => `Vuelves en ${s} s al último punto de control.`,
  respawnHost: 'El anfitrión te hará reaparecer en unos segundos.',
  ping: (ms: number) => `${Math.round(ms)} ms`,
  teamResult: 'Resultado del equipo',
  waitingNext: 'Esperando a que el anfitrión elija qué jugar…',
} as const;

/** Nombre de un jugador por su id (0 es el anfitrión). */
export function playerName(id: number): string {
  return id === 0 ? COOP_TEXT.host : COOP_TEXT.guest(id);
}
