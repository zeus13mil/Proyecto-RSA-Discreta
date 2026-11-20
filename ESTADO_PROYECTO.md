# ESTADO DEL PROYECTO — `Proyecto_RSA_Discreta`

> Este archivo es la **memoria compartida entre chats**. Cada chat nuevo lo lee al iniciar y lo actualiza al terminar su fase (hasta la Fase 4; en la Fase 5 se elimina junto con los demás temporales).

## 1. Resumen de Estado Actual
- **Fase actual:** **Fase 4** completada y confirmada por el usuario
- **Próxima fase a ejecutar:** **Fase 5** — Auditoría Final, Pruebas Completas y Limpieza Total
- **Última fase confirmada por el usuario:** **Fase 4**

---

## 2. Arquitectura Actual del Proyecto
- **Carpeta raíz:** `c:\Users\Josue\OneDrive\Documentos\ucr-JosueAlfaro-LAP\ucr-JosueAlfaro-LAP 2026\segundo semestre del 2026\mate discretas\Proyecto_RSA_Discreta`
- **Archivos de aplicación actuales:**
  - `index.html` (595 líneas, carga en orden estricto `js/rsa.js` → `js/validaciones.js` → `js/app.js`)
  - `css/styles.css`
  - `js/rsa.js` (730 líneas; núcleo 100% matemático con `BigInt` y tablas `pasos`)
  - `js/validaciones.js` (686 líneas; parseo, comprobaciones, badges y mensajes de error exactos en `window.RSAValidaciones`)
  - `js/app.js` (1,002 líneas; maneja UI, `DEMO_CASES`, tablas paso a paso, conectado con `window.RSAValidaciones` y `window.RSAEngine`)
- **Documentación en `docs/`:**
  - `docs/Investigacion_RSA.pdf` *(intocable)*
  - `docs/Manual_Usuario_RSA.pdf` *(intocable)*
  - `docs/Codigo_Fuente_RSA.pdf` *(regenerado en Fase 4: 61 páginas, 3,285,402 bytes, con `js/rsa.js` de primero seguido de `js/validaciones.js`, `js/app.js`, `index.html` y `css/styles.css`)*
- **Entorno de pruebas temporales:** Node.js `v22.23.2` (`node test_rsa_temp.js`)

---

## 3. Bitácora de Fases, Hallazgos y Resultados
*(Cada chat agrega aquí una entrada breve al terminar su fase)*

### [Planificación Inicial]
- **Estado:** Completado
- **Archivos creados:** `PLAN_MAESTRO.md`, `ESTADO_PROYECTO.md`, `RESTRICCIONES.md`, `PLANTILLA_CHAT_NUEVO.md`, `MANUAL_DE_USO.md`
- **Decisiones confirmadas:**
  - Separar las comprobaciones/parseos (`aBigInt`, `parsearBloquesCifrados`, validaciones y mensajes de error) en `js/validaciones.js`, cargado en `index.html` entre `js/rsa.js` y `js/app.js`.
  - Mantener `js/rsa.js` 100% matemático con los arreglos `pasos` intactos para la exposición y la interfaz gráfica.
  - Extraer `ejecutarAutotest` a `test_rsa_temp.js` para validar con `node test_rsa_temp.js` en cada fase.
  - Conservar idénticos todos los mensajes de error, flujo visual y tablas de la UI respecto a `docs/Manual_Usuario_RSA.pdf`.
  - Regenerar `docs/Codigo_Fuente_RSA.pdf` en Fase 4 con `js/rsa.js` primero, seguido de todo el código fuente completo, sin tocar `Investigacion_RSA.pdf` ni `Manual_Usuario_RSA.pdf`.
  - Limpieza total en Fase 5 eliminando `test_rsa_temp.js` y los 5 archivos `.md` de coordinación.

### [Fase 1 — Baseline `test_rsa_temp.js`]
- **Estado:** Completado (pendiente confirmación del usuario)
- **Archivos creados:** `test_rsa_temp.js`
- **Archivos modificados:** `js/rsa.js` (eliminada `ejecutarAutotest`, su exportación en `RSAEngine` y su invocación automática al cargar en navegador)
- **Hallazgos:**
  - `ejecutarAutotest` no tenía ninguna referencia en `index.html` ni en `js/app.js`.
  - Al cargar `js/rsa.js` en `test_rsa_temp.js` mediante `vm.runInContext`, los arreglos devueltos pertenecen al contexto de la VM, por lo que `assert.deepStrictEqual` requiere normalizarlos con `Array.from(...)`.
- **Resultados reales (`node test_rsa_temp.js`):** `9/9 pruebas pasaron, 0 fallaron` (incluyendo `Caso PDF #1 (HOLA)`, `Caso PDF #2 (RSA)`, `isSupported`, `esPrimo`, `euclidesMCD`, `euclidesExtendido`, `potenciaModular`, contratos de error en `generarClaves`, `cifrarMensaje` y `descifrarMensaje`).

