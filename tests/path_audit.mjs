// The learning path: every topic once in exactly one track, every stage has cards that exist, sessions follow the rules
// (three lives, a miss comes back once, spaced repetition shared with the review tab), unlocking, crowns, streak, the syllabus
// plan, the central subjects, and the screens (map, syllabus, daily session, play, result) with no script errors.
import { createRequire } from 'module'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 420, height: 900 } }); const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.goto(url.pathToFileURL(path.join(ROOT, 'index.html')).href + '#/zoom/path'); await pg.waitForTimeout(500);
const P = []; let n = 0; const ok = (c, m) => { n++; if (!c) P.push(m); };
const ev = f => pg.evaluate(f);
/* structure: the tracks partition the topics; the central subjects point at topics and cards that exist */
const S = await ev(() => { const own = {}; PTRACKS.forEach(t => t.stages.forEach(s => (own[s] = own[s] || []).push(t.id)));
  return { dup: Object.entries(own).filter(([, v]) => v.length > 1).map(x => x[0]), missing: ZOOM.map(z => z.id).filter(id => !own[id]), unknown: Object.keys(own).filter(id => !zNode(id)),
    tracks: PTRACKS.length, central: PCENTRAL.length, stages: Object.keys(pathStages()).length,
    badNode: PCENTRAL.flatMap(c => c.items.flatMap(i => i.nodes.filter(x => !zNode(x)))), badQ: PCENTRAL.flatMap(c => c.items.flatMap(i => i.q.filter(x => !pathQB(x)))).concat(Object.values(PQMAP).flatMap(s => s.split(' ').filter(x => !pathQB(x)))),
    ids: new Set(Object.keys(pathStages())).size, low: Object.keys(pathStages()).filter(id => pathCards(id).length < 2), cards: Object.keys(pathStages()).reduce((a, id) => a + pathCards(id).length, 0),
    dupIds: Object.keys(pathStages()).filter(id => { const c = pathCards(id).map(x => x.id); return new Set(c).size !== c.length; }),
    mcBad: Object.keys(pathStages()).flatMap(id => pathCards(id).filter(c => c.k === 'mc' && (!Array.isArray(c.o) || c.o.length < 2 || !(c.a >= 0 && c.a < c.o.length))).map(c => c.id)),
    empty: Object.keys(pathStages()).flatMap(id => pathCards(id).filter(c => !c.q || !c.q.trim() || (c.k === 'recall' && !c.a)).map(c => c.id)) }; });
ok(S.dup.length === 0, 'a topic is in two tracks: ' + S.dup); ok(S.missing.length === 0, 'topics in no track: ' + S.missing); ok(S.unknown.length === 0, 'unknown topics in tracks: ' + S.unknown);
ok(S.tracks === 6 && S.central === 4, 'six tracks and four central subjects'); ok(S.stages === S.ids && S.stages >= 58, 'every stage has its own id (' + S.stages + ')');
ok(S.badNode.length === 0, 'central items point at missing topics: ' + S.badNode); ok(S.badQ.length === 0, 'cards that do not exist: ' + S.badQ);
ok(S.low.length === 0, 'stages with fewer than two cards: ' + S.low); ok(S.dupIds.length === 0, 'repeated card ids in a stage: ' + S.dupIds);
ok(S.mcBad.length === 0, 'multiple-choice cards with a bad answer index: ' + S.mcBad); ok(S.empty.length === 0, 'cards with no question or answer: ' + S.empty.slice(0, 5));
/* the fault cards: the right leaf is among the options exactly once */
const F = await ev(() => { const bad = []; let n = 0; Object.keys(pathStages()).forEach(id => pathCards(id).filter(c => c.id.includes(':f:')).forEach(c => { n++; if (new Set(c.o).size !== c.o.length || c.o.length < 3) bad.push(c.id); })); return { n, bad }; });
ok(F.n >= 20 && F.bad.length === 0, `fault cards: ${F.n} asked as "what is the cause", options distinct (${F.bad})`);
/* the SRS is shared with the review tab: a topic card answered on the path lands in the same store, under the same id */
const R = await ev(() => { localStorage.clear(); const st = pathSession('stage', 'servo', 1e12, 'x'), c = st.items[0].c; pathAnswer(st, true); const d = reviewLoad(); return { id: c.id, box: d[c.id] && d[c.id].box, due: d[c.id] && d[c.id].due - 1e12 }; });
ok(R.box === 1 && R.due === 86400000, 'a correct card goes to box 1 and returns in a day (' + JSON.stringify(R) + ')');
/* a session: six cards, three lives, a miss comes back once and costs a life, three misses end it */
const T = await ev(() => { localStorage.clear(); const now = 1e12, a = pathSession('stage', 'servo', now, 's'), b = pathSession('stage', 'servo', now, 's'), c = pathSession('stage', 'servo', now, 'other');
  const same = a.items.map(x => x.c.id).join() === b.items.map(x => x.c.id).join(), diff = a.items.map(x => x.c.id).join() !== c.items.map(x => x.c.id).join();
  const first = a.items[0].c.id; pathAnswer(a, false); const back = a.items[a.items.length - 1]; const lives1 = a.lives, len1 = a.items.length, retryOk = back.retry && back.c.id === first;
  const box = reviewLoad()[first].box; pathAnswer(a, false); pathAnswer(a, false);
  return { n: pathSession('stage', 'servo', now, 's').items.length, same, diff, lives1, len1, retryOk, box, failed: a.failed, done: a.done, lives: a.lives }; });
