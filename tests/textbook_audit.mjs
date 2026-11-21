// The book as a textbook (v2.59). A chapter is the lesson: nothing pressed in its body leaves it; every item appears once and opens in
// place (a window, or a place of the site in a frame of the app that lands exactly where the item says, with no tabs or footer, as tall
// as its content); heavy items wait for a press and one is open at a time; an exercise's answer opens only after an answer of one's own
// is written, and is shown beside it; every exercise has its answer and every calculation a tolerance; a solved example reveals one step
// per press; a question written while reading is kept with its place and shown at the end of the chapter; the calculator computes with
// engineering prefixes and writes into the answer; a term's explanations open at the side; the course keeps one way back; all of it
// fits a phone and travels with the progress backup.
import { createRequire } from 'module'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..'), BASE = url.pathToFileURL(path.join(ROOT, 'index.html')).href;
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1100, height: 900 } }); const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.goto(BASE + '#/zoom/book'); await pg.waitForTimeout(600);
const P = []; let n = 0; const ok = (c, m) => { n++; if (!c) P.push(m); }; const ev = (f, a) => pg.evaluate(f, a); const wait = ms => new Promise(r => setTimeout(r, ms));
await ev(() => localStorage.clear());

/* 1. every chapter, read whole: one of each item, an address for every place, an answer for every exercise, a tolerance for every calculation */
const ST = await ev(() => { const o = { ch: 0, items: 0, dup: [], names: [], noSrc: [], ex: 0, keys: 0, exBad: [], worked: 0, workedBad: [], calcs: 0, tolBad: [], nav: [], lv: 0, qb: QB.length };
  for (const id of bookOrder()) { BV.ch = id; BV.exam = null; zBookView(); const A = document.getElementById('bkCh'), seen = {}, nm = {}; o.ch++;
    const one = (t, where) => { if (seen[t]) o.dup.push(`${bookCh()[id].n}: ${t}`); seen[t] = 1; };
    A.querySelectorAll('.bk-win').forEach(e => { o.items++; one(e.dataset.emb ? bookTarget(e.dataset.emb) : bookWinTarget(e.dataset.w)); const k = (e.dataset.emb || 'w:').split(':')[0] + ':' + e.dataset.t; if (nm[k]) o.names.push(`${bookCh()[id].n}: ${k}`); nm[k] = 1;
      if (e.dataset.emb && !embSrc(e.dataset.emb)) o.noSrc.push(e.dataset.emb); });
    A.querySelectorAll('.bk-ex').forEach(e => { o.ex++; one('q:' + e.dataset.q); const q = QB.find(x => x.id === e.dataset.q); if (!q || !q.a || !A.querySelector(`.bk-key[data-q="${e.dataset.q}"]`)) o.exBad.push(e.dataset.q); });
    A.querySelectorAll('.bk-sol').forEach(e => { o.worked++; one('q:' + e.dataset.q); const q = QB.find(x => x.id === e.dataset.q); if (!q || (q.steps || []).length < 2 || !q.a) o.workedBad.push(e.dataset.q); });
    o.keys += A.querySelectorAll('.bk-key').length; o.lv += A.querySelectorAll('.bk-lvh').length;
    A.querySelectorAll('.bk-calc, .bk-worked').forEach(e => { o.calcs++; const c = bookCard(e.dataset.cid), I = c && bqInst(c, pathDay()); if (!I || !(I.tol > 0 && I.tol <= 0.1) || !isFinite(I.ans) || !I.unit) o.tolBad.push(e.dataset.cid); });
    A.querySelectorAll(id === 'b0' ? 'a[href], [data-asset], [data-ow], [data-bn], [data-route]' : 'a[href], [data-bc], [data-asset], [data-ow], [data-bn], [data-route]').forEach(e => { if (!e.closest('.bk-wb')) o.nav.push(`${bookCh()[id].n}: ${e.outerHTML.slice(0, 70)}`); }); }
  return o; });
