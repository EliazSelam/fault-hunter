/* ============ Tools inside the page (v2.59) ============
   A learning session should not need anything outside the site. The book carries its own tools:
   - the drawer: related content at the side (another chapter, a term, a topic page, the chapter's formulas); the chapter stays where it is;
   - the calculator: engineering prefixes in and out (4.7k, 100n, 2.2µ), degrees or radians, a history, and a button that writes the
     result into the answer being typed;
   - the notebook: every answer written before an answer is revealed is kept, and shown beside the book's answer;
   - "I have a question": a question written in the middle of reading, kept with the place it was asked and set, at the end of the
     chapter, beside what the learner knows by then.
   Everything written is kept in this browser under fh- keys (fh-notes, fh-myq, fh-calc), so the progress backup carries it. */

/* ---- the drawer ---- */
function drawerEl() {
  let d = document.getElementById('fhDrawer'); if (d) return d;
  document.body.insertAdjacentHTML('beforeend', '<aside id="fhDrawer" class="drw" role="dialog" aria-labelledby="drwT" hidden><div class="drw-h"><b id="drwT"></b><button type="button" class="drw-x" aria-label="סגירה">✕</button></div><div class="drw-b" id="drwB"></div></aside>');
  d = document.getElementById('fhDrawer'); d.querySelector('.drw-x').addEventListener('click', drawerClose);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !d.hidden) drawerClose(); });
  return d;
}
function drawerOpen(title, html, wire) {
  const d = drawerEl(); embClose('side'); d.querySelector('#drwT').textContent = title.replace(/<[^>]+>/g, '');
  const b = d.querySelector('#drwB'); b.innerHTML = html; d.hidden = false; document.body.classList.add('drw-on'); b.scrollTop = 0;
  if (wire) wire(b); try { glossify(b); } catch (e) { } d.querySelector('.drw-x').focus({ preventScroll: true }); return b;
}
function drawerClose() { const d = document.getElementById('fhDrawer'); if (!d || d.hidden) return; embClose('side'); d.querySelector('#drwB').innerHTML = ''; d.hidden = true; document.body.classList.remove('drw-on'); }
/* any place of the site, in a frame at the side */
function drawerRoute(title, a) { drawerOpen(title, '<div class="drw-emb"></div>', b => { if (!embOpen(b.querySelector('.drw-emb'), a, title, 'side')) b.innerHTML = '<p class="note">המקום הזה לא נמצא.</p>'; }); }
/* another chapter: what it is about, at the side; moving to it is one press inside the drawer */
function drawerChapter(id) {
  const c = bookCh()[id]; if (!c) return; const C = c.central ? PCENTRAL.find(x => x.id === c.central) : null;
  drawerOpen(`פרק ${c.n}: ${c.t}`, `<p>${C ? C.why : c.why || ''}</p>${(c.goals || []).length ? `<h4>מה לומדים בו</h4><ul>${c.goals.map(g => `<li>${g}</li>`).join('')}</ul>` : ''}
    ${(c.nodes || []).length ? `<h4>הנושאים</h4><p>${c.nodes.map(n => zNode(n).t).join(' · ')}</p>` : C ? `<h4>הנושאים</h4><p>${C.items.map(x => x.t).join(' · ')}</p>` : ''}
    <p><button type="button" class="pth-go" data-goch="${id}">לעבור לפרק ${c.n} ←</button></p>`,
    b => b.querySelector('[data-goch]').addEventListener('click', () => { drawerClose(); BV.ch = id; BV.exam = null; if (document.getElementById('bkCh')) zBookView(); else go('zoom', 'book'); window.scrollTo(0, 0); }));
}
/* a term: its whole definition, and its full explanation in a frame below it */
function drawerTerm(k) {
  const r = typeof termRoute === 'function' ? termRoute(k) : null;
  drawerOpen(k, `<p>${bidi(GLOSS[k] || shortDef(k) || '')}</p>${r ? `<p><button type="button" class="pth-go" data-dr="1">📖 ההסבר המלא: ${routeTitle(r)}</button></p><div class="drw-emb"></div>` : ''}
    <p class="note"><button type="button" class="linkbtn" data-gl="1">כל המושגים, בלשונית שלהם ↗</button></p>`,
    b => { const x = b.querySelector('[data-dr]'); if (x) x.addEventListener('click', () => { x.disabled = true; embOpen(b.querySelector('.drw-emb'), 'route:' + r, routeTitle(r), 'side'); });
      b.querySelector('[data-gl]').addEventListener('click', () => { drawerClose(); go('gl', k); }); });
}
/* the chapter's formulas, all together */
function drawerFormulas(c) {
  const list = []; (c.nodes || []).forEach(n => [zNode(n).core, ...zNode(n).around].forEach(w => { if (zInfo(w).kind === 'formulas') list.push([n, w]); }));
  drawerOpen(`📐 דף הנוסחאות · פרק ${c.n}`, list.length ? list.map(([n, w]) => `<div class="drw-f" data-w="${w}"><p class="kb">${zNode(n).t}</p><div class="drw-fb"></div></div>`).join('') : '<p class="note">בפרק הזה אין חלון נוסחאות.</p>',
    b => b.querySelectorAll('.drw-f').forEach(x => { try { zMount(x.dataset.w, x.querySelector('.drw-fb')); } catch (e) { } }));
}
const bookHasFormulas = c => (c.nodes || []).some(n => [zNode(n).core, ...zNode(n).around].some(w => zInfo(w).kind === 'formulas'));

