# Guía de desarrollo

Todo lo necesario para retomar el proyecto desde cero. Léela entera antes de tocar código; después, [ARQUITECTURA.md](ARQUITECTURA.md) para el detalle técnico y [ROADMAP.md](ROADMAP.md) para saber qué hacer.

## Puesta en marcha

```bash
npm install
npm run dev          # http://localhost:5173 con herramientas de prueba
npm run qa           # build + pruebas unitarias + pruebas e2e
```

La primera vez que se ejecuten las e2e: `npx playwright install chromium firefox`. Requisitos y problemas frecuentes en [INSTALACION.md](../INSTALACION.md).

## Mapa rápido

| Quiero cambiar... | Está en... |
|---|---|
| Movimiento del jugador | `src/entities/PlayerController.ts` |
| Cobertura (entrar, recorrerla, esquinas, de una a otra, a ciegas) | `src/entities/PlayerController.ts` (los estados `toCover` y `cover`) y `coverSensor.ts` (las consultas al escenario); el disparo a ciegas, en `src/combat/PlayerCombat.ts` (`blindMode`); su marca, en `src/render/CoverMarker.ts` |
| Animaciones | `src/entities/CharacterRig.ts` (huesos y poses) y `rigMath.ts` |
| Aspecto de los personajes | `src/entities/rig/`: `body.ts` (tronco, prendas, brazos, manos, piernas), `head.ts` (cara, pelo, gorros, cascos), `loft.ts` y `shapes.ts` (las formas), `skin.ts` (pesos en los huesos), `character.ts` (los junta; malla de cerca y de lejos) y `types.ts` (`Outfit`: lo que se puede poner). El material, `src/render/rigMaterial.ts`. Cómo va cada uno: enemigos en `src/entities/ai/enemyTypes.ts`, civiles en `CivilianView.ts`, los del hotel en `Npc.ts` y el Huésped en `CharacterRig.ts`. Para verlo: `npm run sheets -- huesped enemigos civiles hotel` |
| Modelos de las armas | `src/entities/rig/weapons.ts` (los modelos, su agarre y su acabado, `WeaponFinish`) y `weaponParts.ts` (piezas: perfiles extruidos con bisel, torneados, tubos); su material, `src/render/weaponMaterial.ts` |
| Armas, daño, estilo, rango | `src/combat/` |
| Añadir un arma | Sus datos y su hueco en `src/combat/weapons.ts` (y, si se compra, su mejora y su artículo en `src/hub/economy.ts`); su modelo en `src/entities/rig/weapons.ts`; qué modelo dibuja, `WEAPON_MODEL` en `src/entities/PlayerViews.ts`; sus textos en `src/text/loadout.ts` y su nombre corto del HUD en `src/game/hudModel.ts`. La armería, el guardado y la red la recogen solos (el compilador avisa de lo que falte) |
| Inventario y equipo (qué se lleva, la armería, los selectores) | Las reglas, `src/combat/weapons.ts` (`Loadout`, `normalizeLoadout`) y `src/hub/armory.ts`; las pantallas, `src/ui/loadoutScreens.ts`; la vista previa, `src/ui/weaponPreview.ts` |
| Granadas (vuelo, estallido, a quién aturde) | `src/combat/Grenades.ts`; el gesto de lanzar, en `src/combat/PlayerCombat.ts` (`tickThrow`) y su pose en `CharacterRig.ts`; el aturdimiento, en `EnemyBrain.ts` (`daze`); cómo se ven, `src/render/GrenadeViews.ts`, `ThrowArc.ts` y `vfx.ts` (`burst`) |
| IA de los enemigos | `src/entities/ai/EnemyBrain.ts` (cada uno), `src/entities/ai/squad.ts` (el grupo), `src/entities/Enemy.ts` (simulación), `src/combat/EnemyManager.ts` (coberturas, rodeos, granadas, cuerpos) |
| Un tipo de enemigo nuevo | Su ficha en `src/entities/ai/enemyTypes.ts` (armas, aguante, cuerpo, escudo, embestida, vuelo) y su nombre en `EnemyType` (`src/levels/types.ts`); el compilador pide el resto (`protocol.ts`). Si no es una persona: malla en `src/entities/rig/robots.ts` y animación en `src/entities/RobotRigs.ts`. Además: `ui/Intel.ts` (leyenda), `game/hudModel.ts`, `missions/gauntlet.ts` y los niveles. Para verlo: `npm run sheets -- maquinas escudo` |
| Reacciones a los impactos y formas de caer | `src/combat/hitReaction.ts` (qué pasa) y `CharacterRig.ts` (cómo se ve). Para verlas: `npm run sheets -- golpes caidas cojo` |
| Cómo se ven los enemigos (animación, icono de alerta, láser) | `src/entities/EnemyView.ts`: lee el estado de `Enemy` y nunca lo cambia |
| Varios jugadores (plazas, objetivos de los enemigos, reaparición) | `src/combat/PlayerRoster.ts`; cómo se ven los que no son el local, `src/entities/PlayerViews.ts` |
| Cooperativo en red (protocolo, anfitrión, invitado, compensación de latencia) | `src/net/` (simulación: corre sin pantalla); en el juego, `src/game/Coop.ts` y sus pantallas, `src/ui/coopScreens.ts` |
| Transportes del cooperativo (servicio de salas, WebRTC, otra pestaña) | `src/net/transport/`; el protocolo del servicio, `src/net/lobbyProtocol.ts` |
| Servicio de salas (Cloudflare) | `server/salas/`: `core.ts` (la lógica, sin Cloudflare) y `worker.ts` (Worker y Durable Object). Se despliega con `.github/workflows/salas.yml`; en local, `npx wrangler dev` en esa carpeta |
| Pantallas del cooperativo y lo que hacen sus botones | `src/ui/coopScreens.ts` y `src/game/coopScreenApi.ts` |
| Textos nuevos | `src/text/`: el catálogo (cooperativo y equipo) |
| Un nivel o uno nuevo | `src/levels/data/` (y registrarlo en `src/levels/registry.ts`) |
| Objetivos de un contrato | bloque `mission` del nivel; las reglas en `src/missions/objectives.ts` y su aplicación en `MissionDirector.ts` |
| HUD, aviso contextual e Intel (qué se muestra) | `src/game/hudModel.ts`; cómo se dibuja, en `src/ui/` |
| Tienda, monedas, logros | `src/hub/economy.ts`, `src/missions/achievements.ts` |
| HUD y menús | `src/ui/` |
| Sonido y música | `src/audio/` |
| Calidad gráfica y rendimiento | `src/render/` |
| Materiales de los escenarios (qué foto usa cada uno, su tamaño real, el relieve) | `src/render/materials.ts`; la descarga, `src/render/pbrTextures.ts`; la oclusión ambiental, `src/render/ambientOcclusion.ts` |

