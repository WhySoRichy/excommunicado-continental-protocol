# Diseño del juego

**EXCOMMUNICADO: CONTINENTAL PROTOCOL** es un juego de acción en tercera persona para el navegador. Inspirado en el universo de John Wick. Modelos y música son propios y procedurales; las superficies de los escenarios usan texturas fotoescaneadas libres (CC0, ver [CREDITOS.md](CREDITOS.md)).

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
- Escoltas desde la oleada 2 (hasta un 70 % de los ligeros), pesados desde la 3 (máx. 3), sabuesos desde la 4 (máx. 2), tiradores desde la 5 (máx. 2), antidisturbios desde la 5 (máx. 2) y drones desde la 6 (máx. 2), siempre con al menos dos ligeros.
- Aparecen de uno en uno cada 0,5 s por las entradas de las oleadas del Excomunicado, nunca a menos de 4 m del jugador ni encima de otro enemigo.
- Al morir se guarda el resultado en el top 10 local (oleadas y, a igualdad, puntos de estilo).

Cada contrato sigue el flujo **briefing** (3 líneas: objetivo, regla especial, rango objetivo; y el equipo que se lleva, que se puede cambiar ahí mismo) → ejecución → **resultados** con rango D/C/B/A/S y recompensa. Los contratos se desbloquean en orden: el tutorial desbloquea Kairos (y el Gauntlet), Kairos desbloquea Muelle 9 y Muelle 9 desbloquea Torre Meridian.

### 2.4 Cooperativo (hasta cuatro jugadores)
- Uno abre la sala desde el título (Cooperativo → Crear partida) y elige la arena o un contrato que tenga desbloqueado. La sala tiene un código de cinco letras: los demás entran escribiéndolo, desde «Buscar partida» si la sala es pública (lo es salvo que el anfitrión diga lo contrario) o, en el mismo equipo, desde otra pestaña. Si el servicio de salas no responde, queda la invitación manual: el anfitrión crea una invitación, el invitado devuelve una respuesta y el anfitrión la pega.
- Los objetos de la misión (paneles, cargas, terminales) los puede usar cualquiera; hablar con los personajes del hotel, solo el anfitrión.
- Quien se corta sin salir vuelve solo a su plaza durante un minuto, con su salud, su munición y su estilo.
- Se juega sin briefing ni tutorial y la partida no se detiene: la pausa es un menú y el personaje se queda donde está.
- Cada caída gasta un marcador de sangre del equipo y se reaparece sola a los 5 s en el último punto de control; sin marcadores, el contrato falla para todos. En el Gauntlet, que tiene una sola vida, la primera caída termina la partida.
- Sin Foco ni pausas de impacto: la cámara lenta sería para todos.
- Los objetivos de alcanzar una zona los cumple cualquiera. El rango y los récords son del anfitrión; cada invitado cobra las monedas del contrato en su propia partida.
- Los aliados llevan su nombre encima y el panel del equipo muestra la salud de cada uno y, al invitado, su latencia.

## 3. Movimiento y cámara (tercera persona, sobre el hombro)

| Acción | Valores |
|---|---|
| Trotar (por defecto) | 4,6 m/s |
| Sprint | 7,0 m/s, FOV +6° |
| Caminar apuntando | 2,6 m/s |
| Agachado | 2,2 m/s, cápsula de 1,14 m. El cuerpo se encoge (cadera baja, torso inclinado) para caber en ella: lo que se ve es lo que puede recibir un disparo |
| Deslizar (C corriendo) | 0,7 s con impulso que decae; termina agachado; enfriamiento 0,5 s |
| Esquiva / voltereta | 0,5 s a 7,6 m/s con **i-frames de 0,05 a 0,36 s**; enfriamiento 0,35 s; en el aire es un "dive" (una vez por salto) |
| Salto | 0,95 m de altura |
| Vault | Con Espacio frente a obstáculos de 0,42 a 1,28 m de alto (a menos de 1 m) y hasta 1,6 m de fondo; si no hay espacio detrás, se sube encima |
| Cobertura | Ver «Cobertura», debajo |
| Levantarse | Solo si hay espacio sobre la cabeza (si no, sigues agachado: nunca quedas trabado en el techo) |

