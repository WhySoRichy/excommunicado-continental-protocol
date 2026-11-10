/** Catálogo de contratos (datos). GAME_DESIGN §2.3 y §5.2. */
export type MissionId = 'practice' | 'nightclub' | 'docks' | 'rooftop' | 'gauntlet';
export type Rank = 'D' | 'C' | 'B' | 'A' | 'S';

export const RANKS: readonly Rank[] = ['D', 'C', 'B', 'A', 'S'];

export interface MissionDef {
  id: MissionId;
  name: string;
  place: string;
  /** Briefing de 3 líneas máximo: objetivo, regla especial, rango objetivo. */
  briefing: [string, string, string];
  /** Monedas base por completarla (×multiplicador de rango). */
  baseReward: number;
  /** Misión que la desbloquea (null = disponible desde el inicio). */
  requires: MissionId | null;
  /** Tiempo "par" en segundos para la nota de tiempo. */
  parTime: number;
  hasCivilians: boolean;
  /** Fase del proyecto en la que existe el nivel jugable. */
  available: boolean;
}

export const MISSIONS: Record<MissionId, MissionDef> = {
  practice: {
    id: 'practice',
    name: 'Simulacro de combate',
    place: 'Campo de práctica · sótano del Continental',
    briefing: ['Elimina a los 6 maniquíes armados del patio.', 'Aquí sí se dispara: es el único lugar del hotel donde se permite.', 'Rango objetivo: B o superior.'],
    baseReward: 2,
    requires: null,
    parTime: 90,
    hasCivilians: false,
    available: true,
  },
  nightclub: {
    id: 'nightclub',
    name: 'Club Kairos',
    place: 'Club nocturno · distrito del puerto',
    briefing: ['Sube al VIP y elimina a Vance. Sal por la puerta trasera.', 'Hay civiles: no pueden sufrir daño. Matar uno limita el rango a C.', 'Rango objetivo: A.'],
    baseReward: 6,
    requires: 'practice',
    parTime: 240,
    hasCivilians: true,
    available: true,
  },
  docks: {
    id: 'docks',
    name: 'Muelle 9',
    place: 'Patio de contenedores y bodega',
    briefing: ['Destruye los 3 cargamentos y llega al bote.', 'El láser rojo de un tirador avisa su disparo: rompe la línea de visión.', 'Rango objetivo: A.'],
    baseReward: 8,
    requires: 'nightclub',
    parTime: 300,
    hasCivilians: false,
    available: true,
  },
  rooftop: {
    id: 'rooftop',
    name: 'Torre Meridian',
    place: 'Azoteas · tres alturas',
    briefing: ['Sube, elimina a los tiradores, vence al Juez y escapa en 45 s.', 'El Juez solo cae con headshots o con un takedown cuando se arrodilla.', 'Rango objetivo: S.'],
    baseReward: 10,
    requires: 'docks',
    parTime: 360,
    hasCivilians: false,
    available: true,
  },
  gauntlet: {
    id: 'gauntlet',
    name: 'Gauntlet "Excomunicado"',
    place: 'El Continental · modo hostil',
    briefing: ['Sobrevive a oleadas infinitas en el vestíbulo.', '1 moneda por cada 2 oleadas. Récord local en el mostrador de Charon.', 'Rango objetivo: tu propio récord.'],
    baseReward: 0,
    requires: 'practice',
    parTime: 0,
    hasCivilians: false,
    available: false,
  },
};

export const MISSION_ORDER: readonly MissionId[] = ['practice', 'nightclub', 'docks', 'rooftop', 'gauntlet'];
