// Syllabus map (stage B). Fails on: a page without a node, layer or goal; a page with more than one activity;
// an activity with no home or two homes; an interactive asset missing from the registry; a question, fault or embedded
// item with no home or two; a node without a showcase that is not flagged as a gap. Writes docs/SYLLABUS_MAP.md.
import { createRequire } from 'module'; import path from 'path'; import url from 'url'; import fs from 'fs';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const b = await chromium.launch(); const pg = await b.newPage(); const jsErr = []; pg.on('pageerror', e => jsErr.push(e.message));
await pg.goto(url.pathToFileURL(path.join(ROOT, 'index.html')).href); await pg.waitForTimeout(400);
const D = await pg.evaluate(() => ({
  layers: SYL_LAYERS, nodes: SYL_NODES, rel: SYL_REL, pages: SYL_PAGES, dev: SYL_DEV, spaces: SYL_SPACES, space: Object.fromEntries(SYL_NODES.map(n => [n.id, sylSpace(n.id)])),
  topics: TOPICS.map(t => ({ id: t.id, t: t.t, faults: t.faults.map(f => ({ id: f.id, t: f.t, solo: !!f.solo })), pred: t.steps.filter(s => s.pred).map(s => s.id), quiz: t.quiz.length, checks: Object.keys(t.checks || {}), integ: !!t.integ, explain: !!t.explain })),
  comps: COMPONENTS.map(c => ({ id: c.id, t: c.name.replace(/<[^>]+>/g, '') })), teach: Object.fromEntries(Object.entries(TEACH).map(([k, v]) => [k, { check: (v.check || []).length, try: (v.try || []).length }])),
  zero: Object.fromEntries(Object.entries(ZERO).map(([k, v]) => [k, (v.check || []).length])), sysx: Object.fromEntries(Object.entries(SYSX).map(([k, v]) => [k, { bench: typeof v.bench === 'string', guided: (v.guided || []).length, t: v.title }])),
  qb: QB.map(q => ({ id: q.id, t: q.t, title: q.title })), qt: QT, scn: SCN.map(s => ({ id: s.id, sys: s.sys, title: s.title })),
  tasks: TASKS.length, stasks: STASKS.length, mtasks: MTASKS.length, s3: Object.keys(FAULTS).filter(k => k !== 'none').length, iv: Object.keys(DRILL).length,
  labtask: { dmm: 4, scope: 6, mot: 3 }, review: reviewPool().length
}));
await b.close();
const P = [], ok = (c, m) => { if (!c) P.push(m); };
const node = Object.fromEntries(D.nodes.map(n => [n.id, n])), layer = Object.fromEntries(D.layers), LORD = D.layers.map(l => l[0]);
/* nodes and relations */
D.nodes.forEach(n => ok(!n.parent || node[n.parent], `node ${n.id}: parent ${n.parent} does not exist`));
D.rel.forEach(([a, r, z]) => ok(node[a] && node[z], `relation ${a} ${r} ${z}: an end does not exist`));
/* the activity registry: every interactive asset that exists today */
const ACT = {};
const add = (id, t, kind) => ACT[id] = { t, kind };
D.topics.forEach(T => { add(`scene:${T.id}`, `סצנת התהליך: ${T.t}`, 'scene'); add(`quiz:${T.id}`, `שאלות הבנה: ${T.t}`, 'quiz'); add(`flow:${T.id}`, `גרף זרימה: ${T.t}`, 'flow'); add(`explain:${T.id}`, `הסבר במילים שלך ופיינמן: ${T.t}`, 'exercise'); add(`rev:${T.id}`, `ניתוק בלוקים: ${T.t}`, 'flow'); add(`integ:${T.id}`, `שאלת אינטגרציה: ${T.t}`, 'question'); T.faults.forEach(f => add(`tree:${T.id}/${f.id}`, `עץ תקלה: ${f.t}`, 'tree')); });
D.comps.forEach(c => add(`bench:${c.id}`, `סימולציית רכיב: ${c.t}`, 'sim'));
Object.entries(D.sysx).forEach(([k, v]) => { if (v.bench) add(`sys:${k}`, `סימולציית מערכת: ${v.t}`, 'sim'); });
[['fig:relay', 'איור חי: MOSFET וממסר'], ['fig:linescan', 'איור חי: טריגר line-scan'], ['fig:aos', 'איור חי: הסרת קצר'], ['sim:mlab', 'מנוע DC'], ['sim:clab', 'ממירים'], ['sim:im3d', 'שדה מסתובב 3D'], ['sim:st3d', 'מנוע צעד 3D'], ['sim:bs3d', 'backlash 3D'], ['sim:scan3d', 'ראש סריקה 3D'], ['sim:cr3d', 'מכתש לייזר 3D'],
  ['lab:dmm', 'מעבדת מולטימטר'], ['lab:scope', 'מעבדת סקופ'], ...['prox', 'photo', 'wire', 'temp', 'bridge', 'hall'].map(s => [`lab:s-${s}`, `מעבדת חיישן ${s}`]), ['lab:ff', 'מעבדת flip-flops'], ['lab:cnt', 'מעבדת מונים'], ['lab:board', 'כרטיס לדוגמה'], ['lab:schset', 'סט שרטוטים'], ['lab:decode', 'מפענחי ערכים'], ['lab:symquiz', 'חידון סמלים'], ['lab:mechdrill', 'תרגול שרטוט מכני'], ['lab:s3', 'מכונה משולבת'], ['lab:challenge', 'ציד תקלות'], ['lab:qb', 'מבחן טכני'], ['lab:review', 'חזרה מפוזרת'],
  ...['dcmotor', '3motor', 'motorprotect', 'buck', 'boost', 'xfmr', 'rect', '3phase'].map(c => [`cj:${c}`, `CircuitJS: ${c}`])].forEach(([i, t]) => add(i, t, i.split(':')[0]));
