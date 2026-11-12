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

No hay modelos, texturas, sonidos ni fuentes externas: la geometría y las texturas se generan por código y el audio se sintetiza. Por eso la carga es rápida y no hay problemas de licencias.

## 2. Estructura del código

```
src/
  core/       bucle de juego, entrada, máquina de estados, guardado, ajustes, matemáticas
  physics/    mundo de Rapier, grupos de colisión y consultas (rayos, barridos)
  entities/   jugador (controlador de movimiento), rig de personajes, enemigos, civiles, NPC
    ai/       cerebro de los enemigos (FSM pura) y tipos de enemigo
  combat/     armas, daño, medidor de estilo, rango D–S, gestor de enemigos
  levels/     tipos de datos de nivel, helpers, constructor, validación
    data/     un archivo por nivel (hub, práctica, club, muelle, torre, arena de pruebas)
    nav/      rejilla de navegación 2.5D y A*
  hub/        reglas del Continental (Excomunicado), economía, diálogos
  missions/   director de misión, tutorial, Gauntlet, logros, catálogo de contratos
  game/       Game (orquestador), sesión de nivel, cámara
  ui/         HUD, pantallas (título, pausa, ajustes, tienda...), Intel, estilos
  audio/      motor de audio, patrones y reproductor de música
  render/     renderer, materiales, texturas procedurales, VFX, resolución dinámica
  debug/      overlay F3 y API de QA (window.__EXCOM__ con ?qa=1)
tests/
  unit/       Vitest: lógica pura
  e2e/        Playwright: el juego real sobre el build de producción
  media/      capturas y GIF del README (npm run media)
```

La lógica que no necesita three.js ni el DOM vive en archivos propios y tiene tests unitarios:

| Archivo | Qué decide |
|---|---|
| `combat/damage.ts` | Daño por zona, armadura, caída con la distancia |
| `combat/StyleMeter.ts` | Puntos de estilo, variedad, decaimiento, multiplicador ×1–×8 |
| `combat/rank.ts` | Nota del contrato y rango D–S |
| `hub/economy.ts` | Tienda, recompensas, multa del Excomunicado |
| `hub/ExcommunicadoRules.ts` | Zona neutral → aviso → Excomunicado → oleadas → readmisión |
| `entities/ai/EnemyBrain.ts` | Patrulla, sospecha, combate, cobertura, flanqueo, búsqueda |
| `levels/nav/*` | Rejilla navegable y A* |
| `core/Save.ts`, `core/Settings.ts` | Partida y ajustes versionados y validados; reasignación de teclas |
| `missions/tutorial.ts`, `missions/gauntlet.ts` | Pasos del tutorial y composición de oleadas |
| `audio/music.ts` | Patrones musicales por ambiente e intensidad |
| `render/dynamicResolution.ts` | Cuándo bajar o subir la resolución |

## 3. Un frame por dentro

```
requestAnimationFrame
  ├─ entrada (teclado, ratón, mando) y acciones de frame (pausa, ayuda, Intel)
  ├─ simulación a paso fijo de 1/60 s (0 a 5 pasos según el tiempo real):
  │    interacción → jugador → combate → enemigos → civiles → pickups
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
| Personajes | Un `SkinnedMesh` por personaje (huesos con la jerarquía del rig) + el arma aparte | Una draw call por cuerpo en lugar de siete; la animación procedural no cambia |
| Render | `NeutralToneMapping`, IBL tenue, luz hemisférica, una direccional con sombra, neón emisivo en HDR y rim light Fresnel; bloom y viñeta en los presets Medio y Alto, sobre un destino multimuestreado; cielo nocturno procedural en los niveles a cielo abierto (`render/sky.ts`) | Legibilidad antes que efectos |
| UI | DOM y CSS encima del canvas | Accesible con teclado y fácil de iterar |
| Audio | Web Audio procedural, iniciado tras el primer gesto del usuario | Sin archivos ni licencias; cumple la política de autoplay |
| Guardado | `localStorage` versionado y validado; partida (`excom.profile`) y ajustes (`excom.settings`) por separado | Un guardado corrupto se respalda y se empieza de cero sin romper el juego |
| Pruebas | Vitest para la lógica pura; Playwright sobre el build con `?qa=1` | Lo importante se verifica jugando de verdad, no solo con tests de funciones |

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
| Cobertura baja | ≥ 0,85 m de alto; por debajo no cuenta como cobertura |
| Vault | Obstáculos de 0,42 a 1,28 m de alto y hasta 1,6 m de fondo; si son más profundos, el personaje se sube encima |
| Colliders | Toda caja con colisión debe estar en `boxes` o `ramps`; nada de colliders a mano |

Al añadir un nivel nuevo, los tests de `tests/unit/levels.test.ts` y `tests/unit/hubNav.test.ts` comprueban automáticamente la luz mínima, los spawns libres, los ids únicos y que objetivos, checkpoints, enemigos y civiles estén conectados por la rejilla de navegación.

## 9. Pruebas

| Comando | Qué hace |
|---|---|
| `npm test` | Vitest con la lógica pura |
| `npm run test:e2e` | Playwright sobre el build de producción. Las capturas quedan en `qa-screenshots/` (no se versionan) |
| `CI=1 npm run test:e2e` | Lo mismo con render por software (SwiftShader), como en GitHub Actions |
| `npm run qa` | Build + Vitest + Playwright |

Con `?qa=1` el juego expone `window.__EXCOM__`, una API de pruebas que permite:

- avanzar la simulación paso a paso de forma determinista (`setManual`, `step`);
- teletransportar, mirar, mantener o pulsar acciones como si fuera el teclado;
- leer el estado del jugador, el combate, los enemigos, la misión y el HUD;
- contar invariantes que deben quedar en cero: penetraciones en la geometría, cámara dentro de paredes, estados de combate inconsistentes;
- medir FPS, luminancia, audio y reparto de CPU.

Qué cubren los e2e, a grandes rasgos:

- **Movimiento:** no se atraviesa ninguna pared ni esquina corriendo, ni con picos de lag; no hay atascos en esquinas, escalones ni bordes; la cámara nunca entra en la geometría; pausa al perder el foco o la pestaña sin teclas pegadas; resize y cambio de DPI; acciones encadenadas al azar sin romper la física.
- **Combate:** un bot limpia el simulacro con el pipeline real de disparo; la IA no se atasca; feedback de impactos; 40 s de acciones al azar sin estados inconsistentes.
- **Contenido:** los cuatro contratos y el Gauntlet se completan de principio a fin; fallar por marcadores o por tiempo; el tutorial paso a paso.
- **Claridad:** luminancia en cada checkpoint de cada nivel; objetivo y baliza siempre visibles; los avisos muestran la tecla real asignada; consola sin errores.
- **Audio:** la mezcla se mide en la salida real (la música queda de fondo, los disparos destacan, sin saturación).

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
