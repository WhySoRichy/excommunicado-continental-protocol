import { type BufferGeometry, CylinderGeometry } from 'three';
import { cbox, ccyl, cprism, merge, paint, shade, trim } from './geometry';
import { FOOT_DROP, HAND_Y, NECK_Y } from './skeleton';
import type { Outfit, RigOptions } from './types';

const HALF_PI = Math.PI / 2;

/** Torso en V: pelvis, faldón, pecho, hombros rectos, cuello de camisa, solapas, corbata y prendas. */
export function torsoGeometry(o: RigOptions): BufferGeometry {
  const c = o.colors;
  const b = o.bulk ?? 1;
  const edge = trim(c.jacket);
  const zf = -0.118 * b; // plano frontal del pecho
  const fit: Outfit = o.outfit ?? {};
  const jacket = fit.jacket !== false;
  const torsoParts: BufferGeometry[] = [
    cprism(0.33 * b, 0.19 * b, 0.3 * b, 0.17 * b, 0.16, c.pants, 0, 0, 0),
    cprism(0.335 * b, 0.2 * b, 0.375 * b, 0.225 * b, 0.2, jacket ? c.jacket : c.pants, 0, 0.06, 0), // faldón (sin chaqueta, la cintura del pantalón)
    cprism(0.48 * b, 0.235 * b, 0.335 * b, 0.2 * b, 0.42, c.jacket, 0, 0.37, 0), // pecho
    cprism(0.4 * b, 0.19 * b, 0.5 * b, 0.245 * b, 0.07, c.jacket, 0, 0.615, 0), // hombros
    cprism(0.12, 0.125, 0.14, 0.14, 0.04, c.shirt, 0, 0.68, -0.002), // cuello de la camisa
    ccyl(0.047, 0.05, 0.1, c.skin, 0, 0.7, 0, 1, 6),
    cprism(0.15, 0.02, 0.03, 0.02, 0.27, c.shirt, 0, 0.485, zf), // pechera en V
  ];
  if (jacket) {
    torsoParts.push(
      cprism(0.17, 0.15, 0.21, 0.18, 0.045, c.jacket, 0, 0.652, 0.005), // cuello de la chaqueta
      // Solapas: paño de la chaqueta algo levantado, con el borde de la abertura marcado.
      cbox(0.06, 0.3, 0.03, c.jacket, -0.078, 0.49, zf - 0.011, 0.27),
      cbox(0.06, 0.3, 0.03, c.jacket, 0.078, 0.49, zf - 0.011, -0.27),
      cbox(0.01, 0.3, 0.032, edge, -0.054, 0.497, zf - 0.011, 0.27),
      cbox(0.01, 0.3, 0.032, edge, 0.054, 0.497, zf - 0.011, -0.27),
      cbox(0.02, 0.02, 0.012, edge, 0, 0.3, -0.108 * b), // botón
      cbox(0.012, 0.17, 0.012, edge, 0, 0.055, 0.108 * b), // abertura trasera
      cbox(0.008, 0.4, 0.01, edge, 0, 0.37, 0.108 * b), // costura de la espalda
    );
    if (fit.pocketSquare !== false) torsoParts.push(cbox(0.055, 0.024, 0.02, c.accent, -0.15 * b, 0.5, zf + 0.002)); // pañuelo de bolsillo
  }
  if (fit.bowTie) {
    torsoParts.push(
      cbox(0.04, 0.03, 0.016, c.tie, -0.026, 0.645, zf + 0.013), // pajarita
      cbox(0.04, 0.03, 0.016, c.tie, 0.026, 0.645, zf + 0.013),
      cbox(0.018, 0.022, 0.02, c.tie, 0, 0.645, zf + 0.011),
    );
  } else {
    torsoParts.push(
      cprism(0.036, 0.02, 0.052, 0.02, 0.22, c.tie, 0, 0.47, zf - 0.008), // corbata
      cbox(0.046, 0.034, 0.024, c.tie, 0, 0.595, zf - 0.008), // nudo
    );
  }
  if (fit.waistcoat !== undefined) {
    const wc = fit.waistcoat;
    const btn = trim(wc);
    if (jacket) {
      // Traje de tres piezas: el chaleco asoma entre las solapas y la corbata se ve por encima.
      torsoParts.push(
        cbox(0.062, 0.22, 0.012, wc, -0.03, 0.42, zf - 0.016, 0.18),
        cbox(0.062, 0.22, 0.012, wc, 0.03, 0.42, zf - 0.016, -0.18),
        cbox(0.012, 0.012, 0.006, btn, 0, 0.37, zf - 0.024),
        cbox(0.012, 0.012, 0.006, btn, 0, 0.42, zf - 0.024),
      );
    } else {
      // Sin chaqueta el chaleco cubre el pecho y deja a la vista las mangas de la camisa.
      torsoParts.push(
        cprism(0.42 * b, 0.25 * b, 0.345 * b, 0.215 * b, 0.38, wc, 0, 0.35, 0),
        cbox(0.012, 0.012, 0.008, btn, 0, 0.2, -0.116 * b),
        cbox(0.012, 0.012, 0.008, btn, 0, 0.25, -0.118 * b),
        cbox(0.012, 0.012, 0.008, btn, 0, 0.3, -0.12 * b),
      );
    }
  }
  if (fit.apron !== undefined) {
    const ap = fit.apron;
    torsoParts.push(
      cbox(0.35 * b, 0.03, 0.214 * b, ap, 0, 0.13, 0), // cinta
      cprism(0.34 * b, 0.016, 0.4 * b, 0.016, 0.68, ap, 0, -0.21, -0.118 * b), // delantal hasta debajo de la rodilla
      cbox(0.13, 0.01, 0.006, trim(ap), 0.07, -0.12, -0.129 * b), // borde del bolsillo
    );
  }
  if (fit.tastevin) {
    // Catavinos de plata colgado de una cadena.
    const silver = 0xc9cdd3;
    const cup = new CylinderGeometry(0.03, 0.03, 0.012, 8);
    cup.rotateX(HALF_PI);
    cup.translate(0, 0.36, -0.135);
    torsoParts.push(
      cbox(0.006, 0.253, 0.006, silver, -0.02, 0.515, -0.132, 0.159),
      cbox(0.006, 0.253, 0.006, silver, 0.02, 0.515, -0.132, -0.159),
      paint(cup, silver),
    );
  }
  if (o.vest) {
    const plate = shade(c.accent, 0.62);
    torsoParts.push(
      cprism(0.45 * b, 0.3 * b, 0.37 * b, 0.27 * b, 0.33, c.accent, 0, 0.385, 0), // portaplacas
      cbox(0.07, 0.1, 0.03, plate, -0.09, 0.3, -0.15 * b), // portacargadores
      cbox(0.07, 0.1, 0.03, plate, 0, 0.3, -0.15 * b),
      cbox(0.07, 0.1, 0.03, plate, 0.09, 0.3, -0.15 * b),
      cbox(0.06, 0.1, 0.27 * b, plate, -0.14 * b, 0.6, 0), // tirantes
      cbox(0.06, 0.1, 0.27 * b, plate, 0.14 * b, 0.6, 0),
    );
  }
  return merge(torsoParts);
}

