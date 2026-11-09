// Master map: every page, simulation, figure, CircuitJS circuit, question, fault, system stage and topic level must be placed
// on a level of some subject's cone. Writes docs/MASTER_MAP.md for review. Fails on anything unplaced or on a ref to nothing.
import { createRequire } from 'module'; import path from 'path'; import url from 'url'; import fs from 'fs';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const b = await chromium.launch(); const pg = await b.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.goto(url.pathToFileURL(path.join(ROOT, 'index.html')).href); await pg.waitForTimeout(400);
const D = await pg.evaluate(() => {
  const tab = s => { const x = document.querySelector(`nav.sheets [data-sheet="${s}"]`); return x ? x.firstChild.textContent.trim() : s; };
  const pages = {}; document.querySelectorAll('nav.sheets button').forEach(x => pages[x.dataset.sheet] = tab(x.dataset.sheet));
  const hubs = { mot: MOT_NAV, dig: DIG_NAV, pcb: PCB_NAV, lab: LAB_NAV, int: INT_NAV, brd: BRD_NAV, opt: OPT_NAV };
  Object.entries(hubs).forEach(([h, n]) => n.forEach(x => pages[h + '/' + x[0]] = tab(h) + ' · ' + x[1]));
  ['atlas', 'grammar', 'decode', 'quiz', 'board', 'set', 'mech', 'mdrill'].forEach(t => pages['b/' + t] = 'יסודות · ' + t);
  COMPONENTS.forEach(c => pages['s1/' + c.id] = 'רכיבים · ' + c.name.replace(/<[^>]+>/g, ''));
  Object.entries(SYSX).forEach(([k, x]) => pages['s2/' + k] = 'מערכות · ' + x.title);
  BOARDS.forEach(x => pages['lib/' + x.id] = 'ספריית כרטיסים · ' + x.id);
  return { pages, qb: QB.map(q => [q.id, q.t, q.title]), qt: QT, scn: SCN.map(s => [s.id, s.sys, s.title]), topics: TOPICS.map(t => [t.id, t.t]), levels: LEVELS.map(l => [l[0], l[1]]), sys: Object.keys(SYSX), master: MASTER, mlevels: MASTER_LEVELS, tracks: MASTER_TRACKS };
});
await b.close();
const SIMS = { mlab: 'סימולציית מנוע DC', clab: 'סימולציית ממירים', im3d: 'שדה מסתובב (תלת-ממד)', st3d: 'מנוע צעד (תלת-ממד)', bs3d: 'backlash בבורג (תלת-ממד)', scan3d: 'ראש סריקה AOI (תלת-ממד)', cr3d: 'מכתש לייזר (תלת-ממד)' };
const FIGS = { relay: 'איור חי: MOSFET וממסר', linescan: 'איור חי: טריגר line-scan', aos: 'איור חי: הסרת קצר ב-AOS' };
const CJ = { dcmotor: 'CircuitJS: מנוע DC', '3motor': 'CircuitJS: מנוע תלת-פאזי', motorprotect: 'CircuitJS: מפסק הגנה', buck: 'CircuitJS: buck', boost: 'CircuitJS: boost', xfmr: 'CircuitJS: שנאי', rect: 'CircuitJS: מיישר', '3phase': 'CircuitJS: תלת-פאזי בכוכב' };
const STAGES = ['intro', 'normal', 'prin', 'worked', 'guided', 'solo'], STN = { intro: 'היכרות', normal: 'פעולה תקינה', prin: 'עקרונות כשל', worked: 'דוגמה פתורה', guided: 'תרגול מודרך', solo: 'תרגול עצמאי' };
const lvlName = Object.fromEntries(D.levels);
const problems = [], covered = new Set(), where = {};
const mark = (key, at) => { covered.add(key); (where[key] = where[key] || []).push(at); };
const name = ref => { const [k, v] = [ref.slice(0, ref.indexOf(':')), ref.slice(ref.indexOf(':') + 1)];
  if (k === 'p') { const [r, sec] = v.split('#'); return (D.pages[r] || r) + (sec === 'full' ? ' (קריאה מלאה)' : sec === 'math' ? ' (נוסחאות)' : ''); }
  if (k === 's2') { const [id, st] = v.split('#'); return `${D.pages['s2/' + id]} · ${STN[st]}`; }
  if (k === 't') { const [id, l] = v.split('/'); return id === '*' ? 'חזרה מפוזרת (כל הנושאים)' : `סימולטור · ${(D.topics.find(t => t[0] === id) || [, id])[1]} · ${lvlName[l] || l}`; }
  if (k === 'sim') return SIMS[v]; if (k === 'fig') return FIGS[v]; if (k === 'cj') return CJ[v];
  if (k === 'qb') return `שאלות: ${D.qt[v]} (${D.qb.filter(q => q[1] === v).length})`; if (k === 'q') return `שאלה ${v}`;
  if (k === 'scn') return `תקלות: ${v} (${D.scn.filter(s => s[1] === v).length})`; if (k === 'x') return `← ${(D.master.find(m => m.id === v) || { t: v }).t}`; return ref; };
