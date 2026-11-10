# EXCOMMUNICADO: CONTINENTAL PROTOCOL

Juego de acción en tercera persona para el navegador, inspirado en el universo de John Wick: gun-fu, contratos y las reglas del Continental. Está hecho con **TypeScript estricto, Three.js y Rapier**, y todo el contenido es procedural: no hay modelos, texturas, música ni sonidos de terceros.

> **Proyecto de fans sin ánimo de lucro.** No está afiliado ni respaldado por Lionsgate, 87Eleven ni los titulares de la franquicia John Wick. No usa material con copyright (logos, música, modelos o capturas) ni el parecido de ningún actor. Los nombres y marcas citados pertenecen a sus dueños.

![El simulacro de combate a tiros](docs/media/gameplay.gif)

**Jugar:** `https://whysorichy.github.io/excommunicado-continental-protocol/` (GitHub Pages; ver [Despliegue](#despliegue)).

| | |
|---|---|
| ![Título](docs/media/01-titulo.png) | ![El Continental](docs/media/02-continental.png) |
| ![Club Kairos](docs/media/03-club-kairos.png) | ![Muelle 9](docs/media/04-muelle-9.png) |
| ![Torre Meridian](docs/media/05-torre-meridian.png) | ![Intel](docs/media/06-intel.png) |

## Qué hay en el juego

- **El Continental (hub):** zona neutral con Charon (contratos), el Sommelier (armería) y Winston. Disparar dentro rompe la Regla I: Excomunicado, multa del 30 %, alarma y tres oleadas que asaltan el hotel.
- **Contratos** (se desbloquean en orden):
  - **Simulacro de combate:** tutorial jugable de 3 minutos y 6 maniquíes armados.
  - **Club Kairos:** 12 civiles que no hay que tocar, un panel de alarma y Vance en el VIP.
  - **Muelle 9:** contenedores con tiradores, tres cargamentos que destruir y la huida en bote.
  - **Torre Meridian:** tres azoteas, el Juez con fases (se arrodilla y se le remata con un takedown) y 45 s de escape.
- **Gauntlet "Excomunicado":** oleadas infinitas en el vestíbulo con una sola vida y un top 10 local.
- **Rango D–S** por contrato (tiempo, precisión, daño recibido, variedad y civiles), con **marcadores de sangre** como vidas, monedas, mejoras y 16 logros.
- **Combate:** carabina, pistola, escopeta y cuchillo. También takedowns con doble tap, recarga perfecta, Foco (cámara lenta), cobertura, vault, deslizamiento y voltereta.
- **Accesibilidad y ajustes:**
  - Reasignación de teclas; los prompts muestran siempre la tecla real.
  - Sensibilidad, invertir Y, apuntar alternando y FOV.
  - Brillo, preset gráfico y volúmenes.
  - Sacudida de cámara, tamaño de la interfaz y pistas.
  - La leyenda de enemigos usa glifo además de color y se respeta el "movimiento reducido" del sistema.

## Controles

| Acción | Teclado y ratón | Mando |
|---|---|---|
| Mover / mirar | WASD / ratón | Stick izq. / der. |
| Disparar / apuntar | Clic izq. / clic der. | RT / LT |
| Recargar (otra vez en la zona dorada = perfecta) | R | X |
| Takedown | F | B |
| Interactuar | E | A |
| Saltar · vault | Espacio | A |
| Esquiva (o doble Espacio) | Alt | RB |
| Sprint | Shift | L3 |
| Agacharse · deslizar · cubrirse | C | Y |
| Foco | Q | LB |
| Armas | 1 / 2 / 3 · rueda | D-pad |
| Cambiar de hombro | V | R3 |
| Intel (mantener) | Tab | Select |
| Pausa · controles | Esc · H | Start |

Ctrl no se asigna por defecto porque Ctrl+W cierra la pestaña. Todo se puede cambiar en **Ajustes → Teclas**.

## Tecnología y arquitectura

- **Vite 8 + TypeScript 7 en modo strict**, **Three.js 0.187** y **Rapier 0.21**: los personajes usan el `KinematicCharacterController` sobre cápsulas.
- **Bucle fijo a 60 Hz** con acumulador, interpolación de render y escala de tiempo para el Foco.
- **Una sola máquina de estados de juego** (`core/GameStateMachine.ts`), con transiciones explícitas.
- **Niveles como datos** (`src/levels/data/*.ts`): las mallas y los colliders salen de la misma fuente.
- **Lógica pura sin three ni DOM, con tests:** daño, estilo, rango, economía, IA (`EnemyBrain`), navegación (rejilla 2.5D + A*), guardado, ajustes, tutorial, oleadas, música y resolución dinámica.
- **Audio 100 % Web Audio:** disparos, sirena, ambientes y música adaptativa por capas, programada con el reloj de audio (sin temporizadores).
- **Render:** cada personaje es una sola `SkinnedMesh` low-poly con rim light; la geometría estática y los props se fusionan por material. Preset por GPU, resolución dinámica y sombras a 30 Hz en el preset medio.

```
src/
  core/      bucle, entrada, FSM, guardado, ajustes
  physics/   mundo Rapier y consultas
  entities/  jugador, enemigos, civiles, NPC, rig
  combat/    armas, daño, estilo, rango, IA de grupo
  levels/    datos de nivel, constructor, navegación
  hub/       reglas del Continental, economía, diálogos
  missions/  director de misión, tutorial, Gauntlet, logros
  ui/        HUD, pantallas, Intel
  audio/     motor de audio y música
  render/    renderer, materiales, VFX, resolución dinámica
  debug/     overlay F3 y API de QA (?qa=1)
```

## Calidad: cómo se prueba

| Suite | Qué cubre |
|---|---|
| `npm test` (Vitest, 137 tests) | Lógica pura: rango (incluida la coherencia con 500 partidas al azar), reasignación de teclas, oleadas, IA, navegación de cada nivel, guardado |
| `npm run test:e2e` (Playwright, 38 tests) | Sobre el build de producción y con el pipeline real: movimiento sin atravesar paredes ni atascos (también con picos de lag), combate 1vN, los 4 contratos y el Gauntlet de principio a fin, tutorial, ajustes persistentes, mando |
| Gates | Claridad (luminancia en cada checkpoint, objetivo y baliza siempre visibles), mezcla de audio medida en la salida real, rendimiento |

Con `?qa=1` se expone `window.__EXCOM__`, que permite avanzar paso a paso de forma determinista, leer invariantes (penetraciones, cámara dentro de geometría) y manejar un bot para los tests.

### Rendimiento (medido)

| Métrica | Peor nivel | Presupuesto |
|---|---|---|
| Draw calls | 139 (Club Kairos) | ≤ 260 |
| Triángulos | 15 k | ≤ 120 k |
| CPU por frame | 2,1 ms | ≤ 4 ms |
| CPU por frame con la CPU frenada 2× (portátil con gráfica integrada) | 6,8 ms | ≤ 10 ms |
| JS del juego / motor de física (gzip) | 240 KB / 1,6 MB | ≤ 300 KB / 1,8 MB |

En una RTX 4060 va a 144 FPS (tope del monitor). Las GPU integradas de Intel arrancan en el preset Bajo: sin sombras y con 0,75× de resolución.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173 (?qa=1 · ?level=arena · ?preset=low|medium|high)
npm run build      # typecheck estricto + build en dist/
npm test           # Vitest
npm run test:e2e   # Playwright sobre el build (capturas en qa-screenshots/)
npm run qa         # todo lo anterior
npm run media      # capturas y GIF del README (requiere ffmpeg)
```

El guardado vive en `localStorage` (`excom.profile` y `excom.settings`).

## Despliegue

`.github/workflows/deploy.yml` ejecuta, en cada push a `main`, los tests, el build y los e2e (en CI el render es por software), y publica `dist/` en **GitHub Pages**. En el repositorio hay que activar *Settings → Pages → Source: GitHub Actions*.

## Créditos y licencia

Herramientas y bibliotecas en [CREDITS.md](CREDITS.md). El código está bajo la [licencia MIT](LICENSE). Proyecto académico de Programación Avanzada.
