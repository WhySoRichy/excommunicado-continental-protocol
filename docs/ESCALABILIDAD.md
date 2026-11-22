# Escalabilidad

El juego va a seguir creciendo en cuatro direcciones a la vez: gráficos, contenido, jugabilidad y multijugador. Este documento recoge qué tiene ya el código para crecer, dónde se atasca (medido, no supuesto) y en qué orden conviene abrir cada frente para que ninguno multiplique el coste de los demás. Se actualiza al cerrar cada fase.

## 1. Lo que ya escala

- **Simulación a paso fijo** de 1/60 s con interpolación de render, y azar con semilla (`core/rng.ts`) en todo lo que afecta a la partida: el `Math.random` que queda es cosmético (sonido y destellos).
- **Física que corre sin pantalla.** Rapier funciona en Node: las pruebas de movimiento simulan la arena entera sin navegador. Es la base de un servidor.
- **Entrada como intención.** El movimiento y el combate reciben `PlayerIntent` y `CombatIntent`, objetos planos que se pueden enviar por red.
- **Niveles como datos validados.** Cada nivel es un módulo de datos, se carga en su propio chunk y los tests comprueban su luz mínima, su navegación y el guion de su misión.
- **Lógica pura con pruebas**: objetivos, HUD, tutorial, economía, matemática del rig, rango, daño.
- **Presupuestos vigilados por e2e**: draw calls, programas de shader, fugas de GPU al cambiar de nivel, tamaño del bundle y fluidez de la animación. Calidad por presets y resolución dinámica.
- **API de pruebas** que avanza la simulación paso a paso: permite probar cualquier sistema nuevo de forma determinista.

## 2. Dónde se atasca (medido el 2026-11-19)

| Problema | Dato | Qué bloquea |
|---|---|---|
| Simulación y vista mezcladas | Al empezar la fase 1, 11 módulos de simulación importaban render, audio, interfaz o cámara. Tras la fase 1, ninguno (vigilado por lint) | Resuelto: la simulación corre sin pantalla |
| Un solo jugador cableado | Al empezar la fase 2, `LevelSession` guardaba un `player`, un `combat` y un único `PlayerTarget`. Tras ella, un registro de plazas con un objetivo por jugador; tras la fase 3, cooperativo en red | Resuelto |
| Peso del juego | 275 KB comprimidos de un presupuesto de 300 (la red añadió unos 15) | Lo próximo grande conviene cargarlo aparte, como los niveles |
| Módulos que concentran demasiado | `Game.ts` 1.330 líneas, `PlayerController.ts` 1.035, `CharacterRig.ts` 1.018 (su `update` ronda las 550) | Que dos frentes avancen a la vez sin pisarse |
| Textos dentro del código | Cadenas en español repartidas por más de diez módulos de juego (armas, estilo, logros, diálogos) | Traducir y revisar textos sin tocar lógica |
| Contenido sin validar fuera de los niveles | Armas, tipos de enemigo y diálogos no tienen comprobaciones como las de los niveles | Añadir contenido en volumen sin romper el equilibrio ni las referencias |
| Gráficos solo procedurales | Sin carga de modelos ni texturas externas, sin instancias ni niveles de detalle | Gráficos más realistas y escenas con muchos personajes |
| Historial pesado | 48 MB de `.git`: seis versiones del GIF del README suman 29 MB | Cada regeneración de capturas añade unos 10 MB para siempre |
| CI lineal | 54 e2e en serie, de 8 a 13 min en un runner sin GPU | El tiempo crece con cada contrato nuevo |

## 3. Reglas para crecer

