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
/* v2.46: a live fault injected into the machine's cycle, and the central subjects on the world map */
const MF = await ev(() => { const bad = []; MFAULTS.forEach(f => { const o = mFaultOpts(f.id); if (!zNode(f.node) || o.length !== 4 || new Set(o).size !== 4 || o.filter(x => x === f.cause).length !== 1 || !f.sym || !f.why) bad.push(f.id); }); return { n: MFAULTS.length, aoi: MFAULTS.filter(f => f.m === 'aoi').length, aos: MFAULTS.filter(f => f.m === 'aos').length, bad }; });
ok(MF.n === 7 && MF.aoi === 5 && MF.aos === 2 && MF.bad.length === 0, 'seven live faults, each with a topic, a symptom, an explanation and four distinct options with the cause once (' + JSON.stringify(MF) + ')');
await pg.setViewportSize({ width: 1200, height: 900 });
await ev(() => { FH3D.software = true; go('zoom', 'machine'); }); await pg.waitForTimeout(1200);
const LF = await pg.evaluate(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)), o = {}, txt = r => r.status.replace(/<[^>]+>/g, ''); MS.E = 0; MS.target = 0; MS.assembling = false;
  o.gl = !!MS.gl; if (!MS.gl) return o; o.menu = [...document.getElementById('mFault').options].map(x => x.value).join();
  const P = MS.gl.runPlan(), mid2 = 0.9 + P.passT + 0.55 + P.passT * 0.8, at = (f, t) => { MS.gl.run(false); MS.fault = f; MS.gl.run(true); return MS.gl.runSeek(t); };
  let r = at('', mid2); o.clean = !/⚠/.test(txt(r)) && MS.gl.runFault().fault === null;
  for (const f of ['vac', 'trig', 'strobe', 'backlash']) { r = at(f, mid2); const F = MS.gl.runFault(); o[f] = { warn: /⚠/.test(txt(r)) && F.alarm, lost: F.lost.join(), close: MS.distT < 7 }; }
  r = at('vac', P.total - 1.5); o.vacEnd = /9 חשדות/.test(txt(at('vac', P.total - 1.5 - 0.9)));
  r = at('door', P.total + 5); const D = MS.gl.runFault(); o.door = D.halted && D.alarm && r.prog[1] === 0.5 && r.prog[2] === 0 && !r.lit;
  MS.gl.run(false); o.back = MS.distT === 12;
  MS.fault = 'door'; MS.gl.run(true); MS.gl.runDiag(); const q = document.getElementById('mFaultQ'); o.diag = !!q && q.querySelectorAll('[data-fo]').length === 4;
  const right = [...q.querySelectorAll('[data-fo]')].find(b => b.textContent === MFAULTS.find(f => f.id === 'door').cause); right.click(); o.answer = /נכון/.test(q.querySelector('.mfqr').textContent) && !!q.querySelector('[data-fgo="interlock"]') && reviewLoad()['mf:door'] && reviewLoad()['mf:door'].box === 1;
  MS.gl.run(false); MS.gl.run(true); o.closedOnRun = !document.getElementById('mFaultQ'); MS.gl.run(false);
  MS.fault = 'rand'; const seen = new Set(); for (let i = 0; i < 40; i++) { MS.gl.run(true); seen.add(MS.gl.runFault().fault); o.blind = MS.gl.runFault().blind; MS.gl.run(false); } o.rand = [...seen].every(x => MFAULTS.find(f => f.id === x && f.m === 'aoi')) && seen.size >= 3;
  mSetMachine('aos'); await wait(500); MS.E = 0; o.menuAos = [...document.getElementById('mFault').options].map(x => x.value).join(); o.reset = MS.fault === 'rand';
  MS.fault = 'defocus'; MS.gl.run(true); r = MS.gl.runSeek(1e9); o.defocus = MS.gl.runLabels().join() === 'D1 ✗,D4 ✗,D6 ✗' && r.fixed === 3; MS.gl.run(false);
  MS.fault = 'fid'; MS.gl.run(true); r = MS.gl.runSeek(1e9); o.fid = MS.gl.runFault().halted && r.fixed === 0 && !r.beam && /סימן 2 לא נמצא/.test(txt(r)); MS.gl.run(false);
  mSetMachine('line'); await wait(500); MS.fault = 'trig'; MS.gl.run(true); o.lineTargets = MS.gl.runFault().targets.join() === 'D1,D6'; MS.gl.run(false); MS.fault = ''; mSetMachine('aoi');
  return o; });
