"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

function cargarModulos() {
  const rsaPath = path.join(__dirname, "js", "rsa.js");
  const validacionesPath = path.join(__dirname, "js", "validaciones.js");

  const codigoRsa = fs.readFileSync(rsaPath, "utf8");
  const codigoValidaciones = fs.readFileSync(validacionesPath, "utf8");

  const sandbox = {
    console: console,
    BigInt: BigInt,
    Math: Math,
    Number: Number,
    String: String,
    Array: Array,
    Error: Error,
    TypeError: TypeError
  };
  sandbox.globalThis = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(codigoRsa, sandbox, { filename: "js/rsa.js" });
  vm.runInContext(codigoValidaciones, sandbox, { filename: "js/validaciones.js" });

  if (!sandbox.RSAEngine) {
    throw new Error("No se pudo cargar RSAEngine desde js/rsa.js");
  }
  if (!sandbox.RSAValidaciones) {
    throw new Error("No se pudo cargar RSAValidaciones desde js/validaciones.js");
  }

  return {
    RSAEngine: sandbox.RSAEngine,
    RSAValidaciones: sandbox.RSAValidaciones,
    codigoRsa: codigoRsa
  };
}

const { RSAEngine, RSAValidaciones, codigoRsa } = cargarModulos();

const pruebas = [];
function registrarPrueba(nombre, fn) {
  pruebas.push({ nombre: nombre, fn: fn });
}

