/** Líneas de los NPC del Continental (UI en español, personajes propios). */
export interface Dialogue {
  speaker: string;
  lines: string[];
}

export const DIALOGUE = {
  charonFirst: {
    speaker: 'Charon',
    lines: [
      'Le damos la bienvenida al Continental. Es un placer tenerle de vuelta.',
      'Le recuerdo la primera regla de la casa: aquí no se hace negocio. Las armas se quedan enfundadas.',
      'Cuando quiera un contrato, hable conmigo. El Sommelier le atenderá en la armería y Winston le espera en gerencia.',
      'El campo de práctica está en el sótano: baje por el ascensor del fondo.',
    ],
  },
  charonBoard: {
    speaker: 'Charon',
    lines: ['Aquí tiene el tablero de contratos. Elija con cuidado.'],
  },
  sommelierFirst: {
    speaker: 'Sommelier',
    lines: ['Buenas noches. ¿Algo para la cena? Tenemos de todo... para una celebración.', 'Las Monedas Continental abren cualquier vitrina de esta casa.'],
  },
  sommelierRepeat: {
    speaker: 'Sommelier',
    lines: ['¿Qué le apetece esta noche?'],
  },
  winstonFirst: {
    speaker: 'Winston',
    lines: [
      'Se retiró, y el mundo de afuera no lo ha entendido. Mientras esté bajo este techo, nadie le tocará.',
      'Pero recuerde: si dispara aquí dentro, la Alta Mesa le declarará Excomunicado. Perderá privilegios... y monedas.',
      'Complete contratos, gane monedas y no haga tonterías en mi hotel.',
    ],
  },
  winstonRepeat: {
    speaker: 'Winston',
    lines: ['Los contratos los gestiona Charon. Yo gestiono las consecuencias.', 'Disfrute de su estancia. Y recuerde las reglas.'],
  },
  winstonReadmit: {
    speaker: 'Winston',
    lines: ['Le dije que no hiciera tonterías.', 'La Alta Mesa ha aceptado la multa. Sus privilegios quedan restituidos... por ahora.'],
  },
  winstonReadmitDead: {
    speaker: 'Winston',
    lines: ['Despierte. Ha tenido suerte de que esto siga siendo mi hotel.', 'La multa ya está pagada. No vuelva a disparar aquí dentro.'],
  },
} as const satisfies Record<string, Dialogue>;

/** Texto de la Placa de las Reglas (lore + tutorial). `keys` lleva las teclas reales. */
export function rulesPlaque(keys: { interact: string; fire: string; crouch: string; jump: string; takedown: string; reload: string; focus: string; sprint: string }): Dialogue {
  return {
    speaker: 'Reglas de la casa',
    lines: [
      'REGLA I — No se hace negocio en el Continental. Aquí nadie dispara.',
      'REGLA II — Todo marcador de sangre se honra sin excepción.',
      'CONSECUENCIA — Quien rompe la Regla I es declarado Excomunicado: suena la alarma, la Alta Mesa cobra el 30 % de sus monedas y el hotel se vuelve hostil hasta que Winston le readmita.',
      `RECORDATORIO — WASD mover · ${keys.sprint} sprint · ${keys.crouch} agacharse o cubrirse · ${keys.jump} saltar · ${keys.fire} disparar · ${keys.reload} recargar · ${keys.takedown} takedown · ${keys.focus} foco · ${keys.interact} interactuar.`,
    ],
  };
}

/** Avisos cortos del hub. */
export const HUB_TEXT = {
  warnDraw: 'Regla I: aquí no se hace negocio. Disparar dentro del Continental = EXCOMUNICADO.',
  holstered: 'Arma enfundada.',
  excommunicado: (lost: number) => `EXCOMUNICADO. La Alta Mesa cobra ${lost} monedas. El hotel es hostil.`,
  wave: (n: number, total: number) => `Oleada ${n} de ${total}`,
  readmitted: 'Readmisión concedida. El Continental vuelve a ser zona neutral.',
  drillDone: (coins: number) => `Simulacro completado: +${coins} monedas. Vuelve al Continental por el ascensor.`,
  drillRepeat: 'Simulacro completado. Vuelve al Continental por el ascensor.',
  zoneNeutral: 'ZONA NEUTRAL · PROHIBIDO DISPARAR',
  zoneHostile: (n: number, total: number) => `EXCOMUNICADO · OLEADA ${n}/${total}`,
  objectiveFirst: 'Habla con Charon en recepción',
  objectiveHub: 'Visita la armería o baja al campo de práctica',
  objectiveSurvive: (n: number, total: number) => `Sobrevive a la oleada ${n} de ${total}`,
  objectiveDrill: 'Elimina a los 6 maniquíes armados del patio',
  objectiveDrillDone: 'Vuelve al Continental por el ascensor',
} as const;
