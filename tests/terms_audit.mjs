// Every English term on every page must be defined (GLOSS or LEX), and every "explained in" link must open a real page.
// Hebrew text is covered by the lexicon; English sentences marked lang="en" (interview lines, machine messages) are skipped.
import { createRequire } from 'module'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const INDEX = url.pathToFileURL(path.join(ROOT, 'index.html')).href;
/* not terms: formula symbols, signal names, people, and plain English words that appear inside labels */
const ALLOW = new Set(`Rin Rf QA QB RL IR Ke Kb Kt cos sin exp ln Ia Ra Vin Vout Iout Iin Ts Is TL Pm Pin VG VD VC VB Paul Falstad Iain Sharp Ryan
U V W L N PE A B C D E F G H I J K M P Q R S T X Y Z II III IV es
in on of the to and or with for at by is it`.split(/\s+/));
const problems = []; const seen = new Map();
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
pg.on('pageerror', e => problems.push('js error: ' + e.message));
await pg.goto(INDEX); await pg.waitForTimeout(400);
const routes = await pg.evaluate(() => {
  const r = [...document.querySelectorAll('nav.sheets button')].map(b => [b.dataset.sheet]);
  const hubs = { dig: DIG_NAV, pcb: PCB_NAV, lab: LAB_NAV, int: INT_NAV, brd: BRD_NAV, opt: OPT_NAV, mot: MOT_NAV };
  Object.entries(hubs).forEach(([h, n]) => n.forEach(x => r.push([h, x[0]])));
  ['atlas', 'grammar', 'decode', 'quiz', 'board', 'set', 'mech', 'mdrill'].forEach(t => r.push(['b', t]));
  COMPONENTS.forEach(c => r.push(['s1', c.id])); Object.keys(SYSX).forEach(s => ['intro', 'normal', 'prin', 'worked', 'guided', 'solo'].forEach(st => r.push(['sys', s, st])));
  BOARDS.forEach(x => r.push(['lib', x.id])); QB.forEach(q => r.push(['q', q.id])); SCN.forEach(s => r.push(['scn', s.id]));
  return r;
});
const TEXT = `() => { const skip = GL_SKIP + ',[lang=en],iframe,a,.gdef'; const w = document.createTreeWalker(document.getElementById('content'), NodeFilter.SHOW_TEXT); const o = [];
  while (w.nextNode()) { const n = w.currentNode, pe = n.parentElement; if (pe.closest(skip) || pe.closest('.gl')) continue; o.push(n.nodeValue); } return o.join(' \\n '); }`;
const known = await pg.evaluate(() => { const k = Object.keys(GLOSS); LEX.forEach(e => { k.push(e[0]); e[2].forEach(a => k.push(a.replace(/^=/, ''))); }); return k.filter(x => /[A-Za-z]/.test(x)); });
const esc = s => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const KRE = new RegExp('(?<![A-Za-z0-9])(' + known.sort((a, b) => b.length - a.length).map(esc).join('|') + ')(?:e?s)?(?![A-Za-z0-9])', 'gi');
for (const r of routes) {
  const [a, x, y] = r;
  await pg.evaluate(([a, x, y]) => { if (a === 'sys') showSys(x, y); else if (a === 'lib') showLib(x); else if (a === 'q') { showQ(x, [x]); document.querySelector('[data-sh="3"]').click(); } else if (a === 'scn') playScn(x); else if (a === 'b') showB(x); else go(a, x); }, [a, x, y]);
  await pg.waitForTimeout(60);
  if (a === 'gl') continue;
  const t = (await pg.evaluate(`(${TEXT})()`)).replace(/"[A-Za-z0-9 _:./\-]+"/g, ' ').replace(KRE, ' ');
  for (const tok of t.match(/(?<![A-Za-z0-9_])[A-Za-z][A-Za-z\-]*[A-Za-z](?![A-Za-z0-9_])/g) || []) for (const part of tok.split('-')) {
    if (part.length < 2 || ALLOW.has(part)) continue;
    if (!seen.has(part)) seen.set(part, r.join('/'));
  }
}
for (const [tok, where] of seen) problems.push(`undefined term "${tok}" (first on ${where})`);
/* links */
const links = await pg.evaluate(() => Object.entries(TERM_LINK));
for (const [term, r] of links) {
  const ok = await pg.evaluate(r => { try { routeGo(r); return document.getElementById('content').textContent.length > 200; } catch (e) { return 'err ' + e.message; } }, r);
  if (ok !== true) problems.push(`link for "${term}" → ${r} does not open a page (${ok})`);
}
await pg.evaluate(() => go('gl')); await pg.waitForTimeout(200);
const rows = await pg.evaluate(() => [document.querySelectorAll('.glrow').length, allTerms().length]);
if (rows[0] !== rows[1]) problems.push(`glossary page shows ${rows[0]} of ${rows[1]} terms`);
await b.close();
console.log(`terms: ${routes.length} pages, ${known.length} known terms, ${links.length} links, glossary ${rows[0]} entries`);
if (problems.length) { console.log('PROBLEMS (' + problems.length + ')'); problems.slice(0, 400).forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL TERM CHECKS PASSED');
