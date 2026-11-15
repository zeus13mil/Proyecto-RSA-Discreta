# ESTADO DEL PROYECTO — Criptosistema Asimétrico RSA

> Este archivo es la **memoria compartida entre chats**. Cada chat nuevo lo lee al iniciar y lo actualiza al terminar su fase.

## 1. Resumen de Estado Actual
- **Fase actual:** Fase 4 (Lista para iniciar)
- **Próxima fase a ejecutar:** Fase 4 — Investigación APA y los 5 Casos de Prueba (`plantilla_investigacion.html`, `docs/Investigacion_RSA.pdf`, `temp_capturas/`)
- **Última fase confirmada por el usuario:** `Fase 3`

---

## 2. Decisiones Técnicas Vigentes
- **Carpeta raíz:** `Proyecto_RSA_Discreta/`
- **Stack:** HTML5 + CSS3 + JavaScript puro (`window.RSAEngine` sin ES modules para compatibilidad total con `file://` y GitHub Pages).
- **Aritmética:** `BigInt` nativo; algoritmos escritos desde cero (primos, Euclides, Euclides Extendido, exponenciación modular rápida).
- **Codificación y dominio:** ASCII extendido (`0–255`), exigiendo $p, q$ primos, $p \neq q$ y $n = p \cdot q > 255$. Rangos de autogeneración: `Pequeños (17–97)` por defecto y `Medianos (101–499)`.
- **Documentos integrados en `./docs/`:** `Manual_Usuario_RSA.pdf`, `Investigacion_RSA.pdf`, `Codigo_Fuente_RSA.pdf`.

---

## 3. Bitácora de Fases, Hallazgos y Resultados

### [Fase 1 — Arquitectura Base, Portada y Visor Modal]
- **Estado:** Completada y confirmada por el usuario
- **Archivos creados/modificados:**
  - `index.html`: Encabezado formal (*Matemática Discreta*, *Criptosistema Asimétrico RSA*, *20 de noviembre de 2026*, integrante único *Josué Ariel Alfaro Zelaya*), barra de documentación con 3 botones hacia `./docs/*.pdf` y tarjetas base de trabajo.
  - `css/styles.css`: Diseño responsivo en CSS3 puro y estilos del modal con `<iframe>`.
  - `js/rsa.js`: Espacio de nombres `window.RSAEngine` con verificación de `BigInt`.
  - `js/app.js`: Controlador del modal de documentos (`src="about:blank"` al iniciar/cerrar para evitar bucles de carga) y botón de apertura en pestaña nueva.
- **Hallazgos:**
  - El visor modal incrustado abre correctamente los PDFs locales en `file:///` usando el administrador nativo del navegador.
  - Proyecto conectado y sincronizado con repositorio GitHub para despliegue en GitHub Pages.

### [Fase 2 — Motor Matemático RSA (`js/rsa.js`)]
- **Estado:** Completada y confirmada por el usuario
- **Archivos creados/modificados:**
  - `js/rsa.js`: Implementación desde cero en `window.RSAEngine` (`v1.0.0`) con `BigInt` nativo de todas las funciones matemáticas y de trazabilidad paso a paso:
    - **Paso 2.1:** `esPrimo(num)`, `listarPrimosEnRango(min, max)` y `generarPrimos(rango)` con soporte para `'pequenos'` (`17–97`) y `'medianos'` (`101–499`), garantizando siempre $p \neq q$ y $n = p \cdot q > 255$.
    - **Paso 2.2:** `euclidesMCD(a, b)` (divisiones sucesivas en `pasos`), `euclidesExtendido(e, phi)` (coeficientes de Bézout $e \cdot x + \varphi(n) \cdot y = 1$, normalización de $d$ positivo en $1 < d < \varphi(n)$ y verificación modular), `sugerirExponenteE(phi, eActual)` y `generarClaves(p, q, e)` con validaciones exhaustivas y errores descriptivos.
    - **Paso 2.3:** `potenciaModular(base, exponente, modulo)` (exponenciación binaria derecha-a-izquierda registrando cada bit, cuadrado y producto modular en `pasos`), `parsearBloquesCifrados(entrada)`, `cifrarMensaje(texto, e, n)`, `descifrarMensaje(bloques, d, n)` y `ejecutarAutotest()`.
