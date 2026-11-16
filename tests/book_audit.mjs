// The book: chapter 0 and 28 chapters in 8 parts. Every zoom topic is in exactly one chapter; prerequisites point backwards;
// every chapter renders with no script error and keeps its own page (no window navigates away); text windows open, heavy
// ones on a press; each topic has its questions; the chapter test scores, passes at 80% and records; chapter 0 recommends
// where to start from the self-check; the final exam spans the whole book.
import { createRequire } from 'module'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1000, height: 900 } }); const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.goto(url.pathToFileURL(path.join(ROOT, 'index.html')).href + '#/zoom/book'); await pg.waitForTimeout(600);
const P = []; let n = 0; const ok = (c, m) => { n++; if (!c) P.push(m); }; const ev = f => pg.evaluate(f);
const S = await ev(() => { const own = {}, C = bookCh(), order = bookOrder(); Object.values(C).forEach(c => (c.nodes || []).forEach(x => (own[x] = own[x] || []).push(c.id)));
  return { n: order.length, parts: BOOK.length, missing: ZOOM.map(z => z.id).filter(id => !own[id]), dup: Object.entries(own).filter(([, v]) => v.length > 1).map(x => x[0]), seq: order.every((id, i) => C[id].n === i),
    preBack: Object.values(C).every(c => (c.pre || []).every(p => C[p] && C[p].n < c.n)), goals: Object.values(C).filter(c => c.id !== 'b0').every(c => c.goals && c.goals.length >= 2 && (c.why || c.central)),
    central: PCENTRAL.every(x => Object.values(C).some(c => c.central === x.id)), bridges: Object.values(C).filter(c => c.id !== 'b0' && !c.final).every(c => c.bridge) }; });
ok(S.n === 29 && S.parts === 8 && S.seq, 'chapter 0 and 28 chapters in 8 parts, numbered in order');
ok(S.missing.length === 0 && S.dup.length === 0, 'every topic in exactly one chapter (missing ' + S.missing + ', twice ' + S.dup + ')');
ok(S.preBack, 'every prerequisite is an earlier chapter'); ok(S.goals && S.bridges, 'every chapter says why, what you will be able to do, and leads to the next');
ok(S.central, 'the four central subjects are chapters');
for (const id of await ev(() => bookOrder())) {
  const r = await pg.evaluate(id => { BV.ch = id; BV.exam = null; zBookView(); const art = document.getElementById('bkCh'), c = bookCh()[id];
    const wins = [...document.querySelectorAll('.bk-win')], bad = wins.filter(w => /לא נפתח כאן/.test(w.textContent)).length;
    const textOpen = wins.filter(w => BOOK_OPEN.has(zInfo(w.dataset.w).kind)).every(w => w.querySelector('.bk-wb').dataset.done && w.querySelector('.bk-wb').textContent.trim().length > 10);
    const heavyClosed = wins.filter(w => !BOOK_OPEN.has(zInfo(w.dataset.w).kind)).every(w => !!w.querySelector('[data-mount]'));
    const topics = (c.nodes || []).length + (c.central ? PCENTRAL.find(x => x.id === c.central).items.length : 0), checks = document.querySelectorAll('.bk-check').length;
    return { here: !!art && location.hash.includes('book') || !!art, title: document.querySelector('.bk-ch h2').textContent, wins: wins.length, bad, textOpen, heavyClosed, topics, checks, exam: !!document.querySelector('[data-bx]') || id === 'b0', cards: bookCards(c, 's').length }; }, id);
  ok(r.here && /פרק \d+/.test(r.title), `${id}: renders as its own page`);
  ok(r.bad === 0 && r.textOpen && r.heavyClosed, `${id}: text windows open, heavy ones wait for a press, none fails (${JSON.stringify(r)})`);
  if (id !== 'b0' && id !== 'b28') { ok(r.checks >= Math.max(1, r.topics - 1) && r.exam && r.cards >= 3, `${id}: questions after its topics and a chapter test with at least 3 cards (${r.checks}/${r.topics}, ${r.cards})`); }
}
/* a heavy window opens in place, and the page stays the book */
const M = await ev(() => { BV.ch = 'b18'; zBookView(); const w = [...document.querySelectorAll('.bk-win')].find(x => x.querySelector('[data-mount]')); w.querySelector('[data-mount]').click(); return { mounted: !!w.querySelector('.bk-wb').dataset.done && w.querySelector('.bk-wb').children.length > 0, still: !!document.getElementById('bkCh') }; });
ok(M.mounted && M.still, 'a simulation opens inside the chapter, and the chapter stays');
/* the chapter test */
await ev(() => { window.__ans = right => { const E = BV.exam, card = E.cards[E.i];
  if (card.k === 'mc') { document.querySelector(`#bkA [data-o="${right ? card.a : (card.a + 1) % card.o.length}"]`).click(); document.getElementById('bkCont').click(); }
  else if (card.k === 'calc') { const I = bqInst(card, E.seed + ':' + E.i); document.querySelector('#bkA .bq-in').value = right ? String(I.ans).replace('.', ',') : '-1'; document.querySelector('#bkA .bq-check').click(); document.getElementById('bkCont').click(); }
  else { document.getElementById('bkShow').click(); document.getElementById(right ? 'bkY' : 'bkN').click(); } }; });