for (const S of D.master) S.L.forEach((refs, li) => refs.forEach(ref => {
  const at = `${S.id}/L${li}`, [k, v] = [ref.slice(0, ref.indexOf(':')), ref.slice(ref.indexOf(':') + 1)];
  if (k === 'p') { const r = v.split('#')[0]; if (!D.pages[r]) problems.push(`${at}: page ${r} does not exist`); else mark('p:' + r, at); }
  else if (k === 's2') { const [id, st] = v.split('#'); if (!D.sys.includes(id) || !STAGES.includes(st)) problems.push(`${at}: system stage ${v} does not exist`); else { mark('s2:' + v, at); mark('p:s2/' + id, at); } }
  else if (k === 't') { const [id, l] = v.split('/'); const ids = id === '*' ? D.topics.map(t => t[0]) : [id]; ids.forEach(i => { if (!D.topics.some(t => t[0] === i) || !lvlName[l]) problems.push(`${at}: topic level ${i}/${l} does not exist`); else mark(`t:${i}/${l}`, at); }); }
  else if (k === 'sim') { if (!SIMS[v]) problems.push(`${at}: sim ${v} unknown`); else mark(ref, at); }
  else if (k === 'fig') { if (!FIGS[v]) problems.push(`${at}: figure ${v} unknown`); else mark(ref, at); }
  else if (k === 'cj') { if (!CJ[v]) problems.push(`${at}: circuit ${v} unknown`); else mark(ref, at); }
  else if (k === 'qb') { const qs = D.qb.filter(q => q[1] === v); if (!qs.length) problems.push(`${at}: no questions with topic ${v}`); qs.forEach(q => mark('q:' + q[0], at)); }
  else if (k === 'q') { if (!D.qb.some(q => q[0] === v)) problems.push(`${at}: question ${v} unknown`); else mark(ref, at); }
  else if (k === 'scn') { const ss = D.scn.filter(s => s[1] === v); if (!ss.length) problems.push(`${at}: no faults for ${v}`); ss.forEach(s => mark('scn:' + s[0], at)); }
  else if (k === 'x') { if (!D.master.some(m => m.id === v)) problems.push(`${at}: link to unknown subject ${v}`); }
  else problems.push(`${at}: unknown ref ${ref}`);
}));
/* everything that must be placed */
const all = [...Object.keys(D.pages).map(r => 'p:' + r), ...D.sys.flatMap(s => STAGES.map(st => `s2:${s}#${st}`)), ...D.topics.flatMap(t => D.levels.map(l => `t:${t[0]}/${l[0]}`)),
  ...Object.keys(SIMS).map(k => 'sim:' + k), ...Object.keys(FIGS).map(k => 'fig:' + k), ...Object.keys(CJ).map(k => 'cj:' + k), ...D.qb.map(q => 'q:' + q[0]), ...D.scn.map(s => 'scn:' + s[0])];
const hubRoot = r => /^p:(mot|dig|pcb|lab|int|brd|opt|b|s1|s2)$/.test(r);   /* a hub tab is covered when its pages are */
const missing = all.filter(k => !covered.has(k) && !(hubRoot(k) && [...covered].some(c => c.startsWith(k + '/'))));
missing.forEach(k => problems.push(`not placed: ${k} (${name(k.replace(/^q:/, 'q:'))})`));
/* the review document */
const tr = Object.fromEntries(D.tracks); let md = `# מפת המאסטר\n\nכל נכס במערכת, על רמה בקונוס של הנושא שלו. רמות: ${D.mlevels.map((l, i) => `${i} ${l}`).join(' · ')}.\n\n`;
md += `## סיכום\n\n| נושא | מסלול | ${D.mlevels.map((l, i) => i).join(' | ')} | סה"כ |\n|---|---|${D.mlevels.map(() => '---').join('|')}|---|\n`;
for (const S of D.master) md += `| ${S.t} | ${tr[S.track]} | ${S.L.map(r => r.length || '·').join(' | ')} | ${S.L.reduce((a, r) => a + r.length, 0)} |\n`;
md += `\nכיסוי: ${all.length - missing.length} מתוך ${all.length} נכסים ממוקמים${missing.length ? ` (${missing.length} חסרים)` : ''}.\n\n`;
for (const [tid, tname] of D.tracks) { md += `## ${tname}\n\n`; for (const S of D.master.filter(m => m.track === tid)) { md += `### ${S.t}\n\n| רמה | נכסים |\n|---|---|\n`; S.L.forEach((refs, i) => md += `| ${i} · ${D.mlevels[i]} | ${refs.length ? refs.map(name).join(' · ') : '—'} |\n`); md += '\n'; } }
const multi = Object.entries(where).filter(([k, v]) => new Set(v.map(x => x.split('/')[0])).size > 1 && k.startsWith('p:'));
md += `## נכסים שמופיעים ביותר מנושא אחד (פרספקטיבות)\n\n${multi.map(([k, v]) => `- ${name(k)}: ${[...new Set(v.map(x => x.split('/')[0]))].map(id => D.master.find(m => m.id === id).t).join(', ')}`).join('\n')}\n`;
fs.writeFileSync(path.join(ROOT, 'docs', 'MASTER_MAP.md'), md);
console.log(`map: ${D.master.length} subjects, ${all.length} assets, ${all.length - missing.length} placed`);
if (errs.length) problems.push(...errs.map(e => 'js error: ' + e));
if (problems.length) { console.log('PROBLEMS (' + problems.length + ')'); problems.slice(0, 80).forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL MAP CHECKS PASSED');