D.scn.forEach(s => add(`scn:${s.id}`, `תקלה: ${s.id} · ${s.title}`, 'scenario'));
[...new Set(D.pages.filter(p => p.act && p.act.startsWith('qset:')).map(p => p.act))].forEach(a => add(a, `שאלות הפרק: ${node[a.slice(5)].t}`, 'quiz'));
/* pages */
const homes = {};
D.pages.forEach(p => {
  ok(node[p.node], `page ${p.id}: node does not exist`); ok(LORD.includes(p.layer), `page ${p.id}: layer ${p.layer} does not exist`); ok(p.goal && p.goal.length > 8, `page ${p.id}: no learning goal`);
  ok(!p.act || typeof p.act === 'string', `page ${p.id}: more than one activity`);
  if (p.act) { ok(ACT[p.act], `page ${p.id}: unknown activity ${p.act}`); if (!p.view) (homes[p.act] = homes[p.act] || []).push(p.id); }
  (p.content || []).forEach(c => ok(!ACT[c], `page ${p.id}: content ${c} is an activity; it must be the page's activity or a separate page`));
});
ok(new Set(D.pages.map(p => p.id)).size === D.pages.length, 'page ids are unique');
Object.keys(ACT).forEach(a => ok((homes[a] || []).length === 1, `activity ${a}: ${(homes[a] || []).length} home pages (needs exactly 1)`));
/* nodes need a showcase or a flagged gap */
const groups = new Set(['routes', 'lib', 'res', 'infra']);
D.nodes.filter(n => !groups.has(n.id) && n.kind !== 'step').forEach(n => ok(D.pages.some(p => p.node === n.id && p.layer === 'show') || n.gap, `node ${n.id}: no showcase page and no gap noted`));
/* items: every question, fault and embedded item has exactly one home */
const owner = {};
const put = (item, pid) => (owner[item] = owner[item] || []).push(pid);
const expand = pat => {
  const [k, v] = [pat.slice(0, pat.indexOf(':')), pat.slice(pat.indexOf(':') + 1)], [a, s] = v.split('/'), T = D.topics.find(t => t.id === a);
  const n = (count, f) => Array.from({ length: count }, (_, i) => f(i + 1));
  switch (k) {
    case 'pred': return T.pred.map(x => `pred:${a}/${x}`); case 'quiz': return n(T.quiz, i => `quiz:${a}/${i}`); case 'check': return [pat]; case 'explain': return [pat]; case 'integ': return [pat];
    case 'feynman': return n(3, i => `feynman:${a}/${i}`); case 'solo': return [pat];
    case 'tcheck': return n(D.teach[a].check, i => `tcheck:${a}/${i}`); case 'ttry': return n(D.teach[a].try, i => `ttry:${a}/${i}`);
    case 'zcheck': return n(D.zero[a] || 0, i => `zcheck:${a}/${i}`); case 'guided': return n(D.sysx[a].guided, i => `guided:${a}/${i}`);
    case 'tasks': return n(D.tasks, i => `tasks:${i}`); case 'stasks': return n(D.stasks, i => `stasks:${i}`); case 'mtasks': return n(D.mtasks, i => `mtasks:${i}`);
    case 's3faults': return n(D.s3, i => `s3:${i}`); case 'iv': return n(D.iv, i => `iv:${i}`); case 'labtask': return n(D.labtask[a], i => `labtask:${a}/${i}`); case 'review': return ['review:pool'];
    case 'q': return [pat]; default: return [`?${pat}`];
  }
};
D.pages.forEach(p => (p.items || []).forEach(pat => expand(pat).forEach(it => put(it, p.id))));
D.scn.forEach(s => { const pid = D.pages.find(p => p.act === `scn:${s.id}`); if (pid) put(`scn:${s.id}`, pid.id); });
const want = [];
D.topics.forEach(T => { want.push(...T.pred.map(x => `pred:${T.id}/${x}`)); for (let i = 1; i <= T.quiz; i++) want.push(`quiz:${T.id}/${i}`); T.checks.forEach(c => want.push(`check:${T.id}/${c}`)); if (T.explain) want.push(`explain:${T.id}`); for (let i = 1; i <= 3; i++) want.push(`feynman:${T.id}/${i}`); T.faults.forEach(f => f.solo && want.push(`solo:${T.id}/${f.id}`)); if (T.integ) want.push(`integ:${T.id}`); });
Object.entries(D.teach).forEach(([k, v]) => { for (let i = 1; i <= v.check; i++) want.push(`tcheck:${k}/${i}`); for (let i = 1; i <= v.try; i++) want.push(`ttry:${k}/${i}`); });
Object.entries(D.zero).forEach(([k, c]) => { for (let i = 1; i <= c; i++) want.push(`zcheck:${k}/${i}`); });
Object.entries(D.sysx).forEach(([k, v]) => { for (let i = 1; i <= v.guided; i++) want.push(`guided:${k}/${i}`); });
for (let i = 1; i <= D.tasks; i++) want.push(`tasks:${i}`); for (let i = 1; i <= D.stasks; i++) want.push(`stasks:${i}`); for (let i = 1; i <= D.mtasks; i++) want.push(`mtasks:${i}`); for (let i = 1; i <= D.s3; i++) want.push(`s3:${i}`); for (let i = 1; i <= D.iv; i++) want.push(`iv:${i}`);
Object.entries(D.labtask).forEach(([k, c]) => { for (let i = 1; i <= c; i++) want.push(`labtask:${k}/${i}`); });
D.qb.forEach(q => want.push(`q:${q.id}`)); D.scn.forEach(s => want.push(`scn:${s.id}`));
want.forEach(it => ok((owner[it] || []).length === 1, `item ${it}: ${(owner[it] || []).length} homes (needs exactly 1)`));
Object.keys(owner).filter(it => !it.startsWith('review') && !want.includes(it)).forEach(it => P.push(`item ${it} on a page does not exist in the content`));
ok(['Q55', 'Q61'].every(q => owner['q:' + q] && owner['q:' + q].length === 1), 'Q55 and Q61 have an explicit home');
/* spaces, development map, local illustrations (A05, A06, A17, A18, A20) */
ok(D.spaces[0][0] === 'body', 'the body is the first space (the main entry)');
D.nodes.forEach(n => ok(['body', 'base', 'system', 'res'].includes(D.space[n.id]), `node ${n.id}: belongs to a space`));
const pid = new Set(D.pages.map(p => p.id));
Object.entries(D.dev).forEach(([nid, dv]) => {
  Object.entries(dv.layers).forEach(([l, x]) => {
    ok(pid.has(x.core), `${nid}/${l}: core ${x.core} exists`); ok(x.branches.length >= 2, `${nid}/${l}: at least two branches around the core`);
    x.branches.forEach(b => ok(pid.has(b[2]) && b[2].split('/')[1] === l, `${nid}/${l}: branch ${b[0]} page exists in this layer`));
    x.required.forEach(r => ok(r === x.core || x.branches.some(b => b[2] === r), `${nid}/${l}: required ${r} is the core or a branch`));
  });
  dv.links.forEach(([a, r, z]) => { ok(pid.has(a) && pid.has(z), `${nid}: link ${a} → ${z} has real pages`);
    if (r === 'deepensAcrossDepth') ok(LORD.indexOf(z.split('/')[1]) > LORD.indexOf(a.split('/')[1]), `${nid}: ${a} deepens into a deeper layer`);
    if (r === 'expandsWithinDepth') ok(z.split('/')[1] === a.split('/')[1], `${nid}: ${a} expands within the same layer`); });
  const ls = Object.keys(dv.layers);
  for (let i = 0; i + 1 < ls.length; i++) { const deep = dv.links.filter(k => k[1] === 'deepensAcrossDepth' && k[0].split('/')[1] === ls[i] && k[2].split('/')[1] === ls[i + 1]); ok(deep.length >= 2, `${nid}: at least two branches of ${ls[i]} continue into ${ls[i + 1]}`); }
});
D.pages.filter(p => p.layer === 'math' && p.act).forEach(p => ok(p.illustrates, `page ${p.id}: a math page with an activity says what it illustrates`));
ok(!D.pages.some(p => p.id === 'aoi.img/math/deriv'), 'the heavy camera derivation page is split');
D.topics.forEach(T => { const q = D.pages.find(p => p.act === `quiz:${T.id}`); ok(q && q.layer === 'show', `${T.id}: the understanding quiz closes the showcase layer`); });
/* ---- the review document ---- */
const ln = id => node[id] ? node[id].t : id, la = l => layer[l] || l, an = a => a ? (ACT[a] ? ACT[a].t : a) : '—';
const kids = id => D.nodes.filter(n => n.parent === id);
const tree = (id, d = 0) => `${'  '.repeat(d)}- **${ln(id)}** · ${node[id].kind}${node[id].gap ? ' · ⚠️ ' + node[id].gap : ''}\n` + kids(id).map(k => tree(k.id, d + 1)).join('');
let md = `# מפת השיבוץ (שלב ב)\n\nכל עמוד: צומת × שכבה × מטרה, ופעילות אחת לכל היותר. נתונים בלבד: הממשק עוד לא נבנה מהם.\n\n`;
const qCount = want.filter(w => w.startsWith('q:')).length, eCount = want.length - qCount - D.scn.length;
md += `## סיכום\n\n| מדד | ערך |\n|---|---|\n| צמתים | ${D.nodes.length} |\n| עמודים | ${D.pages.length} |\n| פעילויות ברישום | ${Object.keys(ACT).length} |\n| עמודים שמשתמשים בפעילות שבית שלה במקום אחר (מבט ממוקד) | ${D.pages.filter(p => p.view).length} |\n| שאלות בנק | ${qCount} |\n| פריטים מוטמעים (ניבוי, בדיקה, ניסוי, משימה, הסבר) | ${eCount} |\n| שאלות + פריטים מוטמעים | ${qCount + eCount} |\n| תרחישי שטח | ${D.scn.length} |\n| בעיות בבדיקה | ${P.length} |\n\n`;
md += `## היררכיית ההיקף\n\n${['proc', 'routes', 'lib', 'res'].map(r => tree(r)).join('')}\n## יחסים שאינם הכלה\n\n| מ | יחס | אל | הערה |\n|---|---|---|---|\n${D.rel.map(([a, r, z, n]) => `| ${ln(a)} | ${r} | ${ln(z)} | ${n || ''} |`).join('\n')}\n\n`;
md += `## כיסוי: עמודים בכל צומת ושכבה\n\nמספר העמודים בכל תא. ריק = אין עדיין תוכן בשכבה הזו לצומת הזה.\n\n| צומת | ${D.layers.map(l => l[1]).join(' | ')} |\n|---|${D.layers.map(() => '---').join('|')}|\n`;
{ const ord = []; const w = id => { ord.push(id); kids(id).forEach(k => w(k.id)); }; ['proc', 'routes', 'lib', 'res'].forEach(w);
  ord.filter(id => !['routes', 'lib', 'res', 'infra'].includes(id) && node[id].kind !== 'step').forEach(id => { md += `| ${ln(id)} | ${LORD.map(l => D.pages.filter(p => p.node === id && p.layer === l).length || '').join(' | ')} |\n`; }); md += '\n'; }
