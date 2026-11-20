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
| Simulación y vista mezcladas | 11 módulos de simulación importan render, audio, interfaz o cámara. `Enemy` crea su rig, su icono y su láser; `PlayerCombat` lee la cámara y llama a efectos y sonido; `MissionDirector` y `HubDirector` escriben en el HUD | Un servidor sin pantalla, el multijugador y cambiar la presentación sin tocar reglas |
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

### Fase 1 · Frontera entre simulación y vista (prerrequisito del resto)
- Bus de eventos de juego: la simulación publica y la vista se suscribe. Desaparecen las llamadas directas a efectos, sonido y HUD desde combate, enemigos y directores.
- `Enemy` se parte en estado (simulación) y vista (rig, icono, láser).
- El rayo de apuntado llega en `CombatIntent` en lugar de leerse de la cámara.
- Regla de lint que impide a las carpetas de simulación importar render, interfaz, audio o cámara.
- Prueba sin pantalla: una oleada completa del Gauntlet simulada en Node.

### Fase 2 · Varios jugadores en la simulación (aún en local)
- Registro de jugadores con id; cada uno con su controlador, su combate y su intención.
- Los enemigos eligen objetivo entre los jugadores (el más cercano o el que ven).
- Prueba sin pantalla con dos jugadores simulados.

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