`src/game/Game.ts` es el orquestador: une entrada, simulación, vista y estados.

## Forma de trabajar

1. **Entender antes de cambiar.** Leer el archivo y sus tests. Las reglas del proyecto (bucle sin asignaciones, niveles como datos, una sola máquina de estados, arreglar la causa y no el síntoma) están en [ARQUITECTURA.md](ARQUITECTURA.md#7-convenciones-de-código).
2. **Antes de añadir un sistema, leer [ESCALABILIDAD.md](ESCALABILIDAD.md).** La simulación no dibuja, no suena ni lee la cámara; todo lo nuevo lleva id estable, validación y presupuesto.
3. **La lógica pura va con test unitario.** Si algo se puede decidir sin three ni DOM, va en un archivo aparte con su test en `tests/unit/`.
4. **Lo que se ve o se juega se comprueba jugando.** Las e2e usan la API de pruebas `window.__EXCOM__` (se activa con `?qa=1` en desarrollo y en el build de pruebas; definida en `src/debug/qa.ts`). Permite avanzar paso a paso, teletransportar, pulsar acciones y leer el estado. Para cambios visuales, sacar capturas y mirarlas.
5. **Antes de cada commit:** `npm run lint` (linter, formato y código sin uso; `npm run format` corrige el formato), `npm run build`, `npm test` y `npm run test:e2e` en verde. Para reproducir el entorno de GitHub Actions (render por software, muy pocos FPS): `CI=1 npm run test:e2e`.
6. **Commits** convencionales y en español (`feat:`, `fix:`, `perf:`, `test:`, `docs:`, `chore:`), con un cuerpo que explique el porqué.
7. **Dependencias:** Dependabot abre cada mes pull requests agrupados (juego, herramientas y acciones de la CI). La CI los prueba; se fusionan si pasan y, si algo cambia de comportamiento, se revisa como cualquier otro cambio. Si uno falla, se reproduce en local instalando esas versiones: si la culpa es de una prueba frágil, se arregla la prueba y la actualización se aplica desde aquí (Dependabot cierra su PR al ver las versiones ya al día).
8. **Documentación al día:** si cambia una mecánica, actualizar `DISENO.md`; si cambia una decisión técnica, `ARQUITECTURA.md`; al terminar algo del roadmap, moverlo a "Estado actual".

## Herramientas propias

| Comando | Para qué |
|---|---|
| `npm run poses` | Capturas de perfil de cada pose del jugador en `qa-screenshots/poses/`, con el build de pruebas servido en otra terminal (`npm run build:qa && npm run preview:qa`). Imprescindible al tocar animaciones |
| `npm run media` | Regenera las capturas y el GIF del README (necesita ffmpeg) |
| `npm run textures` | Descarga de Poly Haven las texturas CC0 de los escenarios y las convierte a WebP en `public/textures/` (necesita ffmpeg). Solo para añadir o cambiar una: las convertidas se versionan. Si se añade, va también en `PBR_SETS` (`src/render/pbrTextures.ts`) y en [CREDITOS.md](CREDITOS.md) |
| `npm run sheets` | Hojas de diseño con el motor del juego y luz de estudio: armas, efectos de disparo, cara del Huésped, Huésped y Sommelier, en `qa-screenshots/sheets/`. `npm run sheets -- armas cara` genera solo esas. Útiles para revisar un cambio de aspecto antes de enseñarlo |
| F3 en el juego | FPS, draw calls y estado. Con `?qa=1`, también botones de depuración (colisiones, modo dios, matar enemigos...) |
| `?qa=1` | API de pruebas y comandos del F3. Solo en desarrollo (`npm start`) y en el build de pruebas (`npm run build:qa`); la versión publicada no los incluye |
| `?level=arena` | Arena de pruebas de movimiento |
| `?preset=low\|medium\|high` | Fuerza la calidad gráfica |

## Errores que ya se cometieron (para no repetirlos)

- **Sentido de giro de los huesos.** El personaje mira a −Z. En huesos que cuelgan (brazos, piernas) la rotación X positiva va hacia delante; en los que suben (torso, cabeza), hacia atrás. Estuvo invertido (rodillas y arma hacia atrás) y solo se detectó al sacar capturas de perfil. Con la apertura de los brazos pasa lo mismo: la rotación Z positiva separa del cuerpo el brazo derecho y la negativa lo cruza por delante (en el izquierdo, al revés). El primer tajo del cuchillo se armó cruzando la cara por eso; de perfil no se notaba y de frente sí. Un test de `characterRig.test.ts` lo vigila midiendo dónde queda la mano.
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
- **Ángulos fijos para colocar un arma.** El encare de las armas largas se hacía con ángulos del brazo y una corrección de muñeca. Con el torso de perfil y el codo abierto, el eje de la muñeca ya no era horizontal y el arma salía desviada hasta 18° y ladeada 30°. Ahora manda el arma (culata al hombro, cañón por la mira) y la mano derecha llega por IK; una e2e lo mide con `weaponAim()` de la API de pruebas.
- **Silueta que no cabe en la cápsula.** Agachado, el cuerpo medía 1,48 m y la cápsula 1,14 m: la cabeza asomaba por encima de las coberturas y un disparo a ella no impactaba. La API de pruebas mide la silueta real (`rigHeight()`) y una e2e de movimiento lo vigila.
- **Estado de misión que no acompaña a la reaparición.** Al reaparecer, los enemigos vivos recuperan la salud; lo que dependa de esa salud (las fases del jefe) debe reiniciarse a la vez (`MissionDirector.onPlayerRespawned`).
- **Efectos que no terminan.** La cola de la trazadora se calculaba desde la cabeza ya detenida en el impacto y nunca llegaba al final: los destellos se quedaban flotando hasta reciclarse. El tramo se calcula en `render/tracerPath.ts` (lógica pura con test) y la e2e del arsenal comprueba con `vfx()` que no queda ningún efecto vivo.
- **Un `await` sin camino de error.** Una carga que fallaba dejaba el juego en `loading` para siempre. Todo flujo asíncrono que cambie de estado necesita su salida (`Game.tryLoadSession`).
- **Suavizar con `damp` lo que cambia de golpe.** Un suavizado de primer orden sigue al objetivo, pero su velocidad salta en el mismo fotograma en que el objetivo cambia: al agacharse, apuntar o arrancar, todo el cuerpo daba un tirón. Los pesos de mezcla del rig van con un muelle crítico (`spring` en `rigMath.ts`) y la API de pruebas mide la aceleración de cada articulación con `rigMotion()`; una e2e de movimiento la acota.
- **Empujar al personaje contra el suelo.** En el suelo se le daba una velocidad vertical de −1 m/s "para que no flotara". Con los pies dentro del margen de separación de la KCC, Rapier daba por bloqueados pasos sueltos en llano y al correr se perdía uno de cada 20 o 30: tirones del cuerpo y de la cámara que no se veían en ninguna captura. Lo pega `snapToGround`; las pruebas "sin tirones en llano" de `playerMovement.test.ts` lo vigilan.
- **Medir por fotogramas lo que no depende de ellos.** El medidor de audio leía 46 ms de sonido en cada fotograma: en la CI, a unos 3 FPS, dos segundos eran seis muestras sueltas y la prueba de mezcla fallaba por azar (lo destapó una actualización de Playwright). Ahora cada lectura abarca unos 0,7 s y la música se mide en su propio bus, sin restar dos medidas tomadas en momentos distintos.
- **Mover un collider y consultar en el mismo paso.** Los rayos y solapes de Rapier usan el árbol de colliders que refresca `world.step()`: lo que se movió después todavía no está ahí. Por eso la compensación de latencia no rebobina los cuerpos de la física, sino que prueba cada cápsula a mano (`net/lagComp.ts`).
- **La pestaña oculta no tiene fotogramas.** El navegador para `requestAnimationFrame` y frena los temporizadores de la página. Lo que deba seguir corriendo, como el anfitrión de una partida en red, necesita otro reloj: el de un worker (`game/HiddenTicker.ts`).
- **Una prueba de red que pasa a la primera.** Las del cooperativo se comprobaron rompiendo a propósito la semilla de la dispersión y la comprobación de plausibilidad: fallaron como debían. Una prueba que nunca se ha visto fallar no demuestra nada.
- **Estado de un Durable Object en memoria.** Con la hibernación, el objeto sale de la memoria entre mensajes: lo que haya en sus campos se pierde. El servicio de salas guarda todo en el adjunto de cada conexión (`serializeAttachment`) y encuentra las conexiones por etiquetas.
- **Lo que deja `wrangler dev` al pararlo.** Su runtime (`workerd`) se queda vivo y bloquea `.wrangler/`. Hay que cerrar el árbol de procesos de wrangler; `.wrangler/` está en `.gitignore`.
- **Girar un brazo casi 180° de golpe.** Para llevar la mano de colgando a por encima de la cabeza (el disparo a ciegas), `setFromUnitVectors` entre dos direcciones casi opuestas no tiene un eje definido: el brazo volteaba de un fotograma a otro (un salto de 1.800 en la medida de tirones). Se hace en dos tramos, primero al frente y de ahí al objetivo. El tirón solo se vio midiendo, no en las capturas.
- **Dos barridos de la cámara con esferas distintas.** El tramo cabeza → hombro usaba una esfera menor que el siguiente: junto a una pared, el hombro quedaba a menos del radio del segundo barrido, este empezaba dentro de ella y la cámara se encogía hasta la cabeza (pasaba a cubierto contra una columna). `cameraRig.test.ts` lo vigila.
- **Una foto que se repite deja ver su cuadrícula.** El asfalto mostraba las mismas grietas cada 3 m. Los materiales con foto la muestrean sin repetición (`NO_TILE_GLSL` en `render/materials.ts`); en los dibujos procedurales solo el relieve, porque desplazar su color rompería el diseño.
- **Una foto más oscura que la textura a la que sustituye.** El hormigón fotoescaneado tiene un color medio de 87 sobre 255, y la textura procedural era mucho más clara: con el mismo tinte oscuro, las azoteas de Torre Meridian perdieron la mitad de luz y la prueba de claridad falló. Al cambiar la textura de un material hay que revisar su tinte (o su `gain`) y pasar la prueba de claridad; `checkpoint-shots.mjs` (herramientas de trabajo) compara la luminancia por checkpoint entre dos builds.
- **La oclusión ambiental de three solo oculta puntos y líneas** en su pase de normales: los fogonazos, el humo y los cristales dejaban halos oscuros. `render/ambientOcclusion.ts` oculta también lo transparente.
- **Una conexión nueva fuera del origen.** La política de seguridad de contenido (`vite.config.ts`) solo permite conectar con el propio origen y el servicio de salas: otra dirección necesita su entrada en `connect-src`, o el navegador la bloquea sin más.
- **Redimensionar el lienzo después de dibujar.** Cambiar el tamaño de un canvas lo borra. La resolución dinámica se ajustaba al final del fotograma, después de dibujar, y cada cambio dejaba un fotograma en negro: solo se veía grabando el juego fotograma a fotograma. Ahora se ajusta antes, y una e2e cuenta los fotogramas en los que el lienzo se redimensiona y no se vuelve a dibujar.
- **Caras del revés.** Un tubo con los triángulos en el otro sentido no se nota en los datos: se ve negro, porque solo se dibuja su cara interior. `tests/unit/characterMesh.test.ts` compara cada cara con sus normales; toda forma nueva entra en esa prueba.
- **Un borde con la normal a ojo.** El canto de la capucha llevaba la normal hacia abajo y el borde de color lo pintaba entero de rojo. Las normales se calculan de la geometría.
- **Contar pasos restando decimales.** La mecha de la granada (1,6 s) se gastaba restando 1/60 en cada paso: por el redondeo daba 97 pasos en vez de 96 y el arco acababa un paso antes de donde estallaba. Si dos sitios tienen que contar lo mismo, o cuentan enteros o comparten el margen (`FUSE_EPS`).
- **Cancelar un gesto de golpe.** Guardar la granada ponía la fase del gesto a «sin gesto» en un fotograma y el brazo caía con un tirón tres veces mayor que el del tajo. Un gesto que se cancela tiene que recorrer su camino de vuelta, aunque ya no ocupe las manos.
- **Un sonido sin posición no viaja.** El disparo de un invitado llegaba al registro de efectos del anfitrión sin posición (suena «donde está» por su puerto) y no se apuntaba: los demás invitados no lo oían. Los puertos de un jugador remoto necesitan su `voice` (`FxRecorder.tee`).
- **Una acción nueva en ajustes ya guardados.** Los ajustes guardan todas las teclas: la de fábrica de una acción nueva puede estar ocupada por otra que el jugador cambió. `validateSettings` le busca una libre.
- **Cambiar de destino sin cambiar de estado.** Un enemigo a cubierto al que veían elegía otra cobertura, pero seguía en el estado «a cubierto» y se daba por llegado: no se movía. Lo que se reinicia al entrar en un estado hay que reiniciarlo también al volver a elegir dentro de él.
- **Un panel cuyo contenido cambia de alto.** En la armería, cada pieza tenía un texto distinto: al pasar el ratón aparecían y desaparecían barras de desplazamiento y la ventana saltaba. Si el contenido cambia al señalar, el hueco debe ser el del más grande (los textos superpuestos en la misma celda de una rejilla) y los lienzos, medir lo que diga la hoja de estilos (`setSize(w, h, false)`).
- **Caer girando por el centro del cuerpo.** Si la altura baja a un ritmo y el giro va a otro, los pies se hunden en el suelo a mitad de la caída. La altura sale del ángulo (`fallHeight`).
- **Lo que se sube a la GPU al verlo por primera vez.** Un rótulo que entraba en cuadro a mitad de partida subía su textura en ese fotograma (un tirón) y, según el instante, la prueba de recursos contaba una más. `GameRenderer.prewarm` sube las texturas de toda la escena y los esqueletos al cargar el nivel.
- **Equilibrio:** repartir turnos, recargar y cubrirse hace a los enemigos más listos y, de paso, menos peligrosos. Al tocar su comportamiento hay que medir el daño por segundo que hacen antes y después, con las mismas semillas, y compensarlo.
- **Niveles:** escalones de más de 0,32 m o muebles sin `noWalk` rompen la navegación de los enemigos. Los tests de navegación lo detectan.

## Despliegue

Cada push a `main` ejecuta `.github/workflows/deploy.yml`: pruebas unitarias, build, e2e y publicación en GitHub Pages (Settings → Pages → Source: GitHub Actions). Si la CI falla, no se publica; el log del paso que falló dice qué test fue.