md += `## עמודים לפי צומת ושכבה\n\n`;
const order = []; const walk = id => { order.push(id); kids(id).forEach(k => walk(k.id)); }; ['proc', 'routes', 'lib', 'res'].forEach(walk);
order.forEach(id => { const ps = D.pages.filter(p => p.node === id).sort((a, b) => LORD.indexOf(a.layer) - LORD.indexOf(b.layer)); if (!ps.length) return;
  md += `### ${ln(id)}\n\n| שכבה | עמוד | מטרת הלמידה | פעילות | פריטים |\n|---|---|---|---|---|\n` + ps.map(p => `| ${la(p.layer)} | ${p.id.split('/').pop()} | ${p.goal}${p.gap ? ' ⚠️ ' + p.gap : ''} | ${an(p.act)}${p.view ? ' (מבט ממוקד)' : ''} | ${(p.items || []).map(pat => expand(pat).length).reduce((a, b) => a + b, 0) || ''} |`).join('\n') + '\n\n'; });
md += `## בית לכל שאלת בנק\n\n| שאלה | נושא בבנק | בית | \n|---|---|---|\n${D.qb.map(q => `| ${q.id} · ${q.title} | ${D.qt[q.t]} | ${ln((owner['q:' + q.id] || [''])[0].split('/')[0])} |`).join('\n')}\n\n`;
md += `## בית לכל תרחיש\n\n| תרחיש | שיוך בקוד | בית |\n|---|---|---|\n${D.scn.map(s => `| ${s.id} · ${s.title} | ${s.sys} | ${ln((owner['scn:' + s.id] || [''])[0].split('/')[0])} |`).join('\n')}\n\n`;
md += `## פערים מתועדים\n\n${[...D.nodes.filter(n => n.gap).map(n => `- **${n.t}:** ${n.gap}`), ...D.pages.filter(p => p.gap).map(p => `- **${ln(p.node)} · ${la(p.layer)}:** ${p.gap}`)].join('\n')}\n`;
fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true }); fs.writeFileSync(path.join(ROOT, 'docs', 'SYLLABUS_MAP.md'), md);
if (jsErr.length) P.push(...jsErr.map(e => 'js error: ' + e));
console.log(`syllabus: ${D.nodes.length} nodes, ${D.pages.length} pages, ${Object.keys(ACT).length} activities, ${qCount} questions + ${eCount} embedded items + ${D.scn.length} faults`);
if (P.length) { console.log('PROBLEMS (' + P.length + ')'); P.slice(0, 80).forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL SYLLABUS CHECKS PASSED');
