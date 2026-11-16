/* ============ The learning path and the practice (v2.45) ============
   The tree and the machine show everything there is; this file says where to start and what to do next.
   - Seven parallel tracks cover the 39 topics once each (a track is a line of stages, a stage is one topic). Four central subjects
     (calibration, noise and grounding, heat, failure analysis) gather what used to be scattered across pages, and are tracks too.
   - A stage is practised in short sessions: six cards, three lives, a wrong card comes back once at the end, every card goes
     into the one spaced-repetition store the review tab already uses (`fh-review`, boxes of 1, 3, 7 and 21 days).
   - A passed session is a crown (up to three). A crown fades into "refresh" when one of its cards is due. A locked stage opens
     by passing the previous one, or by a skip test with no mistakes. Free mode opens everything.
   - The daily session mixes the cards that are due from every started stage with new cards from the next stage of each track.
   Cards come from what exists: topic questions and fault trees (multiple choice), the "check yourself" drills of the lessons
   and the question bank (recall: think, reveal, grade yourself). Nothing is written twice. */
const PATHKEY = 'fh-path', PLIVES = 3, PCARDS = 6, PCROWNS = 3;
/* the tracks: every zoom topic exactly once, in learning order inside the track */
const PTRACKS = [
  { id: 'el', icon: '⚡', t: 'חשמל בסיסי', why: 'הרכיבים שכל מעגל בנוי מהם: מהנגד ועד השנאי.', stages: ['resistor', 'source', 'switch', 'fuse', 'capacitor', 'diode', 'coil', 'xfmr', 'mosfet', 'connector'] },
  { id: 'ci', icon: '🔌', t: 'מעגלים, מדידה וספק', why: 'ממסר, PWM, לוגיקה, מדידה וחיישנים, ואיך מזינים את הכול.', stages: ['relay', 'pwm', 'meas', 'sensors', 'logic', 'psu', 'pwr'] },
  { id: 'mo', icon: '⚙️', t: 'תנועה ובקרה', why: 'מנוע, אנקודר, בלם, תמסורת ולולאת הבקרה, עד ציר סרבו שלם.', stages: ['motor', 'enc', 'brake', 'fits', 'trans', 'loop', 'servo'] },
  { id: 'op', icon: '👁️', t: 'ראייה ולייזר', why: 'עדשה, טריגר, רישום, מצלמה, ומקור הלייזר שמתקן.', stages: ['optics', 'trig', 'reg', 'cam', 'laserunit', 'laser'] },
  { id: 'sa', icon: '🛡️', t: 'אוויר ובטיחות', why: 'שסתום, שולחן ואקום, interlock ושרשרת הבטיחות.', stages: ['valve', 'vac', 'interlock', 'safety'] },
  { id: 'sy', icon: '🧠', t: 'בקרה, תקשורת ותהליך', why: 'כרטיסי קלט/פלט, EtherCAT, מחזור הבדיקה, הפעלה ראשונה והקו כולו.', stages: ['iocards', 'ecat', 'proc', 'bringup', 'ind'] }
];
/* the four central subjects: what they gather, in a typical order; every item points at topics that already exist and at question-bank cards */
const PCENTRAL = [
  { id: 'cal', icon: '🎯', t: 'כיול', kind: 'central',
    why: 'כיול הוא השוואה בין מה שהמערכת חושבת לבין מידה ידועה, ותיקון ההפרש. צריך מידה שהיא מדויקת יותר מהמערכת, ולכן קודם מחכים שהמכונה תתייצב.',
    items: [
      { id: 'cal:warm', t: 'יציבות תרמית ו-warm-up', what: 'מכיילים רק אחרי שהמכונה הגיעה לטמפרטורה יציבה, כי התפשטות תרמית משנה אורכים ופוקוס.', nodes: ['bringup', 'optics'], q: ['P15', 'Q36', 'P14'] },
      { id: 'cal:axis', t: 'ציר: אנקודר, backlash וחזרתיות', what: 'רזולוציית האנקודר מגבילה את המיקום, ו-backlash הוא פער שהאנקודר שעל המנוע לא רואה.', nodes: ['enc', 'trans', 'servo'], q: ['Q33', 'Q41', 'Q39'] },
      { id: 'cal:scale', t: 'מצלמה: גודל פיקסל והגדלה', what: 'מצלמים מטרה בגודל ידוע וחולקים: כמה מיקרון יש בפיקסל. מכאן גם קצב הסריקה.', nodes: ['cam', 'trig', 'optics'], q: ['Q43', 'Q34', 'Q59', 'Q38'] },
      { id: 'cal:focus', t: 'פוקוס והטיה', what: 'עומק השדה קובע כמה אפשר לטעות בפוקוס, וההטיה קובעת כמה מהשורה מחוץ לפוקוס.', nodes: ['optics'], q: ['Q35', 'Q37', 'Q56'] },
      { id: 'cal:reg', t: 'רישום: fiducials ויישור לתכנון', what: 'מודדים סימנים על הפאנל ומתאימים את מערכת הצירים של המכונה לזו של התכנון, בכל פאנל מחדש.', nodes: ['reg'], q: ['P03', 'P09'] },
      { id: 'cal:laser', t: 'לייזר: כתם, fluence והספק', what: 'גודל הכתם בפוקוס וההספק קובעים את הצפיפות האנרגטית, ומכאן את גודל המכתש.', nodes: ['laserunit', 'laser'], q: ['P04', 'P05', 'P06'] },
      { id: 'cal:verify', t: 'אימות על דוגמה ידועה', what: 'בסוף בודקים על דוגמה שהתוצאה שלה ידועה, וחוזרים כמה פעמים כדי לראות חזרתיות.', nodes: ['bringup', 'proc'], q: ['P14', 'Q50', 'P07'] }
    ] },
  { id: 'noise', icon: '📡', t: 'רעש והארקה', kind: 'central',
    why: 'רעש הוא כל אות שלא רצינו. מקורו ברכיב עצמו, בהזנה, או בכבלים. מפחיתים אותו בסינון, בהארקה נכונה ובבידוד.',
    items: [
      { id: 'noise:src', t: 'מאין בא הרעש', what: 'מתג ממותג, מנוע וכבל ארוך מכניסים רעש לקו חיישן, ולכן קוראים את האות אחרי סינון.', nodes: ['source', 'sensors'], q: ['Q13', 'Q19'] },
      { id: 'noise:gnd', t: 'הארקה ו-0V, ריפל ונפילה בכבל', what: 'לכל כבל התנגדות, ולכן ה-0V אינו זהה בשני קצותיו כשיש זרם.', nodes: ['source', 'psu'], q: ['Q17', 'P12', 'Q30'] },
      { id: 'noise:filter', t: 'סינון: RC ו-buffer', what: 'מסנן RC מוריד תדרים גבוהים, ו-buffer מונע ממקור חלש להיטען על ידי הכניסה.', nodes: ['capacitor', 'sensors'], q: ['Q12', 'Q13', 'Q15'] },
      { id: 'noise:hyst', t: 'היסטרזיס מול רעש', what: 'משווה עם היסטרזיס לא מתהפך על רעש קטן סביב סף ההחלטה.', nodes: ['sensors'], q: ['Q16', 'Q10'] },
      { id: 'noise:iso', t: 'בידוד: אופטוקפלר', what: 'בידוד חשמלי מפריד בין שני מעגלים, כך שלולאת הארקה לא עוברת ביניהם.', nodes: ['iocards'], q: ['Q68', 'Q19'] }
    ] },
  { id: 'heat', icon: '🌡️', t: 'חום ויציבות תרמית', kind: 'central',
    why: 'חום משנה שלושה דברים: ההתנגדות והחיים של רכיב, מידות מכניות, ותזמון תקלות. תקלה שמופיעה רק חם או רק קר היא רמז.',
    items: [
      { id: 'heat:comp', t: 'רכיב שמתחמם', what: 'ההספק שנופל על רכיב הוא חום. טרנזיסטור חם או מייצב חם מצביעים על עומס או על ירידת מתח גדולה מדי עליו.', nodes: ['mosfet', 'psu'], q: ['Q26', 'Q54', 'M16'] },
      { id: 'heat:mech', t: 'התפשטות והסחת פוקוס', what: 'חומרים מתארכים עם הטמפרטורה, ומערכת אופטית שהתייצבה אחרת מתכווננת מחדש.', nodes: ['optics'], q: ['Q36', 'P15', 'P11'] },
      { id: 'heat:fault', t: 'תקלה שתלויה בטמפרטורה', what: 'עובד קר ונכשל חם: חשדנים בהלחמה, בקבל ובסדק עייפות.', nodes: ['iocards'], q: ['Q48', 'Q46', 'Q45'] }
    ] },
  { id: 'fa', icon: '🔎', t: 'חקר כשל', kind: 'central',
    why: 'חקר כשל הוא שיטה: מודדים לפני שמפרקים, מצמצמים לפי סימן, ומסיימים בדוח שמישהו אחר יכול לפעול לפיו.',
    items: [
      { id: 'fa:first', t: 'שלוש המדידות הראשונות', what: 'התנגדות לפני הדלקה, אחר כך מתחי הזנה, ורק אז כל השאר. כך לא שורפים עוד רכיב.', nodes: ['meas'], q: ['Q27', 'Q32', 'Q30'] },
      { id: 'fa:isolate', t: 'בידוד: קצר, חם וקר, תנודות', what: 'מחלקים את המעגל לחצאים, ומשווים לכרטיס תקין.', nodes: ['iocards'], q: ['Q28', 'Q29', 'Q47'] },
      { id: 'fa:suspect', t: 'חשוד בלי לפרק', what: 'סימנים חיצוניים (שאריות, צבע, ריח) ושיטות בדיקה בלי פירוק.', nodes: ['iocards'], q: ['Q45', 'Q53', 'Q49'] },
      { id: 'fa:report', t: 'מסקנה ודוח', what: 'תיקון, החלפה או החזרה ליצרן: מה נכנס לדוח ובמה משווים.', nodes: ['iocards', 'bringup'], q: ['Q50', 'Q51', 'Q52', 'Q31'] }
    ] }
];
/* question-bank cards by topic (the lessons' drills and each topic's own questions are added by `pathCards`) */
const PQMAP = {
  proc: 'P01 P02 P07 P08', bringup: 'P10 P11 P14 P15', ind: 'P01 P02 P11', cam: 'Q34 Q59 Q43', servo: 'Q33 Q39 Q41', vac: 'Q42', safety: 'Q40 Q44 P16', laser: 'P08 P04 P05 P16', pwr: 'P12 M16 Q54',
  trig: 'Q34 Q38 Q59', optics: 'Q35 Q36 Q37 Q43 Q55 Q56 Q57 Q58 Q61 Q62', reg: 'P03 P09', loop: 'Q39 Q33 Q41 M07', trans: 'Q41 Q33', valve: 'Q42 Q24', interlock: 'Q40 Q44 Q02',
  laserunit: 'P04 P05 P06 P16', psu: 'Q17 Q18 Q54 P12 M15', iocards: 'Q27 Q28 Q29 Q30 Q31 Q32 Q45 Q46 Q47 Q48 Q49 Q50 Q51 Q52 Q53 Q54 Q68', relay: 'Q20 Q22 Q23 Q63 Q67 Q69', enc: 'Q33 Q39',
  motor: 'M01 M02 M03 M04 M05 M06 M07 M08 M09 M10 M11 M12', pwm: 'Q13 Q21 M15', brake: 'Q22 Q23', fits: 'P09', logic: 'Q04 Q05 Q06 Q07 Q08 Q09 Q10 Q70 Q71 Q72 Q73 Q74 Q75 Q76 Q77 Q78 Q79',
  meas: 'Q27 Q28 Q30 Q32', sensors: 'Q19 Q15 Q16', resistor: 'Q11 Q03 Q18', capacitor: 'Q12 Q13 Q17 Q45', coil: 'Q23 Q69 Q67', diode: 'Q18 Q22 Q23', mosfet: 'Q20 Q21 Q26 Q64 Q65 Q66',
  fuse: 'Q47 M01 M13', switch: 'Q01 Q02 Q10 Q44', source: 'Q19 Q54 Q03', xfmr: 'M13 M14 Q17', connector: 'Q29 Q31 Q27'
};
/* every track including the central subjects, and every stage by id */
const pathTracks = () => [...PTRACKS, ...PCENTRAL];
const pathStages = (() => { let M = null; return () => {
  if (M) return M; M = {};
  PTRACKS.forEach(tr => tr.stages.forEach((id, i) => { const n = zNode(id); M[id] = { id, t: n ? n.t.split(':')[0] : id, track: tr.id, i, node: id, go: [id], level: n && n.level }; }));
  PCENTRAL.forEach(tr => tr.items.forEach((it, i) => { M[it.id] = { id: it.id, t: it.t, track: tr.id, i, item: it, go: it.nodes, what: it.what }; }));
  return M; }; })();