ok(LF.gl, 'the machine has its 3D picture for the fault checks');
ok(LF.menu === ',rand,vac,trig,strobe,backlash,door' && LF.menuAos === ',rand,defocus,fid', 'the fault menu offers none, random, and the faults of the machine shown (' + LF.menu + ' / ' + LF.menuAos + ')');
ok(LF.clean, 'without a fault the cycle shows no warning');
ok(['vac', 'trig', 'strobe', 'backlash'].every(f => LF[f] && LF[f].warn && LF[f].close), 'each scan fault shows its symptom in the second pass, in an alarm colour, close to the panel');
ok(LF.trig.lost === 'D4' && LF.strobe.lost === 'D1,D3,D4,D6' && LF.vac.lost === '' && LF.backlash.lost === '', 'missing pulses lose the defect in a gap; a weak strobe loses everything after the first pass; vacuum and backlash lose none');
ok(LF.vacEnd, 'a vacuum leak adds three false calls to the six real ones'); ok(LF.door, 'an open door stops the axes half way through a pass, light off, with an alarm');
ok(LF.back, 'the view returns when the faulty cycle stops'); ok(LF.diag && LF.answer, 'the diagnosis asks for the cause, answers with the explanation and the topic, and records the card');
ok(LF.closedOnRun, 'a new cycle closes the diagnosis'); ok(LF.rand && LF.blind, 'random picks one of the machine’s faults and hides which');
ok(LF.reset, 'switching machine keeps "random"'); ok(LF.defocus, 'defocus: every target fired, copper left on all three'); ok(LF.fid, 'a missing fiducial stops the repair before any shot');
ok(LF.lineTargets, 'on the line, a defect the scan missed is not sent to repair');
const WC = await ev(() => { const L = zLinks(), c = L.filter(e => e.k === 'central'), has = (a, b) => c.some(e => (e.a === a && e.b === b) || (e.a === b && e.b === a)); return { n: c.length, chain: has('bringup', 'enc') && has('enc', 'cam') && has('cam', 'optics') && has('optics', 'reg'), clean: c.every(e => zNode(e.a) && zNode(e.b) && e.a !== e.b) }; });
ok(WC.n >= 15 && WC.chain && WC.clean, 'the world map links the central subjects: calibration runs warm-up, axis, camera, focus, registration (' + WC.n + ' links)');
/* v2.47: the vacuum table and the safety chain run in 3D */
const CL = await ev(() => { let S = Object.assign({}, CHAIN0); const seq = ['reset', 'door', 'reset', 'door', 'reset', 'weld', 'door', 'door', 'reset', 'weld', 'door', 'door', 'reset', 'estop', 'reset'], out = seq.map(e => { S = chainLogic(S, e); return [S.on, S.fault, S.msg].join(':'); }); return out.join(' '); });
ok(CL === 'true:false:run false:false:trip false:false:open false:false:closed true:false:run true:false:run false:false:trip false:false:closed false:true:disc false:true:disc false:true:open false:true:closed true:false:run false:false:trip false:false:open', 'safety chain logic: starts only on Reset with both channels closed; any channel trips it; a welded channel is found at the next Reset and locks it until both channels cycle (' + CL + ')');
await ev(() => { localStorage.clear(); zOpenWindow('vac', '3d:vacuum'); }); await pg.waitForTimeout(1200);
const V3 = await ev(() => { const el = document.querySelector('.fh3dhost'), h = el && el.parentNode.fh3d; if (!h) return { h: false }; const vc = vacCalc(), o = { h: true };
  const a = h.seek(vc.tth - 0.05), b = h.seek(vc.tth + 0.05); o.sw = !a.ok && b.ok && Math.abs(b.tth - vc.tth) < 1e-9 && Math.abs(b.p - vc.P(vc.tth + 0.05)) < 1e-9 && Math.abs(b.F - (VT.patm - b.p) * VT.A) < 1e-9;
  h.set({ small: true }); const c = h.seek(10 * vac3Calc(true, 'all').tau); o.leak = !c.ok && !c.reach && c.open === 2 && c.pss > VT.patm - VT.th && c.alarm;
  h.set({ recipe: 'under' }); const d = h.seek(6); o.fixed = d.ok && d.open === 0 && Math.abs(d.F - (VT.patm - d.p) * VT.A / 2) < 1e-9 && !d.alarm;
  const st = h.getState(); h.setState({ small: false, recipe: 'all' }); o.state = st.small === true && st.recipe === 'under' && h.getState().small === false;
  h.reset(); o.idle = h.state().phase === 'idle' && h.state().dp === 0; return o; });
ok(V3.h, 'the vacuum table window mounts its 3D handle');
ok(V3.sw, 'vacuum 3D: the switch closes at the model’s threshold time, with the model’s pressure and force');
ok(V3.leak, 'vacuum 3D: a small panel with every zone open settles above the threshold, and the machine waits (alarm)');
ok(V3.fixed, 'vacuum 3D: opening only the zones under the panel reaches the threshold; the force is on half the area');
ok(V3.state && V3.idle, 'vacuum 3D: its state is saved and restored, and release returns it to idle');
await ev(() => zOpenWindow('safety', '3d:chain')); await pg.waitForTimeout(1200);
const C3 = await ev(() => { const el = document.querySelector('.fh3dhost'), h = el && el.parentNode.fh3d; if (!h) return { h: false }; const o = { h: true };
  h.event('reset'); let s = h.settle(); o.run = s.on && s.speed === 1 && /STO/.test(document.querySelector('.fh3d-stats').textContent) === false;
  h.event('door'); s = h.settle(); o.trip = !s.on && s.alarm && /40 ms/.test(s.msgText) && /45 mm/.test(s.msgText);
  h.event('door'); h.event('weld'); h.event('reset'); h.event('door'); h.event('door'); s = h.event('reset'); o.disc = s.fault && !s.on && s.alarm;
  const st = h.getState(); h.setState({ logic: CHAIN0 }); o.state = st.logic.fault === true && h.state().fault === false; return o; });
