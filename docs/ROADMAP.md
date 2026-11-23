# Roadmap

El rumbo del proyecto (qué queremos que sea, los compromisos con quien juega, la infraestructura por etapas y el orden de los grandes bloques) está en [VISION.md](VISION.md). Este roadmap lo baja a trabajo concreto.

Qué se puede mejorar y en qué orden. Cada bloque está pensado para una sesión de trabajo: tiene un objetivo claro y una forma de comprobar que quedó bien. El estado actual del juego está descrito en [DISENO.md](DISENO.md) y la parte técnica en [ARQUITECTURA.md](ARQUITECTURA.md). Cómo tiene que crecer el código (simulación separada de la vista, varios jugadores, contenido y gráficos) y en qué fases está en [ESCALABILIDAD.md](ESCALABILIDAD.md): los bloques de este roadmap deben respetarlo.

## Estado actual

- Hub, tutorial, tres contratos y Gauntlet completos y jugables de principio a fin.
- Personajes procedurales de diseño facetado (sombreado plano, torso en V, rasgos mínimos) y animación procedural con IK de piernas y de la mano de apoyo, pies articulados, reacciones de impacto, caídas variadas, vault en tres tiempos, takedown coreografiado y tajo de cuchillo en tres tiempos (`src/entities/CharacterRig.ts`). Las cabezas miran: los enemigos siguen al jugador con la vista y se inclinan hacia él al apuntar, los guardias vigilan a un lado y a otro, los NPC del vestíbulo te siguen con la mirada y el Huésped mira hacia donde apunta la cámara.
- Animación sin tirones, medida articulación por articulación: las transiciones (agacharse, apuntar, arrancar, parar) van con muelles críticos, la zancada termina el paso al parar, el cuerpo gira con suavidad aunque la simulación gire en seco y la rodilla ya no frena de golpe al estirarse. Se corrigió además un enganchón del movimiento: al correr se perdía uno de cada 20 o 30 pasos de simulación.
- Armas nuevas (bloque 2, tercera entrega, primera parte): las ocho armas rehechas con piezas de forma real (correderas con estrías, compensador, tambor estriado, guardamanos octogonal con ranuras, freno de boca, punto rojo, mira telescópica, bombeo de madera, portacartuchos, hoja con vaceo) en lugar de cajas. Cada parte tiene su propio brillo (acero pulido, pavonado, latón, madera, goma) con un solo material y una draw call por arma, y el acabado de cada una (`WeaponFinish`) está preparado para las skins.
- Escenarios más realistas (bloque 2, segunda entrega): 16 texturas fotoescaneadas CC0 de Poly Haven (hormigón, yeso, mármol, maderas, terciopelo, cuero, chapas, contenedores, asfalto, granito, ladrillo y grava) con relieve y rugosidad, unos 4,4 MB en WebP y cada nivel descarga solo las suyas; los dibujos propios (damero, cajas, moquetas, peligro) conservan su diseño y ganan relieve. Las fotos se muestrean sin que se note su cuadrícula. Las aristas de las cajas tienen un bisel de 3 cm que atrapa la luz, y en Alto hay oclusión ambiental (sombras de contacto en rincones, pies de las paredes y bajo los muebles). El preset Bajo solo usa el color de las fotos.
- Cobertura rehecha (bloque 2, primera entrega): se entra desde 1,6 m sin estar pegado, manteniendo C se corre a la cobertura que se mira (también de una a otra) y deslizarse contra una pared deja a cubierto; se recorren los rincones y se rodean las esquinas sin soltarse; se dispara a ciegas por encima o por el borde, al apuntar se va solo al borde más cercano y en el borde la cámara enseña lo que hay tras la esquina. Una marca en la pared dice adónde se iría. Se arregló de paso un fallo de la cámara, que se encogía hasta la cabeza a cubierto contra una columna. Medida con la herramienta de tirones: la animación de todo lo nuevo queda en la escala de andar y esprintar.
- Rediseño con más detalle dentro del estilo de bloques: el Huésped inspirado en John Wick (traje de tres piezas, media melena con raya al medio y barba), el Sommelier (camisa, chaleco, pajarita, delantal y catavinos), ocho modelos de arma y proyectiles más vistosos (trazadoras que viajan, fogonazo en estrella y casquillos de latón). Los personajes admiten prendas opcionales y rostros (`Outfit` y `FaceStyle` en `src/entities/rig/types.ts`).
- Dirección de arte nocturna: cielo con silueta de ciudad en los exteriores, vestíbulo del Continental con papel pintado y damero de mármol, bloom y viñeta desde el preset Medio.
- Pruebas unitarias y e2e (qué cubren y cuántas son, en el README); CI y despliegue automático en GitHub Pages.
- Arsenal ampliado: el revólver «Juez» y el rifle de tirador «Meridian» (con mira de aumento) se compran en la armería, y cada tecla de arma recorre su grupo.
- El Gauntlet ya no se degrada con las oleadas: los caídos se retiran al empezar la siguiente y un cuerpo asentado deja de simularse y animarse. Tras doce oleadas, 81 draw calls (antes unas 400). Además, los personajes de igual aspecto comparten la geometría: un enemigo que aparece ya no construye ni sube a la GPU un cuerpo nuevo.
- Primera pasada de robustez tras revisar el juego entero, jugándolo y midiendo: el mapa de sombras se libera al cambiar de nivel, el combate con el Juez se reinicia al reaparecer, un nivel que no se descarga se explica en pantalla, el audio posicional sigue a la cámara en Firefox, abrir el juego sin empezar no crea partida y la voltereta suena.
- Código más fácil de mantener: la geometría del rig vive en `src/entities/rig/`; las reglas de cada objetivo son un módulo puro con tests; la validación de niveles comprueba que el guion de cada misión solo nombra enemigos, grupos, checkpoints e interactivos que existen; y `Game.ts` delega el HUD, la Intel y las invariantes de QA. La red de seguridad se completa con una prueba de humo en Firefox y la comprobación de navegación de todos los niveles del registro.
- Segunda pasada de robustez: si la tarjeta gráfica pierde el contexto, el juego guarda, se pausa, lo avisa y al volver recupera la iluminación; cambiar de calidad en caliente libera el bloom y rehace las sombras sin esperar a otro nivel; los diálogos avanzan con la tecla de interactuar que tenga asignada el jugador; el tiempo jugado ya no pierde fracciones de segundo; el bucle de cada frame no asigna memoria en el HUD, el F3 ni los pickups.
- Agachado y coberturas coherentes: el cuerpo agachado cabe en su cápsula (antes la cabeza asomaba 34 cm por encima y no recibía disparos), las coberturas bajas miden al menos 1,2 m y los sofás ya no cuentan como cobertura. Las armas largas se llevan de perfil y se encaran al hombro al apuntar. Las lámparas de araña del vestíbulo ya no saturan el bloom.
- Herramientas de calidad: formato con Prettier, linter con información de tipos (oxlint), detección de código sin uso (knip) y TypeScript con `noUncheckedIndexedAccess`. La CI los ejecuta, audita las dependencias que se publican, fija sus acciones por SHA, da a cada trabajo solo los permisos que necesita y ya no interrumpe un despliegue en curso. La página publicada lleva una política de seguridad de contenido (CSP) y Dependabot propone cada mes las actualizaciones de dependencias, agrupadas.
- Build de pruebas separado del público: la API de QA y los comandos del F3 (monedas, modo dios) solo existen en desarrollo y en `npm run build:qa`. La versión publicada ya no los incluye, requisito previo de la tabla de récords en línea.