ok(ST.ch === 29 && ST.items > 400 && ST.lv > 100, `every chapter reads its topics level by level (${ST.ch} chapters, ${ST.items} items, ${ST.lv} level headings)`);
ok(!ST.dup.length, `no item appears twice in a chapter (${ST.dup.slice(0, 4).join(' | ')})`);
ok(!ST.names.length, `no two items of one kind in a chapter carry the same name (${ST.names.slice(0, 4).join(' | ')})`);
ok(!ST.noSrc.length, `every place of the site in a chapter has an address in the app (${ST.noSrc.slice(0, 4)})`);
ok(ST.ex >= 60 && !ST.exBad.length && ST.keys === ST.ex, `every exercise has its answer at the end of its chapter (${ST.ex} exercises, ${ST.keys} answers; ${ST.exBad.slice(0, 4)})`);
ok(ST.worked >= 8 && !ST.workedBad.length && ST.ex + ST.worked === ST.qb, `every bank question is an exercise or a solved example with steps, once (${ST.ex} + ${ST.worked}; ${ST.workedBad})`);
ok(ST.calcs >= 30 && !ST.tolBad.length, `every calculation in the book has a unit and is accepted within a tolerance (${ST.calcs}; ${ST.tolBad.slice(0, 4)})`);
ok(!ST.nav.length, `a chapter's own text has no link that leaves it (${ST.nav.slice(0, 3).join(' | ')})`);

/* 2. press everything in every chapter (but the loads of heavy items, the chapter test and chapter 0's moves to a chapter): the chapter stays */
const SW = await ev(async () => { const o = { pressed: 0, left: [] }, sel = 'button:not([data-mount]):not([data-bx]):not([data-side]):not([data-bc]):not(:disabled)';
  for (const id of bookOrder()) { BV.ch = id; BV.exam = null; zBookView(); let A = document.getElementById('bkCh');
    A.querySelectorAll('.bk-win[data-light] [data-mount]').forEach(m => m.click());
    const n0 = A.querySelectorAll(sel).length; let last = '';
    for (let i = 0; i < n0; i++) { A = document.getElementById('bkCh');
      if (!A || BV.ch !== id || BV.exam) { o.left.push(`${bookCh()[id].n}: ${last}`); BV.ch = id; BV.exam = null; zBookView(); A = document.getElementById('bkCh'); }
      const btn = A.querySelectorAll(sel)[i]; if (!btn) break; last = btn.textContent.trim().slice(0, 40); try { btn.click(); } catch (e) { } o.pressed++; }
    await new Promise(r => setTimeout(r, 0)); if (!document.getElementById('bkCh') || BV.ch !== id || BV.exam) o.left.push(`${bookCh()[id].n}: ${last}`); drawerClose(); calcClose(); }
  bookSetDir('up'); return o; });
ok(SW.pressed > 400 && !SW.left.length, `nothing pressed in a chapter's body leaves the chapter (${SW.pressed} controls; ${SW.left.slice(0, 4).join(' | ')})`);

/* 3. every place of the site in every chapter, opened in a frame: it lands where it says, alone, with no tabs, title block or footer */
const ALL = await ev(() => { const L = []; for (const id of bookOrder()) { BV.ch = id; BV.exam = null; zBookView(); document.querySelectorAll('#bkCh [data-emb]').forEach(e => L.push(e.dataset.emb)); } return [...new Set(L)]; });
await ev(() => { localStorage.setItem(EMB_PROBE, 'p'); EMBX.nonce = 'p'; document.body.insertAdjacentHTML('beforeend', '<div id="embTest" style="position:absolute;left:0;top:0;width:900px"></div>'); });
const bad = [], kinds = {};
for (let i = 0; i < ALL.length; i += 6) {
  const batch = ALL.slice(i, i + 6);
  await ev(B => { const box = document.getElementById('embTest'); box.innerHTML = ''; B.forEach((a, j) => { const f = document.createElement('iframe'); f.className = 'embt'; f.dataset.j = j; f.style.cssText = 'width:900px;height:600px'; f.src = embSrc(a); box.appendChild(f); }); }, batch);
  for (let j = 0; j < batch.length; j++) {
    const a = batch[j], k = a.slice(0, a.indexOf(':')), h = await pg.$(`#embTest iframe[data-j="${j}"]`), fr = await h.contentFrame(); let r = null;
    for (let t = 0; t < 60 && !r; t++) { await wait(100); try { r = await fr.evaluate(() => window.__fhEmbOk ? { ok: 1 } : null); } catch (e) { } }
    if (!r) { bad.push(a + ': the frame did not start'); continue; }
    const R = await ev(a => embRoute(a), a);
    const got = await fr.evaluate(([R, k]) => { const c = document.getElementById('content'), vis = s => { const e = document.querySelector(s); return !!e && getComputedStyle(e).display === 'none'; };
      const o = { hash: location.hash, text: c ? c.textContent.trim().length : 0, bare: vis('header.top') && vis('nav.sheets') && vis('footer') && vis('#titleblock') };
      if (R[1].st && R[0] === 's2/lib') { const h2 = c.querySelector('section.block h2'), B = BOARDS.find(z => z.id === R[1].st); o.place = !!h2 && !!B && h2.textContent.includes(B.name); }
      else if (R[1].st) { const cur = document.querySelector('.stepper [aria-current="true"]'); o.place = !!cur && cur.dataset.st === R[1].st; }
      else if (R[1].lvl) o.place = TSTATE.lvl === R[1].lvl;
      else if (R[1].only) { const e = document.querySelector(R[1].only); o.place = !!e && e.offsetHeight > 0 && [...e.parentElement.children].filter(s => s !== e && !s.matches('script,style')).every(s => s.style.display === 'none'); }
      else o.place = location.hash === '#/' + R[0];
      return o; }, [R, k]);
    kinds[k] = (kinds[k] || 0) + 1;
    if (!(got.text > 30 && got.bare && got.place && got.hash.startsWith('#/' + R[0].split('/')[0]))) bad.push(`${a} → ${JSON.stringify(got)}`);
  }
}
await ev(() => document.getElementById('embTest').remove());
ok(ALL.length > 250 && !bad.length, `every place of the site in the book opens in a frame where it says, alone and without the site's frame (${ALL.length} places: ${JSON.stringify(kinds)}; ${bad.slice(0, 3).join(' | ')})`);

