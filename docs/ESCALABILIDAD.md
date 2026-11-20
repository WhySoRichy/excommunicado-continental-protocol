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
| Un solo jugador cableado | `LevelSession` guarda un `player`, un `combat` y un único `PlayerTarget`; los enemigos reciben ese objetivo | Cualquier modo con más de un jugador |
| Módulos que concentran demasiado | `Game.ts` 1.330 líneas, `PlayerController.ts` 1.035, `CharacterRig.ts` 1.018 (su `update` ronda las 550) | Que dos frentes avancen a la vez sin pisarse |
| Textos dentro del código | Cadenas en español repartidas por más de diez módulos de juego (armas, estilo, logros, diálogos) | Traducir y revisar textos sin tocar lógica |
| Contenido sin validar fuera de los niveles | Armas, tipos de enemigo y diálogos no tienen comprobaciones como las de los niveles | Añadir contenido en volumen sin romper el equilibrio ni las referencias |
| Gráficos solo procedurales | Sin carga de modelos ni texturas externas, sin instancias ni niveles de detalle | Gráficos más realistas y escenas con muchos personajes |
| Historial pesado | 48 MB de `.git`: seis versiones del GIF del README suman 29 MB | Cada regeneración de capturas añade unos 10 MB para siempre |
| CI lineal | 54 e2e en serie, de 8 a 13 min en un runner sin GPU | El tiempo crece con cada contrato nuevo |

## 3. Reglas para crecer

1. **Capas.** La *simulación* (reglas y estado) puede usar la matemática de three (`Vector3`, `Quaternion`) pero no escenas, mallas, materiales, DOM ni audio. La *vista* (render, sonido, interfaz) lee el estado y reacciona a eventos. El *contenido* son datos validados. La *red*, cuando llegue, solo transporta intenciones y estado.
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

### Fase 2 · Varios jugadores en la simulación (aún en local)
Hecho:
- **Los enemigos eligen objetivo entre los jugadores.** Cada jugador tiene su `PlayerTarget` con un id (`combat/playerTarget.ts` lo crea y lo actualiza) y `EnemyManager` recibe la lista. Cada enemigo sigue con el mismo mientras viva y no haya otro claramente más cerca (al 60 % de la distancia); si le hieren, se vuelve hacia el jugador más cercano al origen del disparo y no lo suelta en 3 s, para no dudar entre dos. El aviso de disparo dice a qué jugador iba.
- **Prueba sin pantalla con dos jugadores**: el enemigo elige al más cercano, solo le dispara a él y, cuando el lejano le hiere, se vuelve hacia este. Sin el bloqueo de 3 s la prueba falla.
- **Registro de jugadores** (`combat/PlayerRoster.ts`): cada jugador ocupa una plaza con su id, su controlador, su combate, su objetivo, su contexto de combate y sus intenciones. El registro actualiza los objetivos, lleva cada disparo enemigo al combate del jugador alcanzado y simula a los que no son el local. La sesión lo usa con el jugador local en la plaza 0, y las pruebas sin pantalla usan el mismo código; una de ellas comprueba que el daño va solo al jugador atacado.

Pendiente:
- Las reglas de misión con varios jugadores (quién recoge, cuándo se pierde, reaparición) y una vista para los jugadores que no son el local; la cámara y el HUD siguen siendo solo del local.
- Algunos avisos del combate son de primera persona (marcadores de impacto, recarga, Foco): con jugadores remotos solo deben sonar para el local.

### Fase 3 · Multijugador en red
- Anfitrión con autoridad sobre WebRTC: el anfitrión simula y los invitados envían sus intenciones. El lockstep queda descartado porque la coma flotante no es idéntica entre navegadores.
- Instantáneas a 20 Hz con interpolación; predicción del propio personaje con corrección.
- Disparos con compensación de latencia (el anfitrión rebobina las posiciones al instante del disparo).
- Un servicio mínimo de señalización, aparte del cliente estático, y sin datos personales.

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
