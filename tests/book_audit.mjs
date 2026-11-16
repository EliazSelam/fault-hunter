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
const E = await ev(() => { localStorage.clear(); BV.ch = 'b5'; zBookView(); document.querySelector('[data-bx]').click(); const E = BV.exam, total = E.cards.length; let k = 0;
  while (BV.exam && BV.exam.i < total) { const card = BV.exam.cards[BV.exam.i]; const right = k < Math.ceil(total * 0.8); k++;
    if (card.k === 'mc') { const btn = document.querySelector(`#bkA [data-o="${right ? card.a : (card.a + 1) % card.o.length}"]`); btn.click(); } else { document.getElementById('bkShow').click(); document.getElementById(right ? 'bkY' : 'bkN').click(); } }
  const B = bookLoad(); return { total, sc: B.exam.b5 && B.exam.b5.sc, ok: B.exam.b5 && B.exam.b5.ok, res: document.querySelector('.pth-result h2').textContent, srs: Object.keys(reviewLoad()).length, next: !!document.getElementById('bkNext') }; });
ok(E.total >= 5 && E.total <= 10 && E.ok && E.sc >= 0.8 && /עברת/.test(E.res) && E.next, 'a chapter test of up to 10 cards: 80% passes, the result offers the next chapter (' + JSON.stringify(E) + ')');
ok(E.srs >= E.total, 'every answer of the test goes into the spaced repetition store');
const F = await ev(() => { BV.ch = 'b6'; zBookView(); document.querySelector('[data-bx]').click(); while (BV.exam) { const card = BV.exam.cards[BV.exam.i]; if (card.k === 'mc') document.querySelector(`#bkA [data-o="${(card.a + 1) % card.o.length}"]`).click(); else { document.getElementById('bkShow').click(); document.getElementById('bkN').click(); } }
  const B = bookLoad(); return { ok: B.exam.b6.ok, again: !!document.getElementById('bkAgain'), review: !!document.querySelector('.pth-result details') }; });
ok(!F.ok && F.again && F.review, 'a failed test does not certify, lists what to review and offers another try');
await ev(() => { BV.ch = 'b5'; zBookView(); }); ok(await ev(() => /✅ הוסמכת/.test(document.querySelector('.bk-ch').textContent) && /✅/.test(document.querySelector('.bk-toc').textContent)), 'a passed chapter shows as certified in the chapter and in the contents');
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