ok(T.n === 6 && T.same && T.diff, 'a session is six cards, the same for the same day and stage, different for another seed');
ok(T.lives1 === 2 && T.len1 === 7 && T.retryOk, 'a miss costs a life and the card returns once at the end'); ok(T.box === 1, 'a miss puts the card in box 1');
ok(T.failed && T.done && T.lives === 0, 'three misses end the session');
const T2 = await ev(() => { localStorage.clear(); const s = pathSession('stage', 'servo', 1e12, 'r'); const n0 = s.items.length; pathAnswer(s, false); const retry = s.items.length; while (!s.done) { s.items[s.i].retry ? pathAnswer(s, true) : pathAnswer(s, true); } return { n0, retry, failed: s.failed, right: s.right, xp: s.xp, mistakes: s.mistakes }; });
ok(!T2.failed && T2.mistakes === 1 && T2.right === 6 && T2.xp === 5 * 10 + 5, 'one miss then all right: finishes, 50 xp for the first-time cards and 5 for the retry (' + JSON.stringify(T2) + ')');
/* unlocking, crowns, xp, streak */
const U = await ev(() => { localStorage.clear(); const day = 24 * 3600 * 1000, t0 = new Date(2026, 5, 10, 12).getTime(); let P = pathLoad(); const first = PTRACKS[0].stages[0], second = PTRACKS[0].stages[1], third = PTRACKS[0].stages[2];
  const o = { l1: pathOpen(P, first), l2: pathOpen(P, second) }; 
  let r = pathApply(P, { mode: 'stage', stage: first, xp: 60, mistakes: 0, failed: false }, t0); P = r.P; o.xp1 = r.xp; o.crown = pathCrowns(P, first); o.open2 = pathOpen(P, second); o.streak1 = P.streak;
  r = pathApply(P, { mode: 'stage', stage: first, xp: 30, mistakes: 2, failed: true }, t0 + 100); P = r.P; o.failedNoCrown = pathCrowns(P, first) === 1; o.sameDay = P.streak;
  r = pathApply(P, { mode: 'skip', stage: third, xp: 50, mistakes: 0, failed: false }, t0 + day); P = r.P; o.skip = pathOpen(P, third) && pathCrowns(P, third) === 1; o.streak2 = P.streak; o.dxp = P.dxp;
  r = pathApply(P, { mode: 'stage', stage: first, xp: 0, mistakes: 0, failed: false }, t0 + 4 * day); P = r.P; o.streakBroken = P.streak; o.best = P.best;
  for (let i = 0; i < 5; i++) P = pathApply(P, { mode: 'stage', stage: first, xp: 0, mistakes: 0, failed: false }, t0 + 5 * day).P; o.max = pathCrowns(P, first);
  const free = Object.assign(pathDefault(), { mode: 'open' }); o.free = pathOpen(free, PTRACKS[0].stages[5]);
  const D = pathApply(pathDefault(), { mode: 'daily', stage: null, xp: 20, mistakes: 0, failed: false }, t0); o.daily = D.passed === false && D.xp === 20;
  return o; });
