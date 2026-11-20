(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const engine = window.RSAEngine;
    const validaciones = window.RSAValidaciones;

    // -------------------------------------------------------------------------
    // 1. Referencias del Visor Modal de Documentación (Fase 1 - Intacto)
    // -------------------------------------------------------------------------
    const docButtons = document.querySelectorAll("[data-doc-src]");
    const modal = document.getElementById("doc-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalCloseBtn = document.getElementById("modal-close-btn");
    const modalExternalLink = document.getElementById("modal-external-link");
    const docIframe = document.getElementById("doc-iframe");

    let lastFocusedElement = null;

    function openDocModal(src, title) {
      lastFocusedElement = document.activeElement;
      modalTitle.textContent = title || "Documento";
      docIframe.src = src;
      modalExternalLink.href = src;
      modal.hidden = false;
      document.body.classList.add("modal-open");
      modalCloseBtn.focus();
    }

    function closeDocModal() {
      if (modal.hidden) {
        return;
      }
      modal.hidden = true;
      document.body.classList.remove("modal-open");
      docIframe.src = "about:blank";
      modalExternalLink.href = "#";
      if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus();
      }
    }

    docButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const src = button.getAttribute("data-doc-src");
        const title = button.getAttribute("data-doc-title");
        if (src) {
          openDocModal(src, title);
        }
      });
    });

    modalCloseBtn.addEventListener("click", closeDocModal);

    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeDocModal();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.hidden) {
        closeDocModal();
      }
    });

    // -------------------------------------------------------------------------
    // 2. Referencias del Panel Principal RSA y Tarjeta 1 (Paso 3.1)
    // -------------------------------------------------------------------------
    const rsaStatus = document.getElementById("rsa-status");
    const selectDemoCase = document.getElementById("select-demo-case");
    const btnLoadDemo = document.getElementById("btn-load-demo");
    const btnClearAll = document.getElementById("btn-clear-all");

    const primeRangeSelect = document.getElementById("prime-range");
    const btnAutogenPrimes = document.getElementById("btn-autogen-primes");
    const btnSuggestE = document.getElementById("btn-suggest-e");
    const btnGenerateKeys = document.getElementById("btn-generate-keys");

    const inputP = document.getElementById("input-p");
    const inputQ = document.getElementById("input-q");
    const inputE = document.getElementById("input-e");

    const badgeP = document.getElementById("badge-p-status");
    const badgeQ = document.getElementById("badge-q-status");
    const badgeE = document.getElementById("badge-e-status");

    const keygenAlert = document.getElementById("keygen-alert");
    const keygenAlertMessage = document.getElementById("keygen-alert-message");
    const keygenSuggestions = document.getElementById("keygen-suggestions");

    const valN = document.getElementById("val-n");
    const detailN = document.getElementById("detail-n");
    const valPhi = document.getElementById("val-phi");
    const detailPhi = document.getElementById("detail-phi");
    const valPublicKey = document.getElementById("val-public-key");
    const detailPublicKey = document.getElementById("detail-public-key");
    const valPrivateKey = document.getElementById("val-private-key");
    const detailPrivateKey = document.getElementById("detail-private-key");

    // -------------------------------------------------------------------------
    // 3. Referencias de Tarjeta 2 y Tabla de Transformación (Paso 3.2)
    // -------------------------------------------------------------------------
    const cipherAlert = document.getElementById("cipher-alert");
    const cipherAlertMessage = document.getElementById("cipher-alert-message");

    const inputPlaintext = document.getElementById("input-plaintext");
    const btnEncrypt = document.getElementById("btn-encrypt");
    const btnSendToDecrypt = document.getElementById("btn-send-to-decrypt");
    const outputCiphertext = document.getElementById("output-ciphertext");
    const encryptKeyHint = document.getElementById("encrypt-key-hint");

    const inputCiphertext = document.getElementById("input-ciphertext");
    const btnDecrypt = document.getElementById("btn-decrypt");
    const outputDecrypted = document.getElementById("output-decrypted");
    const outputDecryptedAscii = document.getElementById("output-decrypted-ascii");
    const decryptKeyHint = document.getElementById("decrypt-key-hint");

    const transformationSummary = document.getElementById("transformation-summary");
    const transformationTbody = document.getElementById("transformation-tbody");

    // -------------------------------------------------------------------------
    // 4. Referencias de Tarjeta 3: Procedimiento Paso a Paso (Paso 3.3)
    // -------------------------------------------------------------------------
    const tabButtons = document.querySelectorAll("[data-tab]");
    const tabPanels = {
      euclides: document.getElementById("tab-panel-euclides"),
      extendido: document.getElementById("tab-panel-extendido"),
      exponenciacion: document.getElementById("tab-panel-exponenciacion")
    };

    const euclidesSummary = document.getElementById("euclides-summary");
    const euclidesTbody = document.getElementById("euclides-tbody");
    const extendidoSummary = document.getElementById("extendido-summary");
    const extendidoTbody = document.getElementById("extendido-tbody");

    const selectExpBlock = document.getElementById("select-exp-block");
    const expEncryptMeta = document.getElementById("exp-encrypt-meta");
    const expEncryptTbody = document.getElementById("exp-encrypt-tbody");
    const expDecryptMeta = document.getElementById("exp-decrypt-meta");
    const expDecryptTbody = document.getElementById("exp-decrypt-tbody");

    const DEMO_CASES = {
      caso1: { p: "17", q: "19", e: "5", mensaje: "HOLA" },
      caso2: { p: "19", q: "23", e: "5", mensaje: "RSA" }
    };

    const state = {
      claves: null,
      euclidesPreview: null,
      ultimoCifrado: null,
      ultimoDescifrado: null,
      tabActiva: "euclides"
    };

    if (!engine || !validaciones || !engine.isSupported()) {
      rsaStatus.textContent = "Navegador sin soporte BigInt";
      rsaStatus.className = "status-pill status-error";
      return;
    }

    function setStatusPill(texto, tipo) {
      rsaStatus.textContent = texto;
      rsaStatus.className = "status-pill";
      if (tipo === "error") {
        rsaStatus.classList.add("status-error");
      } else if (tipo === "idle") {
        rsaStatus.classList.add("status-idle");
      }
    }

    function setFieldBadge(badgeEl, inputEl, texto, estado) {
      badgeEl.textContent = texto;
      badgeEl.className = "field-badge";
      if (estado === "ok") {
        badgeEl.classList.add("badge-ok");
        inputEl.classList.remove("input-invalid");
      } else if (estado === "error") {
        badgeEl.classList.add("badge-error");
        inputEl.classList.add("input-invalid");
      } else {
        badgeEl.classList.add("badge-neutral");
        inputEl.classList.remove("input-invalid");
      }
    }

    function actualizarBadgesIndividuales(resultadoClaves) {
      const estados = validaciones.validarEstadoCamposClave(
        inputP.value,
        inputQ.value,
        inputE.value,
        resultadoClaves
      );
      setFieldBadge(badgeP, inputP, estados.p.texto, estados.p.estado);
      setFieldBadge(badgeQ, inputQ, estados.q.texto, estados.q.estado);
      setFieldBadge(badgeE, inputE, estados.e.texto, estados.e.estado);
    }

    function mostrarAlertaClaves(mensaje, sugerencias) {
      keygenAlertMessage.textContent = mensaje;
      keygenSuggestions.innerHTML = "";

      if (Array.isArray(sugerencias) && sugerencias.length > 0) {
        const label = document.createElement("span");
        label.className = "suggestions-label";
        label.textContent = "Sugerencias válidas para e:";
        keygenSuggestions.appendChild(label);

        sugerencias.slice(0, 6).forEach(function (valor) {
          const chip = document.createElement("button");
          chip.type = "button";
          chip.className = "suggestion-chip";
          chip.textContent = String(valor);
          chip.title = "Usar e = " + String(valor);
          chip.addEventListener("click", function () {
            inputE.value = String(valor);
            procesarGeneracionClaves(false);
          });
          keygenSuggestions.appendChild(chip);
        });

        keygenSuggestions.hidden = false;
      } else {
        keygenSuggestions.hidden = true;
      }

      keygenAlert.hidden = false;
    }

    function ocultarAlertaClaves() {
      keygenAlert.hidden = true;
      keygenAlertMessage.textContent = "";
      keygenSuggestions.innerHTML = "";
      keygenSuggestions.hidden = true;
    }

    function limpiarMetricasClaves(textoDetalle) {
      const msg = textoDetalle || "Esperando parámetros válidos";
      valN.textContent = "—";
      detailN.textContent = msg;
      valPhi.textContent = "—";
      detailPhi.textContent = msg;
      valPublicKey.textContent = "—";
      detailPublicKey.textContent = "Cifrado: C = M^e mod n";
      valPrivateKey.textContent = "—";
      detailPrivateKey.textContent = "Descifrado: M' = C^d mod n";
    }

    function renderizarMetricasClaves(res) {
      valN.textContent = res.nBig.toString();
      detailN.textContent = res.pBig.toString() + " × " + res.qBig.toString() + " = " + res.nBig.toString() + " (> 255)";
      valPhi.textContent = res.phiBig.toString();
      detailPhi.textContent = "(" + res.pBig.toString() + " - 1)(" + res.qBig.toString() + " - 1) = " + res.phiBig.toString();
      valPublicKey.textContent = res.clavePublica.texto;
      detailPublicKey.textContent = "Cifrado: C = M^" + res.eBig.toString() + " mod " + res.nBig.toString();
      valPrivateKey.textContent = res.clavePrivada.texto;
      detailPrivateKey.textContent = "d = " + res.dBig.toString() + " (inverso mod " + res.phiBig.toString() + ")";
    }

    function actualizarHintsClaves(claves) {
      if (claves && claves.valido) {
        encryptKeyHint.textContent = "Clave pública: " + claves.clavePublica.texto;
        decryptKeyHint.textContent = "Clave privada: " + claves.clavePrivada.texto;
      } else {
        encryptKeyHint.textContent = "Clave pública: —";
        decryptKeyHint.textContent = "Clave privada: —";
      }
    }

    function mostrarAlertaCifrado(mensaje) {
      cipherAlertMessage.textContent = mensaje;
      cipherAlert.hidden = false;
    }

    function ocultarAlertaCifrado() {
      cipherAlert.hidden = true;
      cipherAlertMessage.textContent = "";
    }

    function formatearCaracterVisible(ch, codigo) {
      if (ch === " ") {
        return { texto: "␣", title: "Espacio (ASCII 32)", esEspecial: true };
      }
      if (ch === "\n") {
        return { texto: "\\n", title: "Salto de línea (ASCII 10)", esEspecial: true };
      }
      if (ch === "\r") {
        return { texto: "\\r", title: "Retorno de carro (ASCII 13)", esEspecial: true };
      }
      if (ch === "\t") {
        return { texto: "\\t", title: "Tabulación (ASCII 9)", esEspecial: true };
      }
      if (codigo < 32 || codigo === 127) {
        return { texto: "CTRL(" + codigo + ")", title: "Control ASCII " + codigo, esEspecial: true };
      }
      return { texto: ch, title: "ASCII " + codigo, esEspecial: false };
    }

    function crearCeldaCaracter(ch, codigo, esFinal) {
      const td = document.createElement("td");
      if (ch === null || ch === undefined) {
        td.textContent = "—";
        return td;
      }
      const info = formatearCaracterVisible(ch, codigo);
      const pill = document.createElement("span");
      pill.className = "char-pill";
      if (info.esEspecial) {
        pill.classList.add("char-pill-space");
      }
      if (esFinal) {
        pill.classList.add("char-pill-final");
      }
      pill.textContent = info.texto;
      pill.title = info.title;
      td.appendChild(pill);
      return td;
    }

    function limpiarTablaTransformacion(mensajeVacio) {
      transformationTbody.innerHTML = "";
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 5;
      td.className = "table-empty";
      td.textContent = mensajeVacio || "Cifra o descifra un mensaje para inspeccionar la transformación carácter por carácter.";
      tr.appendChild(td);
      transformationTbody.appendChild(tr);

      transformationSummary.textContent = "Sin operaciones";
      transformationSummary.className = "status-pill status-idle";
    }

    function renderizarTablaTransformacion(filas, resumenTexto, resumenError) {
      if (!Array.isArray(filas) || filas.length === 0) {
        limpiarTablaTransformacion();
        return;
      }

      transformationTbody.innerHTML = "";

      filas.forEach(function (fila) {
        const tr = document.createElement("tr");

        tr.appendChild(crearCeldaCaracter(fila.caracterOriginal, fila.asciiOriginal, false));

        const tdM = document.createElement("td");
        tdM.className = "mono-cell";
        tdM.textContent = fila.asciiOriginal !== null ? String(fila.asciiOriginal) : "—";
        tr.appendChild(tdM);

        const tdC = document.createElement("td");
        tdC.className = "mono-cell";
        tdC.textContent = fila.cifradoTexto;
        tr.appendChild(tdC);

        const tdMPrima = document.createElement("td");
        tdMPrima.className = "mono-cell";
        tdMPrima.textContent = fila.descifradoTexto;
        if (fila.coincide) {
          const badge = document.createElement("span");
          badge.className = "match-badge";
          badge.textContent = "M = M'";
          tdMPrima.appendChild(badge);
        }
        tr.appendChild(tdMPrima);

        tr.appendChild(crearCeldaCaracter(fila.caracterFinal, fila.asciiFinal, true));

        transformationTbody.appendChild(tr);
      });

      transformationSummary.textContent = resumenTexto;
      transformationSummary.className = resumenError ? "status-pill status-error" : "status-pill";
    }

    function limpiarResultadosCifradoParcial() {
      state.ultimoCifrado = null;
      state.ultimoDescifrado = null;
      ocultarAlertaCifrado();
      outputCiphertext.value = "";
      outputDecrypted.textContent = "—";
      outputDecrypted.classList.add("is-empty");
      outputDecryptedAscii.textContent = "Esperando bloques para descifrar";
      limpiarTablaTransformacion();
      actualizarSelectorYExponenciacion();
    }

    // -------------------------------------------------------------------------
    // Funciones de renderizado para Paso 3.3 (Pestañas Paso a Paso)
    // -------------------------------------------------------------------------
    function activarPestana(nombreTab) {
      state.tabActiva = nombreTab;
      tabButtons.forEach(function (btn) {
        const esActiva = btn.getAttribute("data-tab") === nombreTab;
        btn.classList.toggle("is-active", esActiva);
        btn.setAttribute("aria-selected", esActiva ? "true" : "false");
      });
      Object.keys(tabPanels).forEach(function (key) {
        tabPanels[key].hidden = key !== nombreTab;
      });
    }

    tabButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const nombreTab = btn.getAttribute("data-tab");
        if (nombreTab) {
          activarPestana(nombreTab);
        }
      });
    });

    function crearFilaVacia(colspan, texto) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = colspan;
      td.className = "table-empty";
      td.textContent = texto;
      tr.appendChild(td);
      return tr;
    }

    function renderizarPasoEuclides(euclidesInfo) {
      euclidesTbody.innerHTML = "";

      if (!euclidesInfo || !Array.isArray(euclidesInfo.pasos) || euclidesInfo.pasos.length === 0) {
        euclidesSummary.className = "step-summary-box is-idle";
        euclidesSummary.textContent = "Genera o valida claves para ver las divisiones sucesivas de mcd(e, φ(n)).";
        euclidesTbody.appendChild(crearFilaVacia(6, "Sin datos del Algoritmo de Euclides."));
        return;
      }

      if (euclidesInfo.esCoprimo) {
        euclidesSummary.className = "step-summary-box is-success";
        euclidesSummary.innerHTML = "";
        const linea = document.createElement("div");
        linea.className = "summary-mono";
        linea.textContent =
          "Resultado: mcd(" + euclidesInfo.aBig.toString() + ", " + euclidesInfo.bBig.toString() + ") = " +
          euclidesInfo.mcdBig.toString() + " → Coprimos (exponente e válido).";
        euclidesSummary.appendChild(linea);
      } else {
        euclidesSummary.className = "step-summary-box is-error";
        euclidesSummary.innerHTML = "";
        const linea = document.createElement("div");
        linea.className = "summary-mono";
        linea.textContent =
          "Resultado: mcd(" + euclidesInfo.aBig.toString() + ", " + euclidesInfo.bBig.toString() + ") = " +
          euclidesInfo.mcdBig.toString() + " ≠ 1 → No son coprimos (e no tiene inverso modular).";
        euclidesSummary.appendChild(linea);
      }

      euclidesInfo.pasos.forEach(function (p) {
        const tr = document.createElement("tr");

        const celdas = [
          { text: String(p.paso), mono: true },
          { text: p.dividendoBig.toString(), mono: true },
          { text: p.divisorBig.toString(), mono: true },
          { text: p.cocienteBig.toString(), mono: true },
          { text: p.residuoBig.toString(), mono: true },
          { text: p.ecuacion, mono: true }
        ];

        celdas.forEach(function (c) {
          const td = document.createElement("td");
          if (c.mono) {
            td.className = "mono-cell";
          }
          td.textContent = c.text;
          tr.appendChild(td);
        });

        euclidesTbody.appendChild(tr);
      });
    }

    function renderizarPasoExtendido(extInfo, claveValida) {
      extendidoTbody.innerHTML = "";

      if (!claveValida || !extInfo || !Array.isArray(extInfo.pasos) || extInfo.pasos.length === 0) {
        extendidoSummary.className = state.euclidesPreview && !state.euclidesPreview.esCoprimo
          ? "step-summary-box is-error"
          : "step-summary-box is-idle";
        extendidoSummary.textContent = state.euclidesPreview && !state.euclidesPreview.esCoprimo
          ? "No existe inverso modular d porque mcd(e, φ(n)) ≠ 1. Selecciona un exponente e coprimo con φ(n)."
          : "Genera claves válidas para ver la identidad de Bézout y la normalización del inverso modular d.";
        extendidoTbody.appendChild(crearFilaVacia(4, "Sin datos de Euclides Extendido."));
        return;
      }

      extendidoSummary.className = "step-summary-box is-success";
      extendidoSummary.innerHTML = "";
      const wrapper = document.createElement("div");
      wrapper.className = "summary-lines";

      const l1 = document.createElement("div");
      l1.className = "summary-mono";
      l1.textContent = "Identidad de Bézout: " + extInfo.identidadBezout;

      const l2 = document.createElement("div");
      l2.textContent = "Normalización: " + extInfo.normalizacionTexto;

      const l3 = document.createElement("div");
      l3.className = "summary-mono";
      l3.textContent = "Verificación modular: " + extInfo.verificacion;

      wrapper.appendChild(l1);
      wrapper.appendChild(l2);
      wrapper.appendChild(l3);
      extendidoSummary.appendChild(wrapper);

      extInfo.pasos.forEach(function (p) {
        const tr = document.createElement("tr");

        const tdPaso = document.createElement("td");
        tdPaso.className = "mono-cell";
        tdPaso.textContent = String(p.paso);
        tr.appendChild(tdPaso);

        const tdDiv = document.createElement("td");
        tdDiv.className = "mono-cell";
        tdDiv.textContent = p.ecuacionDivision;
        tr.appendChild(tdDiv);

        const tdCoef = document.createElement("td");
        tdCoef.className = "mono-cell";
        tdCoef.textContent = p.ecuacionCoeficiente;
        tr.appendChild(tdCoef);

        const tdComb = document.createElement("td");
        tdComb.className = "mono-cell";
        tdComb.textContent = p.combinacionLineal;
        tr.appendChild(tdComb);

        extendidoTbody.appendChild(tr);
      });
    }

    function renderizarTablaExponenciacion(metaEl, tbodyEl, expInfo, tipoOperacion, mensajeVacio) {
      tbodyEl.innerHTML = "";

      if (!expInfo) {
        metaEl.className = "step-summary-box is-idle";
        metaEl.textContent = mensajeVacio;
        tbodyEl.appendChild(crearFilaVacia(6, "Sin pasos binarios para mostrar."));
        return;
      }

      metaEl.className = tipoOperacion === "cifrado" ? "step-summary-box" : "step-summary-box is-success";
      metaEl.innerHTML = "";
      const wrapper = document.createElement("div");
      wrapper.className = "summary-lines";

      const l1 = document.createElement("div");
      l1.className = "summary-mono";
      l1.textContent = "Ecuación: " + expInfo.ecuacion;

      const l2 = document.createElement("div");
      l2.className = "summary-mono";
      l2.textContent = "Exponente binario: " + expInfo.descomposicionTexto;

      wrapper.appendChild(l1);
      wrapper.appendChild(l2);
      metaEl.appendChild(wrapper);

      expInfo.pasos.forEach(function (paso) {
        const tr = document.createElement("tr");

        const tdIter = document.createElement("td");
        tdIter.className = "mono-cell";
        tdIter.textContent = String(paso.iteracion);
        tr.appendChild(tdIter);

        const tdPow = document.createElement("td");
        tdPow.className = "mono-cell";
        tdPow.textContent = paso.potenciaDosBig.toString();
        tr.appendChild(tdPow);

        const tdBit = document.createElement("td");
        const bitPill = document.createElement("span");
        bitPill.className = "bit-pill " + (paso.bit === 1 ? "bit-1" : "bit-0");
        bitPill.textContent = String(paso.bit);
        tdBit.appendChild(bitPill);
        tr.appendChild(tdBit);

        const tdBase = document.createElement("td");
        tdBase.className = "mono-cell";
        tdBase.textContent = paso.baseModularBig.toString();
        tr.appendChild(tdBase);

        const tdOp = document.createElement("td");
        tdOp.className = "mono-cell";
        tdOp.textContent = paso.operacionResultado;
        tr.appendChild(tdOp);

        const tdSq = document.createElement("td");
        tdSq.className = "mono-cell";
        tdSq.textContent = paso.cuadradoModular;
        tr.appendChild(tdSq);

        tbodyEl.appendChild(tr);
      });
    }

    function renderizarExponenciacionPorIndice(indice) {
      const detallesC = state.ultimoCifrado && state.ultimoCifrado.valido ? state.ultimoCifrado.detalles : null;
      const detallesD = state.ultimoDescifrado && state.ultimoDescifrado.valido ? state.ultimoDescifrado.detalles : null;

      const detC = detallesC && detallesC[indice] ? detallesC[indice] : null;
      const detD = detallesD && detallesD[indice] ? detallesD[indice] : null;

      renderizarTablaExponenciacion(
        expEncryptMeta,
        expEncryptTbody,
        detC ? detC.exponenciacion : null,
        "cifrado",
        detD
          ? "Solo se ejecutó descifrado directo; cifra un mensaje para ver C = M^e mod n."
          : "Cifra un mensaje para ver la exponenciación binaria de cifrado."
      );

      renderizarTablaExponenciacion(
        expDecryptMeta,
        expDecryptTbody,
        detD ? detD.exponenciacion : null,
        "descifrado",
        "Descifra o cifra un mensaje para ver la exponenciación binaria de descifrado."
      );
    }

    function actualizarSelectorYExponenciacion(indicePreferido) {
      const detallesC = state.ultimoCifrado && state.ultimoCifrado.valido ? state.ultimoCifrado.detalles : null;
      const detallesD = state.ultimoDescifrado && state.ultimoDescifrado.valido ? state.ultimoDescifrado.detalles : null;
      const baseLista = detallesC || detallesD;

      selectExpBlock.innerHTML = "";

      if (!baseLista || baseLista.length === 0) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "Sin bloques cifrados o descifrados";
        selectExpBlock.appendChild(opt);
        selectExpBlock.disabled = true;
        renderizarExponenciacionPorIndice(-1);
        return;
      }

      selectExpBlock.disabled = false;

      baseLista.forEach(function (item, idx) {
        const opt = document.createElement("option");
        opt.value = String(idx);
        const detC = detallesC && detallesC[idx] ? detallesC[idx] : null;
        const detD = detallesD && detallesD[idx] ? detallesD[idx] : null;

        if (detC && detD) {
          const chVis = formatearCaracterVisible(detC.caracter, detC.ascii).texto;
          opt.textContent =
            "#" + (idx + 1) + ": '" + chVis + "' (M=" + detC.ascii + ") → C=" +
            detC.cBig.toString() + " → M'=" + detD.mPrimaBig.toString();
        } else if (detD) {
          const chVisD = formatearCaracterVisible(detD.caracter, detD.ascii).texto;
          opt.textContent =
            "#" + (idx + 1) + ": Bloque C=" + detD.cBig.toString() +
            " → M'=" + detD.mPrimaBig.toString() + " ('" + chVisD + "')";
        }

        selectExpBlock.appendChild(opt);
      });

      const indiceFinal =
        typeof indicePreferido === "number" && indicePreferido >= 0 && indicePreferido < baseLista.length
          ? indicePreferido
          : 0;

      selectExpBlock.value = String(indiceFinal);
      renderizarExponenciacionPorIndice(indiceFinal);
    }

    selectExpBlock.addEventListener("change", function () {
      const idx = parseInt(selectExpBlock.value, 10);
      if (!Number.isNaN(idx)) {
        renderizarExponenciacionPorIndice(idx);
      }
    });

    function asegurarClavesValidas() {
      if (state.claves && state.claves.valido) {
        return state.claves;
      }
      const res = procesarGeneracionClaves(false);
      if (!res || !res.valido) {
        mostrarAlertaCifrado("Configura primero parámetros válidos para p, q y e en el Paso 1 antes de cifrar o descifrar.");
        return null;
      }
      return res;
    }

    function ejecutarCifrado() {
      const claves = asegurarClavesValidas();
      if (!claves) {
        return null;
      }

      const texto = inputPlaintext.value;
      const cifrado = validaciones.validarYCifrarMensaje(texto, claves.eBig, claves.nBig);

      if (!cifrado.valido) {
        state.ultimoCifrado = null;
        state.ultimoDescifrado = null;
        outputCiphertext.value = "";
        mostrarAlertaCifrado(cifrado.error);
        limpiarTablaTransformacion("Corrija el mensaje para generar la tabla de transformación.");
        actualizarSelectorYExponenciacion();
        return null;
      }

      ocultarAlertaCifrado();
      state.ultimoCifrado = cifrado;
      outputCiphertext.value = cifrado.textoCifrado;

      const verifDescifrado = validaciones.validarYDescifrarMensaje(cifrado.bloquesBig, claves.dBig, claves.nBig);
      if (verifDescifrado.valido) {
        state.ultimoDescifrado = verifDescifrado;
        let coincidencias = 0;
        const filas = cifrado.detalles.map(function (detC, idx) {
          const detD = verifDescifrado.detalles[idx];
          const coincide = detC.ascii === detD.descifrado;
          if (coincide) {
            coincidencias += 1;
          }
          return {
            caracterOriginal: detC.caracter,
            asciiOriginal: detC.ascii,
            cifradoTexto: detC.cBig.toString(),
            descifradoTexto: detD.mPrimaBig.toString(),
            caracterFinal: detD.caracter,
            asciiFinal: detD.ascii,
            coincide: coincide
          };
        });

        const todasOk = coincidencias === filas.length;
        renderizarTablaTransformacion(
          filas,
          todasOk
            ? "Verificado: M = M' (" + coincidencias + "/" + filas.length + " caracteres)"
            : "Discrepancia detectada (" + coincidencias + "/" + filas.length + ")",
          !todasOk
        );
      }

      actualizarSelectorYExponenciacion(0);
      return cifrado;
    }

    function ejecutarDescifrado() {
      const claves = asegurarClavesValidas();
      if (!claves) {
        return null;
      }

      const entradaBloques = inputCiphertext.value;
      const descifrado = validaciones.validarYDescifrarMensaje(entradaBloques, claves.dBig, claves.nBig);

      if (!descifrado.valido) {
        state.ultimoDescifrado = null;
        outputDecrypted.textContent = "—";
        outputDecrypted.classList.add("is-empty");
        outputDecryptedAscii.textContent = "No se pudo descifrar la entrada";
        mostrarAlertaCifrado(descifrado.error);
        actualizarSelectorYExponenciacion();
        return null;
      }

      ocultarAlertaCifrado();
      // Normalizar visualmente la caja de entrada (sin corchetes/espacios extra/saltos)
      inputCiphertext.value = descifrado.bloquesCifrados.join(", ");
      outputDecrypted.textContent = descifrado.mensajeDescifrado;
      outputDecrypted.classList.remove("is-empty");
      outputDecryptedAscii.textContent = "ASCII recuperado: [" + descifrado.bloquesDescifrados.join(", ") + "]";

      const coincideConUltimoCifrado =
        state.ultimoCifrado &&
        state.ultimoCifrado.valido &&
        state.ultimoCifrado.nBig === claves.nBig &&
        state.ultimoCifrado.bloques.length === descifrado.bloquesCifrados.length &&
        state.ultimoCifrado.bloques.every(function (b, idx) {
          return b === descifrado.bloquesCifrados[idx];
        });

      state.ultimoDescifrado = descifrado;
      if (!coincideConUltimoCifrado) {
        state.ultimoCifrado = null;
      }

      if (coincideConUltimoCifrado) {
        let coincidencias = 0;
        const filas = state.ultimoCifrado.detalles.map(function (detC, idx) {
          const detD = descifrado.detalles[idx];
          const coincide = detC.ascii === detD.descifrado;
          if (coincide) {
            coincidencias += 1;
          }
          return {
            caracterOriginal: detC.caracter,
            asciiOriginal: detC.ascii,
            cifradoTexto: detC.cBig.toString(),
            descifradoTexto: detD.mPrimaBig.toString(),
            caracterFinal: detD.caracter,
            asciiFinal: detD.ascii,
            coincide: coincide
          };
        });

        renderizarTablaTransformacion(
          filas,
          "Verificado: M = M' (" + coincidencias + "/" + filas.length + " caracteres)",
          coincidencias !== filas.length
        );
      } else {
        const filasSoloDescifrado = descifrado.detalles.map(function (detD) {
          const reCheck = engine.potenciaModular(detD.mPrimaBig, claves.eBig, claves.nBig);
          const coincide = reCheck.resultadoBig === detD.cBig;
          return {
            caracterOriginal: null,
            asciiOriginal: null,
            cifradoTexto: detD.cBig.toString(),
            descifradoTexto: detD.mPrimaBig.toString(),
            caracterFinal: detD.caracter,
            asciiFinal: detD.ascii,
            coincide: coincide
          };
        });

        renderizarTablaTransformacion(
          filasSoloDescifrado,
          "Descifrado completado (" + filasSoloDescifrado.length + " bloques)",
          false
        );
      }

      actualizarSelectorYExponenciacion(0);
      return descifrado;
    }

    function procesarGeneracionClaves(esEdicionEnVivo) {
      const pTxt = inputP.value.trim();
      const qTxt = inputQ.value.trim();
      const eTxt = inputE.value.trim();

      if (esEdicionEnVivo && (pTxt === "" || qTxt === "" || eTxt === "")) {
        state.claves = null;
        state.euclidesPreview = null;
        limpiarMetricasClaves("Complete p, q y e para calcular claves");
        actualizarBadgesIndividuales(null);
        actualizarHintsClaves(null);
        ocultarAlertaClaves();
        limpiarResultadosCifradoParcial();
        renderizarPasoEuclides(null);
        renderizarPasoExtendido(null, false);
        setStatusPill("Configurando parámetros", "idle");
        return null;
      }

      const res = validaciones.validarYGenerarClaves(pTxt, qTxt, eTxt);
      actualizarBadgesIndividuales(res);

      if (!res.valido) {
        state.claves = null;
        state.euclidesPreview = res.euclides || null;
        limpiarMetricasClaves("Parámetros inválidos");
        actualizarHintsClaves(null);
        mostrarAlertaClaves(res.error, res.sugerenciasE);
        limpiarResultadosCifradoParcial();
        renderizarPasoEuclides(state.euclidesPreview);
        renderizarPasoExtendido(null, false);
        setStatusPill("Error en parámetros RSA", "error");
        return res;
      }

      state.claves = res;
      state.euclidesPreview = res.euclides;
      ocultarAlertaClaves();
      renderizarMetricasClaves(res);
      actualizarHintsClaves(res);
      limpiarResultadosCifradoParcial();
      renderizarPasoEuclides(res.euclides);
      renderizarPasoExtendido(res.euclidesExtendido, true);
      setStatusPill("Claves listas: n=" + res.nBig.toString(), "ok");
      return res;
    }

    btnEncrypt.addEventListener("click", ejecutarCifrado);

    btnSendToDecrypt.addEventListener("click", function () {
      if (!outputCiphertext.value.trim()) {
        const cifrado = ejecutarCifrado();
        if (!cifrado) {
          return;
        }
      }
      inputCiphertext.value = outputCiphertext.value;
      ejecutarDescifrado();
    });

    btnDecrypt.addEventListener("click", ejecutarDescifrado);

    btnAutogenPrimes.addEventListener("click", function () {
      const rango = primeRangeSelect.value || "pequenos";
      const generados = engine.generarPrimos(rango);
      inputP.value = generados.pBig.toString();
      inputQ.value = generados.qBig.toString();

      const phiBig = (generados.pBig - 1n) * (generados.qBig - 1n);
      const eActual = inputE.value.trim();

      if (!validaciones.esExponenteValidoParaPhi(eActual, phiBig)) {
        const sug = engine.sugerirExponenteE(phiBig);
        inputE.value = sug.sugeridoBig.toString();
      }

      procesarGeneracionClaves(false);
    });

    btnSuggestE.addEventListener("click", function () {
      const infoPrimos = validaciones.validarPrimosParaSugerencia(inputP.value, inputQ.value);
      if (!infoPrimos.valido) {
        procesarGeneracionClaves(false);
        return;
      }

      const eTxt = inputE.value.trim();
      const eActualBig = validaciones.esEnteroTexto(eTxt) ? validaciones.aBigInt(eTxt, "e") : null;
      const sug = engine.sugerirExponenteE(infoPrimos.phiBig, eActualBig);
      inputE.value = sug.sugeridoBig.toString();
      procesarGeneracionClaves(false);
    });

    btnGenerateKeys.addEventListener("click", function () {
      procesarGeneracionClaves(false);
    });

    [inputP, inputQ, inputE].forEach(function (inputEl) {
      inputEl.addEventListener("input", function () {
        procesarGeneracionClaves(true);
      });
      inputEl.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          procesarGeneracionClaves(false);
        }
      });
    });

    function cargarCasoPrueba(idCaso) {
      const caso = DEMO_CASES[idCaso] || DEMO_CASES.caso1;
      primeRangeSelect.value = "pequenos";
      inputP.value = caso.p;
      inputQ.value = caso.q;
      inputE.value = caso.e;
      const res = procesarGeneracionClaves(false);
      if (res && res.valido) {
        inputPlaintext.value = caso.mensaje;
        const cif = ejecutarCifrado();
        if (cif && cif.valido) {
          inputCiphertext.value = cif.textoCifrado;
          ejecutarDescifrado();
        }
      }
    }

    function limpiarTodo() {
      inputP.value = "";
      inputQ.value = "";
      inputE.value = "";
      inputPlaintext.value = "";
      inputCiphertext.value = "";
      state.claves = null;
      state.euclidesPreview = null;
      ocultarAlertaClaves();
      actualizarBadgesIndividuales(null);
      actualizarHintsClaves(null);
      limpiarMetricasClaves("Esperando parámetros válidos");
      limpiarResultadosCifradoParcial();
      renderizarPasoEuclides(null);
      renderizarPasoExtendido(null, false);
      activarPestana("euclides");
      setStatusPill("Panel limpio · Listo para configurar", "idle");
    }

    btnLoadDemo.addEventListener("click", function () {
      cargarCasoPrueba(selectDemoCase.value);
    });

    btnClearAll.addEventListener("click", limpiarTodo);

    // Cargar Caso PDF #1 por defecto al iniciar
    cargarCasoPrueba("caso1");
  });
})();
