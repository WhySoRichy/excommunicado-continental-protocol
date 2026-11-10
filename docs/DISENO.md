# Diseño del juego

**EXCOMMUNICADO: CONTINENTAL PROTOCOL** es un juego de acción en tercera persona para el navegador. Proyecto de fans sin fines de lucro, no afiliado ni respaldado por los titulares de la franquicia John Wick. Modelos, música y texturas son propios y procedurales.

La parte técnica está en [ARQUITECTURA.md](ARQUITECTURA.md).

## 1. Fantasía y pilares

Eres **el Huésped**: un asesino retirado al que el mundo volvió a llamar. El Continental es territorio neutral: aquí no se hace negocio y no se dispara. Afuera cumples contratos con **estilo, precisión y economía de movimiento**.

| Pilar | Cómo se concreta |
|---|---|
| Fluidez | Moverse, apuntar, disparar, recargar y rematar sin bloqueos: animaciones cortas y cancelables, recarga perfecta y takedown con doble tap automático |
| Claridad | Objetivo siempre arriba con baliza, aviso de tecla contextual, color e icono por tipo de enemigo, causa de muerte explicada |
| Estilo | Style Meter ×1–×8 que premia **variedad**, y rango final D–S |
| Riesgo y reglas | Marcadores de sangre como vidas; romper la regla del Continental te hace Excomunicado |
| Robustez | Paso fijo de 60 Hz, física Rapier, tests automáticos de colisión, visibilidad y FPS |

## 2. Estructura del juego

