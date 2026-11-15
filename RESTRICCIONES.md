# RESTRICCIONES ESTRICTAS DEL PROYECTO — Criptosistema Asimétrico RSA

Cualquier agente o chat que trabaje en `Proyecto_RSA_Discreta` **DEBE** respetar estas reglas sin excepción:

1. **Cero servidores, cero instalaciones y compatibilidad `file://`:**
   - El proyecto es 100% web estático (`index.html`, `css/styles.css`, `js/rsa.js`, `js/app.js`).
   - PROHIBIDO usar Python, Node.js, npm, React, Vite o ES Modules (`import`/`export`) que causen errores CORS al abrir `index.html` con doble clic (`file://`) o en GitHub Pages. Usa siempre el espacio de nombres clásico `window.RSAEngine`.
2. **Prohibido usar librerías matemáticas o cajas negras para RSA:**
   - Todos los algoritmos (verificación de primalidad, Algoritmo de Euclides, Algoritmo Extendido de Euclides, inverso modular y exponenciación modular rápida) deben programarse explícitamente desde cero usando `BigInt` nativo, dejando trazabilidad paso a paso para la defensa oral.
3. **Dominio ASCII extendido (`0–255`) y validación estricta:**
   - Codificación carácter por carácter (`charCodeAt` / `fromCharCode`).
   - Exigir siempre que $p$ y $q$ sean primos, $p \neq q$, y $n = p \cdot q > 255$ para cubrir todo el alfabeto español (incluyendo tildes y `ñ`).
   - Bloquear con alertas claras en rojo cualquier carácter fuera de `0–255` (como emojis o `€`) o cualquier parámetro inválido.
4. **Rutas relativas intactas en `./docs/`:**
   - Los 3 botones de documentación deben apuntar siempre a `docs/Manual_Usuario_RSA.pdf`, `docs/Investigacion_RSA.pdf` y `docs/Codigo_Fuente_RSA.pdf`. No crear archivos entregables sueltos fuera de esta estructura.
5. **Una sola Fase por chat y verificaciones intermedias obligatorias:**
   - Ejecuta **únicamente** la Fase solicitada por el usuario, validando cada subpaso antes de pasar al siguiente. No te adelantes a fases posteriores.
6. **Detenerse obligatoriamente en la Lista de Pruebas:**
   - Al terminar la Fase, actualiza `ESTADO_PROYECTO.md`, muestra la **Lista de Pruebas (automática + manual)** con resultados reales y **detente** pidiendo al usuario **Confirmar o Cancelar**.