# Plantilla para Abrir un Chat Nuevo (1 Fase por Chat)

Cada vez que abras un chat nuevo para avanzar una fase, selecciona el **modelo recomendado** y copia y pega el bloque correspondiente a la fase que toca.

---

## Orden de Chats y Modelo a Seleccionar

1. **Chat 1 (`Fase 1`):** Baseline `test_rsa_temp.js` + quitar `ejecutarAutotest` de `js/rsa.js` → **Gemini 4 Hydrogen — Medium**
2. **Chat 2 (`Fase 2`):** Dividir `js/rsa.js` (100% matemática) y `js/validaciones.js` (comprobaciones) → **Gemini 4 Hydrogen — Alto**
3. **Chat 3 (`Fase 3`):** Conectar `index.html` y `js/app.js` conservando textos y tablas intactos → **Gemini 4 Argon — Medium**
4. **Chat 4 (`Fase 4`):** Regenerar `docs/Codigo_Fuente_RSA.pdf` (`js/rsa.js` primero + todo el código fuente) → **Gemini 4 Neon — Medium**
5. **Chat 5 (`Fase 5`):** Verificación integral y limpieza total de archivos temporales → **Orchestrator (Neon)**

---

### Prompt para Chat 1 (Fase 1 — Gemini 4 Hydrogen — Medium)
```text
Estamos trabajando en el proyecto `Proyecto_RSA_Discreta` ubicado en `c:\Users\Josue\OneDrive\Documentos\ucr-JosueAlfaro-LAP\ucr-JosueAlfaro-LAP 2026\segundo semestre del 2026\mate discretas\Proyecto_RSA_Discreta`.

Antes de hacer nada:
1. Lee `ESTADO_PROYECTO.md`, `RESTRICCIONES.md` y la **Fase 1** de `PLAN_MAESTRO.md`.
2. Ejecuta ÚNICAMENTE la **Fase 1** completa (todos sus pasos en orden, verificando que lo existente siga funcionando).
3. Ejecuta `node test_rsa_temp.js`, actualiza `ESTADO_PROYECTO.md` con los archivos creados/modificados, hallazgos y resultados reales.
4. Muéstrame la Lista de Pruebas (automática + manual) y DETENTE para que yo confirme o cancele antes de pasar a la siguiente fase.
```

### Prompt para Chat 2 (Fase 2 — Gemini 4 Hydrogen — Alto)
```text
Estamos trabajando en el proyecto `Proyecto_RSA_Discreta` ubicado en `c:\Users\Josue\OneDrive\Documentos\ucr-JosueAlfaro-LAP\ucr-JosueAlfaro-LAP 2026\segundo semestre del 2026\mate discretas\Proyecto_RSA_Discreta`.

Antes de hacer nada:
1. Lee `ESTADO_PROYECTO.md`, `RESTRICCIONES.md` y la **Fase 2** de `PLAN_MAESTRO.md`.
2. Ejecuta ÚNICAMENTE la **Fase 2** completa (todos sus pasos en orden, cumpliendo todas las restricciones).
3. Ejecuta `node test_rsa_temp.js`, actualiza `ESTADO_PROYECTO.md` con los archivos creados/modificados, hallazgos y resultados reales.
4. Muéstrame la Lista de Pruebas (automática + manual) y DETENTE para que yo confirme o cancele antes de pasar a la siguiente fase.
```

### Prompt para Chat 3 (Fase 3 — Gemini 4 Argon — Medium)
```text
Estamos trabajando en el proyecto `Proyecto_RSA_Discreta` ubicado en `c:\Users\Josue\OneDrive\Documentos\ucr-JosueAlfaro-LAP\ucr-JosueAlfaro-LAP 2026\segundo semestre del 2026\mate discretas\Proyecto_RSA_Discreta`.

Antes de hacer nada:
1. Lee `ESTADO_PROYECTO.md`, `RESTRICCIONES.md` y la **Fase 3** de `PLAN_MAESTRO.md`.
2. Ejecuta ÚNICAMENTE la **Fase 3** completa (todos sus pasos en orden, conservando intactos todos los mensajes de error, flujo visual y tablas de la UI).
3. Ejecuta `node test_rsa_temp.js`, actualiza `ESTADO_PROYECTO.md` con los archivos creados/modificados, hallazgos y resultados reales.
4. Muéstrame la Lista de Pruebas (automática + manual) y DETENTE para que yo confirme o cancele antes de pasar a la siguiente fase.
```

### Prompt para Chat 4 (Fase 4 — Gemini 4 Neon — Medium)
```text
Estamos trabajando en el proyecto `Proyecto_RSA_Discreta` ubicado en `c:\Users\Josue\OneDrive\Documentos\ucr-JosueAlfaro-LAP\ucr-JosueAlfaro-LAP 2026\segundo semestre del 2026\mate discretas\Proyecto_RSA_Discreta`.

Antes de hacer nada:
1. Lee `ESTADO_PROYECTO.md`, `RESTRICCIONES.md` y la **Fase 4** de `PLAN_MAESTRO.md`.
2. Ejecuta ÚNICAMENTE la **Fase 4** completa (regenerando `docs/Codigo_Fuente_RSA.pdf` con `js/rsa.js` primero y todo el código fuente del proyecto, sin tocar `Investigacion_RSA.pdf` ni `Manual_Usuario_RSA.pdf`).
3. Ejecuta `node test_rsa_temp.js`, actualiza `ESTADO_PROYECTO.md` con los archivos creados/modificados, hallazgos y resultados reales.
4. Muéstrame la Lista de Pruebas (automática + manual) y DETENTE para que yo confirme o cancele antes de pasar a la siguiente fase.
```

### Prompt para Chat 5 (Fase 5 — Orchestrator (Neon))
```text
Estamos trabajando en el proyecto `Proyecto_RSA_Discreta` ubicado en `c:\Users\Josue\OneDrive\Documentos\ucr-JosueAlfaro-LAP\ucr-JosueAlfaro-LAP 2026\segundo semestre del 2026\mate discretas\Proyecto_RSA_Discreta`.

Antes de hacer nada:
1. Lee `ESTADO_PROYECTO.md`, `RESTRICCIONES.md` y la **Fase 5** de `PLAN_MAESTRO.md`.
2. Ejecuta ÚNICAMENTE la **Fase 5** completa: primero ejecuta `node test_rsa_temp.js` y audita el proyecto; una vez todo pase, realiza la limpieza total eliminando `test_rsa_temp.js` y todos los archivos `.md` temporales (`PLAN_MAESTRO.md`, `ESTADO_PROYECTO.md`, `RESTRICCIONES.md`, `PLANTILLA_CHAT_NUEVO.md`, `MANUAL_DE_USO.md`).
3. Muéstrame el listado final limpio de archivos del proyecto y la Lista de Pruebas Final para mi verificación en el navegador.
```