const E = await ev(() => { localStorage.clear(); BV.ch = 'b5'; zBookView(); document.querySelector('[data-bx]').click(); const E = BV.exam, total = E.cards.length, kinds = E.cards.map(x => x.k).join(); let k = 0;
  while (BV.exam && BV.exam.i < total) { const card = BV.exam.cards[BV.exam.i]; const right = k < Math.ceil(total * 0.8); k++;
    window.__ans(right); }
  const B = bookLoad(); return { total, kinds, sc: B.exam.b5 && B.exam.b5.sc, ok: B.exam.b5 && B.exam.b5.ok, res: document.querySelector('.pth-result h2').textContent, srs: Object.keys(reviewLoad()).length, next: !!document.getElementById('bkNext') }; });
ok(/calc/.test(E.kinds) && /mc/.test(E.kinds) && E.total >= 5 && E.total <= 10 && E.ok && E.sc >= 0.8 && /עברת/.test(E.res) && E.next, 'a chapter test of up to 10 cards: 80% passes, the result offers the next chapter (' + JSON.stringify(E) + ')');
ok(E.srs >= E.total, 'every answer of the test goes into the spaced repetition store');
const F = await ev(() => { BV.ch = 'b6'; zBookView(); document.querySelector('[data-bx]').click(); while (BV.exam) window.__ans(false);
  const B = bookLoad(); return { ok: B.exam.b6.ok, again: !!document.getElementById('bkAgain'), review: !!document.querySelector('.pth-result details') }; });
ok(!F.ok && F.again && F.review, 'a failed test does not certify, lists what to review and offers another try');
await ev(() => { BV.ch = 'b5'; zBookView(); }); ok(await ev(() => /✅ הוסמכת/.test(document.querySelector('.bk-ch').textContent) && /✅/.test(document.querySelector('.bk-toc').textContent)), 'a passed chapter shows as certified in the chapter and in the contents');
/* v2.51: intuition and calculation questions */
const Q = await ev(() => { const bad = [], o = { mc: 0, calc: 0, nodes: 0 };
  Object.entries(BQ).forEach(([node, Qn]) => { if (!zNode(node)) bad.push('no topic ' + node); o.nodes++;
    (Qn.mc || []).forEach((x, i) => { o.mc++; if (!(x[1].length >= 3 && new Set(x[1]).size === x[1].length && x[2] >= 0 && x[2] < x[1].length && x[3] && x[3].length > 60)) bad.push(node + ' mc ' + i); });
    (Qn.calc || []).forEach((x, i) => { o.calc++; for (let s = 0; s < 60; s++) { const I = bqInst({ id: 'bq:' + node + ':c:' + i, gen: x.gen, tol: x.tol }, 'seed' + s), txt = I.q + I.steps.join(' ');
      if (!(Number.isFinite(I.ans) && I.ans > 0 && I.unit && I.steps.length >= 2 && !/NaN|undefined|Infinity/.test(txt) && bqOk(bqParse(qn(I.ans, 4)), I.ans, I.tol) && !bqOk(I.ans * 1.06, I.ans, I.tol))) { bad.push(node + ' calc ' + i + ' seed ' + s + ' ' + I.ans); break; } } }); });
  const a = bqInst({ id: 'x', gen: BQ.resistor.calc[0].gen }, 1), b = bqInst({ id: 'x', gen: BQ.resistor.calc[0].gen }, 1), c = bqInst({ id: 'x', gen: BQ.resistor.calc[0].gen }, 2);
  o.det = a.q === b.q && a.q !== c.q; o.parse = bqParse('2,2 kΩ') === 2.2 && bqParse(' 1e3') === 1000 && bqParse('abc') === null; o.bad = bad; return o; });
