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
  const w = content.querySelector('[data-tbw]'); w.click(); const mounted = !!content.querySelector(`.bk-win[data-w="${w.dataset.tbw}"] .bk-wb > :not([data-mount])`) || !content.querySelector(`.bk-win[data-w="${w.dataset.tbw}"] [data-mount]`);
  return { seen, before, after, mounted, stay: location.hash === h0 }; });
ok(G.seen.join() === Array.from({ length: G.seen.length }, (_, i) => Math.min(i + 1, G.seen.length - 1)).join() && G.before && G.after, 'a solved problem opens one step per press, and its last step shows only on request (' + G.seen + ')');
ok(G.mounted && G.stay, 'a pointer to a window opens that window inside the chapter, without leaving it');
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
ok(!NUM.length, 'textbook chapter: every number recomputed from the physics agrees, the Fourier and the time-domain ripple agree, the approximation is the limit of the exact solution (' + NUM.join(' | ') + ')');

await b.close();
if (errs.length) P.push(...errs.map(e => 'js error: ' + e));
console.log(`book: 29 chapters, ${n} checks`);
if (P.length) { console.log('PROBLEMS (' + P.length + ')'); P.slice(0, 40).forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL BOOK CHECKS PASSED');
