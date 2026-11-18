import type { BufferGeometry } from 'three';
import { cbox, merge } from './geometry';
import type { WeaponModel } from './types';

/** Dónde agarra la mano izquierda cada arma, en el espacio del arma (cañón a −Z, arriba +Y). */
export const GRIP: Record<WeaponModel, readonly [number, number, number] | null> = {
  pistol: [-0.045, -0.035, -0.005],
  rifle: [0, -0.04, -0.4],
  smg: [0, -0.045, -0.26],
  shotgun: [0, -0.02, -0.44],
  shotgunTactical: [0, -0.02, -0.32],
  dmr: [0, -0.04, -0.4],
  revolver: [-0.045, -0.035, 0],
  knife: null,
  none: null,
};

/**
 * Geometría de cada arma, por bloques: el cañón apunta a −Z del soporte y la empuñadura queda en la
 * mano (el origen). El color de acento marca un detalle (raíl, base del cargador); en los enemigos es
 * el color de su tipo.
 */
export function weaponGeometry(model: Exclude<WeaponModel, 'none'>, accent: number): BufferGeometry {
  const dark = 0x272a31; // acero pavonado
  const black = 0x17181d; // polímero
  const steel = 0x8b919a; // piezas pulidas
  const slot = 0x0b0c0e; // ranuras y huecos
  const wood = 0x5b3a22;
  const brass = 0xc9a14a;
  const shell = 0xa8282c; // cartuchos de escopeta
  const lens = 0x4a9ac4;
  switch (model) {
    case 'pistol':
      // Pistola de competición: corredera larga con estrías, compensador y cachas.
      return merge([
        cbox(0.032, 0.036, 0.2, dark, 0, 0.046, -0.09), // corredera
        cbox(0.0335, 0.028, 0.026, black, 0, 0.046, -0.002), // estrías
        cbox(0.016, 0.006, 0.042, steel, 0.005, 0.065, -0.06), // cañón en la ventana de expulsión
        cbox(0.036, 0.042, 0.034, dark, 0, 0.043, -0.205), // compensador
        cbox(0.02, 0.004, 0.022, black, 0, 0.0645, -0.205),
        cbox(0.03, 0.022, 0.13, black, 0, 0.017, -0.08), // armazón con raíl
        cbox(0.008, 0.008, 0.05, black, 0, -0.012, -0.05), // guardamonte
        cbox(0.008, 0.028, 0.008, black, 0, 0, -0.075),
        cbox(0.006, 0.018, 0.006, steel, 0, 0, -0.04), // gatillo
        cbox(0.03, 0.105, 0.046, black, 0, -0.034, -0.008, 0, -0.26), // empuñadura
        cbox(0.033, 0.07, 0.032, dark, 0, -0.038, -0.004, 0, -0.26), // cachas
        cbox(0.034, 0.012, 0.05, steel, 0, -0.088, 0.006, 0, -0.26), // base del cargador
        cbox(0.03, 0.01, 0.03, black, 0, 0.026, 0.018), // cola de castor
        cbox(0.008, 0.01, 0.01, black, 0, 0.069, -0.178), // punto de mira
        cbox(0.028, 0.012, 0.012, black, 0, 0.07, 0), // alza
      ]);
    case 'revolver':
      // Revólver de seis tiros: cañón con costilla y protector del extractor, tambor estriado y cachas de madera.
      return merge([
        cbox(0.03, 0.05, 0.08, dark, 0, 0.032, -0.03), // armazón
        cbox(0.04, 0.04, 0.05, steel, 0, 0.03, -0.045), // tambor
        cbox(0.042, 0.01, 0.052, dark, 0, 0.03, -0.045), // estrías del tambor
        cbox(0.022, 0.03, 0.17, dark, 0, 0.045, -0.15), // cañón
        cbox(0.012, 0.012, 0.17, black, 0, 0.064, -0.15), // costilla
        cbox(0.016, 0.018, 0.16, black, 0, 0.024, -0.145), // protector del extractor
        cbox(0.008, 0.016, 0.01, black, 0, 0.078, -0.226), // punto de mira
        cbox(0.01, 0.02, 0.018, black, 0, 0.066, 0.012, 0, 0.5), // martillo
        cbox(0.008, 0.008, 0.04, dark, 0, -0.004, -0.03), // guardamonte
        cbox(0.006, 0.018, 0.006, steel, 0, 0.006, -0.026), // gatillo
        cbox(0.032, 0.095, 0.045, wood, 0, -0.035, 0.018, 0, -0.35), // cachas de madera
        cbox(0.033, 0.011, 0.032, accent, 0, -0.084, 0.036, 0, -0.35), // remate de la culata
      ]);
    case 'rifle':
      // Carabina de competición: visor de punto rojo con miras de respaldo, guardamanos largo con ranuras,
      // empuñadura delantera inclinada, bocacha con puertos y culata con apoyo para la mejilla.
      return merge([
        cbox(0.046, 0.058, 0.25, dark, 0, 0.04, -0.07), // cajón superior
        cbox(0.048, 0.008, 0.25, black, 0, 0.073, -0.07), // raíl del cajón
        cbox(0.004, 0.022, 0.05, steel, 0.024, 0.045, -0.04), // ventana de expulsión
        cbox(0.012, 0.016, 0.02, steel, 0.027, 0.052, 0.025), // asistente de cierre
        cbox(0.05, 0.01, 0.014, black, 0, 0.07, 0.062), // palanca de carga
        cbox(0.042, 0.042, 0.15, black, 0, -0.005, -0.045), // cajón inferior
        cbox(0.008, 0.008, 0.055, black, 0, -0.029, -0.04), // guardamonte
        cbox(0.006, 0.018, 0.006, steel, 0, -0.018, -0.032), // gatillo
        cbox(0.034, 0.088, 0.044, black, 0, -0.055, 0.03, 0, -0.32), // empuñadura
        cbox(0.036, 0.05, 0.03, dark, 0, -0.06, 0.034, 0, -0.32), // textura de la empuñadura
        cbox(0.03, 0.12, 0.062, dark, 0, -0.08, -0.09, 0, 0.18), // cargador
        cbox(0.0315, 0.006, 0.064, black, 0, -0.06, -0.086, 0, 0.18), // nervios del cargador
        cbox(0.0315, 0.006, 0.064, black, 0, -0.09, -0.092, 0, 0.18),
        cbox(0.032, 0.012, 0.066, black, 0, -0.145, -0.102, 0, 0.18), // base del cargador
        cbox(0.054, 0.064, 0.28, black, 0, 0.03, -0.33), // guardamanos
        cbox(0.02, 0.008, 0.26, accent, 0, 0.066, -0.33), // raíl superior
        cbox(0.0565, 0.012, 0.035, slot, 0, 0.03, -0.24), // ranuras del guardamanos
        cbox(0.0565, 0.012, 0.035, slot, 0, 0.03, -0.3),
        cbox(0.0565, 0.012, 0.035, slot, 0, 0.03, -0.36),
        cbox(0.0565, 0.012, 0.035, slot, 0, 0.03, -0.42),
        cbox(0.032, 0.03, 0.075, black, 0, -0.016, -0.4, 0, 0.35), // empuñadura delantera inclinada
        cbox(0.016, 0.032, 0.012, black, 0, 0.086, -0.455), // mira delantera abatible
        cbox(0.02, 0.02, 0.11, dark, 0, 0.035, -0.52), // cañón
        cbox(0.032, 0.034, 0.06, black, 0, 0.035, -0.605), // bocacha
        cbox(0.02, 0.004, 0.009, slot, 0, 0.0525, -0.592), // puertos de la bocacha
        cbox(0.02, 0.004, 0.009, slot, 0, 0.0525, -0.615),
        cbox(0.028, 0.028, 0.12, dark, 0, 0.034, 0.1), // tubo de la culata
        cbox(0.044, 0.09, 0.12, black, 0, 0.018, 0.2), // culata
        cbox(0.04, 0.02, 0.1, dark, 0, 0.072, 0.19), // apoyo de la mejilla
        cbox(0.046, 0.094, 0.016, slot, 0, 0.018, 0.268), // cantonera de goma
        cbox(0.006, 0.014, 0.014, steel, 0.025, 0.004, 0.15), // anilla para la correa
        cbox(0.03, 0.022, 0.07, dark, 0, 0.088, -0.07), // base del visor
        cbox(0.038, 0.044, 0.07, black, 0, 0.12, -0.07), // visor
        cbox(0.042, 0.048, 0.012, black, 0, 0.12, -0.104), // parasol del visor
        cbox(0.026, 0.026, 0.004, lens, 0, 0.12, -0.111), // lente
        cbox(0.03, 0.02, 0.014, black, 0, 0.087, 0.035), // mira trasera abatible
      ]);
    case 'dmr':
      // Rifle de tirador: cañón largo con freno de boca, mira telescópica, bípode plegado y culata ajustable.
      return merge([
        cbox(0.048, 0.06, 0.28, dark, 0, 0.04, -0.07), // cajón
        cbox(0.05, 0.008, 0.28, black, 0, 0.074, -0.07), // raíl
        cbox(0.004, 0.022, 0.06, steel, 0.025, 0.045, -0.04), // ventana de expulsión
        cbox(0.044, 0.044, 0.16, black, 0, -0.006, -0.045), // cajón inferior
        cbox(0.008, 0.008, 0.055, black, 0, -0.031, -0.04), // guardamonte
        cbox(0.006, 0.018, 0.006, steel, 0, -0.02, -0.032), // gatillo
        cbox(0.034, 0.09, 0.044, black, 0, -0.056, 0.03, 0, -0.32), // empuñadura
        cbox(0.032, 0.09, 0.07, dark, 0, -0.065, -0.1, 0, 0.08), // cargador corto
        cbox(0.034, 0.012, 0.074, black, 0, -0.116, -0.104, 0, 0.08),
        cbox(0.05, 0.06, 0.3, black, 0, 0.032, -0.36), // guardamanos
        cbox(0.0515, 0.012, 0.04, slot, 0, 0.032, -0.28), // ranuras
        cbox(0.0515, 0.012, 0.04, slot, 0, 0.032, -0.36),
        cbox(0.0515, 0.012, 0.04, slot, 0, 0.032, -0.44),
        cbox(0.02, 0.02, 0.26, dark, 0, 0.038, -0.64), // cañón largo
        cbox(0.036, 0.036, 0.07, black, 0, 0.038, -0.8), // freno de boca
        cbox(0.038, 0.006, 0.012, slot, 0, 0.056, -0.79), // puertos del freno
        cbox(0.038, 0.006, 0.012, slot, 0, 0.056, -0.81),
        cbox(0.014, 0.012, 0.2, dark, -0.012, -0.004, -0.42), // bípode plegado
        cbox(0.014, 0.012, 0.2, dark, 0.012, -0.004, -0.42),
        cbox(0.03, 0.03, 0.12, dark, 0, 0.034, 0.1), // tubo de la culata
        cbox(0.044, 0.1, 0.14, black, 0, 0.012, 0.21), // culata
        cbox(0.038, 0.022, 0.12, dark, 0, 0.074, 0.2), // apoyo de la mejilla ajustable
        cbox(0.046, 0.104, 0.016, slot, 0, 0.012, 0.288), // cantonera
        cbox(0.032, 0.03, 0.022, dark, 0, 0.094, -0.13), // anillas de la mira
        cbox(0.032, 0.03, 0.022, dark, 0, 0.094, 0),
        cbox(0.034, 0.034, 0.26, black, 0, 0.12, -0.06), // tubo de la mira
        cbox(0.052, 0.052, 0.07, black, 0, 0.12, -0.215), // objetivo
        cbox(0.054, 0.054, 0.01, accent, 0, 0.12, -0.18), // anillo de color
        cbox(0.044, 0.044, 0.05, black, 0, 0.12, 0.08), // ocular
        cbox(0.042, 0.042, 0.004, lens, 0, 0.12, -0.251), // lente
        cbox(0.022, 0.02, 0.022, dark, 0, 0.146, -0.06), // torreta de elevación
        cbox(0.02, 0.022, 0.022, dark, 0.026, 0.12, -0.06), // torreta lateral
      ]);
    case 'smg':
      // Subfusil compacto: raíl superior, palanca de carga, culata plegable de alambre y cargador recto.
      return merge([
        cbox(0.046, 0.066, 0.24, dark, 0, 0.035, -0.075), // cajón
        cbox(0.048, 0.008, 0.2, black, 0, 0.072, -0.08), // raíl superior
        cbox(0.004, 0.02, 0.045, steel, 0.024, 0.042, -0.04), // ventana de expulsión
        cbox(0.012, 0.012, 0.03, black, -0.029, 0.056, -0.17), // palanca de carga
        cbox(0.05, 0.05, 0.1, black, 0, 0.02, -0.245), // guardamanos
        cbox(0.0515, 0.01, 0.06, slot, 0, 0.02, -0.245), // ranura del guardamanos
        cbox(0.03, 0.03, 0.06, black, 0, 0.035, -0.325), // cañón
        cbox(0.034, 0.085, 0.044, black, 0, -0.036, 0.015, 0, -0.26), // empuñadura
        cbox(0.008, 0.008, 0.045, black, 0, -0.008, -0.025), // guardamonte
        cbox(0.028, 0.13, 0.036, dark, 0, -0.055, -0.13, 0, 0.12), // cargador
        cbox(0.0295, 0.006, 0.038, black, 0, -0.07, -0.132, 0, 0.12), // nervio del cargador
        cbox(0.032, 0.012, 0.042, accent, 0, -0.1255, -0.1385, 0, 0.12), // base del cargador
        cbox(0.018, 0.016, 0.14, dark, 0, 0.05, 0.11), // culata plegable
        cbox(0.018, 0.016, 0.12, dark, 0, -0.005, 0.1),
        cbox(0.04, 0.08, 0.02, black, 0, 0.022, 0.18),
        cbox(0.03, 0.02, 0.02, black, 0, 0.085, 0.02), // alza
        cbox(0.02, 0.022, 0.012, black, 0, 0.083, -0.165), // punto de mira
      ]);
    case 'shotgun':
      // Escopeta de corredera del Sommelier: madera con estrías, grabado dorado, costilla ventilada y cartuchos al costado.
      return merge([
        cbox(0.05, 0.068, 0.2, dark, 0, 0.03, -0.06), // cajón
        cbox(0.051, 0.008, 0.12, brass, 0, 0.032, -0.06), // grabado dorado
        cbox(0.03, 0.03, 0.5, dark, 0, 0.05, -0.41), // cañón
        cbox(0.012, 0.006, 0.48, black, 0, 0.068, -0.41), // costilla ventilada
        cbox(0.028, 0.026, 0.4, black, 0, 0.016, -0.36), // depósito tubular
        cbox(0.032, 0.03, 0.02, dark, 0, 0.016, -0.565), // tapón del depósito
        cbox(0.05, 0.048, 0.17, wood, 0, 0.02, -0.44), // corredera
        cbox(0.052, 0.006, 0.17, 0x3d2616, 0, 0.032, -0.44), // estrías de la corredera
        cbox(0.052, 0.006, 0.17, 0x3d2616, 0, 0.008, -0.44),
        cbox(0.01, 0.012, 0.012, brass, 0, 0.077, -0.65), // punto de mira
        cbox(0.008, 0.008, 0.05, black, 0, -0.012, -0.03), // guardamonte
        cbox(0.006, 0.018, 0.006, steel, 0, -0.002, -0.025), // gatillo
        cbox(0.006, 0.05, 0.1, black, 0.028, 0.03, -0.07), // portacartuchos
        cbox(0.01, 0.034, 0.016, shell, 0.034, 0.038, -0.105), // cartuchos
        cbox(0.01, 0.034, 0.016, shell, 0.034, 0.038, -0.083),
        cbox(0.01, 0.034, 0.016, shell, 0.034, 0.038, -0.061),
        cbox(0.01, 0.034, 0.016, shell, 0.034, 0.038, -0.039),
        cbox(0.011, 0.01, 0.017, brass, 0.034, 0.016, -0.105), // culotes de latón
        cbox(0.011, 0.01, 0.017, brass, 0.034, 0.016, -0.083),
        cbox(0.011, 0.01, 0.017, brass, 0.034, 0.016, -0.061),
        cbox(0.011, 0.01, 0.017, brass, 0.034, 0.016, -0.039),
        cbox(0.034, 0.08, 0.05, wood, 0, -0.03, 0.055, 0, -0.35), // garganta de la culata
        cbox(0.046, 0.09, 0.22, wood, 0, -0.016, 0.19, 0, 0.12), // culata
        cbox(0.048, 0.094, 0.02, black, 0, -0.03, 0.3, 0, 0.12), // cantonera
        cbox(0.006, 0.012, 0.012, steel, 0.024, -0.04, 0.24), // anilla para la correa
      ]);
    case 'shotgunTactical':
      // Escopeta táctica semiautomática: negra, con raíl, cartuchos al costado y culata de pistolete.
      return merge([
        cbox(0.052, 0.07, 0.22, dark, 0, 0.03, -0.06), // cajón
        cbox(0.054, 0.008, 0.2, black, 0, 0.069, -0.06), // raíl
        cbox(0.004, 0.024, 0.06, steel, 0.027, 0.035, -0.05), // ventana de expulsión
        cbox(0.032, 0.032, 0.46, dark, 0, 0.052, -0.4), // cañón
        cbox(0.028, 0.026, 0.36, black, 0, 0.016, -0.34), // depósito tubular
        cbox(0.052, 0.05, 0.18, black, 0, 0.022, -0.32), // guardamanos
        cbox(0.0535, 0.01, 0.12, slot, 0, 0.022, -0.32), // ranura del guardamanos
        cbox(0.04, 0.04, 0.03, black, 0, 0.036, -0.505), // abrazadera
        cbox(0.014, 0.022, 0.012, black, 0, 0.08, -0.6), // punto de mira
        cbox(0.03, 0.014, 0.014, black, 0, 0.08, 0.02), // alza
        cbox(0.008, 0.008, 0.05, black, 0, -0.012, -0.03), // guardamonte
        cbox(0.006, 0.018, 0.006, steel, 0, -0.002, -0.025), // gatillo
        cbox(0.006, 0.05, 0.1, black, 0.029, 0.03, -0.07), // portacartuchos
        cbox(0.01, 0.034, 0.016, shell, 0.035, 0.038, -0.105), // cartuchos
        cbox(0.01, 0.034, 0.016, shell, 0.035, 0.038, -0.083),
        cbox(0.01, 0.034, 0.016, shell, 0.035, 0.038, -0.061),
        cbox(0.01, 0.034, 0.016, shell, 0.035, 0.038, -0.039),
        cbox(0.011, 0.01, 0.017, brass, 0.035, 0.016, -0.105),
        cbox(0.011, 0.01, 0.017, brass, 0.035, 0.016, -0.083),
        cbox(0.011, 0.01, 0.017, brass, 0.035, 0.016, -0.061),
        cbox(0.011, 0.01, 0.017, brass, 0.035, 0.016, -0.039),
        cbox(0.034, 0.088, 0.046, black, 0, -0.05, 0.035, 0, -0.3), // empuñadura
        cbox(0.028, 0.028, 0.12, dark, 0, 0.03, 0.1), // tubo de la culata
        cbox(0.046, 0.09, 0.12, black, 0, 0.015, 0.2), // culata
        cbox(0.048, 0.094, 0.016, slot, 0, 0.015, 0.268), // cantonera
        cbox(0.02, 0.02, 0.02, accent, 0, 0.03, -0.155), // botón de carga (color del enemigo)
      ]);
    case 'knife':
      // Cuchillo táctico: hoja con punta recortada, filo claro y mango con anillas.
      return merge([
        cbox(0.007, 0.032, 0.13, 0xb9bec6, 0, 0.004, -0.115), // hoja
        cbox(0.006, 0.02, 0.045, 0xb9bec6, 0, 0.01, -0.2025), // punta
        cbox(0.008, 0.007, 0.13, 0xe6e9ed, 0, -0.0115, -0.115), // filo
        cbox(0.016, 0.05, 0.012, black, 0, 0.002, -0.045), // guarda
        cbox(0.022, 0.03, 0.085, 0x26282d, 0, -0.002, 0.004), // mango
        cbox(0.024, 0.032, 0.008, black, 0, -0.002, -0.016), // anillas
        cbox(0.024, 0.032, 0.008, black, 0, -0.002, 0.02),
        cbox(0.024, 0.026, 0.014, steel, 0, -0.002, 0.053), // pomo
      ]);
  }
}
