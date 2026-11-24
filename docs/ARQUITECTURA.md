# Arquitectura y convenciones

Este documento explica cómo está construido el juego por dentro, qué decisiones técnicas se tomaron y qué reglas siguen el código y los niveles. Para el diseño del juego (mecánicas, enemigos, economía) ver [DISENO.md](DISENO.md). Para instalarlo y ejecutarlo, [INSTALACION.md](../INSTALACION.md).

## Índice

1. [Vista general](#1-vista-general)
2. [Estructura del código](#2-estructura-del-código)
3. [Un frame por dentro](#3-un-frame-por-dentro)
4. [Decisiones técnicas](#4-decisiones-técnicas)
5. [Principios de render y robustez (R1–R7)](#5-principios-de-render-y-robustez-r1r7)
6. [Controles: decisiones](#6-controles-decisiones)
7. [Convenciones de código](#7-convenciones-de-código)
8. [Reglas para diseñar niveles](#8-reglas-para-diseñar-niveles)
9. [Pruebas](#9-pruebas)
10. [Rendimiento](#10-rendimiento)
11. [Límites conocidos](#11-límites-conocidos)

## 1. Vista general

| Pieza | Tecnología |
|---|---|
| Lenguaje | TypeScript 7 en modo `strict` (sin `any` implícito) |
| Build y servidor | Vite 8 |
| Render | Three.js 0.187 (WebGL 2) |
| Física | Rapier 0.21 (`@dimforge/rapier3d-compat`, el wasm viene incluido) |
| Audio | Web Audio, todo sintetizado en tiempo real |
| Pruebas | Vitest (lógica pura) y Playwright (juego completo en Chromium) |
| Despliegue | GitHub Actions + GitHub Pages |

No hay modelos, sonidos ni fuentes externas: la geometría se genera por código y el audio se sintetiza. Lo único de fuera son las texturas fotoescaneadas de los escenarios, todas CC0 ([CREDITOS.md](CREDITOS.md)). Por eso la carga es rápida y no hay problemas de licencias.

## 2. Estructura del código

```
src/
  core/       bucle de juego, entrada, máquina de estados, guardado, ajustes, matemáticas
  physics/    mundo de Rapier, grupos de colisión y consultas (rayos, barridos)
  entities/   jugador (controlador de movimiento), rig de personajes, enemigos, civiles, NPC
    rig/      geometría de personajes y armas (cuerpo, prendas, modelos de arma) y medidas del esqueleto
    ai/       cerebro de los enemigos (FSM pura) y tipos de enemigo
  combat/     armas, daño, medidor de estilo, rango D–S, gestor de enemigos
  levels/     tipos de datos de nivel, helpers, constructor, validación
    data/     un archivo por nivel (hub, práctica, club, muelle, torre, arena de pruebas)
    nav/      rejilla de navegación 2.5D y A*
  hub/        reglas del Continental (Excomunicado), economía, armería, diálogos
  missions/   director de misión, tutorial, Gauntlet, logros, catálogo de contratos
  game/       Game (orquestador), sesión de nivel, cámara, cooperativo (Coop)
  net/        cooperativo en red: protocolo, anfitrión, invitado, interpolación, compensación de latencia
    transport/  servicio de salas, WebRTC (también con códigos a mano) y BroadcastChannel entre pestañas
  text/       catálogo de textos (cooperativo y equipo)
  ui/         HUD, pantallas (título, pausa, ajustes, tienda, sala...), Intel, estilos
  audio/      motor de audio, patrones y reproductor de música
  render/     renderer, materiales, texturas procedurales, VFX, resolución dinámica
  debug/      overlay F3 y API de QA (window.__EXCOM__ con ?qa=1; fuera del build público)
server/
  salas/      servicio de salas del cooperativo (Cloudflare Workers y Durable Objects)
tests/
  unit/       Vitest: lógica pura
  e2e/        Playwright: el juego real sobre el build de pruebas
  media/      capturas y GIF del README (npm run media)
```

La lógica que no necesita three.js ni el DOM vive en archivos propios y tiene tests unitarios:

| Archivo | Qué decide |
|---|---|
| `combat/damage.ts` | Daño por zona, armadura, caída con la distancia |
| `combat/StyleMeter.ts` | Puntos de estilo, variedad, decaimiento, multiplicador ×1–×8 |
| `combat/rank.ts` | Nota del contrato y rango D–S |
| `combat/weapons.ts` | Armas, huecos del equipo (`WEAPON_SLOTS`), qué se tiene y qué se lleva (`normalizeLoadout` sanea el equipo de la partida guardada, de la armería y de los invitados) y mejoras de la tienda |
| `combat/Grenades.ts` | Vuelo de lo que se lanza (gravedad, rebotes, rodadura), el arco previsto y a quién aturde. Necesita física, pero no vista |
| `hub/armory.ts` | Qué hay en cada hueco de la armería, en qué estado está cada pieza y sus barras |
| `hub/economy.ts` | Tienda, recompensas, multa del Excomunicado |
| `hub/ExcommunicadoRules.ts` | Zona neutral → aviso → Excomunicado → oleadas → readmisión |
| `entities/ai/EnemyBrain.ts` | Patrulla, sospecha, combate, cobertura, flanqueo, búsqueda |
| `entities/RobotRigs.ts` y `entities/rig/robots.ts` | Cuerpo y animación de las máquinas (sabueso y dron), con el mismo material que los personajes |
| `entities/ai/squad.ts` | Quién dispara, quién rodea y quién lo cubre en cada grupo (sin física ni vista) |
| `combat/hitReaction.ts` | Qué parte alcanzó un impacto, cómo le afecta y cómo cae si lo mata |
| `entities/coverSensor.ts` | Dónde puede cubrirse el jugador: la pared hacia donde anda o mira, que cubra, con sitio y alcanzable; sus bordes, sus rincones y cómo rodear una esquina |
| `levels/nav/*` | Rejilla navegable y A* |
| `core/Save.ts`, `core/Settings.ts` | Partida y ajustes versionados y validados; reasignación de teclas |
| `missions/tutorial.ts`, `missions/gauntlet.ts` | Pasos del tutorial y composición de oleadas |
| `missions/objectives.ts` | Cuándo se completa o falla cada objetivo (alcanzar, escapar, eliminar, interactuar, sobrevivir, jefe) y su contador en el HUD |
| `audio/music.ts` | Patrones musicales por ambiente e intensidad |
| `render/dynamicResolution.ts` | Cuándo bajar o subir la resolución |
| `render/tracerPath.ts` | Tramo visible de una trazadora en vuelo, hasta que su cola alcanza el impacto |

## 3. Un frame por dentro

```
requestAnimationFrame
  ├─ entrada (teclado, ratón, mando) y acciones de frame (pausa, ayuda, Intel)
  ├─ simulación a paso fijo de 1/60 s (0 a 5 pasos según el tiempo real):
  │    interacción → jugador → combate → granadas → enemigos → civiles → pickups
  │    → director del hub o de la misión → física (Rapier) → invariantes de QA
  ├─ vista: interpolación, cámara con colisión, animación de los rigs, VFX, HUD, baliza
  ├─ música (programa las notas de la siguiente ventana con el reloj de audio)
  └─ render (sombras, escena, bloom opcional) y resolución dinámica
```

El estado global lo lleva **una sola máquina de estados** (`core/GameStateMachine.ts`):

```
Boot → Title → Loading → Hub ⇄ HubMenu
                           ↓
                       Briefing → Playing ⇄ Paused
                                     ↓  ↑
                                    Dead → Results → Hub
```

Las transiciones válidas están declaradas y cualquier otra lanza un error: no hay banderas sueltas del tipo `isPaused` repartidas por el código.

## 4. Decisiones técnicas

| Tema | Decisión | Motivo |
|---|---|---|
| Versiones | Versiones exactas en `package.json` | Builds reproducibles; Rapier compat trae el wasm incluido y no necesita plugins de Vite |
| Física | Mundo de Rapier nuevo por nivel; colliders estáticos de cajas y rampas; personajes como cuerpos cinemáticos con `KinematicCharacterController` | Escalones, pendientes y deslizamiento contra paredes resueltos por el motor |
| Bucle | Paso fijo de 1/60 s, máximo 5 subpasos, `dt` real limitado a 0,25 s, interpolación de render y escala de tiempo para el Foco | Determinista y estable aunque la pestaña se congele |
| Estado | Una sola FSM de juego | Transiciones explícitas y comprobadas |
| Niveles | Módulos TS de datos (cajas, rampas, luces, spawns, objetivos) cargados con `import()` dinámico | Un chunk por nivel y una sola fuente de verdad para mallas y colliders |
| Navegación | Rejilla 2.5D de celdas de 0,5 m generada a partir de los datos del nivel, con A*, suavizado y replanificación si un enemigo se atasca | Se genera sola y su conectividad se comprueba en los tests |
| Inventario | El equipo (`Loadout`: principal, secundaria, cuerpo a cuerpo y lo que se lanza) vive en el perfil y pasa siempre por `normalizeLoadout`: lo que no se tiene o no es de su hueco vuelve a lo de serie. La armería y los selectores del briefing y la sala (`ui/loadoutScreens.ts`) solo piden `Game.equip`. La vista previa en 3D usa su propio renderer pequeño, creado al abrir la armería y liberado al cerrarla; sin otro contexto WebGL, la armería funciona igual | Un solo sitio decide qué se puede llevar, también en red; añadir un arma es añadir sus datos y su modelo |
| Granadas | Simulación determinista por pasos contra el escenario, con rayos (sin cuerpos dinámicos de Rapier). El arco que se enseña ejecuta ese mismo paso, así que acaba donde estalla | Predecible, barata y la misma en todos los equipos |
| Armas | Piezas con forma real (perfiles laterales extruidos con bisel y esquinas redondeadas, torneados para cañones, frenos y miras, el tambor estriado del revólver) fusionadas en una geometría por arma y color de acento, compartida entre personajes. Cada vértice lleva su color, rugosidad y metalicidad (atributo `pbr`): un solo material para todas con su propio reflejo del entorno (`render/weaponMaterial.ts`). El acabado (`WeaponFinish`: color y brillo de cada parte) es lo que cambiará una skin | Una draw call por arma, como antes, y entre 800 y 4.400 triángulos (`weaponModels.test.ts` vigila el presupuesto, que la cantonera quede donde la espera el encare y que la mano izquierda agarre el arma) |
| Personajes | Un `SkinnedMesh` por personaje (14 huesos, incluidos los tobillos) + el arma aparte. La malla se genera por código (`entities/rig/`): tubos de anillos con superelipses y curvas monótonas (`loft.ts`), recorridos, elipsoides y parches pegados a la superficie del cuerpo (`shapes.ts`), con los pesos repartidos entre dos huesos en codos, rodillas, hombros, cintura y faldones (`skin.ts`). Cada vértice lleva color, rugosidad, metalicidad y trama de tela; un solo material con relieve de tela y borde de color (`render/rigMaterial.ts`) los dibuja a todos. El aspecto se declara en `RigOptions`: colores, peinado y prendas (`Outfit`). Dos mallas por aspecto, de cerca (unos 8.000 triángulos) y de lejos (unos 3.000), que se cambian según la distancia, la calidad y el aumento de la cámara; se construyen al cargar el nivel y se quedan en memoria | Una draw call por cuerpo, ninguna descarga de modelos, ningún tirón al aparecer un enemigo y aspectos nuevos (las futuras skins) que son datos |
| Render | `NeutralToneMapping`, IBL tenue, luz hemisférica, una direccional con sombra, neón emisivo en HDR y rim light Fresnel; bloom y viñeta en los presets Medio y Alto, sobre un destino multimuestreado; oclusión ambiental (GTAO a media resolución) en Alto; cielo nocturno procedural en los niveles a cielo abierto (`render/sky.ts`) | Legibilidad antes que efectos |
| Materiales del escenario | Texturas fotoescaneadas CC0 (color, relieve y un mapa de oclusión y rugosidad) en WebP, servidas desde `public/textures/` y descargadas antes de construir cada nivel (`render/pbrTextures.ts`); muestreo sin repetición en el shader; los dibujos con diseño propio (damero, cajas, moquetas) siguen siendo procedurales y la foto solo les pone relieve. Las aristas de las cajas llevan un chaflán de 3 cm solo en el dibujo | Realismo sin modelos importados: unos 4,4 MB en total y cada nivel descarga solo los suyos; sin conexión, el material se queda con su textura procedural |
| UI | DOM y CSS encima del canvas | Accesible con teclado y fácil de iterar |
| Audio | Web Audio procedural, iniciado tras el primer gesto del usuario | Sin archivos ni licencias; cumple la política de autoplay |
| Guardado | `localStorage` versionado y validado; partida (`excom.profile`) y ajustes (`excom.settings`) por separado | Un guardado corrupto se respalda y se empieza de cero sin romper el juego |
| Pruebas | Vitest para la lógica pura; Playwright con `?qa=1` sobre un build de pruebas, separado del que se publica | Lo importante se verifica jugando de verdad, no solo con tests de funciones; la versión pública no lleva herramientas de prueba |
| Seguridad | Política de seguridad de contenido (CSP) en un `<meta>` de los builds (`vite.config.ts`): scripts, estilos e imágenes solo del propio origen, `'wasm-unsafe-eval'` para el wasm de Rapier y nada de `eval` | GitHub Pages no permite cabeceras. Si alguien lograra inyectar HTML, el navegador no ejecutaría código ajeno; el smoke test falla ante cualquier bloqueo de la política |

## 5. Principios de render y robustez (R1–R7)

El código cita estas reglas por su número.

| # | Regla | Cómo se verifica |
|---|---|---|
| R1 | Luces en unidades físicas con **piso de luz ambiental obligatorio** (hemisférica + IBL) en todos los niveles | Validación de los datos de nivel en Vitest y luminancia medida por nivel en Playwright |
| R2 | Texturas de color en `SRGBColorSpace`; `metalness` ≤ 0,3 salvo que haya IBL | `render/textures.ts` y `render/materials.ts` |
| R3 | Ningún overlay tapa el juego mientras se juega; la pausa es un estado explícito | Test de luminancia y comprobación de que nada con `hidden` se pinta |
| R4 | **Una sola fuente de verdad**: los colliders se generan de los mismos datos que las mallas | Wireframe de colisiones (F3 → Colisiones) y test de penetración |
| R5 | Movimiento a paso fijo con `KinematicCharacterController` (barridos, sin atravesar paredes), `dt` limitado y tope de subpasos | Recorrido scripteado y picos de lag simulados de 300 ms |
| R6 | La entrada se reinicia al perder el foco, ocultar la pestaña o perder el pointer lock; las acciones se filtran por el estado de juego | Tests e2e de teclas pegadas |
| R7 | Sin sombras de luces puntuales ni `transmission`; bloom opcional y moderado; las luces no se añaden ni se quitan en tiempo de ejecución | Overlay F3 (draw calls, programas) y presupuesto de rendimiento |

## 6. Controles: decisiones

- **Ctrl no viene asignado.** En el navegador, `Ctrl+W` cierra la pestaña y la página no puede impedirlo: agacharse con Ctrl mientras se corre con W cerraría el juego. Agacharse es **C**, y deslizarse es **C** mientras corres. Quien quiera Ctrl puede asignarlo en Ajustes → Teclas.
- **Alt** es la esquiva secundaria (con `preventDefault` para que el navegador no abra su menú). La forma principal de esquivar es el **doble toque de Espacio**.
- **Espacio** salta y, frente a un obstáculo bajo, hace vault. En el aire, el doble toque se convierte en una plancha ("dive").
- **Cobertura** con **C** junto a una pared o caja; el aviso en pantalla lo indica.
- **Cambio de hombro** con **V** (R3 en el mando).
- **Esc y F3 son fijas** (pausa y overlay de depuración); el resto se reasigna en Ajustes. Si eliges una tecla que ya usa otra acción, se intercambian.

## 7. Convenciones de código

- TypeScript `strict`. Identificadores y código en inglés; **los textos que ve el jugador, en español**.
- **Formato automático** con Prettier (`npm run format`): comillas simples y líneas de hasta 160 caracteres. Quedan fuera la documentación y los datos de nivel, que se escriben como tablas (una entidad por línea). `.editorconfig` fija la codificación, los saltos de línea y la sangría para cualquier editor.
- **Linter con información de tipos**: oxlint (`npm run lint`) aplica las reglas de corrección y una selección de reglas estrictas: promesas sin `await`, `switch` sin todos los casos ni `default`, aserciones de tipo sobrantes, APIs obsoletas e importaciones circulares. La configuración está comentada en `.oxlintrc.json`; una excepción puntual se marca con `oxlint-disable` y su motivo.
- **Sin código muerto**: knip (también dentro de `npm run lint`) avisa de archivos, exportaciones y dependencias que nadie usa. Exportar algo que solo se usa en su propio archivo está permitido.
- **Dos proyectos de TypeScript** bajo `tsconfig.json`: `tsconfig.app.json` (el juego y las pruebas unitarias, con el DOM) y `tsconfig.node.json` (e2e, capturas y configuración, con Node). Los dos usan `noUncheckedIndexedAccess`: leer `arr[i]` puede dar `undefined` y el código debe tratarlo.
- Cada módulo vive en su dominio (`src/<dominio>/`). Lo que no necesita three ni el DOM va en un archivo puro con tests.
- **Bucle caliente sin asignaciones**: nada de `new Vector3()` ni closures por frame. Se usan los vectores reutilizables de `core/math.ts`, los pools de `render/vfx.ts` y objetos preasignados.
- **Niveles = datos** en `src/levels/data/*.ts`. Los helpers (`roomShell`, `stairs`, `ramp`...) son funciones puras que devuelven cajas.
- **Luces en unidades físicas**, declaradas en los datos del nivel; nunca se añaden ni se quitan en ejecución (provocaría recompilar shaders).
- **Errores en la raíz**: no hay `try/catch` vacíos, ni `setTimeout` como parche, ni números mágicos sin nombre.
- Commits convencionales: `feat:`, `fix:`, `perf:`, `test:`, `docs:`, `chore:`.

## 8. Reglas para diseñar niveles

Medidas con el controlador de personaje real:

| Elemento | Regla |
|---|---|
| Escalones | Contrahuella ≤ 0,32 m y huella ≥ 0,30 m: se suben sin saltar. Más alto requiere vault o salto |
| Rampas | Hasta 45° se suben; por encima de 50° se resbala. No usar 46–50° |
| Huecos | El jugador cabe por ≥ 0,7 m. Puertas ≥ 1,2 m (hay cámara y combate cerca). Pasillos ≥ 2,4 m |
| Techos | ≥ 2,6 m. A 1,3 m o menos solo se pasa agachado (recurso intencional) |
| Cobertura baja | Al menos 1,2 m (`COVER_LOW_MIN` en `levels/validate.ts`): tapa a un personaje agachado (1,14 m) y aún se salta con vault. El jugador solo se cubre tras lo que pasa de 0,85 m; un mueble más bajo, como un sofá, no lleva `cover`. Lo comprueban los tests de niveles (la arena de pruebas queda fuera) |
| Vault | Obstáculos de 0,42 a 1,28 m de alto y hasta 1,6 m de fondo; si son más profundos, el personaje se sube encima |
| Colliders | Toda caja con colisión debe estar en `boxes` o `ramps`; nada de colliders a mano |

Al añadir un nivel nuevo, los tests de `tests/unit/levels.test.ts` y `tests/unit/hubNav.test.ts` comprueban automáticamente la luz mínima, los spawns libres, los ids únicos y que objetivos, checkpoints, enemigos y civiles estén conectados por la rejilla de navegación.

## 9. Pruebas

| Comando | Qué hace |
|---|---|
| `npm test` | Vitest con la lógica pura |
| `npm run test:e2e` | Genera el build de pruebas en `dist-qa/` y ejecuta Playwright sobre él. Las capturas quedan en `qa-screenshots/` (no se versionan) |
| `CI=1 npm run test:e2e` | Lo mismo con render por software (SwiftShader), como en GitHub Actions |
| `npm run build:qa` | Solo el build de pruebas: el mismo juego que el público, más la API de QA y los comandos de depuración del F3 |
| `npm run qa` | Build + Vitest + Playwright |

En desarrollo (`npm start`) y en el build de pruebas, `?qa=1` expone `window.__EXCOM__`, una API de pruebas que permite:

- avanzar la simulación paso a paso de forma determinista (`setManual`, `step`);
- teletransportar, mirar, mantener o pulsar acciones como si fuera el teclado;
- leer el estado del jugador, el combate, los enemigos, la misión y el HUD;
- contar invariantes que deben quedar en cero: penetraciones en la geometría, cámara dentro de paredes, estados de combate inconsistentes;
- medir FPS, luminancia, audio y reparto de CPU.

El build público (`npm run build`, lo que se sube a Pages) no incluye la API ni los comandos de depuración del F3 (modo dios, monedas...): la condición se resuelve al compilar y Vite elimina ese código. Dos e2e lo vigilan: ningún archivo de `dist/` contiene `__EXCOM__` y, sin `?qa=1`, el F3 solo muestra métricas.

Qué cubren los e2e, a grandes rasgos:

- **Movimiento:** no se atraviesa ninguna pared ni esquina corriendo, ni con picos de lag; no hay atascos en esquinas, escalones ni bordes; la cámara nunca entra en la geometría; pausa al perder el foco o la pestaña sin teclas pegadas; resize y cambio de DPI; acciones encadenadas al azar sin romper la física.
- **Combate:** un bot limpia el simulacro con el pipeline real de disparo; la IA no se atasca; feedback de impactos; 40 s de acciones al azar sin estados inconsistentes.
- **Contenido:** los cuatro contratos y el Gauntlet se completan de principio a fin; fallar por marcadores o por tiempo; el tutorial paso a paso.
- **Claridad:** luminancia en cada checkpoint de cada nivel; objetivo y baliza siempre visibles; los avisos muestran la tecla real asignada; consola sin errores.
- **Audio:** la mezcla se mide en la salida real (la música queda de fondo, los disparos destacan, sin saturación).
- **Firefox:** una prueba de humo (arranque, escena visible, moverse y disparar, consola limpia y sin bloqueos de la CSP); el resto de la suite corre en Chromium. Solo se ejecuta en local: en los runners de GitHub, sin GPU, Firefox sin pantalla no llega a arrancar el juego.

## 10. Rendimiento

Sin una GPU integrada a mano, se mide lo que la limita:

- draw calls, triángulos y programas de shader por nivel;
- CPU por frame, separada en simulación, vista y render;
- CPU por frame con la CPU frenada por el protocolo de DevTools: ×2 se parece a un portátil con gráfica integrada (es el límite que se exige) y ×4 a un portátil viejo (solo se registra);
- tamaño del JavaScript comprimido.

Todo está en `tests/e2e/perf.spec.ts`. Resultados en el nivel más pesado (Club Kairos, 12 civiles y 8 enemigos):

| Métrica | Medida | Límite |
|---|---|---|
| Draw calls | 139 | ≤ 260 |
| Triángulos | 15 k | ≤ 120 k |
| CPU por frame | ~2 ms | ≤ 4 ms |
| CPU por frame con CPU ×2 | 4–7 ms | ≤ 10 ms |
| CPU por frame con CPU ×4 | 10–17 ms | (registro) |
| JS del juego / motor de física, gzip | 240 KB / 1,6 MB | ≤ 300 KB / 1,8 MB |

Lo que más ayudó: un `SkinnedMesh` por personaje (de 421 a 169 draw calls), fusionar los props por material (de 169 a 139), congelar las matrices del nivel estático y regenerar las sombras a 30 Hz en el preset Medio.

En el primer arranque el preset se elige según la GPU (las integradas de Intel, las de móvil y el render por software empiezan en Bajo) y la resolución dinámica baja la escala si los frames no llegan a ~58 FPS y la vuelve a subir cuando se recuperan.

## 11. Límites conocidos

- Rapier pesa 1,6 MB comprimido (el wasm va en base64). Se descarga mientras se muestra la pantalla de carga.
- El rendimiento en GPU integrada se estima con las medidas anteriores; no se probó en una integrada real.
- El balance de precios y la dificultad no tienen pruebas con jugadores.
- En CI el render es por software (~7 FPS): ahí solo se comprueban los presupuestos de escena, no los FPS.
- GitHub Pages no permite cabeceras HTTP: la CSP va en un `<meta>`, que no admite `frame-ancestors`, así que otra web podría mostrar el juego dentro de un marco.
