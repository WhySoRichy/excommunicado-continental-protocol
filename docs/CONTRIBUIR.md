# Guía de desarrollo

Todo lo necesario para retomar el proyecto desde cero, por una persona o por un asistente de programación. Léela entera antes de tocar código; después, [ARQUITECTURA.md](ARQUITECTURA.md) para el detalle técnico y [ROADMAP.md](ROADMAP.md) para saber qué hacer.

## Puesta en marcha

```bash
npm install
npm run dev          # http://localhost:5173 con herramientas de prueba
npm run qa           # build + pruebas unitarias + pruebas e2e
```

La primera vez que se ejecuten las e2e: `npx playwright install chromium`. Requisitos y problemas frecuentes en [INSTALACION.md](../INSTALACION.md).

## Mapa rápido

| Quiero cambiar... | Está en... |
|---|---|
| Movimiento del jugador | `src/entities/PlayerController.ts` |
| Animaciones | `src/entities/CharacterRig.ts` y `rigMath.ts` |
| Armas, daño, estilo, rango | `src/combat/` |
| IA de los enemigos | `src/entities/ai/EnemyBrain.ts`, `src/entities/Enemy.ts`, `src/combat/EnemyManager.ts` |
| Un nivel o uno nuevo | `src/levels/data/` (y registrarlo en `src/levels/registry.ts`) |
| Objetivos de un contrato | bloque `mission` del nivel y `src/missions/MissionDirector.ts` |
| Tienda, monedas, logros | `src/hub/economy.ts`, `src/missions/achievements.ts` |
| HUD y menús | `src/ui/` |
| Sonido y música | `src/audio/` |
| Calidad gráfica y rendimiento | `src/render/` |

`src/game/Game.ts` es el orquestador: une entrada, simulación, vista y estados.

## Forma de trabajar

1. **Entender antes de cambiar.** Leer el archivo y sus tests. Las reglas del proyecto (bucle sin asignaciones, niveles como datos, una sola máquina de estados, arreglar la causa y no el síntoma) están en [ARQUITECTURA.md](ARQUITECTURA.md#7-convenciones-de-código).
2. **La lógica pura va con test unitario.** Si algo se puede decidir sin three ni DOM, va en un archivo aparte con su test en `tests/unit/`.
3. **Lo que se ve o se juega se comprueba jugando.** Las e2e usan la API de pruebas `window.__EXCOM__` (se activa con `?qa=1`; definida en `src/debug/qa.ts`). Permite avanzar paso a paso, teletransportar, pulsar acciones y leer el estado. Para cambios visuales, sacar capturas y mirarlas.
4. **Antes de cada commit:** `npm run build`, `npm test` y `npm run test:e2e` en verde. Para reproducir el entorno de GitHub Actions (render por software, muy pocos FPS): `CI=1 npm run test:e2e`.
5. **Commits** convencionales y en español (`feat:`, `fix:`, `perf:`, `test:`, `docs:`, `chore:`), con un cuerpo que explique el porqué.
6. **Documentación al día:** si cambia una mecánica, actualizar `DISENO.md`; si cambia una decisión técnica, `ARQUITECTURA.md`; al terminar algo del roadmap, moverlo a "Estado actual".

## Herramientas propias

| Comando | Para qué |
|---|---|
| `npm run poses` | Capturas de perfil de cada pose del jugador en `qa-screenshots/poses/`. Imprescindible al tocar animaciones |
| `npm run media` | Regenera las capturas y el GIF del README (necesita ffmpeg) |
| F3 en el juego | FPS, draw calls, estado, y botones de depuración (colisiones, modo dios, matar enemigos...) |
| `?level=arena` | Arena de pruebas de movimiento |
| `?preset=low\|medium\|high` | Fuerza la calidad gráfica |

## Errores que ya se cometieron (para no repetirlos)

- **Sentido de giro de los huesos.** El personaje mira a −Z. En huesos que cuelgan (brazos, piernas) la rotación X positiva va hacia delante; en los que suben (torso, cabeza), hacia atrás. Estuvo invertido (rodillas y arma hacia atrás) y solo se detectó al sacar capturas de perfil.
- **`hidden` no oculta si el CSS pone `display`.** Hay una regla global `[hidden] { display: none !important }` y un test que lo vigila.
- **Tests que dependen del tiempo real.** En CI el juego va a ~3 FPS. Los tests deben avanzar con `step()` o esperar condiciones con `expect.poll`, nunca asumir que "en 0,5 s ya se movió".
- **Luminancia medida en el canvas.** No detecta capas DOM que oscurezcan la pantalla.
- **Estado que sobrevive al cambiar de nivel.** `loadSession` debe limpiar todo lo transitorio (toasts, balizas, interactivos usados).
- **Niveles:** escalones de más de 0,32 m o muebles sin `noWalk` rompen la navegación de los enemigos. Los tests de navegación lo detectan.

## Despliegue

Cada push a `main` ejecuta `.github/workflows/deploy.yml`: pruebas unitarias, build, e2e y publicación en GitHub Pages (Settings → Pages → Source: GitHub Actions). Si la CI falla, no se publica; el log del paso que falló dice qué test fue.
