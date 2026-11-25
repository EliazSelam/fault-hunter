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
    /* v2.59: a topic's main text windows open; heavy windows, deeper windows and the site's places wait for a press */
    const textOpen = wins.filter(w => w.dataset.auto).every(w => w.querySelector('.bk-wb').dataset.done && w.querySelector('.bk-wb').textContent.trim().length > 10);
    const heavyClosed = wins.filter(w => !w.dataset.auto).every(w => !!w.querySelector('[data-mount]'));
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
  const hubs = { mot: MOT_NAV, dig: DIG_NAV, ser: SER_NAV, ...hubxNavs(), pcb: PCB_NAV, lab: LAB_NAV, int: INT_NAV, brd: BRD_NAV, opt: OPT_NAV }; Object.entries(hubs).forEach(([h, n]) => n.forEach(x => pages[h + '/' + x[0]] = 1));
  ['atlas', 'grammar', 'decode', 'quiz', 'board', 'set', 'mech', 'mdrill'].forEach(t => pages['b/' + t] = 1); COMPONENTS.forEach(c => pages['s1/' + c.id] = 1); Object.keys(SYSX).forEach(k => pages['s2/' + k] = 1); BOARDS.forEach(x => pages['lib/' + x.id] = 1);
  const STG = ['zero', 'intro', 'normal', 'prin', 'worked', 'guided', 'solo'], lv = (typeof LEVELS !== 'undefined' ? LEVELS : []).map(l => l[0]);
  const all = [...Object.keys(pages).map(r => 'p:' + r), ...Object.keys(SYSX).flatMap(s => STG.map(st => `s2:${s}#${st}`)), ...TOPICS.flatMap(t => lv.map(l => `t:${t.id}/${l}`)), ...QB.map(q => 'q:' + q.id), ...SCN.map(s => 'scn:' + s.id)];
  /* since v2.58 an asset is placed by the place it opens (bookTarget): a hub's root, a system's page or a page that shows another page is that place */
  const H = bookHome(), hubRoot = r => /^p:(s1|s2)$/.test(r), keys = Object.keys(H);
  const missing = all.filter(k => !H[bookTarget(k)] && !(hubRoot(k) && keys.some(c => c.startsWith(k + '/'))));
  const bad = keys.filter(k => !bookCh()[H[k].ch]);
  return { all: all.length, placed: keys.length, missing, bad, scn: SCN.every(s => H['scn:' + s.id]), q: QB.every(q => H['q:' + q.id]), b1: bookAssets('b1').map(x => x.key).join() }; });
ok(U.missing.length === 0 && U.bad.length === 0, `every asset of the site has a home chapter in the book (${U.placed} placed; missing: ${U.missing.slice(0, 8)})`);
ok(U.scn && U.q, 'every fault scenario and every bank question is in a chapter');
ok(/p:b\/grammar/.test(U.b1), 'reading a schematic is in chapter 1');
const OP = await ev(async () => { const kinds = {}, out = []; for (const id of bookOrder()) bookAssets(id).forEach(x => { const k = x.key.split(':')[0]; if (!kinds[k]) kinds[k] = [id, x.ref]; });
  /* v2.59: an asset is read inside its chapter: a question as an exercise or a solved example, anything else as an item that opens there */
  for (const [k, [id, ref]] of Object.entries(kinds)) { BV.ch = id; BV.exam = null; zBookView(); const A = document.getElementById('bkCh'), key = bookTarget(ref);
    const el = k === 'q' ? A.querySelector(`[data-q="${key.slice(2)}"]`) : [...A.querySelectorAll('.bk-win')].find(e => (e.dataset.emb ? bookTarget(e.dataset.emb) : bookWinTarget(e.dataset.w)) === key); let open = !!el;
    if (el && el.classList.contains('bk-win')) { bookMount(el); await new Promise(r => setTimeout(r, 80)); const wb = el.querySelector('.bk-wb'); open = !!wb.dataset.done && wb.children.length > 0; bookUnmount(el); }
    out.push([k, !!el, open && !!document.getElementById('bkCh') && BV.ch === id]); } return out; });
OP.forEach(([k, a, b2]) => ok(a && b2, `an asset of kind ${k} is read inside its chapter and opens there (${a}, ${b2})`));
/* v2.58: every item of every chapter opens without an error, at the place it names (a system's stage, a library card, a simulation or a
   circuit on its page), and no two items of one chapter show the same thing or carry the same name */
const ALL = await ev(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)), out = { items: 0, err: [], dup: [], name: [], place: [] };
  for (const ch of bookOrder().filter(id => id !== 'b0')) { const seen = {}, names = {};
    for (const x of bookAssets(ch)) { out.items++; const nm = (BOOK_KIND[x.key.split(':')[0]] || '') + ' ' + bookAssetName(x.ref); if (names[nm]) out.name.push(`${bookCh()[ch].n}: ${nm}`); names[nm] = 1;
      try { go('zoom', 'book'); bookOpen(x.ref, ch); } catch (e) { out.err.push(`${x.ref}: ${e.message.slice(0, 60)}`); continue; } await wait(40);
      const c = document.getElementById('content').cloneNode(true); c.querySelectorAll('#bkRetNav, .zback, .zsub').forEach(e => e.remove());
      const t = c.textContent.replace(/\s+/g, ' ').trim(), w = document.querySelector('#hubpanel .zwin[data-w]'), here = document.querySelector('.bk-here'), fp = t.length + ':' + t.slice(0, 400) + t.slice(-200) + '|' + (w ? w.dataset.w : '') + '@' + (here ? here.id : '');
      if (seen[fp]) out.dup.push(`${bookCh()[ch].n}: ${seen[fp]} = ${x.ref}`); seen[fp] = x.ref;
      const [k, v] = [x.ref.slice(0, x.ref.indexOf(':')), x.ref.slice(x.ref.indexOf(':') + 1)];
      if (k === 's2') { const st = v.split('#')[1], cur = document.querySelector('.stepper [aria-current="true"]'); if (!cur || cur.dataset.st !== st) out.place.push(`${x.ref} → ${cur ? cur.dataset.st : 'no stage'}`); }
      if (k === 'p' && v.startsWith('lib/')) { const h = document.querySelector('#content section.block h2'), B = BOARDS.find(z => z.id === v.slice(4)); if (!h || !B || !h.textContent.includes(B.name)) out.place.push(`${x.ref} → ${h ? h.textContent.slice(0, 30) : 'no card'}`); }
      if (k === 'cj' || (k === 'sim' && BOOK_SIMPAGE[v])) { const want = k === 'cj' ? 'cj-' + v : BOOK_SIMPAGE[v][1].slice(1); if (!here || here.id !== want) out.place.push(`${x.ref} → ${here ? here.id : 'nothing marked'}`); } } }
  go('zoom', 'book'); return out; });
ok(ALL.err.length === 0, `every item of the book opens without an error (${ALL.items} items; ${ALL.err.slice(0, 4).join(' | ')})`);
ok(ALL.place.length === 0, `every stage, library card, simulation and circuit opens at the place it names (${ALL.place.slice(0, 4).join(' | ')})`);
ok(ALL.dup.length === 0, `no two items of a chapter show the same thing (${ALL.dup.slice(0, 4).join(' | ')})`);
ok(ALL.name.length === 0, `no two items of a chapter carry the same name (${ALL.name.slice(0, 4).join(' | ')})`);
const CR = await ev(() => { localStorage.clear(); const id = bookOrder().find(x => bookFaults(x).length >= 2), B = bookLoad(); B.exam[id] = { ok: true, sc: 0.9 }; bookSave(B);
  const before = bookStatus(bookLoad(), id); const P = {}; bookFaults(id).forEach(f => P[f] = { score: 80 }); saveP(P); const after = bookStatus(bookLoad(), id);
  BV.ch = id; zBookView(); const req = document.querySelector('.bk-req').textContent; return { id, before, after, req: /✅ תקלות הפרק/.test(req) && /✅ מבחן הפרק/.test(req) }; });
ok(CR.before === 'read' && CR.after === 'done' && CR.req, `certification of a chapter needs its test and its faults (${JSON.stringify(CR)})`);
const CT = await ev(() => { localStorage.clear(); const B = bookLoad(), P = {}; bookOrder().forEach(id => { B.exam[id] = { ok: true, sc: 0.85 }; bookFaults(id).forEach(f => P[f] = { score: 70 }); }); B.read.b0 = 1; B.name = 'בודק'; bookSave(B); saveP(P);
  BV.ch = 'b28'; zBookView(); const c = document.getElementById('bkCert'); return { all: /מאשר כי/.test(c.textContent) && /בודק/.test(c.textContent), rows: c.querySelectorAll('tbody tr').length, print: !!document.getElementById('bkPrint') }; });
ok(CT.all && CT.rows === 28 && CT.print, 'with every chapter certified, the last chapter shows a printable certificate with the name and every chapter (' + JSON.stringify(CT) + ')');
await ev(() => { localStorage.clear(); });
/* v2.53: two directions, up from the component or down from the machine */
const DN = await ev(() => { localStorage.clear(); const homes = JSON.stringify(Object.entries(bookHome()).map(([k, v]) => k + v.ch)), upOrder = bookOrder().join();
  BV.ch = 'b0'; zBookView(); document.querySelector('.bk-dircard[data-dir="down"]').click(); const o = bookOrder(), n21 = bookCh().b21.n;
  const first = document.querySelector('.bk-end [data-bc]').dataset.bc;
  BV.ch = 'b21'; zBookView(); const links = document.querySelector('.bk-links').textContent, h2 = document.querySelector('.bk-ch h2').textContent, toc = [...document.querySelectorAll('.bk-toc .bk-part > b')].map(x => x.textContent);
  BV.ch = 'b1'; zBookView(); const leaf = document.querySelector('.bk-links') ? document.querySelector('.bk-links').textContent : '';
  const P = pathLoad(), top = PTRACKS.every(tr => pathOpen(P, tr.stages[tr.stages.length - 1]) && !pathOpen(P, tr.stages[0]));
  const plan = pathPlan(['mo'], 3, P)[0].join(), same = JSON.stringify(Object.entries(bookHome()).map(([k, v]) => k + v.ch)) === homes;
  document.querySelector('.bk-dir [data-dir="up"]').click(); const back = bookOrder().join() === upOrder && bookCh().b1.n === 1;
  return { order: o.slice(1, 4).join(), cross: o.slice(-5).join(), first, n21, h2, links, toc0: toc[0], toc7: toc[6], leaf, top, plan, same, back }; });
ok(DN.order === 'b23,b21,b22' && DN.cross === 'b24,b25,b26,b27,b28' && DN.first === 'b23', 'going down: the line, the cycle and first power-up come first; the cross-cutting subjects and the final exam stay last; chapter 0 starts at the line (' + JSON.stringify(DN) + ')');
ok(DN.n21 === 2 && /^פרק 2:/.test(DN.h2), 'going down, chapters are numbered in the order read (' + DN.n21 + ' ' + DN.h2 + ' | ' + DN.toc0 + ' | ' + DN.toc7 + ')');
ok(/יורד אל/.test(DN.links) && /חלק ז/.test(DN.toc0) && /חלק א/.test(DN.toc7), 'going down, a chapter says what it goes down into, and the contents run from part G to part A');
ok(/בא מתוך/.test(DN.leaf), 'going down, a component chapter says what it comes from');
ok(DN.top && DN.plan === 'servo,sig,loop', 'going down, the path opens each track at its top stage and the plan deals from the top');
ok(DN.same && DN.back, 'the direction changes the order only: every asset keeps its home chapter, and going back up restores the numbering');
/* v2.54: one spine — the next step everywhere */
const SP = await ev(() => { localStorage.clear(); const steps = [], step = () => { const N = bookNext(bookLoad()); return N.id + ':' + N.step; };
  steps.push(step()); let B = bookLoad(); B.read.b0 = 1; bookSave(B); steps.push(step()); B = bookLoad(); B.read.b1 = 1; bookSave(B); steps.push(step());
  B = bookLoad(); B.exam.b1 = { ok: true, sc: 0.9 }; bookSave(B); steps.push(step()); const f = bookFaults('b1'); const P = {}; f.forEach(x => P[x] = { score: 70 }); saveP(P); steps.push(step());
  BV.ch = 'b3'; zBookView(); const dash = document.querySelector('.bk-dash'), txt = dash.textContent, toc = document.querySelector('.bk-toc summary').textContent.match(/(\d+)\/28/)[1], dn = txt.match(/(\d+)\/28/)[1]; dash.querySelector('[data-dash="next"]').click(); const went = BV.ch, title = document.querySelector('.bk-ch h2').textContent;
  return { steps, f: f.length, toc, dash: dn, txt: /הצעד הבא/.test(txt) && /פרקים מוסמכים/.test(txt) && /נשאר בזיכרון/.test(txt), went, title }; });
ok(SP.steps.join() === `b0:start,b1:read,b1:exam,${SP.f ? 'b1:faults' : 'b2:read'},b2:read`, 'the next step follows the course: start, read, test, faults, next chapter (' + SP.steps + ')');
ok(SP.toc === SP.dash && SP.txt && SP.went === 'b2' && /פרק 2/.test(SP.title), 'the course board on every chapter shows the next step, certified chapters, reviews due and memory, and "continue" goes there');
const EX = await ev(() => { localStorage.clear(); const B = bookLoad(); B.read.b0 = 1; B.read.b1 = 1; bookSave(B); BV.ch = 'b5'; zBookView(); document.querySelector('[data-dash="next"]').click(); const inExam = !!BV.exam && BV.exam.ch === 'b1'; BV.exam = null; return inExam; });
ok(EX, 'when the next step is a test, "continue" opens the test');
const LK = await ev(() => { localStorage.clear(); PV.sess = null; PV.tab = 'map'; PV.open = 'relay'; go('zoom', 'path'); const b = document.querySelector('[data-bkch]'), ch = b && b.dataset.bkch; b.click(); const inBook = !!document.getElementById('bkCh') && BV.ch === ch;
  PV.open = 'cal:axis'; go('zoom', 'path'); const cal = document.querySelector('[data-bkch]').dataset.bkch;
  go('zoom', 'relay'); const nb = document.querySelector('[data-nbook]'), nch = nb && nb.dataset.nbook; nb.click(); return { ch, inBook, cal, nch, back: BV.ch === nch && !!document.getElementById('bkCh') }; });