## Bloque 2: pulir mecánicas y gráficos

Decidido el 22 de noviembre de 2026 (ver [VISION.md](VISION.md)): antes de las skins, el juego tiene que estar a la altura de ellas. La vara de medir es el deslizamiento: cada mecánica tiene que sentirse igual de pulida. Se entrega por partes, y cada una se publica cuando está probada:

1. **Cobertura.** Hecha (ver «Estado actual»).
2. **Render y materiales.** Hecho (ver «Estado actual»). Queda para más adelante: luz y sombra afinadas nivel a nivel cuando se rehagan los mapas (entrega 6).
3. **Armas.** Los modelos están hechos (ver «Estado actual»). Falta el inventario y el equipo, pedido por el dueño a mitad de la entrega: se tienen todas las armas que se consiguen, pero al contrato se llevan como mucho cuatro, una de cada tipo: principal (fusiles, subfusiles, escopetas y tirador compiten por el hueco), secundaria (pistolas), cuerpo a cuerpo y equipo (granadas y aturdidoras: contenido nuevo; la primera, una aturdidora que aproveche el estado aturdido y el takedown). Se elige en la armería del vestíbulo y en una pantalla antes de cada contrato; en cooperativo, cada jugador el suyo.
4. **Personajes y aspecto por tipo de enemigo.** Cuerpos con volumen, manos con dedos; cada tipo se reconoce de lejos por su silueta (chaleco táctico, casco y blindaje del pesado, visor del tirador, traje del escolta).
5. **Enemigos: comportamiento, reacciones y tipos nuevos.** Que se cubran de verdad, flanqueen coordinados y se avisen; reacciones según dónde reciben el impacto; enemigo con escudo, perros o drones.
6. **Mapas.** Club Kairos, Muelle 9 y Torre Meridian rehechos con el doble de superficie o más, rutas para flanquear y alturas; contratos de 8 a 12 minutos y sitio para cuatro jugadores.