/* 4. in the chapter: a frame as tall as its page, one heavy item at a time, the drawer beside it */
const LV = await ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); BV.ch = 'b18'; BV.exam = null; zBookView(); const A = document.getElementById('bkCh');
  const E = [...A.querySelectorAll('.bk-win[data-emb]')], one = E[0], two = E[1]; bookMount(one); let f = one.querySelector('iframe.emb');
  for (let t = 0; t < 80 && !(f && parseFloat(f.style.height) > 240); t++) await w(100);
  const h1 = f ? parseFloat(f.style.height) : 0; bookMount(two); await w(50);
  const firstBack = !!one.querySelector('[data-mount]') && !one.querySelector('iframe'), secondOpen = !!two.querySelector('iframe.emb');
  drawerRoute('בדיקה', 'route:pcb/line'); await w(50); const both = document.querySelectorAll('iframe.emb').length === 2 && !!document.querySelector('#fhDrawer iframe.emb') && !!two.querySelector('iframe.emb');
  drawerClose(); const sideGone = !document.querySelector('#fhDrawer iframe.emb') && !!two.querySelector('iframe.emb'); bookUnmount(two); const closed = !two.querySelector('iframe') && !!two.querySelector('[data-mount]');
  return { h1, firstBack, secondOpen, both, sideGone, closed, still: !!document.getElementById('bkCh') }; });
ok(LV.h1 > 240, `a frame in the chapter grows to its page's height (${LV.h1} px)`);
ok(LV.firstBack && LV.secondOpen && LV.closed && LV.still, `one heavy item is open in a chapter at a time, and closing it frees it (${JSON.stringify(LV)})`);
ok(LV.both && LV.sideGone, 'the drawer opens a place beside the chapter\'s open frame, and closing it leaves the chapter as it was');
const FH = await (async () => { const h = await pg.$('#bkCh .bk-win[data-emb] iframe.emb'); if (h) return 'still open'; await ev(() => { const e = document.querySelector('#bkCh .bk-win[data-emb]'); bookMount(e); });
  const f = await (await pg.$('#bkCh iframe.emb')).contentFrame(); for (let t = 0; t < 60; t++) { await wait(100); if (await f.evaluate(() => !!window.__fhEmbOk).catch(() => false)) break; } await wait(400);
  return ev(() => { const f = document.querySelector('#bkCh iframe.emb'); return { frame: Math.round(parseFloat(f.style.height)) }; }).then(async o => Object.assign(o, await f.evaluate(() => ({ page: Math.ceil(document.getElementById('sheet').getBoundingClientRect().bottom + scrollY) })))); })();
ok(FH.frame && Math.abs(FH.frame - FH.page) <= 8, `a frame is exactly as tall as its page, so it never scrolls by itself (${JSON.stringify(FH)})`);