1. **Capas.** La *simulación* (reglas y estado) puede usar la matemática de three (`Vector3`, `Quaternion`) pero no escenas, mallas, materiales, DOM ni audio. La *vista* (render, sonido, interfaz) lee el estado y reacciona a eventos. El *contenido* son datos validados. La *red* (`src/net/`) solo transporta intenciones y estado, y entra en la misma regla de lint que la simulación.
2. **La simulación avisa, no dibuja.** Disparos, impactos, muertes, ruidos y avisos se publican como eventos tipados; efectos, sonido y HUD se suscriben.
3. **Toda entidad tiene un id estable** y un estado que se puede copiar a un objeto plano.
4. **La simulación no lee teclado ni cámara.** Todo llega en la intención de cada jugador, incluido el rayo de apuntado.
5. **El contenido nuevo trae su validación**, como los niveles.
6. **Cada sistema nuevo trae su presupuesto y su prueba sin pantalla.**
7. **Los textos nuevos van a un catálogo**, no al código; los existentes se mueven cuando se toque su módulo.

## 4. Plan por fases

Cada fase deja el juego publicado y en verde; ninguna exige terminar la siguiente.

### Fase 1 · Frontera entre simulación y vista (prerrequisito del resto) · completada
- **Puertos.** Combate, enemigos y directores avisan a través de interfaces propias (`src/combat/ports.ts` y `src/missions/ports.ts`: sonido, efectos, sacudida de cámara y HUD) y ya no importan `AudioEngine`, `Vfx`, `CameraRig` ni `Hud`, que declaran `implements`. Sin pantalla se usan los puertos mudos (`SILENT_AUDIO`, `NO_VFX`); para la red bastará uno que registre los avisos.
- **Regla de lint** (`no-restricted-imports` en `.oxlintrc.json`): las carpetas de simulación no pueden importar render, interfaz, audio ni la cámara.
- **Prueba sin pantalla** (`tests/unit/headless.test.ts`): en Node, un enemigo detecta al jugador, le dispara y el jugador lo abate. Destapó que el enemigo dibujaba su icono de alerta en un canvas al nacer.
- **`Enemy` partido en estado y vista.** `Enemy` es solo simulación y entra en la regla de lint; `EnemyView` (personaje animado, icono de alerta y láser) lee su estado sin cambiarlo y `EnemyViews` crea y suelta las vistas según aparecen o se retiran enemigos. De paso, tres cosas de la simulación que avanzaban al dibujar pasaron al paso fijo: el reloj de la proyección del takedown, la sacudida al recibir un impacto y la posición del láser.
- **El apuntado llega en la intención.** `CombatIntent` trae el rayo de apuntado (`aimFrom` y `aimDir`); el combate ya no lee ninguna cámara y su puerto de cámara solo recibe el retroceso y la sacudida. Cada jugador, también uno remoto, trae su propio apuntado.
- **`Civilian` y `Pickups` partidos igual.** Sus vistas (`CivilianViews` y `PickupViews`) leen el estado sin cambiarlo. La fase del baile de cada civil se sigue sorteando en la simulación, aunque solo la use la vista, para no alterar la secuencia de azar de la partida. De paso, la cruz de cada botiquín dejó de crear un material que nunca se liberaba.
- **Directores sin escena.** Misión y vestíbulo reciben la partida como `MissionWorld` (datos del nivel, jugador, combate y enemigos) y no la `LevelSession` entera. La alarma del Continental pasa por un puerto (`AlarmPort`): el director decide cuándo suena y `LevelAlarm` (vista) tiñe las luces y las hace latir.

Resultado: ningún módulo de simulación importa ya render, interfaz, audio, cámara ni la clase del rig; la regla de lint lo vigila en combate, misiones, vestíbulo, IA, física, navegación, datos de nivel, núcleo, `PlayerController`, `Enemy` y `Civilian`.

- **Gauntlet sin pantalla.** Una segunda prueba monta en Node el director de misión real sobre el vestíbulo: lanza las oleadas, los enemigos atacan y se superan tres.