## Antes de añadir contenido: robustez y rendimiento

Lo que quedó pendiente de esa revisión. Conviene hacerlo antes del cuarto contrato, porque más contenido multiplica estos costes.

### Lo que ya existe y no se ve
- Pantalla de logros (hay 17 y solo aparecen al conseguirlos) y de estadísticas (el tiempo jugado se guarda y no se muestra).
- Selector de dificultad: los multiplicadores de puntería y daño de los enemigos ya están cableados.
- Registro local de partidas exportable, para medir el balance con jugadores reales (punto 3).
- La lluvia declarada en los niveles (`weather`) no se dibuja.

### Mantenibilidad
- Seguir repartiendo `src/game/Game.ts` (unas 1300 líneas; quedan el flujo de los contratos y las interacciones del vestíbulo) y pasar las fases del jefe de `MissionDirector` a un módulo puro.

## Prioridad alta: lo que más se nota al jugar

### 1. Pulido de animación
La cuarta pasada está completa: encare de las armas largas por IK, tajo de cuchillo propio (se arma junto a la oreja y corta en diagonal cruzando el cuerpo), cabezas que miran a su objetivo con independencia del torso, transiciones sin tirones y poses de cobertura. Queda como pulido:
- **Muñecas y dedos**: la mano es un bloque rígido; no rodea el guardamanos ni la empuñadura.
- **Sacudida del Huésped al recibir un impacto**: los enemigos ya la tienen (`RigPose.flinch`), pero el jugador no la usa.
- **Civiles que miran**: bailan, huyen y se esconden sin volver nunca la cabeza hacia el tiroteo.
- Cómo comprobarlo: `npm run poses` genera capturas de perfil de cada pose en `qa-screenshots/poses/`.

### 2. Sensación de combate
Ya hay pausa de impacto y sacudida en cada baja, casquillos, humo en la boca del arma y pisadas que cambian con la velocidad y con el suelo (`src/levels/surface.ts`). Queda:
- Sonido propio para los impactos según la superficie (metal, madera, hormigón).
- Que los enemigos también hagan ruido al andar, para oírlos venir.

### 3. Balance con jugadores reales
- Nadie ajeno al desarrollo ha jugado una partida completa. Hace falta medir cuánto tardan en el tutorial, dónde mueren y qué rango sacan, y ajustar `parTime`, precios y daño.

## Prioridad media: contenido

### 4. Cuarto contrato
- Los niveles son datos (`src/levels/data/`), así que añadir uno es sobre todo diseño. Ideas: un museo con sigilo opcional o un tren en marcha.
- Los tests de `tests/unit/levels.test.ts` y `hubNav.test.ts` validan solos la luz mínima y la conectividad del nivel nuevo.

### 5. Más variedad de enemigos y jefes
- Enemigo con escudo (obliga a flanquear o usar takedown), perros o drones.
- Patrones propios para Vance y el Juez (hoy comparten la IA general con fases).

### 6. Historia mínima
- Diálogos de Winston que cambien según los contratos completados y un cierre tras Torre Meridian.

## Prioridad media: plataforma

### 7. Controles táctiles
- El juego no es jugable en móvil. Hacen falta sticks virtuales y botones, más un preset gráfico adecuado.

### 8. Menús con mando
- El mando funciona en el juego, pero los menús solo se navegan con teclado y ratón.

### 9. Tabla de récords en línea
- El top 10 del Gauntlet es local. Una tabla compartida necesita un servicio externo pequeño (por ejemplo una función serverless con una base de datos clave-valor) y medidas contra trampas básicas.

### 10. Inglés
- Los textos están repartidos por el código. Habría que centralizarlos y añadir un selector de idioma.

## Prioridad baja: técnica

- **Descarga más ligera:** Rapier pesa 1,6 MB comprimido porque el wasm va en base64. La versión con `.wasm` separado bajaría a la mitad, a cambio de configurar Vite para servirlo.
- **Prueba en una GPU integrada real:** el rendimiento ahí está estimado, no medido.
- **Ctrl como tecla asignable con aviso** de que Ctrl+W cierra la pestaña.
- **Exportar e importar la partida** como archivo.

## Ideas grandes (requieren replantear cosas)

- **Cooperativo en línea: hecho** (fase 3 de [ESCALABILIDAD.md](ESCALABILIDAD.md)), para hasta cuatro jugadores y sin servidor. Lo que falta para que sea redondo (retransmisión para redes cerradas, objetos de misión para los invitados, volver tras un corte) está al final de esa fase.
- **Editor de niveles** dentro del juego, aprovechando que los niveles ya son datos.