const pathTrack = id => pathTracks().find(t => t.id === id);
const pathTrackStages = tr => tr.stages || tr.items.map(x => x.id);

/* ---- cards ---- */
function pathHash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const pathText = h => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
const pathQB = id => QB.find(q => q.id === id);
/* a question-bank card: recall (think, reveal, grade yourself) */
const pathQBCard = q => ({ id: 'qb:' + q.id, k: 'recall', q: q.title + '. ' + q.q, a: q.a, why: q.why, src: 'מאגר השאלות ' + q.id });
const PCARD_CACHE = {};   /* the cards come from data that does not change after load */
function pathCards(stageId) { if (PCARD_CACHE[stageId]) return PCARD_CACHE[stageId]; return (PCARD_CACHE[stageId] = pathCards0(stageId)); }
function pathCards0(stageId) {
  const st = pathStages()[stageId]; if (!st) return []; const out = [], seen = new Set(), add = c => { if (c && !seen.has(c.id)) { seen.add(c.id); out.push(c); } };
  if (st.node) {
    const n = zNode(st.node), ws = zWindows(n), T = TOPICS.find(x => zTopicNode(x.id) === n);
    if (T) {
      T.quiz.forEach((x, i) => add({ id: `${T.id}:q:${i}`, k: 'mc', q: x[0], o: x[1], a: x[2], why: x[3], src: T.t }));
      Object.entries(T.checks || {}).forEach(([l, x]) => add({ id: `${T.id}:ck:${l}`, k: 'mc', q: x[0], o: x[1], a: x[2], why: x[3], src: T.t }));
      if (Array.isArray(T.integ)) add({ id: `${T.id}:integ`, k: 'mc', q: T.integ[0], o: T.integ[1], a: T.integ[2], why: T.integ[3], src: T.t });
      T.faults.filter(f => f.solo).forEach(f => { const leaves = Object.entries(f.nodes).filter(([, x]) => x.leaf).map(([id, x]) => [id, x.leaf]), ok = leaves.find(([id]) => id === f.solo[1]); if (!ok) return;
        const pool = [...leaves, ...T.faults.filter(g => g !== f).flatMap(g => Object.entries(g.nodes).filter(([, x]) => x.leaf).map(([id, x]) => [g.id + id, x.leaf]))].filter(([id, t], i, a) => id !== ok[0] && t !== ok[1] && a.findIndex(y => y[1] === t) === i);
        const others = pool.sort((a, b) => pathHash(f.id + a[0]) - pathHash(f.id + b[0])).slice(0, 3), opts = [ok, ...others].sort((a, b) => pathHash(f.id + 'o' + a[0]) - pathHash(f.id + 'o' + b[0]));
        add({ id: `${T.id}:f:${f.id}`, k: 'mc', q: `${f.t}. ${f.sym} ${f.solo[0]} מה הסיבה?`, o: opts.map(x => x[1]), a: opts.findIndex(x => x[0] === ok[0]), why: (f.nodes[ok[0]].fix || ''), src: 'תקלה: ' + f.t }); });
    }
    [...new Set(ws.filter(w => w.startsWith('c:')).map(w => w.split(':')[1]))].forEach(c => {
      const tpl = document.createElement('template'); tpl.innerHTML = zParts(c).drills || '';
      [...tpl.content.querySelectorAll('details.drill')].forEach((d, i) => { const s = d.querySelector('summary'), p = d.querySelector('p'); if (s && p) add({ id: `c:${c}:${i}`, k: 'recall', q: pathText(s.innerHTML), a: pathText(p.innerHTML), why: '', src: 'בדוק את עצמך' }); }); });
    (PQMAP[st.node] || '').split(' ').filter(Boolean).forEach(id => { const q = pathQB(id); if (q) add(pathQBCard(q)); });
  } else st.item.q.forEach(id => { const q = pathQB(id); if (q) add(pathQBCard(q)); });
  return out;
}