ok(LK.ch === 'b5' && LK.inBook && LK.cal === 'b24' && LK.nch === 'b5' && LK.back, 'a path stage and a topic page lead to their chapter in the book (' + JSON.stringify(LK) + ')');
const MSd = await ev(async () => { localStorage.clear(); go('zoom', 'machine'); await new Promise(r => setTimeout(r, 400)); const el = document.querySelector('.bk-mside'), btn = document.getElementById('mBook'); if (!el) return {}; btn.click(); return { text: /הקורס/.test(el.textContent), book: !!document.getElementById('bkCh') && BV.ch === 'b0' }; });
ok(MSd.text && MSd.book, 'the machine view shows where the course stands and leads into the book');
await ev(() => localStorage.clear());
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
/* ---- v2.72: a chapter written as a textbook (chapter 6). The shape, the numbered equations, the layer of windows, the guided
   solutions, and the numbers: each one recomputed here from the stated values, independently of the chapter's own code ---- */
await ev(() => { BV.ch = 'b6'; BV.exam = null; go('zoom', 'book'); }); await pg.waitForTimeout(500);
const TB = await ev(() => { const A = content, h3 = [...A.querySelectorAll('h3')].map(h => h.textContent.trim());
  const at = t => h3.findIndex(x => x.startsWith(t)), order = ['6.0 ', '6.1 ', '6.2 ', '6.3 ', '★ 6.4 ', '6.5 ', '6.6 ', '6.7 ', '🎛️'].map(at);
  const eqs = [...A.querySelectorAll('.tb-eq')].map(e => e.dataset.eq), want = Array.from({ length: eqs.length }, (_, i) => '6.' + (i + 1));
  const links = [...A.querySelectorAll('[data-tbeq]')].map(b => b.dataset.tbeq), layer = [...A.querySelectorAll('[data-tbw]')].map(b => b.dataset.tbw);
  const ws = zWindows(zNode('pwm')), inCh = ws.filter(w => A.querySelector(`.bk-win[data-w="${w}"]`)).length;
  return { order, eqs: eqs.join(), seq: eqs.join() === want.join(), links: links.every(l => eqs.includes(l)), layer: layer.length >= 4 && layer.every(w => !!A.querySelector(`.bk-win[data-w="${w}"]`)), inCh, ws: ws.length,
    probs: A.querySelectorAll('.tb-prob').length, ex: [...A.querySelectorAll('.tb-x')].map(x => x.closest('section').contains(x) && !!x.querySelector('details')).filter(Boolean).length, risk: bidiRisk(A).length, whyOnce: A.querySelectorAll('#bk-why').length }; });
ok(TB.order.every((x, i) => x >= 0 && (i === 0 || x > TB.order[i - 1])), 'textbook chapter: opening, numbered sections, an advanced section, summary, solved problems, exercises, then the layer of windows, in that order (' + TB.order + ')');
ok(TB.seq && TB.eqs.split(',').length >= 12, 'textbook chapter: equations numbered 6.1, 6.2, … in order (' + TB.eqs + ')');
ok(TB.links && TB.layer, 'textbook chapter: every link to an equation and every pointer to a window finds it in the chapter');
ok(TB.inCh === TB.ws, `textbook chapter: every window of the topic is still in the chapter, in the layer (${TB.inCh}/${TB.ws})`);
ok(TB.probs === 3 && TB.ex >= 6 && TB.risk === 0 && TB.whyOnce === 1, 'textbook chapter: three solved problems, six exercises with hidden answers, no formula out of order, one opening');
const G = await ev(() => { const p = content.querySelector('.tb-prob'), st = [...p.querySelectorAll('.tb-st')], seen = [], h0 = location.hash;
  for (let i = 0; i < st.length + 1; i++) { seen.push(st.filter(x => !x.hidden).length); const n = p.querySelector('[data-tbn]'); if (!n.hidden) n.click(); }
  const before = p.querySelector('.tb-lastans').hidden; p.querySelector('[data-tbr]').click(); const after = !p.querySelector('.tb-lastans').hidden;
  const w = content.querySelector('[data-tbw]'); w.click(); const d = document.getElementById('fhDrawer'), mounted = TBS.w === w.dataset.tbw && !d.hidden && d.classList.contains('tb-par') && document.querySelector('#drwB .tbs-win').children.length > 0; drawerClose();
  return { seen, before, after, mounted, stay: location.hash === h0 }; });
ok(G.seen.join() === Array.from({ length: G.seen.length }, (_, i) => Math.min(i + 1, G.seen.length - 1)).join() && G.before && G.after, 'a solved problem opens one step per press, and its last step shows only on request (' + G.seen + ')');
ok(G.mounted && G.stay, 'a pointer to a window opens it beside the text, without leaving the chapter');
const NUM = await ev(() => { const c = TBOOK.b6.check, Vs = 24, near = (a, b, t = 1e-6) => Math.abs(a - b) <= t * Math.max(1, Math.abs(b)), bad = [];
  const tri = (V, D, L, f) => V * D * (1 - D) / (L * f), exact = (V, R, T, tau, D) => { const a = Math.exp(-D * T / tau), b = Math.exp(-(1 - D) * T / tau); return V / R * (1 - a) * (1 - b) / (1 - a * b); };
  [['avg', c.avg1, 0.3 * 24], ['rms', c.rms1, 24 * Math.sqrt(0.3)], ['P', c.Pr, 0.3 * 576 / 12], ['I2', c.I2, 3], ['dI2', c.dI2, tri(24, .5, 2e-3, 20e3)], ['dI2 exact', c.dI2x, exact(24, 4, 5e-5, 5e-4, .5)],
   ['shoot', c.Ish, 240], ['deadtime', c.dVt, 0.24], ['bipolar', c.dIbp, 2 * tri(24, .5, 2e-3, 20e3)], ['A1', c.A1, 48 / Math.PI], ['Psw', c.Psw, 0.072],
   ['P1.D', c.P1.D, 0.5], ['P1.dI', c.P1.dI, 0.125], ['P2.f', c.P2.f, 30000], ['P3.got', c.P3.got, 2.4 - 0.48], ['E5', c.E5, 48 / Math.PI * Math.SQRT1_2]].forEach(([k, a, b]) => { if (!near(a, b)) bad.push(k + ' ' + a + ' ≠ ' + b); });
  /* two derivations that must agree: the fundamental of the current from the Fourier series (6.14) and from the triangle of 6.8 */
  if (!near(c.I1h, c.Ifund, 1e-9)) bad.push('Fourier ≠ triangle ' + c.I1h + ' ' + c.Ifund);
  /* the approximation is the limit of the exact ripple: at τ/T = 100 they agree to 0.1% */
  const e = exact(24, 4, 5e-6, 5e-4, .5), a = tri(24, .5, 2e-3, 2e5); if (Math.abs(a / e - 1) > 1e-3) bad.push('limit ' + a + ' vs ' + e);
  /* the optimum of P(f) = a/f² + k f: the derivative vanishes there */
  const { a: A6, k: K6, f: F6 } = c.E6, dP = -2 * A6 / F6 ** 3 + K6; if (Math.abs(dP) > 1e-9 * K6 * 1e3) bad.push('optimum ' + dP);
  const txt = content.textContent; [c.avg1, c.dI2, c.P2.f / 1e3].forEach(v => { const s = (+v.toFixed(3)).toString(); if (!txt.includes(s)) bad.push('not in the text: ' + s); });
  return bad; });
/* ---- v2.73: reading beside the simulation ---- */
const PAR = await ev(async () => { const w8 = ms => new Promise(r => setTimeout(r, ms)), o = {}, S = TBOOK.b6.side, d = () => document.getElementById('fhDrawer');
  o.btns = [...content.querySelectorAll('[data-tbpar]')].map(b => b.dataset.tbpar).join() === Object.keys(S).join() && !content.querySelector('.tb-adv [data-tbpar]');
  o.wins = Object.values(S).every(x => x.win.every(([w]) => zWindows(zNode('pwm')).includes(w)));
  o.eqs = Object.values(S).every(x => x.look.every(([eq]) => content.querySelector(`.tb-eq[data-eq="${eq}"]`)));
  o.marks = [...new Set(Object.values(S).flatMap(x => x.look.map(l => l[0])))].every(eq => content.querySelector(`.tb-eq[data-eq="${eq}"] [data-tbse]`));
  content.querySelector('[data-tbpar="6.2"]').click(); await w8(200);
  const b = document.getElementById('drwB'); o.open = !d().hidden && d().classList.contains('tb-par') && document.body.classList.contains('tb-par-on') && TBS.sid === '6.2' && TBS.w === S['6.2'].win[0][0] && /6\.2/.test(document.getElementById('drwT').textContent);
  o.tabs = [...b.querySelectorAll('[data-tbsw]')].map(x => x.dataset.tbsw).join() === S['6.2'].win.map(x => x[0]).join() && b.querySelector('.tbs-win').children.length > 0 && b.querySelectorAll('.tbs-look li').length === S['6.2'].look.length;
  b.querySelectorAll('[data-tbsw]')[1].click(); await w8(150); o.tab = TBS.w === S['6.2'].win[1][0] && document.querySelector('#drwB [data-tbsw][aria-selected="true"]').dataset.tbsw === S['6.2'].win[1][0];
  document.querySelector('#drwB [data-tbseq="6.8"]').click(); await w8(900); const e = content.querySelector('.tb-eq[data-eq="6.8"]'), r = e.getBoundingClientRect(); o.chip = r.top > 0 && r.bottom < innerHeight && e.classList.contains('tb-flash');
  content.querySelector('.tb-eq[data-eq="6.10"] [data-tbse]').click(); await w8(150); o.eqbtn = TBS.sid === '6.3' && document.querySelector('#drwB [data-tbsl="6.10"]').classList.contains('tb-flash');
  /* following the reading: the panel moves to the section in the middle of the screen, and stays put when following is off */
  TBS.t = 0; content.querySelector('.tb-eq[data-eq="6.2"]').scrollIntoView({ block: 'center' }); await w8(900); o.follow = TBS.sid === '6.1';
  document.querySelector('#drwB .tbs-follow input').click(); TBS.t = 0; content.querySelector('.tb-eq[data-eq="6.8"]').scrollIntoView({ block: 'center' }); await w8(900); o.still = TBS.sid === '6.1'; document.querySelector('#drwB .tbs-follow input').click();
  o.nogl = !content.querySelector('.tb-eq .gl, .tb-eq .gdef');
  drawerClose(); o.closed = d().hidden && !document.body.classList.contains('tb-par-on') && TBS.sid === null && !d().classList.contains('tb-par');
  content.querySelector('[data-tbpar="6.1"]').click(); await w8(100); go('zoom', 'world'); await w8(200); o.leave = d().hidden && TBS.sid === null;
  BV.ch = 'b6'; go('zoom', 'book'); await w8(200);
  /* the choice is kept: opened by hand, the next visit opens the panel by itself as a section reaches the middle; closed with ✕, it stops */
  o.kept = localStorage.getItem('fh-tbpar') === '1'; TBS.t = 0; content.querySelector('.tb-eq[data-eq="6.8"]').scrollIntoView({ block: 'center' }); await w8(900); o.auto = !d().hidden && TBS.sid === '6.2';
  d().querySelector('.drw-x').click(); o.off = localStorage.getItem('fh-tbpar') === '0' && d().hidden; TBS.t = 0; content.querySelector('.tb-eq[data-eq="6.2"]').scrollIntoView({ block: 'center' }); await w8(900); o.offStays = d().hidden;
  localStorage.removeItem('fh-tbpar');
  return o; });
ok(PAR.btns && PAR.wins && PAR.eqs && PAR.marks, 'reading beside the simulation: every section with windows has its button, every window is the topic\'s, every equation named has its button');
ok(PAR.open && PAR.tabs, 'the panel opens beside the text with the section\'s windows as tabs, the first one running, and a line for every equation it shows');
ok(PAR.tab, 'a tab changes the window in the panel');
ok(PAR.chip && PAR.eqbtn, 'an equation in the panel leads to it in the text, and an equation in the text leads to its line in the panel');
ok(PAR.follow && PAR.still, 'the panel follows the section being read, and stays put when following is off');
ok(PAR.nogl, 'no glossary meaning is written inside an equation');
ok(PAR.closed && PAR.leave, 'closing the panel, or leaving the chapter, stops it');
ok(PAR.kept && PAR.auto && PAR.off && PAR.offStays, 'a reader who opened the panel gets it by itself next time, and closing it with ✕ stops that');
/* the numbers in the panel are what the simulations show */
const LOOK = await ev(() => { const bad = [], L = Object.values(TBOOK.b6.side).flatMap(x => x.look.map(l => l[1])).join(' '), has = v => L.includes(v);
  [['7.2 V', 0.3 * 24], ['14.4 V', 0.6 * 24], ['13.15 V', Math.sqrt(0.3) * 24], ['6 A', 0.5 * 24 / 2]].forEach(([t, v]) => { if (!has(t) || Math.abs(parseFloat(t) - +v.toFixed(2)) > 0.006) bad.push(t + ' vs ' + v); });
  const src = COMPONENTS.find(c => c.id === 'pwm').render.toString(); if (!/V = 24, R = 2,/.test(src)) bad.push('the bench is not 24 V and 2 Ω');
  const ctl = COMPONENTS.find(c => c.id === 'pwm').controls, fq = ctl.find(c => c.id === 'freq'); if (!(fq.min <= 1)) bad.push('the bench cannot go down to 1 kHz');
  const P = Object.fromEntries(ANIMS.pwmr.params.map(p => [p[0], p])); if (!(P.f[2] <= 5 && P.f[3] >= 20 && P.D[2] <= 0.1 && P.D[3] >= 0.9)) bad.push('the animation does not cover f 5–20 kHz and D 0.1–0.9');
  return bad; });