ok(U.l1 && !U.l2, 'the first stage of a track is open and the second is locked'); ok(U.xp1 === 90 && U.crown === 1 && U.open2 && U.streak1 === 1, 'a clean pass: 60 + 20 + 10 xp, one crown, the next stage opens, streak 1');
ok(U.failedNoCrown && U.sameDay === 1, 'a failed session gives no crown, and a second session the same day does not raise the streak');
ok(U.skip && U.streak2 === 2, 'a skip test opens a locked stage with a crown; the next day raises the streak'); ok(U.streakBroken === 1 && U.best === 2, 'a missed day resets the streak and keeps the best');
ok(U.max === 3, 'crowns stop at three'); ok(U.free, 'free mode opens every stage'); ok(U.daily, 'a daily session gives xp but no crown');
/* the daily session: due cards from started stages come first, then new cards from the next stage of each track */
const Dd = await ev(() => { localStorage.clear(); const now = 1e12; let P = pathLoad(); const none = pathDailyItems(P, now, reviewLoad(), 'd');
  const s = PTRACKS[0].stages[0]; P = pathApply(P, { mode: 'stage', stage: s, xp: 0, mistakes: 0, failed: false }, now).P; pathSave(P); const cards = pathCards(s).slice(0, 3); cards.forEach(c => reviewRecord(c.id, true, now - 3 * 86400000));
  const items = pathDailyItems(P, now, reviewLoad(), 'd'), due = items.slice(0, 3).map(x => x.c.id), stagesFresh = new Set(items.slice(3).map(x => x.stage));
  return { none: none.length, n: items.length, dueFirst: cards.every(c => due.includes(c.id)), fresh: [...stagesFresh], state: pathState(P, s, now, reviewLoad()), unique: new Set(items.map(x => x.c.id + x.stage)).size === items.length }; });
ok(Dd.none === 10 && Dd.n === 10 && Dd.unique, 'the daily session has ten cards, new cards from the first stage of every open track'); ok(Dd.dueFirst, 'due cards come first'); ok(Dd.state === 'refresh', 'a crowned stage with due cards shows refresh');
/* the syllabus */
const Y = await ev(() => { const P = pathDefault(), w = pathPlan(['el', 'mo'], 2, P), flat = w.flat(), per = pathPlan(['el', 'ci', 'mo', 'op', 'sa', 'sy', 'cal', 'noise', 'heat', 'fa'], 3, P).flat();
  const all = Object.keys(pathStages()).length; const P2 = pathDefault(); P2.st.resistor = { c: 1 };
  return { first: w[0], len: w.length, flat: flat.length, perAll: per.length === all && new Set(per).size === all, skipDone: !pathPlan(['el'], 3, P2).flat().includes('resistor'), order: flat.indexOf('resistor') < flat.indexOf('source') && flat.indexOf('motor') < flat.indexOf('enc') }; });
