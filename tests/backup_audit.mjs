// The progress backup (v2.57): what leaves a device is everything the course remembers and only that; it comes back whole, through a file or a
// text code, only after a summary and a confirmation; a broken or foreign backup changes nothing; the state it replaced comes back with one undo.
import { createRequire } from 'module'; import path from 'path'; import url from 'url'; import fs from 'fs'; import os from 'os';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..'), PAGE = url.pathToFileURL(path.join(ROOT, 'index.html')).href;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'fh-backup-'));
const b = await chromium.launch(), errs = [], P = []; let n = 0; const ok = (c, m) => { n++; if (!c) P.push(m); };
const page = async (opt = {}) => { const ctx = await b.newContext(Object.assign({ acceptDownloads: true, viewport: { width: 1100, height: 950 } }, opt)), pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message)); await pg.goto(PAGE + '#/zoom/backup'); await pg.waitForTimeout(500); return pg; };
/* what this suite reads back: every key of the app in this browser */
const own = pg => pg.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/^(fh-|faulthunter-)/.test(k) || k === 'theme') o[k] = localStorage.getItem(k); } return o; });
const seed = (pg, o) => pg.evaluate(o => { localStorage.clear(); Object.entries(o).forEach(([k, v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))); }, o);
const reload = async pg => { await pg.reload(); await pg.waitForTimeout(500); };
const same = (a, b) => JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort());

/* ---- device A: a learner's progress, with real scenario ids, and a key of another site on the same origin ---- */
const A = await page();
const SEED = await A.evaluate(() => { const now = Date.now(), d = 86400000;
  return { 'faulthunter-v1': { [SCN[0].id]: { score: 90, down: 12 }, [SCN[1].id]: { score: 70, down: 31 }, [SCN[2].id]: {} }, 'fh-book': { read: { b1: 1, b2: 1 }, exam: { b1: { s: 9, n: 10 } }, can: {}, last: 'b2', dir: 'up', name: 'לומד' },
    'fh-review': { c1: { box: 2, due: now + d }, c2: { box: 0, due: now }, c3: { box: 4, due: now + 21 * d } }, 'fh-qbank': { Q1: 'ok', Q2: 'hard' }, 'fh-explored': ['3d:resistor', '3d:vacuum'], 'fh-visits': { a: 1, b: 1, c: 1, d: 1 },
    'fh-path': { mode: 'path', per: 10 }, 'fh-mode': 'full', theme: 'dark' }; });
await seed(A, Object.assign({ 'other-site': 'keep out', 'fh-undo': '{"x":1}' }, SEED)); await reload(A);
/* what A holds now: the seed, and the page A itself visited on loading (every page load adds its page to the visits) */
const EXP = await own(A); delete EXP['fh-undo']; const NV = o => Object.keys(JSON.parse(o['fh-visits'] || '{}')).length;
ok(Object.keys(SEED).every(k => k in EXP) && Object.keys(EXP).length === Object.keys(SEED).length, 'device A holds the seed (' + Object.keys(EXP).join(' ') + ')');
const SN = await A.evaluate(() => bkSnapshot()), APP_VERSION = await A.evaluate(() => APP_VERSION);
ok(same(SN.data, EXP) && SN.n === Object.keys(EXP).length && SN.app === 'fault-hunter' && SN.version === APP_VERSION, 'the backup holds every key of the course and nothing else (not another site\'s key, not the undo slot): ' + Object.keys(SN.data).join(' '));
const CNT = await A.evaluate(() => Object.fromEntries(bkCount(bkSnapshot().data).map(r => [r[1], r[2]])));
ok(CNT['תקלות שנפתרו'] === 2 && CNT['פרקים שסומנו כנקראו'] === 2 && CNT['מבחני פרק'] === 1 && CNT['כרטיסים בחזרה המרווחת'] === 3 && CNT['שאלות שדורגו במאגר'] === 2 && CNT['חלונות שנפתחו'] === 2 && CNT['דפים שבוקרו'] === NV(EXP), 'the summary counts what the backup holds (' + JSON.stringify(CNT) + ')');

/* ---- the text code ---- */
const CODE = await A.evaluate(async () => { const o = bkSnapshot(), c1 = await bkEncode(o), r1 = await bkDecode(c1), CS = window.CompressionStream; window.CompressionStream = undefined; const c0 = await bkEncode(o); window.CompressionStream = CS; const r0 = await bkDecode(c0);
  const msg = 'הנה הקוד שלי:\n' + c1.replace(/(.{60})/g, '$1\n ') + '\nתודה', r2 = await bkDecode(msg), cut = await bkDecode(c1.slice(0, -24)), json = await bkDecode(JSON.stringify(o));
  return { c1: c1.slice(0, 4), c0: c0.slice(0, 4), l1: c1.length, l0: c0.length, r1: r1.ok && JSON.stringify(r1.data) === JSON.stringify(o.data), r0: r0.ok && JSON.stringify(r0.data) === JSON.stringify(o.data), r2: r2.ok && JSON.stringify(r2.data) === JSON.stringify(o.data), cut: !!cut.err, json: json.ok }; });