/* ---- state ---- */
const pathDefault = () => ({ xp: 0, streak: 0, best: 0, last: '', day: '', dxp: 0, st: {}, mode: 'path', goal: 20, pick: null, per: 3 });
function pathLoad() { try { return Object.assign(pathDefault(), JSON.parse(localStorage.getItem(PATHKEY) || '{}')); } catch (e) { return pathDefault(); } }
function pathSave(P) { try { localStorage.setItem(PATHKEY, JSON.stringify(P)); } catch (e) { } }
const pathDay = (now = Date.now()) => { const d = new Date(now); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const pathCrowns = (P, id) => (P.st[id] && P.st[id].c) || 0;
/* a stage is open when the mode is free, it starts its track, the one before has a crown, or its skip test was passed */
function pathOpen(P, id) { const s = pathStages()[id]; if (P.mode === 'open' || s.i === 0 || (P.st[id] && P.st[id].sk)) return true; const tr = pathTrack(s.track); return pathCrowns(P, pathTrackStages(tr)[s.i - 1]) >= 1; }
/* a started stage whose cards are due is "refresh" */
function pathDue(id, now = Date.now(), d = reviewLoad()) { return pathCards(id).filter(c => d[c.id] && d[c.id].due <= now); }
function pathState(P, id, now = Date.now(), d = reviewLoad()) { const c = pathCrowns(P, id); if (c && pathDue(id, now, d).length) return 'refresh'; if (c >= PCROWNS) return 'gold'; if (c) return 'crown'; return pathOpen(P, id) ? 'open' : 'locked'; }
/* the result of a session changes the state: XP, streak, crowns */
function pathApply(P, r, now = Date.now()) {
  const N = JSON.parse(JSON.stringify(P)), day = pathDay(now); if (N.day !== day) { N.day = day; N.dxp = 0; }
  let xp = r.xp; const passed = !r.failed && (r.mode === 'stage' || r.mode === 'skip');
  if (passed) { xp += 20 + (r.mistakes === 0 ? 10 : 0); const s = N.st[r.stage] = N.st[r.stage] || { c: 0, sk: 0 }; if (r.mode === 'skip') s.sk = 1; s.c = Math.min(PCROWNS, s.c + 1); s.t = now; }
  N.xp += xp; N.dxp += xp;
  if (N.last !== day) { const y = pathDay(now - 86400000); N.streak = N.last === y ? N.streak + 1 : 1; N.best = Math.max(N.best, N.streak); N.last = day; }
  return { P: N, xp, passed };
}

/* ---- sessions ---- */
const pathSort = (list, seed, now, d) => list.map(c => [d[c.id] && d[c.id].due <= now ? 0 : !d[c.id] ? 1 : 2, d[c.id] ? d[c.id].box : 0, pathHash(seed + c.id), c]).sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]).map(x => x[3]);
function pathSession(mode, stage, now = Date.now(), seed = pathDay(now)) {
  const d = reviewLoad(); let items;
  if (mode === 'daily') items = pathDailyItems(pathLoad(), now, d, seed);
  else items = pathSort(pathCards(stage), seed + stage, now, d).slice(0, mode === 'skip' ? 5 : PCARDS).map(c => ({ c, stage }));
  return { mode, stage, items, i: 0, lives: mode === 'skip' ? 1 : PLIVES, xp: 0, right: 0, mistakes: 0, failed: false, done: !items.length, now, phase: 'ask' };
}
/* the daily session: cards that are due from started stages (mixed across topics), then new cards from the next open stage of each track */
function pathDailyItems(P, now, d, seed, n = 10) {
  const all = pathStages(), started = Object.keys(all).filter(id => pathCrowns(P, id) > 0), by = {};
  started.forEach(id => pathSort(pathDue(id, now, d), seed + id, now, d).forEach(c => (by[id] = by[id] || []).push({ c, stage: id })));
  const out = []; const keys = Object.keys(by).sort(); while (out.length < n && keys.some(k => by[k].length)) keys.forEach(k => { if (by[k].length && out.length < n) out.push(by[k].shift()); });
  const next = pathTracks().map(tr => pathTrackStages(tr).find(id => pathOpen(P, id) && pathCrowns(P, id) === 0)).filter(Boolean);
  const fresh = next.map(id => pathSort(pathCards(id).filter(c => !d[c.id]), seed + id, now, d).map(c => ({ c, stage: id })));
  while (out.length < n && fresh.some(f => f.length)) fresh.forEach(f => { if (f.length && out.length < n) out.push(f.shift()); });
  return out;
}
/* one answer: correct or not. A card missed the first time comes back once at the end, and costs a life. */
function pathAnswer(S, ok) {
  const it = S.items[S.i]; if (!it || S.done) return S;
  if (!it.retry) reviewRecord(it.c.id, ok, S.now);
  if (ok) { S.right++; S.xp += it.retry ? 5 : 10; } else { S.mistakes++; S.lives--; if (!it.retry) S.items.push({ c: it.c, stage: it.stage, retry: true }); }
  if (S.lives <= 0) { S.failed = true; S.done = true; } else if (S.i + 1 >= S.items.length) S.done = true; else S.i++;
  return S;
}
/* the syllabus: parallel tracks dealt out week by week, a stage already passed is skipped */
function pathPlan(trackIds, per, P) {
  const q = trackIds.map(id => pathTrackStages(pathTrack(id)).filter(s => pathCrowns(P, s) === 0)), weeks = []; let cur = [];
  while (q.some(x => x.length)) { q.forEach(x => { if (x.length) { cur.push(x.shift()); if (cur.length === per) { weeks.push(cur); cur = []; } } }); }
  if (cur.length) weeks.push(cur); return weeks;
}