ok(!LOOK.length, 'the numbers in the panel are the ones the bench and the animation show (' + LOOK.join(' | ') + ')');
{ const q = await b.newPage({ viewport: { width: 1440, height: 900 } }); q.on('pageerror', e => errs.push(e.message)); await q.goto(url.pathToFileURL(path.join(ROOT, 'index.html')).href); await q.waitForTimeout(400);
  const SB = await q.evaluate(async () => { BV.ch = 'b6'; BV.exam = null; go('zoom', 'book'); document.querySelector('[data-tbpar="6.1"]').click(); await new Promise(r => setTimeout(r, 300));
    const dr = document.getElementById('fhDrawer').getBoundingClientRect(), sh = document.getElementById('sheet').getBoundingClientRect(), eq = document.querySelector('.tb-eq[data-eq="6.2"]').getBoundingClientRect();
    return { side: dr.left === 0 && dr.width >= 400 && sh.left >= dr.right && eq.width > 300 }; });
  ok(SB.side, 'on a wide screen the panel stands beside the text and the text moves over, so nothing is covered');
  await q.setViewportSize({ width: 390, height: 844 }); await q.waitForTimeout(300);
  const SM = await q.evaluate(() => { const dr = document.getElementById('fhDrawer').getBoundingClientRect(); return { sheet: dr.top > innerHeight * 0.4 && dr.bottom <= innerHeight + 1 && dr.width >= innerWidth - 1, over: document.documentElement.scrollWidth - innerWidth }; });
  ok(SM.sheet && SM.over <= 1, 'on a phone the panel is a sheet under the text, so both are on the screen together');
  await q.close(); }
ok(!NUM.length, 'textbook chapter: every number recomputed from the physics agrees, the Fourier and the time-domain ripple agree, the approximation is the limit of the exact solution (' + NUM.join(' | ') + ')');

/* ---- v2.74: Part A written as a textbook (chapters 1 to 4): the same shape as chapter 6 for every chapter, the panel beside the
   text with each topic's 3D lab, and every number recomputed here from the physics, independently of the chapters' code ---- */
/* v2.75: every chapter written so (chapter 6, the pilot, is checked above), and the panel's first window is live: a 3D lab, a simulation, an
   animation, an interactive figure, a scene or a lab page; every 3D lab of the chapter's topics opens first in at least one panel */
const TBIDS = await ev(() => Object.keys(TBOOK).filter(id => id !== 'b6'));
ok(['b1', 'b2', 'b3', 'b4', 'b5', 'b7', 'b8', 'b9', 'b10', 'b11', 'b12', 'b13', 'b14', 'b15', 'b16', 'b17', 'b18', 'b19', 'b20', 'b21', 'b22', 'b23'].every(id => TBIDS.includes(id)), 'Parts A to G are written as a textbook (' + TBIDS + ')');
for (const id of TBIDS) {
  await pg.evaluate(id => { BV.ch = id; BV.exam = null; go('zoom', 'book'); }, id); await pg.waitForTimeout(400);
  const X = await pg.evaluate(id => { const A = content, c = bookCh()[id], n = c.n, T = TBOOK[id], h3 = [...A.querySelectorAll('h3')].map(h => h.textContent.trim()), at = t => h3.findIndex(x => x.startsWith(t));
    const order = [`${n}.0 `, `${n}.1 `, `${n}.2 `, `${n}.3 `, `★ ${n}.4 `, `${n}.5 `, `${n}.6 `, `${n}.7 `, '🎛️'].map(at);
    const eqs = [...A.querySelectorAll('.tb-eq')].map(e => e.dataset.eq), want = Array.from({ length: eqs.length }, (_, i) => n + '.' + (i + 1));
    const links = [...A.querySelectorAll('[data-tbeq]')].map(b => b.dataset.tbeq), ptr = [...A.querySelectorAll('[data-tbw]')].map(b => b.dataset.tbw);
    /* the practice cards (pq:) live in the chapter's own questions, and a page window is embedded by its route */
    const ws = c.nodes.flatMap(x => zWindows(zNode(x))).filter(w => !PQ_WIN[w]), inCh = ws.filter(w => A.querySelector(`.bk-win[data-w="${w}"], .bk-win[data-emb="${w}"], .bk-win[data-emb="${bookWinTarget(w)}"], .bk-win[data-w="${w.replace(/:[^:]+$/, ':*')}"]`)).length;   /* a family of a topic's windows (t:pwr:math:*) is one window in the chapter, and a page sits at its place (p:s2/servo at s2:servo#zero) */
    const side = T.side || {}, sideWins = Object.values(side).flatMap(x => x.win.map(w => w[0])), looks = Object.values(side).flatMap(x => x.look.map(l => l[0]));
    return { order, seq: eqs.join() === want.join(), neq: eqs.length, links: links.every(l => eqs.includes(l)), ptr: ptr.length >= 6 && ptr.every(w => ws.includes(w)), inCh, ws: ws.length,
      probs: A.querySelectorAll('.tb-prob').length, ex: A.querySelectorAll('.tb-x details').length, levels: ['basic', 'adv', 'ext'].every(l => T.exercises.some(e => e.l === l)), risk: bidiRisk(A).length, whyOnce: A.querySelectorAll('#bk-why').length,
      par: [...A.querySelectorAll('[data-tbpar]')].map(b => b.dataset.tbpar).join() === Object.keys(side).join() && Object.keys(side).length === 3, sideWins: sideWins.every(w => ws.includes(w)), labs: Object.values(side).every(x => { const w = x.win[0][0]; return w.startsWith('3d:') || w.startsWith('p:lab/') || ['sim', 'anim', 'figure', 'scene'].includes(zInfo(w).kind); }) && ws.filter(w => w.startsWith('3d:')).every(w => Object.values(side).some(x => x.win[0][0] === w)),
      looks: looks.every(eq => eqs.includes(eq)), marks: [...new Set(looks)].every(eq => A.querySelector(`.tb-eq[data-eq="${eq}"] [data-tbse]`)), bad: /NaN|undefined|Infinity|\$\{/.test(A.innerHTML), sum: T.summary.every(r => eqs.includes(r[2])) }; }, id);
  ok(X.order.every((x, i) => x >= 0 && (i === 0 || x > X.order[i - 1])), `textbook ${id}: opening, three sections, an advanced section, summary, solved problems, exercises and the layer, in that order (${X.order})`);
  ok(X.seq && X.neq >= 15 && X.links && X.sum, `textbook ${id}: ${X.neq} equations numbered in order, and every link and summary row finds its equation`);
  ok(X.ptr && X.inCh === X.ws, `textbook ${id}: every pointer is to a window of the chapter's topics, and all ${X.ws} of them are still in the chapter`);
  ok(X.probs === 3 && X.ex >= 6 && X.levels && X.risk === 0 && X.whyOnce === 1 && !X.bad, `textbook ${id}: three solved problems, six exercises at three levels with hidden answers, no formula out of order, nothing unfilled`);
  ok(X.par && X.sideWins && X.labs && X.looks && X.marks, `textbook ${id}: every section reads beside a live window of its topics (each 3D lab first in a panel), and every equation named has its line and its button`);
}
/* the panel mounts a 3D lab and stops it on close */
const LAB = await ev(async () => { BV.ch = 'b3'; go('zoom', 'book'); content.querySelector('[data-tbpar="3.2"]').click(); await new Promise(r => setTimeout(r, 900)); const w = document.querySelector('#drwB .tbs-win'), o = { mounted: !!w.querySelector('canvas') && !!w.act, sid: TBS.sid };
  const act = w.act; let stopped = false; const d0 = act.destroy; act.destroy = () => { stopped = true; d0(); }; drawerClose(); o.stopped = stopped; localStorage.removeItem('fh-tbpar'); return o; });
ok(LAB.mounted && LAB.sid === '3.2' && LAB.stopped, 'the panel runs the 3D lab beside the text, and closing it stops the lab');
/* v2.75: a lab page of the site opens in the drawer's own frame beside the text, and leaves with it */
const EMBP = await ev(async () => { const w8 = ms => new Promise(r => setTimeout(r, ms)); BV.ch = 'b7'; go('zoom', 'book'); await w8(300); tbSideOpen(content, '7.3'); await w8(400);
  const o = { frame: !!document.querySelector('#drwB .tbs-win iframe.emb'), slot: !!EMBX.side, src: (document.querySelector('#drwB iframe.emb') || {}).src || '' };
  tbSideOpen(content, '7.2'); await w8(500); o.gone = !document.querySelector('#drwB iframe.emb') && !EMBX.side; o.lab = !!document.querySelector('#drwB .tbs-win canvas');
  tbSideOpen(content, '7.3', 'p:lab/s-bridge'); await w8(300); drawerClose(); o.closed = !document.querySelector('iframe.emb') && !EMBX.side; localStorage.removeItem('fh-tbpar'); return o; });
/* the page in the frame is only the page: no tabs, no search, no topic list around it */
{ await ev(async () => { BV.ch = 'b7'; go('zoom', 'book'); await new Promise(r => setTimeout(r, 300)); tbSideOpen(content, '7.3'); }); await pg.waitForTimeout(1800);
  const fr = pg.frames().find(f => /embed=1/.test(f.url()) && /lab\/s-temp/.test(f.url()));
  const IN = fr ? await fr.evaluate(() => ({ chrome: [...document.querySelectorAll('.navbar,.gsearch,#toc,#tocBtn,header.top,nav.sheets,footer')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }).map(e => e.className || e.id || e.tagName), page: !!document.querySelector('#content h2'), bench: document.querySelectorAll('#content input, #content select').length })) : null;
  await ev(() => { drawerClose(); localStorage.removeItem('fh-tbpar'); });
  ok(IN && IN.page && IN.bench > 0 && !IN.chrome.length, 'the lab page in the panel shows only the page and its bench, none of the site around it (' + JSON.stringify(IN) + ')'); }
