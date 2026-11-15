(function (global) {
  "use strict";

  /**
   * Módulo lógico del criptosistema RSA.
   * Se irá completando paso a paso con aritmética modular (BigInt).
   */
  const RSAEngine = {
    version: "0.1.0",

    /**
     * Verifica si el entorno soporta BigInt para cálculos RSA precisos.
     * @returns {boolean}
     */
    isSupported: function () {
      return typeof BigInt === "function";
    }
  };

  global.RSAEngine = RSAEngine;
})(window);
