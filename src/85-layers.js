/* ============ The right layers first, information bundled, more of the physics animated ============ */

/* ---- 1. the views bar: what a learner needs first; the method's proofs behind the scenes ---- */
/* ---- 2. a world map of the topics, with the numbers that matter ---- */
function zWorldView() {
  const topics = zMachineTopics(), ex = zExplored(), sims = zSimList(), wins = new Set(ZOOM.flatMap(zWindows));
  const anims = sims.filter(s => s.kind === 'anim').length, got = topics.filter(t => ex.has(t.id)).length;
  const W = 1000, H = 640, id2i = new Map(topics.map((t, i) => [t.id, i])), deg = topics.map(() => 0), edges = [];
  topics.forEach(t => t.parts.forEach(p => { if (id2i.has(p)) { const a = id2i.get(t.id), b = id2i.get(p); edges.push([a, b]); deg[a]++; deg[b]++; } }));
  const col = id => zCtx(id) === 'AOS' ? '#7B5A3C' : zCtx(id) === 'AOI' ? '#3078B0' : '#D6E8F7';
  /* the scales are the rings: the process in the middle, components at the rim */
  const ringR = lvl => [0, 395, 315, 235, 150, 0][lvl];
  const nodes = topics.map((t, i) => ({ t, i, x: W / 2 + Math.cos(i * 2.399) * (ringR(t.level) + 20), y: H / 2 + Math.sin(i * 2.399) * (ringR(t.level) + 20) * 0.72, vx: 0, vy: 0, r: 4.5 + t.level * 1.9 + Math.sqrt(deg[i]) * 1.1, fx: false }));
  function tickSim(alpha) {
    for (let a = 0; a < nodes.length; a++) for (let b = a + 1; b < nodes.length; b++) { const A = nodes[a], B = nodes[b]; let dx = A.x - B.x, dy = A.y - B.y, d2 = dx * dx + dy * dy + 0.01; if (d2 > 120000) continue; const f = 3800 / d2 * alpha, d = Math.sqrt(d2); dx /= d; dy /= d; A.vx += dx * f; A.vy += dy * f; B.vx -= dx * f; B.vy -= dy * f; }
    edges.forEach(([a, b]) => { const A = nodes[a], B = nodes[b]; let dx = B.x - A.x, dy = B.y - A.y; const d = Math.sqrt(dx * dx + dy * dy) + 0.01, f = (d - 80) * 0.006 * alpha; dx /= d; dy /= d; A.vx += dx * f; A.vy += dy * f; B.vx -= dx * f; B.vy -= dy * f; });
    nodes.forEach(n => { const dx = n.x - W / 2, dy = (n.y - H / 2) / 0.72, d = Math.sqrt(dx * dx + dy * dy) + 0.01, f = (ringR(n.t.level) - d) * 0.06 * alpha; n.vx += dx / d * f; n.vy += dy / d * f * 0.72; if (n.fx) { n.vx = n.vy = 0; return; } n.vx *= 0.8; n.vy *= 0.8; n.x = Math.max(30, Math.min(W - 30, n.x + n.vx)); n.y = Math.max(24, Math.min(H - 24, n.y + n.vy)); });
  }
  for (let k = 0; k < 420; k++) tickSim(Math.max(0.05, 1 - k / 420));
  const stat = (n, t, s = '') => `<div class="wstat"><b>${n}</b><span>${t}</span>${s ? `<small>${s}</small>` : ''}</div>`;
  const lblBig = n => n.t.level >= 4;
  content.innerHTML = zSubnav('world') + `<h2>מפת עולם</h2>
    <div class="wstats">${stat(`${got}/${topics.length}`, 'נושאים שביקרת בהם', `${Math.round(100 * got / topics.length)}%`)}${stat(sims.length - anims, 'סימולציות והדגמות')}${stat(anims, 'הנפשות פיזיקה ומתמטיקה')}${stat(wins.size, 'חלונות, לכל אחד בית אחד')}${stat(topics.filter(t => zCtx(t.id) === 'AOI').length, 'נושאים ייחודיים ל-AOI')}${stat(topics.filter(t => zCtx(t.id) === 'AOS').length, 'נושאים ייחודיים ל-AOS')}</div>
    <p class="lead">כל נושא הוא נקודה, וכל קו הוא "בנוי מ". התהליך במרכז, והרכיבים בטבעת החיצונית. ריחוף על נקודה מאיר אותה ואת שכנותיה. גרירה מזיזה, ולחיצה פותחת. נקודה מלאה היא נושא שכבר ביקרת בו.</p>
    <div class="wtools"><label class="vh" for="wq">חיפוש בגרף</label><input id="wq" type="search" placeholder="חיפוש נושא בגרף…"><span class="ztctx">${[['all', 'הכל'], ['AOI', 'AOI'], ['AOS', 'AOS'], ['SHARED', 'משותף']].map(([k, t]) => `<button type="button" data-wf="${k}" aria-pressed="${k === 'all'}">${t}</button>`).join('')}</span></div>
    <div class="wmapwrap wdark"><svg class="wmap" viewBox="0 0 ${W} ${H}" role="group" aria-label="גרף הנושאים: כל נקודה היא כפתור">
      <g class="wrings">${[1, 2, 3, 4].map(l => `<ellipse cx="${W / 2}" cy="${H / 2}" rx="${ringR(l)}" ry="${ringR(l) * 0.72}" fill="none" stroke="#D6E8F7" stroke-opacity="0.07"/>`).join('')}</g>
      <g class="wedges">${edges.map(([a, b]) => `<line data-a="${a}" data-b="${b}" stroke="#D6E8F7" stroke-opacity="0.22"/>`).join('')}</g>
      <g class="wnodes">${nodes.map(n => { const seen = ex.has(n.t.id); return `<g class="wcity${lblBig(n) ? ' big' : n.t.level === 4 ? ' lvl4' : ''}" data-zn="${n.t.id}" data-i="${n.i}" data-c="${zCtx(n.t.id)}" tabindex="0" role="button" aria-label="${n.t.t}"><circle r="${n.r.toFixed(1)}" fill="${seen ? col(n.t.id) : '#1B2F5A'}" stroke="${col(n.t.id)}" stroke-width="${seen ? 1 : 1.8}"/><text y="${(n.r + 12).toFixed(1)}" text-anchor="middle">${n.t.t.split(':')[0]}</text></g>`; }).join('')}</g></svg></div>
    <p class="wlegend wl2"><span style="--c:#3078B0">AOI</span><span style="--c:#7B5A3C">AOS</span><span style="--c:#D6E8F7">משותף</span><span class="hollow">עוד לא ביקרת</span></p>
    <details class="wlist"><summary>כל הנושאים כרשימה</summary><ul>${topics.filter(t => t.level >= 4).map(c => `<li><button type="button" class="linkbtn" data-zn="${c.id}">${c.t}</button>${ex.has(c.id) ? ' ✓' : ''}<ul>${topics.filter(t => t.level < 4 && zMainPath(t.id).some(p => p.id === c.id)).map(t => `<li><button type="button" class="linkbtn" data-zn="${t.id}">${t.t}</button>${ex.has(t.id) ? ' ✓' : ''}</li>`).join('')}</ul></li>`).join('')}${topics.filter(t => t.level < 4 && !topics.some(c => c.level >= 4 && zMainPath(t.id).some(p => p.id === c.id))).map(t => `<li><button type="button" class="linkbtn" data-zn="${t.id}">${t.t}</button>${ex.has(t.id) ? ' ✓' : ''}</li>`).join('')}</ul></details>`;
  zWireSub();
  const svg = content.querySelector('.wmap'), gs = [...svg.querySelectorAll('.wcity')], ls = [...svg.querySelectorAll('.wedges line')];
  const place = () => { gs.forEach((g, k) => g.setAttribute('transform', `translate(${nodes[k].x.toFixed(1)} ${nodes[k].y.toFixed(1)})`)); ls.forEach(l => { const a = nodes[+l.dataset.a], b = nodes[+l.dataset.b]; l.setAttribute('x1', a.x.toFixed(1)); l.setAttribute('y1', a.y.toFixed(1)); l.setAttribute('x2', b.x.toFixed(1)); l.setAttribute('y2', b.y.toFixed(1)); }); };
  place();
  const nb = i => new Set([i, ...edges.filter(([a, b]) => a === i || b === i).flatMap(e => e)]);
  const focus = i => { svg.classList.add('dim'); const s = nb(i); gs.forEach((g, k) => { g.classList.toggle('nb', s.has(k)); g.classList.toggle('hot', k === i); }); ls.forEach(l => l.classList.toggle('hot', +l.dataset.a === i || +l.dataset.b === i)); };
  const unfocus = () => { svg.classList.remove('dim'); gs.forEach(g => g.classList.remove('nb', 'hot')); ls.forEach(l => l.classList.remove('hot')); };
  let drag = null, moved = false, raf = 0, alpha = 0;
  const reheat = () => { alpha = 0.35; if (!raf) raf = requestAnimationFrame(loop); };
  const loop = () => { raf = 0; if (!document.body.contains(svg)) return; tickSim(alpha); alpha *= 0.96; place(); if (alpha > 0.01 || drag) raf = requestAnimationFrame(loop); };
  const pt = e => { const r = svg.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
  gs.forEach((g, k) => {
    g.addEventListener('pointerenter', () => focus(k)); g.addEventListener('pointerleave', unfocus); g.addEventListener('focus', () => focus(k)); g.addEventListener('blur', unfocus);
    g.addEventListener('pointerdown', e => { drag = k; moved = false; nodes[k].fx = true; g.setPointerCapture && g.setPointerCapture(e.pointerId); });
    g.addEventListener('pointermove', e => { if (drag !== k) return; const [x, y] = pt(e); if (Math.hypot(x - nodes[k].x, y - nodes[k].y) > 3) moved = true; nodes[k].x = Math.max(30, Math.min(W - 30, x)); nodes[k].y = Math.max(24, Math.min(H - 24, y)); reheat(); });
    g.addEventListener('pointerup', () => { if (drag === k) { nodes[k].fx = false; drag = null; reheat(); } });
    g.addEventListener('click', () => { if (moved) { moved = false; return; } ZS.dir = 1; go('zoom', g.dataset.zn); });
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ZS.dir = 1; go('zoom', g.dataset.zn); } });
  });
  content.querySelectorAll('.wlist [data-zn]').forEach(b => b.addEventListener('click', () => { ZS.dir = 1; go('zoom', b.dataset.zn); }));
  let flt = 'all', q = '';
  const apply = () => { const qq = q.trim().toLowerCase(); gs.forEach((g, k) => { const okF = flt === 'all' || g.dataset.c === flt || (flt !== 'SHARED' && g.dataset.c === 'SHARED' && false), okQ = !qq || nodes[k].t.t.toLowerCase().includes(qq); g.classList.toggle('off', !okF); g.classList.toggle('match', !!qq && okQ && okF); g.classList.toggle('nomatch', !!qq && !okQ); }); ls.forEach(l => l.classList.toggle('off', gs[+l.dataset.a].classList.contains('off') || gs[+l.dataset.b].classList.contains('off'))); };
  content.querySelectorAll('[data-wf]').forEach(b => b.addEventListener('click', () => { flt = b.dataset.wf; content.querySelectorAll('[data-wf]').forEach(x => x.setAttribute('aria-pressed', x === b)); apply(); }));
  content.querySelector('#wq').addEventListener('input', e => { q = e.target.value; apply(); });
  setTitle('זום', 'מפת עולם', `${got} מתוך ${topics.length} נחקרו`);
}
ZVIEW.add('world', { group: 'main', order: 2, title: 'מפת עולם', render: () => zWorldView() });