ok(EMBP.frame && EMBP.slot && /embed=1/.test(EMBP.src) && /lab\/s-temp/.test(EMBP.src) && EMBP.gone && EMBP.lab && EMBP.closed, 'a lab page opens in the panel in its own frame, gives way to the next section\'s 3D lab, and closes with the panel (' + JSON.stringify(EMBP) + ')');
const NA = await ev(() => { const bad = [], near = (k, a, b, t = 1e-6) => { if (!(Math.abs(a - b) <= t * Math.max(1, Math.abs(b)))) bad.push(k + ': ' + a + ' ≠ ' + b); };
  /* chapter 1 */
  const c1 = TBOOK.b1.check, par = (a, b) => a * b / (a + b), rho = 1.72e-8;
  near('I = V/R', c1.I1, 12 / 470); near('P = V²/R', c1.P1w, 144 / 470); near('¼ W share', c1.k14, 144 / 470 / 0.25); near('divider', c1.Vd, 9.6);
  const Vl = 24 * par(10e3, 100e3) / (15e3 + par(10e3, 100e3)); near('loaded divider', c1.Vdl, Vl); near('Thevenin = loaded divider', c1.Vthl, Vl);   /* two derivations, one answer */
  near('wire', c1.Rw, rho * 15 / 0.75e-6); near('cable drop', c1.dVc, 3 * 2 * rho * 15 / 0.75e-6); near('max power', c1.Pmax, 72); near('body T', c1.T1, 25 + 85 * (144 / 470) / 0.25);
  near('heater at 21.6 V', c1.PB1.Plow, 21.6 ** 2 / 9.6); near('cross-section', c1.PB2.Aneed * 1e6, 2 * rho * 25 * 4 / 2.4 * 1e6); near('ADC error', c1.PB3.err, (1e5 / (1e5 + par(68e3, 10e3)) - 1) * 100); near('parallel', c1.Rp3, 1 / (1 / 100 + 1 / 220 + 1 / 330));
  /* the maximum of P_L(R_L) really is at R_L = r: a sweep */
  { const E = 12, r = 0.5; let best = [0, 0]; for (let RL = 0.01; RL < 5; RL += 0.001) { const P = E * E * RL / (RL + r) ** 2; if (P > best[1]) best = [RL, P]; } near('sweep of 1.11', best[0], r, 0.01); near('sweep max', best[1], E * E / (4 * r), 1e-4); }
  /* chapter 2 */
  const c2 = TBOOK.b2.check; near('debounce τ', c2.tauMin, 0.2 / Math.log(1.5), 1e-6); near('ln 2.5', c2.lnD, Math.log(2.5));
  if (!c2.sw.every(x => (x.tau >= c2.tauMin) === (x.nOut === 1))) bad.push('the lab passes exactly the τ that 2.4 allows: ' + JSON.stringify(c2.sw));
  near('fast at 3In', c2.k3F, -0.05 * Math.log(1 - 2.25 / 9)); near('slow at 3In', c2.k3T, -2 * Math.log(1 - 2.25 / 9)); near('I²t fast', c2.I2tF, 0.45); near('I²t slow', c2.I2tT, 18);
  /* 2.7 against a numerical integration of 2.5 */
  { let th = 0, t = 0; const h = 1e-6; while (th < 2.25) { th += (9 - th) / 0.05 * h; t += h; } near('2.7 vs integration', c2.k3F, t, 1e-3); }
  { let th = 0.64, t = 0; const h = 1e-7; while (th < 2.25) { th += (100 - th) / 0.05 * h; t += h; } near('inrush blow', c2.tblowF, t, 1e-3); }
  near('slow fuse after inrush', c2.thT, 100 + (0.64 - 100) * Math.exp(-0.005 / 2)); near('loose contact T', c2.loose.T, 25 + 40 * 25 * 0.15); near('cable I²t', c2.wire075, (115 * 0.75) ** 2); near('runaway current', c2.Istar, 1 / Math.sqrt(0.004 * 0.15 * 40));
  near('hot terminal', c2.PB3.r.dT, 4 * 0.45 * 40 / (1 - 0.004 * 4 * 0.45 * 40));
  /* chapter 3 */
  const c3 = TBOOK.b3.check; near('τ = RC', c3.tau, 1); near('v(τ)', c3.v1, 10 * (1 - Math.exp(-1))); near('½CV²', c3.W1, 0.5 * 1e-4 * 100); near('τ = L/R', c3.tauL, 1 / 48); near('spike', c3.spike, 24 + 0.5 * 2000); near('with diode', c3.vd, 24.7);
  { let v = 0; const h = 1e-5; for (let t = 0; t < 1; t += h) v += (10 - v) / 1 * h; near('3.3 vs integration', c3.v1, v, 1e-4); }
  { const L = 1, R = 48, Vc = 0.7; let i = 0.5, t = 0; const h = 1e-7; while (i > 0) { i += (-i * R - Vc) / L * h; t += h; } near('3.17 vs integration', c3.toffD, t, 1e-4); }
  near('secondary', c3.Vs, 230 / 9.6); near('primary current', c3.Ip, 230 / 9.6 / 10 / 9.6); near('saturation time', c3.tsat, 1.2 * 230 * Math.SQRT2 / (2 * Math.PI * 50) / 230); near('ripple', c3.rip, 2 / (2 * 50 * 4700e-6)); near('corner', c3.fc, 1 / (2 * Math.PI * 1e-3));
  near('reset delay', c3.PB1.t, Math.log(1 / 0.3)); near('zener release', c3.PB2.tz, 0.5 / 48 * Math.log(1 + 24 / 33));
  /* chapter 4: Shockley and the load line solved here by Newton's method, the MOSFET by the quadratic formula */
  const c4 = TBOOK.b4.check, VT = 1.380649e-23 * 300 / 1.602176634e-19; near('V_T', c4.VT, VT); near('decade', c4.dec, VT * Math.LN10);
  const solve = (Vin, R, Is, nn) => { let V = 0.6 * nn; for (let k = 0; k < 200; k++) { const e = Is * Math.exp(V / (nn * VT)), f = (Vin - V) / R - (e - Is), df = -1 / R - e / (nn * VT); V -= f / df; } return { V, I: (Vin - V) / R }; };
  const s1 = solve(5, 1000, 1e-14, 1), led = solve(5, 330, 1.6e-19, 2); near('silicon point', c4.s1.Vd, s1.V, 1e-3); near('silicon current', c4.s1.I, s1.I, 1e-3); near('LED point', c4.led.Vd, led.V, 1e-3); near('LED current', c4.led.I, led.I, 1e-3);
  const K = 2.67, Vth = 2.5, Vdd = 24, RL = 12, ov = 10 - Vth, a = K / 2, bq = K * ov + 1 / RL, cq = Vdd / RL, Vds10 = (bq - Math.sqrt(bq * bq - 4 * a * cq)) / (2 * a);
  near('MOSFET at 10 V', c4.m10.Vds, Vds10, 1e-6); near('MOSFET at 3.3 V', c4.m33.Id, K / 2 * 0.8 ** 2); near('power at 3.3 V', c4.P33, (K / 2 * 0.64) * (Vdd - RL * K / 2 * 0.64)); near('Rds(on)', c4.Rds10, 1 / (K * ov));
  { let mx = 0; for (let g = 0; g <= 10; g += 0.0005) { const s = mosSolve(g); mx = Math.max(mx, s.Id * s.Vds); } near('4.13 against a sweep', mx, c4.Pmx, 1e-3); near('4.13', c4.Pmx, 12); }
  near('zener power', c4.PB2.Pz, 5.1 * (28 - 5.1) / 820); near('heatsink', c4.PB3.th, 100 / ((K / 2 * 0.64) * (Vdd - RL * K / 2 * 0.64)));
  /* the panel says what the lab shows */
  const look = id => Object.values(TBOOK[id].side).flatMap(x => x.look.map(l => l[1])).join(' ');
  [['b1', '25.5 mA'], ['b1', '123%'], ['b2', '14.4 ms'], ['b2', '175 °C'], ['b3', '1,024 V'], ['b3', '24.7 V'], ['b3', '23.96 V'], ['b4', '0.693 V'], ['b4', '11.7 W']].forEach(([id, t]) => { if (!look(id).includes(t)) bad.push(id + ' panel lacks ' + t); });
  return bad; });
ok(!NA.length, 'Part A: every number recomputed from the physics agrees, the closed forms agree with numerical integration, and the panel quotes what the labs show (' + NA.join(' | ') + ')');
/* ---- v2.75: Part B (chapters 5, 7, 8, 9) recomputed independently: the relay figure's own constants and its own sweep, the labs' own steps
   run here, the transients and the buck integrated in time, the gates iterated to rest, and the panel quoting what each window shows ---- */
const NB = await ev(() => { const bad = [], near = (k, a, b, t = 1e-6) => { if (!(Math.abs(a - b) <= t * Math.max(1, Math.abs(b)))) bad.push(k + ': ' + a + ' ≠ ' + b); };
  const look = id => Object.values(TBOOK[id].side).flatMap(x => x.look.map(l => l[1])).join(' ').replace(/<[^>]+>/g, '');
  /* chapter 5: the figure's constants, read from the figure itself */
  const Mf = JSON.parse(ANATOMY_HTML.relay.match(/const M = (\{[^}]*\})/)[1]);
  if (!(Mf.VS === TB_RLY.VS && Mf.RC === TB_RLY.RC && Mf.VTH === TB_RLY.VTH && Mf.K === TB_RLY.K && Mf.PULL_IN === TB_RLY.PI && Mf.DROP_OUT === TB_RLY.DO)) bad.push('the relay figure changed: ' + JSON.stringify(Mf));
  const c5 = TBOOK.b5.check, cur = v => Math.min(Mf.VS / Mf.RC, Mf.K * Math.max(0, v - Mf.VTH) ** 2);
  near('coil current', c5.I0, 0.05); near('coil power', c5.P0, 1.2); near('pull-in current', c5.Ipi, 18 / 480); near('drop-out current', c5.Ido, 2.4 / 480); near('force margin', c5.mF, (0.05 / 0.0375) ** 2);
  { let closed = false, up = null, dn = null, pmax = 0, vpm = 0, full = null; for (let v = 0; v <= 5; v += 1e-5) { const i = cur(v), vc = i * Mf.RC, pq = (Mf.VS - vc) * i; if (!closed && vc >= Mf.PULL_IN) { closed = true; up = v; } if (pq > pmax) { pmax = pq; vpm = v; } if (full == null && i >= Mf.VS / Mf.RC - 1e-12) full = v; }
    for (let v = 5; v >= 0; v -= 1e-5) { if (closed && cur(v) * Mf.RC <= Mf.DROP_OUT) { closed = false; dn = v; break; } }
    near('pull-in gate, the figure swept up', c5.VGpi, up, 1e-4); near('drop-out gate, swept down', c5.VGdo, dn, 1e-4); near('the transistor\'s heat, swept', c5.PQmax, pmax, 1e-6); near('gate at the most heat', c5.VGpq, vpm, 1e-4); near('gate for the full current', c5.VGon, full, 1e-4); }
  const rel = Vc => { let i = 0.05, t = 0; const h = 1e-8; while (i > 2.4 / 480) { i += -(480 * i + Vc) / 0.2 * h; t += h; } return t; };
  near('5.13 with a diode vs 5.11 integrated', c5.tdD, rel(0.7), 1e-4); near('5.13 with a 24 V zener', c5.tdZ, rel(24.7), 1e-4); near('the animation, no clamp', c5.td0, rel(0), 1e-4); near('problem 5.3, 33 V zener', c5.PB3.t, rel(33.7), 1e-4);
  near('the animation\'s spike', c5.spike, ANIMS.coil.calc({ R: 480, L: 0.2, D: 1 }).spike); near('spike', c5.spike, 0.2 * 0.05 / 1e-6); near('stored energy', c5.W, 0.5 * 0.2 * 0.05 ** 2);
  { let i = 0, t = 0; const h = 1e-8; while (i < 18 / 480) { i += (24 - 480 * i) / 0.2 * h; t += h; } near('5.16 vs integration', c5.tpi, t, 1e-4); }
  near('hot pull-in at 85 °C', c5.V85, 18 * (1 + 0.00393 * 65)); if (!(c5.PB2.I < 18 / 480 && c5.PB2.V > 21.6)) bad.push('the hot relay must not pull in at 21.6 V');
  near('base resistor', c5.PB1.Rb, (3.3 - 0.75) / (2 * 0.05 / 50)); near('E12 below', c5.PB1.R, 1200);
  { const L = 0.2, R = 480, N = 200, h = 1 / 20e3 / N; let i = 0.05, si = 0, sp = 0, n = 0; for (let k = 0; k < N * 400; k++) { const on = (k % N) < N / 2; i += ((on ? 24 : 0) - R * i) / L * h; if (i < 0) i = 0; if (k >= N * 300) { si += i; sp += on ? 24 * i : 0; n++; } }
    near('PWM hold: mean current of the switched coil', c5.IH, si / n, 3e-3); near('PWM hold: power from the supply', c5.PH, sp / n, 6e-3); }
  /* chapter 7: the proximity lab run with its own step */
  const c7 = TBOOK.b7.check, prox = P => { const L = LABS.prox, S = { x: {}, P: Object.assign({}, L.P, P), t: 0 }; L.init(S); const h = 2e-5; for (let k = 0; k < 0.3 / h; k++) { L.step(S, h); S.t += h; } return L.calc(S.P, S); };
  near('Sr', c7.Sr, 4); near('Sa', c7.Sa, 3.24); near('Sr aluminium', c7.SrAl, 1.6); near('teeth frequency', c7.f0, 60); near('n max', c7.nmax, 4000);
  { const st = prox({}), al = prox({ mat: 'al' }), far = prox({ gap: 3.5 }), fast = prox({ rpm: 4500 });
    near('the lab measures the speed', st.rpmM, 300, 0.01); if (!(al.rpmM === 0 && !al.inRange)) bad.push('aluminium at 2 mm should not be seen'); if (!(far.inRange && !far.safe)) bad.push('3.5 mm: in range, without margin'); if (!fast.fast) bad.push('4,500 rpm is over the sensor'); }
  near('input current', c7.Iin, (24 - 2 - 1.2) / 4700);
  near('loading 100 kΩ', c7.c1.err, -1e5 / (1e5 + 2e7)); near('reading', c7.c1.Vm, 10 * 1e7 / (1e5 + 2e7)); near('DMM at 1 MΩ', c7.eM.dmm, -1 / 21); near('scope ×1', c7.eM.x1, -1 / 3); near('analog', c7.eM.an, -1e6 / (1e6 + 4e5));
  near('half at R/2 = Rm', measCalc(4e5, 2e5).Vm, 2.5); near('probe rise', c7.tr1, 2.2 * 5e4 * 100e-12); near('PT100', c7.Pt100, 138.5); near('2-wire error', c7.dTerr, 2 * 1.72e-8 * 10 / 0.5e-6 / 0.385);
  near('quarter bridge', c7.Vq, 10 * (1.002 / 2.002 - 0.5)); near('full bridge', c7.Vfb, 0.02);
  { const st = document.createElement('div'), out = document.createElement('div'), says = (S, v, t) => { SENS_BENCH[S].render(v, st, out); if (!out.textContent.includes(t)) bad.push(S + ' page shows ' + out.textContent.slice(0, 60) + ', not ' + t); };
    says('temp', { T: 100, cj: 25, cjc: 'on' }, '138.5 Ω'); says('temp', { T: 25, cj: 25, cjc: 'on' }, '109.6 Ω'); says('bridge', { p: 5, vx: 10, f: 'ok' }, '10.00 mV'); says('bridge', { p: 5, vx: 5, f: 'ok' }, '5.00 mV'); says('hall', { d: 6, pol: 'n' }, '3.7 mT'); says('hall', { d: 6, pol: 'n' }, '2.59 V'); says('hall', { d: 3, pol: 'n' }, '29.6 mT'); }
  { let ps = 0, pn = 0; for (let k = 0; k < 200000; k++) { const x = 0.4999 * Math.sin(2 * Math.PI * k * 0.0123456789), q = Math.round(x * 4096) / 4096; ps += x * x; pn += (q - x) ** 2; }
    near('SNR of a quantized sine', c7.SNR, 10 * Math.log10(ps / pn), 5e-3); near('quantization noise', c7.sq, 10 * Math.sqrt(pn / 200000), 2e-2); }
  { let same = true; for (let m = 0; m < 100; m++) same = same && Math.abs(Math.cos(2 * Math.PI * 60 * m / 50) - Math.cos(2 * Math.PI * c7.fa * m / 50)) < 1e-9; if (!same || c7.fa !== 10) bad.push('60 Hz sampled at 50 Hz is ' + c7.fa + ' Hz'); }
  near('high-impedance node, DMM', c7.PB2.eD, -(1e6 * 470e3 / 1.47e6) / (1e6 * 470e3 / 1.47e6 + 1e7));
  /* chapter 8: the gates iterated to rest, the counter lab run with its own step */
  const c8 = TBOOK.b8.check, nor = (a, b) => (a | b) ? 0 : 1;
  for (const [S, R] of [[0, 0], [0, 1], [1, 0]]) for (const Q0 of [0, 1]) { let Q = Q0, Qb = 1 - Q0; for (let k = 0; k < 8; k++) { Q = nor(R, Qb); Qb = nor(S, Q); } if (Q !== (S | ((1 - R) & Q0))) bad.push(`NOR latch S${S} R${R} Q${Q0} rests at ${Q}, not 8.3`); }
  for (const EN of [0, 1]) for (const D of [0, 1]) for (const Q of [0, 1]) { const S = D & EN, R = (1 - D) & EN; if ((S | ((1 - R) & Q)) !== ((EN & D) | ((1 - EN) & Q))) bad.push('8.4 is not 8.3 with its gates'); }
  for (const a of [0, 1]) for (const b2 of [0, 1]) if ((1 - (a | b2)) !== ((1 - a) & (1 - b2)) || (1 - (a & b2)) !== ((1 - a) | (1 - b2))) bad.push('De Morgan');
  { const L = LABS.counter, S = { x: {}, P: { f: 1, tpd: 'on' }, t: 0 }; L.init(S); S.x.q = [1, 1, 0]; S.x.seen = []; const tt = []; for (let k = 0; k < 1100; k++) { const n0 = S.x.seen.length; L.step(S, 1e-3); S.t += 1e-3; if (S.x.seen.length > n0) tt.push(S.t); }
    if (S.x.seen.slice(0, 3).join() !== '2,0,4') bad.push('the lab passes ' + S.x.seen.slice(0, 3) + ' from 3 to 4'); near('ripple settles in 3 tpd', tt[2] - tt[0] + LOG3.tpd, c8.tset, 1e-2); }
  near('Q2 of the lab', LABS.counter.calc({ f: 1 }, { x: { q: [0, 0, 0], ev: [], clk: 1 } }).f2, c8.f2); near('fmax', c8.fmx, 1 / 18e-9); if (c8.nTrig !== 10 || 2 ** 9 >= 1000) bad.push('n for 1000');
  near('MTBF one stage', c8.mt1, Math.exp(4) / 50); near('MTBF two stages', c8.mt2, Math.exp(34) / 50);
  { const g = b => b ^ (b >> 1); for (let k = 0; k < 8; k++) { const x = g(k) ^ g((k + 1) % 8); if (x & (x - 1)) bad.push('Gray ' + k); } if (c8.g3 !== 2 || c8.g4 !== 6) bad.push('Gray 3, 4'); }
  near('ripple read error', c8.PB3.frac, 0.0375); near('sync counter', c8.PB2.f, 1 / 15e-9);
  /* chapter 9: the buck in time, to steady state, in CCM and in DCM */
  const c9 = TBOOK.b9.check, buck = RL => { const L = 47e-6, C = 100e-6, N = 400, h = 1e-5 / N; let i = 0, v = 0, vs = 0, n = 0, hi = -1, lo = 1e9; for (let p = 0; p < 6000; p++) for (let k = 0; k < N; k++) { const on = k < N / 2; i += ((on ? 24 : 0) - v) / L * h; if (i < 0) i = 0; v += (i - v / RL) / C * h; if (p >= 5950) { vs += v; n++; hi = Math.max(hi, i); lo = Math.min(lo, i); } } return { Vo: vs / n, dI: hi - lo }; };
  { const a = buck(5), d = buck(47); near('buck in CCM, simulated', c9.bk.Vo, a.Vo, 5e-3); near('ripple, simulated', c9.bk.dI, a.dI, 2e-2); near('buck in DCM, simulated', c9.Md * 24, d.Vo, 1e-2); near('the lab in DCM', c9.bk47.Vo, c9.Md * 24); }
  near('ripple', c9.bk.dI, 12 * 0.5 / (47e-6 * 1e5)); near('voltage ripple', c9.bk.dV, 12 * 0.5 / (47e-6 * 1e5) / 80); near('CCM boundary', c9.Rb, 18.8); if (!(c9.bk18.ccm && !c9.bk22.ccm)) bad.push('CCM at 18 Ω, DCM at 22 Ω');
  { const K = c9.Kd, D = 0.5; let a = 0, z = 1; for (let k = 0; k < 80; k++) { const m = (a + z) / 2; (K * m * m + D * D * m - D * D > 0) ? z = m : a = m; } near('9.20 vs the quadratic', c9.Md, a, 1e-9); }
  near('cable drop', c9.dr.Vend, 24 - 2 * 2 * 0.0175 * 12 / 0.75); near('max length', c9.dr.Lmax, 2.4 * 0.75 / (2 * 0.0175 * 2)); near('bench', c9.psuB.V, 24 - 2 * 4 * 0.0175 * 8 / 0.75); near('supply load', c9.pw.Itot, 7.5); near('from the mains', c9.pw.Pin, 200);
  { let th = 0, t = 0; const h = 1e-6, k2 = (11 / 4) ** 2; while (th < 2.25) { th += (k2 - th) / 0.05 * h; t += h; } near('fuse in a short under the current limit', c9.tF, t, 1e-3); }
  near('inrush as a capacitor', c9.Ceq, 14 * 0.02 / 24); near('soft start', c9.tss, 14 * 0.02 / 3.5);
  { let V = 230 * Math.SQRT2, t = 0; const h = 1e-6; while (V > 250) { V -= 200 / (220e-6 * V) * h; t += h; } near('hold-up vs integration', c9.HU.t, t, 1e-3); }
  near('efficiency', c9.LS.eta, 28.8 / (28.8 + 2.4 ** 2 * 0.02 * 0.5 + 0.5 * 2.4 * 0.5 + 0.5 * 24 * 2.4 * 40e-9 * 1e5)); near('hold-up capacitor', c9.PB3.Cmin, 2 * 240 / 0.9 * 0.02 / (2 * 230 ** 2 - 250 ** 2));
  /* the panel says what each window shows */
  const Rl = LABS.loading.calc(LABS.loading.P), Rk = LABS.buck.calc(LABS.buck.P, { t: 0 }), Ad = Object.fromEntries(ANIMS.drop.params.map(p => [p[0], p[5]])), Vd = ANIMS.drop.calc(Ad), Ac = Object.fromEntries(ANIMS.coil.params.map(p => [p[0], p[5]]));
  const shown = [['b7', LABS.loading.stats.slice(0, 3).map(s => s[2](Rl))], ['b9', LABS.buck.stats.slice(0, 3).map(s => s[2](Rk))], ['b9', ['0.560 Ω', '1.12 V', '22.88 V', '25.7 m'].filter(t => ANIMS.drop.steps.map(f => f(Ad, Vd)).join(' ').includes(t))],
    ['b5', [ANIMS.coil.steps[1](Ac, ANIMS.coil.calc(Ac)).match(/[\d.]+ ms/)[0]]], ['b8', ['0.500 Hz', '0.125 Hz', '8.00 s']], ['b9', ['22.51 V', '7.5 A', '14 A']], ['b7', ['138.5 Ω', '10.00 mV', '2.59 V', '1.60 mm', '-4.8%', '-33.3%', '-71.4%']], ['b8', ['3 → 2 → 0 → 4', '55.6 MHz']], ['b5', ['50 mA', '0.30 W', '−0.7 V']]];
  shown.forEach(([id, ts]) => ts.forEach(t => { if (!look(id).includes(t)) bad.push(id + ' panel lacks ' + t); }));
  if (shown[2][1].length !== 4) bad.push('the drop animation shows ' + shown[2][1]);
  return bad; });