/* ---- the screens ---- */
const PV = { view: 'map', open: null, sess: null, tab: 'map' };
const pathEsc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
function pathStats(P, now = Date.now()) {
  const day = pathDay(now), dxp = P.day === day ? P.dxp : 0, live = P.last === day || P.last === pathDay(now - 86400000) ? P.streak : 0;
  return `<div class="pth-stats"><span title="ימים ברצף">🔥 <b>${live}</b></span><span title="נקודות ניסיון">⭐ <b>${P.xp}</b></span><span title="יעד יומי">🎯 <b>${dxp}</b>/${P.goal} <i class="pth-bar"><i style="width:${Math.min(100, Math.round(dxp / P.goal * 100))}%"></i></i></span></div>`;
}
function zPathView() {
  const P = pathLoad(); if (PV.sess && !PV.sess.done) return pathPlay(); if (PV.sess) return pathResult();
  PV.view = PV.tab;
  const tabs = [['map', 'מפת שלבים'], ['syl', 'סילבוס ותוכנית'], ['today', 'סשן יומי'], ['prog', 'מה נשאר בזיכרון']];
  content.innerHTML = zSubnav('path') + `<h2>נתיב למידה</h2><p class="lead">שישה מסלולים מקבילים וארבעה נושאים מרכזיים. כל שלב הוא נושא אחד: קוראים אותו בעץ, ומתרגלים אותו בסשנים קצרים. מה שנשכח חוזר בזמן.</p>` + pathStats(P) +
    `<div class="pth-tabs" role="tablist">${tabs.map(([k, t]) => `<button type="button" role="tab" data-pt="${k}" aria-selected="${PV.tab === k}">${t}</button>`).join('')}</div><div id="pthBody"></div>`;
  zWireSub(); content.querySelectorAll('[data-pt]').forEach(b => b.addEventListener('click', () => { PV.tab = b.dataset.pt; zPathView(); }));
  ({ map: pathMap, syl: pathSyllabus, today: pathToday, prog: pathProgress })[PV.tab](P, $('#pthBody')); setTitle('זום', 'נתיב למידה', 'מסלולים, שלבים וחזרות');
}
function pathStageBtn(P, id, now, d) {
  const s = pathStages()[id], st = pathState(P, id, now, d), c = pathCrowns(P, id), mark = { locked: '🔒', open: s.i + 1, crown: '✓', gold: '★', refresh: '🔁' }[st];
  return `<button type="button" class="pth-st pth-${st}${PV.open === id ? ' on' : ''}" data-st="${id}" aria-label="${pathEsc(s.t)}, ${{ locked: 'נעול', open: 'פתוח', crown: 'הושלם', gold: 'שלוט', refresh: 'צריך רענון' }[st]}, ${c} כתרים"><span class="pth-n">${mark}</span><span class="pth-t">${pathEsc(s.t)}</span><span class="pth-cr" aria-hidden="true">${'●'.repeat(c)}${'○'.repeat(PCROWNS - c)}</span><i class="pth-mb" aria-hidden="true"><i style="width:${Math.round(pathMastery(id, now, d).m * 100)}%"></i></i></button>`;
}
function pathMap(P, host) {
  const now = Date.now(), d = reviewLoad(), due = pathDailyItems(P, now, d, pathDay(now));
  host.innerHTML = `<div class="pth-top"><button type="button" class="pth-go" data-daily="1">▶ סשן יומי (${due.length} כרטיסים)</button>
    <label class="pth-mode"><input type="checkbox" id="pthFree"${P.mode === 'open' ? ' checked' : ''}> מצב חופשי: כל השלבים פתוחים</label></div>` +
    pathTracks().map(tr => { const ids = pathTrackStages(tr), done = ids.filter(id => pathCrowns(P, id) > 0).length;
      return `<section class="pth-track${tr.kind ? ' pth-central' : ''}"><h3><span aria-hidden="true">${tr.icon}</span> ${tr.t} <small>${done}/${ids.length}</small></h3><p class="note">${tr.why}</p><div class="pth-row">${ids.map(id => pathStageBtn(P, id, now, d)).join('')}</div><div class="pth-panel" data-tp="${tr.id}"></div></section>`; }).join('');
  $('#pthFree').addEventListener('change', e => { const N = pathLoad(); N.mode = e.target.checked ? 'open' : 'path'; pathSave(N); zPathView(); });
  host.querySelector('[data-daily]').addEventListener('click', () => pathStart('daily'));
  host.querySelectorAll('[data-st]').forEach(b => b.addEventListener('click', () => { PV.open = PV.open === b.dataset.st ? null : b.dataset.st; zPathView(); }));
  if (PV.open && pathStages()[PV.open]) pathPanel(P, PV.open, now, d, host.querySelector(`[data-tp="${pathStages()[PV.open].track}"]`));
}
function pathPanel(P, id, now, d, host) {
  const s = pathStages()[id], st = pathState(P, id, now, d), cards = pathCards(id), due = pathDue(id, now, d).length, locked = st === 'locked';
  host.innerHTML = `<h4>${pathEsc(s.t)}</h4>${s.what ? `<p>${s.what}</p>` : ''}${pathMasteryHtml(id, now, d)}<p class="note">${cards.length} כרטיסים לתרגול${due ? `, ${due} לחזרה עכשיו` : ''}. ${locked ? 'השלב נעול: עוברים את הקודם, או בוחנים את עצמך על הכול בלי טעות.' : ''}</p>
    <div class="pth-acts">${s.go.map(n => `<button type="button" data-open="${n}">📖 ${s.go.length > 1 || s.item ? pathEsc(zNode(n).t.split(':')[0]) : 'קרא את הנושא'}</button>`).join('')}
    ${locked ? `<button type="button" class="pth-go" data-skip="${id}">⏭ בחינת דילוג (חמש שאלות, בלי טעות)</button>` : `<button type="button" class="pth-go" data-play="${id}">▶ תרגל (${Math.min(PCARDS, cards.length)} כרטיסים)</button>`}</div>`;
  host.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => go('zoom', b.dataset.open)));
  const pl = host.querySelector('[data-play]'); if (pl) pl.addEventListener('click', () => pathStart('stage', id));
  const sk = host.querySelector('[data-skip]'); if (sk) sk.addEventListener('click', () => pathStart('skip', id));
}
function pathStart(mode, stage) { PV.sess = pathSession(mode, stage); if (PV.sess.done) PV.sess = null; zPathView(); }
function pathSyllabus(P, host) {
  const all = pathTracks(), pick = (P.pick || PTRACKS.slice(0, 3).map(t => t.id)).filter(id => pathTrack(id)), plan = pathPlan(pick, P.per, P);
  host.innerHTML = `<p>סילבוס הוא סדר. בוחרים כמה מסלולים ללמוד במקביל, וכמה שלבים בשבוע, ומקבלים תוכנית שמחלקת שלב אחד מכל מסלול לסירוגין. אפשר לשנות בכל רגע, והשלבים שכבר עברת לא חוזרים.</p>
    <div class="chips" role="group" aria-label="מסלולים">${all.map(t => `<button type="button" data-pk="${t.id}" aria-pressed="${pick.includes(t.id)}">${t.icon} ${t.t}</button>`).join('')}</div>
    <p>שלבים בשבוע: ${[2, 3, 4, 6].map(n => `<button type="button" class="pth-per" data-per="${n}" aria-pressed="${P.per === n}">${n}</button>`).join(' ')}</p>
    ${plan.length ? `<table class="pth-plan"><thead><tr><th>שבוע</th><th>שלבים (במקביל)</th><th>זמן משוער</th></tr></thead><tbody>${plan.map((w, i) => `<tr><td>${i + 1}</td><td>${w.map(id => `<button type="button" class="linkbtn" data-sj="${id}">${pathStages()[id].t}</button>`).join(' · ')}</td><td>כ-${w.length * 30} דקות</td></tr>`).join('')}</tbody></table>
    <p class="note">${plan.reduce((a, w) => a + w.length, 0)} שלבים, ${plan.length} שבועות בקצב הזה. הזמן הוא הערכה גסה: חצי שעה לשלב, קריאה ותרגול יחד.</p>` : '<p class="note">כל השלבים במסלולים שנבחרו הושלמו.</p>'}`;
  host.querySelectorAll('[data-pk]').forEach(b => b.addEventListener('click', () => { const N = pathLoad(), cur = new Set(N.pick || PTRACKS.slice(0, 3).map(t => t.id)); cur.has(b.dataset.pk) ? cur.delete(b.dataset.pk) : cur.add(b.dataset.pk); N.pick = pathTracks().map(t => t.id).filter(id => cur.has(id)); pathSave(N); zPathView(); }));
  host.querySelectorAll('[data-per]').forEach(b => b.addEventListener('click', () => { const N = pathLoad(); N.per = +b.dataset.per; pathSave(N); zPathView(); }));
  host.querySelectorAll('[data-sj]').forEach(b => b.addEventListener('click', () => { PV.tab = 'map'; PV.open = b.dataset.sj; zPathView(); }));
}
function pathToday(P, host) {
  const now = Date.now(), d = reviewLoad(), items = pathDailyItems(P, now, d, pathDay(now)), dueN = Object.values(d).filter(x => x.due <= now).length;
  host.innerHTML = `<p>סשן יומי בן עד עשרה כרטיסים: קודם מה שהגיע זמנו לחזרה, ממעורב מכל הנושאים שהתחלת, ואז כרטיסים חדשים מהשלב הבא בכל מסלול.</p>
    <p class="note">${items.length ? `${items.length} כרטיסים מוכנים${dueN ? `, מהם ${dueN} לחזרה` : ''}.` : 'אין כרטיסים להיום. אפשר להתחיל שלב במפה.'}</p>${items.length ? '<p><button type="button" class="pth-go" id="pthDaily">▶ התחל</button></p>' : ''}
    <p class="note">שליפה מהזיכרון בהפרשים של יום, שלושה, שבעה ו-21 ימים, ומעורבבת בין נושאים: זו הדרך היעילה ביותר להשאיר ידע (Dunlosky ושות', 2013).</p>`;
  const b = $('#pthDaily'); if (b) b.addEventListener('click', () => pathStart('daily'));
}
const pathHearts = S => '❤️'.repeat(Math.max(0, S.lives)) + '🖤'.repeat(Math.max(0, (S.mode === 'skip' ? 1 : PLIVES) - Math.max(0, S.lives)));
function pathPlay() {
  const S = PV.sess, it = S.items[S.i], c = it.c, st = pathStages()[it.stage];
  content.innerHTML = `<div class="pth-play"><div class="pth-head"><button type="button" id="pthX" aria-label="יציאה מהסשן">✕</button><span class="pth-prog" role="progressbar" aria-valuemin="0" aria-valuemax="${S.items.length}" aria-valuenow="${S.i}"><i style="width:${Math.round(S.i / S.items.length * 100)}%"></i></span><span aria-label="לבבות">${pathHearts(S)}</span></div>
    <p class="kb">${pathEsc(st.t)}${it.retry ? ' · חזרה על טעות' : ''}</p><h3 class="pth-q" lang="he">${c.q}</h3><div id="pthA" aria-live="polite"></div></div>`;
  $('#pthX').addEventListener('click', () => { PV.sess = null; zPathView(); });
  const A = $('#pthA'), fin = () => { PV.sess = S; zPathView(); };
  const feedback = (ok, why) => { A.insertAdjacentHTML('beforeend', `<div class="pth-fb ${ok ? 'ok' : 'no'}"><b>${ok ? 'נכון' : 'לא נכון'}</b>${why ? ` ${why}` : ''}${!ok && it.retry === undefined ? ' <small>הכרטיס יחזור בסוף.</small>' : ''}<p><button type="button" class="pth-go" id="pthNext">המשך</button></p></div>`); const n = $('#pthNext'); n.focus(); n.addEventListener('click', fin); };
  if (c.k === 'mc') {
    A.innerHTML = `<div class="tp">${c.o.map((x, j) => `<button type="button" data-o="${j}">${x}</button>`).join('')}</div>`;
    A.querySelectorAll('[data-o]').forEach(b => b.addEventListener('click', () => { const ok = +b.dataset.o === c.a; A.querySelectorAll('[data-o]').forEach(x => { x.disabled = true; if (+x.dataset.o === c.a) x.classList.add('right'); }); if (!ok) b.classList.add('wrong'); pathAnswer(S, ok); feedback(ok, c.why); }));
  } else {
    A.innerHTML = `<p class="note">ענה לעצמך קודם, ואז הצג.</p><p><button type="button" id="pthShow">הצג תשובה</button></p>`;
    $('#pthShow').addEventListener('click', () => { A.innerHTML = `<div class="pth-ans"><b>תשובה:</b> ${c.a}${c.why ? `<p class="note">${c.why}</p>` : ''}</div><p>איך היה?</p><p><button type="button" id="pthKnew" class="pth-go">ידעתי</button> <button type="button" id="pthNo">לא ידעתי</button></p>`;
      const done = ok => { pathAnswer(S, ok); fin(); }; $('#pthKnew').addEventListener('click', () => done(true)); $('#pthNo').addEventListener('click', () => done(false)); });
  }
}
function pathResult() {
  const S = PV.sess, R = pathApply(pathLoad(), { mode: S.mode, stage: S.stage, xp: S.xp, mistakes: S.mistakes, failed: S.failed }); pathSave(R.P); PV.sess = null;
  const st = pathStages()[S.stage], crowns = S.mode === 'daily' ? null : pathCrowns(R.P, S.stage), nextId = st && !st.item ? pathTrackStages(pathTrack(st.track))[st.i + 1] : null;
  content.innerHTML = `<div class="pth-play pth-result"><h2>${S.failed ? 'נגמרו הלבבות' : S.mode === 'daily' ? 'סשן יומי הושלם' : R.passed ? 'שלב הושלם' : 'סשן הושלם'}</h2>
    <p class="lead">${S.failed ? 'זה בסדר: מה שנכשל חוזר אליך בזמן, וההתקדמות נשמרת.' : S.mistakes ? `${S.mistakes} טעויות, והן חוזרות לתרגול.` : 'בלי אף טעות.'}</p>
    <div class="pth-stats"><span>⭐ <b>+${R.xp}</b></span><span>✅ <b>${S.right}</b> נכון</span>${crowns != null ? `<span>👑 <b>${crowns}</b>/${PCROWNS}</span>` : ''}<span>🔥 <b>${R.P.streak}</b></span></div>
    <p>${S.failed || (S.mode === 'stage' && !R.passed) ? `<button type="button" class="pth-go" id="pthAgain">נסה שוב</button> ` : ''}${R.passed && nextId ? `<button type="button" class="pth-go" id="pthNextSt">השלב הבא: ${pathEsc(pathStages()[nextId].t)}</button> ` : ''}<button type="button" id="pthBack">חזרה למפה</button></p></div>`;
  const a = $('#pthAgain'); if (a) a.addEventListener('click', () => pathStart(S.mode, S.stage));
  const n = $('#pthNextSt'); if (n) n.addEventListener('click', () => { PV.open = nextId; PV.tab = 'map'; zPathView(); });
  $('#pthBack').addEventListener('click', () => { PV.tab = 'map'; zPathView(); });
}
ZVIEW.add('path', { group: 'main', order: 1.5, title: 'נתיב למידה', render: () => zPathView() });