ok(C3.h && C3.run, 'safety chain 3D: Reset starts the drive and the motor turns');
ok(C3.trip, 'safety chain 3D: opening the door trips it, with the stop model’s reaction time (40 ms) and stopping distance (45 mm)');
ok(C3.disc && C3.state, 'safety chain 3D: a welded channel is caught at the next Reset; its state is saved and restored');
ok(await ev(() => ['3d:vacuum', '3d:chain'].every(w => zSimList().some(s => s.w === w) && hubOf(w) === 'show') && zWindows(zNode('vac')).includes('3d:vacuum') && zWindows(zNode('safety')).includes('3d:chain')), 'both are windows of their topics, in the demonstrations, and in the gallery');
/* v2.48: what stays in memory — a measure from retrieval */
const MS2 = await ev(() => { const day = 86400000, now = 1e12, ids = pathCards('servo').map(c => c.id), mk = f => Object.fromEntries(ids.map((id, i) => [id, f(i)])), o = {};
  o.none = pathMastery('servo', now, {}); o.all4 = pathMastery('servo', now, mk(() => ({ box: 4, due: now + 5 * day })));
  o.half = pathMastery('servo', now, mk(i => ({ box: i % 2 ? 4 : 0, due: now + day })).constructor === Object ? mk(i => i % 2 ? { box: 4, due: now + day } : undefined) : {});
  const late = mk(() => ({ box: 3, due: now - 10 * day })); o.late = pathMastery('servo', now, late); const onTime = mk(() => ({ box: 3, due: now - day })); o.onTime = pathMastery('servo', now, onTime);
  o.fc = pathForecast(now, 7, { a: { box: 1, due: now - 1 }, b: { box: 1, due: now + 0.5 * day }, c: { box: 2, due: now + 2.5 * day }, d: { box: 4, due: now + 30 * day } }); return o; });
ok(MS2.none.level === 'new' && MS2.none.m === 0, 'a topic never answered: not started, 0%');
ok(MS2.all4.level === 'master' && MS2.all4.m === 1 && MS2.all4.boxes[4] === MS2.all4.n, 'every card recalled after a week, none due: 100%, held in memory');
ok(MS2.onTime.m === 0.75 && MS2.onTime.level === 'build' && MS2.onTime.due === MS2.onTime.n, 'cards due but within their interval keep their box; with cards due it is not "held"');
ok(MS2.late.m === 0.5 && MS2.late.boxes[2] === MS2.late.n, 'a review late by more than its interval counts one box lower');
ok(MS2.fc.join() === '1,1,0,1,0,0,0', 'the forecast counts cards due today and on each of the next days (' + MS2.fc.join() + ')');
await ev(() => { localStorage.clear(); const now = Date.now(); pathCards('relay').forEach((c, i) => reviewRecord(c.id, i % 2 === 0, now)); PV.sess = null; PV.tab = 'prog'; go('zoom', 'path'); }); await pg.waitForTimeout(200);
const PG = await ev(() => ({ rows: document.querySelectorAll('#pthBody .pth-plan tr').length, fc: document.querySelectorAll('.pth-fc > div').length, weak: [...document.querySelectorAll('[data-wp]')].map(b => b.dataset.wp).join(), bars: document.querySelectorAll('.pth-st .pth-mb').length }));
ok(PG.rows === 10 && PG.fc === 7 && PG.weak.split(',').includes('relay') && PG.weak.split(',').length <= 5, 'the memory tab: a bar per track, seven days of reviews, the weakest started topics (a question-bank card counts in every topic it belongs to) (' + JSON.stringify(PG) + ')');
await ev(() => { PV.tab = 'map'; zPathView(); }); ok(await ev(() => document.querySelectorAll('.pth-st .pth-mb').length === 58), 'every stage on the map shows its retrieval bar');
await ev(() => { PV.tab = 'map'; go('zoom', 'relay'); }); await pg.waitForTimeout(200);
const NP = await ev(() => { const s = document.querySelector('.pth-node'); if (!s) return {}; const t = s.textContent; document.querySelector('[data-npr]').click(); return { t: /נשאר בזיכרון: \d+%/.test(t), play: !!document.querySelector('.pth-play .pth-q') && location.hash.includes('path') }; });
ok(NP.t && NP.play, 'a topic page shows what of it stays in memory, and practising it opens a session');
await ev(() => { PV.sess = null; });
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