**Cobertura** (`src/entities/PlayerController.ts`; las consultas al escenario, en `coverSensor.ts`):
- **Entrar.** C pulsada busca la pared más cercana hacia donde andas o miras, a menos de 1,6 m y en un abanico de ±25°, y da el paso hasta ella. Mantener C 0,2 s corre hasta la cobertura que miras, a menos de 9 m (6,2 m/s, frenando justo antes): con una a la vista, un toque de C sigue siendo agacharse. Deslizarte contra una pared que cubre también te deja a cubierto. Al llegar corriendo, el cuerpo se apoya en la pared con un golpe que suena según su material.
- **Dónde.** La pared tiene que medir al menos 0,85 m, tener sitio delante y suelo a la misma altura y, si está lejos, nada en medio a la altura de la rodilla. Si apuntas cerca de su final, te colocas 0,3 m hacia dentro para que te cubra entero.
- **Marca.** Un trazo al pie de la pared y dos verticales (más altas en la alta) señalan adónde irías. Siempre en la cercana y a cubierto; la que miras, solo en combate.
- **Moverse.** Pegado a ella a 2,1 m/s, sin caerte del final. En un rincón pasas a la pared de al lado sin soltarte, y si mantienes la dirección contra el borde de una esquina exterior (0,22 s), la rodeas por un arco hasta la cara lateral. Los cantos de los muros finos (menos de 0,85 m de fondo) no se rodean. Tras doblar una esquina sigues en la misma dirección mientras no cambies de tecla, aunque la cámara no haya girado.
- **De una a otra.** A cubierto, mira otra cobertura y mantén C: corres hasta ella. Un toque de C sale de la cobertura, igual que echarse atrás o esprintar hacia un lado (esprintar contra la pared no te suelta).
- **Disparar.** En una baja, al apuntar te incorporas por encima. En una alta se apunta desde un borde: sales de lado lo justo para despejar la esquina (0,55 m por la derecha y 0,75 m por la izquierda, porque el arma va en la mano derecha), quedas expuesto y al soltar vuelves a la pared; si apuntas a menos de 1,3 m de un borde, vas solo hasta él. **A ciegas:** disparar sin apuntar saca el arma por encima de la baja o por el borde de la alta sin asomar el cuerpo, con casi el triple de dispersión.
- Las balas del frente hacen −50 % de daño. Las coberturas bajas miden al menos 1,2 m: tapan a alguien agachado.

**Cámara:**
- Pivote en la cabeza, desplazado 0,7 m sobre el hombro. V cambia de hombro. En el borde de una cobertura alta la cámara pasa sola al hombro de ese lado y se abre 0,32 m más para enseñar lo que hay tras la esquina.
- Distancia de 3,1 m (2,7 m al apuntar y 3,4 m corriendo). FOV de 68° por defecto (ajustable), un 22 % menos al apuntar (el rifle de tirador tiene más aumento).
- La colisión usa *sphere casts* de cabeza → hombro → cámara. Se acerca al instante si algo tapa y se aleja suavemente al despejarse.
- El personaje se oculta si la cámara queda a menos de 0,55 m de la cabeza.

**Gamepad:** stick izquierdo para moverse y derecho para mirar, con zona muerta radial y curva de respuesta.

## 4. Combate gun-fu

