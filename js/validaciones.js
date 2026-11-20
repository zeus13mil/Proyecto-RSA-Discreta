(function (global) {
  "use strict";

  /**
   * Obtiene la referencia al motor matemático RSAEngine.
   *
   * @returns {object}
   */
  function obtenerEngine() {
    if (!global.RSAEngine) {
      throw new Error("RSAEngine no está cargado. Verifique el orden de scripts (js/rsa.js antes de js/validaciones.js).");
    }
    return global.RSAEngine;
  }

  /**
   * Verifica si una cadena representa un entero válido (con signo opcional).
   *
   * @param {string} str Texto a evaluar.
   * @returns {boolean}
   */
  function esEnteroTexto(str) {
    if (typeof str !== "string") {
      return false;
    }
    return /^[+-]?\d+$/.test(str.trim());
  }

  /**
   * Convierte un valor (BigInt, Number entero o String numérico) a BigInt.
   * Lanza un Error descriptivo si el valor no representa un número entero válido.
   *
   * @param {bigint|number|string} valor Valor a convertir.
   * @param {string} [nombre="valor"] Nombre del parámetro para mensajes de error.
   * @returns {bigint}
   */
  function aBigInt(valor, nombre) {
    const etiqueta = nombre || "valor";

    if (valor && typeof valor === "object" && "sugeridoBig" in valor) {
      return valor.sugeridoBig;
    }

    if (typeof valor === "bigint") {
      return valor;
    }

    if (typeof valor === "number") {
      if (!Number.isFinite(valor) || !Number.isInteger(valor)) {
        throw new Error("El parámetro " + etiqueta + " debe ser un número entero válido.");
      }
      return BigInt(valor);
    }

    if (typeof valor === "string") {
      const limpio = valor.trim();
      if (!/^[+-]?\d+$/.test(limpio)) {
        throw new Error("El parámetro " + etiqueta + " (\"" + valor + "\") no es un entero válido.");
      }
      return BigInt(limpio);
    }

    throw new Error("El parámetro " + etiqueta + " es inválido o está vacío.");
  }

  /**
   * Limpia y convierte una entrada de bloques cifrados (Array o cadena con corchetes,
   * comas, espacios o saltos de línea) en una lista de BigInt.
   *
   * @param {Array<number|bigint|string>|string} entrada Entrada de bloques cifrados.
   * @returns {{valido: boolean, bloquesBig: bigint[], bloques: number[], error: string|null}}
   */
  function parsearBloquesCifrados(entrada) {
    if (Array.isArray(entrada)) {
      if (entrada.length === 0) {
        return {
          valido: false,
          bloquesBig: [],
          bloques: [],
          error: "El vector de bloques cifrados no puede estar vacío."
        };
      }

      const bloquesBig = [];
      const bloquesNum = [];

      for (let i = 0; i < entrada.length; i += 1) {
        try {
          const val = aBigInt(entrada[i], "bloque[" + i + "]");
          bloquesBig.push(val);
          bloquesNum.push(Number(val));
        } catch (_err) {
          return {
            valido: false,
            bloquesBig: [],
            bloques: [],
            error: "El bloque en la posición " + (i + 1) + " (\"" + String(entrada[i]) + "\") no es un número entero válido."
          };
        }
      }

      return {
        valido: true,
        bloquesBig: bloquesBig,
        bloques: bloquesNum,
        error: null
      };
    }

    if (typeof entrada === "string") {
      const limpia = entrada.replace(/[\[\]()]/g, " ").trim();
      if (limpia.length === 0) {
        return {
          valido: false,
          bloquesBig: [],
          bloques: [],
          error: "Ingrese al menos un bloque numérico cifrado para poder descifrar."
        };
      }

      const partes = limpia.split(/[\s,;]+/).filter(function (token) {
        return token.length > 0;
      });

      if (partes.length === 0) {
        return {
          valido: false,
          bloquesBig: [],
          bloques: [],
          error: "No se encontraron bloques numéricos válidos en la entrada."
        };
      }

      const bloquesBig = [];
      const bloquesNum = [];

      for (let i = 0; i < partes.length; i += 1) {
        const token = partes[i];
        if (!/^[+-]?\d+$/.test(token)) {
          return {
            valido: false,
            bloquesBig: [],
            bloques: [],
            error: "El valor \"" + token + "\" (posición " + (i + 1) + ") no es un bloque entero válido."
          };
        }
        const b = BigInt(token);
        bloquesBig.push(b);
        bloquesNum.push(Number(b));
      }

      return {
        valido: true,
        bloquesBig: bloquesBig,
        bloques: bloquesNum,
        error: null
      };
    }

    return {
      valido: false,
      bloquesBig: [],
      bloques: [],
      error: "Formato de entrada no válido para descifrar."
    };
  }

  /**
   * Evalúa el estado individual de los campos p, q y e para actualizar los badges de la UI.
   *
   * @param {string|number|bigint} pEntrada Valor actual del campo p.
   * @param {string|number|bigint} qEntrada Valor actual del campo q.
   * @param {string|number|bigint} eEntrada Valor actual del campo e.
   * @param {object|null} [resultadoClaves] Resultado devuelto por validarYGenerarClaves.
   * @returns {{p: object, q: object, e: object}}
   */
  function validarEstadoCamposClave(pEntrada, qEntrada, eEntrada, resultadoClaves) {
    const engine = obtenerEngine();

    const pTxt = pEntrada !== undefined && pEntrada !== null ? String(pEntrada).trim() : "";
    const qTxt = qEntrada !== undefined && qEntrada !== null ? String(qEntrada).trim() : "";
    const eTxt = eEntrada !== undefined && eEntrada !== null ? String(eEntrada).trim() : "";

    let pValido = false;
    let qValido = false;
    let pBig = null;
    let qBig = null;
    let estadoP;
    let estadoQ;
    let estadoE;

    if (pTxt === "") {
      estadoP = { texto: "Sin ingresar", estado: "neutral", valido: false, valorBig: null };
    } else if (!esEnteroTexto(pTxt)) {
      estadoP = { texto: "No es primo", estado: "error", valido: false, valorBig: null };
    } else {
      const pCand = aBigInt(pTxt, "p");
      if (!engine.esPrimo(pCand)) {
        estadoP = { texto: "No es primo", estado: "error", valido: false, valorBig: null };
      } else {
        pValido = true;
        pBig = pCand;
        estadoP = { texto: "Primo válido", estado: "ok", valido: true, valorBig: pBig };
      }
    }

    if (qTxt === "") {
      estadoQ = { texto: "Sin ingresar", estado: "neutral", valido: false, valorBig: null };
    } else if (!esEnteroTexto(qTxt)) {
      estadoQ = { texto: "No es primo", estado: "error", valido: false, valorBig: null };
    } else {
      const qCand = aBigInt(qTxt, "q");
      if (!engine.esPrimo(qCand)) {
        estadoQ = { texto: "No es primo", estado: "error", valido: false, valorBig: null };
      } else {
        qBig = qCand;
        if (pValido && pBig === qBig) {
          estadoQ = { texto: "Igual a p", estado: "error", valido: false, valorBig: qBig };
        } else if (pValido && (pBig * qBig) <= 255n) {
          estadoQ = { texto: "n ≤ 255", estado: "error", valido: false, valorBig: qBig };
        } else {
          qValido = true;
          estadoQ = { texto: "Primo válido", estado: "ok", valido: true, valorBig: qBig };
        }
      }
    }

    if (eTxt === "") {
      estadoE = { texto: "Sin ingresar", estado: "neutral", valido: false, valorBig: null };
    } else if (!esEnteroTexto(eTxt)) {
      estadoE = { texto: "Inválido", estado: "error", valido: false, valorBig: null };
    } else {
      const eBig = aBigInt(eTxt, "e");
      if (resultadoClaves && resultadoClaves.valido) {
        estadoE = { texto: "Coprimo válido", estado: "ok", valido: true, valorBig: eBig };
      } else if (pValido && qValido && resultadoClaves && !resultadoClaves.valido) {
        estadoE = { texto: "No válido", estado: "error", valido: false, valorBig: eBig };
      } else {
        estadoE = { texto: "Pendiente", estado: "neutral", valido: false, valorBig: eBig };
      }
    }

    return {
      p: estadoP,
      q: estadoQ,
      e: estadoE
    };
  }

  /**
   * Verifica si un par (p, q) es válido para calcular φ(n) y sugerir exponentes e.
   *
   * @param {bigint|number|string} p Primer número primo.
   * @param {bigint|number|string} q Segundo número primo.
   * @returns {{valido: boolean, pBig: bigint|null, qBig: bigint|null, nBig: bigint|null, phiBig: bigint|null}}
   */
  function validarPrimosParaSugerencia(p, q) {
    const engine = obtenerEngine();
    const pTxt = p !== undefined && p !== null ? String(p).trim() : "";
    const qTxt = q !== undefined && q !== null ? String(q).trim() : "";

    if (!esEnteroTexto(pTxt) || !esEnteroTexto(qTxt)) {
      return { valido: false, pBig: null, qBig: null, nBig: null, phiBig: null };
    }

    const pBig = aBigInt(pTxt, "p");
    const qBig = aBigInt(qTxt, "q");

    if (!engine.esPrimo(pBig) || !engine.esPrimo(qBig) || pBig === qBig || (pBig * qBig) <= 255n) {
      return { valido: false, pBig: pBig, qBig: qBig, nBig: pBig * qBig, phiBig: null };
    }

    return {
      valido: true,
      pBig: pBig,
      qBig: qBig,
      nBig: pBig * qBig,
      phiBig: (pBig - 1n) * (qBig - 1n)
    };
  }

  /**
   * Comprueba si un exponente e es entero, cumple 1 < e < φ(n) y es coprimo con φ(n).
   *
   * @param {bigint|number|string} e Exponente candidato.
   * @param {bigint|number|string} phi Valor de φ(n).
   * @returns {boolean}
   */
  function esExponenteValidoParaPhi(e, phi) {
    const engine = obtenerEngine();
    try {
      const eBig = aBigInt(e, "e");
      const phiBig = aBigInt(phi, "phi");
      return eBig > 1n && eBig < phiBig && engine.euclidesMCD(eBig, phiBig).esCoprimo;
    } catch (_err) {
      return false;
    }
  }

  /**
   * Valida todos los parámetros matemáticos de RSA (p, q, e) y delega el cálculo
   * de claves y tablas paso a paso a RSAEngine.generarClaves.
   *
   * @param {bigint|number|string} p Primer número primo.
   * @param {bigint|number|string} q Segundo número primo.
   * @param {bigint|number|string} e Exponente público.
   * @returns {object} Objeto con claves, pasos matemáticos o errores descriptivos.
   */
  function validarYGenerarClaves(p, q, e) {
    const engine = obtenerEngine();
    const errores = [];
    let pBig = null;
    let qBig = null;
    let eBig = null;

    try {
      pBig = aBigInt(p, "p");
    } catch (_err) {
      errores.push("El parámetro p debe ser un número entero válido.");
    }

    try {
      qBig = aBigInt(q, "q");
    } catch (_err) {
      errores.push("El parámetro q debe ser un número entero válido.");
    }

    if (errores.length > 0) {
      return {
        valido: false,
        exito: false,
        errores: errores,
        error: errores.join(" "),
        sugerenciasE: []
      };
    }

    const pEsPrimo = engine.esPrimo(pBig);
    const qEsPrimo = engine.esPrimo(qBig);

    if (!pEsPrimo) {
      errores.push("El valor p = " + pBig.toString() + " no es un número primo. Ingrese un número primo (ej. 17, 19, 23).");
    }

    if (!qEsPrimo) {
      errores.push("El valor q = " + qBig.toString() + " no es un número primo. Ingrese un número primo (ej. 19, 23, 29).");
    }

    if (pEsPrimo && qEsPrimo && pBig === qBig) {
      errores.push("Los primos p y q deben ser distintos (p ≠ q). Actualmente ambos valen " + pBig.toString() + ".");
    }

    const nBig = pBig * qBig;
    if (pEsPrimo && qEsPrimo && pBig !== qBig && nBig <= 255n) {
      errores.push(
        "El módulo n = p · q = " + nBig.toString() +
        " es menor o igual a 255. Se exige n > 255 para poder cifrar todo el alfabeto ASCII extendido (0–255)."
      );
    }

    if (errores.length > 0) {
      return {
        valido: false,
        exito: false,
        errores: errores,
        error: errores.join(" "),
        p: Number(pBig),
        q: Number(qBig),
        n: Number(nBig),
        sugerenciasE: []
      };
    }

    const phiBig = (pBig - 1n) * (qBig - 1n);
    const infoSugerencias = engine.sugerirExponenteE(phiBig);
    const listaSugeridosTexto = infoSugerencias.candidatos.slice(0, 6).join(", ");

    try {
      eBig = aBigInt(e, "e");
    } catch (_err) {
      errores.push(
        "El exponente público e debe ser un número entero válido. Valores sugeridos para φ(n) = " +
        phiBig.toString() + ": " + listaSugeridosTexto + "."
      );
      return {
        valido: false,
        exito: false,
        errores: errores,
        error: errores.join(" "),
        p: Number(pBig),
        q: Number(qBig),
        n: Number(nBig),
        phi: Number(phiBig),
        sugerenciasE: infoSugerencias.candidatos
      };
    }

    if (eBig <= 1n || eBig >= phiBig) {
      errores.push(
        "El exponente e = " + eBig.toString() +
        " debe cumplir estrictamente 1 < e < φ(n) (con φ(n) = " + phiBig.toString() +
        "). Valores válidos sugeridos: " + listaSugeridosTexto + "."
      );
    }

    const mcdInfo = engine.euclidesMCD(phiBig, eBig > 0n ? eBig : 1n);
    if (eBig > 1n && eBig < phiBig && !mcdInfo.esCoprimo) {
      errores.push(
        "El exponente e = " + eBig.toString() +
        " no es coprimo con φ(n) = " + phiBig.toString() +
        " porque mcd(" + eBig.toString() + ", " + phiBig.toString() + ") = " + mcdInfo.mcd.toString() +
        " ≠ 1. Pruebe con alguno de estos valores válidos para e: " + listaSugeridosTexto + "."
      );
    }

    if (errores.length > 0) {
      return {
        valido: false,
        exito: false,
        errores: errores,
        error: errores.join(" "),
        p: Number(pBig),
        q: Number(qBig),
        n: Number(nBig),
        phi: Number(phiBig),
        e: Number(eBig),
        euclides: mcdInfo,
        sugerenciasE: infoSugerencias.candidatos
      };
    }

    const claves = engine.generarClaves(pBig, qBig, eBig);
    const extInfo = claves.euclidesExtendido;

    if (!extInfo.inversoExiste || extInfo.dBig === null) {
      errores.push("No fue posible calcular el inverso modular d para e = " + eBig.toString() + " y φ(n) = " + phiBig.toString() + ".");
      return {
        valido: false,
        exito: false,
        errores: errores,
        error: errores.join(" "),
        p: Number(pBig),
        q: Number(qBig),
        n: Number(nBig),
        phi: Number(phiBig),
        e: Number(eBig),
        euclides: claves.euclides,
        euclidesExtendido: extInfo,
        sugerenciasE: infoSugerencias.candidatos
      };
    }

    return {
      valido: true,
      exito: true,
      errores: [],
      error: null,
      p: claves.p,
      q: claves.q,
      n: claves.n,
      phi: claves.phi,
      e: claves.e,
      d: claves.d,
      pBig: claves.pBig,
      qBig: claves.qBig,
      nBig: claves.nBig,
      phiBig: claves.phiBig,
      eBig: claves.eBig,
      dBig: claves.dBig,
      clavePublica: claves.clavePublica,
      clavePrivada: claves.clavePrivada,
      euclides: claves.euclides,
      euclidesExtendido: extInfo,
      sugerenciasE: infoSugerencias.candidatos
    };
  }

  /**
   * Valida mensaje, dominio ASCII (0–255), condición M < n y parámetros (e, n)
   * antes de invocar RSAEngine.cifrarMensaje.
   *
   * @param {string} texto Mensaje en texto claro.
   * @param {bigint|number|string} e Exponente público.
   * @param {bigint|number|string} n Módulo RSA (n > 255).
   * @returns {object}
   */
  function validarYCifrarMensaje(texto, e, n) {
    const engine = obtenerEngine();

    if (typeof texto !== "string" || texto.length === 0) {
      return {
        valido: false,
        exito: false,
        error: "El mensaje a cifrar no puede estar vacío."
      };
    }

    let eBig;
    let nBig;

    try {
      eBig = aBigInt(e, "e");
      nBig = aBigInt(n, "n");
    } catch (err) {
      return {
        valido: false,
        exito: false,
        error: err.message
      };
    }

    if (nBig <= 255n) {
      return {
        valido: false,
        exito: false,
        error:
          "El módulo n = " + nBig.toString() +
          " debe ser estrictamente mayor que 255 (n > 255) para cubrir el dominio ASCII extendido (0–255)."
      };
    }

    if (eBig <= 1n) {
      return {
        valido: false,
        exito: false,
        error: "El exponente público e = " + eBig.toString() + " debe ser mayor que 1."
      };
    }

    for (let i = 0; i < texto.length; i += 1) {
      const ch = texto.charAt(i);
      const codigo = texto.charCodeAt(i);

      if (codigo < 0 || codigo > 255) {
        return {
          valido: false,
          exito: false,
          error:
            "Carácter fuera de dominio detectado: \"" + ch +
            "\" (posición " + (i + 1) + ", código Unicode " + codigo +
            " > 255). El criptosistema opera exclusivamente sobre ASCII extendido (0–255)."
        };
      }

      if (BigInt(codigo) >= nBig) {
        return {
          valido: false,
          exito: false,
          error:
            "El carácter \"" + ch + "\" tiene código ASCII M = " + codigo +
            " ≥ n (" + nBig.toString() + "). Se viola la condición matemática M < n requerida por RSA."
        };
      }
    }

    const res = engine.cifrarMensaje(texto, eBig, nBig);
    return {
      valido: true,
      exito: true,
      error: null,
      mensajeOriginal: res.mensajeOriginal,
      ascii: res.ascii,
      bloques: res.bloques,
      bloquesBig: res.bloquesBig,
      textoCifrado: res.textoCifrado,
      vectorTexto: res.vectorTexto,
      e: res.e,
      n: res.n,
      eBig: res.eBig,
      nBig: res.nBig,
      detalles: res.detalles
    };
  }

  /**
   * Parsea y valida los bloques cifrados (0 ≤ C < n), parámetros (d, n) y el dominio
   * ASCII extendido (0–255) del resultado descifrado por RSAEngine.descifrarMensaje.
   *
   * @param {Array<number|bigint|string>|string} bloques Vector o cadena de bloques cifrados.
   * @param {bigint|number|string} d Exponente privado.
   * @param {bigint|number|string} n Módulo RSA (n > 255).
   * @returns {object}
   */
  function validarYDescifrarMensaje(bloques, d, n) {
    const engine = obtenerEngine();
    let dBig;
    let nBig;

    try {
      dBig = aBigInt(d, "d");
      nBig = aBigInt(n, "n");
    } catch (err) {
      return {
        valido: false,
        exito: false,
        error: err.message
      };
    }

    if (nBig <= 255n) {
      return {
        valido: false,
        exito: false,
        error:
          "El módulo n = " + nBig.toString() +
          " debe ser estrictamente mayor que 255 (n > 255) para cubrir el dominio ASCII extendido (0–255)."
      };
    }

    if (dBig < 1n) {
      return {
        valido: false,
        exito: false,
        error: "El exponente privado d = " + dBig.toString() + " debe ser un entero positivo."
      };
    }

    const parseo = parsearBloquesCifrados(bloques);
    if (!parseo.valido) {
      return {
        valido: false,
        exito: false,
        error: parseo.error
      };
    }

    const listaCBig = parseo.bloquesBig;
    for (let i = 0; i < listaCBig.length; i += 1) {
      const cBig = listaCBig[i];
      if (cBig < 0n || cBig >= nBig) {
        return {
          valido: false,
          exito: false,
          error:
            "El bloque cifrado C = " + cBig.toString() +
            " (posición " + (i + 1) + ") está fuera del dominio válido 0 ≤ C < n (con n = " + nBig.toString() + ")."
        };
      }
    }

    const res = engine.descifrarMensaje(listaCBig, dBig, nBig);
    for (let i = 0; i < res.detalles.length; i += 1) {
      const det = res.detalles[i];
      if (det.mPrimaBig < 0n || det.mPrimaBig > 255n) {
        return {
          valido: false,
          exito: false,
          error:
            "El bloque cifrado C = " + det.cBig.toString() +
            " produjo M' = " + det.mPrimaBig.toString() +
            " (> 255), fuera del rango ASCII extendido (0–255). Verifique que la clave privada (n, d) corresponda al mensaje cifrado."
        };
      }
    }

    return {
      valido: true,
      exito: true,
      error: null,
      bloquesCifrados: res.bloquesCifrados,
      bloquesDescifrados: res.bloquesDescifrados,
      ascii: res.ascii,
      mensajeDescifrado: res.mensajeDescifrado,
      d: res.d,
      n: res.n,
      dBig: res.dBig,
      nBig: res.nBig,
      detalles: res.detalles
    };
  }

  const RSAValidaciones = {
    version: "1.0.0",
    esEnteroTexto: esEnteroTexto,
    aBigInt: aBigInt,
    parsearBloquesCifrados: parsearBloquesCifrados,
    validarEstadoCamposClave: validarEstadoCamposClave,
    validarPrimosParaSugerencia: validarPrimosParaSugerencia,
    esExponenteValidoParaPhi: esExponenteValidoParaPhi,
    validarYGenerarClaves: validarYGenerarClaves,
    validarYCifrarMensaje: validarYCifrarMensaje,
    validarYDescifrarMensaje: validarYDescifrarMensaje
  };

  global.RSAValidaciones = RSAValidaciones;
})(typeof window !== "undefined" ? window : globalThis);
