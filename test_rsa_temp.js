"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

function cargarRSAEngine() {
  const rsaPath = path.join(__dirname, "js", "rsa.js");
  const codigo = fs.readFileSync(rsaPath, "utf8");
  const sandbox = {
    console: console,
    BigInt: BigInt
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(codigo, sandbox, { filename: "js/rsa.js" });

  if (!sandbox.RSAEngine) {
    throw new Error("No se pudo cargar RSAEngine desde js/rsa.js");
  }
  return sandbox.RSAEngine;
}

const RSAEngine = cargarRSAEngine();

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
  registrarPrueba("Autotest oficial: " + tc.nombre, () => {
    const claves = RSAEngine.generarClaves(tc.p, tc.q, tc.e);
    assert.strictEqual(claves.valido, true);
    assert.strictEqual(claves.n, tc.nEsperado);
    assert.strictEqual(claves.phi, tc.phiEsperado);
    assert.strictEqual(claves.d, tc.dEsperado);

    const cifrado = RSAEngine.cifrarMensaje(tc.mensaje, tc.e, claves.n);
    assert.strictEqual(cifrado.valido, true);
    assert.deepStrictEqual(Array.from(cifrado.ascii), tc.asciiEsperado);
    assert.deepStrictEqual(Array.from(cifrado.bloques), tc.cifradoEsperado);

    const descifrado = RSAEngine.descifrarMensaje(cifrado.bloques, claves.d, claves.n);
    assert.strictEqual(descifrado.valido, true);
    assert.deepStrictEqual(Array.from(descifrado.bloquesDescifrados), tc.asciiEsperado);
    assert.strictEqual(descifrado.mensajeDescifrado, tc.mensaje);
  });
}

// 2. Pruebas base de contratos matemáticos actuales
registrarPrueba("Entorno: isSupported() y versión", () => {
  assert.strictEqual(RSAEngine.isSupported(), true);
  assert.strictEqual(typeof RSAEngine.version, "string");
});

registrarPrueba("Primalidad: esPrimo(n)", () => {
  assert.strictEqual(RSAEngine.esPrimo(2), true);
  assert.strictEqual(RSAEngine.esPrimo(17), true);
  assert.strictEqual(RSAEngine.esPrimo(19n), true);
  assert.strictEqual(RSAEngine.esPrimo(997), true);
  assert.strictEqual(RSAEngine.esPrimo(1), false);
  assert.strictEqual(RSAEngine.esPrimo(0), false);
  assert.strictEqual(RSAEngine.esPrimo(-7), false);
  assert.strictEqual(RSAEngine.esPrimo(15), false);
  assert.strictEqual(RSAEngine.esPrimo(323), false);
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

registrarPrueba("Contratos de error en generarClaves", () => {
  const noPrimo = RSAEngine.generarClaves(15, 19, 5);
  assert.strictEqual(noPrimo.valido, false);
  assert.ok(noPrimo.error.includes("no es un número primo"));

  const iguales = RSAEngine.generarClaves(17, 17, 5);
  assert.strictEqual(iguales.valido, false);
  assert.ok(iguales.error.includes("deben ser distintos"));

  const nPequeno = RSAEngine.generarClaves(11, 13, 5);
  assert.strictEqual(nPequeno.valido, false);
  assert.ok(nPequeno.error.includes("menor o igual a 255"));

  const eFueraRango = RSAEngine.generarClaves(17, 19, 1);
  assert.strictEqual(eFueraRango.valido, false);
  assert.ok(eFueraRango.error.includes("1 < e < φ(n)"));

  const eNoCoprimo = RSAEngine.generarClaves(17, 19, 6);
  assert.strictEqual(eNoCoprimo.valido, false);
  assert.ok(eNoCoprimo.error.includes("no es coprimo"));
});

registrarPrueba("Contratos de error en cifrarMensaje y descifrarMensaje", () => {
  const msgVacio = RSAEngine.cifrarMensaje("", 5, 323);
  assert.strictEqual(msgVacio.valido, false);
  assert.strictEqual(msgVacio.error, "El mensaje a cifrar no puede estar vacío.");

  const modPequenoCif = RSAEngine.cifrarMensaje("HOLA", 5, 255);
  assert.strictEqual(modPequenoCif.valido, false);
  assert.ok(modPequenoCif.error.includes("estrictamente mayor que 255"));

  const fueraAscii = RSAEngine.cifrarMensaje("A€", 5, 323);
  assert.strictEqual(fueraAscii.valido, false);
  assert.ok(fueraAscii.error.includes("Carácter fuera de dominio detectado"));

  const descTexto = RSAEngine.descifrarMensaje("21, 129, 247, 12", 173, 323);
  assert.strictEqual(descTexto.valido, true);
  assert.strictEqual(descTexto.mensajeDescifrado, "HOLA");

  const bloqueFueraRango = RSAEngine.descifrarMensaje([21, 323], 173, 323);
  assert.strictEqual(bloqueFueraRango.valido, false);
  assert.ok(bloqueFueraRango.error.includes("fuera del dominio válido 0 ≤ C < n"));
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