/* ---- the central subjects: one page for what was scattered ---- */
function zCentralView(arg) {
  const P = pathLoad(), pick = PCENTRAL.find(x => x.id === (arg || PV.central)) || PCENTRAL[0]; PV.central = pick.id;
  content.innerHTML = zSubnav('central') + `<h2>נושאים מרכזיים</h2><p class="lead">נושאים שהופיעו במקומות רבים, ועכשיו יש להם בית אחד: כל אחד מפנה לנושאים שמלמדים אותו ולכרטיסי תרגול.</p>
    <div class="chips" role="group" aria-label="נושא מרכזי">${PCENTRAL.map(x => `<button type="button" data-cs="${x.id}" aria-pressed="${x.id === pick.id}">${x.icon} ${x.t}</button>`).join('')}</div>
    <h3>${pick.icon} ${pick.t}</h3><p>${pick.why}</p><ol class="pth-items">${pick.items.map(it => `<li><b>${it.t}</b> <small>${pathCrowns(P, it.id) ? '👑'.repeat(pathCrowns(P, it.id)) : ''}</small><p>${it.what}</p><p>${it.nodes.map(n => `<button type="button" class="linkbtn" data-n="${n}">${zNode(n).t.split(':')[0]}</button>`).join(' · ')} <button type="button" data-pr="${it.id}">▶ תרגל</button></p></li>`).join('')}</ol>
    <p class="note">הסדר הוא הסדר הטיפוסי. בכל מכונה הנוהל שלה קובע.</p>`;
  zWireSub(); content.querySelectorAll('[data-cs]').forEach(b => b.addEventListener('click', () => zCentralView(b.dataset.cs)));
  content.querySelectorAll('[data-n]').forEach(b => b.addEventListener('click', () => go('zoom', b.dataset.n)));
  content.querySelectorAll('[data-pr]').forEach(b => b.addEventListener('click', () => { PV.tab = 'map'; PV.open = b.dataset.pr; PV.sess = pathSession('stage', b.dataset.pr); if (PV.sess.done) PV.sess = null; go('zoom', 'path'); }));
  setTitle('זום', 'נושאים מרכזיים', pick.t);
}
ZVIEW.add('central', { group: 'main', order: 1.6, title: 'נושאים מרכזיים', render: arg => zCentralView(arg) });

