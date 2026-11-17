/* ============ v2.57: backing up the progress and moving it to another device ============
   Everything the course remembers lives in this browser's localStorage, under the keys that start with fh- or faulthunter- (and the theme).
   A backup is one JSON object holding those keys as text. It leaves as a file or as a text code (compressed when the browser can), and comes
   back only after a check, a summary of what it holds, and a confirmation. The state it replaces is kept for one undo. */
const BK_APP = 'fault-hunter', BK_UNDO = 'fh-undo', BK_DONE = 'fh-restored', BK_PREFS = new Set(['theme', 'fh-mode']);
/* progress worth carrying: not a preference, and not the list of pages visited, which every page load adds to */
const bkReal = k => !BK_PREFS.has(k) && k !== 'fh-visits';
const bkOwn = k => typeof k === 'string' && k !== BK_UNDO && (/^(fh-|faulthunter-)[a-z0-9-]+$/.test(k) || k === 'theme');
const bkKeys = () => { const out = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (bkOwn(k)) out.push(k); } } catch (e) { } return out.sort(); };
function bkSnapshot() { const data = {}; bkKeys().forEach(k => { try { const v = localStorage.getItem(k); if (v != null) data[k] = v; } catch (e) { } });
  return { app: BK_APP, kind: 'progress', v: 1, version: APP_VERSION, at: new Date().toISOString(), n: Object.keys(data).length, data }; }
/* a backup is accepted only whole: the right app, every key one of ours, every value the kind of text that key holds */
function bkCheck(o, undo) {
  if (!o || typeof o !== 'object' || o.app !== BK_APP || o.kind !== 'progress' || o.v !== 1 || !o.data || typeof o.data !== 'object' || Array.isArray(o.data)) return { err: 'זה לא גיבוי של המערכת הזו.' };
  const keys = Object.keys(o.data); if (typeof o.n !== 'number' || o.n !== keys.length) return { err: 'הגיבוי לא שלם: חסרים בו חלקים. העתיקו אותו שוב, עד הסוף.' };
  for (const k of keys) { const v = o.data[k]; if (!bkOwn(k) || typeof v !== 'string' || v.length > 2e6) return { err: 'בגיבוי יש חלק שלא שייך למערכת הזו, ולכן הוא לא נטען.' };
    if (BK_PREFS.has(k)) { if (!/^[a-z-]{1,20}$/.test(v)) return { err: 'בגיבוי יש הגדרה פגומה, ולכן הוא לא נטען.' }; continue; }
    try { const j = JSON.parse(v); if (!j || typeof j !== 'object') throw 0; } catch (e) { return { err: 'חלק מהגיבוי פגום, ולכן הוא לא נטען.' }; } }
  if (!undo && !keys.some(bkReal)) return { err: 'אין בגיבוי הזה התקדמות לטעון.' };   /* the undo may bring back a device that had nothing */
  return { ok: true, data: o.data, at: o.at, version: o.version }; }
/* what a backup holds, counted from its own data (nothing is read from this device) */
function bkCount(data) { const J = k => { try { return JSON.parse(data[k] || 'null'); } catch (e) { return null; } }, n = o => o && typeof o === 'object' ? (Array.isArray(o) ? o.length : Object.keys(o).length) : 0, p = J('faulthunter-v1') || {}, B = J('fh-book') || {};
  return [['🧩', 'תקלות שנפתרו', Object.values(p).filter(r => r && typeof r === 'object' && r.score !== undefined).length], ['📖', 'פרקים שסומנו כנקראו', n(B.read)], ['📝', 'מבחני פרק', n(B.exam)],
    ['🔁', 'כרטיסים בחזרה המרווחת', n(J('fh-review'))], ['❓', 'שאלות שדורגו במאגר', n(J('fh-qbank'))], ['🗺️', 'חלונות שנפתחו', n(J('fh-explored'))], ['👣', 'דפים שבוקרו', n(J('fh-visits'))]]; }
/* the text code: FH1. + base64url of the deflated JSON, or FH0. + base64url of the JSON itself where the browser cannot compress */
const bkB64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const bkUnB64 = t => { t = t.replace(/-/g, '+').replace(/_/g, '/'); while (t.length % 4) t += '='; const s = atob(t), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; };
const bkPipe = async (u8, tr) => new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(tr)).arrayBuffer());
async function bkEncode(o) { const raw = new TextEncoder().encode(JSON.stringify(o));
  if (typeof CompressionStream === 'function') { try { return 'FH1.' + bkB64(await bkPipe(raw, new CompressionStream('deflate-raw'))); } catch (e) { } } return 'FH0.' + bkB64(raw); }
