# Manual de Uso — Cómo Ejecutar la Refactorización de `Proyecto_RSA_Discreta` en 5 Chats

Este flujo te permite dividir la lógica matemática y las comprobaciones **una fase por chat**, usando el modelo más adecuado para cada paso, vigilando los cálculos con `node test_rsa_temp.js` y limpiando todos los archivos temporales al final.

---

## Flujo de trabajo en 4 pasos (se repite en cada fase)

1. **Abre un chat nuevo** apuntando a `Proyecto_RSA_Discreta` y selecciona en el selector de modelo el indicado en `PLANTILLA_CHAT_NUEVO.md` para esa fase.
2. **Copia y pega** el bloque de esa fase desde `PLANTILLA_CHAT_NUEVO.md`.
3. **Deja que el agente trabaje:**
   - Leerá `ESTADO_PROYECTO.md`, `RESTRICCIONES.md` y `PLAN_MAESTRO.md`.
   - Ejecutará solo esa fase, correrá `node test_rsa_temp.js` (Fases 1 a 4) y actualizará `ESTADO_PROYECTO.md`.
   - Se detendrá mostrándote la **Lista de Pruebas**.
4. **Verifica y decide:**
   - **Si todo pasa:** responde **`Confirmado`**, cierra ese chat y abre uno nuevo para la siguiente fase.
   - **Si algo falló o no te gustó:** NO abras otro chat; responde en ese mismo chat **`Cancelo, corrige X`** hasta que pase la prueba.

---

## Resumen rápido de las 5 Fases

- **Chat 1 (`Gemini 4 Hydrogen — Medium`):** Saca `ejecutarAutotest` de `js/rsa.js` hacia `test_rsa_temp.js` y deja lista la red de seguridad automática en Node.js.
- **Chat 2 (`Gemini 4 Hydrogen — Alto`):** Limpia `js/rsa.js` (100% matemática + `pasos`) y crea `js/validaciones.js` con todos los parseos, comprobaciones y mensajes de error exactos.
- **Chat 3 (`Gemini 4 Argon — Medium`):** Conecta `js/validaciones.js` en `index.html` (entre `rsa.js` y `app.js`) y adapta `js/app.js` sin cambiar textos, alertas ni tablas visuales.
- **Chat 4 (`Gemini 4 Neon — Medium`):** Regenera `docs/Codigo_Fuente_RSA.pdf` poniendo `js/rsa.js` de primero e incluyendo todo el código fuente del proyecto, dejando intactos los otros 2 PDFs.
- **Chat 5 (`Orchestrator (Neon)`):** Corre la última validación y borra `test_rsa_temp.js` + los 5 archivos `.md` temporales, dejando el proyecto limpio para entregar y exponer.

---

## Consejos Rápidos
- **¿Olvidaste en qué fase vas?** Revisa la línea **Próxima fase a ejecutar** en `ESTADO_PROYECTO.md`.
- **Al terminar la Fase 5:** este mismo manual (`MANUAL_DE_USO.md`) habrá sido eliminado automáticamente para dejar tu carpeta de entrega impecable.
