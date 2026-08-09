#!/usr/bin/env node
/**
 * Genera README.md a partir de data/apis.json y valida su estructura.
 * Uso: node scripts/generate.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dataPath = join(root, "data", "apis.json");
const readmePath = join(root, "README.md");
const OWNER = "LopezDev7";
const REPO = "public-apis-es";

const data = JSON.parse(readFileSync(dataPath, "utf8"));
const categorias = data.categorias;
const apis = data.apis;

const errores = [];

if (!Array.isArray(categorias) || categorias.length === 0) {
  errores.push("Falta la lista de categorias.");
}
if (!Array.isArray(apis) || apis.length === 0) {
  errores.push("Falta la lista de apis.");
}

const authValidos = new Set(["No", "apiKey", "OAuth"]);
const corsValidos = new Set(["Sí", "No", "Desconocido"]);

apis.forEach((api, i) => {
  const etiqueta = `#${i + 1} (${api.nombre ?? "sin nombre"})`;
  if (!api.categoria) errores.push(`${etiqueta}: falta "categoria".`);
  else if (!categorias.includes(api.categoria))
    errores.push(`${etiqueta}: categoria "${api.categoria}" no está en la lista.`);
  if (!api.nombre) errores.push(`#${i + 1}: falta "nombre".`);
  if (!api.url || !/^https?:\/\//.test(api.url))
    errores.push(`${etiqueta}: "url" inválida (${api.url ?? "vacía"}).`);
  if (!api.descripcion) errores.push(`${etiqueta}: falta "descripcion".`);
  if (!authValidos.has(api.auth))
    errores.push(`${etiqueta}: "auth" inválido (${api.auth}). Usa No | apiKey | OAuth.`);
  if (api.https !== "Sí" && api.https !== "No")
    errores.push(`${etiqueta}: "https" inválido (${api.https}). Usa Sí | No.`);
  if (!corsValidos.has(api.cors))
    errores.push(`${etiqueta}: "cors" inválido (${api.cors}). Usa Sí | No | Desconocido.`);
});

if (errores.length > 0) {
  console.error("ERRORES EN LOS DATOS:");
  errores.forEach((e) => console.error(" - " + e));
  process.exit(1);
}

const porCategoria = categorias.map((cat) => ({
  categoria: cat,
  apis: apis
    .filter((a) => a.categoria === cat)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
}));

const total = apis.length;

const fila = (a) =>
  `| [${a.nombre}](${a.url}) | ${a.descripcion} | ${a.auth} | ${a.https} | ${a.cors} |`;

const tablas = porCategoria
  .filter((g) => g.apis.length > 0)
  .map(
    (g) =>
      `### ${g.categoria}\n\n` +
      `| Nombre | Descripción | Auth | HTTPS | CORS |\n` +
      `|---|---|---|---|---|\n` +
      g.apis.map(fila).join("\n"),
  )
  .join("\n\n");

const indice = porCategoria
  .filter((g) => g.apis.length > 0)
  .map((g) => `- [${g.categoria}](#${g.categoria.toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, "").replace(/[áéíóú]/g, (x) => ({ á: "a", é: "e", í: "i", ó: "o", ú: "u" })[x])})`)
  .join("\n");

const readme = `# public-apis-es

![Stars](https://img.shields.io/github/stars/${OWNER}/${REPO}?style=flat-square&label=stars&color=blue)
![PRs](https://img.shields.io/badge/PRs-bienvenidas-brightgreen?style=flat-square)
![Contribuciones](https://img.shields.io/github/issues/${OWNER}/${REPO}?style=flat-square&label=issues)
![Licencia](https://img.shields.io/github/license/${OWNER}/${REPO}?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)

Lista curada de **APIs públicas y gratuitas** documentadas en español, con **${total} APIs** organizadas en **${porCategoria.filter((g) => g.apis.length > 0).length} categorías**.

Sin clave, con clave gratuita o con OAuth: aquí tienes APIs reales para tus proyectos, demos y side projects. No listamos APIs que pidan pagar por empezar.

> 📌 **¿Falta una API?** Abre una [issue](https://github.com/${OWNER}/${REPO}/issues/new/choose) o un [PR](https://github.com/${OWNER}/${REPO}/compare). La lista la mantiene la comunidad, cualquier aporte suma. Mira [CONTRIBUTING.md](CONTRIBUTING.md).

## Índice

${indice}

---

${tablas}

---

## ✨ Proyectos que usan esta lista

¿Has construido algo con estas APIs? Mándanos un PR y lo añadimos aquí.

## 🤝 Cómo contribuir

Toda la ayuda cuenta, tanto si es tu primer PR como si ya llevas años:

1. Añade la API a [data/apis.json](data/apis.json) siguiendo el formato de las demás.
2. Ejecuta \`node scripts/generate.mjs\` para regenerar el README.
3. La validación y el chequeo de enlaces corren automáticamente en cada PR (CI).

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) para los detalles.

## 📜 Licencia

MIT
`;

writeFileSync(readmePath, readme, "utf8");
console.log(`README generado: ${total} APIs en ${porCategoria.filter((g) => g.apis.length > 0).length} categorías.`);
