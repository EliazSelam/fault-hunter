// Direction and meaning (v2.71): a formula inside Hebrew text keeps its own order on every page, a glossary meaning never lands inside a formula,
// every abbreviation spells out its letters, the ideas the statistics pages lean on are explained, and the headings step down in size.
import { createRequire } from 'module'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const INDEX = url.pathToFileURL(path.join(ROOT, 'index.html')).href;
const problems = []; let checks = 0; const ok = (c, m) => { checks++; if (!c) problems.push(m); };
const b = await chromium.launch(); const errs = [];
const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); p.on('pageerror', e => errs.push(e.message));
await p.goto(INDEX); await p.waitForTimeout(600);
const ev = (f, a) => p.evaluate(f, a), w = t => p.waitForTimeout(t);

/* 1. every page: no formula left out of order, no meaning inside a formula, few formulas split across elements */
const A = await ev(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)); const hubs = { mot: MOT_NAV, dig: DIG_NAV, ser: SER_NAV, ...hubxNavs(), pcb: PCB_NAV, lab: LAB_NAV, int: INT_NAV, brd: BRD_NAV, opt: OPT_NAV };
  const routes = []; Object.entries(hubs).forEach(([h, n]) => n.forEach(x => routes.push(['r', h + '/' + x[0]]))); bookOrder().forEach(c => routes.push(['b', c])); ZOOM.forEach(z => routes.push(['z', z.id]));
  let risky = 0, inside = 0, frag = 0; const where = [];
  for (const [k, x] of routes) { if (k === 'r') routeGo(x); else if (k === 'b') { BV.ch = x; BV.exam = null; go('zoom', 'book'); } else go('zoom', x); await wait(40);
    glossify(content);
    const r = bidiRisk(content).length, g = content.querySelectorAll('bdi .gdef').length; risky += r; inside += g; if ((r || g) && where.length < 6) where.push(k + ':' + x + ' ' + r + '/' + g);
    content.querySelectorAll('p,li,td,dd,label').forEach(B => { if (B.closest(BIDI_SKIP) || B.closest('[dir=ltr],.mono') || !/[א-ת]/.test(B.textContent) || B.querySelector('p,li,td,div,ul,ol,table')) return;
      const C = B.cloneNode(true); C.querySelectorAll('.gdef').forEach(d => d.remove()); const t = C.textContent;
      (t.match(BIDI_RE) || []).forEach(m => { if (m.length < 3 || !/[=√Σ±≈×]/.test(m)) return; (bidiRun(m).match(/<bdi>[^<]*<\/bdi>/g) || []).forEach(pc => { const want = pc.slice(5, -6); if (/[=√Σ±≈×]/.test(want) && ![...C.querySelectorAll('bdi')].some(x => x.textContent.includes(want))) frag++; }); }); }); }
  return { n: routes.length, risky, inside, frag, where }; });
ok(A.n > 200 && A.risky === 0, `every page: no formula in Hebrew text is left out of order (${A.n} pages; ${A.risky} left; ${A.where.join(', ')})`);
ok(A.inside === 0, `a glossary meaning never sits inside a formula (${A.inside})`);
ok(A.frag <= 30, `formulas split across elements stay rare (${A.frag}, at most 30; were 63 before v2.71)`);

/* 2. the cases that were seen broken */
await ev(() => routeGo('stat/dist')); await w(200); await ev(() => glossify(content));
const D = await ev(() => { const li = [...content.querySelectorAll('ol li')]; const b0 = [...li[0].querySelectorAll('bdi')].map(x => x.textContent), sig = li.find(x => /68\.3%/.test(x.textContent)); return { b0, s: sig ? [...sig.querySelectorAll('bdi')].map(x => x.textContent) : [] }; });
ok(D.b0.includes('x̄ = Σ xᵢ / n'), 'the mean stays one formula, x̄ included (' + D.b0.join(' | ') + ')');
ok(['±1σ', '±2σ', '±3σ', '68.3%', '95.4%', '99.73%'].every(x => D.s.includes(x)), 'each part of "68.3% within ±1σ, …" keeps its place (' + D.s.join(' | ') + ')');
await ev(() => routeGo('sig/lab')); await w(200); await ev(() => glossify(content));
ok(await ev(() => [...content.querySelectorAll('bdi')].some(x => x.textContent === 'y[n] = y[n−1] + α(x[n] − y[n−1])')), 'a filter equation with brackets is one run');
await ev(() => routeGo('mot/why')); await w(200); await ev(() => glossify(content));
const K = await ev(() => { const b = [...content.querySelectorAll('bdi')].find(x => /^T = Kt/.test(x.textContent)); return b ? { f: b.textContent, after: (b.nextElementSibling || {}).className + ':' + (b.nextElementSibling || {}).textContent } : null; });
ok(K && K.f === 'T = Kt·I' && /gdef/.test(K.after) && /Kt/.test(K.after), 'the meaning of a term inside a formula follows the formula (' + JSON.stringify(K) + ')');