ok(CODE.c1 === 'FH1.' && CODE.r1 && CODE.l1 < CODE.l0, 'the code is compressed where the browser can, and comes back exactly (' + CODE.l1 + ' characters, ' + CODE.l0 + ' without compression)');
ok(CODE.c0 === 'FH0.' && CODE.r0, 'where the browser cannot compress, the code is plain and still comes back exactly');
ok(CODE.r2 && CODE.json, 'a code pasted with the line breaks and the words a messenger added around it is read; so is the JSON of a backup file');
ok(CODE.cut, 'a code cut short is refused');
const BAD = await A.evaluate(async () => { const o = bkSnapshot(), t = async x => (await bkDecode(JSON.stringify(x))).err || 'accepted', d = Object.assign({}, o.data);
  return { foreign: await t({ app: 'other', kind: 'progress', v: 1, n: 0, data: {} }), count: await t(Object.assign({}, o, { n: o.n + 1 })), key: await t(Object.assign({}, o, { n: o.n + 1, data: Object.assign({}, d, { 'evil-key': '{}' }) })),
    pref: await t(Object.assign({}, o, { data: Object.assign({}, d, { theme: '<img src=x>' }) })), notjson: await t(Object.assign({}, o, { data: Object.assign({}, d, { 'fh-review': 'not json' }) })), prefsonly: await t({ app: 'fault-hunter', kind: 'progress', v: 1, n: 1, data: { theme: 'dark' } }),
    nocode: (await bkDecode('שלום')).err || 'accepted', garbled: (await bkDecode('FH1.' + 'A'.repeat(80))).err || 'accepted' }; });
ok(Object.values(BAD).every(x => x !== 'accepted'), 'refused: another app\'s backup, a wrong count, a key that is not the course\'s, a broken preference, a broken value, a backup with no progress, text with no code, a garbled code (' + JSON.stringify(BAD) + ')');

/* ---- device B: its own little progress; a code from A, checked, summarized, confirmed; then undone ---- */
const B = await page(), BSEED = { 'fh-visits': { z: 1 }, theme: 'light', 'fh-mode': 'simple' }; await seed(B, BSEED); await reload(B); const B0 = await own(B);
await A.click('#bkCopy'); await A.waitForTimeout(300); const code = await A.inputValue('#bkCode'), outMsg = await A.textContent('#bkOutMsg');
ok(/^FH1\./.test(code) && /\d/.test(outMsg), 'device A: the copy button gives the code, and says how long it is (' + outMsg.trim() + ')');
await B.fill('#bkPaste', code.slice(0, -30)); await B.click('#bkRead'); await B.waitForTimeout(200);
const errUI = await B.evaluate(() => ({ err: !!document.querySelector('#bkPrev .bk-err'), go: !!document.querySelector('#bkGo') })); ok(errUI.err && !errUI.go && same(await own(B), B0), 'device B: a code cut short shows an error, offers no loading, and changes nothing');
await B.fill('#bkPaste', 'קוד: ' + code + ' '); await B.click('#bkRead'); await B.waitForTimeout(200);
const PRE = await B.evaluate(() => ({ rows: [...document.querySelectorAll('#bkPrev .bk-sum tbody tr')].map(r => [...r.cells].map(c => c.textContent.trim())), warn: !!document.querySelector('#bkPrev .bk-warn'), go: !!document.querySelector('#bkGo') }));
ok(PRE.go && PRE.warn && PRE.rows.length === 8 && PRE.rows[0][1] === '2' && PRE.rows[0][2] === '0' && PRE.rows[6][1] === String(NV(EXP)) && PRE.rows[6][2] === String(NV(B0)) && same(await own(B), B0), 'device B: before loading, the backup is summarized beside this device\'s state, with a warning, and nothing has changed yet (' + JSON.stringify(PRE.rows) + ')');
await Promise.all([B.waitForNavigation(), B.click('#bkGo')]); await B.waitForTimeout(500);
const B1 = await own(B), undo1 = B1['fh-undo']; delete B1['fh-undo'];
ok(same(B1, EXP), 'device B: after loading, its progress is exactly device A\'s');
ok(undo1 && same(JSON.parse(undo1).data, B0), 'device B: the state it replaced is kept for one undo');
const OK1 = await B.evaluate(() => { const m = document.querySelector('.bk-ok'); return { m: m && m.textContent, undo: !!document.querySelector('#bkUndo') }; }); ok(OK1.m && /נטענה/.test(OK1.m) && OK1.undo, 'device B: the page says the progress was loaded, and offers the undo (' + JSON.stringify(OK1) + ')');
/* the course sees it: the fault challenge counts A's solved faults */
const CH = await B.evaluate(() => { go('ch'); const s = document.querySelector('.scorebar b'); return s && s.textContent; }); ok(CH && CH.startsWith('2/'), 'device B: the fault challenge shows device A\'s solved faults (' + CH + ')');
await B.goto(PAGE + '#/zoom/backup'); await B.waitForTimeout(400); B.once('dialog', d => d.accept());
await Promise.all([B.waitForNavigation(), B.click('#bkUndo')]); await B.waitForTimeout(500);
const B2 = await own(B), OK2 = await B.evaluate(() => { const m = document.querySelector('.bk-ok'); return { m: m && m.textContent, undo: !!document.querySelector('#bkUndo') }; });
ok(same(B2, B0) && OK2.m && /הוחזר/.test(OK2.m) && !OK2.undo, 'device B: undo brings back exactly what it had, and the undo is used up (' + JSON.stringify(OK2) + ')');

