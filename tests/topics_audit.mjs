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
  for (let i = 0; i < T.steps.length; i++) { await pg.click(`[data-s="${i}"]`); ok(await pg.evaluate(i => document.querySelector(`[data-s="${i}"]`).getAttribute('aria-current') === 'step' && document.getElementById('tsr').textContent.includes(TOPICS[0].steps[i].t), i), `${T.id}: step ${i + 1} shows its narration`); }
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
      ok(await pg.evaluate(t => document.getElementById('tl').textContent.includes(t), F.nodes[leaf].leaf.slice(0, 20)), `${T.id}/${F.id}: clicking reaches leaf ${leaf}`);
      await pg.click('#tfNorm'); await pg.waitForTimeout(150);
      const si = T.steps.findIndex(s => s.id === F.step);
      ok(await pg.evaluate(si => document.querySelector(`[data-s="${si}"]`)?.getAttribute('aria-current') === 'step', si), `${T.id}/${F.id}/${leaf}: "see the normal step" opens step ${si + 1}`);
    }
  }
  await pg.click('[data-l="math"]'); ok(await pg.evaluate(() => document.querySelectorAll('#tl math').length >= 4), `${T.id}: math level renders MathML`);
}
await b.close();
console.log(`topics: ${topics.length} topics, ${n} checks`);
if (problems.length) { console.log('PROBLEMS'); problems.slice(0, 60).forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL TOPIC CHECKS PASSED');