ok(Q.bad.length === 0, 'every question: options distinct, answer valid, an intuitive answer; every calculation: finite, positive, a unit, at least two steps, accepted at its own value and rejected 6% off, for 60 draws (' + Q.bad.slice(0, 5) + ')');
ok(Q.mc >= 40 && Q.calc >= 40 && Q.nodes >= 35, `the bank: ${Q.mc} intuition questions, ${Q.calc} calculations, ${Q.nodes} topics`);
ok(Q.det && Q.parse, 'a calculation is the same for the same seed and changes with it; answers may use a comma');
/* independent checks of some formulas, by another route */
const IND = await ev(() => { const I = (node, k, s) => bqInst(Object.assign({ id: `bq:${node}:c:${k}` }, BQ[node].calc[k]), s), o = {};
  const v = I('vac', 0, 'a'), m = v.q.match(/נפח <bdi dir="ltr">([\d.]+) L/), C = +v.q.match(/C = ([\d.]+) L\/s/)[1]; o.vac = Math.abs(vacCalc({ C, V: +m[1] }).tth - v.ans) < 1e-9;
  const L = I('laser', 0, 'b'), E = +L.q.match(/([\d.]+) µJ/)[1]; o.laser = Math.abs(ANIMS.crater.calc({ E, N: 10 }).D - L.ans) < 1e-6;
  const T = I('trig', 0, 'c'), vv = +T.q.match(/([\d.]+) mm\/s/)[1], p = +T.q.match(/([\d.]+) µm/)[1]; o.trig = Math.abs(ANIMS.scan.calc({ v: vv, p, t: 1 }).f - T.ans) < 1e-9;
  const S = I('safety', 0, 'd'), sv = +S.q.match(/([\d.]+) m\/s</)[1], tr = +S.q.match(/([\d.]+) ms/)[1], a = +S.q.match(/([\d.]+) m\/s²/)[1]; o.safety = Math.abs(stopCalc({ v: sv, a, tSw: tr, tRel: 0, tSto: 0 }).s * 1000 - S.ans) < 1e-9; return o; });
ok(IND.vac && IND.laser && IND.trig && IND.safety, 'calculations agree with the models: vacuum time, crater diameter, line rate, stopping distance (' + JSON.stringify(IND) + ')');
const CK = await ev(() => { BV.ch = 'b1'; zBookView(); const box = document.querySelector('.bk-calc'); if (!box) return {}; const card = Object.values(PCARD_CACHE).flat().find(x => x.id === box.dataset.cid), I = bqInst(card, pathDay());
  box.querySelector('.bq-in').value = String(I.ans); box.querySelector('.bq-check').click(); const okText = box.querySelector('.bq-out').textContent; const steps = box.querySelectorAll('.bq-steps li').length; return { ok: /נכון/.test(okText), steps, mc: document.querySelectorAll('.bk-check .tq').length, rec: reviewLoad()[card.id] && reviewLoad()[card.id].box === 1 }; });
ok(CK.ok && CK.steps >= 2 && CK.mc >= 2 && CK.rec, 'chapter 1: intuition questions and a calculation after each topic; a right answer shows the derivation and is recorded (' + JSON.stringify(CK) + ')');
/* v2.52: everything in the book, and certification */
const U = await ev(() => { const pages = {}; document.querySelectorAll('nav.sheets button').forEach(x => pages[x.dataset.sheet] = 1);
  const hubs = { mot: MOT_NAV, dig: DIG_NAV, pcb: PCB_NAV, lab: LAB_NAV, int: INT_NAV, brd: BRD_NAV, opt: OPT_NAV }; Object.entries(hubs).forEach(([h, n]) => n.forEach(x => pages[h + '/' + x[0]] = 1));
  ['atlas', 'grammar', 'decode', 'quiz', 'board', 'set', 'mech', 'mdrill'].forEach(t => pages['b/' + t] = 1); COMPONENTS.forEach(c => pages['s1/' + c.id] = 1); Object.keys(SYSX).forEach(k => pages['s2/' + k] = 1); BOARDS.forEach(x => pages['lib/' + x.id] = 1);
  const STG = ['intro', 'normal', 'prin', 'worked', 'guided', 'solo'], lv = (typeof LEVELS !== 'undefined' ? LEVELS : []).map(l => l[0]);
  const all = [...Object.keys(pages).map(r => 'p:' + r), ...Object.keys(SYSX).flatMap(s => STG.map(st => `s2:${s}#${st}`)), ...TOPICS.flatMap(t => lv.map(l => `t:${t.id}/${l}`)), ...QB.map(q => 'q:' + q.id), ...SCN.map(s => 'scn:' + s.id)];
  const H = bookHome(), hubRoot = r => /^p:(mot|dig|pcb|lab|int|brd|opt|b|s1|s2)$/.test(r), keys = Object.keys(H);
  const missing = all.filter(k => !H[k] && !(hubRoot(k) && keys.some(c => c.startsWith(k + '/'))));
  const bad = keys.filter(k => !bookCh()[H[k].ch]);
  return { all: all.length, placed: keys.length, missing, bad, scn: SCN.every(s => H['scn:' + s.id]), q: QB.every(q => H['q:' + q.id]), b1: bookAssets('b1').map(x => x.key).join() }; });
