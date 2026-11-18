# Roadmap

Qué se puede mejorar y en qué orden. Cada bloque está pensado para una sesión de trabajo: tiene un objetivo claro y una forma de comprobar que quedó bien. El estado actual del juego está descrito en [DISENO.md](DISENO.md) y la parte técnica en [ARQUITECTURA.md](ARQUITECTURA.md).

## Estado actual

- Hub, tutorial, tres contratos y Gauntlet completos y jugables de principio a fin.
- Personajes procedurales de diseño facetado (sombreado plano, torso en V, rasgos mínimos) y animación procedural con IK de piernas y de la mano de apoyo, pies articulados, reacciones de impacto, caídas variadas, vault en tres tiempos y takedown coreografiado (`src/entities/CharacterRig.ts`).
- Rediseño con más detalle dentro del estilo de bloques: el Huésped con los rasgos de Keanu Reeves (traje de tres piezas, media melena con raya al medio y barba), el Sommelier (camisa, chaleco, pajarita, delantal y catavinos), ocho modelos de arma y proyectiles más vistosos (trazadoras que viajan, fogonazo en estrella y casquillos de latón). Los personajes admiten prendas opcionales y rostros (`Outfit` y `FaceStyle` en `src/entities/CharacterRig.ts`).
- Dirección de arte nocturna: cielo con silueta de ciudad en los exteriores, vestíbulo del Continental con papel pintado y damero de mármol, bloom y viñeta desde el preset Medio.
- 157 pruebas unitarias y 47 e2e; CI y despliegue automático en GitHub Pages.
- Arsenal ampliado: el revólver «Juez» y el rifle de tirador «Meridian» (con mira de aumento) se compran en la armería, y cada tecla de arma recorre su grupo.
- El Gauntlet ya no se degrada con las oleadas: los caídos se retiran al empezar la siguiente y un cuerpo asentado deja de simularse y animarse. Tras doce oleadas, 81 draw calls (antes unas 400). Además, los personajes de igual aspecto comparten la geometría: un enemigo que aparece ya no construye ni sube a la GPU un cuerpo nuevo.
- Primera pasada de robustez tras revisar el juego entero, jugándolo y midiendo: el mapa de sombras se libera al cambiar de nivel, el combate con el Juez se reinicia al reaparecer, un nivel que no se descarga se explica en pantalla, el audio posicional sigue a la cámara en Firefox, abrir el juego sin empezar no crea partida y la voltereta suena.
- Build de pruebas separado del público: la API de QA y los comandos del F3 (monedas, modo dios) solo existen en desarrollo y en `npm run build:qa`. La versión publicada ya no los incluye, requisito previo de la tabla de récords en línea.

## Antes de añadir contenido: robustez y rendimiento

Lo que quedó pendiente de esa revisión. Conviene hacerlo antes del cuarto contrato, porque más contenido multiplica estos costes.

### Red de seguridad
- Prueba de humo en Firefox dentro de la suite.
- Validar el guion de cada misión (un `enemyId` o un `group` mal escrito deja el objetivo sin completarse) y que `tests/unit/hubNav.test.ts` recorra todos los niveles del registro.
- Avisar cuando el navegador pierde el contexto gráfico y recuperar la iluminación de entorno al volver.
- CI: límite de tiempo por trabajo y no cancelar un despliegue en curso.

### Lo que ya existe y no se ve
- Pantalla de logros (hay 17 y solo aparecen al conseguirlos) y de estadísticas (el tiempo jugado se guarda y no se muestra).
- Selector de dificultad: los multiplicadores de puntería y daño de los enemigos ya están cableados.
- Registro local de partidas exportable, para medir el balance con jugadores reales (punto 3).
- La lluvia declarada en los niveles (`weather`) no se dibuja.

### Mantenibilidad
- Repartir `src/game/Game.ts` (unas 1400 líneas) y pasar la lógica de objetivos y fases de `MissionDirector` a un módulo puro con tests.

## Prioridad alta: lo que más se nota al jugar

### 1. Pulido de animación
La tercera pasada está completa: mano izquierda con IK sobre el arma, pies como hueso propio (suela plana, puntillas al agacharse, talón al deslizarse), vault con tiempos reales y takedown coreografiado. Queda como pulido:
- **Muñecas y dedos**: la mano es un bloque rígido; no rodea el guardamanos ni la empuñadura.
- **Cabeza que mira al objetivo** en enemigos y NPC, independiente del torso.
- **Transiciones del cuerpo a cuerpo** con cuchillo, que hoy reutilizan el barrido genérico.
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

- **Cooperativo en línea:** el juego es de un jugador y toda la simulación corre en el navegador. Un modo cooperativo necesita un servidor con autoridad o sincronización entre pares; es un proyecto en sí mismo.
- **Editor de niveles** dentro del juego, aprovechando que los niveles ya son datos.
