(function (global) {
  "use strict";

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
   * Paso 2.1: Verifica si un número entero es primo mediante división por tentativa
   * desde cero utilizando BigInt nativo (evaluando hasta √n).
   *
   * @param {bigint|number|string} num Número a evaluar.
   * @returns {boolean} true si es primo, false en caso contrario.
   */
  function esPrimo(num) {
    let n;
    try {
      n = aBigInt(num, "num");
    } catch (_err) {
      return false;
    }

    if (n <= 1n) {
      return false;
    }
    if (n === 2n || n === 3n) {
      return true;
    }
    if (n % 2n === 0n) {
      return false;
    }

    for (let divisor = 3n; divisor * divisor <= n; divisor += 2n) {
      if (n % divisor === 0n) {
        return false;
      }
    }

    return true;
  }

  /**
   * Obtiene todos los números primos dentro de un intervalo cerrado [min, max].
   *
   * @param {number|bigint} min Límite inferior.
   * @param {number|bigint} max Límite superior.
   * @returns {bigint[]} Lista de números primos como BigInt.
   */
  function listarPrimosEnRango(min, max) {
    const inicio = aBigInt(min, "min");
    const fin = aBigInt(max, "max");
    const primos = [];

    for (let candidato = inicio; candidato <= fin; candidato += 1n) {
      if (esPrimo(candidato)) {
        primos.push(candidato);
      }
    }

    return primos;
  }

  /**
   * Paso 2.1: Genera aleatoriamente dos números primos distintos (p ≠ q)
   * dentro del rango solicitado, garantizando que n = p · q > 255.
   *
   * Rangos soportados:
   * - 'pequenos' (por defecto): 17 a 97
   * - 'medianos': 101 a 499
   *
   * @param {string} [rango="pequenos"] Identificador del rango ('pequenos' | 'medianos').
   * @returns {{p: number, q: number, pBig: bigint, qBig: bigint, n: number, nBig: bigint, rango: string, limites: {min: number, max: number}}}
   */
  function generarPrimos(rango) {
    const textoRango = typeof rango === "string" ? rango.trim().toLowerCase() : "pequenos";
    const esMediano = textoRango === "medianos" || textoRango === "mediano";

    const rangoNormalizado = esMediano ? "medianos" : "pequenos";
    const min = esMediano ? 101 : 17;
    const max = esMediano ? 499 : 97;

    const candidatos = listarPrimosEnRango(min, max);
    if (candidatos.length < 2) {
      throw new Error("No hay suficientes números primos en el rango seleccionado.");
    }

    const indiceP = Math.floor(Math.random() * candidatos.length);
    const p = candidatos[indiceP];

    const candidatosQ = candidatos.filter(function (qCand) {
      return qCand !== p && (p * qCand) > 255n;
    });

    if (candidatosQ.length === 0) {
      throw new Error("No se encontró un par de primos que cumpla p ≠ q y n > 255.");
    }

    const indiceQ = Math.floor(Math.random() * candidatosQ.length);
    const q = candidatosQ[indiceQ];
    const n = p * q;

    return {
      p: Number(p),
      q: Number(q),
      pBig: p,
      qBig: q,
      n: Number(n),
      nBig: n,
      rango: rangoNormalizado,
      limites: { min: min, max: max }
    };
  }

  /**
   * Paso 2.2: Algoritmo clásico de Euclides para calcular el Máximo Común Divisor mcd(a, b),
   * registrando cada división sucesiva (dividendo = divisor · cociente + residuo) en `pasos`.
   *
   * @param {bigint|number|string} a Primer número entero.
   * @param {bigint|number|string} b Segundo número entero.
   * @returns {{a: number, b: number, aBig: bigint, bBig: bigint, mcd: number, mcdBig: bigint, esCoprimo: boolean, pasos: Array<object>}}
   */
  function euclidesMCD(a, b) {
    let x = aBigInt(a, "a");
    let y = aBigInt(b, "b");

    if (x < 0n) x = -x;
    if (y < 0n) y = -y;

    const aOriginal = x;
    const bOriginal = y;

    // Ordenar para que la primera división sea mayor = menor · q + r (estándar académico)
    if (x < y && x > 0n) {
      const temp = x;
      x = y;
      y = temp;
    }

    const pasos = [];
    let indice = 1;

    while (y !== 0n) {
      const q = x / y;
      const r = x % y;

      pasos.push({
        paso: indice,
        dividendo: Number(x),
        divisor: Number(y),
        cociente: Number(q),
        residuo: Number(r),
        dividendoBig: x,
        divisorBig: y,
        cocienteBig: q,
        residuoBig: r,
        ecuacion: x.toString() + " = " + y.toString() + " · " + q.toString() + " + " + r.toString()
      });

      x = y;
      y = r;
      indice += 1;
    }

    return {
      a: Number(aOriginal),
      b: Number(bOriginal),
      aBig: aOriginal,
      bBig: bOriginal,
      mcd: Number(x),
      mcdBig: x,
      esCoprimo: x === 1n,
      pasos: pasos
    };
  }

  /**
   * Paso 2.2: Algoritmo Extendido de Euclides para resolver la identidad de Bézout
   * e · x + φ(n) · y = mcd(e, φ(n)) y obtener el inverso multiplicativo modular
   * d ≡ e⁻¹ (mod φ(n)), normalizado en el rango positivo 1 < d < φ(n).
   *
   * @param {bigint|number|string} e Exponente público.
   * @param {bigint|number|string} phi Función totiente de Euler φ(n).
   * @returns {object} Resultado con coeficientes de Bézout, d normalizado y tabla de pasos.
   */
  function euclidesExtendido(e, phi) {
    const eBig = aBigInt(e, "e");
    const phiBig = aBigInt(phi, "phi");

    if (phiBig <= 1n) {
      throw new Error("El valor de φ(n) debe ser mayor que 1.");
    }

    // Invariante en cada fila: φ(n) · s + e · t = r
    let rAnterior = phiBig;
    let rActual = eBig;
    let sAnterior = 1n;
    let sActual = 0n;
    let tAnterior = 0n;
    let tActual = 1n;

    const pasos = [];
    let indice = 1;

    while (rActual !== 0n) {
      const q = rAnterior / rActual;
      const rSiguiente = rAnterior % rActual;
      const sSiguiente = sAnterior - q * sActual;
      const tSiguiente = tAnterior - q * tActual;

      pasos.push({
        paso: indice,
        dividendo: Number(rAnterior),
        divisor: Number(rActual),
        cociente: Number(q),
        residuo: Number(rSiguiente),
        dividendoBig: rAnterior,
        divisorBig: rActual,
        cocienteBig: q,
        residuoBig: rSiguiente,
        sAnterior: Number(sAnterior),
        sActual: Number(sActual),
        sSiguiente: Number(sSiguiente),
        tAnterior: Number(tAnterior),
        tActual: Number(tActual),
        tSiguiente: Number(tSiguiente),
        sSiguienteBig: sSiguiente,
        tSiguienteBig: tSiguiente,
        ecuacionDivision:
          rAnterior.toString() + " = " + rActual.toString() + " · " + q.toString() + " + " + rSiguiente.toString(),
        ecuacionCoeficiente:
          "t_" + indice + " = " + tAnterior.toString() + " - (" + q.toString() + " · " + tActual.toString() + ") = " + tSiguiente.toString(),
        combinacionLineal:
          rSiguiente > 0n
            ? rSiguiente.toString() + " = " + eBig.toString() + " · (" + tSiguiente.toString() + ") + " + phiBig.toString() + " · (" + sSiguiente.toString() + ")"
            : "Residuo 0 (fin de las divisiones; el último residuo no nulo es mcd = " + rActual.toString() + ")"
      });

      rAnterior = rActual;
      rActual = rSiguiente;
      sAnterior = sActual;
      sActual = sSiguiente;
      tAnterior = tActual;
      tActual = tSiguiente;
      indice += 1;
    }

    const mcd = rAnterior;
    const coefE = tAnterior;   // x tal que e · x + φ(n) · y = mcd
    const coefPhi = sAnterior; // y tal que e · x + φ(n) · y = mcd
    const inversoExiste = mcd === 1n;

    let dBig = null;
    let normalizacionTexto = "No existe inverso modular porque mcd(e, φ(n)) ≠ 1.";
    let verificacionTexto = null;

    if (inversoExiste) {
      dBig = ((coefE % phiBig) + phiBig) % phiBig;
      if (coefE < 0n) {
        normalizacionTexto =
          "Como el coeficiente de Bézout x = " + coefE.toString() +
          " es negativo, se suma φ(n) = " + phiBig.toString() +
          " para normalizar: d = " + coefE.toString() + " + " + phiBig.toString() + " = " + dBig.toString() + ".";
      } else if (coefE >= phiBig) {
        normalizacionTexto =
          "El coeficiente de Bézout x = " + coefE.toString() +
          " se reduce módulo φ(n) = " + phiBig.toString() + ": d = " + dBig.toString() + ".";
      } else {
        normalizacionTexto =
          "El coeficiente de Bézout x = " + coefE.toString() +
          " ya se encuentra en el intervalo 1 < d < φ(n): d = " + dBig.toString() + ".";
      }

      const producto = eBig * dBig;
      const residuoVerif = producto % phiBig;
      verificacionTexto =
        "(" + eBig.toString() + " · " + dBig.toString() + ") mod " + phiBig.toString() +
        " = " + producto.toString() + " mod " + phiBig.toString() + " = " + residuoVerif.toString();
    }

    return {
      e: Number(eBig),
      phi: Number(phiBig),
      eBig: eBig,
      phiBig: phiBig,
      mcd: Number(mcd),
      mcdBig: mcd,
      inversoExiste: inversoExiste,
      x: Number(coefE),
      y: Number(coefPhi),
      xBig: coefE,
      yBig: coefPhi,
      coeficienteE: Number(coefE),
      coeficientePhi: Number(coefPhi),
      dSinNormalizar: Number(coefE),
      requirioNormalizacion: coefE < 0n || coefE >= phiBig,
      d: dBig !== null ? Number(dBig) : null,
      dBig: dBig,
      identidadBezout:
        eBig.toString() + " · (" + coefE.toString() + ") + " +
        phiBig.toString() + " · (" + coefPhi.toString() + ") = " + mcd.toString(),
      normalizacionTexto: normalizacionTexto,
      verificacion: verificacionTexto,
      pasos: pasos
    };
  }

  /**
   * Paso 2.2: Sugiere valores válidos para el exponente público `e` tales que
   * 1 < e < φ(n) y mcd(e, φ(n)) = 1.
   *
   * @param {bigint|number|string} phi Valor de φ(n) = (p - 1)(q - 1).
   * @param {bigint|number|string} [eActual] Exponente actual opcional para rotar entre sugerencias.
   * @returns {{sugerido: number, sugeridoBig: bigint, candidatos: number[], candidatosBig: bigint[], valueOf: function, toString: function}}
   */
  function sugerirExponenteE(phi, eActual) {
    const phiBig = aBigInt(phi, "phi");
    if (phiBig <= 2n) {
      throw new Error("φ(n) debe ser mayor que 2 para encontrar un exponente público e válido.");
    }

    const preferidos = [
      3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n,
      37n, 41n, 43n, 47n, 53n, 59n, 61n, 67n, 71n, 73n,
      79n, 83n, 89n, 97n, 257n, 65537n
    ];

    const candidatosBig = [];

    for (let i = 0; i < preferidos.length; i += 1) {
      const cand = preferidos[i];
      if (cand > 1n && cand < phiBig) {
        if (euclidesMCD(cand, phiBig).esCoprimo) {
          candidatosBig.push(cand);
        }
      }
    }

    let impar = 3n;
    while (candidatosBig.length < 8 && impar < phiBig) {
      if (candidatosBig.indexOf(impar) === -1 && euclidesMCD(impar, phiBig).esCoprimo) {
        candidatosBig.push(impar);
      }
      impar += 2n;
    }

    if (candidatosBig.length === 0) {
      throw new Error("No se encontraron exponentes coprimos con φ(n) = " + phiBig.toString() + ".");
    }

    let elegido = candidatosBig[0];

    if (eActual !== undefined && eActual !== null && String(eActual).trim() !== "") {
      try {
        const actualBig = aBigInt(eActual, "eActual");
        const idx = candidatosBig.indexOf(actualBig);
        if (idx !== -1 && candidatosBig.length > 1) {
          elegido = candidatosBig[(idx + 1) % candidatosBig.length];
        }
      } catch (_err) {
        elegido = candidatosBig[0];
      }
    }

    const candidatosNum = candidatosBig.map(function (c) {
      return Number(c);
    });

    return {
      sugerido: Number(elegido),
      sugeridoBig: elegido,
      candidatos: candidatosNum,
      candidatosBig: candidatosBig,
      valueOf: function () {
        return Number(elegido);
      },
      toString: function () {
        return elegido.toString();
      }
    };
  }

  /**
   * Paso 2.2: Valida todos los parámetros matemáticos de RSA y genera las claves
   * pública (n, e) y privada (n, d), incluyendo el desglose completo de Euclides y
   * Euclides Extendido.
   *
   * @param {bigint|number|string} p Primer número primo.
   * @param {bigint|number|string} q Segundo número primo.
   * @param {bigint|number|string} e Exponente público.
   * @returns {object} Objeto con claves, pasos matemáticos o errores descriptivos.
   */
  function generarClaves(p, q, e) {
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

    const pEsPrimo = esPrimo(pBig);
    const qEsPrimo = esPrimo(qBig);

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
    const infoSugerencias = sugerirExponenteE(phiBig);
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

    const mcdInfo = euclidesMCD(phiBig, eBig > 0n ? eBig : 1n);
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

    const extInfo = euclidesExtendido(eBig, phiBig);
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
        euclides: mcdInfo,
        euclidesExtendido: extInfo,
        sugerenciasE: infoSugerencias.candidatos
      };
    }

    return {
      valido: true,
      exito: true,
      errores: [],
      error: null,
      p: Number(pBig),
      q: Number(qBig),
      n: Number(nBig),
      phi: Number(phiBig),
      e: Number(eBig),
      d: extInfo.d,
      pBig: pBig,
      qBig: qBig,
      nBig: nBig,
      phiBig: phiBig,
      eBig: eBig,
      dBig: extInfo.dBig,
      clavePublica: {
        n: Number(nBig),
        e: Number(eBig),
        nBig: nBig,
        eBig: eBig,
        texto: "(" + nBig.toString() + ", " + eBig.toString() + ")"
      },
      clavePrivada: {
        n: Number(nBig),
        d: extInfo.d,
        nBig: nBig,
        dBig: extInfo.dBig,
        texto: "(" + nBig.toString() + ", " + extInfo.dBig.toString() + ")"
      },
      euclides: mcdInfo,
      euclidesExtendido: extInfo,
      sugerenciasE: infoSugerencias.candidatos
    };
  }

  /**
   * Paso 2.3: Exponenciación modular rápida (exponenciación binaria derecha-a-izquierda)
   * para calcular (base^exponente) mod modulo paso a paso usando BigInt.
   *
   * @param {bigint|number|string} base Base entera M o C.
   * @param {bigint|number|string} exponente Exponente entero e o d.
   * @param {bigint|number|string} modulo Módulo entero n.
   * @returns {object} Resultado final y bitácora detallada de cada bit en `pasos`.
   */
  function potenciaModular(base, exponente, modulo) {
    const baseBig = aBigInt(base, "base");
    const expBig = aBigInt(exponente, "exponente");
    const modBig = aBigInt(modulo, "modulo");

    if (expBig < 0n) {
      throw new Error("El exponente no puede ser negativo en la exponenciación modular.");
    }
    if (modBig <= 0n) {
      throw new Error("El módulo debe ser mayor que 0.");
    }

    const binario = expBig.toString(2);
    const pasos = [];
    const potenciasActivas = [];

    if (modBig === 1n) {
      return {
        base: Number(baseBig),
        baseReducida: 0,
        exponente: Number(expBig),
        modulo: 1,
        baseBig: baseBig,
        exponenteBig: expBig,
        moduloBig: modBig,
        exponenteBinario: binario,
        descomposicionPotencias: [0],
        descomposicionTexto: expBig.toString() + " (" + binario + "₂)",
        resultado: 0,
        resultadoBig: 0n,
        ecuacion: baseBig.toString() + "^" + expBig.toString() + " mod 1 = 0",
        pasos: [],
        valueOf: function () {
          return 0;
        }
      };
    }

    let acumulado = 1n;
    let potenciaActual = ((baseBig % modBig) + modBig) % modBig;
    let expRestante = expBig;
    let indiceBit = 0;

    if (expRestante === 0n) {
      pasos.push({
        iteracion: 1,
        indiceBit: 0,
        potenciaDos: 1,
        potenciaDosBig: 1n,
        exponenteRestante: 0,
        bit: 0,
        baseModular: Number(potenciaActual),
        baseModularBig: potenciaActual,
        resultadoPrevio: 1,
        multiplico: false,
        operacionResultado: "1 (exponente 0)",
        resultadoParcial: 1,
        resultadoParcialBig: 1n,
        cuadradoModular: "-",
        siguienteBase: Number(potenciaActual)
      });
    }

    while (expRestante > 0n) {
      const bit = expRestante % 2n;
      const potenciaDosBig = 1n << BigInt(indiceBit);
      const resultadoPrevio = acumulado;
      const baseEnPaso = potenciaActual;
      const multiplico = bit === 1n;

      if (multiplico) {
        acumulado = (acumulado * baseEnPaso) % modBig;
        potenciasActivas.push(Number(potenciaDosBig));
      }

      const cuadradoSinMod = baseEnPaso * baseEnPaso;
      const siguienteBase = cuadradoSinMod % modBig;

      pasos.push({
        iteracion: indiceBit + 1,
        indiceBit: indiceBit,
        potenciaDos: Number(potenciaDosBig),
        potenciaDosBig: potenciaDosBig,
        exponenteRestante: Number(expRestante),
        bit: Number(bit),
        baseModular: Number(baseEnPaso),
        baseModularBig: baseEnPaso,
        resultadoPrevio: Number(resultadoPrevio),
        multiplico: multiplico,
        operacionResultado: multiplico
          ? "(" + resultadoPrevio.toString() + " · " + baseEnPaso.toString() + ") mod " + modBig.toString() + " = " + acumulado.toString()
          : resultadoPrevio.toString() + " (bit = 0, no multiplica)",
        resultadoParcial: Number(acumulado),
        resultadoParcialBig: acumulado,
        cuadradoModular:
          baseEnPaso.toString() + "² mod " + modBig.toString() + " = " + cuadradoSinMod.toString() + " mod " + modBig.toString() + " = " + siguienteBase.toString(),
        siguienteBase: Number(siguienteBase),
        siguienteBaseBig: siguienteBase
      });

      potenciaActual = siguienteBase;
      expRestante = expRestante / 2n;
      indiceBit += 1;
    }

    const descomposicionTexto =
      potenciasActivas.length > 0
        ? expBig.toString() + " = " + potenciasActivas.join(" + ") + " (binario: " + binario + "₂)"
        : expBig.toString() + " (binario: " + binario + "₂)";

    return {
      base: Number(baseBig),
      baseReducida: Number(((baseBig % modBig) + modBig) % modBig),
      exponente: Number(expBig),
      modulo: Number(modBig),
      baseBig: baseBig,
      exponenteBig: expBig,
      moduloBig: modBig,
      exponenteBinario: binario,
      descomposicionPotencias: potenciasActivas,
      descomposicionTexto: descomposicionTexto,
      resultado: Number(acumulado),
      resultadoBig: acumulado,
      ecuacion: baseBig.toString() + "^" + expBig.toString() + " mod " + modBig.toString() + " = " + acumulado.toString(),
      pasos: pasos,
      valueOf: function () {
        return Number(acumulado);
      }
    };
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
   * Paso 2.3: Cifra un mensaje de texto carácter por carácter usando el dominio
   * ASCII extendido (0–255) y la fórmula C = M^e mod n.
   * Bloquea cualquier carácter con código > 255 o M >= n con un mensaje matemático claro.
   *
   * @param {string} texto Mensaje en texto claro.
   * @param {bigint|number|string} e Exponente público.
   * @param {bigint|number|string} n Módulo RSA (n > 255).
   * @returns {object} Resultado con bloques cifrados, códigos ASCII y desglose por carácter.
   */
  function cifrarMensaje(texto, e, n) {
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

    const detalles = [];
    const codigosAscii = [];
    const bloquesCifrados = [];
    const bloquesCifradosBig = [];

    for (let i = 0; i < texto.length; i += 1) {
      const ch = texto.charAt(i);
      const codigo = texto.charCodeAt(i);
      const mBig = BigInt(codigo);
      const expMod = potenciaModular(mBig, eBig, nBig);
      const cBig = expMod.resultadoBig;

      codigosAscii.push(codigo);
      bloquesCifrados.push(Number(cBig));
      bloquesCifradosBig.push(cBig);

      detalles.push({
        indice: i,
        posicion: i + 1,
        caracter: ch,
        ascii: codigo,
        m: codigo,
        mBig: mBig,
        cifrado: Number(cBig),
        c: Number(cBig),
        cBig: cBig,
        formula: codigo.toString() + "^" + eBig.toString() + " mod " + nBig.toString() + " = " + cBig.toString(),
        exponenciacion: expMod
      });
    }

    return {
      valido: true,
      exito: true,
      error: null,
      mensajeOriginal: texto,
      ascii: codigosAscii,
      bloques: bloquesCifrados,
      bloquesBig: bloquesCifradosBig,
      textoCifrado: bloquesCifrados.join(", "),
      vectorTexto: "[" + bloquesCifrados.join(", ") + "]",
      e: Number(eBig),
      n: Number(nBig),
      eBig: eBig,
      nBig: nBig,
      detalles: detalles
    };
  }

  /**
   * Paso 2.3: Descifra una secuencia de bloques numéricos usando la fórmula
   * M' = C^d mod n y reconstruye el mensaje en el dominio ASCII extendido (0–255).
   *
   * @param {Array<number|bigint|string>|string} bloques Vector o cadena de bloques cifrados.
   * @param {bigint|number|string} d Exponente privado (inverso modular de e mod φ(n)).
   * @param {bigint|number|string} n Módulo RSA (n > 255).
   * @returns {object} Resultado con mensaje descifrado, bloques M' y desglose por bloque.
   */
  function descifrarMensaje(bloques, d, n) {
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
    const detalles = [];
    const bloquesCifradosNum = [];
    const bloquesDescifradosNum = [];
    const caracteres = [];

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

      const expMod = potenciaModular(cBig, dBig, nBig);
      const mPrimaBig = expMod.resultadoBig;

      if (mPrimaBig < 0n || mPrimaBig > 255n) {
        return {
          valido: false,
          exito: false,
          error:
            "El bloque cifrado C = " + cBig.toString() +
            " produjo M' = " + mPrimaBig.toString() +
            " (> 255), fuera del rango ASCII extendido (0–255). Verifique que la clave privada (n, d) corresponda al mensaje cifrado."
        };
      }

      const codigo = Number(mPrimaBig);
      const ch = String.fromCharCode(codigo);

      bloquesCifradosNum.push(Number(cBig));
      bloquesDescifradosNum.push(codigo);
      caracteres.push(ch);

      detalles.push({
        indice: i,
        posicion: i + 1,
        cifrado: Number(cBig),
        c: Number(cBig),
        cBig: cBig,
        descifrado: codigo,
        mPrima: codigo,
        mPrimaBig: mPrimaBig,
        ascii: codigo,
        caracter: ch,
        formula: cBig.toString() + "^" + dBig.toString() + " mod " + nBig.toString() + " = " + mPrimaBig.toString(),
        exponenciacion: expMod
      });
    }

    return {
      valido: true,
      exito: true,
      error: null,
      bloquesCifrados: bloquesCifradosNum,
      bloquesDescifrados: bloquesDescifradosNum,
      ascii: bloquesDescifradosNum,
      mensajeDescifrado: caracteres.join(""),
      d: Number(dBig),
      n: Number(nBig),
      dBig: dBig,
      nBig: nBig,
      detalles: detalles
    };
  }

  /**
   * Paso 2.3: Ejecuta los 2 casos oficiales de autoprueba del PDF del proyecto:
   * - Caso 1: p=17, q=19, e=5 -> n=323, φ(n)=288, d=173 | "HOLA" -> [21, 129, 247, 12] -> "HOLA"
   * - Caso 2: p=19, q=23, e=5 -> n=437, φ(n)=396, d=317 | "RSA"  -> [119, 429, 126]   -> "RSA"
   *
   * Imprime resultados en verde en la consola y devuelve el resumen estructurado.
   *
   * @param {boolean} [silencioso=false] Si es true, omite la salida por console.log.
   * @returns {{exito: boolean, total: number, pasados: number, resultados: Array<object>}}
   */
  function ejecutarAutotest(silencioso) {
    const definicionCasos = [
      {
        id: 1,
        nombre: "Caso PDF #1 (HOLA)",
        p: 17,
        q: 19,
        e: 5,
        nEsperado: 323,
        phiEsperado: 288,
        dEsperado: 173,
        mensaje: "HOLA",
        asciiEsperado: [72, 79, 76, 65],
        cifradoEsperado: [21, 129, 247, 12]
      },
      {
        id: 2,
        nombre: "Caso PDF #2 (RSA)",
        p: 19,
        q: 23,
        e: 5,
        nEsperado: 437,
        phiEsperado: 396,
        dEsperado: 317,
        mensaje: "RSA",
        asciiEsperado: [82, 83, 65],
        cifradoEsperado: [119, 429, 126]
      }
    ];

    const resultados = [];
    let pasados = 0;

    for (let i = 0; i < definicionCasos.length; i += 1) {
      const tc = definicionCasos[i];
      const claves = generarClaves(tc.p, tc.q, tc.e);
      const cifrado = cifrarMensaje(tc.mensaje, tc.e, claves.n);
      const descifrado = descifrarMensaje(cifrado.bloques, claves.d, claves.n);

      const clavesOk =
        claves.valido &&
        claves.n === tc.nEsperado &&
        claves.phi === tc.phiEsperado &&
        claves.d === tc.dEsperado;

      const asciiOk =
        cifrado.valido &&
        JSON.stringify(cifrado.ascii) === JSON.stringify(tc.asciiEsperado);

      const cifradoOk =
        cifrado.valido &&
        JSON.stringify(cifrado.bloques) === JSON.stringify(tc.cifradoEsperado);

      const descifradoOk =
        descifrado.valido &&
        descifrado.mensajeDescifrado === tc.mensaje &&
        JSON.stringify(descifrado.bloquesDescifrados) === JSON.stringify(tc.asciiEsperado);

      const exitoCaso = Boolean(clavesOk && asciiOk && cifradoOk && descifradoOk);
      if (exitoCaso) {
        pasados += 1;
      }

      resultados.push({
        id: tc.id,
        nombre: tc.nombre,
        exito: exitoCaso,
        parametros: { p: tc.p, q: tc.q, n: claves.n, phi: claves.phi, e: claves.e, d: claves.d },
        mensajeOriginal: tc.mensaje,
        ascii: cifrado.ascii,
        bloquesCifrados: cifrado.bloques,
        bloquesDescifrados: descifrado.bloquesDescifrados,
        mensajeDescifrado: descifrado.mensajeDescifrado
      });
    }

    const todoOk = pasados === definicionCasos.length;

    if (!silencioso && typeof console !== "undefined" && typeof console.log === "function") {
      console.log(
        "%c[window.RSAEngine v1.0.0] Motor matemático RSA (BigInt) cargado correctamente.",
        "color: #0284c7; font-weight: bold;"
      );

      for (let i = 0; i < resultados.length; i += 1) {
        const r = resultados[i];
        const estilo = r.exito
          ? "color: #16a34a; font-weight: bold;"
          : "color: #dc2626; font-weight: bold;";
        const icono = r.exito ? "✔ [AUTOTEST EN VERDE]" : "✘ [AUTOTEST FALLIDO]";

        console.log(
          "%c" + icono + " " + r.nombre +
            ": (p=" + r.parametros.p + ", q=" + r.parametros.q + ", e=" + r.parametros.e +
            ") -> n=" + r.parametros.n + ", φ(n)=" + r.parametros.phi + ", d=" + r.parametros.d +
            " | \"" + r.mensajeOriginal + "\" -> [" + r.bloquesCifrados.join(", ") + "] -> \"" + r.mensajeDescifrado + "\"",
          estilo
        );
      }
    }

    return {
      exito: todoOk,
      total: definicionCasos.length,
      pasados: pasados,
      resultados: resultados
    };
  }

  const RSAEngine = {
    version: "1.0.0",

    /**
     * Verifica si el entorno soporta BigInt para cálculos RSA precisos.
     * @returns {boolean}
     */
    isSupported: function () {
      return typeof BigInt === "function";
    },

    aBigInt: aBigInt,
    esPrimo: esPrimo,
    listarPrimosEnRango: listarPrimosEnRango,
    generarPrimos: generarPrimos,
    euclidesMCD: euclidesMCD,
    euclidesExtendido: euclidesExtendido,
    sugerirExponenteE: sugerirExponenteE,
    generarClaves: generarClaves,
    potenciaModular: potenciaModular,
    parsearBloquesCifrados: parsearBloquesCifrados,
    cifrarMensaje: cifrarMensaje,
    descifrarMensaje: descifrarMensaje,
    ejecutarAutotest: ejecutarAutotest
  };

  global.RSAEngine = RSAEngine;

  // Ejecutar autotest automáticamente al cargar en el navegador para verificación inmediata en Consola (F12)
  if (typeof window !== "undefined" && RSAEngine.isSupported()) {
    RSAEngine.ejecutarAutotest(false);
  }
})(typeof window !== "undefined" ? window : globalThis);