### 4.1 Armas e inventario
| Arma | Hueco | Daño | Headshot | Cadencia | Cargador | Recarga | Notas |
|---|---|---|---|---|---|---|---|
| Carabina TR-4 | Principal | 30 | ×3 | 540 rpm automática | 24 (+96) | 1,9 s | Patrón de recoil fijo y aprendible |
| Escopeta "Sommelier" (se compra) | Principal | 8×14 | ×1,5 | 70 rpm | 6 (+30) | 2,4 s | Corto alcance |
| Rifle de tirador "Meridian" (se compra) | Principal | 75 | ×2,5 | Semiautomático, 150 rpm | 10 (+40) | 2,3 s | Mira de aumento al apuntar; poco preciso sin apuntar |
| Pistola P-45 | Secundaria | 34 | ×3 | Semiautomática | 12 (reserva ∞) | 1,25 s | **Reserva infinita: nunca te quedas sin poder disparar** |
| Revólver "Juez" (se compra) | Secundaria | 70 | ×3 | Semiautomático, 120 rpm | 6 (reserva ∞) | 2,1 s | Mucho retroceso y ruido; el cargador extendido no le afecta |
| Cuchillo | Cuerpo a cuerpo | 120 | — | 0,55 s | — | — | Silencioso; por la espalda mata siempre |

- **Inventario y equipo.** Se guardan todas las armas que se consiguen, pero al contrato se llevan cuatro piezas, una por hueco: **principal** (fusiles, escopetas y tirador compiten por él), **secundaria** (armas cortas), **cuerpo a cuerpo** y **equipo** (lo que se lanza). Se elige en la armería del Sommelier, donde cada pieza se ve girar en 3D con sus barras de daño, cadencia, alcance, precisión y cargador, y lo comprado se equipa solo; también en el briefing y, en cooperativo, en la sala (cada jugador el suyo). La elección se guarda.
- **Cada tecla, un hueco:** 1 la principal, 2 la secundaria, 3 la de cuerpo a cuerpo (también rueda o D-pad) y G el equipo. La munición que sueltan los enemigos sirve para todas las armas de reserva limitada.
- **Hitscan:** rayo desde la cámara por la mira para encontrar el punto apuntado y después rayo desde la boca del arma hasta ese punto. Si una pared tapa el arma, la mira se pone gris con una X ("bloqueado").
- **Spread:** sube al moverte y al disparar seguido, y baja al apuntar o agacharte. La mira muestra el spread real.
- **Postura con armas largas** (carabina, escopeta, rifle y subfusil): de perfil, con el hombro izquierdo hacia el objetivo. Al apuntar, la culata va al hombro y el cañón sigue exactamente la línea de mira, sin ladearse; al esprintar, cruzada y con el cuerpo de frente. Los enemigos usan la misma postura.
- **Recarga perfecta:** durante la recarga aparece una barra con una ventana dorada. Si pulsas R dentro, recargas al instante y ganas un bonus de estilo. Si fallas, la recarga tarda +0,35 s.
- **Aturdidora (G).** Equipo: dos por contrato, se reponen al reaparecer y una por oleada superada en el Gauntlet.
  - **Lanzarla.** Un toque la lanza. Manteniendo la tecla, el brazo espera armado y se ve el arco con el mismo vuelo que hará la granada (rebotes incluidos) y un anillo donde estallará; al soltar, vuela. Antes de soltarla se guarda recargando (sin recargar), cambiando de arma, rodando o con un takedown. Se puede lanzar corriendo, en el aire, deslizándose y a cubierto: por encima de la cobertura baja o tras el borde de la alta. Con la granada en la mano no se dispara.
  - **Vuelo.** 14,5 m/s, 0,27 rad por encima de la mirada: mirando de frente cae a unos 12 m; hacia arriba, más lejos. Rebota, rueda y estalla a los 1,6 s de salir de la mano.
  - **Efecto.** Aturde a los enemigos a menos de 9 m que ven el destello: 4,6 s pegados a ella y 2,4 s en el borde; un 40 % menos si les pilla de espaldas, y otro 40 % menos al blindado. Se tambalean con la mano en la cara, no disparan y admiten takedown. Se les pasa solo: quien peleaba vuelve a pelear, tardando en apuntar; quien no sabía de nadie registra la zona. Al jefe no lo aturde: solo le corta el disparo que preparaba. Quien la oye sin verla (26 m) acude, y los civiles huyen.
  - **En pantalla.** Si estalla cerca y la miras, te deslumbra un instante y te pitan los oídos, sin quitarte el control ni taparte la pantalla del todo (se regula en Ajustes).