/* ---- what stays in memory: a measure of understanding from retrieval, not from visits ----
   Every card sits in a Leitner box: 0 never answered, 1 answered (or missed) recently, 2 recalled after a day, 3 after three days,
   4 after a week or more. A topic's retrieval score is the mean of its cards' boxes, each worth a quarter. A card whose review is
   late by more than its own interval counts one box lower (it may have been forgotten). Levels: not started, learning (below 40%),
   building (40–75%), holding (75% and nothing due). It measures recall of this book's questions, nothing wider, and says so. */
const PMW = [0, 0.25, 0.5, 0.75, 1], PMLEV = { new: 'לא התחלת', learn: 'בלמידה', build: 'מתבסס', master: 'נשמר בזיכרון' };
function pathMastery(id, now = Date.now(), d = reviewLoad()) {
  const cards = pathCards(id), boxes = [0, 0, 0, 0, 0]; let sum = 0, due = 0;
  cards.forEach(c => { const e = d[c.id]; let b = e ? Math.max(0, Math.min(4, e.box)) : 0; if (e && e.due <= now) { due++; if (now - e.due > REVIEW_DAYS[b] * 86400000) b = Math.max(1, b - 1); } boxes[b]++; sum += PMW[b]; });
  const m = cards.length ? sum / cards.length : 0, level = !boxes.slice(1).some(Boolean) ? 'new' : m >= 0.75 && !due ? 'master' : m >= 0.4 ? 'build' : 'learn';
  return { n: cards.length, boxes, due, m, level };
}
function pathMasteryHtml(id, now = Date.now(), d = reviewLoad()) {
  const M = pathMastery(id, now, d), lab = ['חדשים', 'יום', '3 ימים', 'שבוע', '3 שבועות'], col = ['#EEE9E0', '#D6E8F7', '#3078B0', '#1B2F5A', '#7B5A3C'];
  return `<div class="pth-mast"><p><b>נשאר בזיכרון: ${Math.round(M.m * 100)}%</b> · ${PMLEV[M.level]}${M.due ? ` · ${M.due} לחזרה עכשיו` : ''}</p><div class="pth-stack" role="img" aria-label="${M.boxes.map((b, i) => `${lab[i]}: ${b}`).join(', ')}">${M.boxes.map((b, i) => b ? `<i style="flex:${b};background:${col[i]}" title="${lab[i]}: ${b}"></i>` : '').join('')}</div><p class="note">${M.boxes.map((b, i) => `<span class="pth-key" style="--c:${col[i]}"></span>${i ? 'נזכרת אחרי ' + lab[i] : 'עוד לא נענו'}: ${b}`).join(' · ')}</p></div>`;
}
/* the next days: how many cards come back each day */
function pathForecast(now = Date.now(), days = 7, d = reviewLoad()) { const day = 86400000, out = Array(days).fill(0); Object.values(d).forEach(e => { const k = Math.floor((e.due - now) / day) + 1; if (e.due <= now) out[0]++; else if (k < days) out[k]++; }); return out; }
function pathProgress(P, host) {
  const now = Date.now(), d = reviewLoad(), st = Object.keys(pathStages()), Mi = Object.fromEntries(st.map(id => [id, pathMastery(id, now, d)])), wsum = (ids) => { const n = ids.reduce((a, id) => a + Mi[id].n, 0); return n ? ids.reduce((a, id) => a + Mi[id].m * Mi[id].n, 0) / n : 0; };
  const started = st.filter(id => Mi[id].level !== 'new'), weak = started.slice().sort((a, b) => (Mi[a].m - Mi[b].m) || (Mi[b].due - Mi[a].due)).slice(0, 5), fc = pathForecast(now, 7, d), fmax = Math.max(1, ...fc);
  const cnt = k => st.filter(id => Mi[id].level === k).length;
  host.innerHTML = `<p>כאן מודדים מה נשאר בזיכרון, לא מה נקרא: כל כרטיס עולה קופסה כשנזכרים בו אחרי יום, שלושה ימים, שבוע ושלושה שבועות, ויורד כשטועים או כשהחזרה מאחרת. ביקור בדף לא משנה את המדד.</p>
    <div class="pth-stats"><span>📚 <b>${Math.round(wsum(st) * 100)}%</b> מהכרטיסים בכל הספר</span><span>🟦 <b>${cnt('master')}</b> נשמרו</span><span>🔷 <b>${cnt('build')}</b> מתבססים</span><span>▫️ <b>${cnt('learn')}</b> בלמידה</span><span>· <b>${cnt('new')}</b> לא התחלת</span></div>
    <h3>לפי מסלול</h3><table class="pth-plan"><tbody>${pathTracks().map(tr => { const ids = pathTrackStages(tr), v = wsum(ids); return `<tr><td>${tr.icon} ${tr.t}</td><td style="width:55%"><i class="pth-mb big"><i style="width:${Math.round(v * 100)}%"></i></i></td><td>${Math.round(v * 100)}%</td></tr>`; }).join('')}</tbody></table>
    <h3>הכי חלשים מבין מה שהתחלת</h3>${weak.length ? `<ul class="pth-weak">${weak.map(id => `<li><b>${pathEsc(pathStages()[id].t)}</b> · ${Math.round(Mi[id].m * 100)}%${Mi[id].due ? ` · ${Mi[id].due} לחזרה` : ''} <button type="button" class="pth-go" data-wp="${id}">▶ תרגל</button></li>`).join('')}</ul>` : '<p class="note">עוד לא התחלת אף שלב.</p>'}
    <h3>מה חוזר בשבוע הקרוב</h3><div class="pth-fc" role="img" aria-label="${fc.map((n, i) => `${i ? 'בעוד ' + i + ' ימים' : 'היום'}: ${n}`).join(', ')}">${fc.map((n, i) => `<div><i style="height:${Math.round(n / fmax * 100)}%"></i><b>${n}</b><small>${i ? '+' + i : 'היום'}</small></div>`).join('')}</div>
    <p class="note">המדד אומר עד כמה נזכרת בשאלות של הספר הזה, לאורך זמן. הוא לא בוחן כל מה שיש לדעת על הנושא.</p>`;
  host.querySelectorAll('[data-wp]').forEach(b => b.addEventListener('click', () => pathStart('stage', b.dataset.wp)));
}
/* on every topic page: what of it stays in memory, and a way to practise it */
nodeSection('mastery', 35, { html: ({ id }) => pathStages()[id] ? `<section class="pth-node" aria-label="מה נשאר בזיכרון">${pathMasteryHtml(id)}<p><button type="button" class="pth-go" data-npr="${id}">▶ תרגל את הנושא (${Math.min(PCARDS, pathCards(id).length)} כרטיסים)</button> <button type="button" class="linkbtn" data-npath="1">הנושא בנתיב הלמידה</button></p></section>` : '',
  wire: ({ id }) => { const b = document.querySelector('[data-npr]'); if (b) b.addEventListener('click', () => { PV.sess = pathSession('stage', id); if (PV.sess.done) PV.sess = null; go('zoom', 'path'); });
    const p = document.querySelector('[data-npath]'); if (p) p.addEventListener('click', () => { PV.sess = null; PV.tab = 'map'; PV.open = id; go('zoom', 'path'); }); } });
