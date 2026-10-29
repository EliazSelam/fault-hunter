// Teaching audit: renders every "from zero" lesson as the reader sees it, and fails if any lexicon term
// appears in the lesson without a row in that lesson's words table (or its "what's inside" table).
// Also fails if a step in a component lesson lacks its "why" or its "what you see" part.
import { createRequire } from 'module'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const INDEX = url.pathToFileURL(path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..', 'index.html')).href;

const b = await chromium.launch(); const p = await b.newPage(); await p.goto(INDEX); await p.waitForTimeout(400);
const report = await p.evaluate(async () => {
  const wait = () => new Promise(r => requestAnimationFrame(() => r()));
  const audit = async (id, open, sel) => {
    open(); await wait();
    const root = document.querySelector(sel); if (!root) return { id, missing: ['(lesson not rendered)'] };
    const clone = root.cloneNode(true);
    clone.querySelectorAll('.gdef').forEach(e => e.remove());              // glossary hints are not definitions
    const tables = [...clone.querySelectorAll('table')];
    const wordsT = tables.find(t => /מילה/.test(t.querySelector('th')?.textContent || ''));
    const insideT = tables.find(t => /החלק/.test(t.querySelector('th')?.textContent || ''));
    const defined = [wordsT, insideT].filter(Boolean).flatMap(t => [...t.querySelectorAll('tbody tr')].map(r => r.cells[0].textContent)).join(' | ');
    if (wordsT) wordsT.querySelectorAll('tbody tr').forEach(r => r.cells[0].remove());   // keep definitions as body: they must be explained too
    clone.querySelectorAll('.zfull, .say p[lang="en"], svg').forEach(e => e.remove());
    const body = clone.textContent;
    const missing = LEX.filter(e => e[2].some(a => lexFound(body, a)) && !lexDefined(defined, e)).map(e => e[0]);
    const steps = [...root.querySelectorAll('ol.tsteps > li')];
    const badSteps = sel.includes('comp') ? steps.filter(li => !li.querySelector('.ty') || !li.querySelector('.ts')).length : 0;
    return { id, missing, badSteps, words: wordsT ? wordsT.querySelectorAll('tbody tr').length : 0, steps: steps.length };
  };
  const out = [];
  for (const c of COMPONENTS) out.push(await audit('component:' + c.id, () => showS1(c.id), '#comp .zcomp'));
  for (const id of Object.keys(ZERO)) out.push(await audit('system:' + id, () => showSys(id, 'zero'), '#sxb'));
  out.push(await audit('integration:zero', () => showInt('zero'), '#hb'));
  return out;
});
await b.close();
let bad = 0;
for (const r of report) {
  const issues = [];
  if (r.missing.length) issues.push('undefined: ' + r.missing.join(', '));
  if (r.badSteps) issues.push(r.badSteps + ' steps without why / what you sense');
  if (issues.length) { bad++; console.log(`✗ ${r.id}: ${issues.join(' · ')}`); }
  else console.log(`✓ ${r.id}: ${r.words} terms defined, ${r.steps} steps`);
}
console.log(`${report.length} lessons audited, ${bad} with problems`);
process.exit(bad ? 1 : 0);
