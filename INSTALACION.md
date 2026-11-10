# Guía de instalación y ejecución

Esta guía explica, paso a paso, cómo jugar a **EXCOMMUNICADO: CONTINENTAL PROTOCOL** en tu propio computador a partir del repositorio. No hace falta saber programar: basta con copiar los comandos tal cual.

## Índice

1. [Jugar sin instalar nada](#1-jugar-sin-instalar-nada)
2. [Requisitos](#2-requisitos)
3. [Instalar Node.js](#3-instalar-nodejs)
4. [Descargar el proyecto](#4-descargar-el-proyecto)
5. [Abrir una terminal en la carpeta del proyecto](#5-abrir-una-terminal-en-la-carpeta-del-proyecto)
6. [Instalar las dependencias](#6-instalar-las-dependencias-solo-la-primera-vez)
7. [Ejecutar el juego](#7-ejecutar-el-juego)
8. [Primeros pasos dentro del juego](#8-primeros-pasos-dentro-del-juego)
9. [Modo desarrollo y pruebas (opcional)](#9-modo-desarrollo-y-pruebas-opcional)
10. [Problemas frecuentes](#10-problemas-frecuentes)
11. [Actualizar y desinstalar](#11-actualizar-y-desinstalar)

---

## 1. Jugar sin instalar nada

El juego está publicado en GitHub Pages. Si solo quieres jugar, abre este enlace en Chrome o Edge:

**https://whysorichy.github.io/excommunicado-continental-protocol/**

La primera carga descarga unos 2 MB (sobre todo el motor de física). Después, el navegador lo guarda en caché.

El resto de esta guía es para ejecutarlo **en local**: sin conexión, en una red sin acceso a GitHub Pages, o para revisar y modificar el código.

## 2. Requisitos

| Necesitas | Detalle |
|---|---|
| Navegador | Chrome o Edge actualizados (recomendados, son los que se prueban de forma automática). Firefox y Safari 16.4+ también deberían funcionar. El navegador debe tener **WebGL 2** y la aceleración por hardware activada |
| Node.js | Versión **22.12 o superior**. Se recomienda la **24 LTS**. npm viene incluido con Node |
| Git | Opcional: solo si quieres clonar el repositorio. También puedes descargarlo como ZIP |
| Espacio en disco | Unos 200 MB para el proyecto y sus dependencias. Si además quieres ejecutar las pruebas e2e, unos 300 MB más para el navegador de pruebas |
| Internet | Solo para descargar el proyecto y ejecutar `npm install`. Después, el juego funciona sin conexión |
| Hardware | Cualquier equipo con gráfica compatible con WebGL 2. En gráficas integradas el juego arranca en calidad Baja automáticamente |

Teclado y ratón son suficientes. También funciona con mando (Xbox, PlayStation o compatible) conectado antes de abrir el juego.

## 3. Instalar Node.js

Si ya lo tienes, comprueba la versión con `node -v` en una terminal: debe mostrar `v22.12.0` o un número mayor (por ejemplo `v24.20.0`). Si es más antigua, instala una nueva.

### Windows

**Opción A, instalador oficial (la más sencilla):**

1. Entra en https://nodejs.org y descarga la versión **LTS** (botón verde, archivo `.msi`).
2. Ejecuta el instalador y pulsa **Next** en todas las pantallas. Deja marcada la opción **Add to PATH**.
3. Cuando termine, **cierra todas las terminales que tuvieras abiertas** y abre una nueva.

**Opción B, con winget (Windows 10 y 11):**

```powershell
winget install OpenJS.NodeJS.LTS
```

Cierra la terminal y abre otra nueva antes de seguir.

### macOS

- Descarga el instalador `.pkg` LTS desde https://nodejs.org y ábrelo, o
- con Homebrew: `brew install node@24` (y sigue las instrucciones que muestre para añadirlo al PATH).

### Linux

Lo más fiable es usar **nvm**:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# cierra y vuelve a abrir la terminal
nvm install --lts
```

### Comprobar la instalación

En una terminal **nueva**:

```bash
node -v
npm -v
```

Deben mostrarse dos números de versión, por ejemplo `v24.20.0` y `11.19.0`. Si aparece "no se reconoce como un comando", revisa la sección [Problemas frecuentes](#10-problemas-frecuentes).

## 4. Descargar el proyecto

Elige **una** de las dos opciones. En ambos casos, guarda el proyecto en una carpeta local normal, por ejemplo `C:\Proyectos` o `~/Proyectos`.

> No lo pongas dentro de una carpeta sincronizada con Google Drive, OneDrive o Dropbox. `npm install` crea miles de archivos pequeños; la sincronización lo vuelve lentísimo y a veces lo hace fallar.

**Opción A, con Git:**

```bash
git clone https://github.com/WhySoRichy/excommunicado-continental-protocol.git
cd excommunicado-continental-protocol
```

**Opción B, como ZIP:**

1. En la página del repositorio pulsa el botón verde **Code** y luego **Download ZIP**.
2. Descomprime el archivo. Se crea una carpeta llamada `excommunicado-continental-protocol-main`.
3. Entra en esa carpeta: dentro debe haber un archivo `package.json`.

## 5. Abrir una terminal en la carpeta del proyecto

Todos los comandos siguientes se ejecutan **dentro de la carpeta del proyecto** (la que contiene `package.json`).

- **Windows:** abre la carpeta en el Explorador de archivos, haz clic en la barra de direcciones, escribe `cmd` y pulsa Enter. También sirve clic derecho en un espacio vacío de la carpeta y **Abrir en Terminal**.
- **macOS:** abre la app Terminal, escribe `cd ` (con un espacio al final), arrastra la carpeta del proyecto a la ventana y pulsa Enter.
- **Linux:** clic derecho dentro de la carpeta y **Abrir en una terminal**, o usa `cd` con la ruta.

Para comprobar que estás en el sitio correcto:

```bash
# Windows (cmd o PowerShell)
dir package.json

# macOS y Linux
ls package.json
```

Si dice que no encuentra el archivo, no estás en la carpeta correcta.

## 6. Instalar las dependencias (solo la primera vez)

```bash
npm install
```

Esto descarga las bibliotecas del proyecto (Three.js, Rapier, Vite...) en una carpeta `node_modules`. Tarda entre uno y tres minutos según la conexión. Al final debe aparecer un resumen como `added 95 packages` y ningún mensaje de `ERR!`.

Si ves avisos (`npm warn`), no te preocupes: no impiden ejecutar el juego.

## 7. Ejecutar el juego

```bash
npm start
```

Este comando prepara la versión optimizada del juego y abre el navegador en **http://localhost:4173**. Si el navegador no se abre solo, copia esa dirección en Chrome o Edge.

- Mientras juegas, **deja la terminal abierta**: es el servidor que entrega el juego al navegador.
- Para detenerlo, vuelve a la terminal y pulsa **Ctrl + C**. En Windows puede preguntar `¿Desea terminar el trabajo por lotes (S/N)?`: responde `S`.
- Las siguientes veces solo necesitas abrir una terminal en la carpeta y ejecutar `npm start`. No hace falta repetir `npm install`.

## 8. Primeros pasos dentro del juego

1. En la pantalla de título elige **Nueva partida**.
2. Haz **clic dentro del juego** para que el ratón controle la cámara. **Esc** lo libera y pausa.
3. Estás en el vestíbulo del Continental, que es zona neutral: aquí no se dispara. Ve a la recepción y habla con **Charon** con la tecla **E**.
4. Acepta el **Simulacro de combate**. Incluye un tutorial de unos 3 minutos que enseña cada movimiento con la tecla real; se puede saltar desde el briefing.
5. Completar el simulacro desbloquea el resto de contratos y el Gauntlet.

Atajos útiles:

| Tecla | Para qué |
|---|---|
| H | Ver los controles en cualquier momento |
| Tab (mantener) | Intel: objetivo, reglas y leyenda de enemigos |
| Esc | Pausa (desde ahí, **Ajustes**: sensibilidad, calidad gráfica, volumen y teclas) |
| F3 | Panel con FPS y estadísticas |

La partida se guarda sola en el navegador (monedas, mejoras, récords y ajustes).

## 9. Modo desarrollo y pruebas (opcional)

Para quien quiera revisar o modificar el código:

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en http://localhost:5173 con recarga instantánea al guardar cambios. Muestra botones de prueba en el título (arena de pruebas y simulacro directo) |
| `npm run build` | Comprobación estricta de tipos y build de producción en la carpeta `dist/` |
| `npm run preview` | Sirve `dist/` en http://localhost:4173 |
| `npm test` | Pruebas unitarias (Vitest), unos segundos |
| `npm run test:e2e` | Pruebas del juego completo en Chromium (Playwright), entre 3 y 5 minutos |
| `npm run qa` | Build + pruebas unitarias + pruebas e2e |
| `npm run media` | Regenera las capturas y el GIF del README (necesita ffmpeg instalado) |

Antes de la primera ejecución de `npm run test:e2e` hay que descargar el navegador de pruebas:

```bash
npx playwright install chromium
```

Parámetros de URL que sirven en desarrollo y en producción:

| Parámetro | Efecto |
|---|---|
| `?preset=low`, `?preset=medium` o `?preset=high` | Fuerza una calidad gráfica |
| `?level=arena` | Carga la arena de pruebas de movimiento |
| `?qa=1` | Activa la API de pruebas (`window.__EXCOM__`) y permite jugar sin capturar el ratón |

> La carpeta `dist/` no funciona abriendo `index.html` con doble clic: el navegador bloquea los módulos y el wasm cargados desde `file://`. Hay que servirla con `npm run preview` o con cualquier servidor web.

## 10. Problemas frecuentes

**"'node' no se reconoce como un comando interno o externo" o "command not found: npm"**
Node.js no está instalado o la terminal se abrió antes de instalarlo. Cierra todas las terminales y abre una nueva. Si sigue igual, reinstala Node.js y deja marcada la opción **Add to PATH**.

**"No se puede cargar el archivo npm.ps1 porque la ejecución de scripts está deshabilitada en este sistema"** (PowerShell en Windows)
Usa la terminal **cmd** (escribe `cmd` en la barra de direcciones de la carpeta) o permite los scripts firmados para tu usuario y vuelve a intentarlo:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

**"EBADENGINE", "Unsupported engine" o errores de sintaxis al arrancar**
Tu versión de Node.js es demasiado antigua. Instala la 24 LTS (sección 3) y repite `npm install`.

**"Port 4173 is already in use"**
Ya hay otra copia del juego abierta en otra terminal. Ciérrala con Ctrl + C, o arranca en otro puerto:

```bash
npm start -- --port 4180
```

**`npm install` tarda muchísimo o falla con EPERM, EBUSY o ENOENT**
Suele pasar cuando la carpeta está dentro de Google Drive, OneDrive o Dropbox, o cuando el antivirus analiza cada archivo. Mueve el proyecto a una carpeta local (por ejemplo `C:\Proyectos`), borra la carpeta `node_modules` si se llegó a crear y vuelve a ejecutar `npm install`.

**La pantalla se queda negra o aparece un error de WebGL**
- Activa la aceleración por hardware. En Chrome: Configuración → Sistema → **Usar aceleración de gráficos cuando esté disponible**, y reinicia el navegador.
- Escribe `chrome://gpu` en la barra de direcciones: en "WebGL2" debe decir **Hardware accelerated**.
- Actualiza los controladores de la tarjeta gráfica o prueba con otro navegador.

**El juego va lento o a tirones**
- Pausa (Esc) → Ajustes → Vídeo y audio → **Calidad: Bajo**.
- En portátiles, conecta el cargador y elige el modo de alto rendimiento.
- Cierra otras pestañas pesadas. Con **F3** puedes ver los FPS.

**El ratón no mueve la cámara**
Haz clic dentro de la imagen del juego para que el navegador capture el ratón. Esc lo libera. Si aparece el aviso "Haz clic para jugar", es justo eso.

**No hay sonido**
Los navegadores no permiten sonido hasta el primer clic o tecla en la página. Comprueba también el volumen en Ajustes y que la pestaña no esté silenciada.

**El mando no responde**
Conéctalo y pulsa cualquier botón con la pestaña del juego en primer plano: los navegadores solo lo detectan después de una pulsación.

**Quiero empezar una partida de cero**
En la pantalla de título elige **Nueva partida** y confirma. Los ajustes (sensibilidad, teclas, calidad) se conservan; para restablecerlos, Ajustes → **Restablecer**.

**`npm run test:e2e` dice "Executable doesn't exist"**
Falta el navegador de pruebas: ejecuta `npx playwright install chromium`.

## 11. Actualizar y desinstalar

**Actualizar a la última versión** (si lo descargaste con Git):

```bash
git pull
npm install
npm start
```

Si lo descargaste como ZIP, descarga el ZIP nuevo y repite los pasos 4 a 7.

**Desinstalar:** borra la carpeta del proyecto. La partida guardada vive en el navegador; para borrarla, abre la página del juego, pulsa F12 → **Application** (Aplicación) → **Local storage** y elimina las claves `excom.profile` y `excom.settings`.
