// Process simulators: structure of every topic (steps, quiz, fault trees) and a walk through the UI to every leaf.
import { createRequire } from 'module'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const INDEX = url.pathToFileURL(path.join(ROOT, 'index.html')).href;
const problems = []; let n = 0; const ok = (c, msg) => { n++; if (!c) problems.push(msg); };
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1200, height: 900 } });
pg.on('pageerror', e => problems.push('js error: ' + e.message));
await pg.goto(INDEX + '#/topic'); await pg.waitForTimeout(500);
const topics = await pg.evaluate(() => TOPICS.map(t => ({ id: t.id, steps: t.steps, quiz: t.quiz, faults: t.faults, mathN: t.math().length, deep: t.deep })));
for (const T of topics) {
  ok(T.steps.length >= 4, `${T.id}: at least 4 steps`);
  T.steps.forEach(s => ok(s.t && s.what && s.why && s.num && s.check && s.dur > 0 && s.lead, `${T.id}/${s.id}: step has title, what, why, number, check, duration, lead`));
  T.quiz.forEach(([q, o, a, why], i) => ok(q && o.length >= 2 && a >= 0 && a < o.length && why, `${T.id} quiz ${i + 1}: answer index valid`));
  ok(T.mathN >= 1, `${T.id}: has a math level`);
  for (const F of T.faults) {
    ok(T.steps.some(s => s.id === F.step), `${T.id}/${F.id}: fault points to a real step`);
    ok(F.nodes[F.start], `${T.id}/${F.id}: start node exists`);
    const seen = new Set(), stack = [[F.start, []]];
    while (stack.length) { const [id, trail] = stack.pop(); const nd = F.nodes[id]; if (!nd) { problems.push(`${T.id}/${F.id}: missing node ${id}`); continue; }
      if (trail.includes(id)) { problems.push(`${T.id}/${F.id}: cycle at ${id}`); continue; } seen.add(id);
      if (nd.leaf) ok(nd.fix && nd.pr, `${T.id}/${F.id}/${id}: leaf has cause, fix and principle`); else { ok(nd.q && nd.o.length >= 2, `${T.id}/${F.id}/${id}: question with 2+ options`); nd.o.forEach(([, to]) => stack.push([to, [...trail, id]])); } }
    Object.keys(F.nodes).forEach(id => ok(seen.has(id), `${T.id}/${F.id}: node ${id} is reachable`));
  }
  for (const [r] of T.deep) ok(await pg.evaluate(r => { try { routeGo(r); return content.textContent.length > 200; } catch (e) { return false; } }, r), `${T.id}: deep link ${r} opens`);
  /* UI: every step, play, again; every level */
  await pg.evaluate(id => { TSTATE.lvl = 'see'; go('topic', id); }, T.id); await pg.waitForTimeout(200);
  for (let i = 0; i < T.steps.length; i++) { await pg.click(`[data-s="${i}"]`); ok(await pg.evaluate(i => document.querySelector(`[data-s="${i}"]`).getAttribute('aria-current') === 'step' && document.getElementById('tsr').textContent.includes(TOPICS.find(x => x.id === TSTATE.topic).steps[i].t), i), `${T.id}: step ${i + 1} shows its narration`); }
  await pg.click('#tsAgain'); await pg.waitForTimeout(300); ok(await pg.evaluate(() => document.querySelector('[data-s="0"]').getAttribute('aria-current') === 'step'), `${T.id}: replay starts from step 1`);
  /* quiz: right answer says correct */
  await pg.click('[data-l="ask"]');
  for (let i = 0; i < T.quiz.length; i++) { await pg.click(`.tq[data-q="${i}"] [data-o="${T.quiz[i][2]}"]`); ok(await pg.evaluate(i => document.querySelector(`.tq[data-q="${i}"] .tqr`).textContent.startsWith('נכון'), i), `${T.id} quiz ${i + 1}: the right answer is marked right`); }
  /* faults: walk to every leaf by clicking */
  for (const F of T.faults) {
    const leaves = []; const walk = (id, clicks) => { const nd = F.nodes[id]; if (nd.leaf) leaves.push([id, clicks]); else nd.o.forEach(([, to], j) => walk(to, [...clicks, j])); }; walk(F.start, []);
    for (const [leaf, clicks] of leaves) {
      await pg.evaluate(([fid]) => { TSTATE.lvl = 'fault'; TSTATE.fault = fid; TSTATE.node = null; TSTATE.path = []; showTopic(TSTATE.topic); }, [F.id]);
      for (const j of clicks) await pg.click(`#tl [data-j="${j}"]`);
      ok(await pg.evaluate(t => { const c = document.getElementById('tl').cloneNode(true); c.querySelectorAll('.gdef').forEach(x => x.remove()); return c.textContent.replace(/\s+/g, ' ').includes(t); }, F.nodes[leaf].leaf.slice(0, 20)), `${T.id}/${F.id}: clicking reaches leaf ${leaf}`);
      await pg.click('#tfNorm'); await pg.waitForTimeout(150);
      const si = T.steps.findIndex(s => s.id === F.step);
      ok(await pg.evaluate(si => document.querySelector(`[data-s="${si}"]`)?.getAttribute('aria-current') === 'step', si), `${T.id}/${F.id}/${leaf}: "see the normal step" opens step ${si + 1}`);
    }
  }
  await pg.click('[data-l="math"]'); ok(await pg.evaluate(() => document.querySelectorAll('#tl math').length >= 4), `${T.id}: math level renders MathML`);
}
/* servo model: the normal case and each fault preset really shows what its leaf says */
{ const r = await pg.evaluate(() => { const ring = s => { let n = 0; for (let i = 1; i < s.t.length; i++) if (s.t[i] > 0.75 && Math.sign(s.e[i]) !== Math.sign(s.e[i - 1])) n++; return n; };
    const f = o => { const s = svSim(o); return { fin: Math.abs(s.final - SV.L), emax: s.emax, ovs: s.overshoot, alarm: s.alarm, ring: ring(s), eAcc: s.eAcc }; };
    return { n: f({}), pd: f({ Ki: 0, T: 0.2 }), sat: f({ Fmax: 12 }), low: f({ Kp: 2.5e4, Kd: 400, Ki: 0 }), enc: f({ encSign: -1 }), fric: f({ fric: 150 }), osc: f({ Kp: 8e5, Kd: 0 }), ki: f({ Ki: 2e7 }), heavy: f({ m: 15 }) }; });
  ok(!r.n.alarm && r.n.fin < 2e-6, 'servo normal: no alarm, ends within 2 µm of the target');
  { const want = (5 * 2 + 20 * 2 * 0.06) / 2e5; ok(Math.abs(r.pd.eAcc - want) < 2e-6, `servo PD: error at t = 0.06 s ≈ (m·a + b·v)/Kp = ${(want * 1e6).toFixed(1)} µm (got ${(r.pd.eAcc * 1e6).toFixed(1)})`); }
  ok(r.sat.alarm, 'servo preset: force limit below the need gives a following-error alarm'); ok(r.low.alarm, 'servo preset: low gain gives a following-error alarm');
  ok(r.enc.alarm && r.enc.emax > 0.05, 'servo preset: reversed encoder runs away'); ok(r.fric.alarm, 'servo preset: mechanical drag gives a following-error alarm');
  ok(r.osc.ring > 20 && r.n.ring === 0, 'servo preset: high gain without D keeps ringing; normal does not'); ok(r.ki.ring > r.n.ring + 10, 'servo preset: too much I keeps it swinging around the target');
  ok(r.heavy.ovs > 1.5 * r.n.ovs, 'servo preset: heavier load overshoots more');
  /* vacuum and safety models: each preset shows what its leaf says */
  const vs = await pg.evaluate(() => ({ n: vacCalc(), bare: vacCalc({ C: 3 }), air: vacCalc({ S: 0 }), seal: vacCalc({ C: 0.4 }), filt: vacCalc({ S: 0.4 }),
    run: safeLogic({ estop: true, door: true, latched: true, edm: true }), open: safeLogic({ estop: true, door: false, latched: true, edm: true }), cut: safeLogic({ estop: true, door: true, latched: true, edm: true, cut2: true }), weld: safeLogic({ estop: true, door: true, latched: true, edm: false }), unl: safeLogic({ estop: true, door: true, latched: false, edm: true }), stop: stopCalc() }));
  ok(vs.n.reach && vs.n.tth < 3, 'vacuum normal: reaches −60 kPa within 3 s'); ok(!vs.bare.reach, 'vacuum preset: an uncovered zone never reaches the threshold'); ok(!vs.air.reach, 'vacuum preset: no supply air never reaches the threshold');
  ok(vs.seal.reach && vs.seal.tth > 1.5 * vs.n.tth, 'vacuum preset: a seal leak reaches it, but slower'); ok(vs.filt.tth > 2 * vs.n.tth, 'vacuum preset: a clogged filter is much slower');
  ok(vs.run.out && !vs.open.out && !vs.cut.out && vs.cut.disc && !vs.weld.out && !vs.unl.out && vs.unl.ready, 'safety logic: runs only with both channels, EDM and reset; discrepancy and welded contactor block; closing the door alone does not restart');
  ok(Math.abs(vs.stop.s - 0.045) < 1e-9, 'safety: stopping distance 45 mm at 0.5 m/s');
  /* the learning model: map, predictions, checks, self-explanation, faults in three grades, integration, review */
  const L2 = await pg.evaluate(() => TOPICS.map(T => ({ id: T.id, where: T.where, lit: T.lit, preds: T.steps.filter(s => s.pred).map(s => [s.id, s.pred]), checks: T.checks, explain: T.explain, solo: T.faults.map(f => [f.id, f.solo, Object.keys(f.nodes)]), integ: T.integ, ids: TOPICS.map(x => x.id) })));
  for (const X of L2) {
    ok(X.where && X.lit && X.lit.length, `${X.id}: has "where in the machine" and lit blocks`);
    ok(X.preds.length >= 2, `${X.id}: at least 2 predictions`); X.preds.forEach(([sid, [q, o, a, w]]) => ok(q && a >= 0 && a < o.length && w, `${X.id}/${sid}: prediction answer valid`));
    ['see', 'eng', 'math'].forEach(l => { const c = X.checks && X.checks[l]; ok(c && c[2] >= 0 && c[2] < c[1].length && c[3], `${X.id}: retrieval check at the end of "${l}"`); });
    ok(X.explain && X.explain[0] && X.explain[1], `${X.id}: self-explanation prompt and model answer`);
    X.solo.forEach(([fid, s, keys]) => ok(s && s[0] && keys.includes(s[1]), `${X.id}/${fid}: on-your-own observations and a real answer leaf`));
    ok(X.integ && X.integ[2] >= 0 && X.integ[2] < X.integ[1].length && X.integ[4].every(id => X.ids.includes(id)), `${X.id}: integration question links real topics`);
  }
  const rv = await pg.evaluate(() => { const now = 1e12, a = reviewNext(null, true, now), b = reviewNext(a, true, now), c = reviewNext(b, false, now);
    const il = interleave([['a1', { id: 'a' }], ['a2', { id: 'a' }], ['b1', { id: 'b' }], ['c1', { id: 'c' }], ['b2', { id: 'b' }]]).map(x => x[0]);
    const d = { 'aoi:q:0': { box: 1, due: now - 1 }, 'aoi:q:1': { box: 2, due: now + 1 } };
    return { a, b, c, il, due: reviewDue(now, d).map(x => x[0]) }; });
  ok(rv.a.box === 1 && rv.a.due === 1e12 + 86400000, 'review: first right answer → box 1, due in 1 day'); ok(rv.b.box === 2 && rv.b.due === 1e12 + 3 * 86400000, 'review: second → box 2, due in 3 days');
  ok(rv.c.box === 1, 'review: a miss goes back to box 1'); ok(rv.il.join() === 'a1,b1,c1,a2,b2', 'review: questions interleave between topics');
  ok(rv.due.length === 1 && rv.due[0] === 'aoi:q:0', 'review: only due questions are offered');
  /* UI of the new levels on every topic */
  for (const X of L2) {
    await pg.evaluate(id => { TSTATE.lvl = 'map'; TSTATE.fault = null; go('topic', id); }, X.id); await pg.waitForTimeout(150);
    ok(await pg.evaluate(() => document.querySelectorAll('#tl svg rect').length >= 8), `${X.id}: machine map renders`);
    for (const l of ['eng', 'integ', 'review']) { await pg.click(`[data-l="${l}"]`); await pg.waitForTimeout(100); ok(await pg.evaluate(() => document.getElementById('tl').textContent.length > 80), `${X.id}: level ${l} renders`); }
    await pg.click('[data-l="integ"]'); await pg.click(`#ig [data-o="${X.integ[2]}"]`); ok(await pg.evaluate(() => document.querySelector('#ig .tqr').textContent.startsWith('נכון')), `${X.id}: integration right answer marked right`);
    for (const [fid, s] of X.solo) {
      await pg.evaluate(f => { TSTATE.lvl = 'fault'; TSTATE.fault = f; TSTATE.node = null; TSTATE.path = []; FGRADE = 'worked'; showTopic(TSTATE.topic); }, fid);
      ok(await pg.evaluate(() => document.querySelectorAll('#tl ol.worked li').length >= 1), `${X.id}/${fid}: worked example shows the path`);
      await pg.click('[data-g="solo"]'); await pg.click(`[data-leaf="${s[1]}"]`); ok(await pg.evaluate(() => document.querySelector('#tl .tqr').textContent.startsWith('נכון')), `${X.id}/${fid}: on-your-own right cause marked right`);
      await pg.evaluate(() => { FGRADE = 'guided'; });
    }
  }
  /* AOS plan and bring-up models */
  const q = await pg.evaluate(() => ({ ok: aosPlan(), one: (() => { const r = aosPlan({ E: 4 }); return r.Dc >= AP.W; })(), dz: aosPlan({ dz: 350 }), off: aosPlan({ off: 3.5 }), weak: aosPlan({ loss: 0.3 }), burn: aosPlan({ E: 14, N: 20 }), drop: buDrop(), dropBad: buDrop({ len: 25, A: 0.5 }), rep: buRepeat(), drift: buRepeat(7, 6) }));
  ok(q.ok.ok && q.ok.n === 2, 'AOS normal plan: 2 spots clear the 10 µm short without damage'); ok(!q.one, 'AOS: one 4 µJ spot does not clear 10 µm');
  ok(!q.dz.cleared, 'AOS preset: defocus leaves copper'); ok(!q.off.cleared, 'AOS preset: camera-laser offset leaves copper on one side'); ok(!q.weak.cleared, 'AOS preset: weak laser leaves copper'); ok(q.burn.damage, 'AOS preset: too much energy damages the laminate');
  ok(q.drop.ok && Math.abs(q.drop.dV - 1.4) < 0.01, 'bring-up: 10 m × 0.75 mm² at 3 A drops 1.4 V, OK'); ok(!q.dropBad.ok, 'bring-up preset: 25 m × 0.5 mm² is below 21.6 V');
  ok(q.rep.pass, 'bring-up: the example repeatability passes ±2 µm'); ok(!q.drift.pass, 'bring-up preset: 6 µm thermal drift fails');
  /* every leaf with a fault simulation opens it without errors */
  for (const T of topics) for (const F of T.faults) for (const [id, nd] of Object.entries(F.nodes)) if (nd.sim) {
    await pg.evaluate(([tid, fid, id]) => { TSTATE.topic = tid; TSTATE.lvl = 'fault'; TSTATE.fault = fid; TSTATE.node = id; TSTATE.path = []; showTopic(tid); }, [T.id, F.id, id]);
    await pg.click('#tfSim'); await pg.waitForTimeout(150);
    ok(await pg.evaluate(() => !!document.getElementById('tsNormal') && !!document.getElementById('tsc')), `${T.id}/${F.id}/${id}: "run with the fault" opens the simulation in fault mode`);
    await pg.click('#tsNormal');
  } }
await b.close();
console.log(`topics: ${topics.length} topics, ${n} checks`);
if (problems.length) { console.log('PROBLEMS'); problems.slice(0, 60).forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL TOPIC CHECKS PASSED');