/* reads a code (spaces and line breaks a messenger added are ignored, so is text around it) or the JSON of a backup file */
async function bkDecode(text) { const t = String(text || '').trim(); let o = null;
  if (t[0] === '{') { try { o = JSON.parse(t); } catch (e) { return { err: 'הקובץ לא נקרא: הוא לא שלם או שאינו קובץ גיבוי.' }; } return bkCheck(o); }
  const m = /FH([01])\.([A-Za-z0-9_-]+)/.exec(t.replace(/\s+/g, '')); if (!m) return { err: 'לא נמצא כאן קוד העברה. קוד מתחיל ב-FH1. או ב-FH0.' };
  try { let u = bkUnB64(m[2]); if (m[1] === '1') { if (typeof DecompressionStream !== 'function') return { err: 'הדפדפן הזה לא פותח קוד מכווץ. העבירו את הגיבוי כקובץ.' }; u = await bkPipe(u, new DecompressionStream('deflate-raw')); }
    o = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(u)); } catch (e) { return { err: 'הקוד לא שלם או שגוי. העתיקו אותו שוב, מ-FH ועד הסוף.' }; }
  return bkCheck(o); }
/* replacing: the progress of this device becomes the backup's; a preference the backup does not hold stays as it is. The state replaced is kept for one undo. */
function bkApply(data, keepUndo = true) { const cur = bkSnapshot();
  try { if (keepUndo) localStorage.setItem(BK_UNDO, JSON.stringify(cur)); else localStorage.removeItem(BK_UNDO);
    bkKeys().forEach(k => { if (!(k in data) && !BK_PREFS.has(k)) localStorage.removeItem(k); }); Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v));
    try { sessionStorage.setItem(BK_DONE, keepUndo ? 'load' : 'undo'); } catch (e) { } return true; }
  catch (e) { try { Object.keys(data).forEach(k => { if (!(k in cur.data)) localStorage.removeItem(k); }); Object.entries(cur.data).forEach(([k, v]) => localStorage.setItem(k, v)); } catch (e2) { } return false; } }
const bkUndoSnap = () => { try { const o = JSON.parse(localStorage.getItem(BK_UNDO) || 'null'), c = bkCheck(o, true); return c.ok ? Object.assign(c, { snap: o }) : null; } catch (e) { return null; } };
const bkDate = iso => { const d = new Date(iso); return isNaN(d) ? '?' : d.toLocaleDateString('he-IL') + ' ' + d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }); };
const bkTable = (a, b) => `<table class="bk-sum"><thead><tr><th></th>${b ? '<th>בגיבוי</th><th>במכשיר הזה עכשיו</th>' : '<th>במכשיר הזה</th>'}</tr></thead><tbody>${a.map((r, i) => `<tr><td>${r[0]} ${r[1]}</td><td><b>${r[2]}</b></td>${b ? `<td>${b[i][2]}</td>` : ''}</tr>`).join('')}</tbody></table>`;

