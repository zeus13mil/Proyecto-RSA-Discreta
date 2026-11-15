# PLAN MAESTRO — Criptosistema Asimétrico RSA 

**Carpeta raíz:** `Proyecto_RSA_Discreta/`
**Estructura actual:** `index.html`, `css/styles.css`, `js/rsa.js`, `js/app.js`, `docs/` (`Manual_Usuario_RSA.pdf`, `Investigacion_RSA.pdf`, `Codigo_Fuente_RSA.pdf`).
**Entregables y fechas:** Subida de `.zip` a Mediación Virtual el **viernes 20 de noviembre de 2026**; defensa virtual el **jueves 26 de noviembre de 2026 (3:00 p. m.)**.

---

## FASE 1 (Completada y Confirmada) — Arquitectura Base, Portada y Visor Modal
- Esqueleto web estático compatible con `file://` y GitHub Pages.
- Portada formal: *Matemática Discreta*, *Criptosistema Asimétrico RSA*, *20 de noviembre de 2026*, integrante único *Josué Ariel Alfaro Zelaya*.
- Barra superior con 3 botones que abren los PDFs de `./docs/` dentro de un modal con `<iframe>` + botón de respaldo en pestaña nueva.

---

## FASE 2 (Chat Nuevo 1 | Modelo: Hydrogen ALTO) — Motor Matemático RSA (`js/rsa.js`)
- **Paso 2.1 — Primalidad y generación de primos (`esPrimo`, `generarPrimos`):**
  - Implementar `esPrimo(num)` desde cero con `BigInt` (manejando $\le 1$, pares y divisores impares hasta $\sqrt{n}$).
  - Implementar `generarPrimos(rango)` con soporte para `'pequenos'` (`17–97`) y `'medianos'` (`101–499`), garantizando $p \neq q$ y $n = p \cdot q > 255$.
  - *Verificación intermedia 2.1:* Comprobar que `esPrimo` rechaza `0, 1, 4, 9, 15` y acepta `17, 19, 97, 499`, y que `generarPrimos` nunca devuelve $p = q$ ni $n \le 255$.
- **Paso 2.2 — Euclides, Euclides Extendido y Claves (`euclidesMCD`, `euclidesExtendido`, `sugerirExponenteE`, `generarClaves`):**
  - Implementar `euclidesMCD(a, b)` registrando cada división sucesiva ($a = b \cdot q + r$) en `pasos`.
  - Implementar `euclidesExtendido(e, phi)` calculando coeficientes de Bézout y normalizando $d$ positivo ($1 < d < \varphi(n)$) con tabla/ecuaciones paso a paso.
  - Implementar `sugerirExponenteE(phi)` probando candidatos válidos (`3, 5, 7, 11, 17, 65537` u otros impares coprimos con $\varphi(n)$).
  - Implementar `generarClaves(p, q, e)` validando todas las reglas matemáticas y devolviendo errores descriptivos si algo falla.
  - *Verificación intermedia 2.2:* Validar con $(p=17, q=19, e=5) \rightarrow n=323, \varphi(n)=288, d=173$ y $(p=19, q=23, e=5) \rightarrow n=437, \varphi(n)=396, d=317$.
- **Paso 2.3 — Exponenciación Modular Rápida y Cifrado/Descifrado (`potenciaModular`, `cifrarMensaje`, `descifrarMensaje`):**
  - Implementar `potenciaModular(base, exponente, modulo)` mediante exponenciación binaria paso a paso (registrando bits, cuadrados y productos modulares en `pasos`).
  - Implementar `cifrarMensaje(texto, e, n)` y `descifrarMensaje(bloques, d, n)` usando ASCII extendido (`0–255`), bloqueando caracteres con código $> 255$ o $\ge n$ con un mensaje matemático claro.
  - *Verificación intermedia 2.3:* Ejecutar `ejecutarAutotest()` en `js/rsa.js` verificando `"HOLA"` $\rightarrow [21, 129, 247, 12] \rightarrow$ `"HOLA"` y `"RSA"` $\rightarrow [119, 429, 126] \rightarrow$ `"RSA"`.
- **Lista de Pruebas (Confirmar o Cancelar antes de abrir Chat Nuevo 2):**
  - [ ] `ejecutarAutotest()` pasa los 2 casos del PDF sin errores en consola.
  - [ ] Al abrir `index.html` y presionar `F12` (Consola), se confirma `window.RSAEngine` cargado y los 2 autotests en verde.

---