ok(!NB.length, 'Part B: every number recomputed from the physics and from the windows\' own models agrees, the transients, the PWM hold and the buck agree with integration in time, and the panel quotes what each window shows (' + NB.join(' | ') + ')');
/* ---- v2.76: Part C (chapters 10 to 13) recomputed independently: the motor, brake, screw, fit and axis labs run with their own step or action,
   the start of a motor, a coil's decay and a step response integrated in time, the quadrature decoder driven through whole turns, the
   interpolation error swept, the servo simulation run with the faults the chapter names, and the panel quoting what each window shows ---- */
const NCc = await ev(() => { const bad = [], near = (k, a, b, t = 1e-6) => { if (!(Math.abs(a - b) <= t * Math.max(1, Math.abs(b)))) bad.push(k + ': ' + a + ' ≠ ' + b); };
  const look = id => Object.values(TBOOK[id].side).flatMap(x => x.look.map(l => l[1])).join(' ').replace(/<[^>]+>/g, '');
  const run = (id, P, T, h, act) => { const L = LABS[id], S = { x: {}, P: Object.assign({}, L.P, P), t: 0 }; L.init(S); if (act) L.act[act](S); for (let k = 0; k < T / h; k++) { L.step(S, h); S.t += h; } return { S, R: L.calc(S.P, S) }; };
  /* chapter 10: the 3D motor run from rest with its own step */
  const c10 = TBOOK.b10.check, M = MOT3;
  { const L = LABS.dcmotor, S = { x: {}, P: Object.assign({}, L.P), t: 0 }; L.init(S); const h = 5e-5; let t63 = null; for (let k = 0; k < 1.2 / h; k++) { L.step(S, h); S.t += h; if (t63 == null && S.x.w >= 0.632 * c10.wss) t63 = S.t; }
    const R = L.calc(S.P, S); near('the motor settles at 10.6', c10.wss, R.w, 2e-3); near('and at its current', c10.Iss, R.i, 3e-3); near('63% at τm', c10.taum, t63, 2e-2);
    const shown = L.stats.map(x => x[2](R)).join(' '); [c10.wss, c10.Iss].length; if (!look('b10').includes(lf(c10.wss * 60 / (2 * Math.PI), 0) + ' rpm') || !shown.includes(lf(R.rpm, 0) + ' rpm')) bad.push('b10 speed quoted ' + shown); }
  near('stall current', c10.Is, 12 / 1.2); near('stall torque', c10.Ts, 0.05 * 12 / 1.2);
  { let pm = 0; for (let T = 0; T <= c10.Ts; T += 1e-5) pm = Math.max(pm, T * (12 / 0.05 - 1.2 * T / 0.0025)); near('Pmax by sweep', c10.Pmax, pm, 1e-6); }
  { const J = M.J, R = M.R, K = M.K; let w = 0, W = 0; const h = 1e-6; while (w < 0.999999 * 12 / K) { const i = (12 - K * w) / R; W += i * i * R * h; w += K * i / J * h; if (w > 0.9999 * 12 / K) break; } near('10.13: heat of a start, integrated', c10.WR, W, 2e-3); }
  { const J = M.J, R = M.R, K = M.K; let w = 0, t = 0; const h = 1e-6; while ((12 - K * w) / R > 3) { w += (K * 3 - 0.05 - M.b * w) / J * h; t += h; } near('10.14: time at the current limit', c10.t1, t, 5e-3); }
  near('the simulation, default', c10.ml.Pm, 54); near('its maximum', c10.mlP.Pm, 24 * 24 / (4 * 2)); if (!c10.mlS.stall) bad.push('1.2 N·m stalls the simulated motor');
  near('synchronous speed', c10.ind.ns, 1500); near('slip', c10.ind.s, 0.04); near('VFD speed', c10.PB3.n2, 1980); near('microstep', c10.st.dx, 5 / 3200 * 1000);
  /* chapter 11: the quadrature decoder of 11.4 driven forward and back through whole turns */
  const c11 = TBOOK.b11.check;
  { const N = 50, st = p => [[0, 0], [1, 0], [1, 1], [0, 1]][((p % 4) + 4) % 4]; let c = 0, pos = 0, pr = st(0); const moves = [600, -250, 1000, -1350];
    moves.forEach(m => { for (let k = 0; k < Math.abs(m); k++) { pos += Math.sign(m); const [A, B] = st(pos); c += (pr[1] ^ A) - (pr[0] ^ B); pr = [A, B]; } }); if (c !== pos) bad.push('11.4 counts ' + c + ' for ' + pos); }
  near('resolution', c11.q.res, 10 * 1000 / (4 * 2500)); near('channel A', c11.q.fA, 2500 * 1500 / 60 / 1000); near('counts', c11.q.fc, 4 * 2500 * 1500 / 60 / 1000);
  const dec = Vc => { let i = 0.5, t = 0; const h = 1e-7; while (i > 0.15) { i += -(48 * i + Vc) / 0.8 * h; t += h; } return t + 0.010; };
  near('brake with a diode, integrated', c11.tD, dec(0.7), 1e-4); near('with a varistor', c11.tV, dec(48), 1e-4); near('fall', c11.zD, 0.5 * 9.81 * c11.tD ** 2);
  { const r = run('brake', {}, 0.2, 1e-5, 'loss'); near('the brake lab closes at 11.10', c11.tD, r.R.tEng, 3e-3); near('and the axis falls 11.11', c11.zD * 1000, r.R.drop, 2e-2);
    const v = (() => { const L = LABS.brake, S = { x: {}, P: Object.assign({}, L.P, { sup: 'var' }), t: 0 }; L.init(S); L.act.loss(S); for (let k = 0; k < 0.2 / 1e-5; k++) { L.step(S, 1e-5); S.t += 1e-5; } return L.calc(S.P, S); })(); near('with the varistor', c11.tV, v.tEng, 5e-3); }
  { let m = 0; for (let th = 0; th < 2 * Math.PI; th += 1e-4) { let d = Math.atan2(1.01 * Math.sin(th), Math.cos(th)) - th; d = Math.atan2(Math.sin(d), Math.cos(d)); m = Math.max(m, Math.abs(d)); } near('11.14 swept', c11.ip.err, m, 1.5e-2); }
  near('speed step', c11.dwr, 60 / (4 * 2500 * 1e-3)); near('holding torque', c11.hold.T, 10 * 9.81 * 0.01 / (2 * Math.PI)); near('wrong sequence sag', c11.bb.sagBad, 5);
  /* chapter 12: the fit lab's own random pairs, and the screw lab reversed */
  const c12 = TBOOK.b12.check;
  if (!(c12.g6.mn === 7 && c12.g6.mx === 41 && c12.k6.mn === -15 && c12.k6.mx === 19 && c12.p6.mn === -35 && c12.p6.mx === -1)) bad.push('fits');
  if (Math.round(c12.IT6) !== 13 || Math.round(c12.IT7) !== 21) bad.push('IT grades ' + c12.IT6 + ' ' + c12.IT7);
  { const L = LABS.fit, S = { x: {}, P: { sh: 'k6' }, t: 0 }; L.init(S); for (let k = 0; k < 4000; k++) L.act.sample(S); near('k6 pairs that need force, sampled by the lab', c12.Pk6, S.x.ni / S.x.n, 6e-2); }
  near('screw torque', c12.T10, 200 * 0.01 / (2 * Math.PI * 0.9)); near('half the lead', c12.T5, c12.T10 / 2); near('reflected inertia', c12.J10, 5 * (0.01 / (2 * Math.PI)) ** 2);
  { const L = LABS.screw, S = { x: {}, P: Object.assign({}, L.P), t: 0 }; L.init(S); let eUp = null, eDn = null; const h = 1e-3; for (let k = 0; k < 8 / h; k++) { L.step(S, h); S.t += h; const ph = (0.25 * S.t) % 1; if (Math.abs(ph - 0.2) < 1e-6) eUp = S.x.xt - S.x.xm; if (Math.abs(ph - 0.7) < 1e-6) eDn = S.x.xt - S.x.xm; }
    near('backlash: going up', eUp, -0.025, 1e-3); near('going down', eDn, 0.025, 1e-3); }
  near('shrink fit', c12.sh.dT, 45e-6 / (11.7e-6 * 0.025)); near('screw stiffness', c12.stf.k, 210e9 * Math.PI * 0.013 ** 2 / 4 / 0.5); near('thermal growth', c12.th.dL, 11.7e-6 * 0.5 * 5);
  /* chapter 13: a step response integrated, the servo simulation with and without I, the 3D axis with a low gain, and a reversed encoder */
  const c13 = TBOOK.b13.check;
  near('ωn', c13.wn, 200); near('ζ', c13.z, 0.61);
  { let x = 0, v = 0, mx = 0; const h = 1e-6; for (let k = 0; k < 0.1 / h; k++) { const a = (2e5 * (1 - x) - 1220 * v) / 5; v += a * h; x += v * h; mx = Math.max(mx, x); } near('overshoot, integrated', c13.Mp, mx - 1, 1e-3); }
  near('the animation', c13.as.Mp / 100, c13.Mp, 1e-3); near('profile', svProfile(c13.Tp)[0], 0.1, 1e-9); near('accel distance', svProfile(c13.ta)[0], c13.sa, 1e-9);
  { const pd = svSim({ Ki: 0, T: 0.2 }); near('13.7 at 0.06 s, simulated', c13.eA06, pd.eAcc, 4e-2); const noI = svSim({ Ki: 0 }), wI = svSim(); near('13.8 without I', c13.eSS, Math.abs(noI.final - 0.1), 6e-2); if (!(Math.abs(wI.final - 0.1) < 2e-6)) bad.push('with I the axis ends at ' + wI.final); }
  { const L = LABS.axis, go = P => { const S = { x: {}, P: Object.assign({}, L.P, P), t: 0 }; L.init(S); L.act.move(S); for (let k = 0; k < 1.0 / 1e-4; k++) { L.step(S, 1e-4); S.t += 1e-4; } return L.calc(S.P, S); };
    const ok0 = go({}), low = go({ kp: 0.1, ki: 'off' }), noI = go({ ki: 'off' }); if (ok0.fault || ok0.ts == null) bad.push('the axis should settle at its defaults'); if (!low.fault) bad.push('Kp ×0.1 without I should stop with FE'); near('the 3D axis without I keeps 13.8', c13.eSS * 1e6, noI.e, 2e-2); if (noI.ts != null) bad.push('without I it never comes in position'); }
  { let x = 1e-6, v = 0, t = 0, tFE = null, x15 = 0, x25 = 0; const h = 1e-6; for (let k = 1; k <= 0.03 / h; k++) { v += ((1200 - 20) * v + 2e5 * x) / 5 * h; x += v * h; t = k * h; if (tFE == null && x >= 5e-4) tFE = t; if (k === 15000) x15 = x; if (k === 25000) x25 = x; }
    near('reversed encoder: growth rate, integrated', c13.rev, Math.log(x25 / x15) / 0.01, 5e-3); near('and the time to the limit', c13.PB3.t, tFE, 3e-2); if (!svSim({ encSign: -1 }).alarm) bad.push('the servo simulation with a reversed encoder should alarm'); }
  near('aliasing', aliasF(9, 10), 1); near('above fs', aliasF(11, 10), 1); near('Kd for 5%', Math.exp(-Math.PI * c13.PB1.z / Math.sqrt(1 - c13.PB1.z ** 2)), 0.05, 1e-9);
  /* the panel says what each window shows */
  const AQ = Object.fromEntries(ANIMS.quad.params.map(p => [p[0], p[5]])), qs = ANIMS.quad.steps.map(f => f(AQ, ANIMS.quad.calc(AQ))).join(' '), sv = { Kp: SV.Kp, Kd: SV.Kd }, ss = ANIMS.servo.steps.map(f => f(sv, ANIMS.servo.calc(sv))).join(' ').replace(/<[^>]+>/g, '');
  const shown = [['b11', ['1.00 µm', '62.5 kHz', '250.0 kHz'].filter(t => qs.replace(/<[^>]+>/g, '').includes(t))], ['b13', ['200.0 rad/s', '0.61', '32.8 ms'].filter(t => ss.includes(t))],
    ['b10', ['3.00 A', '54.0 W', '72.0 W', '12.0 A', 'I = V/R = 10 A', '1.04 A', '10.7 V']], ['b11', [lf(brakeEngage('diode') * 1000, 1) + ' ms', lf(brakeEngage('var') * 1000, 1) + ' ms', '48 ספירות', '100 ms', '5.00 mm']],
    ['b12', ['0.354 N·m', '0.177 N·m', '±25 µm', 'Clearance', 'Transition', 'Interference']], ['b13', ['1.0 kHz', '50 µm']]];
  shown.forEach(([id, ts]) => ts.forEach(t => { if (!look(id).includes(t)) bad.push(id + ' panel lacks ' + t); }));
  if (shown[0][1].length !== 3 || shown[1][1].length !== 3) bad.push('the animations show ' + shown[0][1] + ' / ' + shown[1][1]);
  return bad; });