- **Hallazgos y Resultados Reales de Pruebas:**
  - **Verificación 2.1:** `esPrimo` rechazó `0, 1, 4, 9, 15` (`false`) y aceptó `17, 19, 97, 499` (`true`). En 1,000 ejecuciones aleatorias de `generarPrimos` (`500` pequeños + `500` medianos) hubo `0` fallos ($p \neq q$ y $n > 255$ en el 100% de los casos).
  - **Verificación 2.2:**
    - Caso $(p=17, q=19, e=5) \rightarrow n=323, \varphi(n)=288, d=173$, identidad de Bézout `5 · (-115) + 288 · (2) = 1`, normalización `-115 + 288 = 173`.
    - Caso $(p=19, q=23, e=5) \rightarrow n=437, \varphi(n)=396, d=317$, identidad de Bézout `5 · (-79) + 396 · (1) = 1`, normalización `-79 + 396 = 317`.
    - Entradas inválidas ($p=4$, $p=q=17$, $p=7, q=11$ con $n=77 \le 255$, y $e=6$ no coprimo con $\varphi=288$) fueron rechazadas con mensajes matemáticos explicativos y sugerencias válidas para $e$.
  - **Verificación 2.3 y `ejecutarAutotest()`:**
    - Autotest #1 (`p=17, q=19, e=5, d=173, n=323`): `"HOLA"` (ASCII `[72, 79, 76, 65]`) $\rightarrow$ cifrado `[21, 129, 247, 12]` $\rightarrow$ descifrado `"HOLA"` (**PASADO**).
    - Autotest #2 (`p=19, q=23, e=5, d=317, n=437`): `"RSA"` (ASCII `[82, 83, 65]`) $\rightarrow$ cifrado `[119, 429, 126]` $\rightarrow$ descifrado `"RSA"` (**PASADO**).
    - Caracteres en español dentro de ASCII extendido (`"Criptografía y Español 2026!"`) se cifran y descifran sin pérdida, mientras que caracteres Unicode $> 255$ (`€`, `—`, emojis) son bloqueados con alerta descriptiva.

### [Fase 3 — Interfaz Interactiva y Paso a Paso (`index.html`, `css/styles.css`, `js/app.js`)]
- **Estado:** Completada y confirmada por el usuario
- **Archivos modificados:**
  - `index.html`:
    - Barra de acciones globales (`#select-demo-case`, `#btn-load-demo` **"Cargar Caso de Prueba"** y `#btn-clear-all` **"Limpiar Todo"**) y pill de estado `#rsa-status`, preservando íntegros el encabezado formal, los 3 botones de `./docs/*.pdf` y el modal `#doc-modal`.
    - **Tarjeta 1 (`#rsa-keygen-section`):** Selector de rango `#prime-range` (`Pequeños: 17–97` por defecto y `Medianos: 101–499`), botones **"Autogenerar Primos"**, **"Sugerir e"** y **"Generar Claves"**, inputs `#input-p`, `#input-q`, `#input-e` con badges de estado, alerta roja `#keygen-alert` con chips clicables de sugerencias de $e$, y 4 tarjetas visuales ($n$, $\varphi(n)$, Clave Pública `(n, e)` y Clave Privada `(n, d)`).
    - **Tarjeta 2 (`#rsa-cipher-section` + `#rsa-table-section`):** Cajas de cifrado y descifrado, botón **"Cifrar Mensaje"**, botón rápido **"Enviar a Descifrar"**, botón **"Descifrar Mensaje"** con limpieza automática de corchetes, espacios extra y saltos de línea, alerta roja `#cipher-alert`, y tabla compacta integrada `Carácter | ASCII (M) | Cifrado (C = M^e mod n) | Descifrado (M' = C^d mod n) | Carácter Final`.
    - **Tarjeta 3 (`#rsa-steps-section`):** Barra de 3 pestañas horizontales (**1. Euclides (mcd)**, **2. Euclides Extendido (d)** y **3. Exponenciación Modular** con selector `#select-exp-block` de carácter/bloque por defecto en el 1.º).
  - `css/styles.css`: Estilos responsivos para formularios, badges, alertas rojas, chips de sugerencia, tarjetas métricas, tablas compactas, pestañas horizontales y subpaneles de exponenciación binaria.
  - `js/app.js`: Integración completa con `window.RSAEngine` (sin modificar `js/rsa.js`), carga inicial del Caso PDF #1 (`p=17, q=19, e=5, "HOLA"`), manejo de estado, renderizado seguro vía DOM y preservación del visor modal PDF.