/* ---- device C: a file from A; a preference the backup does not hold stays C's own ---- */
await A.evaluate(() => localStorage.removeItem('theme')); await reload(A);
const [dl] = await Promise.all([A.waitForEvent('download'), A.click('#bkFile')]); const fp = path.join(TMP, dl.suggestedFilename()); await dl.saveAs(fp);
const C = await page(); await seed(C, { theme: 'light', 'fh-review': { old: { box: 1, due: 0 } } }); await reload(C);
await C.setInputFiles('#bkIn', fp); await C.waitForTimeout(300); ok(await C.$('#bkGo') !== null, 'device C: a backup file is read and summarized');
await Promise.all([C.waitForNavigation(), C.click('#bkGo')]); await C.waitForTimeout(500);
const C1 = await own(C); delete C1['fh-undo']; const EXPc = Object.assign({}, await own(A), { theme: 'light' }); delete EXPc['fh-undo'];
ok(/^fault-hunter-progress-\d{4}-\d{2}-\d{2}\.json$/.test(dl.suggestedFilename()) && same(C1, EXPc), 'device C: after loading the file its progress is A\'s, and its own theme stays, since the backup holds none (' + dl.suggestedFilename() + ')');
fs.writeFileSync(path.join(TMP, 'other.json'), JSON.stringify({ hello: 1 })); const C2 = await own(C); await C.setInputFiles('#bkIn', path.join(TMP, 'other.json')); await C.waitForTimeout(200);
ok(await C.$('#bkPrev .bk-err') !== null && await C.$('#bkGo') === null && same(await own(C), C2), 'device C: a JSON file that is not a backup is refused, and nothing changes');

/* ---- an empty device has nothing to give; the page is reached from the course board, the memory tab and every footer; it fits a phone ---- */
const E = await page(); await seed(E, {}); await reload(E);
ok(await E.evaluate(() => document.querySelector('#bkFile').disabled && document.querySelector('#bkCopy').disabled), 'an empty device offers no backup to take out');
const LNK = await E.evaluate(() => { const o = {}; o.foot = !!document.querySelector('footer a[href="#/zoom/backup"]'); go('zoom', 'book'); const d = document.querySelector('[data-dash="backup"]'); if (d) { d.click(); o.dash = !!document.querySelector('#bkPaste'); }
  PV.tab = 'prog'; go('zoom', 'path'); const p = document.querySelector('#pthBk'); if (p) { p.click(); o.mem = !!document.querySelector('#bkPaste'); } return o; });
ok(LNK.foot && LNK.dash && LNK.mem, 'the backup page is reached from the footer, the course board and the memory tab (' + JSON.stringify(LNK) + ')');
const PH = await page({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); await seed(PH, SEED); await reload(PH);
const PW = await PH.evaluate(() => ({ sw: document.documentElement.scrollWidth, vw: innerWidth, btn: [...document.querySelectorAll('.bk-btns .pth-go')].every(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.right <= innerWidth + 0.5 && r.left >= -0.5; }) }));
ok(PW.sw <= PW.vw && PW.btn, 'on a phone the backup page fits the screen, every button inside it (' + JSON.stringify(PW) + ')');
ok(errs.length === 0, 'page errors: ' + errs.slice(0, 3).join(' | '));
await b.close(); fs.rmSync(TMP, { recursive: true, force: true });
console.log(`backup: code ${CODE.l1} characters for this progress (${CODE.l0} without compression), ${n} checks`);
if (P.length) { console.log('PROBLEMS (' + P.length + ')'); P.forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL BACKUP CHECKS PASSED');