ok(Y.first.length === 2 && Y.first[0] === 'resistor' && Y.first[1] === 'motor', 'a week deals one stage from each chosen track in parallel'); ok(Y.flat === 17 && Y.perAll, 'the plan covers every stage once'); ok(Y.skipDone && Y.order, 'passed stages are not planned again and each track keeps its order');
/* the screens */
await ev(() => { localStorage.clear(); go('zoom', 'path'); }); await pg.waitForTimeout(200);
const M = await ev(() => ({ st: document.querySelectorAll('.pth-st').length, locked: document.querySelectorAll('.pth-locked').length, tracks: document.querySelectorAll('.pth-track').length, bar: !!document.querySelector('.zsub [data-zv="path"]'), cb: !!document.querySelector('.zsub [data-zv="central"]') }));
ok(M.st === 58 && M.tracks === 10 && M.locked === 58 - 10, 'the map shows 58 stages in ten tracks; only the first of each track is open (' + JSON.stringify(M) + ')'); ok(M.bar && M.cb, 'the views bar offers the path and the central subjects');
const noH = await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1); ok(noH, 'no horizontal scroll at phone width');
await pg.click('[data-st="resistor"]'); await pg.waitForTimeout(100);
ok(await ev(() => !!document.querySelector('.pth-panel [data-play="resistor"]') && !!document.querySelector('.pth-panel [data-open]')), 'an open stage offers reading and practice');
await pg.click('[data-st="source"]'); await pg.waitForTimeout(100);
ok(await ev(() => !!document.querySelector('.pth-panel [data-skip="source"]') && !document.querySelector('.pth-panel [data-play]')), 'a locked stage offers only the skip test');
/* play a whole session by clicking, then the result */
await pg.click('[data-st="resistor"]'); await pg.click('[data-play="resistor"]'); await pg.waitForTimeout(100);
let steps = 0, kinds = new Set();
while (steps++ < 20 && await ev(() => !!document.querySelector('.pth-play .pth-q'))) {
  const k = await ev(() => document.querySelector('#pthA [data-o]') ? 'mc' : 'recall'); kinds.add(k);
  if (k === 'mc') await pg.click('#pthA [data-o]'); else { await pg.click('#pthShow'); await pg.click('#pthKnew'); await pg.waitForTimeout(60); continue; }
  await pg.click('#pthNext');
}
const done = await ev(() => ({ h: document.querySelector('.pth-result h2') && document.querySelector('.pth-result h2').textContent, P: pathLoad() }));
ok(!!done.h && done.P.xp > 0 && done.P.st.resistor && done.P.st.resistor.c >= 0, 'a played session ends with a result screen and saves xp (' + done.h + ', xp ' + done.P.xp + ')');
await ev(() => { PV.tab = 'map'; zPathView(); }); await pg.waitForTimeout(100);
ok(await ev(() => !!document.querySelector('.pth-stats')), 'the map comes back after the result');
await pg.click('[data-pt="syl"]'); await pg.waitForTimeout(100); ok(await ev(() => document.querySelectorAll('.pth-plan tbody tr').length > 5), 'the syllabus tab shows a weekly plan');
await pg.click('[data-pt="today"]'); await pg.waitForTimeout(100); ok(await ev(() => !!document.getElementById('pthDaily')), 'the daily tab offers a session');
/* live faults live under the simulations: the gallery has a group for injecting and diagnosing */
await ev(() => { ZG.kind = 'all'; ZG.ctx = 'all'; ZG.q = ''; go('zoom', 'sims'); }); await pg.waitForTimeout(150);
const G = await ev(() => { const all = zSimList(), f = all.filter(s => SIMFAULT.has(s.kind)).length, total = document.querySelectorAll('.simcard').length; document.querySelector('[data-gk="fault"]').click(); const only = document.querySelectorAll('.simcard').length, kinds = [...new Set(zSimList().filter(s => SIMFAULT.has(s.kind)).map(s => s.kind))].sort().join(); document.querySelector('[data-gk="sim"]').click(); const rest = document.querySelectorAll('.simcard').length; ZG.kind = 'all'; return { f, total, only, rest, all: all.length, kinds }; });
ok(G.f >= 18 && G.only === G.f && G.rest === G.all - G.f && G.total === G.all && G.kinds === 'fault,rev', 'the gallery has a live-fault group (' + JSON.stringify(G) + ')');
/* the central page */
await ev(() => go('zoom', 'central')); await pg.waitForTimeout(150);
const C = await ev(() => ({ chips: document.querySelectorAll('[data-cs]').length, items: document.querySelectorAll('.pth-items li').length, first: document.querySelector('.pth-items b').textContent }));
ok(C.chips === 4 && C.items === 7 && /יציבות תרמית/.test(C.first), 'the calibration page lists its seven items in order, starting with thermal stability (' + JSON.stringify(C) + ')');
await pg.click('[data-cs="noise"]'); ok(await ev(() => document.querySelectorAll('.pth-items li').length === 5), 'the noise and grounding page has its five items');
/* authorship rule: no forbidden colours in the new styles */
import fs from 'fs'; const css = fs.readFileSync(path.join(ROOT, 'src/00-shell.html'), 'utf8').split('\n').filter(l => /\.pth-/.test(l)).join(' ').toLowerCase();
ok(!/ff6b35|f7b801/.test(css) && /pth-/.test(css), 'the new styles use the palette only');
await b.close();
if (errs.length) P.push(...errs.map(e => 'js error: ' + e));
console.log(`path: ${S.stages} stages in ${S.tracks} tracks and ${S.central} central subjects, ${S.cards} cards, ${n} checks`);
if (P.length) { console.log('PROBLEMS (' + P.length + ')'); P.slice(0, 40).forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL PATH CHECKS PASSED');
