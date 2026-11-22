// Finding and moving (v2.70): the search knows every topic, chapter and view and opens old pages inside their topic; every topic leads to the one
// before and after it in the book; every topic has something to see first and questions in level 5; page windows say what they open; the frame on a phone.
import { createRequire } from 'module'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const INDEX = url.pathToFileURL(path.join(ROOT, 'index.html')).href;
const problems = []; let checks = 0; const ok = (c, m) => { checks++; if (!c) problems.push(m); };
const b = await chromium.launch(); const errs = [];
const page = async (w, hash = '') => { const p = await b.newPage({ viewport: { width: w, height: 900 } }); p.on('pageerror', e => errs.push(e.message)); await p.goto(INDEX + hash); await p.waitForTimeout(500); return p; };
const p = await page(1440); const ev = (f, a) => p.evaluate(f, a); const w = t => p.waitForTimeout(t);

/* 1. the views bar is complete on the very first page, and a deep link to the dashboard opens it */
ok(await ev(() => !!document.querySelector('.zsub [data-zv="progress"]') && !!document.querySelector('.zsub [data-zv="book"]')), 'the first page drawn has the whole views bar, the dashboard included');
const d = await page(1440, '#/zoom/progress');
ok(await d.evaluate(() => !!document.querySelector('.pg-kpi') && location.hash === '#/zoom/progress'), 'a link straight to the dashboard opens it'); await d.close();

/* 2. search: every topic, chapter and view is found by its own name and comes first */
const S = await ev(() => { const bad = [];
  ZOOM.forEach(z => { const h = searchIdx(z.t)[0]; if (!h || h.type !== 'נושא' || h.t !== z.t) bad.push('topic ' + z.id + ' → ' + (h && h.type + ':' + h.t)); });
  const C = bookCh(); bookOrder().forEach(id => { const t = `פרק ${C[id].n}: ${C[id].t}`, h = searchIdx(t)[0]; if (!h || h.type !== 'פרק' || h.t !== t) bad.push('chapter ' + id + ' → ' + (h && h.t)); });
  ['הספר', 'התקדמות', 'נתיב למידה', 'מפת עולם', 'כל הסימולציות', 'נושאים מרכזיים'].forEach(q => { const h = searchIdx(q)[0]; if (!h || h.type !== 'תצוגה') bad.push('view ' + q + ' → ' + (h && h.type + ':' + h.t)); });
  const lc = searchIdx('לולאת בקרה'), cal = searchIdx('כיול');
  return { bad, n: ZOOM.length + bookOrder().length, lc: lc.length && ['פרק', 'נושא'].includes(lc[0].type), cal: cal.some(h => h.type === 'נושא מרכזי'), sims: SIDX.filter(x => x.type === 'הדמיה').length }; });
ok(!S.bad.length, `every topic, chapter and view is the first hit for its own name (${S.n} names; ${S.bad.slice(0, 4).join(' | ')})`);
ok(S.lc && S.cal, 'a chapter title finds the chapter, and a central subject is found by name');
ok(S.sims >= 100, 'simulations, labs and live figures are in the search by their titles (' + S.sims + ')');

