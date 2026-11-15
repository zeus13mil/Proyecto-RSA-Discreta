# ESTADO DEL PROYECTO — Criptosistema Asimétrico RSA

> Este archivo es la **memoria compartida entre chats**. Cada chat nuevo lo lee al iniciar y lo actualiza al terminar su fase.

## 1. Resumen de Estado Actual
- **Fase actual:** Fase 3 (Lista para iniciar)
- **Próxima fase a ejecutar:** Fase 3 — Interfaz Interactiva y Paso a Paso (`index.html`, `css/styles.css`, `js/app.js`)
- **Última fase confirmada por el usuario:** `Fase 2`

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
