// Packs the built Anatomy figures into src/42-anatomy.js (the `const ANATOMY_HTML = {...};` line),
// so the single-file app can show them. Run after rebuilding a figure:
//   node figures/relay-bench/build.mjs && node figures/line-scan/build.mjs && node figures/aos-laser/build.mjs && node figures/embed.mjs && ./build.sh
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const figs = {
  relay: readFileSync(join(HERE, "relay-bench", "relay-bench.html"), "utf8"),
  linescan: readFileSync(join(HERE, "line-scan", "line-scan.html"), "utf8"),
  aos: readFileSync(join(HERE, "aos-laser", "aos-laser.html"), "utf8"),
};
const target = join(HERE, "..", "src", "42-anatomy.js");
const src = readFileSync(target, "utf8").split("\n");
const i = src.findIndex((l) => l.startsWith("const ANATOMY_HTML = "));
if (i < 0) throw new Error("ANATOMY_HTML line not found in src/42-anatomy.js");
src[i] = "const ANATOMY_HTML = " + JSON.stringify(figs).replace(/<\//g, "<\\/") + ";";
writeFileSync(target, src.join("\n"));
console.log("embedded", Object.keys(figs).join(", "), "into src/42-anatomy.js");