/* 5. the notebook: an answer opens only after one's own is written, and shows beside it; what was written comes back */
const NB = await ev(() => { localStorage.removeItem('fh-notes'); const id = bookOrder().find(x => { BV.ch = x; BV.exam = null; zBookView(); return document.querySelector('#bkCh .bk-ex'); });
  const A = document.getElementById('bkCh'), ex = A.querySelector('.bk-ex'), q = ex.dataset.q, key = A.querySelector(`.bk-key[data-q="${q}"]`), sum = key.querySelector('summary');
  sum.click(); const shutEmpty = !key.open && key.classList.contains('bk-need-on');
  const t = ex.querySelector('textarea'); t.value = 'R = V / I, <b>כלומר</b> 100 Ω'; t.dispatchEvent(new Event('input', { bubbles: true }));
  const unl = key.classList.contains('bk-unl'); sum.click(); const mine = key.querySelector('.bk-mine'), ans = key.querySelector('.bk-cmp');
  return { id, q, shutEmpty, unl, open: key.open, mine: mine && mine.textContent, noHtml: !key.querySelector('.bk-mine b'), ans: !!ans && ans.textContent.includes(QB.find(x => x.id === q).a.replace(/<[^>]+>/g, '').slice(0, 12)), rate: key.querySelectorAll('[data-r]').length }; });
ok(NB.shutEmpty && NB.unl && NB.open, `an exercise's answer stays closed until an answer is written, then opens (${JSON.stringify(NB)})`);
ok(NB.mine === 'R = V / I, <b>כלומר</b> 100 Ω' && NB.noHtml && NB.ans && NB.rate === 3, 'the answer shows what I wrote, as text, beside the book\'s answer, with how it went');
const RC = await ev(() => { BV.ch = 'b1'; BV.exam = null; zBookView(); const nb = document.querySelector('#bkCh .bk-nb') || (() => { for (const id of bookOrder()) { BV.ch = id; zBookView(); const x = document.querySelector('#bkCh .bk-nb'); if (x) return x; } })(); if (!nb) return { none: true };
  const r = nb.querySelector('[data-reveal]'), d0 = r.disabled, t = nb.querySelector('textarea'); t.value = 'כי הזרם קטן'; t.dispatchEvent(new Event('input', { bubbles: true })); const d1 = r.disabled; r.click();
  return { d0, d1, cmp: !!nb.querySelector('.bk-cmp'), sg: nb.querySelectorAll('[data-sg]').length }; });
ok(RC.none || (RC.d0 && !RC.d1 && RC.cmp && RC.sg === 2), `an intuition answer is written before it is revealed, and set beside the book's (${JSON.stringify(RC)})`);
await pg.reload(); await pg.waitForTimeout(600);
const NB2 = await ev(q => { BV.ch = bookOrder().find(x => { BV.ch = x; BV.exam = null; zBookView(); return document.querySelector(`#bkCh .bk-ex[data-q="${q}"]`); }); return { val: document.querySelector(`#bkCh .bk-ex[data-q="${q}"] textarea`).value, unl: document.querySelector(`.bk-key[data-q="${q}"]`).classList.contains('bk-unl') }; }, NB.q);
ok(NB2.val === 'R = V / I, <b>כלומר</b> 100 Ω' && NB2.unl, 'what was written in an exercise is there again after a reload');

/* 6. a solved example: one step per press, then the answer; the calculation's example keeps its own numbers */
const WK = await ev(() => { for (const id of bookOrder()) { BV.ch = id; BV.exam = null; zBookView(); const s = document.querySelector('#bkCh .bk-sol'); if (!s) continue; const q = QB.find(x => x.id === s.dataset.q), btn = s.querySelector('[data-step]');
  btn.click(); const one = s.querySelectorAll('.bk-solst li').length; for (let i = 1; i < q.steps.length; i++) s.querySelector('[data-step]').click();
  const w = document.querySelector('#bkCh .bk-worked'); let ex = null; if (w) { const c = bookCard(w.dataset.cid), I = bqInst(c, 'ex:' + c.id); const st = I.steps.length; for (let i = 0; i < st; i++) w.querySelector('.bq-next').click(); ex = { st, li: w.querySelectorAll('.bq-steps li').length, ans: /התשובה/.test(w.textContent), inp: !!w.querySelector('input') }; }
  return { one, all: s.querySelectorAll('.bk-solst li').length === q.steps.length, end: !s.querySelector('.bk-solend').hidden && !s.querySelector('[data-step]'), ex }; } });
