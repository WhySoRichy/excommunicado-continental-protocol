# Visión

Qué queremos que sea este juego, qué no va a ser nunca y cómo va a crecer sin depender del dinero. Recoge las decisiones del 22 de noviembre de 2026 y solo cambia de forma explícita (el mismo día, el pulido de mecánicas y gráficos pasó por delante de las skins). El plan técnico de cada paso está en [ESCALABILIDAD.md](ESCALABILIDAD.md) y el trabajo concreto, en [ROADMAP.md](ROADMAP.md).

## Qué queremos

Un shooter en tercera persona de acción coreografiada, gratis para jugar, hecho por gusto y pensado para durar. Que se pague solo: los ingresos sirven para mantenerlo y mejorarlo, no al revés. El núcleo es el cooperativo (contratos y Gauntlet entre varios); más adelante llegará un modo PvP de arena.

## Compromisos con quien juega

- **Nada de pagar por ventaja.** Gana la habilidad.
- **Skins serias.** Acabados de armas y accesorios tácticos (capuchas, visores, guantes) que solo se ven. No cambian el cuerpo con el que se recibe un disparo ni hacen al personaje más difícil de ver, y no rompen el tono del juego.
- **Todo lo cosmético se puede conseguir jugando.** Pagar solo acorta el camino.
- **Sin mercados ni especulación** con los objetos.
- **Si algún día hay pase de temporada,** tiene que valer lo que cuesta.
- **Apoyo voluntario** (Patreon o Buy Me a Coffee) para quien quiera ayudar, con un agradecimiento visible que no dé ventaja.

## Identidad propia

El juego nació como homenaje a John Wick. Para poder crecer, y algún día cobrar, tendrá un universo propio: otro asesino que también se la jugó a una alta mesa, con su hotel, sus reglas y sus personajes, en el mismo tono neo-noir. Parecido en espíritu y nunca una copia: sin los nombres, personajes, lugares ni símbolos de la saga.

La identidad se construye con calma (guion, diseño e iteración) y tiene que estar lista antes de abrir el juego al público con su Discord y su página propia.

## Plataformas e idioma

- PC con teclado y ratón (y mando), en el navegador. Más adelante, un cliente de escritorio para Steam.
- Español primero. El inglés llega cuando haya comunidad, sobre el catálogo de textos (`src/text/`).

## Multijugador

- **Ahora:** cooperativo con amigos, por código o desde otra pestaña.
- **Siguiente:** salas públicas para unirse a desconocidos con un clic, y un relé para las redes que no permiten la conexión directa.
- **PvP:** primero en salas privadas entre amigos, con la red actual y sin ranking (en ella manda el anfitrión, que podría hacer trampas). El ranking y el competitivo con desconocidos llegan con servidores dedicados con autoridad.
- **Emparejamiento automático:** cuando haya gente suficiente jugando a la vez.

## Infraestructura por etapas

No se paga por adelantado: cada etapa empieza cuando la anterior se queda corta.

| Etapa | Cuándo | Coste | Qué incluye |
|---|---|---|---|
| 0 | Hoy | 0 | El juego en GitHub Pages; cooperativo entre equipos (WebRTC) con la señalización en códigos |
| 1 | Siguiente bloque | 0 | Un servicio de salas en el plan gratuito de Cloudflare (Workers y Durable Objects): lista de salas públicas, unirse con un clic y señalización automática. Relé TURN y STUN de Cloudflare para las redes cerradas |
| 2 | Unos 20 jugadores al día | Un dominio, del orden de 10 a 15 USD al año | Dominio propio; el juego pasa a Cloudflare Pages (GitHub Pages no admite negocios); Discord; cuentas con inicio de sesión de Discord o Google en un plan gratuito; progreso y skins guardados en el servidor; página de apoyo |
| 3 | Con ingresos que lo cubran | Según los jugadores | Servidores dedicados para el PvP con ranking, pago de skins y cliente de escritorio |

Lo que hace posible esta escalera sin reescribir el juego es que la simulación ya corre sin pantalla (fases 1 a 3 de ESCALABILIDAD.md): un servidor dedicado es el mismo anfitrión de hoy, ejecutándose en Node con otro transporte.

Datos de los planes gratuitos comprobados en noviembre de 2026, que se revisan antes de cada etapa:
- GitHub Pages: 100 GB de tráfico al mes (límite blando) y 1 GB de sitio. El juego descarga unos 2 MB comprimidos en la primera visita: caben del orden de 50.000 visitas nuevas al mes.
- Cloudflare Workers gratis: 100.000 peticiones al día, con Durable Objects (almacenamiento SQLite) desde abril de 2025.
- Relé TURN de Cloudflare: 1.000 GB al mes gratis. Su STUN es gratuito.

## Seguridad y privacidad

- **No fiarse del cliente.** El anfitrión, y mañana el servidor, comprueba lo que llega. Lo que se pueda ganar o comprar no se guarda solo en el navegador en cuanto tenga valor.
- **Datos mínimos.** Ni nombres reales ni correos más allá de lo que traiga el inicio de sesión, y una política de privacidad antes de la primera cuenta.
- **Sin contraseñas propias:** las cuentas entran con Discord o Google.

## Orden de trabajo

1. **Cooperativo jugable con gente:** salas públicas, relé para redes cerradas, que los invitados usen los objetos de la misión y volver a entrar tras un corte. Hecho; su servicio de salas está en `server/salas`.
2. **Pulir mecánicas y gráficos:** que todo se sienta tan pulido como el deslizamiento (la cobertura, primero), gráficos más realistas en un estilo propio (referente: Valorant), armas y personajes con detalle, enemigos que se distingan y se comporten mejor, y mapas más grandes. El detalle está en [ROADMAP.md](ROADMAP.md).
3. **Skins y progresión:** acabados de armas y accesorios tácticos que se ganan jugando, guardados en el navegador y preparados para pasar a cuentas. Van después del bloque 2, cuando los gráficos les den sentido.
4. **Identidad propia:** nombre, protagonista, hotel, reglas y personajes. Antes de abrir el juego al público.
5. **PvP de arena** en salas privadas.
6. **Inglés.**