```
Título ─► Continental (hub) ─► Charon: contratos ─► Briefing ─► Contrato ─► Resultados ─┐
              ▲     │                                                                    │
              │     ├─► Sommelier: armería (monedas)                                     │
              │     ├─► Winston: historia y desbloqueos                                  │
              │     ├─► Placa de las Reglas (lore + tutorial)                            │
              │     └─► Campo de práctica (sótano): tutorial + tiro libre                │
              └──────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Hub: El Continental (zona neutral)
- Vestíbulo con el **mostrador de Charon** al norte, la **armería del Sommelier** al oeste, el **despacho de Winston** al este, la **Placa de las Reglas** junto al mostrador y el **ascensor al Campo de Práctica** al sureste.
- Carteles dorados grandes sobre cada zona. El HUD muestra la etiqueta "ZONA NEUTRAL — prohibido disparar".
- Arma enfundada. El primer clic la desenfunda y avisa: *"Regla I: no se hace negocio en el Continental. Disparar aquí = EXCOMUNICADO."* Un segundo disparo deliberado activa el **Excomunicado**.

### 2.2 Excomunicado (consecuencia tutorializada)
1. Suena la alarma, las luces pasan a rojo y Charon anuncia la sanción.
2. Pierdes el **30 % de tus monedas** (multa de la Alta Mesa).
3. El vestíbulo se vuelve hostil: **3 oleadas** de ejecutores entran por las puertas.
4. Si sobrevives, Winston te readmite. Si caes, despiertas readmitido pero sin las monedas.
5. Se registra en tu historial y desbloquea el logro "Excomunicado".

### 2.3 Contratos
| # | Contrato | Espacio | Mecánica distintiva | Objetivos | Regla especial |
|---|---|---|---|---|---|
| 1 | **Club Kairos** | Interiores con neón, pista, mezzanine VIP | Civiles que no se pueden dañar; panel de alarma | Entra, sube al VIP, elimina a Vance, sal por atrás | Cada civil herido baja el rango; matar uno lo limita a C |
| 2 | **Muelle 9** | Patio abierto con contenedores y bodega con pasarelas | Cobertura, tiradores con láser, blindados | Destruye 3 cargamentos y llega al bote | El láser rojo indica que el tirador va a disparar: rompe la línea de visión |
| 3 | **Torre Meridian** | Azoteas a 3 alturas con rampas y escaleras | Verticalidad, francotiradores, jefe con fases y escape cronometrado | Sube, elimina tiradores, vence al Juez y escapa en 45 s | El jefe blindado solo cae con headshots o takedown cuando se arrodilla |
| 4 | **Gauntlet "Excomunicado"** | El vestíbulo en modo hostil | Oleadas infinitas y crecientes | Sobrevive | Récord local (top 10) |

**Gauntlet en detalle** (`missions/gauntlet.ts`, lógica pura con tests):
- Una sola vida (sin marcadores). El hub deja de ser zona neutral: no hay diálogos ni tienda mientras dura.
- Respiro de 5 s antes de cada oleada. Al superar una se recuperan 30 de salud.
- Oleada 1: 3 matones. Cada oleada suma 1,5 enemigos (redondeado hacia abajo), con tope de 10.
- Escoltas desde la oleada 2 (hasta un 70 % de los ligeros), pesados desde la 3 (máx. 3) y tiradores desde la 5 (máx. 2).
- Aparecen de uno en uno cada 0,5 s por las entradas de las oleadas del Excomunicado, nunca a menos de 4 m del jugador ni encima de otro enemigo.
- Al morir se guarda el resultado en el top 10 local (oleadas y, a igualdad, puntos de estilo).

Cada contrato sigue el flujo **briefing** (3 líneas: objetivo, regla especial, rango objetivo) → ejecución → **resultados** con rango D/C/B/A/S y recompensa. Los contratos se desbloquean en orden: el tutorial desbloquea Kairos (y el Gauntlet), Kairos desbloquea Muelle 9 y Muelle 9 desbloquea Torre Meridian.

## 3. Movimiento y cámara (tercera persona, sobre el hombro)

| Acción | Valores |
|---|---|
| Trotar (por defecto) | 4,6 m/s |
| Sprint | 7,0 m/s, FOV +6° |
| Caminar apuntando | 2,6 m/s |
| Agachado | 2,2 m/s, cápsula de 1,14 m |
| Deslizar (C corriendo) | 0,7 s con impulso que decae; termina agachado; enfriamiento 0,5 s |
| Esquiva / voltereta | 0,5 s a 7,6 m/s con **i-frames de 0,05 a 0,36 s**; enfriamiento 0,35 s; en el aire es un "dive" (una vez por salto) |
| Salto | 0,95 m de altura |
| Vault | Con Espacio frente a obstáculos de 0,42 a 1,28 m de alto (a menos de 1 m) y hasta 1,6 m de fondo; si no hay espacio detrás, se sube encima |
| Cobertura | C junto a una pared o caja. Te mueves pegado al borde y no te caes del final; al apuntar sales a disparar. Las balas del frente hacen −50 % de daño |
| Levantarse | Solo si hay espacio sobre la cabeza (si no, sigues agachado: nunca quedas trabado en el techo) |

**Cámara:**
- Pivote en la cabeza, desplazado 0,7 m sobre el hombro (V cambia de hombro).
- Distancia de 3,1 m (2,2 m al apuntar y 3,4 m corriendo). FOV de 68° por defecto (ajustable), un 30 % menos al apuntar.
- La colisión usa *sphere casts* de cabeza → hombro → cámara. Se acerca al instante si algo tapa y se aleja suavemente al despejarse.
- El personaje se oculta si la cámara queda a menos de 0,55 m de la cabeza.

**Gamepad:** stick izquierdo para moverse y derecho para mirar, con zona muerta radial y curva de respuesta.

## 4. Combate gun-fu

### 4.1 Armas (slots 1/2/3, también con rueda o D-pad)
| Arma | Slot | Daño | Headshot | Cadencia | Cargador | Recarga | Notas |
|---|---|---|---|---|---|---|---|
| Carabina TR-4 | 1 | 30 | ×3 | 540 rpm automática | 24 (+96) | 1,9 s | Patrón de recoil fijo y aprendible |
| Escopeta "Sommelier" (se compra) | 1 | 8×14 | ×1,5 | 70 rpm | 6 (+30) | 2,4 s | Corto alcance |
| Pistola P-45 | 2 | 34 | ×3 | Semiautomática | 12 (reserva ∞) | 1,25 s | **Reserva infinita: nunca te quedas sin poder disparar** |
| Cuchillo | 3 | 120 | — | 0,55 s | — | — | Silencioso; por la espalda mata siempre |

- **Hitscan:** rayo desde la cámara por la mira para encontrar el punto apuntado y después rayo desde la boca del arma hasta ese punto. Si una pared tapa el arma, la mira se pone gris con una X ("bloqueado").
- **Spread:** sube al moverte y al disparar seguido, y baja al apuntar o agacharte. La mira muestra el spread real.
- **Recarga perfecta:** durante la recarga aparece una barra con una ventana dorada. Si pulsas R dentro, recargas al instante y ganas un bonus de estilo. Si fallas, la recarga tarda +0,35 s.
- **Takedown (F)** a ≤ 1,8 m mirando al enemigo: agarre → proyección → **doble tap automático** y kill garantizado. Tienes i-frames durante la animación. Funciona incluso contra blindados.
- **Foco (Q):** se llena con estilo. Desde el 30 % activa cámara lenta (×0,35) mientras dura la barra. La mirada sigue a velocidad real, así que tienes más tiempo para apuntar.
- **Integridad del traje:** armadura (60, mejorable) que absorbe primero y se regenera a 20/s tras 4 s sin daño, más salud (100) que no se regenera. Hay botiquines en los niveles y se restaura al reaparecer.
- **Marcadores de sangre:** 3 vidas por contrato (4 con la mejora). Al morir gastas uno y vuelves al último checkpoint. Sin marcadores, el contrato falla.

### 4.2 Enemigos (color e icono propios, rim light del mismo color)
| Tipo | Color | Arma | Salud | Comportamiento | Telégrafo |
|---|---|---|---|---|---|
| Matón | Naranja | Pistola, 8 de daño | 80 | Avanza y dispara | Fogonazo previo y sonido de amartillar |
| Escolta | Amarillo | SMG en ráfagas, 5 de daño | 90 | **Flanquea** | Grito "¡Por la izquierda!" e icono de flecha |
| Tirador | Rojo | Rifle, 35 de daño | 70 | Fijo en altura, cubre zonas | **Láser rojo visible 1,2 s** con pitido creciente antes del disparo |
| Blindado | Azul acero | Escopeta, 4×6 de daño | 120 + 150 de armadura | Avanza lento; el cuerpo recibe solo el 20 % del daño | Levanta el arma y parpadea en rojo 0,6 s |
| Jefe | Magenta | SMG en ráfagas | 420 + 120 de armadura | Fases: al 50 % y al 20 % se arrodilla e invoca escoltas | El rim se enciende antes de cada ráfaga |

Un headshot mata de un tiro a matón, escolta y tirador. Esa regla es simple y premia la precisión.

**IA:** máquina de estados *patrulla → sospecha → combate → cobertura → flanqueo → búsqueda* (más aturdido y muerto).
- **Percepción:** cono de 110° y 25 m con línea de visión. Agacharte reduce el alcance un 40 %. Los disparos se oyen a 30 m (8 m con silenciador).
- **Medidor de detección** visible sobre la cabeza: "?" amarillo que se llena y pasa a "!" rojo.
- **Tiempo de reacción** de 0,5 a 0,8 s antes del primer disparo. La puntería empieza al 40 % y sube durante 2 s de visión continua. Si ruedas, falla.
- **Navegación:** A* sobre la grilla del nivel. Si un enemigo avanza menos de 0,25 m en 1 s, replanifica; a los 3 atascos cambia de meta táctica.

### 4.3 Civiles
- Tienen rim verde azulado y no llevan armas. Sobre un civil la mira cambia a "NO DISPARAR".
- Al oír disparos huyen hacia las salidas o se agachan.
- No bloquean al jugador: se apartan, así que nunca te atascan en una puerta.

## 5. Sistema de estilo (gamificación central)

**Style Meter ×1 → ×8**: cada acción suma puntos al medidor. Al llenarse sube el multiplicador.

| Acción | Base |
|---|---|
| Kill | 100 |
| Headshot | 150 |
| Takedown (incluye doble tap) | 250 |
| Recarga perfecta | 80 |
| Kill tras esquiva (≤ 1 s) | 200 |
| Doble tap (2 impactos al mismo enemigo en ≤ 0,35 s) | 120 |
| Kill desde cobertura | 120 |
| Kill sin recibir daño (10 s) | 100 |
| Kill con cuchillo | 200 |
| Kill en Foco | 80 |
| Multi-kill (2 en ≤ 1,5 s) | 150 |
| Tiro largo (> 30 m) | 100 |

- **Variedad:** repetir una acción que está entre las 3 últimas rinde ×0,5, y si aparece 2 veces o más, ×0,25. Spamear no sube el medidor.
- **Decaimiento:** sin acciones durante 2,5 s el medidor baja. Recibir daño le resta 0,35 y puede bajar un nivel.
- **Rangos de estilo en pantalla:**

| Multiplicador | ×1 | ×2 | ×3 | ×4 | ×5 | ×6 | ×7 | ×8 |
|---|---|---|---|---|---|---|---|---|
| Nombre | Discreto | Preciso | Letal | Implacable | Despiadado | Mítico | Baba Yaga | Leyenda |

### 5.1 Rango del contrato (D–S)
Hay cinco subnotas de 0 a 100: **tiempo** (frente al par), **precisión** (impactos/disparos; solo takedowns = 100), **daño recibido**, **variedad** (tipos distintos de acción de estilo, con 6 o más = 100) y **civiles ilesos**. Pesan lo mismo; si el nivel no tiene civiles, el peso se reparte.

- Bonus de estilo de hasta +10, y −15 por cada marcador gastado.
- Umbrales: **S ≥ 88, A ≥ 74, B ≥ 58, C ≥ 40, D < 40**.
- Matar a un civil limita el rango a C.

### 5.2 Economía: Monedas Continental
- Fondos iniciales: 8 monedas (cortesía del Continental), para que la armería tenga sentido antes del primer contrato. El simulacro del campo de práctica da 2 monedas la primera vez.
- Recompensa base: Kairos 6, Muelle 9 8, Torre Meridian 10.
- Multiplicador por rango: S ×2, A ×1,5, B ×1,25, C ×1, D ×0,75. La primera vez suma +3.
- En el Gauntlet: 1 moneda por cada 2 oleadas.
- **Armería del Sommelier:**

| Mejora | Precio | Efecto |
|---|---|---|
| Cargador extendido | 5 | Carabina +8, pistola +4 |
| Silenciador | 6 | La pistola solo alerta a 8 m |
| Punta hueca | 7 | +15 % de daño |
| Compensador | 5 | −35 % de recoil |
| Traje balístico I / II / III | 4 / 7 / 10 | +20 de armadura cada uno |
| Cuchillo táctico | 4 | Alcance 2,2 m y golpe 0,4 s |
| Escopeta "Sommelier" | 8 | Nueva arma primaria |
| Marcador adicional | 12 | 4 vidas por contrato |

### 5.3 Logros y desafíos (dan monedas una vez)
- **Kairos:** "Nadie más" (ningún civil herido), "Fantasma" (sin alarma), "Gun-fu" (3 takedowns).
- **Muelle 9:** "Demolición" (menos de 4 min), "Filo" (5 kills con cuchillo), "Intocable" (la salud nunca baja de 100).
- **Torre Meridian:** "Cazatiradores" (todos los tiradores con headshot), "Puntual" (escapa con más de 20 s), "Economía de movimiento" (máximo 2 recargas).
- **Gauntlet:** "Oleada 5", "Oleada 10", "×8".
- **Globales:** "Primer contrato", "Rango S", "Excomunicado", "Coleccionista" (5 mejoras).

## 6. Claridad y onboarding

- **Título:** Continuar / Nueva partida / Controles / Ajustes.
- **Tutorial jugable (unos 3 min) en el Campo de Práctica.** Cada paso se valida con lo que hace el jugador y el texto muestra la tecla asignada real. Se puede saltar desde el briefing, y el rango del contrato solo cuenta el simulacro posterior:
  1. Caminar y mirar.
  2. Correr.
  3. Vault sobre la caja.
  4. Deslizarse.
  5. Esquivar.
  6. Cubrirse tras el muro alto.
  7. Apuntar y disparar en los carriles.
  8. Recargar (con la recarga perfecta explicada).
  9. Cambiar de arma.
  10. Activar el Foco.
  11. Takedown a un maniquí aturdido.
  12. Bajar al patio y eliminar a los 6 maniquíes armados.
- **HUD siempre legible:**
  - Objetivo arriba y baliza dorada en el mundo con la distancia (flecha en el borde si está fuera de pantalla).
  - Abajo a la izquierda: integridad (armadura y salud) y marcadores.
  - Abajo a la derecha: arma, munición y slots.
  - Arriba a la derecha: zona, Style Meter y feed de acciones. A la izquierda: barra de Foco.
  - En el centro: mira dinámica, hit markers distintos para cuerpo, cabeza y baja, e indicadores direccionales de daño.
- **Avisos contextuales** solo cuando aplican: "[E] Hablar con Charon", "[F] Takedown", "[C] Cubrirse".
- **Causa de muerte**, por ejemplo: "Te disparó un Tirador desde tu derecha (24 m)", con los marcadores restantes.
- **Pausa:** Reanudar, Controles, Ajustes, Volver al Continental (fuera del hub) y Salir al título. H muestra los controles en cualquier momento y, manteniendo Tab, la Intel (objetivo, marcadores, reglas del contrato y leyenda de enemigos).
- **Accesibilidad:**
  - Escala de UI, sensibilidad (ratón y mando), invertir Y y FOV.
  - Brillo, sacudida de cámara regulable (desactivada si el sistema pide movimiento reducido) y apuntar en modo mantener o alternar.
  - Reasignación de teclas, menús navegables con teclado y textos con alto contraste.
  - Los tipos de enemigo se distinguen por color **e** icono.

## 7. Controles por defecto (reasignables)

| Acción | Teclado/Mouse | Gamepad |
|---|---|---|
| Mover / Mirar | WASD / Mouse | Stick izq. / der. |
| Disparar / Apuntar | Clic izq. / Clic der. | RT / LT |
| Recargar | R | X |
| Takedown / Melee | F | B |
| Interactuar | E | A |
| Sprint | Shift | L3 |
| Agacharse / Deslizar / Cubrirse | C | Y |
| Saltar / Vault | Espacio | A (en combate) |
| Esquiva / Voltereta | Doble Espacio o Alt | RB |
| Foco | Q | LB |
| Cambiar arma | 1 / 2 / 3 o rueda | D-pad |
| Cambiar hombro | V | R3 |
| Contratos / Intel | Tab | Select |
| Pausa / Controles | Esc / H | Start |
| Debug | F3 | — |

> Ctrl no se asigna por defecto porque `Ctrl+W` cierra la pestaña del navegador (ver [ARQUITECTURA.md](ARQUITECTURA.md#6-controles-decisiones)).

## 8. Dirección visual

- **Paleta:** negro y grafito (`#121418`), oro Continental (`#d4af37`), magenta (`#ff2e88`) y cian (`#19e3ff`) neón; rojo alarma (`#ff3344`) solo para peligro.
- **Noir por contraste, no por oscuridad:**
  - Piso de luz ambiental en todos los niveles y suelos y paredes de valores medios.
  - Neón emisivo y cobertura con bordes claros.
- **Personajes low-poly propios.** El Huésped lleva traje carbón con camisa negra y silueta de cabello largo; **no se parece a ningún actor**.
- **Lluvia, humo y reflejos** solo como acento.