/* ---- 3. information bundled: windows grouped by subject inside a hub, long text as a summary first ---- */
const winSubject = w => { const [k, a] = w.split(':'); if (k === 'c') { const C = COMPONENTS.find(x => x.id === a); return C ? C.name.replace(/<[^>]+>/g, '').split(':')[0] : a; } if (k === 't') { const T = TOPICS.find(x => x.id === a); return T ? T.t.split(':')[0] : a; } return ''; };
/* after a hub opens: its pills grouped by subject, each pill named by what it is (or by its title when that is not enough) */
function hubAfterRender(id, h, showHub) {
  if ((location.hash || '').startsWith('#/zoom/' + id) && HS.win[id]) zSetAddress(zWindowAddress(id, h, HS.win[id]));
  const nav = content.querySelector('.hubpills');
  if (nav) {
    const btns = [...nav.querySelectorAll('button')], groups = {};
    btns.forEach(b => { const s = winSubject(b.dataset.hw) || 'כללי'; (groups[s] = groups[s] || []).push(b.dataset.hw); });
    const label = (w, list) => { const k = zInfo(w).kind, kl = (ZKIND[k] || [k])[0], same = list.filter(x => zInfo(x).kind === k).length; const t = zInfo(w).t; return same > 1 ? (t.length > 34 ? t.slice(0, 32) + '…' : t) : kl; };
    const multi = Object.keys(groups).length > 1;
    nav.innerHTML = Object.entries(groups).map(([s, ws]) => `<div class="hubgrp">${multi ? `<span class="hubgt">${s}</span>` : ''}${ws.map(w => `<button type="button" data-hw="${w}" aria-pressed="${w === HS.win[id]}" title="${zInfo(w).t.replace(/"/g, '&quot;')}">${label(w, ws)}</button>`).join('')}</div>`).join('');
    nav.querySelectorAll('[data-hw]').forEach(b => b.addEventListener('click', () => { HS.win[id] = b.dataset.hw; showHub(h); }));
  }
  zClampText();
}
/* a long text window shows its first part, and opens on request */
const TEXTKINDS = new Set(['story', 'steps', 'parts', 'words', 'reading', 'wrong', 'card', 'say', 'eng']);
function zClampText() {
  const sec = content.querySelector('#hubpanel .zwin'); if (!sec || !TEXTKINDS.has(zInfo(sec.dataset.w).kind)) return;
  const body = sec.querySelector('.zbody'); requestAnimationFrame(() => { if (body.scrollHeight < 480) return; body.classList.add('clamp'); body.insertAdjacentHTML('afterend', '<p class="clampmore"><button type="button">הצג את כל הטקסט ↓</button></p>');
    sec.querySelector('.clampmore button').addEventListener('click', e => { body.classList.remove('clamp'); e.target.closest('.clampmore').remove(); }); });
}
/* ---- 4. four more derivations, animated ---- */
Object.assign(ANIMS, {
  quad: { node: 'enc', t: 'אנקודר: שני ערוצים, פי ארבע רזולוציה, וכיוון',
    params: [['N', 'קווים לסיבוב N', 100, 5000, 100, 2500, ''], ['lead', 'הובלת הבורג', 2, 20, 1, 10, 'mm'], ['rpm', 'מהירות', 0, 3000, 50, 1500, 'rpm']],
    calc: P => ({ res: P.lead * 1000 / (4 * P.N), fA: P.N * P.rpm / 60 / 1000, fc: 4 * P.N * P.rpm / 60 / 1000, deg: 360 / (4 * P.N) }),
    steps: [(P, V) => `שני ערוצים, A ו-B, עם אותו מספר קווים, מוזזים ברבע מחזור (90°).`,
      (P, V) => `כל קצה, עולה או יורד, בכל אחד מהערוצים, הוא ספירה: ארבע ספירות לכל קו. ${P.N} קווים נותנים ${4 * P.N} ספירות לסיבוב.`,
      (P, V) => `הכיוון: אם A מקדים את B, סופרים למעלה. אם B מקדים, סופרים למטה.`,
      (P, V) => `על בורג עם הובלה של ${P.lead} mm: Δx = הובלה / (4N) = <b>${f1(V.res, 2)} µm</b> לספירה.`,
      (P, V) => `בקצב של ${P.rpm} rpm, ערוץ A מחליף ב-<b>${f1(V.fA)} kHz</b>, והספירות מגיעות ב-${f1(V.fc)} kHz. הכרטיס שקורא חייב לעמוד בזה.`],
    draw(ctx, W, H, P, V, s, tm) {
      const x0 = 40, w = W - 80, per = 90, sh = (tm * 60) % per, yA = 90, yB = 190, hh = 50;
      const wave = (y, ph, c) => { ctx.strokeStyle = c; ctx.lineWidth = 2.5; ctx.beginPath(); for (let x = 0; x <= w; x += 1) { const u = ((x + sh + ph) % per) / per, hi = u < 0.5; const yy = hi ? y - hh : y; x ? ctx.lineTo(x0 + x, yy) : ctx.moveTo(x0 + x, yy); } ctx.stroke(); ctx.lineWidth = 1; };
      wave(yA, 0, AC.live); wave(yB, per / 4, AC.ink);
      if (s >= 1) { ctx.strokeStyle = AC.mech; ctx.globalAlpha = 0.6; for (let k = -2; k < w / (per / 4) + 2; k++) { const x = x0 + k * per / 4 - (sh % (per / 4)); if (x < x0 || x > x0 + w) continue; ctx.beginPath(); ctx.moveTo(x, yA - hh - 10); ctx.lineTo(x, yB + 10); ctx.stroke(); } ctx.globalAlpha = 1; }
      ctx.fillStyle = AC.text; ctx.font = '13px system-ui, sans-serif'; ctx.fillText('A', x0 - 22, yA - 20); ctx.fillText('B', x0 - 22, yB - 20);
      if (s >= 1) ctx.fillText('every edge on A or B = one count (dashed)', x0, yB + 34);
      if (s >= 2) ctx.fillText('A leads B → count up', x0, yB + 54);
      if (s >= 3) { ctx.fillStyle = AC.ink; ctx.font = '600 15px system-ui, sans-serif'; ctx.fillText(`Δx = ${f1(V.res, 2)} µm per count · ${4 * P.N} counts/rev`, x0, H - 40); }
      if (s >= 4) { ctx.fillStyle = AC.mech; ctx.font = '600 14px system-ui, sans-serif'; ctx.fillText(`A: ${f1(V.fA)} kHz · counts: ${f1(V.fc)} kHz`, x0, H - 16); }
    } },
  pwmr: { node: 'pwm', t: 'PWM: מתח ממוצע וגליות הזרם במנוע',
    params: [['D', 'מחזור עבודה D', 0.05, 0.95, 0.01, 0.6, ''], ['f', 'תדר מיתוג f', 1, 40, 1, 20, 'kHz'], ['L', 'השראות המנוע L', 0.5, 5, 0.1, 1, 'mH']],
    calc: P => { const V = 24, Vavg = P.D * V, dI = V * P.D * (1 - P.D) / (P.L * 1e-3 * P.f * 1e3); return { V, Vavg, dI }; },
    steps: [(P, V) => `הטרנזיסטורים בגשר נדלקים ונכבים ${P.f} אלף פעמים בשנייה. המתח על המנוע קופץ בין 0 ל-${V.V} V.`,
      (P, V) => `המנוע מגיב לממוצע, לא לקפיצות: V_avg = D · V = ${P.D} × ${V.V} = <b>${f1(V.Vavg)} V</b>.`,
      (P, V) => `השראות המנוע מחליקה את הזרם: בזמן הדולק הוא עולה בשיפוע (V − V_avg)/L, ובזמן הכבוי יורד בשיפוע V_avg/L.`,
      (P, V) => `גליות הזרם: ΔI = V · D(1 − D) / (L · f) = <b>${f1(V.dI * 1000)} mA</b> מראש לראש. היא הגדולה ביותר ב-D = 0.5.`,
      (P, V) => `תדר גבוה יותר או השראות גבוהה יותר מקטינים את הגליות, ובמחיר של הפסדי מיתוג בטרנזיסטורים.`],
    draw(ctx, W, H, P, V, s, tm) {
      const x0 = 40, w = W - 80, per = 120, sh = (tm * 40) % per, yV = 130, hV = 90, yI = H - 50, hI = 110;
      ctx.strokeStyle = AC.ink; ctx.lineWidth = 2.5; ctx.beginPath(); for (let x = 0; x <= w; x++) { const u = ((x + sh) % per) / per, y = u < P.D ? yV - hV : yV; x ? ctx.lineTo(x0 + x, y) : ctx.moveTo(x0 + x, y); } ctx.stroke(); ctx.lineWidth = 1;
      if (s >= 1) { ctx.strokeStyle = AC.live; ctx.setLineDash([8, 5]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, yV - hV * P.D); ctx.lineTo(x0 + w, yV - hV * P.D); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1; }
      if (s >= 2) { const amp = Math.min(hI * 0.45, 18 + V.dI * 120); ctx.strokeStyle = AC.mech; ctx.lineWidth = 2.5; ctx.beginPath(); for (let x = 0; x <= w; x++) { const u = ((x + sh) % per) / per, tri = u < P.D ? u / P.D : 1 - (u - P.D) / (1 - P.D), y = yI - hI / 2 - amp * (tri - 0.5); x ? ctx.lineTo(x0 + x, y) : ctx.moveTo(x0 + x, y); } ctx.stroke(); ctx.lineWidth = 1; }
      ctx.fillStyle = AC.text; ctx.font = '13px system-ui, sans-serif'; ctx.fillText(`motor voltage 0–${V.V} V`, x0, yV - hV - 10); if (s >= 1) ctx.fillText(`average ${f1(V.Vavg)} V`, x0 + w - 110, yV - hV * P.D - 8); if (s >= 2) ctx.fillText(`motor current (ripple ${f1(V.dI * 1000)} mA p-p)`, x0, yI - hI - 4);
    } },
  drop: { node: 'pwr', t: 'נפילת מתח בכבל: למה מודדים בקצה',
    params: [['I', 'זרם I', 0.5, 10, 0.1, 2, 'A'], ['Lc', 'אורך הכבל L', 1, 30, 1, 12, 'm'], ['A', 'חתך A', 0.5, 2.5, 0.25, 0.75, 'mm²']],
    calc: P => { const R = 2 * PW.rho * P.Lc / P.A, dV = P.I * R, Vend = PW.V - dV, Lmax = (PW.V - PW.Vmin) * P.A / (2 * PW.rho * P.I); return { R, dV, Vend, Lmax, Ploss: P.I * P.I * R, ok: Vend >= PW.Vmin }; },
    steps: [(P, V) => `הספק נותן ${PW.V} V בהדקים שלו. אבל המתח שחשוב הוא זה שמגיע לצרכן.`,
      (P, V) => `לכבל נחושת יש התנגדות: R = ρ · 2L / A, פעמיים כי הזרם הולך וחוזר. כאן: <b>${f1(V.R, 3)} Ω</b>.`,
      (P, V) => `הזרם מפיל עליו מתח: ΔV = I · R = <b>${f1(V.dV, 2)} V</b>, ומחמם אותו ב-${f1(V.Ploss, 1)} W.`,
      (P, V) => `בצרכן נשאר V = ${PW.V} − ${f1(V.dV, 2)} = <b>${f1(V.Vend, 2)} V</b>. ${V.ok ? 'מעל' : '<b>מתחת</b> ל-'} ${PW.Vmin} V, הגבול התחתון.`,
      (P, V) => `האורך המקסימלי בזרם ובחתך האלה: L_max = (V − V_min) · A / (2ρI) = <b>${f1(V.Lmax)} m</b>. לכן מודדים בקצה, בעומס.`],
    draw(ctx, W, H, P, V, s, tm) {
      const x0 = 70, x1 = W - 90, y = 120, len = x1 - x0;
      ctx.fillStyle = AC.ink; ctx.fillRect(x0 - 50, y - 30, 50, 60); ctx.fillStyle = AC.mech; ctx.fillRect(x1, y - 30, 50, 60);
      for (let i = 0; i <= 60; i++) { const v = PW.V - V.dV * i / 60, g = Math.max(0, Math.min(1, (v - 18) / 6)); ctx.fillStyle = `rgba(48,120,176,${0.25 + 0.75 * g})`; ctx.fillRect(x0 + len * i / 60, y - 6, len / 60 + 1, 12); }
      if (s >= 2) { const ph = (tm * 120) % 40; ctx.fillStyle = AC.cream; for (let x = x0 + ph; x < x1; x += 40) { ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill(); } }
      ctx.fillStyle = AC.text; ctx.font = '13px system-ui, sans-serif'; ctx.fillText(`PSU ${PW.V} V`, x0 - 52, y - 40); ctx.fillText('load', x1 + 8, y - 40); ctx.fillText(`cable: ${P.Lc} m · ${P.A} mm²`, x0 + len / 2 - 60, y - 22);
      const gy = H - 40, gh = 170, Y = v => gy - gh * (v - 18) / 7; ctx.strokeStyle = AC.text; ctx.globalAlpha = 0.5; ctx.strokeRect(x0, gy - gh, len, gh); ctx.globalAlpha = 1;
      ctx.strokeStyle = AC.mech; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(x0, Y(PW.Vmin)); ctx.lineTo(x1, Y(PW.Vmin)); ctx.stroke(); ctx.setLineDash([]);
      if (s >= 1) { ctx.strokeStyle = AC.live; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, Y(PW.V)); ctx.lineTo(x1, Y(Math.max(18, V.Vend))); ctx.stroke(); ctx.lineWidth = 1; }
      if (s >= 3) { ctx.fillStyle = V.ok ? AC.ink : AC.mech; ctx.beginPath(); ctx.arc(x1, Y(Math.max(18, V.Vend)), 6, 0, 7); ctx.fill(); ctx.font = '600 14px system-ui, sans-serif'; ctx.fillText(`${f1(V.Vend, 2)} V at the load`, x1 - 150, Y(Math.max(18, V.Vend)) - 10); }
      ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('voltage along the cable (18–25 V) · dashed = 21.6 V', x0, gy - gh - 6);
    } },
  frame: { node: 'ecat', t: 'EtherCAT: כמה זמן לוקחת מסגרת אחת',
    params: [['bytes', 'נתונים נוספים במחזור', 0, 12000, 100, 0, 'B'], ['Tc', 'זמן מחזור', 0.25, 4, 0.25, 1, 'ms']],
    calc: P => { const r = ecatCalc({ bytes: P.bytes, Tcyc: P.Tc * 1e-3 }); return { tF: r.tFrame * 1e6, util: r.util * 100, n: r.n, data: r.data, over: r.util > 0.8 }; },
    steps: [(P, V) => `מסגרת אחת יוצאת מהבקר בכל מחזור ועוברת דרך כל ${V.n} הסלייבים. כל אחד קורא וכותב את החלק שלו בזמן שהיא עוברת.`,
      (P, V) => `זמן השידור: ביטים חלקי קצב. ${V.data + 30} בתים × 8 ÷ 100 Mbit/s.`,
      (P, V) => `ועוד השהייה קטנה בכל סלייב, כמיקרו-שנייה: t = 8·B/R + n·t_node = <b>${f1(V.tF)} µs</b>.`,
      (P, V) => `מתוך מחזור של ${P.Tc} ms, המסגרת תופסת <b>${f1(V.util)}%</b>.`,
      (P, V) => V.over ? `<b>מעל 80%:</b> אין זמן לעיבוד ולסנכרון. מקטינים נתונים, או מאריכים את המחזור.` : `מתחת ל-80% יש מרווח לעיבוד ולסנכרון השעונים. הוסיפו נתונים בסליידר ותראו מתי זה נשבר.`],
    draw(ctx, W, H, P, V, s, tm) {
      const x0 = 60, y = 90, gap = (W - 140) / (V.n + 1);
      ctx.fillStyle = AC.ink; ctx.fillRect(x0 - 40, y - 20, 50, 40); for (let i = 1; i <= V.n; i++) { ctx.fillStyle = AC.tint; ctx.fillRect(x0 + gap * i - 18, y - 18, 36, 36); ctx.strokeStyle = AC.ink; ctx.strokeRect(x0 + gap * i - 18, y - 18, 36, 36); }
      const u = (tm * 0.5) % 1, out = u < 0.5, k = out ? u * 2 : 2 - u * 2, fx = x0 + gap * V.n * k, fy = out ? y - 30 : y + 30;
      if (s >= 0) { ctx.fillStyle = AC.live; ctx.fillRect(fx - 14, fy - 7, 28, 14); }
      ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('master', x0 - 40, y + 36); ctx.fillText('frame out, through every slave, and back', x0, y - 46);
      const bx = x0, bw = W - 120, by = H - 90, bh = 34; ctx.strokeStyle = AC.text; ctx.globalAlpha = 0.5; ctx.strokeRect(bx, by, bw, bh); ctx.globalAlpha = 1;
      if (s >= 1) { const fw = Math.min(1, V.util / 100) * bw; ctx.fillStyle = V.over ? AC.mech : AC.live; ctx.fillRect(bx, by, Math.max(2, fw), bh); }
      ctx.strokeStyle = AC.ink; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(bx + bw * 0.8, by - 8); ctx.lineTo(bx + bw * 0.8, by + bh + 8); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = AC.text; ctx.fillText(`one cycle = ${P.Tc} ms · dashed = 80%`, bx, by - 12); if (s >= 2) { ctx.font = '600 14px system-ui, sans-serif'; ctx.fillStyle = AC.ink; ctx.fillText(`frame ${f1(V.tF)} µs = ${f1(V.util)}% of the cycle`, bx, by + bh + 24); }
    } }
});
['quad', 'pwmr', 'drop', 'frame'].forEach(id => { const n = zNode(ANIMS[id].node); if (n && !n.around.includes('anim:' + id)) n.around.unshift('anim:' + id); });