- **Takedown (F)** a ≤ 1,8 m mirando al enemigo: agarre → proyección → **doble tap automático** y kill garantizado. Tienes i-frames durante la animación. Funciona incluso contra blindados.
- **Foco (Q):** se llena con estilo. Desde el 30 % activa cámara lenta (×0,35) mientras dura la barra. La mirada sigue a velocidad real, así que tienes más tiempo para apuntar.
- **Integridad del traje:** armadura (60, mejorable) que absorbe primero y se regenera a 20/s tras 4 s sin daño, más salud (100) que no se regenera. Hay botiquines en los niveles y se restaura al reaparecer.
- **Marcadores de sangre:** 3 vidas por contrato (4 con la mejora). Al morir gastas uno y vuelves al último checkpoint: los enemigos que sigan vivos recuperan la salud y el jefe empieza su combate de nuevo, con sus fases y sus refuerzos. Sin marcadores, el contrato falla.

### 4.2 Enemigos (color e icono propios, rim light del mismo color)
| Tipo | Color | Arma | Salud | Comportamiento | Telégrafo |
|---|---|---|---|---|---|
| Matón | Naranja | Pistola, 8 de daño | 80 | Avanza y dispara | Fogonazo previo y sonido de amartillar |
| Escolta | Amarillo | SMG en ráfagas, 5 de daño | 90 | **Rodea** el primero cuando la escuadra lo manda | Voz de aviso e icono de flechas mientras rodea |
| Tirador | Rojo | Rifle de tirador con mira, 35 de daño | 70 | Fijo en altura, cubre zonas | **Láser rojo visible 1,2 s** con pitido creciente antes del disparo |
| Blindado | Azul acero | Escopeta táctica, 4×6 de daño | 120 + 150 de armadura | Avanza lento; el cuerpo recibe solo el 20 % del daño | Levanta el arma y parpadea en rojo 0,6 s |
| Jefe | Magenta | Revólver en ráfagas | 420 + 120 de armadura | Fases: al 50 % y al 20 % se arrodilla e invoca escoltas | El rim se enciende antes de cada ráfaga |
| Antidisturbios | Lima | Pistola, 9 de daño | 100 + escudo de 520 | Avanza despacio detrás de un **escudo balístico** | Su silueta: el escudo con la franja lima |
| Sabueso | Violeta | Mordisco, 22 de daño | 75 | Máquina cuadrúpeda: corre, **salta** y retrocede | Se agazapa 0,5 s, brilla en rojo y pita antes de saltar |
| Dron | Blanco | Ráfagas de 6, 4 de daño | 55 | **Vuela** a 2,7 m y cambia de sitio | Brilla en rojo y pita 0,8 s antes de cada ráfaga |

- **El escudo** para de frente todo lo que va del cuello a las espinillas, también el cuchillo y el takedown. Quedan al aire la cabeza (asoma por arriba), los pies, los lados y la espalda. Con 170 de daño seguidos se le baja un segundo, y con 520 se rompe; aturdido, descolocado o de guardia no lo sostiene.
- **Las máquinas** no tienen cabeza ni piernas a las que apuntar, sueltan chispas y no admiten takedown. El salto del sabueso va recto hacia donde estabas: rodar lo esquiva y, al caer, tarda casi un segundo en volver a atacar. El dron baja bajo techo, y una aturdidora lo tira al suelo. El perro es un robot a propósito: en este universo no se dispara a un perro.

