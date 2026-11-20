(function (global) {
  "use strict";

  // =========================================================================
  // [1] NÚCLEO MATEMÁTICO RSA (BigInt)
  // =========================================================================

  // [1.1] Contexto y normalización numérica exacta
  // [1.1.1] toBigInt(valor)
  /**
   * Convierte un entero (BigInt o Number entero) a BigInt para aritmética modular exacta.
   *
   * @param {bigint|number} valor Valor entero a normalizar.
   * @returns {bigint}
   */
  function toBigInt(valor) {
    if (typeof valor === "bigint") {
      return valor;
    }
    if (typeof valor === "number" && Number.isInteger(valor)) {
      return BigInt(valor);
    }
    throw new TypeError("Se esperaba un número entero (BigInt o Number entero).");
  }

  // [1.2] Teoría de números y generación de primos
  // [1.2.1] esPrimo(num)
  /**
   * Verifica si un número entero es primo mediante división por tentativa
   * utilizando BigInt nativo (evaluando divisores impares hasta √n).
   *
   * @param {bigint|number} num Número entero a evaluar.
   * @returns {boolean} true si es primo, false en caso contrario.
   */
  function esPrimo(num) {
    let n;
    try {
      n = toBigInt(num);
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

  // [1.2.2] listarPrimosEnRango(min, max)
  /**
   * Obtiene todos los números primos dentro de un intervalo cerrado [min, max].
   *
   * @param {number|bigint} min Límite inferior.
   * @param {number|bigint} max Límite superior.
   * @returns {bigint[]} Lista de números primos como BigInt.
   */
  function listarPrimosEnRango(min, max) {
    const inicio = toBigInt(min);
    const fin = toBigInt(max);
    const primos = [];

    for (let candidato = inicio; candidato <= fin; candidato += 1n) {
      if (esPrimo(candidato)) {
        primos.push(candidato);
      }
    }

    return primos;
  }

  // [1.2.3] generarPrimos(rango)
  /**
   * Genera aleatoriamente dos números primos distintos (p ≠ q)
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

  // [1.3] Algoritmos de Euclides e inverso modular
  // [1.3.1] euclidesMCD(a, b)
  /**
   * Algoritmo clásico de Euclides para calcular el Máximo Común Divisor mcd(a, b),
   * registrando cada división sucesiva (dividendo = divisor · cociente + residuo) en `pasos`.
   *
   * @param {bigint|number} a Primer número entero.
   * @param {bigint|number} b Segundo número entero.
   * @returns {{a: number, b: number, aBig: bigint, bBig: bigint, mcd: number, mcdBig: bigint, esCoprimo: boolean, pasos: Array<object>}}
   */
  function euclidesMCD(a, b) {
    let x = toBigInt(a);
    let y = toBigInt(b);

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

  // [1.3.2] euclidesExtendido(e, phi)
  /**
   * Algoritmo Extendido de Euclides para resolver la identidad de Bézout
   * e · x + φ(n) · y = mcd(e, φ(n)) y obtener el inverso multiplicativo modular
   * d ≡ e⁻¹ (mod φ(n)), normalizado en el rango positivo 1 < d < φ(n).
   *
   * @param {bigint|number} e Exponente público.
   * @param {bigint|number} phi Función totiente de Euler φ(n).
   * @returns {object} Resultado con coeficientes de Bézout, d normalizado y tabla de pasos.
   */
  function euclidesExtendido(e, phi) {
    const eBig = toBigInt(e);
    const phiBig = toBigInt(phi);

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

  // [1.3.3] sugerirExponenteE(phi, eActual)
  /**
   * Sugiere valores válidos para el exponente público `e` tales que
   * 1 < e < φ(n) y mcd(e, φ(n)) = 1.
   *
   * @param {bigint|number} phi Valor de φ(n) = (p - 1)(q - 1).
   * @param {bigint|number} [eActual] Exponente actual opcional para rotar entre sugerencias.
   * @returns {{sugerido: number, sugeridoBig: bigint, candidatos: number[], candidatosBig: bigint[], valueOf: function, toString: function}}
   */
  function sugerirExponenteE(phi, eActual) {
    const phiBig = toBigInt(phi);
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

    if (eActual !== undefined && eActual !== null) {
      try {
        const actualBig = toBigInt(eActual);
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

  // [1.3.4] generarClaves(p, q, e)
  /**
   * Cálculo matemático directo de las claves RSA a partir de (p, q, e):
   * n = p · q, φ(n) = (p - 1)(q - 1), mcd(φ(n), e) e inverso modular d ≡ e⁻¹ (mod φ(n)).
   *
   * @param {bigint|number} p Primer número primo.
   * @param {bigint|number} q Segundo número primo.
   * @param {bigint|number} e Exponente público.
   * @returns {object} Estructura matemática con n, φ(n), claves pública/privada y tablas de pasos.
   */
  function generarClaves(p, q, e) {
    const pBig = toBigInt(p);
    const qBig = toBigInt(q);
    const eBig = toBigInt(e);

    const nBig = pBig * qBig;
    const phiBig = (pBig - 1n) * (qBig - 1n);
    const mcdInfo = euclidesMCD(phiBig, eBig > 0n ? eBig : 1n);
    const extInfo = euclidesExtendido(eBig, phiBig);

    return {
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
        texto: extInfo.dBig !== null ? "(" + nBig.toString() + ", " + extInfo.dBig.toString() + ")" : null
      },
      euclides: mcdInfo,
      euclidesExtendido: extInfo
    };
  }

  // [1.4] Exponenciación modular y operaciones de cifrado / descifrado
  // [1.4.1] potenciaModular(base, exponente, modulo)
  /**
   * Exponenciación modular rápida (exponenciación binaria derecha-a-izquierda)
   * para calcular (base^exponente) mod modulo paso a paso usando BigInt.
   *
   * @param {bigint|number} base Base entera M o C.
   * @param {bigint|number} exponente Exponente entero e o d.
   * @param {bigint|number} modulo Módulo entero n.
   * @returns {object} Resultado final y bitácora detallada de cada bit en `pasos`.
   */
  function potenciaModular(base, exponente, modulo) {
    const baseBig = toBigInt(base);
    const expBig = toBigInt(exponente);
    const modBig = toBigInt(modulo);

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

  // [1.4.2] cifrarMensaje(texto, e, n)
  /**
   * Cifra un mensaje de texto carácter por carácter mediante C = M^e mod n
   * usando exponenciación modular rápida.
   *
   * @param {string} texto Mensaje en texto claro.
   * @param {bigint|number} e Exponente público.
   * @param {bigint|number} n Módulo RSA.
   * @returns {object} Resultado con bloques cifrados, códigos ASCII y desglose por carácter.
   */
  function cifrarMensaje(texto, e, n) {
    const eBig = toBigInt(e);
    const nBig = toBigInt(n);

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

  // [1.4.3] descifrarMensaje(bloques, d, n)
  /**
   * Descifra una lista de bloques numéricos usando M' = C^d mod n
   * y reconstruye el mensaje carácter por carácter.
   *
   * @param {Array<number|bigint>} bloques Arreglo de bloques numéricos cifrados.
   * @param {bigint|number} d Exponente privado (inverso modular de e mod φ(n)).
   * @param {bigint|number} n Módulo RSA.
   * @returns {object} Resultado con mensaje descifrado, bloques M' y desglose por bloque.
   */
  function descifrarMensaje(bloques, d, n) {
    if (!Array.isArray(bloques)) {
      throw new TypeError("Se esperaba un arreglo de bloques numéricos para descifrar.");
    }

    const dBig = toBigInt(d);
    const nBig = toBigInt(n);

    const detalles = [];
    const bloquesCifradosNum = [];
    const bloquesDescifradosNum = [];
    const caracteres = [];

    for (let i = 0; i < bloques.length; i += 1) {
      const cBig = toBigInt(bloques[i]);
      const expMod = potenciaModular(cBig, dBig, nBig);
      const mPrimaBig = expMod.resultadoBig;
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

  // [1.5] Interfaz pública del motor matemático (RSAEngine)
  // [1.5.1] RSAEngine.isSupported() y exportación global window.RSAEngine
  const RSAEngine = {
    version: "1.0.0",

    /**
     * Verifica si el entorno soporta BigInt para cálculos RSA precisos.
     * @returns {boolean}
     */
    isSupported: function () {
      return typeof BigInt === "function";
    },

    esPrimo: esPrimo,
    listarPrimosEnRango: listarPrimosEnRango,
    generarPrimos: generarPrimos,
    euclidesMCD: euclidesMCD,
    euclidesExtendido: euclidesExtendido,
    sugerirExponenteE: sugerirExponenteE,
    generarClaves: generarClaves,
    potenciaModular: potenciaModular,
    cifrarMensaje: cifrarMensaje,
    descifrarMensaje: descifrarMensaje
  };

  global.RSAEngine = RSAEngine;
})(typeof window !== "undefined" ? window : globalThis);