/* ---- the calculator ---- */
const CALC_KEY = 'fh-calc', CALC = { deg: true, ans: null, target: null };
const CALC_SI = { p: 1e-12, n: 1e-9, u: 1e-6, 'µ': 1e-6, 'μ': 1e-6, m: 1e-3, k: 1e3, M: 1e6, G: 1e9, T: 1e12 };
/* + - * / ^, parentheses, implicit multiplication (2pi, 3(1+2)), √, functions, constants pi e ans, a prefix after a number (4.7k = 4700),
   a comma as the decimal point. Throws on anything else. */
function calcEval(src, deg = CALC.deg, ans = CALC.ans) {
  const s = String(src).replace(/[×·∙]/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-').replace(/,/g, '.').replace(/\s+/g, '');
  if (!s) throw new Error('empty');
  let i = 0; const peek = () => s[i], fail = m => { throw new Error(m); };
  const rad = x => deg ? x * Math.PI / 180 : x, ang = x => deg ? x * 180 / Math.PI : x;
  const F = { sqrt: Math.sqrt, sin: x => Math.sin(rad(x)), cos: x => Math.cos(rad(x)), tan: x => Math.tan(rad(x)), asin: x => ang(Math.asin(x)), acos: x => ang(Math.acos(x)), atan: x => ang(Math.atan(x)),
    log: Math.log10, ln: Math.log, exp: Math.exp, abs: Math.abs };
  const K = { pi: Math.PI, 'π': Math.PI, e: Math.E, ans: ans == null ? NaN : ans };
  const num = () => { const m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(s.slice(i)); if (!m) return null; i += m[0].length; let v = parseFloat(m[0]);
    const c = s[i]; if (c && CALC_SI[c] !== undefined && !/[A-Za-zµμπ]/.test(s[i + 1] || '')) { v *= CALC_SI[c]; i++; } return v; };
  const paren = () => { if (peek() !== '(') fail('('); i++; const v = expr(); if (peek() !== ')') fail(')'); i++; return v; };
  function primary() {
    const c = peek(); if (c === undefined) fail('end');
    if (c === '(') return paren();
    if (c === '√') { i++; return Math.sqrt(power()); }
    const n = num(); if (n !== null) return n;
    const m = /^([A-Za-zπ]+)/.exec(s.slice(i)); if (!m) fail('char ' + c); i += m[0].length; const id = m[0], low = id.toLowerCase();
    if (F[low]) return F[low](peek() === '(' ? paren() : power());
    if (K[id] !== undefined) return K[id]; if (K[low] !== undefined) return K[low];
    fail('name ' + id);
  }
  function power() { const b = primary(); if (peek() === '^') { i++; return Math.pow(b, unary()); } return b; }
  function unary() { if (peek() === '-') { i++; return -unary(); } if (peek() === '+') { i++; return unary(); } return power(); }
  function term() { let v = unary(); for (;;) { const c = peek(); if (c === '*') { i++; v *= unary(); } else if (c === '/') { i++; v /= unary(); } else if (c !== undefined && /[\d.(A-Za-zπ√]/.test(c)) v *= unary(); else return v; } }
  function expr() { let v = term(); for (;;) { if (peek() === '+') { i++; v += term(); } else if (peek() === '-') { i++; v -= term(); } else return v; } }
  const v = expr(); if (i < s.length) fail('extra ' + s.slice(i)); return v;
}
/* engineering notation: a power of a thousand and its prefix, four significant digits */
function calcEng(x) {
  if (typeof x !== 'number' || !isFinite(x)) return '—'; if (x === 0) return '0';
  let e = Math.max(-12, Math.min(12, Math.floor(Math.log10(Math.abs(x)) / 3) * 3)), m = +(x / Math.pow(10, e)).toPrecision(4);
  if (Math.abs(m) >= 1000 && e < 12) { e += 3; m = +(m / 1000).toPrecision(4); }
  const P = { '-12': 'p', '-9': 'n', '-6': 'µ', '-3': 'm', '0': '', '3': 'k', '6': 'M', '9': 'G', '12': 'T' };
  return String(m) + (P[e] ? ' ' + P[e] : '');
}
/* the plain number, as an answer field takes it */
function calcPlain(x) { if (typeof x !== 'number' || !isFinite(x)) return ''; const a = Math.abs(x); return a !== 0 && (a < 1e-4 || a >= 1e9) ? x.toExponential(4).replace(/\.?0+e/, 'e') : String(+x.toPrecision(6)); }
const calcHist = () => { try { const v = JSON.parse(localStorage.getItem(CALC_KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
function calcEl() {
  let c = document.getElementById('fhCalc'); if (c) return c;
  const keys = ['(', ')', '^', '√', 'π', 'µ', 'm', 'k', 'M', 'n', 'p', 'e', '⌫'];
  document.body.insertAdjacentHTML('beforeend', `<div id="fhCalc" class="calc" role="dialog" aria-labelledby="calcT" hidden>
    <div class="calc-h"><b id="calcT">🧮 מחשבון</b><button type="button" class="calc-mode" aria-pressed="true" title="זוויות במעלות או ברדיאנים">מעלות</button><button type="button" class="calc-x" aria-label="סגירה">✕</button></div>
    <input id="calcIn" class="calc-in" dir="ltr" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="ביטוי לחישוב" placeholder="1/(2*pi*4.7k*100n)">
    <p class="calc-out" dir="ltr" aria-live="polite"><b id="calcEng">—</b> <span id="calcPl"></span></p>
    <div class="calc-keys">${keys.map(k => `<button type="button" data-k="${k}">${k}</button>`).join('')}</div>
    <p class="calc-act"><button type="button" class="pth-go" id="calcEq">=</button> <button type="button" id="calcIns" disabled>הכנס לתשובה ⬅</button> <button type="button" id="calcClr">ניקוי</button></p>
    <ol class="calc-hist" dir="ltr"></ol>
    <p class="note calc-help">קידומות אחרי מספר: p n µ (או u) m k M G. כפל בלי סימן: 2pi. פסיק או נקודה עשרונית.</p></div>`);
  c = document.getElementById('fhCalc'); const inp = c.querySelector('#calcIn');
  const show = () => { let v = null; try { v = calcEval(inp.value); } catch (e) { } c.querySelector('#calcEng').textContent = v == null || !isFinite(v) ? (inp.value.trim() ? '…' : '—') : '= ' + calcEng(v);
    c.querySelector('#calcPl').textContent = v == null || !isFinite(v) ? '' : '(' + calcPlain(v) + ')'; return v; };
  const hist = () => { c.querySelector('.calc-hist').innerHTML = calcHist().slice(-8).reverse().map((h, j) => `<li><button type="button" data-h="${j}"></button></li>`).join('');
    const H = calcHist().slice(-8).reverse(); c.querySelectorAll('[data-h]').forEach(b => { const h = H[+b.dataset.h]; b.textContent = h.x + ' = ' + calcEng(h.v); b.addEventListener('click', () => { inp.value = h.x; show(); inp.focus(); }); }); };
  const eq = () => { const v = show(); if (v == null || !isFinite(v)) return; CALC.ans = v; const H = calcHist().filter(h => h.x !== inp.value); H.push({ x: inp.value, v }); try { localStorage.setItem(CALC_KEY, JSON.stringify(H.slice(-20))); } catch (e) { } hist(); };
  inp.addEventListener('input', show); inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); eq(); } if (e.key === 'Escape') calcClose(); });
  c.querySelector('#calcEq').addEventListener('click', eq);
  c.querySelector('#calcClr').addEventListener('click', () => { inp.value = ''; show(); inp.focus(); });
  c.querySelector('.calc-x').addEventListener('click', calcClose);
  c.querySelector('.calc-mode').addEventListener('click', e => { CALC.deg = !CALC.deg; e.target.textContent = CALC.deg ? 'מעלות' : 'רדיאנים'; e.target.setAttribute('aria-pressed', CALC.deg); show(); });
  c.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.k, p = inp.selectionStart ?? inp.value.length, q = inp.selectionEnd ?? p;
    if (k === '⌫') { const a = p === q ? Math.max(0, p - 1) : p; inp.value = inp.value.slice(0, a) + inp.value.slice(q); inp.setSelectionRange(a, a); }
    else { const t = k === '√' ? '√(' : k; inp.value = inp.value.slice(0, p) + t + inp.value.slice(q); inp.setSelectionRange(p + t.length, p + t.length); } show(); inp.focus(); }));
  c.querySelector('#calcIns').addEventListener('click', () => { const v = show(), t = CALC.target; if (v == null || !isFinite(v) || !t || !t.isConnected) return; eq();
    if (t.tagName === 'TEXTAREA') { const s = calcPlain(v), p = t.selectionStart ?? t.value.length; t.value = t.value.slice(0, p) + s + t.value.slice(t.selectionEnd ?? p); } else t.value = calcPlain(v);
    t.dispatchEvent(new Event('input', { bubbles: true })); t.focus(); });
  hist(); return c;
}
function calcOpen(target) { const c = calcEl(); if (target) CALC.target = target; c.hidden = false; const ins = c.querySelector('#calcIns'); ins.disabled = !(CALC.target && CALC.target.isConnected); c.querySelector('#calcIn').focus(); }
function calcClose() { const c = document.getElementById('fhCalc'); if (c) c.hidden = true; }
/* the answer being typed is the calculator's target */
document.addEventListener('focusin', e => { const t = e.target; if (t && t.matches && t.matches('.bq-in, .bk-ans')) { CALC.target = t; const b = document.getElementById('calcIns'); if (b) b.disabled = false; } });
/* every calculator button of the site (a calculation question carries one) */
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-tool="calc"]'); if (!b) return; const box = b.closest('.bq-calc, .bk-ex, .bk-nb'); calcOpen(box ? box.querySelector('.bq-in, .bk-ans') : null); });

