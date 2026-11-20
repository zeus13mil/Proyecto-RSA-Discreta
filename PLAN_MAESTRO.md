# PLAN MAESTRO — Refactorización y Limpieza de `Proyecto_RSA_Discreta`

**Carpeta del proyecto:** `c:\Users\Josue\OneDrive\Documentos\ucr-JosueAlfaro-LAP\ucr-JosueAlfaro-LAP 2026\segundo semestre del 2026\mate discretas\Proyecto_RSA_Discreta`
**Objetivo:** Dividir [js/rsa.js](js/rsa.js) separando el núcleo puramente matemático (que se expondrá oralmente junto con su lógica y tablas `pasos`) de las comprobaciones/parseos/errores (que pasan a `js/validaciones.js` conectándose a `js/app.js`), manteniendo intacta la interfaz visual, regenerando `docs/Codigo_Fuente_RSA.pdf` con `js/rsa.js` de primero, y realizando una limpieza total al cierre.
**Estrategia de ejecución:** **5 Fases = 5 Chats (1 Fase completa por chat)**, usando `node test_rsa_temp.js` (Node.js v22.23.2) como verificación automática en cada fase, más verificación en navegador y **Confirmación / Cancelación** obligatoria antes de abrir el siguiente chat.

---

## Mapa de Chats y Modelos Recomendados

| Chat | Fase | Modelo y Nivel Recomendado |
| :---: | :--- | :--- |
| **Chat 1** | **Fase 1:** Extracción de `ejecutarAutotest` a `test_rsa_temp.js` y Baseline | **Gemini 4 Hydrogen — Medium** |
| **Chat 2** | **Fase 2:** División de `js/rsa.js` (Matemática) y `js/validaciones.js` (Comprobaciones) | **Gemini 4 Hydrogen — Alto** |
| **Chat 3** | **Fase 3:** Conexión de `index.html` y `js/app.js` (Paridad Visual 100%) | **Gemini 4 Argon — Medium** |
| **Chat 4** | **Fase 4:** Regeneración de `docs/Codigo_Fuente_RSA.pdf` (`js/rsa.js` primero) | **Gemini 4 Neon — Medium** |
| **Chat 5** | **Fase 5:** Auditoría Final, Pruebas Completas y Limpieza Total | **Orchestrator (Neon)** |

---

## FASE 1 (Chat 1 — Gemini 4 Hydrogen — Medium) — Baseline `test_rsa_temp.js`
- **Paso 1.1 — Crear `test_rsa_temp.js` para Node.js (`v22.23.2`):**
  - Extraer la lógica de `ejecutarAutotest` (casos oficiales del PDF: `p=17, q=19, e=5, "HOLA"` y `p=19, q=23, e=5, "RSA"`) hacia `test_rsa_temp.js` en la raíz del proyecto.
  - Agregar en `test_rsa_temp.js` pruebas base de contratos actuales (primalidad `esPrimo`, `euclidesMCD`, `euclidesExtendido`, `potenciaModular`, `generarClaves`, `cifrarMensaje`, `descifrarMensaje`, y mensajes de error clave actuales) cargando `js/rsa.js` mediante VM/require compatible con el IIFE de navegador.
- **Paso 1.2 — Limpiar `ejecutarAutotest` de `js/rsa.js`:**
  - Eliminar `ejecutarAutotest` y su invocación automática final (`RSAEngine.ejecutarAutotest(false)`) de `js/rsa.js`, manteniendo intactas el resto de funciones por ahora.
- **Lista de Pruebas (Confirmar o Cancelar antes de abrir Chat 2):**
  - [ ] `node test_rsa_temp.js` ejecuta y pasa 100% en verde.
  - [ ] Al abrir `index.html` en el navegador, la consola (F12) no muestra errores y los casos `Caso PDF #1` y `Caso PDF #2` funcionan normalmente en la interfaz.
- **Commit sugerido al confirmar:** `refactor(fase-1): extraer autotest a test_rsa_temp.js`

---