Un headshot mata de un tiro a matón, escolta y tirador. Esa regla es simple y premia la precisión.

**IA:** máquina de estados *patrulla → sospecha → combate → cobertura → flanqueo → búsqueda* (más aturdido y muerto).
- **Percepción:** cono de 110° y 25 m con línea de visión. Agacharte reduce el alcance un 40 %. Los disparos se oyen a 30 m (8 m con silenciador).
- **Medidor de detección** visible sobre la cabeza: "?" amarillo que se llena y pasa a "!" rojo.
- **Escuadra** (`entities/ai/squad.ts`): los que pelean con un mismo jugador se reparten el trabajo. Solo unos pocos tienen turno de disparo a la vez (tres, y uno más por cada dos de más, hasta seis); el resto se cubre o se mueve, y el turno va pasando. Con tres o más, uno **rodea** por el lado en el que ya está, lo avisa, y los demás lo cubren disparando hacia donde vieron al jugador. Quien avisa antes de disparar (láser, alzar el arma) no gasta turno.
- **Coberturas:** se esconden de verdad y se asoman para disparar: por encima de las bajas, por el lado de las altas. Antes de elegir una se comprueba con rayos que tape a quien se esconde y que deje disparar a quien se asoma. Si el jugador los ve escondidos, la cambian.
- **Cargadores:** cada arma tiene el suyo. Recargando no disparan, y se esconden o al menos se agachan: es el momento de moverse.
- **Fuego encima:** un disparo que les pasa a menos de 1,5 m los pone nerviosos: apuntan peor y, si siguen cayendo, no se asoman.
- **Granadas y cuerpos:** quien ve caer una aturdidora cerca se aparta, si le da tiempo (por eso conviene lanzarla por encima de una cobertura). Una patrulla que encuentra a un compañero caído registra la zona.
- **Búsqueda:** al perder al jugador registran varios sitios alrededor de donde lo vieron antes de volver a su ronda.
- **Tiempo de reacción** de 0,5 a 0,8 s antes del primer disparo. La puntería empieza al 40 % y sube durante 2 s de visión continua. Si ruedas, falla.
- **Navegación:** A* sobre la grilla del nivel. Si un enemigo avanza menos de 0,25 m en 1 s, replanifica; a los 3 atascos cambia de meta táctica.

**Reacciones a los impactos** (`combat/hitReaction.ts`): cada parte se mueve y pierde lo suyo. En la cabeza o con varios impactos seguidos (su *aguante*) se descolocan y dan unos pasos atrás sin poder disparar; en un brazo bajan el arma casi un segundo; en una pierna cojean a la mitad de velocidad y, si el golpe es fuerte, tropiezan. El blindado y el Juez aguantan mucho más. Y caen según cómo mueren: de bruces por la espalda, de espaldas o de rodillas de frente, en seco de un tiro en la cabeza, desplomados de lado y despedidos hacia atrás por un escopetazo a quemarropa.

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
| Aturdir a uno o más enemigos con una granada | 60 |
| Kill a un enemigo aturdido por un destello | 130 |

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
| Cargador extendido | 5 | Carabina +8; rifle de tirador y pistola +4 |
| Silenciador | 6 | La pistola solo alerta a 8 m |
| Punta hueca | 7 | +15 % de daño |
| Compensador | 5 | −35 % de recoil |
| Traje balístico I / II / III | 4 / 7 / 10 | +20 de armadura cada uno |
| Cuchillo táctico | 4 | Alcance 2,2 m y golpe 0,4 s |
| Escopeta "Sommelier" | 8 | Arma principal, demoledora de cerca |
| Revólver "Juez" | 9 | Arma secundaria de seis tiros con mucho daño |
| Rifle de tirador "Meridian" | 11 | Arma principal de largo alcance con mira de aumento |
| Granadas aturdidoras | 6 | Equipo: dos por contrato |
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
  6. Correr a cubrirse tras el muro alto (mantener C mirándolo).
  7. Cambiar la cámara de hombro.
  8. Apuntar y disparar en los carriles.
  9. Recargar (con la recarga perfecta explicada).
  10. Cambiar de arma.
  11. Activar el Foco.
  12. Takedown a un maniquí aturdido.
  13. Bajar al patio y eliminar a los 6 maniquíes armados.