/* ---- the notebook: what the learner wrote, by question ---- */
const NB_KEY = 'fh-notes';
const nbLoad = () => { try { const v = JSON.parse(localStorage.getItem(NB_KEY) || '{}'); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch (e) { return {}; } };
const nbGet = k => { const x = nbLoad()[k]; return x && typeof x.a === 'string' ? x.a : ''; };
function nbSet(k, a) { const N = nbLoad(); if (a && a.trim()) N[k] = { a: a.slice(0, 4000), at: Date.now() }; else delete N[k]; try { localStorage.setItem(NB_KEY, JSON.stringify(N)); } catch (e) { } }
/* every answer field in root: restored, kept on every keystroke, and onChange told */
function nbWire(root, onChange) { root.querySelectorAll('textarea[data-nk]').forEach(t => { t.value = nbGet(t.dataset.nk); t.addEventListener('input', () => { nbSet(t.dataset.nk, t.value); if (onChange) onChange(t); }); if (onChange) onChange(t); }); }
/* the points an answer is made of, for checking one's own: its sentences */
const nbPoints = a => String(a).replace(/<[^>]+>/g, '').split(/(?<=[.;!?])\s+/).map(x => x.trim()).filter(x => x.length > 6);
/* what I wrote beside the book's answer; mine is text, never markup */
function nbCompare(mine, answerHtml) {
  const pts = nbPoints(answerHtml), h = `<div class="bk-cmp"><div><p class="kb">מה כתבתי</p><p class="bk-mine nogl"></p></div><div><p class="kb">התשובה</p><div>${answerHtml}</div></div></div>
    ${pts.length > 1 ? `<div class="bk-pts"><p class="note">מה התשובה כוללת; סמן מה היה אצלך:</p>${pts.map(p => `<label><input type="checkbox"> ${p}</label>`).join('')}</div>` : ''}`;
  const d = document.createElement('div'); d.innerHTML = h; d.querySelector('.bk-mine').textContent = mine; return d;
}

/* ---- I have a question ---- */
const MYQ_KEY = 'fh-myq';
const myqLoad = () => { try { const v = JSON.parse(localStorage.getItem(MYQ_KEY) || '[]'); return Array.isArray(v) ? v.filter(x => x && typeof x.q === 'string') : []; } catch (e) { return []; } };
const myqSave = L => { try { localStorage.setItem(MYQ_KEY, JSON.stringify(L)); } catch (e) { } };
/* the part of the chapter being read: the section across the middle of the screen (else the last one above it) */
function myqWhere() {
  const S = [...document.querySelectorAll('#bkCh > section[id]')], mid = window.innerHeight * 0.5; let cur = S[0] || null;
  S.forEach(s => { if (s.getBoundingClientRect().top < mid) cur = s; }); cur = S.find(s => { const r = s.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; }) || cur;
  if (!cur) return null; const h = cur.querySelector('h3'); return { id: cur.id, t: h ? h.childNodes[0].textContent.trim() : '' };
}
function myqForm(chId) {
  const where = myqWhere();
  drawerOpen('❓ יש לי שאלה', `<p class="note">כותבים כאן, בלי לעזוב את הפרק. השאלה נשמרת עם המקום שבו נשאלה${where ? ': <b class="drw-sec"></b>' : ''}, ובסוף הפרק היא מופיעה ליד מה שתדע אז.</p>
    <label class="bk-nbl">השאלה<textarea id="myqQ" class="bk-ans" rows="3"></textarea></label>
    <label class="bk-nbl">מה אני חושב שהתשובה (לא חובה)<textarea id="myqG" class="bk-ans" rows="2"></textarea></label>
    <p><button type="button" class="pth-go" id="myqS" disabled>שמירה</button></p>`,
    b => { if (where) b.querySelector('.drw-sec').textContent = where.t; const q = b.querySelector('#myqQ'), s = b.querySelector('#myqS');
      q.addEventListener('input', () => { s.disabled = !q.value.trim(); }); q.focus();
      s.addEventListener('click', () => { const L = myqLoad(); L.push({ id: Date.now().toString(36), ch: chId, sec: where ? where.id : '', secT: where ? where.t : '', q: q.value.trim().slice(0, 2000), guess: b.querySelector('#myqG').value.trim().slice(0, 2000), now: '', done: false, at: Date.now() });
        myqSave(L); drawerClose(); const A = document.getElementById('bkCh'); if (A && typeof bookMyqRender === 'function') bookMyqRender(A, chId); }); });
}
/* the sections of a chapter that may answer a question: the most words in common (a Hebrew word also without its one-letter prefix) */
function myqSuggest(q, A) {
  const words = [...new Set(String(q).toLowerCase().match(/[֐-׿a-z0-9-]{3,}/g) || [])], keys = words.flatMap(w => /^[והבלמשכ][֐-׿]{3,}$/.test(w) ? [w, w.slice(1)] : [w]);
  if (!keys.length) return [];
  return [...A.querySelectorAll('section.bk-topic[id], #bk-sum')].map(s => { const t = s.textContent.toLowerCase(); return { id: s.id, t: (s.querySelector('h3') || s).childNodes[0].textContent.trim(), n: keys.filter(k => t.includes(k)).length }; })
    .filter(x => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 2);
}

/* ---- the book's tool bar ---- */
function bookToolsHtml(c) {
  if (!c || c.id === 'b0') return '';
  return `<div class="bk-tools" role="toolbar" aria-label="כלים בתוך הפרק"><button type="button" data-tool="calc">🧮 מחשבון</button><button type="button" data-tool="ask">❓ יש לי שאלה</button>${bookHasFormulas(c) ? '<button type="button" data-tool="form">📐 נוסחאות</button>' : ''}</div>`;
}
function bookToolsWire(root, c) {
  root.querySelectorAll('[data-tool="ask"]').forEach(b => b.addEventListener('click', () => myqForm(c.id)));
  root.querySelectorAll('[data-tool="form"]').forEach(b => b.addEventListener('click', () => drawerFormulas(c)));
}
/* the drawer belongs to the page it was opened from */
GO_BEFORE.push(() => drawerClose());