### Fase 2 · Varios jugadores en la simulación (aún en local) · completada
- **Los enemigos eligen objetivo entre los jugadores.** Cada jugador tiene su `PlayerTarget` con un id (`combat/playerTarget.ts` lo crea y lo actualiza) y `EnemyManager` recibe la lista. Cada enemigo sigue con el mismo mientras viva y no haya otro claramente más cerca (al 60 % de la distancia); si le hieren, se vuelve hacia el jugador más cercano al origen del disparo y no lo suelta en 3 s, para no dudar entre dos. El aviso de disparo dice a qué jugador iba.
- **Prueba sin pantalla con dos jugadores**: el enemigo elige al más cercano, solo le dispara a él y, cuando el lejano le hiere, se vuelve hacia este. Sin el bloqueo de 3 s la prueba falla.
- **Registro de jugadores** (`combat/PlayerRoster.ts`): cada jugador ocupa una plaza con su id, su controlador, su combate, su objetivo, su contexto de combate y sus intenciones. El registro actualiza los objetivos, lleva cada disparo enemigo al combate del jugador alcanzado y simula a los que no son el local. La sesión lo usa con el jugador local en la plaza 0, y las pruebas sin pantalla usan el mismo código; una de ellas comprueba que el daño va solo al jugador atacado.
- **Avisos de primera persona solo para el local.** Los disparos de los demás suenan en su posición; sus marcadores de impacto, recarga, Foco e interfaz no suenan en este equipo. Su parte en tiempo real del combate (gasto del Foco, retroceso) avanza igual que la del local.
- **Reglas de misión con varios jugadores.** Un objetivo de alcanzar una zona se cumple llegue quien llegue (vivo). Los que no son el local reaparecen a los 5 s en el último punto de control; la muerte del local sigue su flujo de siempre (pantalla de muerte y marcadores).
- **Vista de los demás jugadores** (`entities/PlayerViews.ts`): el Huésped con traje gris y contorno azul, con su arma y la misma animación que el local. La cámara y el HUD siguen siendo del local.
- **En el juego real**: la API de pruebas añade un segundo jugador (`addPlayer`) y una e2e comprueba que se ve, que el enemigo cercano le ataca a él y que el daño es suyo.

Queda para la fase 3: quién mueve a los demás jugadores (la red), y qué pasa cuando cae el local con otros vivos.

### Fase 3 · Multijugador en red · completada
Cooperativo para hasta cuatro jugadores, sin servidor propio (título → Cooperativo). El lockstep quedó descartado porque la coma flotante no es idéntica entre navegadores: manda un anfitrión.

