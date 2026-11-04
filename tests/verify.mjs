// Self-check for Fault Hunter (Node port of verify.py, plus the PCB/AOI sheets).
import { createRequire } from 'module'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const INDEX = url.pathToFileURL(path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..', 'index.html')).href;
const BAD = "() => /NaN|undefined|\\[object|Infinity/.test(document.getElementById('content').innerHTML)";
const problems = []; const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1200, height: 1200 } });
pg.on('pageerror', e => problems.push(['js error', e.message]));
await pg.goto(INDEX); await pg.waitForTimeout(400);
const r = await pg.evaluate('runVerify()');
r.num.filter(x => !x[3]).forEach(x => problems.push(['number', x[0], x[1], x[2]])); r.logic.filter(x => !x[1]).forEach(x => problems.push(['logic', x[0]]));
console.log(`numbers: ${r.num.length} checks, logic: ${r.logic.length} checks`);
const orphan = await pg.evaluate('QB.filter(q => !QT[q.t]).map(q => q.id)'); orphan.forEach(id => problems.push(['question without a topic', id]));
let n = 0; const chk = async tag => { n++; if (await pg.evaluate(BAD)) problems.push(['page', tag]); };
for (const s of await pg.evaluate("[...document.querySelectorAll('nav.sheets button')].map(b=>b.dataset.sheet)")) { await pg.evaluate(`go('${s}')`); await chk(s); }
for (const sub of await pg.evaluate('PCB_NAV.map(n=>n[0])')) { await pg.evaluate(`go('pcb','${sub}')`); await chk('pcb:' + sub); }
for (const sub of await pg.evaluate('LAB_NAV.map(n=>n[0])')) { await pg.evaluate(`go('lab','${sub}')`); await chk('lab:' + sub); }
for (const sub of await pg.evaluate('INT_NAV.map(n=>n[0])')) { await pg.evaluate(`go('int','${sub}')`); await chk('int:' + sub); }
for (const sub of await pg.evaluate('MOT_NAV.map(n=>n[0])')) { await pg.evaluate(`go('mot','${sub}')`); await chk('mot:' + sub); }
for (const sub of await pg.evaluate('DIG_NAV.map(n=>n[0])')) { await pg.evaluate(`go('dig','${sub}')`); await chk('dig:' + sub); }
for (const sub of await pg.evaluate('BRD_NAV.map(n=>n[0])')) { await pg.evaluate(`go('brd','${sub}')`); await chk('brd:' + sub); }
for (const sub of await pg.evaluate('OPT_NAV.map(n=>n[0])')) { await pg.evaluate(`go('opt','${sub}')`); await chk('opt:' + sub); }
for (const t of ['atlas', 'grammar', 'decode', 'quiz', 'board', 'set', 'mech', 'mdrill']) { await pg.evaluate(`showB('${t}')`); await chk('b:' + t); }
for (const c of await pg.evaluate('COMPONENTS.map(c=>c.id)')) { await pg.evaluate(`showS1('${c}')`); await chk('s1:' + c); }
for (const sid of await pg.evaluate('Object.keys(SYSX)')) for (const st of ['zero', 'intro', 'normal', 'prin', 'worked', 'guided', 'solo']) { await pg.evaluate(`showSys('${sid}','${st}')`); await chk(`sys:${sid}:${st}`); }
for (const bid of await pg.evaluate('BOARDS.map(b=>b.id)')) { await pg.evaluate(`showLib('${bid}')`); await chk('lib:' + bid); }
for (const sid of await pg.evaluate('SCN.map(s=>s.id)')) { await pg.evaluate(`playScn('${sid}')`); await chk('scn:' + sid); }
for (const q of await pg.evaluate('QB.map(q=>q.id)')) { await pg.evaluate(`showQ('${q}',['${q}'])`); await pg.click('[data-sh="3"]'); await chk('q:' + q); }
// fault injection on the new simulations
for (const [id, faults] of [['laser', ['none', 'dirty', 'aging', 'reg']], ['fid', ['none', 'shift', 'affine']]]) {
  await pg.evaluate(`showS1('${id}')`);
  for (const f of faults) { await pg.selectOption('#bh select', f); await pg.waitForTimeout(50); await chk(`sim:${id}:${f}`); }
}
await b.close();
console.log(`pages crawled: ${n}`);
if (problems.length) { console.log('PROBLEMS:'); problems.forEach(p => console.log(' ', ...p)); process.exit(1); }
console.log('ALL CHECKS PASSED');
