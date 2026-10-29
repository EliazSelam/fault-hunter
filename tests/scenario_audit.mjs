// Fault scenario audit: checks every scenario in SCN for structure, a scoring path, a working "learn" link,
// and the teaching layer (a principle, a from-zero explanation and a hint ladder).
import { createRequire } from 'module'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const INDEX = url.pathToFileURL(path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..', 'index.html')).href;

const b = await chromium.launch(); const p = await b.newPage(); const jsErr = [];
p.on('pageerror', e => jsErr.push(e.message));
await p.goto(INDEX); await p.waitForTimeout(400);
const rep = await p.evaluate(() => {
  const out = [], ids = new Set(), txt = v => typeof v === 'string' && v.trim().length > 0;
  for (const s of SCN) {
    const bad = [], need = (c, m) => { if (!c) bad.push(m); };
    need(!ids.has(s.id), 'duplicate id'); ids.add(s.id);
    need([0, 1, 2, 3].includes(s.lvl), 'lvl not 0–3');
    ['title', 'ctx', 'why', 'exp', 'ver'].forEach(k => need(txt(s[k]), `missing ${k}`));
    need(Array.isArray(s.sym) && s.sym.length >= 1, 'no symptoms');
    need(Array.isArray(s.tests) && s.tests.length >= 3, 'fewer than 3 tests');
    (s.tests || []).forEach((t, i) => need(txt(t[0]) && Number.isFinite(t[1]) && t[1] > 0 && txt(t[2]) && (t[3] === 0 || t[3] === 1), `test ${i} malformed`));
    need((s.tests || []).some(t => t[3]), 'no key test (no efficient path)');
    need((s.tests || []).some(t => !t[3]), 'every test is key (nothing to choose)');
    need(Array.isArray(s.opts) && s.opts.length === 4 && s.opts.every(txt), 'not 4 options');
    need(Number.isInteger(s.a) && s.a >= 0 && s.a < (s.opts || []).length, 'answer index out of range');
    need(Array.isArray(s.fix) && s.fix.length === 2 && s.fix.every(txt), 'fix needs corrective + preventive');
    need(s.pr && PRIN[s.pr], 'principle (pr) missing or unknown');
    need(typeof s.sys === 'string' && s.sys.includes(':'), 'sys missing');
    // teaching layer
    need(txt(s.plain), 'missing plain (what is going on, from zero)');
    need(Array.isArray(s.hints) && s.hints.length >= 2 && s.hints.every(txt), 'needs a hint ladder of at least 2');
    need(Number.isInteger(s.pi) && PRINCIPLES[s.pi], 'pi: link to one of the 12 principles');
    need(Array.isArray(s.mech) && s.mech.length >= 3 && s.mech.every(txt), 'needs a mechanism chain of at least 3 steps');
    out.push([s.id, bad]);
  }
  return out;
});
// every "learn" link and the scenario page itself must render
const links = [];
for (const [id] of rep) {
  const r = await p.evaluate(id => { const s = SCN.find(x => x.id === id); playScn(id); const ok1 = document.getElementById('content').textContent.length > 200;
    const before = document.getElementById('content').innerHTML; go(s.learn[0], s.learn[1]); const ok2 = document.getElementById('content').innerHTML !== before && document.getElementById('content').textContent.length > 200;
    return [ok1, ok2]; }, id);
  if (!r[0]) links.push([id, 'scenario page did not render']); if (!r[1]) links.push([id, 'learn link did not open a page']);
}
await b.close();
let nbad = 0;
for (const [id, bad] of rep) if (bad.length) { nbad++; console.log(`✗ ${id}: ${bad.join('; ')}`); }
links.forEach(l => console.log(`✗ ${l[0]}: ${l[1]}`)); jsErr.forEach(e => console.log('✗ js error:', e));
console.log(`${rep.length} scenarios audited, ${nbad + links.length + jsErr.length} problems`);
process.exit(nbad + links.length + jsErr.length ? 1 : 0);