ok(WK.one === 1 && WK.all && WK.end, `a solved example shows one step per press, then the answer (${JSON.stringify(WK)})`);
ok(WK.ex && WK.ex.li === WK.ex.st && WK.ex.ans && !WK.ex.inp, 'a calculation\'s solved example reveals its steps one by one and asks nothing');

/* 7. I have a question: kept with its place, shown at the end of the chapter beside what I know now, and it stays */
const MQ = await ev(() => { localStorage.removeItem('fh-myq'); BV.ch = 'b4'; BV.exam = null; zBookView(); const sec = document.querySelector('#bkCh section.bk-topic'); sec.scrollIntoView({ block: 'center' });
  document.querySelector('.bk-tools [data-tool="ask"]').click(); const d = document.getElementById('fhDrawer'), q = d.querySelector('#myqQ'), s = d.querySelector('#myqS'), dis = s.disabled;
  q.value = 'למה LED צריך נגד בטור?'; q.dispatchEvent(new Event('input')); d.querySelector('#myqG').value = 'כדי שלא יישרף'; s.click();
  const box = document.getElementById('bk-myq'), it = box && box.querySelector('.bk-q1'); return { dis, shut: d.hidden, shown: !box.hidden, q: it && it.querySelector('.bk-qq').textContent, at: it && it.querySelector('.bk-qat').dataset.goto === sec.id, guess: it && it.querySelector('.bk-qg').textContent, store: myqLoad().length }; });
ok(MQ.dis && MQ.shut && MQ.shown && MQ.q === 'למה LED צריך נגד בטור?' && MQ.at && MQ.guess === 'כדי שלא יישרף' && MQ.store === 1, `a question written while reading is kept with the section it was asked in and shown at the end of the chapter (${JSON.stringify(MQ)})`);
const MQ2 = await ev(() => { const t = document.querySelector('#bk-myq [data-myq]'); t.value = 'הנגד מגביל את הזרם'; t.dispatchEvent(new Event('input')); document.querySelector('#bk-myq [data-myqd]').click(); BV.ch = 'b4'; zBookView(); const it = document.querySelector('#bk-myq .bk-q1'); return { now: it.querySelector('[data-myq]').value, done: it.classList.contains('done'), other: (() => { BV.ch = 'b5'; zBookView(); return document.getElementById('bk-myq').hidden; })() }; });
ok(MQ2.now === 'הנגד מגביל את הזרם' && MQ2.done && MQ2.other, 'what I know now and "answered" are kept, and a chapter shows only its own questions');

/* 8. the calculator */
const CA = await ev(() => { const T = [['2+3*4', 14], ['(2+3)*4', 20], ['2^3^2', 512], ['-2^2', -4], ['2*-3', -6], ['12/4/3', 1], ['4.7k*2', 9400], ['10µ', 1e-5], ['10u', 1e-5], ['2M/4k', 500], ['5m', 0.005], ['1e3', 1000], ['2.2e-3', 0.0022], ['3,5*2', 7], ['3(1+1)', 6], ['2pi', 2 * Math.PI],
    ['1/(2*pi*1k*100n)', 1 / (2 * Math.PI * 1e3 * 100e-9)], ['sqrt(16)', 4], ['√16', 4], ['√(9+16)', 5], ['sin(30)', 0.5], ['cos(60)', 0.5], ['atan(1)', 45], ['log(1000)', 3], ['ln(e)', 1], ['exp(0)', 1], ['abs(-3)', 3], ['24/(1k+220)', 24 / 1220], ['0.5*100n*12^2', 0.5 * 100e-9 * 144]];
  const bad = T.filter(([x, v]) => { try { return Math.abs(calcEval(x, true, null) - v) > 1e-12 * Math.max(1, Math.abs(v)); } catch (e) { return true; } }).map(x => x[0]);
  const rad = Math.abs(calcEval('sin(pi/6)', false) - 0.5) < 1e-12, ans = calcEval('ans*2', true, 21) === 42;
  const errs = ['2+', '(', '2)', 'foo(2)', '', '3mm', '2**'].filter(x => { try { const v = calcEval(x, true, null); return isFinite(v); } catch (e) { return false; } });
  const F = [[0.00047, '470 µ'], [12000, '12 k'], [1591.549, '1.592 k'], [999.96, '1 k'], [0, '0'], [-0.0022, '-2.2 m'], [1e-12, '1 p'], [3.3, '3.3']].filter(([x, s]) => calcEng(x) !== s).map(x => x[0] + '→' + calcEng(x[0]));
  return { bad, rad, ans, errs, F, plain: calcPlain(1 / 3) === '0.333333' && calcPlain(1e-6) === '1e-6' }; });
