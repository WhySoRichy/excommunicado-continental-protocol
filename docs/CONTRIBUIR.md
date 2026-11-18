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
3. **Lo que se ve o se juega se comprueba jugando.** Las e2e usan la API de pruebas `window.__EXCOM__` (se activa con `?qa=1` en desarrollo y en el build de pruebas; definida en `src/debug/qa.ts`). Permite avanzar paso a paso, teletransportar, pulsar acciones y leer el estado. Para cambios visuales, sacar capturas y mirarlas.
4. **Antes de cada commit:** `npm run lint` (linter, formato y código sin uso; `npm run format` corrige el formato), `npm run build`, `npm test` y `npm run test:e2e` en verde. Para reproducir el entorno de GitHub Actions (render por software, muy pocos FPS): `CI=1 npm run test:e2e`.
5. **Commits** convencionales y en español (`feat:`, `fix:`, `perf:`, `test:`, `docs:`, `chore:`), con un cuerpo que explique el porqué.
6. **Documentación al día:** si cambia una mecánica, actualizar `DISENO.md`; si cambia una decisión técnica, `ARQUITECTURA.md`; al terminar algo del roadmap, moverlo a "Estado actual".

## Herramientas propias

| Comando | Para qué |
|---|---|
| `npm run poses` | Capturas de perfil de cada pose del jugador en `qa-screenshots/poses/`, con el build de pruebas servido en otra terminal (`npm run build:qa && npm run preview:qa`). Imprescindible al tocar animaciones |
| `npm run media` | Regenera las capturas y el GIF del README (necesita ffmpeg) |
| F3 en el juego | FPS, draw calls y estado. Con `?qa=1`, también botones de depuración (colisiones, modo dios, matar enemigos...) |
| `?qa=1` | API de pruebas y comandos del F3. Solo en desarrollo (`npm start`) y en el build de pruebas (`npm run build:qa`); la versión publicada no los incluye |
| `?level=arena` | Arena de pruebas de movimiento |
| `?preset=low\|medium\|high` | Fuerza la calidad gráfica |

## Errores que ya se cometieron (para no repetirlos)

- **Sentido de giro de los huesos.** El personaje mira a −Z. En huesos que cuelgan (brazos, piernas) la rotación X positiva va hacia delante; en los que suben (torso, cabeza), hacia atrás. Estuvo invertido (rodillas y arma hacia atrás) y solo se detectó al sacar capturas de perfil.
- **`hidden` no oculta si el CSS pone `display`.** Hay una regla global `[hidden] { display: none !important }` y un test que lo vigila.
- **Tests que dependen del tiempo real.** En CI el juego va a ~3 FPS. Los tests deben avanzar con `step()` o esperar condiciones con `expect.poll`, nunca asumir que "en 0,5 s ya se movió".
- **Luminancia medida en el canvas.** No detecta capas DOM que oscurezcan la pantalla.
- **Estado que sobrevive al cambiar de nivel.** `loadSession` debe limpiar todo lo transitorio (toasts, balizas, interactivos usados).
- **Bloom que lava la imagen.** El bloom actúa antes del mapeo de tonos: cualquier superficie que pase del umbral (`BLOOM_THRESHOLD` en `render/Renderer.ts`) brilla entera. Un suelo claro y pulido con mucha luz lo superaba y el vestíbulo quedaba blanco. Solo los emisores van en HDR (`EMISSIVE_HDR` en `render/materials.ts`); las superficies iluminadas deben quedar por debajo de 1.
- **Shaders compilados dos veces.** Con posprocesado la escena se dibuja en un destino intermedio y sus programas no son los de pantalla. `prewarm()` compila contra ese destino; si no, el presupuesto de programas se dispara.
- **Recursos de GPU que no cuelgan de una geometría ni de un material.** El mapa de sombras pertenece a la luz: quitarla de la escena no lo libera, hay que llamar a su `dispose()`. Se escapaban dos texturas por cada cambio de nivel; `tests/e2e/perf.spec.ts` lo vigila.
- **Herramientas de prueba en la versión pública.** Con `?qa=1`, cualquiera podía usar en Pages la API de pruebas y los comandos del F3 (monedas, modo dios). Ahora solo existen en desarrollo y en el build de pruebas, y dos e2e lo vigilan. Una herramienta de depuración nueva va en `src/debug/` y se registra desde `installQa`, nunca desde el código del juego.
- **Lo que solo existe en la GPU se pierde con el contexto.** Si el navegador pierde el contexto WebGL, three recupera su estado y vuelve a subir lo que tiene copia en CPU, pero el entorno PMREM es un render target: volvía vacío y la escena quedaba un 24 % más oscura. `Renderer` lo regenera al recuperarse y una e2e provoca la pérdida con `WEBGL_lose_context`.
- **Un recurso compartido lo libera su dueño.** Los NPC liberaban el material que la caché del rig seguía entregando al volver al vestíbulo. Ahora el rig sabe si su material es propio y solo libera ese; lo mismo vale para geometrías y texturas cacheadas.
- **Silueta que no cabe en la cápsula.** Agachado, el cuerpo medía 1,48 m y la cápsula 1,14 m: la cabeza asomaba por encima de las coberturas y un disparo a ella no impactaba. La API de pruebas mide la silueta real (`rigHeight()`) y una e2e de movimiento lo vigila.
- **Estado de misión que no acompaña a la reaparición.** Al reaparecer, los enemigos vivos recuperan la salud; lo que dependa de esa salud (las fases del jefe) debe reiniciarse a la vez (`MissionDirector.onPlayerRespawned`).
- **Efectos que no terminan.** La cola de la trazadora se calculaba desde la cabeza ya detenida en el impacto y nunca llegaba al final: los destellos se quedaban flotando hasta reciclarse. El tramo se calcula en `render/tracerPath.ts` (lógica pura con test) y la e2e del arsenal comprueba con `vfx()` que no queda ningún efecto vivo.
- **Un `await` sin camino de error.** Una carga que fallaba dejaba el juego en `loading` para siempre. Todo flujo asíncrono que cambie de estado necesita su salida (`Game.tryLoadSession`).
- **Niveles:** escalones de más de 0,32 m o muebles sin `noWalk` rompen la navegación de los enemigos. Los tests de navegación lo detectan.

## Despliegue

Cada push a `main` ejecuta `.github/workflows/deploy.yml`: pruebas unitarias, build, e2e y publicación en GitHub Pages (Settings → Pages → Source: GitHub Actions). Si la CI falla, no se publica; el log del paso que falló dice qué test fue.