/** Cabeza facetada: cráneo, pómulos, mandíbula marcada, rasgos mínimos y pelo. */
export function headGeometry(o: RigOptions): BufferGeometry {
  const c = o.colors;
  const hy = -NECK_Y;
  const dark = 0x0c0d10;
  const jawColor = o.beard ? shade(c.hair, 1.1) : c.skin;
  const wick = o.face === 'wick';
  // Rostro del Huésped, inspirado en John Wick, por bloques: cara alargada, pómulos altos, cejas rectas y
  // gruesas que caen hacia fuera, ojos rasgados con el párpado caído y nariz larga y recta.
  const wickFace = (): BufferGeometry[] => [
    cprism(0.148, 0.17, 0.178, 0.198, 0.12, c.skin, 0, 0.875 + hy, 0), // cráneo
    cprism(0.18, 0.196, 0.164, 0.184, 0.07, c.skin, 0, 0.78 + hy, 0), // pómulos altos
    cprism(0.164, 0.184, 0.104, 0.12, 0.09, jawColor, 0, 0.7 + hy, -0.008), // mandíbula larga
    cbox(0.06, 0.02, 0.024, c.hair, -0.044, 0.822 + hy, -0.093, -0.05), // cejas rectas y bajas: mirada seria
    cbox(0.06, 0.02, 0.024, c.hair, 0.044, 0.822 + hy, -0.093, 0.05),
    cbox(0.04, 0.009, 0.012, shade(c.skin, 0.72), -0.045, 0.811 + hy, -0.096, 0.06), // párpados
    cbox(0.04, 0.009, 0.012, shade(c.skin, 0.72), 0.045, 0.811 + hy, -0.096, -0.06),
    cbox(0.034, 0.011, 0.012, 0x1c1411, -0.045, 0.801 + hy, -0.096, 0.08), // ojos
    cbox(0.034, 0.011, 0.012, 0x1c1411, 0.045, 0.801 + hy, -0.096, -0.08),
    cprism(0.022, 0.018, 0.04, 0.044, 0.08, shade(c.skin, 0.92), 0, 0.775 + hy, -0.105), // nariz larga
    cbox(0.02, 0.05, 0.035, shade(c.skin, 0.9), -0.092, 0.79 + hy, 0.005), // orejas
    cbox(0.02, 0.05, 0.035, shade(c.skin, 0.9), 0.092, 0.79 + hy, 0.005),
  ];
  const headParts: BufferGeometry[] = wick
    ? wickFace()
    : [
        cprism(0.15, 0.17, 0.186, 0.2, 0.12, c.skin, 0, 0.875 + hy, 0), // cráneo
        cprism(0.186, 0.2, 0.172, 0.186, 0.07, c.skin, 0, 0.78 + hy, 0), // pómulos
        cprism(0.172, 0.186, 0.105, 0.12, 0.08, jawColor, 0, 0.705 + hy, -0.008), // mandíbula
        cbox(0.062, 0.016, 0.024, c.hair, -0.046, 0.824 + hy, -0.092, -0.16), // cejas fruncidas
        cbox(0.062, 0.016, 0.024, c.hair, 0.046, 0.824 + hy, -0.092, 0.16),
        cbox(0.036, 0.013, 0.012, dark, -0.046, 0.803 + hy, -0.096), // ojos
        cbox(0.036, 0.013, 0.012, dark, 0.046, 0.803 + hy, -0.096),
        cprism(0.026, 0.02, 0.042, 0.046, 0.062, shade(c.skin, 0.9), 0, 0.776 + hy, -0.106), // nariz
        cbox(0.02, 0.05, 0.035, shade(c.skin, 0.9), -0.097, 0.79 + hy, 0.005), // orejas
        cbox(0.02, 0.05, 0.035, shade(c.skin, 0.9), 0.097, 0.79 + hy, 0.005),
      ];
  if (o.beard && wick) {
    // Barba corta y cerrada: bigote unido a la barba por las comisuras, mejillas, patillas y mentón.
    headParts.push(
      cbox(0.05, 0.008, 0.012, 0x2a1a14, 0, 0.716 + hy, -0.099), // boca
      cbox(0.04, 0.01, 0.012, shade(c.skin, 0.8), 0, 0.707 + hy, -0.096), // labio inferior
      cbox(0.068, 0.016, 0.016, jawColor, 0, 0.728 + hy, -0.1), // bigote
      cbox(0.014, 0.032, 0.014, jawColor, -0.034, 0.712 + hy, -0.097), // comisuras
      cbox(0.014, 0.032, 0.014, jawColor, 0.034, 0.712 + hy, -0.097),
      cbox(0.03, 0.04, 0.012, jawColor, -0.058, 0.736 + hy, -0.093), // barba sobre las mejillas
      cbox(0.03, 0.04, 0.012, jawColor, 0.058, 0.736 + hy, -0.093),
      cbox(0.016, 0.085, 0.12, jawColor, -0.083, 0.73 + hy, -0.03), // patillas hasta la mandíbula
      cbox(0.016, 0.085, 0.12, jawColor, 0.083, 0.73 + hy, -0.03),
      cbox(0.066, 0.045, 0.03, jawColor, 0, 0.67 + hy, -0.068), // mentón
    );
  } else if (o.beard) {
    headParts.push(
      cbox(0.06, 0.012, 0.012, shade(c.skin, 0.6), 0, 0.726 + hy, -0.098), // boca
      cbox(0.09, 0.02, 0.014, jawColor, 0, 0.745 + hy, -0.096), // bigote
      cbox(0.018, 0.1, 0.12, jawColor, -0.088, 0.74 + hy, -0.025), // barba de las mejillas
      cbox(0.018, 0.1, 0.12, jawColor, 0.088, 0.74 + hy, -0.025),
      cbox(0.07, 0.04, 0.03, jawColor, 0, 0.68 + hy, -0.07), // mentón
    );
  } else {
    headParts.push(cbox(0.056, 0.01, 0.012, shade(c.skin, 0.55), 0, 0.722 + hy, -0.092));
    // Bigote encerado con las puntas hacia arriba.
    if (o.outfit?.mustache)
      headParts.push(cbox(0.042, 0.013, 0.016, c.hair, -0.022, 0.738 + hy, -0.1, -0.2), cbox(0.042, 0.013, 0.016, c.hair, 0.022, 0.738 + hy, -0.1, 0.2));
  }
  switch (o.hair) {
    case 'parted':
      // Media melena con raya al medio: cae a los lados de la cara y por detrás hasta el cuello.
      headParts.push(
        cprism(0.085, 0.19, 0.104, 0.214, 0.075, c.hair, -0.04, 0.91 + hy, 0.006, 0.14), // mitades de la raya
        cprism(0.085, 0.19, 0.104, 0.214, 0.075, c.hair, 0.04, 0.91 + hy, 0.006, -0.14),
        cbox(0.024, 0.11, 0.024, c.hair, -0.052, 0.885 + hy, -0.098, -0.6), // mechones sobre la frente
        cbox(0.024, 0.11, 0.024, c.hair, 0.052, 0.885 + hy, -0.098, 0.6),
        cbox(0.022, 0.2, 0.04, c.hair, -0.098, 0.785 + hy, -0.048, -0.04), // caída junto a las sienes, hasta la mandíbula
        cbox(0.022, 0.2, 0.04, c.hair, 0.098, 0.785 + hy, -0.048, 0.04),
        cbox(0.022, 0.21, 0.06, c.hair, -0.099, 0.795 + hy, -0.005, -0.05), // mechones sobre las orejas
        cbox(0.022, 0.21, 0.06, c.hair, 0.099, 0.795 + hy, -0.005, 0.05),
        cbox(0.022, 0.23, 0.065, c.hair, -0.104, 0.785 + hy, 0.052, -0.07), // mechones de detrás, algo más largos
        cbox(0.022, 0.23, 0.065, c.hair, 0.104, 0.785 + hy, 0.052, 0.07),
        cprism(0.2, 0.09, 0.18, 0.085, 0.25, c.hair, 0, 0.785 + hy, 0.085), // melena hasta el cuello
        // Puntas a distinto largo: rompen el bloque, que es lo que más se ve desde la cámara.
        cbox(0.066, 0.07, 0.05, c.hair, -0.062, 0.65 + hy, 0.112, 0.1),
        cbox(0.07, 0.085, 0.055, c.hair, 0, 0.635 + hy, 0.112),
        cbox(0.066, 0.07, 0.05, c.hair, 0.062, 0.65 + hy, 0.112, -0.1),
      );
      break;
    case 'slick':
      // Engominado hacia atrás: pegado al cráneo, con una onda sobre la frente y la nuca recogida.
      headParts.push(
        cprism(0.15, 0.17, 0.178, 0.208, 0.07, c.hair, 0, 0.915 + hy, 0.012),
        cprism(0.12, 0.05, 0.15, 0.065, 0.035, c.hair, 0, 0.955 + hy, -0.058), // onda
        cprism(0.18, 0.06, 0.16, 0.045, 0.12, c.hair, 0, 0.84 + hy, 0.075), // nuca
        cbox(0.012, 0.07, 0.1, c.hair, -0.094, 0.855 + hy, 0.03),
        cbox(0.012, 0.07, 0.1, c.hair, 0.094, 0.855 + hy, 0.03),
      );
      break;
    case 'long':
      // Melena peinada hacia atrás hasta el cuello, con dos mechones que enmarcan la cara.
      headParts.push(
        cprism(0.165, 0.19, 0.2, 0.215, 0.07, c.hair, 0, 0.9 + hy, 0.006),
        cprism(0.1, 0.13, 0.165, 0.19, 0.025, c.hair, 0, 0.947 + hy, 0.012), // coronilla
        cprism(0.2, 0.1, 0.13, 0.04, 0.26, c.hair, 0, 0.77 + hy, 0.085),
        cbox(0.022, 0.19, 0.1, c.hair, -0.1, 0.8 + hy, 0.05),
        cbox(0.022, 0.19, 0.1, c.hair, 0.1, 0.8 + hy, 0.05),
        cbox(0.02, 0.13, 0.03, c.hair, -0.092, 0.825 + hy, -0.066, 0.1),
        cbox(0.02, 0.13, 0.03, c.hair, 0.092, 0.825 + hy, -0.066, -0.1),
      );
      break;
    case 'short':
      headParts.push(
        cprism(0.16, 0.185, 0.196, 0.212, 0.07, c.hair, 0, 0.905 + hy, 0.004),
        cprism(0.196, 0.06, 0.18, 0.04, 0.12, c.hair, 0, 0.83 + hy, 0.085),
        cbox(0.018, 0.07, 0.11, c.hair, -0.097, 0.845 + hy, 0.03),
        cbox(0.018, 0.07, 0.11, c.hair, 0.097, 0.845 + hy, 0.03),
      );
      break;
    case 'helmet':
      headParts.push(
        cprism(0.18, 0.2, 0.225, 0.245, 0.12, c.accent, 0, 0.895 + hy, 0.004),
        cprism(0.225, 0.13, 0.21, 0.1, 0.09, c.accent, 0, 0.8 + hy, 0.06),
        cbox(0.2, 0.04, 0.024, 0x0e1116, 0, 0.805 + hy, -0.1), // visor
        cbox(0.012, 0.11, 0.014, 0x0e1116, -0.094, 0.755 + hy, -0.03), // barboquejo
        cbox(0.012, 0.11, 0.014, 0x0e1116, 0.094, 0.755 + hy, -0.03),
      );
      break;
    case 'cap':
      headParts.push(
        cprism(0.165, 0.19, 0.202, 0.218, 0.075, c.accent, 0, 0.9 + hy, 0.004),
        cbox(0.17, 0.014, 0.11, shade(c.accent, 0.75), 0, 0.868 + hy, -0.15),
        cprism(0.196, 0.05, 0.18, 0.04, 0.07, c.hair, 0, 0.83 + hy, 0.088),
      );
      break;
    case 'bald':
      break;
  }
  return merge(headParts);
}