/* opening hits: a topic, a chapter, an old system page, an algorithm page, a simulation */
const hit = async (q, type) => { await ev(([q, type]) => { const h = searchIdx(q).find(x => !type || x.type === type); openHit(h); }, [q, type]); await w(350); return ev(() => ({ hash: location.hash, ch: BV.ch, wins: [...document.querySelectorAll('.zwin')].map(x => x.dataset.w) })); };
let H = await hit('ציר סרבו', 'נושא'); ok(H.hash === '#/zoom/servo', 'a topic hit opens the topic (' + H.hash + ')');
H = await hit('פרק 13', 'פרק'); ok(H.hash.startsWith('#/zoom/book') && H.ch === 'b13', 'a chapter hit opens that chapter (' + H.hash + ' ' + H.ch + ')');
H = await hit('ציר סרבו', 'מערכת'); ok(/^#\/zoom\//.test(H.hash), 'an old system page opens inside the machine tree (' + H.hash + ')');
H = await hit('ריבועים פחותים מאפס', 'התאמה וטרנספורמציה'); ok(/^#\/zoom\//.test(H.hash) && H.wins.includes('p:fit/ls'), 'an algorithm page opens as a window in its topic (' + H.hash + ' ' + H.wins.join(',') + ')');
H = await hit('שולחן הוואקום בתלת-ממד', 'הדמיה'); ok(/^#\/zoom\//.test(H.hash) && H.wins.some(x => x.startsWith('3d:')), 'a 3D lab hit opens the lab in its topic (' + H.wins.join(',') + ')');

/* 3. the book's order on every topic page */
const Q = await ev(() => { const { seq } = zSeq(), bad = []; seq.forEach((id, i) => { const s = zSeqNav(id); if (s.prev !== (seq[i - 1] || null) || s.next !== (seq[i + 1] || null)) bad.push(id); });
  const C = bookCh(), ord = bookOrder(); let last = -1, inv = 0; seq.forEach(id => { const c = ord.findIndex(ch => (C[ch].nodes || []).includes(id)); if (c >= 0) { if (c < last) inv++; last = c; } });
  return { n: seq.length, all: new Set(seq).size === ZOOM.length, bad, inv }; });
ok(Q.all && !Q.bad.length && !Q.inv, `the order of topics follows the book, each topic once (${Q.n}; ${Q.bad.join(',')}; inversions ${Q.inv})`);
await ev(() => go('zoom', 'servo')); await w(300);
const N = await ev(() => ({ top: !!document.querySelector('.zseq [data-sqgo]'), end: document.querySelectorAll('.zseqend [data-sqgo]').length, next: zSeqNav('servo').next, ch: (document.querySelector('.zseq [data-sqch]') || {}).dataset?.sqch }));
ok(N.top && N.end === 2 && N.ch, 'a topic page shows its chapter and the topics before and after it, at the top and at the end');
await p.click('.zseqend .nx'); await w(300);
ok(await ev(n => location.hash === '#/zoom/' + n, N.next), 'the "next in the book" button opens the next topic');
await p.click('.zseq [data-sqch]'); await w(300);
ok(await ev(() => location.hash.startsWith('#/zoom/book') && !!BV.ch), 'the chapter link opens the chapter in the book');

/* 4. the cone of every topic: something to see first, questions in level 5 */
const L = await ev(() => { const noFault = [], noShow = []; ZOOM.forEach(z => { const ws = zWindows(z); if (!ws.some(w => hubOf(w) === 'fault')) noFault.push(z.id); if (!ws.some(w => hubOf(w) === 'show')) noShow.push(z.id); });
  const home = {}; ZOOM.forEach(z => zWindows(z).forEach(w => (home[w] = home[w] || []).push(z.id)));
  return { noFault, noShow, two: Object.entries(home).filter(([, h]) => h.length > 1).map(([w]) => w), pq: Object.keys(PQ_WIN).length }; });
ok(!L.noFault.length, 'every topic has questions in level 5 (' + L.noFault.join(',') + ')');
ok(!L.noShow.length, 'every topic has something to see first, in level 0 (' + L.noShow.join(',') + ')');
ok(!L.two.length, 'still one home per window (' + L.two.join(',') + ')');
await ev(() => { go('zoom', 'resistor'); zOpenWindow('resistor', 'pq:resistor'); }); await w(400);
const PQ = await ev(() => { const s = document.querySelector('.zwin[data-w="pq:resistor"]'); return s ? { items: s.querySelectorAll('.pqlist li').length, btn: !!s.querySelector('[data-pqgo]'), text: s.textContent } : null; });
ok(PQ && PQ.items >= 1 && PQ.btn && !/undefined|NaN/.test(PQ.text), 'a practice window lists its questions and has a button (' + JSON.stringify(PQ && { i: PQ.items, b: PQ.btn }) + ')');
await p.click('.zwin[data-w="pq:resistor"] [data-pqgo]'); await w(400);
ok(await ev(() => location.hash.startsWith('#/zoom/path') && !!PV.sess), 'its button starts a practice session on that topic');

/* 5. page windows say what they open */
const PC = await ev(() => { const ws = [...new Set(ZOOM.flatMap(zWindows))].filter(w => WIN.of(w).id === 'pagecard'), bad = [];
  ws.forEach(w => { const el = document.createElement('div'); zMount(w, el); const t = el.textContent; if (/חלון קיים בגודל עמוד/.test(t) || !el.querySelector('.zpgcard b') || el.querySelector('.zpgcard b').textContent.trim().length < 3 || !el.querySelector('.zgo')) bad.push(w); });
  return { n: ws.length, bad }; });
ok(PC.n >= 60 && !PC.bad.length, `every page window names its page and opens it (${PC.n}; ${PC.bad.slice(0, 4).join(',')})`);

/* 6. the frame: one tab is no tab bar, the theme button says what it does */
await ev(() => go('zoom')); await w(200);
const F = await ev(() => { const n = document.querySelector('nav.sheets'), a = getComputedStyle(n).display; go('qb'); const b2 = getComputedStyle(n).display; go('zoom'); return { a, b2 }; });
ok(F.a === 'none' && F.b2 !== 'none', 'the tab bar is hidden where the place has one page and shown where it has several (' + JSON.stringify(F) + ')');
const T = await ev(() => { const b = document.getElementById('themeBtn'), t1 = b.textContent; b.click(); const t2 = b.textContent; b.click(); return [t1, t2, b.textContent]; });
ok(T[0] !== T[1] && T[0] === T[2] && /מצב (כהה|בהיר)/.test(T[0]), 'the theme button names the mode it switches to (' + T.join(' / ') + ')');

/* 7. the learning path follows the book's order inside every track */
const P = await ev(() => { const C = bookCh(), ord = bookOrder(), chOf = {}; ord.forEach((c, i) => (C[c].nodes || []).forEach(n => { if (chOf[n] === undefined) chOf[n] = i; }));
  return PTRACKS.map(t => { let inv = 0; t.stages.forEach((s, i) => t.stages.slice(i + 1).forEach(s2 => { if (chOf[s] !== undefined && chOf[s2] !== undefined && chOf[s] > chOf[s2]) inv++; })); return [t.id, inv]; }).filter(x => x[1]); });
ok(!P.length, 'every track of the learning path follows the book (' + JSON.stringify(P) + ')');

/* 8. a phone: the description folds away, the views bar is one row, nothing wider than the screen */
const m = await page(390);
const M = await m.evaluate(() => { const bar = document.querySelector('.zsub'), r = [...bar.querySelectorAll(':scope > button')].filter(b => getComputedStyle(b).display !== 'none').map(b => Math.round(b.getBoundingClientRect().top));
  return { rows: Math.max(...r) - Math.min(...r) < 12 ? 1 : 2, spread: Math.max(...r) - Math.min(...r), desc: getComputedStyle(document.querySelector('header.top > div > p:not(.byline)')).display, over: document.documentElement.scrollWidth - innerWidth }; });
ok(M.rows === 1 && M.desc === 'none' && M.over <= 0, 'phone: the views bar is one row, the description folds away, nothing is wider than the screen (' + JSON.stringify(M) + ')');
await m.evaluate(() => go('zoom', 'servo')); await m.waitForTimeout(300);
const MW = await m.evaluate(() => ({ doc: document.documentElement.scrollWidth - innerWidth, main: Math.round(document.querySelector('.zmain').getBoundingClientRect().width), hub: Math.round((document.querySelector('#hubpanel') || document.querySelector('.zmain')).getBoundingClientRect().width), vw: innerWidth }));
ok(MW.doc <= 0 && MW.main <= MW.vw && MW.hub <= MW.vw, 'phone: a topic page and its windows are no wider than the screen (' + JSON.stringify(MW) + ')');

ok(!errs.length, 'no script errors: ' + errs.slice(0, 3).join(' | '));
await b.close();
console.log(`find: ${checks} checks`);
if (problems.length) { console.log('PROBLEMS (' + problems.length + ')'); problems.forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL FIND CHECKS PASSED');