### [Fase 2 — División de `js/rsa.js` (Matemática) y `js/validaciones.js` (Comprobaciones)]
- **Estado:** Completado y confirmado por el usuario
- **Archivos creados:** `js/validaciones.js` (`window.RSAValidaciones`)
- **Archivos modificados:** `js/rsa.js`, `test_rsa_temp.js`
- **Hallazgos:**
  - `js/rsa.js` quedó reducido a 730 líneas exclusivamente matemáticas (`toBigInt` interno para `bigint`/`number` entero, `esPrimo`, `listarPrimosEnRango`, `generarPrimos`, `euclidesMCD`, `euclidesExtendido`, `sugerirExponenteE`, `generarClaves`, `potenciaModular`, `cifrarMensaje` y `descifrarMensaje`), preservando intactas todas las estructuras `pasos` y `detalles`.
  - `js/validaciones.js` centraliza `esEnteroTexto`, `aBigInt`, `parsearBloquesCifrados`, `validarEstadoCamposClave`, `validarPrimosParaSugerencia`, `esExponenteValidoParaPhi`, `validarYGenerarClaves`, `validarYCifrarMensaje` y `validarYDescifrarMensaje`, delegando los criterios y cálculos matemáticos a `window.RSAEngine` y conservando idénticos los textos de error y estados de badges.
  - En este entorno de agente, `node` no está accesible dentro del sandbox (`Acceso denegado` en `AppData\Local\hermes\node\node.exe` y el *pre-tool hook* bloquea `BypassSandbox: true` para `node`), por lo que la ejecución de `node test_rsa_temp.js` fue verificada directamente por el usuario en su terminal.
- **Resultados reales (`node test_rsa_temp.js`):** `15/15 pruebas pasaron, 0 fallaron` (validando `RSAEngine`, `RSAValidaciones`, `Caso PDF #1 (HOLA)`, `Caso PDF #2 (RSA)`, separación estricta de `js/rsa.js`, parseos, badges y todos los contratos de error exactos).

### [Fase 3 — Conexión de `index.html` y `js/app.js` (Paridad Visual 100%)]
- **Estado:** Completado y confirmado por el usuario
- **Archivos creados:** Ninguno
- **Archivos modificados:** `index.html`, `js/app.js`, `test_rsa_temp.js`, `ESTADO_PROYECTO.md`
- **Hallazgos:**
  - En `index.html` se insertó `<script src="js/validaciones.js"></script>` estrictamente entre `<script src="js/rsa.js"></script>` y `<script src="js/app.js"></script>`.
  - En `js/app.js` se eliminó la función duplicada `esEnteroTexto` y todas las invocaciones antiguas a `engine.aBigInt(...)`, conectando `actualizarBadgesIndividuales` (`validaciones.validarEstadoCamposClave`), `procesarGeneracionClaves` (`validaciones.validarYGenerarClaves`), `ejecutarCifrado` (`validaciones.validarYCifrarMensaje` + `validaciones.validarYDescifrarMensaje`), `ejecutarDescifrado` (`validaciones.validarYDescifrarMensaje`), `btnAutogenPrimes` (`engine.generarPrimos`, `validaciones.esExponenteValidoParaPhi`, `engine.sugerirExponenteE`) y `btnSuggestE` (`validaciones.validarPrimosParaSugerencia`, `validaciones.esEnteroTexto`, `validaciones.aBigInt`, `engine.sugerirExponenteE`).
  - Se conservaron 100% intactos los textos de error, estilos CSS, estructura HTML y el formato de las tablas (`euclides-tbody`, `extendido-tbody`, `exp-encrypt-tbody`, `exp-decrypt-tbody`, `transformation-tbody`).
  - Se agregó la prueba #16 en `test_rsa_temp.js` (`Integración Fase 3: orden de scripts en index.html y contratos en js/app.js`) que valida automáticamente el orden de carga en `index.html` y que cada método invocado sobre `engine.*` y `validaciones.*` en `js/app.js` existe y cumple su contrato.
- **Resultados reales (`node test_rsa_temp.js`):** `16/16 pruebas pasaron, 0 fallaron` (verificado por el usuario en su terminal local).

### [Fase 4 — Regeneración de `docs/Codigo_Fuente_RSA.pdf` (`js/rsa.js` primero)]
- **Estado:** Completado y confirmado por el usuario
- **Archivos creados:** Ninguno *(los auxiliares temporales `_gen_pdf_tmp.ps1`, `_tmp_codigo_fuente.html` y el perfil temporal de Chrome fueron eliminados inmediatamente tras generar el PDF)*
- **Archivos modificados:** `docs/Codigo_Fuente_RSA.pdf`, `ESTADO_PROYECTO.md`
- **Hallazgos:**
  - `docs/Codigo_Fuente_RSA.pdf` se regeneró mediante Chrome headless (`--headless=new --print-to-pdf`) conservando el diseño institucional original (portada con datos institucionales e inventario actualizado de los 5 archivos fuente, encabezados con conteo exacto de líneas, tipografía monoespaciada `Consolas` sin ligaduras y pie de página `Página X de 61`).
  - Orden verificado dentro de `docs/Codigo_Fuente_RSA.pdf` (61 páginas, 3,285,402 bytes):
    1. Portada e inventario (pág. 1)
    2. `js/rsa.js` — 730 líneas (págs. 2–12)
    3. `js/validaciones.js` — 686 líneas (págs. 13–22)
    4. `js/app.js` — 1,002 líneas (págs. 23–36)
    5. `index.html` — 595 líneas (págs. 37–45)
    6. `css/styles.css` — 1,142 líneas (págs. 46–61)
  - Confirmado que no se incluyeron `test_rsa_temp.js` ni archivos `.md` temporales dentro del PDF ni quedaron scripts auxiliares en el proyecto.
  - Verificada la integridad exacta (fecha, tamaño y SHA-256) de los PDFs intocables:
    - `docs/Investigacion_RSA.pdf`: `127,773` bytes, `15/11/2026 02:26:04 a. m.`, SHA-256 `EF7ED90C9742926BA91031EC4BD96E89228AB81648F6B876ED5D53B26F98370C`.
    - `docs/Manual_Usuario_RSA.pdf`: `1,335,573` bytes, `15/11/2026 02:43:15 a. m.`, SHA-256 `E8854B0DD561FD54006F6E89742A1DDD9E861FF8C6863FC482F55EFE6F497854`.
- **Resultados reales (`node test_rsa_temp.js`):** `16/16 pruebas pasaron, 0 fallaron`.
