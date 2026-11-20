# RESTRICCIONES ESTRICTAS DEL PROYECTO (`Proyecto_RSA_Discreta`)

Cualquier agente o chat que trabaje en `Proyecto_RSA_Discreta` **DEBE** respetar estas reglas sin excepción:

1. **Prohibido salir de la carpeta del proyecto:**
  - NO leer, escribir ni ejecutar comandos fuera de la raíz de `Proyecto_RSA_Discreta`, salvo autorización explícita del usuario.
2. **Una sola Fase por chat:**
  - Ejecuta **únicamente** la Fase asignada por el usuario. NO te adelantes a fases siguientes.
3. **Separación estricta entre Matemática y Comprobaciones:**
  - `js/rsa.js` debe quedar **100% matemático** (algoritmos, aritmética modular con `BigInt` y arreglos `pasos` para las tablas). No debe contener validaciones de texto de entrada, parseos de UI ni mensajes de error de usuario.
  - `js/validaciones.js` debe contener los parseos (`aBigInt`, `parsearBloquesCifrados`), las comprobaciones y los mensajes de error, llamando únicamente a los métodos matemáticos de `js/rsa.js` cuando necesite verificar propiedades (ej. `esPrimo`, `euclidesMCD`).
  - En `index.html`, el orden de carga de scripts debe ser estrictamente: `js/rsa.js` → `js/validaciones.js` → `js/app.js`.
4. **Intactos los textos y tablas de la interfaz (Rúbrica del curso):**
  - Al mover las comprobaciones a `js/validaciones.js` y conectar `js/app.js`, conserva **exactamente** los mismos mensajes de error, flujo visual, badges/alertas y formato de las tablas paso a paso (Euclides, Euclides Extendido y Exponenciación Modular) para que no haya ninguna discrepancia con las capturas y pasos de `docs/Manual_Usuario_RSA.pdf`.
5. **PDFs intocables:**
  - **Prohibido** modificar, mover o sobrescribir `docs/Investigacion_RSA.pdf` ni `docs/Manual_Usuario_RSA.pdf`.
6. **PDF de código fuente completo y ordenado:**
  - Al regenerar `docs/Codigo_Fuente_RSA.pdf`, coloca **`js/rsa.js` de primero**, e incluye **todos** los archivos de código fuente del proyecto (`js/validaciones.js`, `js/app.js`, `index.html` y `css/styles.css`) para cumplir con el requisito de entregar el código fuente completo. No incluyas `test_rsa_temp.js` ni archivos `.md` temporales dentro del PDF.
7. **Stack frontend puro (sin frameworks ni bundlers):**
  - El proyecto en producción es HTML + CSS + JavaScript vanilla (`window.RSAEngine`, `window.RSAValidaciones`). Node.js (`v22.23.2`) se usa **únicamente** para ejecutar la prueba automática `node test_rsa_temp.js`, sin instalar dependencias `npm` ni crear `node_modules` o `package.json`.
8. **Detenerse obligatoriamente en la Lista de Pruebas:**
  - Al terminar la Fase, ejecuta `node test_rsa_temp.js` (excepto tras la limpieza final de Fase 5), muestra los resultados reales observados y **detente** pidiendo al usuario **Confirmar o Cancelar**.
9. **Memoria obligatoria entre chats:**
  - Antes de empezar (Fases 1 a 5), lee `ESTADO_PROYECTO.md`, `RESTRICCIONES.md` y `PLAN_MAESTRO.md`.
  - Antes de cerrar tu respuesta final (Fases 1 a 4), actualiza `ESTADO_PROYECTO.md` con los archivos creados/modificados, hallazgos y resultados reales de `node test_rsa_temp.js`. (En la Fase 5 se elimina `ESTADO_PROYECTO.md` como parte de la limpieza total).
10. **Puntos de control en Git por fase:**
  - Al finalizar cada fase, junto con la Lista de Pruebas, muestra siempre el título de *commit* recomendado en `PLAN_MAESTRO.md` para que el usuario guarde su punto de control en Control de código fuente (Git) tras verificar la fase.