- **Anfitrión con autoridad** (`net/NetHost.ts`). La partida corre en su equipo como siempre: enemigos, daño, munición, misión y muertes son suyos. Cada invitado le envía en cada paso su movimiento y lo que pide su combate; el anfitrión los aplica en orden, con una pequeña cola que amortigua la variación de la red.
- **El movimiento lo decide su dueño y el anfitrión lo comprueba.** El invitado mueve a su personaje sin esperar a la red, así que no hay correcciones que se noten, y el anfitrión solo acepta lo creíble: velocidad, altura y sin meterse en una pared. Si no cuadra, lo devuelve a donde lo tenía. Es la «predicción con corrección» del plan llevada a lo que mejor se siente en un cooperativo, sin renunciar a no fiarse del cliente.
- **El disparo del invitado se predice con la misma semilla.** Fogonazo, sonido, retroceso, trazadora y sangre salen al instante en su equipo; el anfitrión resuelve el mismo disparo con la misma dispersión (la semilla es el número del paso) y confirma impactos, estilo y bajas. Una prueba comprueba que el disparo predicho y el resuelto acaban en el mismo punto, y falla si las semillas no coinciden.
- **Compensación de latencia** (`net/lagComp.ts`). El anfitrión guarda medio segundo de posiciones y resuelve cada disparo de un invitado contra lo que este tenía en pantalla. No mueve la física: sus consultas usan el árbol que refresca `world.step()`, así que el escenario se consulta a la física y cada personaje se prueba a mano, cápsula a cápsula, en su posición de entonces.
- **Instantáneas a 20 Hz con interpolación** (`net/NetGuest.ts`, `net/interp.ts`). El invitado dibuja todo con 100 ms de retraso, entre las dos instantáneas que rodean ese instante, con los mismos `Enemy`, civiles, objetos y vistas que el anfitrión: son réplicas que no piensan. Los efectos (disparos, trazadoras, impactos, alertas) viajan con la instantánea y se reproducen a su hora; los suyos ya los predijo.
- **Protocolo** (`net/protocol.ts`). Tuplas JSON con números redondeados (unos 3 KB por instantánea con veinte enemigos), un canal fiable para avisos y eventos y otro que puede perder para entradas e instantáneas. Todo lo que llega se valida y lo malformado se descarta entero; el compilador obliga a que cada estado del juego tenga su sitio en las tablas del protocolo.
- **Transportes** (`net/transport/`). WebRTC con la señalización en dos códigos que los jugadores se pasan a mano: ni servidor propio ni datos personales (el STUN público solo le dice a cada equipo su dirección pública). Entre pestañas del mismo navegador, `BroadcastChannel`, que también usan las e2e. Un servicio de salas con nombre se podría añadir sin tocar la simulación.
- **En el juego** (`game/Coop.ts`, `ui/coopScreens.ts`). Sala con invitación por código, la arena o cualquier contrato desbloqueado, sin briefing ni tutorial; panel del equipo con la salud de cada uno y la latencia; nombres sobre los aliados; reaparición automática a los 5 s, gastando un marcador del equipo por caída; sin Foco ni pausas de impacto (el tiempo del mundo es de todos); la pausa no para el mundo; el anfitrión sigue simulando con la pestaña oculta (un worker marca el tiempo, `game/HiddenTicker.ts`); los invitados cobran las monedas del contrato en su propia partida guardada. Los textos van al primer catálogo (`src/text/coop.ts`).
- **Pruebas.** Sin pantalla: protocolo, rayo contra cápsula, rebobinado y una partida entre anfitrión e invitado con latencia, variación y pérdida (movimiento, daño, baja confirmada, misma dispersión, rechazo de lo imposible, reaparición, salida y latidos). En el juego real (`tests/e2e/coop-net.spec.ts`): dos pestañas juegan juntas, también con la del anfitrión oculta; un contrato con los textos de la misión replicados y la vuelta a la sala; y una conexión WebRTC de verdad con sus códigos.

Queda (el orden de los grandes bloques lo marca [VISION.md](VISION.md); el siguiente es justo este: un cooperativo jugable con gente, con un servicio de salas en el plan gratuito de Cloudflare):
- Un servidor de retransmisión (TURN) opcional para las redes que no permiten la conexión directa (algunas de empresa y móviles).
- Que los invitados usen los objetos de la misión (terminales, paneles, ascensores): ahora solo los usa el anfitrión.
- Volver a entrar tras un corte conservando la plaza, y que la partida siga si se va el anfitrión.
- Cámara de espectador mientras se espera para reaparecer.
- Compensación de latencia también para el cuchillo y los takedowns, que ahora usan la posición actual.

### Fase 4 · Contenido a escala
- Registros validados de armas, enemigos, misiones y diálogos, con comprobaciones de referencias y de equilibrio.
- Catálogo de textos en español, preparado para otros idiomas.

### Fase 5 · Gráficos
- Carga opcional de modelos y texturas comprimidas sin abandonar lo procedural; sistema de materiales PBR por superficie.
- Iluminación precalculada por nivel (sondas o lightmaps), instancias para multitudes y niveles de detalle por preset, siempre dentro de los presupuestos medidos.

### Continuo
- Repartir los módulos grandes al tocarlos: el flujo de contratos y el vestíbulo fuera de `Game.ts`; cobertura, vault y deslizamiento como estados propios de `PlayerController`; el `update` del rig en capas (marcha, brazos, estados, cobertura).
- Capturas del README en vídeo comprimido o publicadas fuera del historial.
- Repartir las e2e en dos trabajos de la CI cuando pasen de 15 minutos.