## FASE 2 (Chat 2 — Gemini 4 Hydrogen — Alto) — Separación `js/rsa.js` vs `js/validaciones.js`
- **Paso 2.1 — Dejar `js/rsa.js` 100% matemático y limpio para exposición:**
  - Conservar exclusivamente la lógica matemática pura con `BigInt` y las estructuras `pasos` necesarias para la exposición y las tablas de la UI:
    - `esPrimo(n)`
    - `listarPrimosEnRango(min, max)`
    - `generarPrimos(rango)`
    - `euclidesMCD(a, b)` (manteniendo `pasos`, `mcd`, `mcdBig`, `esCoprimo`)
    - `euclidesExtendido(e, phi)` (manteniendo `pasos`, coeficientes de Bézout, `d`, `dBig`, normalización y verificación matemática)
    - `sugerirExponenteE(phi, eActual)`
    - `generarClaves(p, q, e)` (solo cálculo matemático directo: `n`, `phi`, `euclides`, `euclidesExtendido`, `clavePublica`, `clavePrivada`)
    - `potenciaModular(base, exponente, modulo)` (manteniendo `pasos`, `resultado`, `resultadoBig`, `ecuacion`, descomposición binaria)
    - `cifrarMensaje(texto, e, n)` y `descifrarMensaje(bloques, d, n)` (solo cálculo matemático carácter/bloque con `potenciaModular` y desglose `detalles`).
  - Sacar de `js/rsa.js` todo parseo de texto (`aBigInt`, `parsearBloquesCifrados`) y toda validación/acumulación de mensajes de error de usuario.
- **Paso 2.2 — Crear `js/validaciones.js` (`window.RSAValidaciones`):**
  - Trasladar `aBigInt`, `parsearBloquesCifrados`, `esEnteroTexto` y todas las comprobaciones de parámetros, rangos (`n > 255`, `1 < e < φ(n)`, `p ≠ q`), dominio ASCII (0–255), `M < n` y bloques `0 ≤ C < n`.
  - Cuando una comprobación requiera un criterio matemático (primalidad o coprimalidad), debe **llamar al método correspondiente de `window.RSAEngine`** (`esPrimo`, `euclidesMCD`, `sugerirExponenteE`).
  - Exponer funciones limpias para la capa visual (ej. `validarYGenerarClaves`, `validarYCifrarMensaje`, `validarYDescifrarMensaje`, `validarEstadoCamposClave`) que devuelvan exactamente las mismas estructuras y **exactamente los mismos mensajes de error** que la app espera.
- **Paso 2.3 — Actualizar `test_rsa_temp.js`:**
  - Cargar `js/rsa.js` + `js/validaciones.js` y comprobar tanto los métodos matemáticos puros como las validaciones y los mensajes de error exactos.
- **Lista de Pruebas (Confirmar o Cancelar antes de abrir Chat 3):**
  - [ ] `node test_rsa_temp.js` pasa 100% en verde validando `RSAEngine` y `RSAValidaciones`.
  - [ ] `js/rsa.js` no contiene `aBigInt`, `parsearBloquesCifrados`, `ejecutarAutotest` ni bloques de mensajes de error de UI.
- **Commit sugerido al confirmar:** `refactor(fase-2): separar logica matematica (rsa.js) y validaciones (validaciones.js)`

---

## FASE 3 (Chat 3 — Gemini 4 Argon — Medium) — Conexión en `index.html` y `js/app.js`
- **Paso 3.1 — Actualizar `index.html`:**
  - Insertar `<script src="js/validaciones.js"></script>` **entre** `<script src="js/rsa.js"></script>` y `<script src="js/app.js"></script>`.
- **Paso 3.2 — Conectar `js/app.js` con `window.RSAValidaciones` y `window.RSAEngine`:**
  - Sustituir las comprobaciones locales (`esEnteroTexto`, llamadas a `engine.aBigInt`) y los flujos de validación en `actualizarBadgesIndividuales`, `procesarGeneracionClaves`, `ejecutarCifrado`, `ejecutarDescifrado`, `btnAutogenPrimes` y `btnSuggestE` para que usen `window.RSAValidaciones` (para comprobar/validar/parsear) y `window.RSAEngine` (para la lógica y cálculos matemáticos).
  - **Prohibido** alterar textos de error, estilos CSS, estructura HTML o formato de las tablas (`euclides-tbody`, `extendido-tbody`, `exp-encrypt-tbody`, `exp-decrypt-tbody`, `transformation-tbody`).
- **Paso 3.3 — Actualizar `test_rsa_temp.js`:**
  - Verificar que todas las funciones invocadas por `js/app.js` existen y responden con el contrato exacto.