- **Hallazgos y Resultados Reales de Pruebas (ejecutadas en Google Chrome `--headless=new` sobre `file:///`):**
  - **Verificación intermedia 3.1:**
    - Carga inicial (`Caso PDF #1`): `n=323`, `φ(n)=288`, Pública `(323, 5)`, Privada `(323, 173)`, cero errores en consola y `ejecutarAutotest()` con `2/2` casos en verde.
    - Entradas inválidas probadas: `p=4` (`"El valor p = 4 no es un número primo..."`), `p=q=17` (`"Los primos p y q deben ser distintos..."`), `p=7, q=11` (`"El módulo n = p · q = 77 es menor o igual a 255..."`), y `e=6` con `φ(n)=288` (`"mcd(6, 288) = 6 ≠ 1..."` + chips `5, 7, 11, 13, 17, 19`). Todas activaron `#keygen-alert` en rojo y limpiaron las métricas.
    - Botones `Autogenerar Primos` (probado en `pequenos` y `medianos`), `Sugerir e` (rotando `5 → 7`), `Cargar Caso de Prueba` (`Caso PDF #2` -> `n=437, φ=396, (437, 5), (437, 317)`) y `Limpiar Todo` verificados sin errores.
  - **Verificación intermedia 3.2:**
    - `"Mate Discreta 2026"` cifrado y descifrado exactamente con `18/18` filas verificadas `M = M'`.
    - `"Criptografía"` (con tilde `í`) cifrado y descifrado exactamente con `12/12` filas verificadas `M = M'`.
    - Limpieza automática en descifrado validada con `[21, 129, 247, 12]`, `21   129\n247   12` $\rightarrow$ `"HOLA"` (normalizado a `21, 129, 247, 12`) y `21, 129, 247` $\rightarrow$ `"HOL"`.
    - Caracteres fuera de ASCII extendido (`"Precio 10 €"` y `"Hola 🚀"`) bloqueados con alerta roja descriptiva en `#cipher-alert`.
  - **Verificación intermedia 3.3 e integral:**
    - Pestaña 1 (*Euclides*) muestra divisiones sucesivas (`288 = 5 · 57 + 3 ...`, y ante `e=6` muestra `288 = 6 · 48 + 0` con `mcd = 6 ≠ 1`).
    - Pestaña 2 (*Euclides Extendido*) muestra identidad de Bézout (`5 · (-115) + 288 · (2) = 1`), normalización de $d = 173$ y verificación `(5 · 173) mod 288 = 1`.
    - Pestaña 3 (*Exponenciación Modular*) muestra cifrado y descifrado binario bit a bit para el bloque seleccionado (por defecto `#1: 'H'` con `72^5 mod 323 = 21` y `21^173 mod 323 = 72`, cambiando dinámicamente al seleccionar `#2: 'O'`).
    - Los 3 botones de documentación (`Manual_Usuario_RSA.pdf`, `Investigacion_RSA.pdf`, `Codigo_Fuente_RSA.pdf`) abren y cierran el modal limpiamente (`src="about:blank"` al cerrar).
    - Carga directa de `index.html` por `file://` verificada con `0` errores de consola.