## FASE 3 (Chat Nuevo 2 | Modelo: Hydrogen MEDIO) — Interfaz Interactiva y Paso a Paso (`index.html`, `css/styles.css`, `js/app.js`)
- **Paso 3.1 — Tarjeta 1 (Generación de Claves y Validaciones):**
  - Conectar inputs manuales de $p, q, e$, selector de rango (`Pequeños: 17–97` por defecto y `Medianos: 101–499`), botón **"Autogenerar Primos"**, botón **"Sugerir e"**, botón **"Cargar Caso de Prueba"** (1 clic) y botón **"Limpiar Todo"**.
  - Mostrar tarjetas visuales claras para $n$, $\varphi(n)$, **Clave Pública `(n, e)`** y **Clave Privada `(n, d)`**.
  - Implementar alertas visuales en rojo explicando la regla violada si $p$ o $q$ no son primos, $p=q$, $n \le 255$, o $e$ no cumple $1 < e < \varphi(n)$ y $\text{mcd}(e, \varphi(n)) = 1$ (sugiriendo valores válidos de $e$).
  - *Verificación intermedia 3.1:* Probar inputs inválidos ($p=4$, $p=q=17$, $p=7, q=11$ por $n \le 255$, $e=6$ con $\varphi=288$) y confirmar alertas en rojo claras.
- **Paso 3.2 — Tarjeta 2 (Cifrado, Descifrado y Tabla de Transformación):**
  - Implementar caja de texto para mensaje original, botón **"Cifrar Mensaje"**, caja de salida cifrada y botón rápido **"Enviar a Descifrar"**.
  - Implementar caja de entrada para descifrado que limpie automáticamente corchetes, espacios extra o saltos de línea (aceptando `21, 129, 247`, `[21, 129, 247]` o `21 129 247`) y botón **"Descifrar Mensaje"**.
  - Renderizar la **tabla compacta integrada**: `Carácter | ASCII (M) | Cifrado (C = M^e mod n) | Descifrado (M' = C^d mod n) | Carácter Final`, plus alerta roja si el texto contiene caracteres $> 255$ (ej. emojis o `€`).
  - *Verificación intermedia 3.2:* Cifrar y descifrar `"Mate Discreta 2026"` y `"Criptografía"`, verificando que la tabla muestre $M = M'$ en todas las filas.
- **Paso 3.3 — Tarjeta 3 (Procedimiento Paso a Paso con Pestañas):**
  - Crear 3 pestañas horizontales dentro de la Tarjeta 3: **1. Euclides ($\text{mcd}$)**, **2. Euclides Extendido ($d$)** y **3. Exponenciación Modular** (con selector de carácter/bloque, por defecto el 1.º, mostrando cifrado y descifrado binario paso a paso).
- **Lista de Pruebas (Confirmar o Cancelar antes de abrir Chat Nuevo 3):**
  - [ ] Botones *Autogenerar*, *Sugerir e*, *Cargar Caso de Prueba*, *Enviar a Descifrar* y *Limpiar Todo* funcionan sin errores en consola.
  - [ ] Alertas en rojo se activan correctamente ante primos inválidos, $n \le 255$, $e$ no coprimo o emojis.
  - [ ] Las 3 pestañas de *Procedimiento Paso a Paso* muestran las ecuaciones y pasos reales de la operación activa.

---

## FASE 4 (Chat Nuevo 3 | Modelo: Hydrogen MEDIO) — Investigación APA y los 5 Casos de Prueba
- **Paso 4.1 — Documento de Investigación en formato APA 7.ª ed. (`plantilla_investigacion.html` $\rightarrow$ `docs/Investigacion_RSA.pdf`):**
  - Generar un documento HTML+CSS con formato APA 7.ª edición (márgenes `2.54 cm`, interlineado doble, sangría de primera línea, portada, citas en texto `(Autor, Año)` y referencias con sangría francesa) calibrado para tener **entre 2 y 4 páginas de contenido** (sin contar portada ni referencias).
  - Responder detalladamente las 7 preguntas del instructivo, desarrollando **3 contextos reales**: 1) *Comunicaciones web seguras (HTTPS/TLS)*, 2) *Firmas y certificados digitales*, y 3) *Intercambio seguro de claves en SSH/VPN*, enfatizando el rol de la **Criptografía Híbrida** (RSA protege claves simétricas AES o firma hashes, no archivos pesados directamente).
  - Incluir fuentes reales y verificables en APA 7.ª ed. (Rivest, Shamir & Adleman, 1978; Kurose & Ross; Stallings; RFC 8446 / NIST FIPS 186-5).