ok(!NCc.length, 'Part C: every number recomputed from the physics and from the windows\' own models agrees, the motor start, the brake, the step response and the faulted servo agree with integration in time, and the panel quotes what each window shows (' + NCc.join(' | ') + ')');

/* v2.77: Part D. Each number again from the physics, from the windows' own models (the benches rendered at the setting the panel names, the
   animations' own steps, the labs' own calc), and against a brute-force check where one exists: a sweep, a sampled overlap, a Monte Carlo, an integral. */
const NDd = await ev(() => { const bad = [], near = (k, a, b, t = 1e-6) => { if (!(Math.abs(a - b) <= t * Math.max(1, Math.abs(b)))) bad.push(k + ': ' + a + ' ≠ ' + b); };
  const look = id => Object.values(TBOOK[id].side).flatMap(x => x.look.map(l => l[1])).join(' ').replace(/<[^>]+>/g, '');
  const bench = (id, s) => { const C = COMPONENTS.find(c => c.id === id), st = document.createElement('div'), out = document.createElement('div'); C.render(s, st, out); return out.textContent; };
  const steps = id => { const A = ANIMS[id], P = Object.fromEntries(A.params.map(x => [x[0], x[5]])), V = A.calc(P); return A.steps.map(f => f(P, V)).join(' ').replace(/<[^>]+>/g, ''); };
  const has = (k, txt, ts) => ts.forEach(t => { if (!txt.includes(t)) bad.push(k + ' lacks ' + t); });
  let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }, gauss = () => Math.sqrt(-2 * Math.log(Math.max(1e-12, rnd()))) * Math.cos(2 * Math.PI * rnd());
  /* chapter 14 */
  const c14 = TBOOK.b14.check;
  near('Rayleigh', c14.r, 0.61 * 0.5 / 0.2); near('Airy', c14.dA, 3.05); near('DOF', c14.dof, 12.5); near('defocus', c14.bD, 12); near('pixel limit', c14.zPix, 12.2); near('quadrature', c14.b30, Math.hypot(12, 3.05));
  near('14.4 against the cone itself', c14.bD, 2 * 30 * Math.tan(Math.asin(0.2)), 3e-2);
  near('tilt', c14.at.theta, 0.6); near('tilt edge', c14.at.edge, 9.6); { let k = 0; const n = 100000; for (let i = 0; i <= n; i++) if (Math.abs(0.6 * (-16 + 32 * i / n)) <= 4) k++; near('sharp fraction, sampled', c14.at.frac, k / (n + 1), 1e-2); }
  near('θmax', c14.tb.thmax, 0.5 / (0.15 ** 2 * 32)); near('θmax at 0.25', c14.tb.thmax25, 0.25); near('thermal', c14.th.dL, 18.4); near('ΔTmax', c14.th.dTmax, 6.25 / 2.3);
  near('telecentric', c14.tc.dx, 8); near('cutoff', c14.fc, 0.8); near('NA for a pixel', c14.PB1.NA, 0.0625); near('its DOF', c14.PB1.dof, 128);
  near('two shims', c14.PB2.th, 0.4); near('edge', c14.PB2.edge, 33); if (!(c14.PB2.th > c14.PB2.thmax)) bad.push('problem 14.2 should be over its θmax');
  near('Al budget', c14.PB3.al, 0.5 / (2 * 0.0625) / (23e-6 * 8e4)); near('granite', c14.E5, 4.5);
  has('lens bench', bench('lens', { dz: 0, na: 0.2 }), ['3.0 µm', '12.5 µm', '1.52 µm']); has('lens bench at 30', bench('lens', { dz: 30, na: 0.2 }), ['12.4 µm']);
  has('tilt bench', bench('tilt', { th: 0.6, fov: 32, na: 0.15 }), ['9.6 µm', '11.1 µm', '100%']); has('tilt bench at 0.25', bench('tilt', { th: 0.6, fov: 32, na: 0.25 }), ['4.0 µm']);
  has('thermal bench', bench('thermal', { m: 'al', L: 100, dT: 8, na: 0.2 }), ['18.4 µm']); has('Invar', bench('thermal', { m: 'inv', L: 100, dT: 8, na: 0.2 }), ['1.0 µm']); has('steel', bench('thermal', { m: 'st', L: 100, dT: 8, na: 0.2 }), ['9.6 µm']);
  has('NA animation', steps('na'), ['1.52 µm', '12.5 µm']); has('DOF animation', steps('dof'), ['12.0 µm', '12.2 µm']); has('tilt animation', steps('tilt'), ['0.60 mrad', '9.6 µm', f1(c14.at.frac * 100) + '%']);
  has('b14 panel', look('b14'), ['1.52 µm', '12.5 µm', '3.0 µm', '12.4 µm', '0.60 mrad', '9.6 µm', '11.1 µm', '4.0 µm', '18.4 µm', '1.0 µm', '9.6 µm']);
  /* chapter 15 */
  const c15 = TBOOK.b15.check;
  near('line rate', c15.LS.f, 20); near('blur', c15.LS.blur, 2.8); near('vmax', c15.LS.vmax, 280); near('clock aspect', c15.LS.a280, 2);
  has('line-scan bench', bench('linescan', { v: 140, mode: 'enc', exp: 20 }), ['20.0 kHz', '1.00', '2.8 µm = 0.40 px']); has('over the camera', bench('linescan', { v: 300, mode: 'enc', exp: 20 }), ['Over-trigger']);
  has('at the 15.6 limit', bench('linescan', { v: 140, mode: 'enc', exp: 25 }), ['3.5 µm = 0.50 px', 'תקין']); has('too long', bench('linescan', { v: 140, mode: 'enc', exp: 40 }), ['0.80 px', 'חשיפה ארוכה מדי']); has('clock', bench('linescan', { v: 280, mode: 'time', exp: 20 }), ['2.00']);
  near('strobe duty', c15.st.duty, 0.2); near('strobe avg', c15.st.Pavg, 3); near('mount, flash', c15.st.zf, 23e-6 * 0.1 * 1.5 * 1e6); near('mount, continuous', c15.st.zc, 23e-6 * 0.1 * 7.5 * 1e6);
  has('strobe animation', steps('strobe'), [f1(c15.st.duty * 100) + '%', f1(c15.st.Pavg, 1) + ' W', f1(c15.st.zf, 1) + ' µm', f1(c15.st.zc, 1) + ' µm']);
  { let k = 0; const h = 1e-3; for (let t = 0; t < 50; t += h) if (t < 20 && t >= 2 && t < 17) k++; near('15.10, sampled', c15.SB.ov, k * h, 1e-3); }
  has('strobe bench', bench('strobe', { mode: 'pulse', I: 5, pw: 15, dl: 2 }), ['15 µs', '15.0%', '3.0 W', '3.4 µm']); has('late pulse', bench('strobe', { mode: 'pulse', I: 5, pw: 15, dl: 20 }), [': 0 µs']);
  { let acc = 0, prev = 0, sz = new Set(), tot = 0; for (let i = 1; i <= 1000; i++) { acc += c15.dv.k; const c = Math.floor(acc + 1e-9); sz.add(c - prev); tot += c - prev; prev = c; } near('the DDA averages 15.3', tot / 1000, 48.8, 1e-3); if ([...sz].sort().join() !== '48,49') bad.push('the divider steps ' + [...sz]); }
  near('jitter', c15.jit.dx, 0.0125); near('SNR', c15.sn.snr, Math.sqrt(2e4)); near('DR', c15.sn.dr, 60); near('vmax 15.1', c15.PB1.vmax, 244); near('clock stretch', c15.PB2.len, 1.4);
  near('flash at 20 kHz', c15.PB3.dz, 23e-6 * 1e5 * 0.5 * 3.2); if (!(c15.PB3.dz < c15.PB3.half && c15.PB3.dzc > c15.PB3.half)) bad.push('problem 15.3: the flash should be inside the DOF and the continuous light outside');
  has('b15 panel', look('b15'), ['20.0 kHz', '2.8 µm = 0.40 px', '3.5 µm = 0.50 px', '0.80 px', '20.0%', '3.0 W', '15.0%']);
  /* chapter 16 */
  const c16 = TBOOK.b16.check;
  near('strips', c16.sp.N, 14); near('scan time', c16.sp.time, 14 * 610 / 250 + 13 * 0.4); near('seam', c16.sp.gap, 1); near('no seam at 3 mm', c16.sp3.gap, 0); near('same strips', c16.sp3.N, 14); near('30 mm field', c16.sp30.N, 19);
  [c16.sp, c16.sp3, c16.sp30].forEach((q, i) => { const fov = q.step + [2, 3, 3][i]; if (!(fov + (q.N - 1) * q.step >= 510 && fov + (q.N - 2) * q.step < 510)) bad.push('16.2 is not the fewest strips for ' + fov); });
  { const e = 1e-4, th = 1.5e-4, p = [250, 200], q = [(1 + e) * (p[0] * Math.cos(th) - p[1] * Math.sin(th)), (1 + e) * (p[0] * Math.sin(th) + p[1] * Math.cos(th))]; near('16.7 against the transform', c16.fe.e, Math.hypot(q[0] - p[0], q[1] - p[1]) * 1000, 1e-3); }
  { const o = { th: 0.003, s: 1 + 2e-4, dx: 1.2, dy: -0.7 }, D = 400, sol = regSolve(D, regPose(o, [-D / 2, 0]), regPose(o, [D / 2, 0])), Q = REG3.Q, a = sol.map(Q), b = regPose(o, Q);
    near('16.6 angle', sol.th, o.th, 1e-9); near('16.6 scale', sol.s, o.s, 1e-12); near('16.6 offset', sol.d[0], o.dx, 1e-9); near('the pad', Math.hypot(a[0] - b[0], a[1] - b[1]), 0, 1e-9); }
  { const D = 400, sg = 5e-3, n = 6000; let s1 = 0, s2 = 0; for (let k = 0; k < n; k++) { const t = regSolve(D, [-D / 2 + sg * gauss(), sg * gauss()], [D / 2 + sg * gauss(), sg * gauss()]).th; s1 += t; s2 += t * t; } near('16.8, Monte Carlo', c16.dth4, Math.sqrt(s2 / n - (s1 / n) ** 2), 4e-2); }
  { const L = LABS.fiducials, S = { x: {}, P: Object.assign({}, L.P), t: 0 }; L.init(S); near('the lab\'s own √2σ/D', L.calc(S.P, S).dth, c16.dth4); }
  near('pad from the angle', c16.PB2.e, c16.dth4 * Math.hypot(150, 120) * 1e3);
  near('16.10 exactly', c16.ac.raw, (4 * c16.ac.B + c16.ac.sub * c16.ac.S) / (c16.ac.B + c16.ac.S), 1e-12); if (!(Math.abs(c16.ac.sub - c16.ac.c) < 2e-3)) bad.push('the subtracted centroid ' + c16.ac.sub); if (!(c16.ac.raw40 < c16.ac.raw)) bad.push('more background pulls harder');
  { const x = c16.al.xs, y = c16.al.ys, n = x.length, Sx = x.reduce((a, b) => a + b), Sy = y.reduce((a, b) => a + b), Sxy = x.reduce((a, v, i) => a + v * y[i], 0), Sxx = x.reduce((a, v) => a + v * v, 0), a = (n * Sxy - Sx * Sy) / (n * Sxx - Sx * Sx), b = (Sy - a * Sx) / n;
    near('16.13 slope', a, c16.al.a, 1e-9); near('16.13 intercept', b, c16.al.b, 1e-9); near('16.12', c16.al.sh, Math.sqrt(c16.al.S / (n - 2)), 1e-9); }
  { const mc = n => { const x = Array.from({ length: n }, (_, i) => 10 * i / (n - 1)), xm = 5, Sxx = x.reduce((a, v) => a + (v - xm) ** 2, 0); let s1 = 0, s2 = 0; const K = 4000; for (let k = 0; k < K; k++) { let sxy = 0; x.forEach(v => { sxy += (v - xm) * (0.8 * v + 2 + gauss()); }); const a = sxy / Sxx; s1 += a; s2 += a * a; } return [Math.sqrt(s2 / K - (s1 / K) ** 2), 1 / Math.sqrt(Sxx)]; };
    const m8 = mc(8), m32 = mc(32); near('16.15, Monte Carlo', m8[0], m8[1], 5e-2); const r = m8[1] / m32[1]; if (!(r > 1.7 && r < 2)) bad.push('four times the points: ' + r); }
  has('fiducial bench', bench('fid', { ppm: 100, urad: 150, sig: 1, mode: 'none' }), [fmt(c16.FCn, 1) + ' µm']); has('affine', bench('fid', { ppm: 100, urad: 150, sig: 1, mode: 'affine' }), ['2.7 µm', '1.4 µm']);
  has('centroid animation', steps('centroid'), [c16.ac.raw.toFixed(3), c16.ac.sub.toFixed(3)]); has('lsq animation', steps('lsq'), [c16.al.a.toFixed(3), c16.al.b.toFixed(3), c16.al.S.toFixed(2), c16.al.sh.toFixed(2)]);
  has('b16 panel', look('b16'), ['38.00 mm', '39.4 s', '1.00 mm', '4.88 µm', lf(c16.dth4 * 1e6, 1) + ' µrad', '2.7 µm', '1.4 µm', c16.ac.raw.toFixed(3), c16.al.a.toFixed(3)]);
  /* chapter 17 */
  const c17 = TBOOK.b17.check, w = 6;
  near('17.2', c17.L0.F0, 2 * 4e-6 / (Math.PI * (w * 1e-4) ** 2)); { let E = 0; const dr = 1e-3; for (let r = dr / 2; r < 40; r += dr) E += c17.L0.F0 * Math.exp(-2 * r * r / (w * w)) * 2 * Math.PI * r * dr; near('17.2, integrated', E * 1e-8 * 1e6, 4, 1e-5); }
  { let rD = 0, rC = 0; for (let r = 0; r < 20; r += 1e-4) { const F = c17.L0.F0 * Math.exp(-2 * r * r / (w * w)); if (F > 1.5) rD = r; if (10 * 0.4 * Math.log(F / 1.5) >= 5) rC = r; } near('17.3, swept', c17.L0.D, 2 * rD, 1e-3); near('17.5, swept', c17.L0.Dc, 2 * rC, 1e-3); }
  near('17.4', c17.L0.depth, 10 * 0.4 * Math.log(c17.L0.F0 / 1.5)); near('Rayleigh', LZ.zr, Math.PI * 36 / 0.355); near('17.6', c17.Lz.w, 6 * Math.sqrt(1 + (320 / LZ.zr) ** 2)); near('dirty', c17.Ld.Ee, 2.4);
  near('one spot for the bridge', laserCalc(c17.PB1.E, 0, 10, 'none').Dc, 10, 1e-6); near('17.10 is the center depth past the copper', c17.PB1.dmg5, c17.L5.depth - 5, 1e-9);
  { const Dc = c17.L5.Dc, n = c17.PB1.c5.n, cov = k => { if (k < 2) return Dc >= 10; const c = Array.from({ length: k }, (_, i) => Dc / 2 + i * (10 - Dc) / (k - 1)); for (let x = 0; x <= 10; x += 1e-3) if (!c.some(q => Math.abs(x - q) <= Dc / 2 + 1e-9)) return false; return true; };
    if (!(cov(n) && !cov(n - 1))) bad.push('17.9: ' + n + ' spots is not the fewest that cover'); }
  near('compensated', c17.PB2.D, c17.L0.D, 1e-9); near('mirror drift', c17.PB3.dx, 4);
  near('spot', c17.sh.w0, 2 * 0.355e-3 * 100 / (Math.PI * 3.75) * 1e3); near('field', c17.sh.field, 2 * 100 * 2 * 7.2 * Math.PI / 180); [1, 3, 5, 7].forEach(a => near('17.12 in the traced head at ' + a + '°', shTrace(a, 0).mm[0], 100 * 2 * a * Math.PI / 180, 1e-6));
  near('2 µJ', c17.E1, 3.5368, 1e-4); near('5°', c17.E3, 17.4533, 1e-4); near('at zR', c17.E4.F0, c17.L0.F0 / 2, 1e-9);
  has('crater animation', steps('crater'), ['7.07 J/cm²', '10.6 µm', '6.2 µm', '4.7 µm']);
  has('laser bench, dirty', bench('laser', { E: 4, dz: 0, N: 10, fault: 'dirty' }), ['2.40 µJ', '4.24 J/cm²', '8.7 µm']); has('laser bench, defocus', bench('laser', { E: 4, dz: 320, N: 10, fault: 'none' }), ['8.50 µm', '11.1 µm', '3.4 µm']);
  has('b17 panel', look('b17'), ['7.07 J/cm²', '10.6 µm', '4.7 µm', '2.40 µJ', '4.24 J/cm²', '8.7 µm', '8.50 µm', '6.0 µm', '50.3 mm', '14.0 mm']);
  return bad; });