ok(U.missing.length === 0 && U.bad.length === 0, `every asset of the site has a home chapter in the book (${U.placed} placed; missing: ${U.missing.slice(0, 8)})`);
ok(U.scn && U.q, 'every fault scenario and every bank question is in a chapter');
ok(/p:b\/grammar/.test(U.b1), 'reading a schematic is in chapter 1');
const OP = await ev(async () => { const kinds = {}, out = []; for (const id of bookOrder()) bookAssets(id).forEach(x => { const k = x.key.split(':')[0]; if (!kinds[k]) kinds[k] = [id, x.ref]; });
  for (const [k, [id, ref]] of Object.entries(kinds)) { BV.ch = id; zBookView(); document.querySelector(`[data-asset="${ref}"]`).click(); await new Promise(r => setTimeout(r, 60)); const back = document.getElementById('bkRet'), moved = !document.getElementById('bkCh');
    if (back) back.click(); await new Promise(r => setTimeout(r, 30)); out.push([k, moved && !!back, !!document.getElementById('bkCh') && BV.ch === id]); } return out; });
OP.forEach(([k, a, b2]) => ok(a && b2, `an asset of kind ${k} opens in its place and the bar returns to its chapter`));
const CR = await ev(() => { localStorage.clear(); const id = bookOrder().find(x => bookFaults(x).length >= 2), B = bookLoad(); B.exam[id] = { ok: true, sc: 0.9 }; bookSave(B);
  const before = bookStatus(bookLoad(), id); const P = {}; bookFaults(id).forEach(f => P[f] = { score: 80 }); saveP(P); const after = bookStatus(bookLoad(), id);
  BV.ch = id; zBookView(); const req = document.querySelector('.bk-req').textContent; return { id, before, after, req: /✅ תקלות הפרק/.test(req) && /✅ מבחן הפרק/.test(req) }; });
ok(CR.before === 'read' && CR.after === 'done' && CR.req, `certification of a chapter needs its test and its faults (${JSON.stringify(CR)})`);
const CT = await ev(() => { localStorage.clear(); const B = bookLoad(), P = {}; bookOrder().forEach(id => { B.exam[id] = { ok: true, sc: 0.85 }; bookFaults(id).forEach(f => P[f] = { score: 70 }); }); B.read.b0 = 1; B.name = 'בודק'; bookSave(B); saveP(P);
  BV.ch = 'b28'; zBookView(); const c = document.getElementById('bkCert'); return { all: /מאשר כי/.test(c.textContent) && /בודק/.test(c.textContent), rows: c.querySelectorAll('tbody tr').length, print: !!document.getElementById('bkPrint') }; });
ok(CT.all && CT.rows === 28 && CT.print, 'with every chapter certified, the last chapter shows a printable certificate with the name and every chapter (' + JSON.stringify(CT) + ')');
await ev(() => { localStorage.clear(); });
/* chapter 0: self-check recommends where to start */
const Z = await ev(() => { localStorage.clear(); BV.ch = 'b0'; zBookView(); const rec = () => document.getElementById('bkPlace').textContent; const r0 = rec();
  BOOK_CAN.slice(0, 2).forEach(([p, list]) => list.forEach((_, k) => { const x = document.querySelector(`[data-can="${p}${k}"]`); x.checked = true; x.dispatchEvent(new Event('change')); })); const r1 = rec();
  BOOK_CAN.forEach(([p, list]) => list.forEach((_, k) => { const x = document.querySelector(`[data-can="${p}${k}"]`); x.checked = true; x.dispatchEvent(new Event('change')); })); const r2 = rec();
  return { r0: /פרק 1\b/.test(r0), r1: /פרק 10\b/.test(r1), r2: /פרק 24/.test(r2), levels: document.querySelectorAll('.bk-box table tbody tr').length }; });
ok(Z.r0 && Z.r1 && Z.r2, 'chapter 0: nothing checked starts at chapter 1; parts A and B checked start at chapter 10; everything checked goes to the cross-cutting chapters');
ok(Z.levels === 5, 'chapter 0: the five scales with their chapters');
const X = await ev(() => { const c = bookCh().b28, cards = bookExamCards(c, 'z'); return { n: cards.length, stages: new Set(cards.map(x => x.stage)).size }; });
ok(X.n === 20 && X.stages >= 15, 'the final exam: 20 cards from at least 15 different stages (' + JSON.stringify(X) + ')');
ok(await ev(() => ZVIEW.list.filter(v => v[2] === 'main')[0][0] === 'book'), 'the book is first in the views bar');
await b.close();
if (errs.length) P.push(...errs.map(e => 'js error: ' + e));
console.log(`book: 29 chapters, ${n} checks`);
if (P.length) { console.log('PROBLEMS (' + P.length + ')'); P.slice(0, 40).forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL BOOK CHECKS PASSED');