- **HUD siempre legible:**
  - Objetivo arriba y baliza dorada en el mundo con la distancia (flecha en el borde si está fuera de pantalla).
  - Abajo a la izquierda: integridad (armadura y salud) y marcadores.
  - Abajo a la derecha: arma, munición, huecos y el equipo con cuántos quedan.
  - Arriba a la derecha: zona, Style Meter y feed de acciones. A la izquierda: barra de Foco.
  - En el centro: mira dinámica, hit markers distintos para cuerpo, cabeza y baja, e indicadores direccionales de daño.
- **Avisos contextuales** solo cuando aplican: "[E] Hablar con Charon", "[F] Takedown", "[C] Cubrirse", "[Mantén C] Correr a cubierto (6 m)" en combate, y a cubierto lo que se puede hacer desde ella.
- **Causa de muerte**, por ejemplo: "Te disparó un Tirador desde tu derecha (24 m)", con los marcadores restantes.
- **Pausa:** Reanudar, Controles, Ajustes, Volver al Continental (fuera del hub) y Salir al título. H muestra los controles en cualquier momento y, manteniendo Tab, la Intel (objetivo, marcadores, reglas del contrato y leyenda de enemigos).
- **Accesibilidad:**
  - Escala de UI, sensibilidad (ratón y mando), invertir Y y FOV.
  - Brillo, sacudida de cámara y destellos en pantalla regulables (sin sacudida y con destellos suaves si el sistema pide movimiento reducido) y apuntar en modo mantener o alternar.
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
| Cambiar arma | 1 / 2 / 3 o rueda | D-pad ↑ / → / ↓ |
| Lanzar equipo (mantener: ver el arco) | G | D-pad ← |
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
- **Personajes con volumen:** cuerpos de superficies suaves generados por código, con manos de cinco dedos, rostro modelado (cuencas, pómulos, labios, nariz, ojos con iris), ropa con arrugas y cada material con su brillo (tela, cuero, seda, piel, pelo, metal). Rostros propios: no se busca el parecido con nadie.
  - El Huésped: traje negro de tres piezas con camisa y corbata negras, media melena con raya al medio y barba corta.
  - **Cada enemigo se reconoce de lejos por su silueta**, además de por su color e icono: el matón, cazadora acolchada, vaqueros y cabeza rapada; el escolta, traje con portaplacas, gafas de sol, auricular y pistolera; el tirador, abrigo largo con capucha, cuello tapado y visor de dos lentes; el blindado, placas de los hombros a las espinillas, gola y casco con pantalla; el Juez, abrigo blanco hasta la rodilla, guantes negros y pelo engominado.
  - El Sommelier trabaja sin chaqueta: camisa blanca, chaleco burdeos, pajarita, delantal largo, catavinos de plata y bigote encerado. Charon y Winston llevan terno. Los civiles, chaquetas y cazadoras de colores vivos.
- **Armas reconocibles por la silueta:** pistola con compensador, carabina con visor y empuñadura delantera, subfusil de culata plegable, escopeta de corredera con madera y cartuchos al costado, y cuchillo táctico. Los enemigos llevan además un rifle de tirador con mira y bípode, una escopeta táctica y, el Juez, un revólver. El color de cada tipo de enemigo marca un detalle de su arma.
- **Proyectiles:** las trazadoras viajan como balas desde la boca del arma hasta el impacto, el fogonazo tiene forma de estrella y los casquillos de latón rebotan en el suelo.
- **Lluvia, humo y reflejos** solo como acento.
