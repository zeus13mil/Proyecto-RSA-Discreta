(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const docButtons = document.querySelectorAll("[data-doc-src]");
    const modal = document.getElementById("doc-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalCloseBtn = document.getElementById("modal-close-btn");
    const modalExternalLink = document.getElementById("modal-external-link");
    const docIframe = document.getElementById("doc-iframe");
    const rsaStatus = document.getElementById("rsa-status");

    let lastFocusedElement = null;

    /**
     * Abre el modal cargando el PDF indicado dentro del <iframe>.
     * @param {string} src Ruta relativa del documento local.
     * @param {string} title Título mostrado en el encabezado del modal.
     */
    function openDocModal(src, title) {
      lastFocusedElement = document.activeElement;
      modalTitle.textContent = title || "Documento";
      docIframe.src = src;
      modalExternalLink.href = src;
      modal.hidden = false;
      document.body.classList.add("modal-open");
      modalCloseBtn.focus();
    }

    /**
     * Cierra el modal y limpia el src del <iframe> para liberar memoria.
     */
    function closeDocModal() {
      if (modal.hidden) {
        return;
      }
      modal.hidden = true;
      document.body.classList.remove("modal-open");
      docIframe.src = "";
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

    // Inicialización base del panel RSA
    if (window.RSAEngine && window.RSAEngine.isSupported()) {
      rsaStatus.textContent = "Motor BigInt listo · Esperando implementación";
    } else {
      rsaStatus.textContent = "Navegador sin soporte BigInt";
    }
  });
})();