ok(!NDd.length, 'Part D: every number recomputed from the physics and from the windows\' own models agrees, the benches show what the panel says at the setting it names, and the sweeps, sampled overlaps, Monte Carlo runs and the integral agree (' + NDd.join(' | ') + ')');

/* v2.78: Parts E and F. Each number again from the physics and from the windows' own models, and against the labs run in time (the valve
   switching, the interlock stopping, the input card filtering), an integrated vacuum ODE, a beam integral, a Monte Carlo of a series system,
   and a sampled UART frame. */
const NEf = await ev(() => { const bad = [], near = (k, a, b, t = 1e-6) => { if (!(Math.abs(a - b) <= t * Math.max(1, Math.abs(b)))) bad.push(k + ': ' + a + ' ≠ ' + b); };
  const look = id => Object.values(TBOOK[id].side).flatMap(x => x.look.map(l => l[1])).join(' ').replace(/<[^>]+>/g, '');
  const steps = id => { const A = ANIMS[id], P = Object.fromEntries(A.params.map(x => [x[0], x[5]])), V = A.calc(P); return A.steps.map(f => f(P, V)).join(' ').replace(/<[^>]+>/g, ''); };
  const bench = (id, s) => { const C = COMPONENTS.find(c => c.id === id), st = document.createElement('div'), out = document.createElement('div'); C.render(s, st, out); return out.textContent; };
  const has = (k, txt, ts) => ts.forEach(t => { if (!txt.includes(t)) bad.push(k + ' lacks ' + t); });
  const lab = (id, P) => { const L = LABS[id], S = { x: {}, P: Object.assign({}, L.P, P), t: 0 }; L.init(S); return { L, S, go: (T, h, f) => { for (let k = 0; k < T / h; k++) { L.step(S, h); S.t += h; if (f) f(S); } return L.calc(S.P, S); } }; };
  let seed = 5; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  /* chapter 18 */
  const c18 = TBOOK.b18.check;
  near('τ', c18.tau, 0.5 / 120); near('t_pull', c18.tpull, c18.tau * Math.log(0.2 / 0.08)); near('coil', c18.Pc, 4.8);
  { const v = lab('valve', { out: 'on' }); v.S.x.t0 = 0; let tp = null; const R = v.go(0.12, 1e-5, S => { if (tp == null && S.x.pull) tp = S.t; });
    near('the lab pulls in at 18.2', tp, c18.tpull, 2e-2); near('the lab fills at 18.1 + travel + 18.8-style fill', R.tr, c18.tfill, 2e-2);
    v.S.P.out = 'off'; let td = null; const t0 = v.S.t; v.go(0.03, 1e-5, S => { if (td == null && !S.x.pull) td = S.t - t0; }); near('the lab drops out at 18.3', td, c18.tdrop, 2e-2);
    has('valve message', v.L.msg(v.L.calc({ out: 'off', fault: 'none', p: 6 }, { x: { i: 0, s: 0, pa: 0, mo: false } }), { P: { out: 'off', fault: 'none', p: 6 } }).replace(/<[^>]+>/g, ''), ['τ = L/R = ' + lf(c18.tau * 1000, 1) + ' ms']); }
  { const v = lab('valve', { out: 'on', p: 3 }); v.S.x.t0 = 0; const R = v.go(0.3, 1e-4); near('venturi at 3 bar in the lab', R.vac, c18.vac3, 1e-3); }
  near('18.7', c18.v0.pss, (1.2 * 15 + 0.02 * 101.3) / 1.22); near('18.8', c18.v0.tau, 2 / 1.22);
  { let p = 101.3, t = 0; const h = 1e-4; while (p > c18.pth && t < 20) { p += h * (-1.2 * (p - 15) + 0.02 * (101.3 - p)) / 2; t += h; } near('18.9 against the integrated 18.6', t, c18.v0.tth, 1e-3); }
  if (!(vacCalc({ C: c18.Cmax * 0.999 }).reach && !vacCalc({ C: c18.Cmax * 1.001 }).reach)) bad.push('18.10 is not the edge'); near('the solved leak', c18.PB2.C, 0.4, 1e-6);
  if (c18.vs.reach || c18.v3.reach) bad.push('an open zone should keep the machine waiting'); near('18.11', c18.v0.F, c18.v0.vac * VT.A);
  { const q = 1000, E = CLAMP.E, h = 0.8e-3, L = CLAMP.L, I = h ** 3 / 12; let d = 0; const n = 20000; for (let i = 0; i < n; i++) { const x = (i + 0.5) * L / n, M = q * x * (L - x) / 2, m = x < L / 2 ? x / 2 : (L - x) / 2; d += M * m / (E * I) * L / n; }
    near('18.12 by the unit-load integral', d, 5 * q * L ** 4 / (384 * E * I), 1e-6); near('18.13', c18.ac.qreq, 384 * E * h ** 3 * 1.6e-3 / (60 * L ** 4) / 1000); }
  near('18.14', c18.acT.resid, 4000 * (1 - c18.acT.dP / c18.acT.qreq)); near('venturi Bernoulli', c18.ven.dp, 48); near('cylinder', c18.cyl.F, 0.6 * Math.PI * 256, 1e-9);
  has('pump animation', steps('pump'), [f1(c18.v0.pss) + ' kPa', f1(c18.v0.tau, 2) + ' s', f1(c18.v0.tth, 2) + ' s']); has('clamp animation', steps('clamp'), [f1(c18.ac.qreq, 2) + ' kPa', f1(c18.ac.F / 1000, 1) + ' kN']);
  has('b18 panel', look('b18'), ['4.2 ms', '200 mA', f1(c18.v0.pss) + ' kPa', f1(c18.acT.resid) + ' µm', lf(c18.vac3, 0) + ' kPa']);
  /* chapter 19 */
  const c19 = TBOOK.b19.check;
  near('19.1', c19.tr, 0.04); near('19.2', c19.s, 0.045); near('19.3', c19.T, 0.14); near('19.4', c19.ik.S, 280); near('at 1 m/s', c19.ik1.S, 480); near('the fastest axis for 300 mm', ilkCalc(c19.vmax, 5, 300).S, 300, 1e-9);
  { const r = lab('interlock', {}); r.L.act.open(r.S); const R = r.go(0.6, 1e-4); near('the lab stops at 19.3', R.tstop, c19.T, 1e-2); if (R.hit) bad.push('the hand should not reach at 0.5 m/s');
    const r1 = lab('interlock', { v: 1 }); r1.L.act.open(r1.S); const R1 = r1.go(0.6, 1e-4); if (!R1.hit) bad.push('the hand should reach at 1 m/s'); }
  near('19.7', c19.cc, 0.05e-3 + (0.95e-3) ** 2); near('19.9', c19.Ry, Math.exp(-2e-6 * 8760));
  { let s = 0; const n = 40000; for (let k = 0; k < n; k++) s += Math.min(...c19.ser.l.map(l => -Math.log(1 - rnd()) / l)); near('19.12 by Monte Carlo', s / n, c19.ser.M, 2e-2); }
  near('B10 is where R = 0.9', relWb(c19.aw.b10, 1e4, 2), 0.9, 1e-9); { const t = 5000, d = 1; near('19.13 h = −d ln R/dt', c19.aw.h, -(Math.log(relWb(t + d, 1e4, 2)) - Math.log(relWb(t - d, 1e4, 2))) / (2 * d), 1e-6); }
  near('MTTF_D', c19.mttfdY, 2e6 / 21120); near('parallel', c19.par, 0.99); near('availability', c19.PB2.A, 50000 / 50004);
  has('weibull animation', steps('weibull'), [f1(c19.aw.R, 3), f1(c19.aw.b10, 0)]); has('b19 panel', look('b19'), ['140 ms', '280 mm', '150 ms', '240 ms', '480 mm', '45 mm', f1(c19.aw.R, 3)]);
  /* chapter 20 */
  const c20 = TBOOK.b20.check;
  near('20.1', c20.I24, 22.8 / 4700); near('20.2', c20.Vth, 10.6);
  { const r = lab('input', { V: 12, noise: 'on' }); let on = 0, n = 0; const R = r.go(0.2, 2e-5, S => { if (S.t > 0.02) { n++; on += S.x.opto; } }); near('20.3 sampled in the lab', on / n, c20.f12, 1e-2); if (!(r.S.x.tog.length >= 15)) bad.push('the bit should chatter at 12 V: ' + r.S.x.tog.length);
    const r2 = lab('input', { V: 24, noise: 'on' }); r2.go(0.2, 2e-5); if (r2.S.x.tog.length > 1) bad.push('the bit should be steady at 24 V'); }
  has('loop bench', bench('loop', { p: 6, f: 'ok' }), ['13.60 mA', '3.40 V', '6.00 bar']); has('broken loop', bench('loop', { p: 6, f: 'brk' }), ['0.00 mA']);
  { let lim = 0; for (let d = 0; d < 0.08; d += 1e-5) { let ok = true; for (let k = 0; k <= 9; k++) { const t = (k + 0.5) * (1 + d); if (t < k || t >= k + 1) ok = false; } if (ok) lim = d; } near('20.8 by sampling the frame', lim * 100, c20.ab.lim, 1e-3); }
  near('UBRR 115200', c20.u115.act, 16e6 / 144, 1e-9); near('double speed', c20.u115x.act, 16e6 / 136, 1e-9);
  near('20.10', c20.ec.t, 62 * 8 / 1e8 + 6e-6); near('20.13', ecatCalc({ bytes: c20.Bmax }).util, 0.8, 1e-9); near('ln(0.7/0.3)', Math.log(0.7 / 0.3), 0.8473, 1e-4);
  has('baud animation', steps('baud'), [f1(c20.ab.shift, 2), f1(c20.ab.lim, 2)]); has('frame animation', steps('frame'), [f1(c20.af.tF) + ' µs', f1(c20.af.util) + '%']);
  has('b20 panel', look('b20'), [amp(c20.I24), '13.60 mA', '3.40 V', f1(c20.ab.lim, 2) + '%', f1(c20.af.tF) + ' µs']);
  return bad; });