ok(!CA.bad.length && CA.rad && CA.ans, `the calculator computes with precedence, prefixes, implicit products, functions, degrees and radians (${CA.bad})`);
ok(!CA.errs.length, `the calculator refuses what is not an expression (${CA.errs})`);
ok(!CA.F.length && CA.plain, `results show in engineering notation and as a plain number (${CA.F})`);
const CI = await ev(() => { BV.ch = 'b1'; BV.exam = null; zBookView(); const box = document.querySelector('#bkCh .bk-calc'), inp = box.querySelector('.bq-in'), card = bookCard(box.dataset.cid), I = bqInst(card, pathDay());
  inp.focus(); box.querySelector('[data-tool="calc"]').click(); const c = document.getElementById('fhCalc'), x = c.querySelector('#calcIn'); x.value = String(I.ans) + '*1'; x.dispatchEvent(new Event('input'));
  c.querySelector('#calcIns').click(); box.querySelector('.bq-check').click(); const got = inp.value, okText = box.querySelector('.bq-out').textContent; calcClose();
  return { open: !c.hidden || true, got, right: /נכון/.test(okText), hist: (JSON.parse(localStorage.getItem('fh-calc') || '[]')).length }; });
ok(CI.right && CI.hist >= 1, `the calculator's result goes into the answer being typed, and the answer is accepted (${JSON.stringify(CI)})`);

/* 9. a term: its definition and its full explanation open at the side; the chapter stays */
const TM = await ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); for (const id of ['b1', 'b4', 'b7', 'b10', 'b20']) { BV.ch = id; BV.exam = null; zBookView(); await w(80); glossify(document.getElementById('content'));
  const a = [...document.querySelectorAll('#bkCh abbr.gl')].find(x => termRoute(x.dataset.g)); if (!a) continue; a.click(); const tip = document.getElementById('gltip'), full = [...tip.querySelectorAll('button')].find(x => /להסבר המלא/.test(x.textContent)), def = [...tip.querySelectorAll('button')].find(x => /ההגדרה המלאה/.test(x.textContent));
  full.click(); await w(30); const d = document.getElementById('fhDrawer'), side = !d.hidden && !!d.querySelector('iframe.emb'); drawerClose(); a.click(); [...document.getElementById('gltip').querySelectorAll('button')].find(x => /ההגדרה המלאה/.test(x.textContent)).click();
  const defOk = !d.hidden && d.querySelector('.drw-b').textContent.length > 20; drawerClose(); return { id, term: a.dataset.g, side, defOk, def: !!def, still: !!document.getElementById('bkCh') && BV.ch === id }; } return {}; });
ok(TM.side && TM.defOk && TM.still, `a term's full explanation and full definition open at the side, and the chapter stays (${JSON.stringify(TM)})`);

/* 9b. a topic's link to a deeper page, inside one of its windows, opens that page at the side */
const DL = await ev(async () => { BV.ch = 'b13'; BV.exam = null; zBookView(); const A = document.getElementById('bkCh'); A.querySelectorAll('.bk-win[data-light] [data-mount]').forEach(m => m.click());
  const l = [...A.querySelectorAll('.bk-wb [data-r]')].find(x => !x.closest('.qrate')); if (!l) return { none: true }; l.click(); await new Promise(r => setTimeout(r, 30)); const d = document.getElementById('fhDrawer');
  const r = { route: l.dataset.r, side: !d.hidden && !!d.querySelector('iframe.emb') && d.querySelector('iframe.emb').src.includes('#/' + l.dataset.r), still: !!document.getElementById('bkCh') && BV.ch === 'b13' }; drawerClose(); return r; });
ok(DL.side && DL.still, `a link to a deeper page inside a chapter's window opens that page at the side (${JSON.stringify(DL)})`);
/* 10. related content: another chapter at the side; going to it is one press inside the drawer */
const RL = await ev(() => { BV.ch = 'b5'; BV.exam = null; zBookView(); const b = document.querySelector('#bkCh [data-sidech]'), to = b.dataset.sidech; b.click(); const d = document.getElementById('fhDrawer'), shown = !d.hidden && /פרק/.test(d.querySelector('#drwT').textContent), still = BV.ch === 'b5' && !!document.getElementById('bkCh');
  d.querySelector('[data-goch]').click(); return { shown, still, went: BV.ch === to, shut: d.hidden, recap: (() => { BV.ch = 'b5'; zBookView(); return !!document.querySelector('#bk-pre .bk-rc li'); })() }; });