- **Lista de Pruebas (Confirmar o Cancelar antes de abrir Chat 4):**
  - [ ] `node test_rsa_temp.js` pasa 100% en verde.
  - [ ] En el navegador (`index.html`):
    - Cargar `Caso PDF #1 ("HOLA")` y `Caso PDF #2 ("RSA")`: claves, cifrado, descifrado y las 3 pestañas paso a paso se ven idénticas.
    - Probar entradas inválidas (no primo, `p = q`, `n ≤ 255`, `e` no coprimo, carácter fuera de ASCII 0–255, bloque cifrado inválido): aparecen los mismos badges y mensajes de error exactos.
    - Probar "Autogenerar primos", "Sugerir e", "Enviar a Descifrar" y "Limpiar todo" sin errores en F12.
- **Commit sugerido al confirmar:** `refactor(fase-3): conectar validaciones.js en index.html y app.js`

---

## FASE 4 (Chat 4 — Gemini 4 Neon — Medium) — Regeneración de `docs/Codigo_Fuente_RSA.pdf`
- **Paso 4.1 — Regenerar `docs/Codigo_Fuente_RSA.pdf` completo y ordenado:**
  - Generar nuevamente `docs/Codigo_Fuente_RSA.pdf` con el código fuente actualizado y limpio tras las Fases 2 y 3.
  - **Orden obligatorio dentro del PDF:**
    1. `js/rsa.js` (**de primero**, destacando el núcleo matemático para la exposición)
    2. `js/validaciones.js`
    3. `js/app.js`
    4. `index.html`
    5. `css/styles.css`
  - **Regla estricta:** NO incluir `test_rsa_temp.js` ni archivos `.md` temporales; NO tocar `docs/Investigacion_RSA.pdf` ni `docs/Manual_Usuario_RSA.pdf`.
  - Si se usa algún script auxiliar temporal para generar el PDF (por ejemplo HTML/Python/Edge headless), eliminarlo inmediatamente tras generar `docs/Codigo_Fuente_RSA.pdf`.
- **Lista de Pruebas (Confirmar o Cancelar antes de abrir Chat 5):**
  - [ ] `node test_rsa_temp.js` sigue pasando 100% en verde.
  - [ ] `docs/Codigo_Fuente_RSA.pdf` existe, no está vacío, abre correctamente en el modal "Código Fuente" de `index.html` y muestra `js/rsa.js` en primer lugar seguido de `js/validaciones.js`, `js/app.js`, `index.html` y `css/styles.css`.
  - [ ] `docs/Investigacion_RSA.pdf` y `docs/Manual_Usuario_RSA.pdf` conservan intactos su fecha/tamaño/contenido.
- **Commit sugerido al confirmar:** `docs(fase-4): actualizar Codigo_Fuente_RSA.pdf con rsa.js primero`

---

## FASE 5 (Chat 5 — Orchestrator (Neon)) — Verificación Final y Limpieza Total
- **Paso 5.1 — Verificación integral previa a la limpieza:**
  - Ejecutar `node test_rsa_temp.js` por última vez y comprobar que toda la matemática y validaciones pasan 100%.
  - Verificar referencias en `index.html`, `js/rsa.js`, `js/validaciones.js`, `js/app.js` y `css/styles.css` para asegurar cero código muerto o referencias rotas.
- **Paso 5.2 — Limpieza total de archivos temporales:**
  - Eliminar del proyecto:
    - `test_rsa_temp.js`
    - `PLAN_MAESTRO.md`
    - `ESTADO_PROYECTO.md`
    - `RESTRICCIONES.md`
    - `PLANTILLA_CHAT_NUEVO.md`
    - `MANUAL_DE_USO.md`
  - Confirmar el listado exacto de archivos restantes en `Proyecto_RSA_Discreta` (solo los archivos finales de entrega).
- **Lista de Pruebas Final:**
  - [ ] No queda ningún archivo `.md` temporal ni `test_rsa_temp.js` en la carpeta del proyecto.
  - [ ] Al abrir `index.html` en el navegador, la aplicación carga sin errores en F12, los 3 PDFs abren en el visor modal y los casos de prueba + validaciones visuales funcionan al 100%.
- **Commit sugerido al confirmar:** `chore(fase-5): limpieza total de archivos temporales para entrega`