ok(!NEf.length, 'Parts E and F: every number recomputed from the physics and from the windows\' own models agrees, the valve, the interlock and the input card run in time where the text says, and the vacuum ODE, the beam integral, the Monte Carlo and the sampled UART frame agree (' + NEf.join(' | ') + ')');

/* v2.78: Part G. The scan, the cycle and the error budget from scanCalc, scanPlan and the transfer page; bring-up, warm-up and capability
   from the bring-up derivations and capab; the line from the 3D line's own model, run for a shift; and a Monte Carlo of the error budget,
   an integrated warm-up, a numeric normal tail, a Monte Carlo of the sample size, and the queue simulated panel by panel. */
const NG = await ev(() => { const bad = [], near = (k, a, b, t = 1e-6) => { if (!(Math.abs(a - b) <= t * Math.max(1, Math.abs(b)))) bad.push(k + ': ' + a + ' ≠ ' + b); };
  const look = id => Object.values(TBOOK[id].side).flatMap(x => x.look.map(l => l[1])).join(' ').replace(/<[^>]+>/g, '');
  const steps = id => { const A = ANIMS[id], P = Object.fromEntries(A.params.map(x => [x[0], x[5]])), V = A.calc(P); return A.steps.map(f => f(P, V)).join(' ').replace(/<[^>]+>/g, ''); };
  const has = (k, txt, ts) => ts.forEach(t => { if (!txt.includes(t)) bad.push(k + ' lacks ' + t); });
  let seed = 9; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }, gauss = () => Math.sqrt(-2 * Math.log(Math.max(1e-12, rnd()))) * Math.cos(2 * Math.PI * rnd());
  /* chapter 21 */
  const c21 = TBOOK.b21.check, sizes = AOISCAN.defects.map(d => d.size);
  near('21.1', c21.s0.f, 240); near('21.2', c21.s0.b, 0.6); near('t_max', c21.s0.tmax, 0.625); near('21.3', c21.s0.area, 1200 * 16384 * 5e-3 / 100); near('21.4', c21.s0.panelS, 360000 / (1200 * 81.92)); near('21.5', c21.s0.need, 2 * Math.hypot(5, 0.6));
  near('found at 5 µm', c21.s0.n, sizes.filter(x => x >= c21.s0.need).length); near('found at 12 µm', c21.sC.n, sizes.filter(x => x >= 2 * Math.hypot(12, 0.6)).length); if (!(c21.sC.n < c21.s0.n && c21.sF.nFalse > 0)) bad.push('the coarse pixel should miss and the long pulse should add false calls');
  near('the largest pixel for 15 µm', c21.PB1.need, 15, 1e-9); near('21.6', c21.Tc, 14 * 610 / 250 + 13 * 0.4 + 24); near('21.8', c21.Tc2, 14 * 610 / 500 + 13 * 0.4 + 24);
  { let s1 = 0, s2 = 0; const n = 60000; for (let k = 0; k < n; k++) { const e = [3, 2, 3, 4].reduce((a, sg) => a + sg * gauss(), 0); s1 += e; s2 += e * e; } near('21.11 by Monte Carlo', Math.sqrt(s2 / n - (s1 / n) ** 2), c21.rss, 2e-2); }
  near('expansion', c21.exp, 25); near('precision', c21.cls.P, 95 / 495); near('recall', c21.cls.R, 0.95);
  { const el = document.createElement('div'); document.body.appendChild(el); scanMount(el); has('the live scan', el.textContent, ['240.0 kHz', '0.60 µm · 12.0%', '983.0 cm²/s', '81.9 mm', '3.7 s', '10.1 µm']); el.remove(); }
  has('handoff animation', steps('handoff'), [f1(2, 1) + ' µm', '3 µm']); has('b21 panel', look('b21'), ['240.0 kHz', '0.60 µm · 12.0%', '983.0 cm²/s', '10.1 µm', '24.0 µm', '80.0%', '6.16 µm', '18.5 µm']);
  /* chapter 22 */
  const c22 = TBOOK.b22.check;
  near('22.2', c22.d1, 3 * 2 * 0.0175 * 10 / 0.75); near('25 m', c22.d2, 5.25); near('22.3', c22.Ipsu, 5); near('22.1', c22.touch.U, 5); near('22.4', c22.th.dL, 11.7);
  { let T = 5, t = 0; const h = 1e-3; while (T > 0.2) { T -= h * T / 40; t += h; } near('22.6 against the integrated 22.5', t, c22.wu.t, 1e-3); }
  { const tail = z => { let s = 0; const n = 200000, hi = 12; for (let i = 0; i < n; i++) { const x = z + (i + 0.5) * (hi - z) / n; s += Math.exp(-x * x / 2) * (hi - z) / n; } return s / Math.sqrt(2 * Math.PI); };
    near('22.10 against a numeric tail', c22.ac.ppm, 1e6 * (tail(25 / 8) + tail(35 / 8)), 2e-3); near('centred', c22.ac0.ppm, 2e6 * tail(30 / 8), 2e-3); }   /* capab's phi is an erf approximation, good to about 1e-7 absolute */
  near('Cp', c22.ac.cp, 1.25); near('Cpk', c22.ac.cpk, 25 / 24); near('22.11', c22.ms, 2); near('%GRR', c22.grr, 20); near('U', c22.U, 2 * Math.sqrt(7.25));
  { const ok = n => { let k = 0; const N = 20000; for (let j = 0; j < N; j++) { let m = 0; for (let i = 0; i < n; i++) m += 0.48 * gauss(); if (Math.abs(m / n) <= 0.2) k++; } return k / N; }; const nn = Math.ceil(c22.nE);
    if (!(ok(nn) >= 0.945 && ok(Math.ceil(nn / 2)) < 0.94)) bad.push('22.14: ' + nn + ' measurements should give about 95%'); }
  near('cable for 21.6 V', c22.PB1.A2, 2 * 0.0175 * 25 * 3 / 2.4); has('cpk animation', steps('cpk'), [c22.ac.cp.toFixed(2), c22.ac.cpk.toFixed(2), Math.round(c22.ac.ppm) + ' ppm']);
  has('b22 panel', look('b22'), [BRING3[0][1], BRING3[2][1], c22.ac.cpk.toFixed(2), Math.round(c22.ac.ppm) + ' ppm', '11.7 µm']);
  /* chapter 23 */
  const c23 = TBOOK.b23.check;
  near('23.1', c23.L0.aoi, 90); near('23.3', c23.L0.rho, 0.45); near('23.2 at 8 calls', c23.L8.line, 75); near('23.5', c23.fill8, 8 / 15); near('23.9', c23.fcMax, 40 / 6); near('23.6', c23.fpy, 0.98 * 0.99 * 0.995); near('23.14', c23.oeeX.v, 40 * 610 / 28800);
  { const run = fc => { const L = LABS.line, S = { x: {}, P: Object.assign({}, L.P, { fc }), t: 0 }; L.init(S); let tFull = null; for (let k = 0; k < 7200 / 0.5; k++) { L.step(S, 0.5); S.t += 0.5; if (tFull == null && S.x.q.length >= LINE3.cap) tFull = S.t; } return { R: L.calc(S.P, S), tFull }; };
    const r8 = run(8), r3 = run(3); near('the line at 8 calls, run for two hours', r8.R.meas, 75, 0.15); if (!(r8.tFull != null && r8.tFull > 600 && r8.tFull < 4000)) bad.push('the buffer should fill in about half an hour: ' + r8.tFull);
    near('the line at 3 calls', r3.R.meas, 90, 0.1); if (r3.tFull != null) bad.push('at 3 calls the buffer should not fill'); }
  { let sd = 3, W = 0, sum = 0; const r = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; }, pois = m => { let L = Math.exp(-m), k = 0, q = 1; do { k++; q *= r(); } while (q > L); return k - 1; }; for (let i = 0; i < 300000; i++) { sum += W; W = Math.max(0, W + pois(6) * 6 - 40); }
    near('the queue, simulated with another seed', sum / 300000, c23.sim6, 0.1); if (!(c23.kg6 > c23.sim6 && c23.kg5 > c23.sim5)) bad.push('Kingman should overestimate here'); }
  { let tot = 0, wsum = 0; const lam = 90 / 3600, Wm = 40; for (let k = 0; k < 2000; k++) { wsum += Wm; } tot = lam * (wsum / 2000); near('Little', c23.little.L, tot); }
  has('b23 panel', look('b23'), ['90 /h', '45%', '120%', 'ρ = 1.20', '75 panels/h']);
  return bad; });
ok(!NG.length, 'Part G: every number recomputed from the physics and from the windows\' own models agrees, the live scan shows what the panel says, the 3D line run for a shift slows to its bottleneck, and the Monte Carlo runs, the integrated warm-up, the numeric normal tail and the simulated queue agree (' + NG.join(' | ') + ')');

await b.close();
if (errs.length) P.push(...errs.map(e => 'js error: ' + e));
console.log(`book: 29 chapters, ${n} checks`);
if (P.length) { console.log('PROBLEMS (' + P.length + ')'); P.slice(0, 40).forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL BOOK CHECKS PASSED');