// 1. Casos oficiales del PDF (extraídos de ejecutarAutotest)
const casosOficialesPDF = [
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

for (const tc of casosOficialesPDF) {
  registrarPrueba("Matemática pura (RSAEngine): " + tc.nombre, () => {
    const claves = RSAEngine.generarClaves(tc.p, tc.q, tc.e);
    assert.strictEqual(claves.n, tc.nEsperado);
    assert.strictEqual(claves.phi, tc.phiEsperado);
    assert.strictEqual(claves.d, tc.dEsperado);
    assert.strictEqual(claves.clavePublica.texto, `(${tc.nEsperado}, ${tc.e})`);
    assert.strictEqual(claves.clavePrivada.texto, `(${tc.nEsperado}, ${tc.dEsperado})`);

    const cifrado = RSAEngine.cifrarMensaje(tc.mensaje, tc.e, claves.n);
    assert.deepStrictEqual(Array.from(cifrado.ascii), tc.asciiEsperado);
    assert.deepStrictEqual(Array.from(cifrado.bloques), tc.cifradoEsperado);

    const descifrado = RSAEngine.descifrarMensaje(Array.from(cifrado.bloques), claves.d, claves.n);
    assert.deepStrictEqual(Array.from(descifrado.bloquesDescifrados), tc.asciiEsperado);
    assert.strictEqual(descifrado.mensajeDescifrado, tc.mensaje);
  });

  registrarPrueba("Validaciones + Matemática (RSAValidaciones): " + tc.nombre, () => {
    const claves = RSAValidaciones.validarYGenerarClaves(String(tc.p), String(tc.q), String(tc.e));
    assert.strictEqual(claves.valido, true);
    assert.strictEqual(claves.exito, true);
    assert.strictEqual(claves.n, tc.nEsperado);
    assert.strictEqual(claves.phi, tc.phiEsperado);
    assert.strictEqual(claves.d, tc.dEsperado);

    const cifrado = RSAValidaciones.validarYCifrarMensaje(tc.mensaje, claves.eBig, claves.nBig);
    assert.strictEqual(cifrado.valido, true);
    assert.deepStrictEqual(Array.from(cifrado.ascii), tc.asciiEsperado);
    assert.deepStrictEqual(Array.from(cifrado.bloques), tc.cifradoEsperado);

    const descifrado = RSAValidaciones.validarYDescifrarMensaje(cifrado.textoCifrado, claves.dBig, claves.nBig);
    assert.strictEqual(descifrado.valido, true);
    assert.deepStrictEqual(Array.from(descifrado.bloquesDescifrados), tc.asciiEsperado);
    assert.strictEqual(descifrado.mensajeDescifrado, tc.mensaje);
  });
}

// 2. Separación estricta de js/rsa.js (100% matemático)
registrarPrueba("Separación estricta: js/rsa.js sin parseo ni autotest ni errores UI", () => {
  assert.strictEqual("aBigInt" in RSAEngine, false);
  assert.strictEqual("parsearBloquesCifrados" in RSAEngine, false);
  assert.strictEqual("ejecutarAutotest" in RSAEngine, false);

  assert.strictEqual(codigoRsa.includes("aBigInt"), false);
  assert.strictEqual(codigoRsa.includes("parsearBloquesCifrados"), false);
  assert.strictEqual(codigoRsa.includes("ejecutarAutotest"), false);
  assert.strictEqual(codigoRsa.includes("const errores = []"), false);
});

// 3. Pruebas matemáticas puras en RSAEngine
registrarPrueba("Entorno: isSupported() y versión", () => {
  assert.strictEqual(RSAEngine.isSupported(), true);
  assert.strictEqual(typeof RSAEngine.version, "string");
});

registrarPrueba("Primalidad y generación: esPrimo, listarPrimosEnRango, generarPrimos", () => {
  assert.strictEqual(RSAEngine.esPrimo(2), true);
  assert.strictEqual(RSAEngine.esPrimo(17), true);
  assert.strictEqual(RSAEngine.esPrimo(19n), true);
  assert.strictEqual(RSAEngine.esPrimo(997), true);
  assert.strictEqual(RSAEngine.esPrimo(1), false);
  assert.strictEqual(RSAEngine.esPrimo(0), false);
  assert.strictEqual(RSAEngine.esPrimo(-7), false);
  assert.strictEqual(RSAEngine.esPrimo(15), false);
  assert.strictEqual(RSAEngine.esPrimo(323), false);

  const primosPeq = RSAEngine.listarPrimosEnRango(17, 29);
  assert.deepStrictEqual(Array.from(primosPeq), [17n, 19n, 23n, 29n]);

  const genPeq = RSAEngine.generarPrimos("pequenos");
  assert.strictEqual(RSAEngine.esPrimo(genPeq.pBig), true);
  assert.strictEqual(RSAEngine.esPrimo(genPeq.qBig), true);
  assert.notStrictEqual(genPeq.pBig, genPeq.qBig);
  assert.ok(genPeq.nBig > 255n);

  const genMed = RSAEngine.generarPrimos("medianos");
  assert.strictEqual(RSAEngine.esPrimo(genMed.pBig), true);
  assert.strictEqual(RSAEngine.esPrimo(genMed.qBig), true);
  assert.ok(genMed.pBig >= 101n && genMed.pBig <= 499n);
  assert.ok(genMed.qBig >= 101n && genMed.qBig <= 499n);
});

registrarPrueba("Euclides: euclidesMCD(a, b) y pasos", () => {
  const coprimos = RSAEngine.euclidesMCD(288, 5);
  assert.strictEqual(coprimos.mcdBig, 1n);
  assert.strictEqual(coprimos.esCoprimo, true);
  assert.ok(Array.isArray(coprimos.pasos) && coprimos.pasos.length > 0);

  const noCoprimos = RSAEngine.euclidesMCD(288, 6);
  assert.strictEqual(noCoprimos.mcdBig, 6n);
  assert.strictEqual(noCoprimos.esCoprimo, false);
});

registrarPrueba("Euclides Extendido: euclidesExtendido(e, phi) y pasos", () => {
  const ext = RSAEngine.euclidesExtendido(5, 288);
  assert.strictEqual(ext.inversoExiste, true);
  assert.strictEqual(ext.d, 173);
  assert.strictEqual(ext.dBig, 173n);
  assert.strictEqual((5n * ext.dBig) % 288n, 1n);
  assert.ok(Array.isArray(ext.pasos) && ext.pasos.length > 0);

  const sinInverso = RSAEngine.euclidesExtendido(6, 288);
  assert.strictEqual(sinInverso.inversoExiste, false);
  assert.strictEqual(sinInverso.dBig, null);
});

registrarPrueba("Sugerencia de exponente: sugerirExponenteE(phi, eActual)", () => {
  const sug1 = RSAEngine.sugerirExponenteE(288);
  assert.strictEqual(sug1.sugeridoBig, 5n);
  assert.ok(sug1.candidatos.includes(5));

  const sug2 = RSAEngine.sugerirExponenteE(288, 5n);
  assert.notStrictEqual(sug2.sugeridoBig, 5n);
  assert.strictEqual(RSAEngine.euclidesMCD(sug2.sugeridoBig, 288n).esCoprimo, true);
});

registrarPrueba("Exponenciación Modular: potenciaModular(base, exp, mod) y pasos", () => {
  const exp = RSAEngine.potenciaModular(72, 5, 323);
  assert.strictEqual(exp.resultado, 21);
  assert.strictEqual(exp.resultadoBig, 21n);
  assert.ok(Array.isArray(exp.pasos) && exp.pasos.length > 0);

  const dec = RSAEngine.potenciaModular(21, 173, 323);
  assert.strictEqual(dec.resultado, 72);
  assert.strictEqual(dec.resultadoBig, 72n);
});

// 4. Pruebas de parseo y validaciones en RSAValidaciones
registrarPrueba("Parseos: esEnteroTexto, aBigInt y parsearBloquesCifrados", () => {
  assert.strictEqual(RSAValidaciones.esEnteroTexto(" 17 "), true);
  assert.strictEqual(RSAValidaciones.esEnteroTexto("-5"), true);
  assert.strictEqual(RSAValidaciones.esEnteroTexto("12.3"), false);
  assert.strictEqual(RSAValidaciones.esEnteroTexto("abc"), false);

  assert.strictEqual(RSAValidaciones.aBigInt(" 19 ", "q"), 19n);
  assert.strictEqual(RSAValidaciones.aBigInt(17, "p"), 17n);
  assert.throws(() => RSAValidaciones.aBigInt("abc", "p"), /no es un entero válido/);

  const parseOk = RSAValidaciones.parsearBloquesCifrados("[21, 129; 247 12]");
  assert.strictEqual(parseOk.valido, true);
  assert.deepStrictEqual(Array.from(parseOk.bloquesBig), [21n, 129n, 247n, 12n]);

  const parseVacio = RSAValidaciones.parsearBloquesCifrados("   ");
  assert.strictEqual(parseVacio.valido, false);
  assert.strictEqual(parseVacio.error, "Ingrese al menos un bloque numérico cifrado para poder descifrar.");

  const parseTokenMalo = RSAValidaciones.parsearBloquesCifrados("21, xyz, 12");
  assert.strictEqual(parseTokenMalo.valido, false);
  assert.ok(parseTokenMalo.error.includes("no es un bloque entero válido"));
});

registrarPrueba("Contratos de error exactos en validarYGenerarClaves", () => {
  const noEntero = RSAValidaciones.validarYGenerarClaves("abc", "19", "5");
  assert.strictEqual(noEntero.valido, false);
  assert.ok(noEntero.error.includes("El parámetro p debe ser un número entero válido."));

  const noPrimo = RSAValidaciones.validarYGenerarClaves("15", "19", "5");
  assert.strictEqual(noPrimo.valido, false);
  assert.ok(noPrimo.error.includes("El valor p = 15 no es un número primo."));

  const iguales = RSAValidaciones.validarYGenerarClaves("17", "17", "5");
  assert.strictEqual(iguales.valido, false);
  assert.ok(iguales.error.includes("Los primos p y q deben ser distintos (p ≠ q)."));

  const nPequeno = RSAValidaciones.validarYGenerarClaves("11", "13", "5");
  assert.strictEqual(nPequeno.valido, false);
  assert.ok(nPequeno.error.includes("es menor o igual a 255"));

  const eInvalido = RSAValidaciones.validarYGenerarClaves("17", "19", "xyz");
  assert.strictEqual(eInvalido.valido, false);
  assert.ok(eInvalido.error.includes("El exponente público e debe ser un número entero válido."));
  assert.ok(eInvalido.sugerenciasE.length > 0);

  const eFueraRango = RSAValidaciones.validarYGenerarClaves("17", "19", "1");
  assert.strictEqual(eFueraRango.valido, false);
  assert.ok(eFueraRango.error.includes("1 < e < φ(n)"));

  const eNoCoprimo = RSAValidaciones.validarYGenerarClaves("17", "19", "6");
  assert.strictEqual(eNoCoprimo.valido, false);
  assert.ok(eNoCoprimo.error.includes("no es coprimo con φ(n)"));
});

registrarPrueba("Contratos de error exactos en validarYCifrarMensaje y validarYDescifrarMensaje", () => {
  const msgVacio = RSAValidaciones.validarYCifrarMensaje("", 5, 323);
  assert.strictEqual(msgVacio.valido, false);
  assert.strictEqual(msgVacio.error, "El mensaje a cifrar no puede estar vacío.");

  const modPequenoCif = RSAValidaciones.validarYCifrarMensaje("HOLA", 5, 255);
  assert.strictEqual(modPequenoCif.valido, false);
  assert.ok(modPequenoCif.error.includes("estrictamente mayor que 255"));

  const fueraAscii = RSAValidaciones.validarYCifrarMensaje("A€", 5, 323);
  assert.strictEqual(fueraAscii.valido, false);
  assert.ok(fueraAscii.error.includes("Carácter fuera de dominio detectado"));

  const mMayorN = RSAValidaciones.validarYCifrarMensaje("ÿ", 5, 255);
  assert.strictEqual(mMayorN.valido, false);

  const modPequenoDec = RSAValidaciones.validarYDescifrarMensaje([21], 173, 255);
  assert.strictEqual(modPequenoDec.valido, false);
  assert.ok(modPequenoDec.error.includes("estrictamente mayor que 255"));

  const dInvalido = RSAValidaciones.validarYDescifrarMensaje([21], 0, 323);
  assert.strictEqual(dInvalido.valido, false);
  assert.ok(dInvalido.error.includes("debe ser un entero positivo"));

  const bloqueFueraRango = RSAValidaciones.validarYDescifrarMensaje([21, 323], 173, 323);
  assert.strictEqual(bloqueFueraRango.valido, false);
  assert.ok(bloqueFueraRango.error.includes("fuera del dominio válido 0 ≤ C < n"));

  const mPrimaFueraAscii = RSAValidaciones.validarYDescifrarMensaje([260], 1, 323);
  assert.strictEqual(mPrimaFueraAscii.valido, false);
  assert.ok(mPrimaFueraAscii.error.includes("fuera del rango ASCII extendido (0–255)"));
});

registrarPrueba("Badges y helpers UI en RSAValidaciones: validarEstadoCamposClave", () => {
  const vacio = RSAValidaciones.validarEstadoCamposClave("", "", "", null);
  assert.strictEqual(vacio.p.texto, "Sin ingresar");
  assert.strictEqual(vacio.p.estado, "neutral");
  assert.strictEqual(vacio.q.texto, "Sin ingresar");
  assert.strictEqual(vacio.e.texto, "Sin ingresar");

  const ok = RSAValidaciones.validarYGenerarClaves("17", "19", "5");
  const badgesOk = RSAValidaciones.validarEstadoCamposClave("17", "19", "5", ok);
  assert.strictEqual(badgesOk.p.texto, "Primo válido");
  assert.strictEqual(badgesOk.p.estado, "ok");
  assert.strictEqual(badgesOk.q.texto, "Primo válido");
  assert.strictEqual(badgesOk.q.estado, "ok");
  assert.strictEqual(badgesOk.e.texto, "Coprimo válido");
  assert.strictEqual(badgesOk.e.estado, "ok");

  const iguales = RSAValidaciones.validarEstadoCamposClave("17", "17", "5", null);
  assert.strictEqual(iguales.q.texto, "Igual a p");
  assert.strictEqual(iguales.q.estado, "error");

  const nPeq = RSAValidaciones.validarEstadoCamposClave("11", "13", "5", null);
  assert.strictEqual(nPeq.q.texto, "n ≤ 255");
  assert.strictEqual(nPeq.q.estado, "error");

  const eNoCop = RSAValidaciones.validarYGenerarClaves("17", "19", "6");
  const badgesENoCop = RSAValidaciones.validarEstadoCamposClave("17", "19", "6", eNoCop);
  assert.strictEqual(badgesENoCop.e.texto, "No válido");
  assert.strictEqual(badgesENoCop.e.estado, "error");

  const sugCheck = RSAValidaciones.validarPrimosParaSugerencia("17", "19");
  assert.strictEqual(sugCheck.valido, true);
  assert.strictEqual(sugCheck.phiBig, 288n);
  assert.strictEqual(RSAValidaciones.esExponenteValidoParaPhi("5", 288n), true);
  assert.strictEqual(RSAValidaciones.esExponenteValidoParaPhi("6", 288n), false);
});

registrarPrueba("Integración Fase 3: orden de scripts en index.html y contratos en js/app.js", () => {
  const htmlPath = path.join(__dirname, "index.html");
  const appPath = path.join(__dirname, "js", "app.js");

  const codigoHtml = fs.readFileSync(htmlPath, "utf8");
  const codigoApp = fs.readFileSync(appPath, "utf8");

  const idxRsa = codigoHtml.indexOf('<script src="js/rsa.js"></script>');
  const idxVal = codigoHtml.indexOf('<script src="js/validaciones.js"></script>');
  const idxApp = codigoHtml.indexOf('<script src="js/app.js"></script>');

  assert.ok(idxRsa !== -1, "Falta <script src=\"js/rsa.js\"></script> en index.html");
  assert.ok(idxVal !== -1, "Falta <script src=\"js/validaciones.js\"></script> en index.html");
  assert.ok(idxApp !== -1, "Falta <script src=\"js/app.js\"></script> en index.html");
  assert.ok(
    idxRsa < idxVal && idxVal < idxApp,
    "El orden de carga en index.html debe ser estrictamente: js/rsa.js -> js/validaciones.js -> js/app.js"
  );

  // Verificar que todas las llamadas engine.<metodo> en js/app.js existen en RSAEngine
  const regexEngine = /\bengine\.([a-zA-Z0-9_]+)\b/g;
  let matchEngine;
  const metodosEngineUsados = new Set();
  while ((matchEngine = regexEngine.exec(codigoApp)) !== null) {
    const metodo = matchEngine[1];
    metodosEngineUsados.add(metodo);
    assert.strictEqual(
      typeof RSAEngine[metodo],
      "function",
      "js/app.js invoca engine." + metodo + " pero no existe en RSAEngine"
    );
  }

  // Verificar que todas las llamadas validaciones.<metodo> en js/app.js existen en RSAValidaciones
  const regexVal = /\bvalidaciones\.([a-zA-Z0-9_]+)\b/g;
  let matchVal;
  const metodosValUsados = new Set();
  while ((matchVal = regexVal.exec(codigoApp)) !== null) {
    const metodo = matchVal[1];
    metodosValUsados.add(metodo);
    assert.strictEqual(
      typeof RSAValidaciones[metodo],
      "function",
      "js/app.js invoca validaciones." + metodo + " pero no existe en RSAValidaciones"
    );
  }

  // Confirmar que js/app.js delega las validaciones a RSAValidaciones y los cálculos a RSAEngine
  assert.ok(metodosValUsados.has("validarEstadoCamposClave"));
  assert.ok(metodosValUsados.has("validarYGenerarClaves"));
  assert.ok(metodosValUsados.has("validarYCifrarMensaje"));
  assert.ok(metodosValUsados.has("validarYDescifrarMensaje"));
  assert.ok(metodosValUsados.has("validarPrimosParaSugerencia"));
  assert.ok(metodosValUsados.has("esExponenteValidoParaPhi"));

  assert.ok(metodosEngineUsados.has("isSupported"));
  assert.ok(metodosEngineUsados.has("generarPrimos"));
  assert.ok(metodosEngineUsados.has("sugerirExponenteE"));
  assert.ok(metodosEngineUsados.has("potenciaModular"));

  assert.strictEqual(codigoApp.includes("engine.aBigInt"), false);
  assert.strictEqual(codigoApp.includes("function esEnteroTexto"), false);
});

let pasadas = 0;
let fallidas = 0;

console.log("=== Ejecutando test_rsa_temp.js ===");
for (const prueba of pruebas) {
  try {
    prueba.fn();
    pasadas += 1;
    console.log("✔ PASS:", prueba.nombre);
  } catch (err) {
    fallidas += 1;
    console.error("✘ FAIL:", prueba.nombre);
    console.error("  ", err && err.stack ? err.stack : err);
  }
}

console.log(`\nResumen: ${pasadas}/${pruebas.length} pruebas pasaron, ${fallidas} fallaron.`);
if (fallidas > 0) {
  process.exit(1);
}