ok(RL.shown && RL.still && RL.went && RL.shut, `another chapter opens at the side, and moving to it is a press inside the drawer (${JSON.stringify(RL)})`);
ok(RL.recap, 'a chapter opens with what it needs from earlier chapters, in their own lines, inside the page');

/* 11. one way back: after a page opened from the zoom, a tab and then a place of the book show only the book's way back */
const BK = await ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); go('zoom', 'laser'); await w(30); zOpenPage('pcb/line'); await w(30); const z1 = !!document.querySelector('#content .zback:not(#bkRetNav)');
  document.querySelector('nav.sheets button[data-sheet="zoom"]').click(); await w(30); BV.ch = 'b23'; go('zoom', 'book'); bookOpen('p:pcb/ov', 'b23'); await w(60);
  return { z1, book: !!document.getElementById('bkRetNav'), zoom: !!document.querySelector('#content .zback:not(#bkRetNav)') }; });
ok(BK.z1 && BK.book && !BK.zoom, `a place shows one way back, the latest (${JSON.stringify(BK)})`);

/* 12. the course board's next step, the chapter's faults, stays in the book and opens the fault inside it */
const NX = await ev(async () => { localStorage.clear(); const B = bookLoad(); B.read.b0 = 1; const id = bookOrder().find(x => bookFaults(x).length); bookOrder().filter(x => x !== 'b0' && bookCh()[x].n < bookCh()[id].n).forEach(x => { B.exam[x] = { ok: true, sc: 0.9 }; const P = loadP(); bookFaults(x).forEach(f => P[f] = { score: 80 }); saveP(P); }); B.read[id] = 1; B.exam[id] = { ok: true, sc: 0.9 }; bookSave(B);
  BV.ch = id; BV.exam = null; zBookView(); document.querySelector('[data-dash="next"]').click(); await new Promise(r => setTimeout(r, 60)); const f = bookFaults(id).find(x => !bookSolved(x)), e = document.getElementById(BKID('scn:' + f));
  return { id, f, inBook: !!document.getElementById('bkCh') && BV.ch === id, open: !!e && !!e.querySelector('iframe.emb') }; });
ok(NX.inBook && NX.open, `"continue" on the course board opens the chapter's next fault inside the chapter (${JSON.stringify(NX)})`);

/* 12b. a fault solved inside its frame counts at once: the chapter's requirements and the fault's mark follow */
await ev(() => { localStorage.clear(); const id = bookOrder().find(x => bookFaults(x).length); BV.ch = id; BV.exam = null; zBookView(); bookMount(document.getElementById(BKID('scn:' + bookFaults(id)[0]))); });
const fh = await pg.$('#bk-flt iframe.emb'), ff = fh && await fh.contentFrame(); let fok = false; for (let t = 0; ff && t < 60 && !fok; t++) { await wait(100); fok = await ff.evaluate(() => !!window.__fhEmbOk).catch(() => false); }
if (ff && fok) await ff.evaluate(() => { const P = loadP(); P[bookFaults(BV.ch || bookOrder().find(x => bookFaults(x).length))[0]] = { score: 90, down: 5 }; saveP(P); }).catch(() => {});
await wait(300);
const SF = await ev(() => { const id = BV.ch, f = bookFaults(id)[0], e = document.getElementById(BKID('scn:' + f)), req = document.querySelector('#bkCh .bk-req'); return { started: true, solved: bookSolved(f), mark: !!e && e.classList.contains('ok'), req: !!req && req.textContent.includes('✓ ' + f) }; });
ok(fok && SF.solved && SF.mark && SF.req, `a fault solved inside its frame counts at once in the chapter (${JSON.stringify(Object.assign({ frame: fok }, SF))})`);
/* 13. the progress backup carries what was written */
const BU = await ev(() => { nbSet('q:Q01', 'x'); myqSave([{ id: 'a', ch: 'b1', sec: '', secT: '', q: 'שאלה', guess: '', now: '', done: false, at: 1 }]); localStorage.setItem('fh-calc', '[{"x":"1+1","v":2}]'); const s = bkSnapshot(); return ['fh-notes', 'fh-myq', 'fh-calc'].every(k => typeof s.data[k] === 'string') && !s.data[EMB_PROBE]; });
ok(BU, 'the progress backup carries the notebook, my questions and the calculator\'s history, and not the frames\' probe');

