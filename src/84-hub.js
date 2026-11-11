/* ============ A topic as an object with its ways of understanding around it ============
   The topic's own object in the middle (its part of the machine, or its parts exploded), and six hubs around it.
   A hub opens one window at a time; less text on screen, more to look at. */
/* the lens is an assembly too */
INNER.optics = [IB('optics', 'עדשה קדמית', [-0.55, 0.55, -0.55, 0.55, 0.55, 0.75], [0, 0, 0.8], 'tint'), IB('optics', 'עדשה אמצעית', [-0.45, 0.45, -0.45, 0.45, 0.1, 0.3], [0, 0, 0.3], 'live'), IB('optics', 'עדשה אחורית', [-0.4, 0.4, -0.4, 0.4, -0.35, -0.15], [0, 0, -0.2], 'tint'), IB('optics', 'גוף העדשה ותושבת הטיה', [-0.65, 0.65, -0.65, 0.65, -0.75, -0.55], [0, 0, -0.8], 'ink'), IB('optics', 'מנוע מיקוד', [0.8, 1.1, -0.15, 0.15, -0.3, 0.3], [0.9, 0, 0], 'mech')];
INNER.optics.forEach(ip => { if (/עדשה/.test(ip.t) && !/גוף/.test(ip.t)) ip.t = ip.t; });
const HUBS = [
  ['demo', 'הדגמה וסימולציה', 1, ['scene', 'sim', 'figure', 'tryit', 'schematic'], '#3078B0'],
  ['math', 'פיזיקה ומתמטיקה', 2, ['anim', 'derivation', 'formulas', 'numbers', 'eng'], '#1B2F5A'],
  ['rev', 'הנדסה לאחור ותקלות', 1, ['rev', 'flow', 'fault', 'wrong'], '#7B5A3C'],
  ['inside', 'מה יש בפנים', 2, ['story', 'steps', 'parts', 'words', 'card'], '#3078B0'],
  ['q', 'שאלות', 1, ['quiz', 'drills', 'integ'], '#7B5A3C'],
  ['read', 'קריאה והרחבה', 2, ['reading', 'page', 'say'], '#4A4540']
];
const hubOf = w => { const k = zInfo(w).kind; const h = HUBS.find(x => x[3].includes(k)); return h ? h[0] : 'read'; };
const HS = { hub: {}, win: {}, snap: {} };
/* a window's state, kept when it is closed and given back when it opens again: its step, its controls, its animation */
function winSave(panel) {
  const sec = panel && panel.querySelector('.zwin'); if (!sec) return; const body = sec.querySelector('.zbody'), w = sec.dataset.w; if (!body || !w) return;
  const snap = { inputs: [...body.querySelectorAll('input, select')].map(i => i.type === 'checkbox' ? i.checked : i.value) };
  const st = body.querySelector('[data-s][aria-current="step"]'); if (st) snap.step = st.dataset.s;
  if (body.animApi) snap.anim = { step: body.animApi.step, P: Object.assign({}, body.animApi.P) };
  HS.snap[w] = snap; try { sessionStorage.setItem('fh-snap:' + w, JSON.stringify(snap)); } catch (e) { }
}
function winRestore(panel) {
  const sec = panel.querySelector('.zwin'), w = sec && sec.dataset.w; if (w && !HS.snap[w]) { try { const s = sessionStorage.getItem('fh-snap:' + w); if (s) HS.snap[w] = JSON.parse(s); } catch (e) { } } const snap = w && HS.snap[w]; if (!snap) return; const body = sec.querySelector('.zbody');
  if (snap.anim && body.animApi) { Object.entries(snap.anim.P).forEach(([k, v]) => body.animApi.setParam(k, v)); body.animApi.go(snap.anim.step); return; }
  const ins = [...body.querySelectorAll('input, select')];
  if (ins.length === snap.inputs.length) ins.forEach((i, k) => { if (i.type === 'checkbox') i.checked = snap.inputs[k]; else i.value = snap.inputs[k]; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); });
  if (snap.step != null) { const b = body.querySelector(`[data-s="${snap.step}"]`); if (b) b.click(); }
}
/* leaving a topic keeps its open window too */
go = (function (orig) { return function (sheet, arg) { const p = document.getElementById('hubpanel'); if (p) winSave(p); return orig(sheet, arg); }; })(go);
/* the topic's object: its inner parts exploded, its part of the machine, or the part it is inside */
function hubGeometry(id) {
  if (INNER[id]) return INNER[id].map(ip => ({ b: ip.b.map((v, i) => v + 0.9 * ip.ex[Math.floor(i / 2)]), c: ip.c, sh: ROUND.test(ip.t) ? longAxis(ip.b) : null }));
  const mp = MPARTS.find(p => p.node === id);
  if (mp) { const bx = mp.boxes, cx = bx.reduce((s, b) => s + (b[0] + b[1]) / 2, 0) / bx.length, cy = bx.reduce((s, b) => s + (b[2] + b[3]) / 2, 0) / bx.length, cz = bx.reduce((s, b) => s + (b[4] + b[5]) / 2, 0) / bx.length, ext = Math.max(...bx.map(b => Math.max(b[1] - b[0], b[3] - b[2], b[5] - b[4]))), k = 2.2 / ext;
    return bx.map(b => ({ b: [(b[0] - cx) * k, (b[1] - cx) * k, (b[2] - cy) * k, (b[3] - cy) * k, (b[4] - cz) * k, (b[5] - cz) * k], c: b[6], sh: MSHAPE[mp.id] || null })); }
  for (const [n, list] of Object.entries(INNER)) { const ip = list.find(x => x.node === id); if (ip) { const b = ip.b, c = [(b[0] + b[1]) / 2, (b[2] + b[3]) / 2, (b[4] + b[5]) / 2], ext = Math.max(b[1] - b[0], b[3] - b[2], b[5] - b[4]), k = 2.0 / ext; return [{ b: [(b[0] - c[0]) * k, (b[1] - c[0]) * k, (b[2] - c[1]) * k, (b[3] - c[1]) * k, (b[4] - c[2]) * k, (b[5] - c[2]) * k], c: ip.c, sh: ROUND.test(ip.t) ? longAxis(b) : null }]; } }
  /* the whole machine, small, for the topics of the machine as a whole */
  return MPARTS.filter(p => p.id !== 'door').flatMap(p => p.boxes.map(b => ({ b: b.slice(0, 6).map(v => v * 0.42), c: b[6], sh: MSHAPE[p.id] || null })));
}
function hubObject(cv, id) {
  const G = hubGeometry(id), col = k => ({ mech: '#7B5A3C', ink: '#1B2F5A', live: '#3078B0', tint: '#D6E8F7', text: '#3078B0' })[k] || k;
  const V = view3(cv, { yaw: -0.7, pitch: 0.45, dist: 7.5, fov: 520, oy: 0, onView: () => draw() });
  function draw() { const ctx = V.ctx; ctx.clearRect(0, 0, cv.width, cv.height); const items = [];
    G.forEach(g => { const P = []; mShape(P, g.b, g.sh, col(g.c), g.c === 'tint' ? 0.55 : 0.95, 'rgba(27,47,90,.35)'); P.forEach(f => { const q = f.pts.map(p => V.proj(p)); items.push({ q, d: q.reduce((s, x) => s + x[2], 0) / q.length, f, hl: false }); }); });
    mFloor(ctx, p => V.proj(p), [0, 0, -1.3], 2.0); mPaint(ctx, items); }
  let t0 = performance.now(), spin = false; cv._V = V;
  cv.addEventListener('pointerenter', () => spin = true); cv.addEventListener('pointerleave', () => spin = false); cv.addEventListener('focus', () => spin = true); cv.addEventListener('blur', () => spin = false);
  const tick = now => { if (!document.body.contains(cv)) return; if (spin && !matchMedia('(prefers-reduced-motion: reduce)').matches) { V.st.yaw += (now - t0) / 1000 * 0.35; draw(); } t0 = now; requestAnimationFrame(tick); };
  draw(); requestAnimationFrame(tick);
}
/* rebuild the middle of a topic page as the object and its hubs */
/* the hub: the topic's object, six hubs around it, and one window open */
function hubHtml(cx) {
  const { id, node: n, openW } = cx, wins = zWindows(n), by = {}; wins.forEach(w => (by[hubOf(w)] = by[hubOf(w)] || []).push(w));
  const hubs = HUBS.filter(h => by[h[0]]); if (!hubs.length) return '';
  if (openW && wins.includes(openW)) { HS.hub[id] = hubOf(openW); HS.win[id] = openW; }
  if (!HS.hub[id] || !by[HS.hub[id]]) HS.hub[id] = (by.demo ? 'demo' : hubs[0][0]);
  const left = hubs.filter((_, i) => i % 2 === 0), right = hubs.filter((_, i) => i % 2 === 1);
  cx.hub = { wins, by, hubs, left, right };
  const hubBtn = h => `<button type="button" class="hubbtn" data-hub="${h[0]}" aria-pressed="${HS.hub[id] === h[0]}" style="--hc:${h[4]}"><b>${h[1]}</b><small>${by[h[0]].length} · שכבה ${h[2]}</small></button>`;
  return `<section class="hub" aria-label="הנושא ודרכי ההבנה שלו">
      <div class="hubstage"><div class="hubcol">${left.map(hubBtn).join('')}</div>
        <div class="hubmid"><canvas class="hubobj" width="420" height="300" tabindex="0" role="button" aria-label="${n.t}: מצא במכונה"></canvas><p class="hubcap"><button type="button" class="hubfind">מצא את החלק במכונה ←</button></p></div>
        <div class="hubcol">${right.map(hubBtn).join('')}</div>
        <svg class="hublines" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">${[...left.map((h, i) => [h, 86, 10 + i * 20]), ...right.map((h, i) => [h, 14, 10 + i * 20])].map(([h, x, y]) => `<path d="M50 30 C ${(50 + x) / 2} 30, ${(50 + x) / 2} ${y}, ${x} ${y}" stroke="${h[4]}" stroke-width="0.35" fill="none" stroke-dasharray="${HS.hub[id] === h[0] ? '' : '1.2 1'}" opacity="${HS.hub[id] === h[0] ? 0.9 : 0.45}"/>`).join('')}</svg></div>
      <div class="hubpanel" id="hubpanel"></div></section>`;
}
function hubWire(cx) {
  if (!cx.hub) return;
  const { id, main, openW } = cx, { wins, by, left, right } = cx.hub;
  hubObject(main.querySelector('.hubobj'), id);
  const findInMachine = () => main.querySelector('.hubobj').dispatchEvent(new Event('click'));
  main.querySelector('.hubfind').addEventListener('click', findInMachine);
  main.querySelector('.hubobj').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); findInMachine(); } });
  main.querySelector('.hubobj').addEventListener('click', () => { if (typeof mJump === 'function' && MPARTS.some(p => p.node === id) || Object.values(INNER).some(l => l.some(ip => ip.node === id))) { go('zoom', 'machine'); setTimeout(() => mJump(id), 50); } });
  const panel = main.querySelector('#hubpanel');
  const showHub = h => {
    winSave(panel);
    HS.hub[id] = h; const list = by[h]; if (!HS.win[id] || !list.includes(HS.win[id])) HS.win[id] = list[0];
    main.querySelectorAll('.hubbtn').forEach(b => b.setAttribute('aria-pressed', b.dataset.hub === h));
    main.querySelectorAll('.hublines path').forEach((p, i) => { const hh = [...left, ...right][i]; p.setAttribute('stroke-dasharray', hh[0] === h ? '' : '1.2 1'); p.setAttribute('opacity', hh[0] === h ? 0.9 : 0.45); });
    const H = HUBS.find(x => x[0] === h), w = HS.win[id];
    panel.innerHTML = `<header class="hubhead" style="--hc:${H[4]}"><h3>${H[1]}</h3><span class="kb">שכבה ${H[2]}: ${H[2] === 1 ? 'רואים ומפעילים' : 'מבינים לעומק'}</span></header>
        ${list.length > 1 ? `<nav class="hubpills" aria-label="החלונות של ${H[1]}">${list.map(x => { const i = zInfo(x); return `<button type="button" data-hw="${x}" aria-pressed="${x === w}"><span class="kb">${(ZKIND[i.kind] || [i.kind])[0]}</span> ${i.t.length > 42 ? i.t.slice(0, 40) + '…' : i.t}</button>`; }).join('')}</nav>` : ''}
        <section class="zwin open" data-w="${w}"><header><span class="kb">${(ZKIND[zInfo(w).kind] || [''])[0]}</span> <h3 class="zwt">${zInfo(w).t}</h3></header><div class="zbody"></div></section>`;
    zMount(w, panel.querySelector('.zbody')); winRestore(panel);
    panel.querySelectorAll('[data-hw]').forEach(b => b.addEventListener('click', () => { HS.win[id] = b.dataset.hw; showHub(h); }));
    hubAfterRender(id, h, showHub);
  };
  main.querySelectorAll('.hubbtn').forEach(b => b.addEventListener('click', () => showHub(b.dataset.hub)));
  showHub(HS.hub[id]);
  if (openW && wins.includes(openW)) { const sec = panel.querySelector('.zwin'); sec.classList.add('zfocus'); setTimeout(() => sec.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }), 60); }
}
nodeSection('hub', 40, { html: hubHtml, wire: hubWire });

/* the window-opening helper now goes through the hubs */
zOpenWindow = function (node, w) { ZS.openW = w; ZS.dir = 1; go('zoom', node); };