function zBackupView() {
  const cur = bkSnapshot(), has = Object.keys(cur.data).some(bkReal), undo = bkUndoSnap(); let done = null; try { done = sessionStorage.getItem(BK_DONE); sessionStorage.removeItem(BK_DONE); } catch (e) { }
  content.innerHTML = zSubnav('backup') + `<h2>💾 גיבוי והעברת התקדמות</h2>
    ${done ? `<p class="bk-ok" role="status">✅ ${done === 'undo' ? 'המצב הקודם הוחזר.' : 'ההתקדמות נטענה. מכאן ממשיכים מאותה נקודה.'}</p>` : ''}
    <p class="lead">ההתקדמות נשמרת רק בדפדפן הזה, במכשיר הזה. כדי לעבור לטלפון או למחשב אחר, או רק לשמור עותק, מוציאים אותה כאן בקובץ או בקוד, וטוענים אותה במכשיר השני.</p>
    <div class="bk-cols"><section class="block bk-out"><h3>1. להוציא מהמכשיר הזה</h3>${has ? bkTable(bkCount(cur.data)) : '<p class="note">עוד אין במכשיר הזה התקדמות לגבות.</p>'}
      <p class="bk-btns"><button type="button" class="pth-go" id="bkFile"${has ? '' : ' disabled'}>⬇ הורדת קובץ גיבוי</button><button type="button" class="pth-go" id="bkCopy"${has ? '' : ' disabled'}>📋 העתקת קוד העברה</button>${navigator.share ? `<button type="button" class="pth-go" id="bkShare"${has ? '' : ' disabled'}>📤 שליחה</button>` : ''}</p>
      <textarea id="bkCode" class="bk-code" rows="3" readonly hidden aria-label="קוד ההעברה"></textarea><p class="note" id="bkOutMsg" aria-live="polite"></p></section>
    <section class="block bk-in"><h3>2. לטעון אל המכשיר הזה</h3><p class="note">קובץ גיבוי, או קוד שהעתקתם במכשיר אחר (גם אם נשלח בהודעה).</p>
      <p class="bk-btns"><label class="pth-go bk-filebtn">📂 טעינה מקובץ<input type="file" id="bkIn" accept=".json,application/json,text/plain"></label></p>
      <textarea id="bkPaste" class="bk-code" rows="3" placeholder="הדביקו כאן קוד שמתחיל ב-FH1." aria-label="קוד העברה להדבקה"></textarea><p class="bk-btns"><button type="button" class="pth-go" id="bkRead">בדיקת הקוד</button></p>
      <div id="bkPrev" aria-live="polite"></div>
      ${undo ? `<p class="bk-undo"><button type="button" class="linkbtn" id="bkUndo">↩ החזרת המצב שהיה לפני הטעינה האחרונה (${bkDate(undo.snap.at)})</button></p>` : ''}</section></div>
    <p class="note">נשמרים: התקדמות בספר ובמבחני הפרקים, תקלות שנפתרו, החזרה המרווחת והסשן היומי, הנתיב, מאגר השאלות, החלונות שנפתחו וההגדרות (מצב תצוגה ושפה פשוטה). לא נשמר: מצב של חלון פתוח, שנזכר רק עד סגירת הלשונית. הגיבוי לא יוצא מהמכשיר אלא אם שלחתם אותו בעצמכם.</p>`;
  zWireSub(); const $$ = s => content.querySelector(s), outMsg = $$('#bkOutMsg'), code = $$('#bkCode'), prev = $$('#bkPrev');
  const fresh = () => bkSnapshot(), getCode = async () => { const c = await bkEncode(fresh()); code.value = c; code.hidden = false; return c; };
  if ($$('#bkFile')) $$('#bkFile').addEventListener('click', () => { const o = fresh(), a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(o, null, 1)], { type: 'application/json' })); a.download = `fault-hunter-progress-${o.at.slice(0, 10)}.json`; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000); outMsg.textContent = 'הקובץ ירד. פתחו את הדף הזה במכשיר השני ובחרו "טעינה מקובץ".'; });
  if ($$('#bkCopy')) $$('#bkCopy').addEventListener('click', async () => { const c = await getCode(); const ok = await (navigator.clipboard ? navigator.clipboard.writeText(c).then(() => true, () => false) : Promise.resolve(false)); if (!ok) { code.focus(); code.select(); try { document.execCommand('copy'); } catch (e) { } }
    outMsg.textContent = (ok ? 'הקוד הועתק' : 'הקוד מסומן: העתיקו אותו') + ` (${c.length.toLocaleString('he-IL')} תווים). הדביקו אותו בדף הזה במכשיר השני.`; });
  if ($$('#bkShare')) $$('#bkShare').addEventListener('click', async () => { const c = await getCode(); try { await navigator.share({ title: 'גיבוי ההתקדמות', text: c }); outMsg.textContent = 'נשלח. הדביקו את הקוד בדף הזה במכשיר השני.'; } catch (e) { outMsg.textContent = 'השליחה בוטלה. אפשר להעתיק את הקוד מהתיבה.'; } });
  /* reading a backup: a summary beside this device's state, then a confirmation */
  const show = r => { if (!r.ok) { prev.innerHTML = `<p class="bk-err" role="alert">${r.err}</p>`; return; }
    prev.innerHTML = `<h4>מה יש בגיבוי${r.at ? ` מ-${bkDate(r.at)}` : ''}${r.version ? ` (גרסה ${pathEsc(String(r.version))})` : ''}</h4>${bkTable(bkCount(r.data), bkCount(fresh().data))}
      <p class="bk-warn">הטעינה מחליפה את ההתקדמות שבמכשיר הזה בזו שבגיבוי. המצב הנוכחי נשמר לביטול אחד.</p><p class="bk-btns"><button type="button" class="pth-go" id="bkGo">✅ להחליף ולטעון</button><button type="button" class="linkbtn" id="bkNo">ביטול</button></p>`;
    $$('#bkGo').addEventListener('click', () => { if (bkApply(r.data)) location.reload(); else prev.innerHTML = '<p class="bk-err" role="alert">הדפדפן לא שמר את הגיבוי (אין מקום או שהשמירה חסומה). שום דבר לא השתנה.</p>'; });
    $$('#bkNo').addEventListener('click', () => { prev.innerHTML = ''; }); };
  $$('#bkRead').addEventListener('click', async () => show(await bkDecode($$('#bkPaste').value)));
  $$('#bkIn').addEventListener('change', async e => { const f = e.target.files && e.target.files[0]; if (!f) return; if (f.size > 8e6) { show({ err: 'הקובץ גדול מדי לגיבוי של המערכת הזו.' }); return; } show(await bkDecode(await f.text())); e.target.value = ''; });
  if ($$('#bkUndo')) $$('#bkUndo').addEventListener('click', () => { const u = bkUndoSnap(); if (u && confirm('להחזיר את המצב שהיה לפני הטעינה האחרונה?') && bkApply(u.data, false)) location.reload(); });
  setTitle('זום', 'גיבוי והעברה', 'ההתקדמות, מכשיר למכשיר');
}
/* not in the views bar: reached from the course board, the memory tab, and the footer of every page */
ZVIEW.add('backup', { render: () => zBackupView() });
(f => { if (f) f.insertAdjacentHTML('beforeend', ' · <a href="#/zoom/backup">💾 גיבוי והעברת התקדמות</a>'); })(document.querySelector('footer'));