/** Brazo: hombrera y brazo que se afina. */
export function upperArmGeometry(o: RigOptions): BufferGeometry {
  const c = o.colors;
  const b = o.bulk ?? 1;
  return merge([
    cprism(0.12 * b, 0.14 * b, 0.13 * b, 0.145 * b, 0.09, c.jacket, 0, 0.005, 0),
    cprism(0.125 * b, 0.135 * b, 0.098 * b, 0.105 * b, 0.3, c.jacket, 0, -0.185, 0),
  ]);
}

/** Antebrazo con puño de camisa y mano con pulgar. */
export function forearmGeometry(o: RigOptions): BufferGeometry {
  const c = o.colors;
  const b = o.bulk ?? 1;
  return merge([
    cprism(0.102 * b, 0.108 * b, 0.08 * b, 0.086 * b, 0.26, c.jacket, 0, -0.125, -0.004),
    cprism(0.07, 0.076, 0.066, 0.072, 0.026, c.shirt, 0, -0.264, -0.004),
    cprism(0.046, 0.076, 0.038, 0.086, 0.095, c.skin, 0, HAND_Y - 0.008, -0.01),
    cbox(0.02, 0.045, 0.026, c.skin, 0, HAND_Y + 0.012, -0.062),
  ]);
}

/** Muslo. */
export function thighGeometry(o: RigOptions): BufferGeometry {
  const c = o.colors;
  const b = o.bulk ?? 1;
  return cprism(0.168 * b, 0.185 * b, 0.128 * b, 0.14 * b, 0.48, c.pants, 0, -0.225, 0);
}

/** Espinilla. */
export function shinGeometry(o: RigOptions): BufferGeometry {
  const c = o.colors;
  const b = o.bulk ?? 1;
  return cprism(0.128 * b, 0.14 * b, 0.104 * b, 0.114 * b, 0.42, c.pants, 0, -0.2, 0);
}

/** Zapato (va en el hueso del tobillo): talón, empeine, puntera y suela. */
export function footGeometry(o: RigOptions): BufferGeometry {
  const c = o.colors;
  const b = o.bulk ?? 1;
  return merge([
    cbox(0.1 * b, 0.07, 0.11, c.shoes, 0, -FOOT_DROP + 0.035, 0.005), // talón
    cprism(0.094 * b, 0.13, 0.1 * b, 0.17, 0.05, c.shoes, 0, -FOOT_DROP + 0.036, -0.125), // empeine
    cprism(0.07 * b, 0.05, 0.09 * b, 0.07, 0.03, c.shoes, 0, -FOOT_DROP + 0.026, -0.235), // puntera
    cbox(0.108 * b, 0.012, 0.325, 0x08080a, 0, -FOOT_DROP + 0.006, -0.1), // suela
  ]);
}
