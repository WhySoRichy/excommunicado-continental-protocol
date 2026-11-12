# Roadmap

Qué se puede mejorar y en qué orden. Cada bloque está pensado para una sesión de trabajo: tiene un objetivo claro y una forma de comprobar que quedó bien. El estado actual del juego está descrito en [DISENO.md](DISENO.md) y la parte técnica en [ARQUITECTURA.md](ARQUITECTURA.md).

## Estado actual

- Hub, tutorial, tres contratos y Gauntlet completos y jugables de principio a fin.
- Personajes procedurales con volumen y cara, y animación procedural con IK de piernas, reacciones de impacto y caídas variadas (`src/entities/CharacterRig.ts`).
- Dirección de arte nocturna: cielo con silueta de ciudad en los exteriores, vestíbulo del Continental con papel pintado y damero de mármol, bloom y viñeta desde el preset Medio.
- 143 pruebas unitarias y 38 e2e; CI y despliegue automático en GitHub Pages.

## Prioridad alta: lo que más se nota al jugar

### 1. Tercera pasada de animación
Ya están hechas las reacciones de impacto, las tres caídas al morir (de bruces, de espaldas o desplomado, según de dónde venga el disparo), el esprint con zancada propia y los pasos al girar en el sitio. Queda:
- **Mano izquierda con IK** hacia el guardamanos del arma larga y hacia la pistola: ahora son ángulos fijos y las manos no siempre coinciden.
- **Pies como hueso propio**, para que la suela quede plana en el deslizamiento y de puntillas al agacharse.
- **Vault con tiempos**: usar la duración real del estado para apoyar la mano, pasar las piernas y aterrizar.
- **Takedown coreografiado**: hoy es un golpe genérico.
- Cómo comprobarlo: `npm run poses` genera capturas de perfil de cada pose en `qa-screenshots/poses/`.

### 2. Sensación de combate
Ya hay pausa de impacto y sacudida en cada baja, casquillos y pisadas según la velocidad. Queda:
- Humo en la boca del arma.
- Pisadas distintas según el material del suelo.

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
