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
for (const id of ['b1', 'b2', 'b3', 'b4']) {
  await pg.evaluate(id => { BV.ch = id; BV.exam = null; go('zoom', 'book'); }, id); await pg.waitForTimeout(400);
  const X = await pg.evaluate(id => { const A = content, c = bookCh()[id], n = c.n, T = TBOOK[id], h3 = [...A.querySelectorAll('h3')].map(h => h.textContent.trim()), at = t => h3.findIndex(x => x.startsWith(t));
    const order = [`${n}.0 `, `${n}.1 `, `${n}.2 `, `${n}.3 `, `★ ${n}.4 `, `${n}.5 `, `${n}.6 `, `${n}.7 `, '🎛️'].map(at);
    const eqs = [...A.querySelectorAll('.tb-eq')].map(e => e.dataset.eq), want = Array.from({ length: eqs.length }, (_, i) => n + '.' + (i + 1));
    const links = [...A.querySelectorAll('[data-tbeq]')].map(b => b.dataset.tbeq), ptr = [...A.querySelectorAll('[data-tbw]')].map(b => b.dataset.tbw);
    /* the practice cards (pq:) live in the chapter's own questions, and a page window is embedded by its route */
    const ws = c.nodes.flatMap(x => zWindows(zNode(x))).filter(w => !PQ_WIN[w]), inCh = ws.filter(w => A.querySelector(`.bk-win[data-w="${w}"], .bk-win[data-emb="${w}"]`)).length;
    const side = T.side || {}, sideWins = Object.values(side).flatMap(x => x.win.map(w => w[0])), looks = Object.values(side).flatMap(x => x.look.map(l => l[0]));
    return { order, seq: eqs.join() === want.join(), neq: eqs.length, links: links.every(l => eqs.includes(l)), ptr: ptr.length >= 6 && ptr.every(w => ws.includes(w)), inCh, ws: ws.length,
      probs: A.querySelectorAll('.tb-prob').length, ex: A.querySelectorAll('.tb-x details').length, levels: ['basic', 'adv', 'ext'].every(l => T.exercises.some(e => e.l === l)), risk: bidiRisk(A).length, whyOnce: A.querySelectorAll('#bk-why').length,
      par: [...A.querySelectorAll('[data-tbpar]')].map(b => b.dataset.tbpar).join() === Object.keys(side).join() && Object.keys(side).length === 3, sideWins: sideWins.every(w => ws.includes(w)), labs: Object.values(side).every(x => x.win[0][0].startsWith('3d:')),
      looks: looks.every(eq => eqs.includes(eq)), marks: [...new Set(looks)].every(eq => A.querySelector(`.tb-eq[data-eq="${eq}"] [data-tbse]`)), bad: /NaN|undefined|Infinity|\$\{/.test(A.innerHTML), sum: T.summary.every(r => eqs.includes(r[2])) }; }, id);
  ok(X.order.every((x, i) => x >= 0 && (i === 0 || x > X.order[i - 1])), `textbook ${id}: opening, three sections, an advanced section, summary, solved problems, exercises and the layer, in that order (${X.order})`);
  ok(X.seq && X.neq >= 15 && X.links && X.sum, `textbook ${id}: ${X.neq} equations numbered in order, and every link and summary row finds its equation`);
  ok(X.ptr && X.inCh === X.ws, `textbook ${id}: every pointer is to a window of the chapter's topics, and all ${X.ws} of them are still in the chapter`);
  ok(X.probs === 3 && X.ex >= 6 && X.levels && X.risk === 0 && X.whyOnce === 1 && !X.bad, `textbook ${id}: three solved problems, six exercises at three levels with hidden answers, no formula out of order, nothing unfilled`);
  ok(X.par && X.sideWins && X.labs && X.looks && X.marks, `textbook ${id}: every section reads beside its topic's 3D lab, and every equation named has its line and its button`);
}
/* the panel mounts a 3D lab and stops it on close */
const LAB = await ev(async () => { BV.ch = 'b3'; go('zoom', 'book'); content.querySelector('[data-tbpar="3.2"]').click(); await new Promise(r => setTimeout(r, 900)); const w = document.querySelector('#drwB .tbs-win'), o = { mounted: !!w.querySelector('canvas') && !!w.act, sid: TBS.sid };
  const act = w.act; let stopped = false; const d0 = act.destroy; act.destroy = () => { stopped = true; d0(); }; drawerClose(); o.stopped = stopped; localStorage.removeItem('fh-tbpar'); return o; });
ok(LAB.mounted && LAB.sid === '3.2' && LAB.stopped, 'the panel runs the 3D lab beside the text, and closing it stops the lab');
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

await b.close();
if (errs.length) P.push(...errs.map(e => 'js error: ' + e));
console.log(`book: 29 chapters, ${n} checks`);
if (P.length) { console.log('PROBLEMS (' + P.length + ')'); P.slice(0, 40).forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL BOOK CHECKS PASSED');