/* 3. abbreviations and the two ideas */
const M = await ev(() => ({ miss: acroMissing(), cpk: GSHORT.Cpk, cp: GSHORT.Cp, sil: GSHORT.SIL, grr: GLOSS.GRR }));
ok(!M.miss.length, 'every abbreviation in the glossary spells out its letters (' + M.miss.join(' ') + ')');
ok(/Process Capability Index/.test(M.cpk) && /Process Capability/.test(M.cp) && /Safety Integrity Level/.test(M.sil) && /Repeatability and Reproducibility/.test(M.grr), 'Cpk, Cp, SIL and GRR show their full form the first time they appear');
await ev(() => routeGo('stat/dist')); await w(200); await ev(() => glossify(content));
ok(await ev(() => /שונות סופית/.test(content.textContent) && [...content.querySelectorAll('.gl')].some(a => a.dataset.g === 'משפט הגבול המרכזי')), 'the central limit theorem is explained where it is used, and marked in the glossary');
await ev(() => routeGo('stat/unc')); await w(200); await ev(() => glossify(content));
ok(await ev(() => /מגרילים במחשב אלפי ערכים/.test(content.textContent) && [...content.querySelectorAll('.gl')].some(a => a.dataset.g === 'מונטה-קרלו')), 'the Monte Carlo method is explained on the page whose figure uses it, and marked in the glossary');

/* 4. headings step down: page title, section title, sub-heading, body */
const H = await ev(() => { const px = e => e ? parseFloat(getComputedStyle(e).fontSize) : 0; routeGo('stat/dist'); const h2s = [...content.querySelectorAll('h2')];
  const t = px(h2s.find(h => !h.classList.contains('subh'))), s = px(content.querySelector('h2.subh')), body = px(content.querySelector('p')); BV.ch = 'b13'; BV.exam = null; go('zoom', 'book'); const h3 = px(content.querySelector('h3')); return [t, s, h3, body]; });
ok(H[0] - H[1] >= 6 && H[1] - H[2] >= 4 && H[2] - H[3] >= 4, 'headings step down clearly: page ' + H.join(' > ') + ' px');

/* 5. long windows read as an outline; a level with several subjects groups its windows; the topic list names them apart */
const E = await ev(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)), out = { bad: [], n: 0 };
  for (const z of ZOOM) { const w = 't:' + z.id + ':eng'; if (!zWindows(z).includes(w)) continue; const el = document.createElement('div'); document.body.appendChild(el); zMount(w, el);
    el.querySelectorAll('li.engstep').forEach(li => { out.n++; const d = li.querySelector(':scope > details.engmore'), t = li.querySelector(':scope > .engt'), q = li.querySelector(':scope > .engeq');
      if (!t || (d && (d.open || d.contains(t) || (q && d.contains(q)))) || (!d && li.children.length > 2)) out.bad.push(w); }); el.remove(); }
  go('zoom', 'optics'); await wait(100); document.querySelector('.hubbtn[data-hub="eng"]').click(); await wait(100);
  const nav = document.querySelector('#hubpanel .hubpills'); out.groups = nav ? nav.querySelectorAll('.hubgrp').length : 0; out.pills = nav ? [...nav.querySelectorAll('button')].map(b => b.textContent.trim()) : [];
  TS.open.optics = true; tocLevels(zNode('optics')).forEach(([lv]) => TS.lvl['optics|' + lv[0]] = true); tocRender(); const labels = [...document.querySelectorAll('#toc [data-tw^="optics|"]')].map(b => b.textContent.trim()); out.labels = labels.length; out.dupLabels = labels.length - new Set(labels).size;
  return out; });
ok(E.n > 30 && !E.bad.length, `every engineer-level step keeps its title and equation in view and folds the rest (${E.n} steps; ${[...new Set(E.bad)].join(',')})`);
ok(E.groups === 3 && E.pills.every(t => t.length < 25), 'the optics engineer level groups its 15 windows under lens, tilt and thermal, each named by its kind (' + E.groups + ' groups)');
ok(E.labels >= 40 && E.dupLabels === 0, `in the topic list no two windows of a topic share a name (${E.labels} items, ${E.dupLabels} repeated)`);

ok(!errs.length, 'no script errors: ' + errs.slice(0, 3).join(' | '));
await b.close();
console.log(`rtl: ${checks} checks · ${A.n} pages · ${A.frag} split formulas`);
if (problems.length) { console.log('PROBLEMS (' + problems.length + ')'); problems.forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL RTL CHECKS PASSED');
