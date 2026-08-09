#!/usr/bin/env node
/**
 * Comprueba que las URLs de data/apis.json responden.
 * Uso: node scripts/check_links.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const data = JSON.parse(readFileSync(join(root, "data", "apis.json"), "utf8"));
const apis = data.apis;

const TIMEOUT = 15000;
const CONCURRENCIA = 5;
const UA =
  "Mozilla/5.0 (compatible; public-apis-es-checker/1.0; +https://github.com/LopezDev7/public-apis-es)";

async function check(api) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(api.url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: "*/*" },
    });
    return { api, ok: true, status: res.status, error: null };
  } catch (err) {
    return {
      api,
      ok: false,
      status: null,
      error: err.name === "AbortError" ? "timeout" : err.cause?.code ?? err.message,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const queue = [...apis];
  const results = [];
  const workers = Array.from({ length: CONCURRENCIA }, async () => {
    while (queue.length) {
      const api = queue.shift();
      results.push(await check(api));
    }
  });
  await Promise.all(workers);

  const ordenados = results.sort((a, b) => a.api.nombre.localeCompare(b.api.nombre, "es"));
  for (const r of ordenados) {
    if (r.ok) console.log(`  OK  [${r.status}]  ${r.api.nombre}`);
    else console.log(`  FAIL        ${r.api.nombre}  (${r.error})`);
  }

  const ok = results.filter((r) => r.ok).length;
  const rotos = results.length - ok;
  console.log(`\n${ok}/${results.length} URLs responden.`);

  if (rotos > 0) {
    console.log(
      `\n${rotos} URL(s) sin respuesta. Algunas APIs bloquean bots o marcan CORS; revisa cada una manualmente antes de quitarla.`,
    );
    process.exitCode = 1;
  }
}

main();