- **Paso 4.2 — Ejecución y Documentación de los 5 Casos de Prueba Nuevos:**
  - Ejecutar en el motor/interfaz 5 casos distintos a los ejemplos del PDF, guardar sus capturas de pantalla en la carpeta temporal `temp_capturas/` (`caso1.png` a `caso5.png`) para insertarlas automáticamente en la Fase 5, y registrar los 9 datos obligatorios de cada uno ($p, q, n, \varphi(n), e, d$, mensaje original, representación ASCII, vector cifrado, vector descifrado y verificación):
    1. Palabra corta con primos pequeños distintos al PDF (`p=17, q=23, e=3`, mensaje `"MATE"`).
    2. Frase con mayúsculas, minúsculas y espacios (`"Mate Discreta 2026"`).
    3. Texto con números y signos de puntuación (`"Clave #123!"`).
    4. Texto en español con tildes/ñ en ASCII extendido (`"Criptografía"`).
    5. Prueba con primos medianos fijos (`p=101, q=103, e=7`, mensaje `"Seguridad RSA"`) para demostrar escalabilidad determinista.
- **Lista de Pruebas (Confirmar o Cancelar antes de abrir Chat Nuevo 4):**
  - [ ] `plantilla_investigacion.html` se exporta a `docs/Investigacion_RSA.pdf` con 2–4 páginas de cuerpo, formato APA limpio y referencias reales.
  - [ ] Los 5 casos de prueba están matemáticamente verificados al 100% y sus capturas guardadas en `temp_capturas/`.

---

## FASE 4 (Chat Nuevo 3 | Modelo: Hydrogen MEDIO) — Investigación APA y los 5 Casos de Prueba
- **Paso 4.1 — Documento de Investigación en formato APA 7.ª ed. (`plantilla_investigacion.html` $\rightarrow$ `docs/Investigacion_RSA.pdf`):**
  - Generar un documento HTML+CSS con formato APA 7.ª edición (márgenes `2.54 cm`, interlineado doble, sangría de primera línea, portada, citas en texto `(Autor, Año)` y referencias con sangría francesa) calibrado para tener **entre 2 y 4 páginas de contenido** (sin contar portada ni referencias).
  - Responder detalladamente las 7 preguntas del instructivo, desarrollando **3 contextos reales**: 1) *Comunicaciones web seguras (HTTPS/TLS)*, 2) *Firmas y certificados digitales*, y 3) *Intercambio seguro de claves en SSH/VPN*, enfatizando el rol de la **Criptografía Híbrida** (RSA protege claves simétricas AES o firma hashes, no archivos pesados directamente).
  - Incluir fuentes reales y verificables en APA 7.ª ed. (Rivest, Shamir & Adleman, 1978; Kurose & Ross; Stallings; RFC 8446 / NIST FIPS 186-5).
- **Paso 4.2 — Ejecución y Documentación de los 5 Casos de Prueba Nuevos:**
  - Ejecutar en el motor/interfaz 5 casos distintos a los ejemplos del PDF, guardar sus capturas de pantalla en la carpeta temporal `temp_capturas/` (`caso1.png` a `caso5.png`) para insertarlas automáticamente en la Fase 5, y registrar los 9 datos obligatorios de cada uno ($p, q, n, \varphi(n), e, d$, mensaje original, representación ASCII, vector cifrado, vector descifrado y verificación):
    1. Palabra corta con primos pequeños distintos al PDF (`p=17, q=23, e=3`, mensaje `"MATE"`).
    2. Frase con mayúsculas, minúsculas y espacios (`"Mate Discreta 2026"`).
    3. Texto con números y signos de puntuación (`"Clave #123!"`).
    4. Texto en español con tildes/ñ en ASCII extendido (`"Criptografía"`).
    5. Prueba con primos medianos fijos (`p=101, q=103, e=7`, mensaje `"Seguridad RSA"`) para demostrar escalabilidad determinista.
- **Lista de Pruebas (Confirmar o Cancelar antes de abrir Chat Nuevo 4):**
  - [ ] `plantilla_investigacion.html` se exporta a `docs/Investigacion_RSA.pdf` con 2–4 páginas de cuerpo, formato APA limpio y referencias reales.
  - [ ] Los 5 casos de prueba están matemáticamente verificados al 100% y sus capturas guardadas en `temp_capturas/`.