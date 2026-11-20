# ESTADO DEL PROYECTO — `Proyecto_RSA_Discreta`

> Este archivo es la **memoria compartida entre chats**. Cada chat nuevo lo lee al iniciar y lo actualiza al terminar su fase (hasta la Fase 4; en la Fase 5 se elimina junto con los demás temporales).

## 1. Resumen de Estado Actual
- **Fase actual:** **Fase 2** completada y confirmada por el usuario
- **Próxima fase a ejecutar:** **Fase 3** — Conexión de `index.html` y `js/app.js` (Paridad Visual 100%)
- **Última fase confirmada por el usuario:** **Fase 2**

---

## 2. Arquitectura Actual del Proyecto
- **Carpeta raíz:** `c:\Users\Josue\OneDrive\Documentos\ucr-JosueAlfaro-LAP\ucr-JosueAlfaro-LAP 2026\segundo semestre del 2026\mate discretas\Proyecto_RSA_Discreta`
- **Archivos de aplicación actuales:**
  - `index.html` (594 líneas, carga actualmente `js/rsa.js` y `js/app.js`; pendiente insertar `js/validaciones.js` en Fase 3)
  - `css/styles.css`
  - `js/rsa.js` (730 líneas; núcleo 100% matemático con `BigInt` y tablas `pasos`)
  - `js/validaciones.js` (686 líneas; parseo, comprobaciones, badges y mensajes de error exactos en `window.RSAValidaciones`)
  - `js/app.js` (1,059 líneas; maneja UI, `DEMO_CASES`, tablas paso a paso; pendiente conectar con `RSAValidaciones` en Fase 3)
- **Documentación en `docs/`:**
  - `docs/Investigacion_RSA.pdf` *(intocable)*
  - `docs/Manual_Usuario_RSA.pdf` *(intocable)*
  - `docs/Codigo_Fuente_RSA.pdf` *(se regenerará en Fase 4 con `js/rsa.js` de primero)*
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