/* 13b. a fault gathers what helps to learn it: its topic working as it should, and every part it names, opened in place (v2.60) */
const SH = await ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)), none = [];
  for (const s of SCN) { playScn(s.id); if (!document.getElementById('scnHelp') && !document.getElementById('scnhSee')) none.push(s.id); }
  playScn('C-06'); const chips = [...document.querySelectorAll('#scnHelp [data-hi]')].map(x => x.textContent), dio = [...document.querySelectorAll('#scnHelp [data-hi]')].find(x => /דיודה/.test(x.textContent)); dio.click(); await w(30);
  const card = document.querySelector('#scnHelp .scnh-card').textContent.trim().length, hl = document.querySelector('#scnHelp [data-hl]'); hl.click(); await w(200); const live = !!document.querySelector('#scnHelp .scnh-live').children.length;
  const stays = location.hash === '#/scn/C-06' && !!document.getElementById('tests');
  playScn('L1-05'); document.getElementById('scnhSee').click(); await w(200); const see = !!document.querySelector('#scnhMain .scnh-w').children.length, sch = !!document.querySelector('#scnhMain [data-hs]');
  return { none, chips, card, live, stays, see, sch }; });
ok(!SH.none.length, `every fault gathers help to learn it: its topic working, or the parts it names (${SH.none})`);
ok(['סליל', 'טרנזיסטור', 'דיודה', 'ממסר'].every(k => SH.chips.some(c => c.includes(k))) && SH.card > 60 && SH.live && SH.stays, `a fault's parts are hints that open their card and live window in place, and the fault stays (${JSON.stringify(SH)})`);
ok(SH.see && SH.sch, 'under "what should have happened", the fault\'s topic opens working, and its symbol after it');
const QN = await ev(() => { localStorage.removeItem('fh-notes'); showQ('P16', ['P16']); const t = document.querySelector('#qa textarea.qnb'); if (!t) return { none: true }; t.value = 'כי הלייזר סגור בתוך המעטפת'; t.dispatchEvent(new Event('input', { bubbles: true }));
  document.querySelector('#qa [data-sh="3"]').click(); const m = document.querySelector('#qa .bk-mine'); return { mine: m && m.textContent, ans: !!document.querySelector('#qa .bk-cmp'), kept: nbGet('q:P16') }; });
ok(QN.mine === 'כי הלייזר סגור בתוך המעטפת' && QN.ans, `a bank question has a field for one's own answer, shown beside the answer (${JSON.stringify(QN)})`);

/* 14. a phone: the chapter, an open frame, the drawer and the calculator fit the screen */
await pg.setViewportSize({ width: 390, height: 844 });
const PH = await ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); BV.ch = 'b20'; BV.exam = null; zBookView(); await w(60); const e = document.querySelector('#bkCh .bk-win[data-emb]'); bookMount(e); await w(400);
  const f = e.querySelector('iframe.emb'), over = document.scrollingElement.scrollWidth - document.scrollingElement.clientWidth; drawerChapter('b19'); const d = document.getElementById('fhDrawer').getBoundingClientRect(); drawerClose();
  calcOpen(); const c = document.getElementById('fhCalc').getBoundingClientRect(); calcClose(); const t = document.querySelector('.bk-tools').getBoundingClientRect();
  return { over, fw: f ? Math.round(f.getBoundingClientRect().width) : 0, dw: Math.round(d.width), cl: Math.round(c.left), cr: Math.round(c.right), tw: Math.round(t.right - t.left) }; });
ok(PH.over <= 1 && PH.fw > 300 && PH.fw <= 390 && PH.dw === 390 && PH.cl >= 0 && PH.cr <= 390 && PH.tw <= 390, `on a phone the chapter does not scroll sideways, a frame takes the column, and the drawer and the calculator fit (${JSON.stringify(PH)})`);

await b.close();
if (errs.length) P.push(...[...new Set(errs)].map(e => 'js error: ' + e));
console.log(`textbook: ${ST.ch} chapters, ${ST.items} items, ${ALL.length} places in frames, ${ST.ex} exercises, ${n} checks`);
if (P.length) { console.log('PROBLEMS (' + P.length + ')'); P.slice(0, 40).forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL TEXTBOOK CHECKS PASSED');
