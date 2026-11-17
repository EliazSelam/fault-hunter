/* ============ Labs in 3D: an animated, interactive model for every topic that had none (v2.55) ============
   A lab is data: parameters (sliders, switches, actions), a pure calc(P, S) that is the only source of every number on the screen,
   an optional step(S, h) for what changes in time, build(G, L, S) that makes the 3D model and returns how it moves, the HUD cards,
   the message, and either a scope (traces over time) or a plot (a curve with the working point) under the picture.
   The stage is the one the vacuum table and the safety chain use (fh3dStage): its own renderer, the studio light, orbit, palette
   shades only (the resistor's colour code is the one exception, as in the components lesson), drawing only while visible and running.
   rate is simulated seconds per real second (a coil's millisecond transient is shown slowed down, and says so).
   Every handle has getState/setState/pause/resume/destroy and, for the checks, state(), set(), advance(simulated seconds) and act(). */
const LABS = {};
const lab3d = spec => (LABS[spec.id] = spec);
const lf = (x, d = 2) => { if (!Number.isFinite(x)) return '∞'; const a = Math.abs(x); return a >= 1000 ? x.toFixed(0) : a >= 100 ? x.toFixed(Math.max(0, d - 2)) : a >= 10 ? x.toFixed(Math.max(0, d - 1)) : x.toFixed(d); };
const LB = t => `<bdi dir="ltr" class="nogl">${t}</bdi>`;   /* formulas and numbers: left to right, never glossed ("Ns" is not nanoseconds) */
const E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
const e12 = (lo, hi) => { const out = []; for (let m = 1; m <= 1e7; m *= 10) E12.forEach(v => { const x = +(v * m / 10).toPrecision(3); if (x >= lo - 1e-9 && x <= hi + 1e-9) out.push(x); }); return out; };
const ohm = R => R >= 1e6 ? lf(R / 1e6) + ' MΩ' : R >= 1e3 ? lf(R / 1e3) + ' kΩ' : lf(R) + ' Ω';
const amp = I => Math.abs(I) >= 1 ? lf(I) + ' A' : Math.abs(I) >= 1e-3 ? lf(I * 1e3) + ' mA' : lf(I * 1e6) + ' µA';
const watt = P => Math.abs(P) >= 1 ? lf(P) + ' W' : lf(P * 1e3) + ' mW';
/* the 4-band code: two digits and a multiplier */
const rbands = R => { const e = Math.floor(Math.log10(R) + 1e-9) - 1, d = Math.round(R / Math.pow(10, e)); return [Math.floor(d / 10), d % 10, e]; };
const LABC = { navy: '#1B2F5A', blue: '#3078B0', brown: '#7B5A3C', char: '#4A4540', light: '#D6E8F7', cream: '#EEE9E0' };

/* ---- the kit a lab builds with ---- */
function labKit(G) {
  const { THREE: T, K, C, scene, mat, add, box, pipe } = G, keep = K.keep;
  const sph = (r, m, p, parent) => add(keep(new T.SphereGeometry(r, 14, 10)), m, p, parent);
  const wire = (pts, m, r) => { r = r || 0.055; m = m || mat.brown; for (let i = 1; i < pts.length; i++) pipe(pts[i - 1], pts[i], r, m); pts.slice(1, -1).forEach(p => sph(r, m, p)); return pts; };
  const canvasTex = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = keep(new T.CanvasTexture(c)); t.colorSpace = T.SRGBColorSpace; return { c, g: c.getContext('2d'), t }; };
  const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  /* a label that always faces the camera */
  const tag = (text, pos, h = 0.42, fg = LABC.navy, bg = 'rgba(238,233,224,.93)') => { const X = canvasTex(512, 128), sp = new T.Sprite(keep(new T.SpriteMaterial({ map: X.t, depthTest: false, transparent: true }))); sp.renderOrder = 20; sp.position.set(pos[0], pos[1], pos[2]); h *= 1.8; sp.scale.set(h * 4, h, 1); scene.add(sp); let last = null;
    const set = t => { t = String(t); if (t === last) return; last = t; const g = X.g; g.clearRect(0, 0, 512, 128); g.font = '600 54px system-ui, Arial, sans-serif'; g.direction = /[֐-׿]/.test(t) ? 'rtl' : 'ltr'; const w = Math.min(506, g.measureText(t).width + 44); g.fillStyle = bg; rr(g, (512 - w) / 2, 12, w, 104, 30); g.fill(); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, 256, 66); X.t.needsUpdate = true; };
    set(text); return { sp, set, show: v => { sp.visible = v; }, at: p => sp.position.set(p[0], p[1], p[2]) }; };
  /* a flat screen with text (meters, displays) */
  const screen = (pos, w, h, rotY = 0, parent) => { const X = canvasTex(256, 128), m = add(keep(new T.PlaneGeometry(w, h)), keep(new T.MeshBasicMaterial({ map: X.t })), pos, parent); m.rotation.y = rotY; m.castShadow = false; let last = null;
    const api = { m, set(t, sub) { const k = t + '|' + (sub || ''); if (k === last) return; last = k; const g = X.g; g.fillStyle = LABC.light; g.fillRect(0, 0, 256, 128); g.fillStyle = LABC.navy; g.font = '700 50px ui-monospace, Menlo, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, 128, sub ? 50 : 66); if (sub) { g.font = '600 24px system-ui, sans-serif'; g.fillText(sub, 128, 104); } X.t.needsUpdate = true; } }; api.set('—'); return api; };
  /* a material that glows (heat, light) */
  const glowMat = (base, col) => { const m = keep(base.clone()); m.emissive = new T.Color(col == null ? C.brown : col); m.emissiveIntensity = 0; return m; };
  const heat = (m, k) => { m.emissiveIntensity = Math.max(0, Math.min(1.5, k)) * 1.6; };
  const board = (w, d, pos = [0, -0.12, 0]) => { const tex = K.paint(512, 512, (g, W, H) => { g.fillStyle = LABC.navy; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(214,232,247,.16)'; g.lineWidth = 2; for (let i = 0; i < W; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, H); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(W, i); g.stroke(); } });
    tex.colorSpace = T.SRGBColorSpace; tex.wrapS = tex.wrapT = T.RepeatWrapping; tex.repeat.set(w / 4, d / 4); return add(box(w, 0.2, d, 0.06), keep(new T.MeshPhysicalMaterial({ map: tex, roughness: 0.55, clearcoat: 0.6 })), pos); };
  /* a resistor body along x with its colour code */
  const res = (pos, len = 1.3, r = 0.24, parent) => { const X = canvasTex(64, 256), m = keep(new T.MeshPhysicalMaterial({ map: X.t, roughness: 0.5, clearcoat: 0.5 })); m.emissive = new T.Color(C.brown); m.emissiveIntensity = 0;
    const body = add(keep(new T.CylinderGeometry(r, r, len, 28, 1)), m, pos, parent); body.rotation.z = Math.PI / 2;
    [-1, 1].forEach(s => pipe([pos[0] + s * len / 2, pos[1], pos[2]], [pos[0] + s * (len / 2 + 0.4), pos[1], pos[2]], 0.04, mat.alu, parent));
    const bands = R => { const g = X.g, [a, b, e] = rbands(R), cols = [DIG[a], DIG[b], e >= 0 ? DIG[e] : 'gold', 'gold']; g.fillStyle = '#d9c7a3'; g.fillRect(0, 0, 64, 256); [44, 84, 124, 196].forEach((y, i) => { g.fillStyle = BAND[cols[i]]; g.fillRect(0, y, 64, 22); }); X.t.needsUpdate = true; };
    bands(1000); return { body, m, bands, heat: k => heat(m, k), ends: [[pos[0] - len / 2 - 0.4, pos[1], pos[2]], [pos[0] + len / 2 + 0.4, pos[1], pos[2]]] }; };
  /* a bulb whose filament lights with power (k = 1 at rated) */
  const lamp = (pos, r = 0.42) => { add(K.can(r * 0.55, -r * 1.4, -r * 0.65, 0.04), mat.alu, pos); add(keep(new T.SphereGeometry(r, 24, 16)), mat.glass, pos); const fm = glowMat(mat.cream, C.light), f = add(keep(new T.SphereGeometry(r * 0.3, 14, 10)), fm, pos);
    const pl = new T.PointLight(C.light, 0, 6); pl.position.set(pos[0], pos[1], pos[2]); scene.add(pl);
    return { set: k => { k = Math.max(0, Math.min(1.5, k)); fm.emissiveIntensity = 3.2 * k; fm.color.setHex(k > 0.05 ? C.cream : C.char); f.scale.setScalar(0.7 + 0.6 * Math.min(1, k)); pl.intensity = 6 * k; } }; };
  /* an indicator */
  const led = (pos, col = C.light, r = 0.12, parent) => { const m = G.led(col), o = add(keep(new T.SphereGeometry(r, 14, 10)), m, pos, parent); return { o, set: on => { m.emissiveIntensity = on ? 2.4 : 0; m.color.setHex(on ? col : C.char); } }; };
  const block = (w, h, d, pos, m, parent) => add(box(w, h, d, Math.min(0.08, w / 6, h / 6, d / 6)), m || mat.navy, pos, parent);
  const torus = (pos, R, r, m, axis = 'y', parent) => { const o = add(keep(new T.TorusGeometry(R, r, 10, 40)), m, pos, parent); if (axis === 'y') o.rotation.x = Math.PI / 2; if (axis === 'x') o.rotation.y = Math.PI / 2; return o; };
  /* a winding of n turns, axis along y in its group */
  const coil = (pos, axis, R, len, n, m, parent) => { const g = new T.Group(); g.position.set(pos[0], pos[1], pos[2]); (parent || scene).add(g); for (let i = 0; i < n; i++) { const t = torus([0, 0, 0], R, Math.min(0.07, len / n / 2.2), m || mat.brown, 'y', g); t.position.y = -len / 2 + (i + 0.5) * len / n; } if (axis === 'x') g.rotation.z = Math.PI / 2; if (axis === 'z') g.rotation.x = Math.PI / 2; return g; };
  const group = (pos, parent) => { const g = new T.Group(); if (pos) g.position.set(pos[0], pos[1], pos[2]); (parent || scene).add(g); return g; };
  /* a glowing spark that can be shown or hidden */
  const spark = (pos, s = 0.9) => { const sp = new T.Sprite(keep(new T.SpriteMaterial({ map: K.paint(64, 64, (g, w) => { const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, 'rgba(238,233,224,1)'); r.addColorStop(0.3, 'rgba(214,232,247,.9)'); r.addColorStop(1, 'rgba(48,120,176,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); }), transparent: true, depthWrite: false, blending: T.AdditiveBlending })));
    sp.position.set(pos[0], pos[1], pos[2]); sp.scale.setScalar(s); sp.visible = false; scene.add(sp); return { sp, set: k => { sp.visible = k > 0.02; sp.scale.setScalar(s * (0.4 + Math.min(1.5, k))); } }; };
  return { sph, wire, tag, screen, glowMat, heat, board, res, lamp, led, block, torus, coil, group, spark, canvasTex, rr };
}

/* ---- a small plot: axes in English, a curve or two, the working point ---- */
const niceStep = (span, n) => { const s = span / n, p = Math.pow(10, Math.floor(Math.log10(s))), f = s / p; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p; };
const tickFmt = v => { const a = Math.abs(v); return a === 0 ? '0' : a >= 1e6 ? +(v / 1e6).toPrecision(3) + 'M' : a >= 1e3 ? +(v / 1e3).toPrecision(3) + 'k' : a < 0.01 ? v.toExponential(0) : String(+v.toPrecision(3)); };
function labPlotU(cv) {
  const g = cv.getContext('2d'), W = cv.width, H = cv.height, pd = { l: 64, r: 16, t: 14, b: 34 }; let o = null;
  const map = (v, [a, b], lg, p0, p1) => { if (lg) { v = Math.log10(Math.max(v, 1e-300)); a = Math.log10(a); b = Math.log10(b); } return p0 + (v - a) / (b - a) * (p1 - p0); };
  const U = { g, W, H,
    X: x => map(x, o.x, o.xlog, pd.l, W - pd.r), Y: y => map(Math.max(o.y[0], Math.min(o.y[1], y)), o.y, o.ylog, H - pd.b, pd.t),
    frame(opt) { o = opt; g.direction = 'ltr'; g.fillStyle = LABC.cream; g.fillRect(0, 0, W, H); g.font = '600 15px system-ui, Arial, sans-serif'; g.lineWidth = 1;
      const ticks = (r, lg) => { if (lg) { const out = []; for (let e = Math.ceil(Math.log10(r[0]) - 1e-9); e <= Math.log10(r[1]) + 1e-9; e++) out.push(Math.pow(10, e)); return out; } const s = niceStep(r[1] - r[0], 5), out = []; for (let i = Math.ceil(r[0] / s - 1e-9); i * s <= r[1] + s * 1e-6; i++) out.push(+(i * s).toPrecision(10)); return out; };
      g.fillStyle = LABC.char; g.textAlign = 'center'; g.textBaseline = 'top'; (o.noXT ? [] : ticks(o.x, o.xlog)).forEach(v => { const x = U.X(v); g.strokeStyle = 'rgba(27,47,90,.12)'; g.beginPath(); g.moveTo(x, pd.t); g.lineTo(x, H - pd.b); g.stroke(); g.fillText(tickFmt(v), x, H - pd.b + 5); });
      g.textAlign = 'right'; g.textBaseline = 'middle'; ticks(o.y, o.ylog).forEach(v => { const y = U.Y(v); g.strokeStyle = 'rgba(27,47,90,.12)'; g.beginPath(); g.moveTo(pd.l, y); g.lineTo(W - pd.r, y); g.stroke(); g.fillText(tickFmt(v), pd.l - 6, y); });
      g.strokeStyle = LABC.navy; g.lineWidth = 1.5; g.beginPath(); g.moveTo(pd.l, pd.t); g.lineTo(pd.l, H - pd.b); g.lineTo(W - pd.r, H - pd.b); g.stroke();
      g.fillStyle = LABC.navy; g.font = '700 15px system-ui, Arial, sans-serif'; g.textAlign = 'right'; g.textBaseline = 'bottom'; g.fillText(o.xl || '', W - pd.r, H - 2); g.save(); g.translate(14, pd.t); g.rotate(-Math.PI / 2); g.textAlign = 'right'; g.textBaseline = 'top'; g.fillText(o.yl || '', 0, 0); g.restore(); return U; },
    curve(f, col, w = 2.6, dash) { const n = 260; g.strokeStyle = col; g.lineWidth = w; g.setLineDash(dash || []); g.beginPath(); let pen = false; for (let i = 0; i <= n; i++) { const u = i / n, x = o.xlog ? o.x[0] * Math.pow(o.x[1] / o.x[0], u) : o.x[0] + u * (o.x[1] - o.x[0]), y = f(x); if (!Number.isFinite(y)) { pen = false; continue; } const px = U.X(x), py = U.Y(y); pen ? g.lineTo(px, py) : g.moveTo(px, py); pen = true; } g.stroke(); g.setLineDash([]); return U; },
    poly(pts, col, w = 2.6) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(U.X(x), U.Y(y)) : g.moveTo(U.X(x), U.Y(y))); g.stroke(); return U; },
    dot(x, y, col = LABC.navy, r = 7) { g.fillStyle = col; g.strokeStyle = LABC.cream; g.lineWidth = 2.5; g.beginPath(); g.arc(U.X(x), U.Y(y), r, 0, 7); g.fill(); g.stroke(); return U; },
    hl(y, col, t) { const py = U.Y(y); g.strokeStyle = col; g.lineWidth = 1.5; g.setLineDash([6, 5]); g.beginPath(); g.moveTo(pd.l, py); g.lineTo(W - pd.r, py); g.stroke(); g.setLineDash([]); if (t) { g.fillStyle = col; g.font = '600 14px system-ui, Arial'; g.textAlign = 'left'; g.textBaseline = 'bottom'; g.fillText(t, pd.l + 6, py - 2); } return U; },
    vl(x, col, t) { const px = U.X(x); g.strokeStyle = col; g.lineWidth = 1.5; g.setLineDash([6, 5]); g.beginPath(); g.moveTo(px, pd.t); g.lineTo(px, H - pd.b); g.stroke(); g.setLineDash([]); if (t) { g.fillStyle = col; g.font = '600 14px system-ui, Arial'; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(t, px + 5, pd.t + 2); } return U; },
    band(y0, y1, col) { g.fillStyle = col; g.fillRect(pd.l, U.Y(y1), W - pd.r - pd.l, U.Y(y0) - U.Y(y1)); return U; },
    rect(x0, x1, y0, y1, col) { g.fillStyle = col; g.fillRect(U.X(x0), U.Y(y1), U.X(x1) - U.X(x0), U.Y(y0) - U.Y(y1)); return U; },
    text(t, x, y, col = LABC.navy, al = 'left') { g.fillStyle = col; g.font = '600 14px system-ui, Arial'; g.textAlign = al; g.textBaseline = 'middle'; g.fillText(t, U.X(x), U.Y(y)); return U; } };
  return U;
}

/* ---- mounting a lab: the stage, the controls under it, the scope or the plot ---- */
function labMount(THREE, host, spec) {
  host.innerHTML = '<div class="fh3dhost lab-host"></div><div class="lab-ctl nogl"></div>';
  const G = fh3dStage(THREE, host.querySelector('.lab-host'), spec.title, Object.assign({}, spec.cam)); if (!G) return null;
  const L = labKit(G), ctl = host.querySelector('.lab-ctl'), api = G.api, rate = spec.rate || 1;
  G.msg.classList.add('lab-msg'); ctl.appendChild(G.msg);
  const S = { P: Object.assign({}, spec.P), t: 0, run: true, x: {}, acc: 0 }; if (spec.init) spec.init(S);
  (spec.stats || []).forEach(([k, t]) => G.stat(k, t));
  const upd = spec.build(G, L, S) || (() => { });
  /* sliders and switches under the picture, actions and pause on the picture */
  const rows = [], sl = document.createElement('div'); sl.className = 'lab-sls'; ctl.appendChild(sl);
  (spec.controls || []).forEach(c => { const d = document.createElement('label'); d.className = 'lab-sl'; const list = c.list;
    const toU = v => list ? Math.max(0, list.reduce((bi, x, i) => Math.abs(x - v) < Math.abs(list[bi] - v) ? i : bi, 0)) : c.log ? Math.round(Math.log(v / c.min) / Math.log(c.max / c.min) * 1000) : v,
      fromU = u => list ? list[Math.round(u)] : c.log ? +(c.min * Math.pow(c.max / c.min, u / 1000)).toPrecision(3) : +u;
    d.innerHTML = `<span>${c.t}</span><input type="range" min="${list || c.log ? 0 : c.min}" max="${list ? list.length - 1 : c.log ? 1000 : c.max}" step="${list || c.log ? 1 : c.step || 'any'}"><output></output>`;
    const inp = d.querySelector('input'), out = d.querySelector('output'), show = () => { out.innerHTML = LB(c.fmt ? c.fmt(S.P[c.k]) : lf(S.P[c.k]) + (c.u ? ' ' + c.u : '')); };
    inp.setAttribute('aria-label', c.t.replace(/<[^>]+>/g, '')); inp.value = toU(S.P[c.k]); show();
    inp.addEventListener('input', () => { S.P[c.k] = fromU(+inp.value); if (spec.onSet) spec.onSet(S, c.k); show(); G.touch(); }); rows.push({ k: c.k, sync: () => { inp.value = toU(S.P[c.k]); show(); } }); sl.appendChild(d); });
  (spec.toggles || []).forEach(c => { const g = document.createElement('div'); g.className = 'lab-seg'; g.setAttribute('role', 'group'); g.setAttribute('aria-label', c.t); g.innerHTML = `<span>${c.t}</span>` + c.opts.map(([v, t]) => `<button type="button" data-v="${String(v)}">${t}</button>`).join('');
    const sync = () => g.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(String(S.P[c.k]) === b.dataset.v)));
    g.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { S.P[c.k] = c.opts.find(x => String(x[0]) === b.dataset.v)[0]; if (spec.onSet) spec.onSet(S, c.k); sync(); G.touch(); })); sync(); rows.push({ k: c.k, sync }); sl.appendChild(g); });
  (spec.actions || []).forEach(([t, name]) => G.btn(t, () => api.act(name)));
  const pz = G.btn('⏸ עצירה', () => { S.run = !S.run; pz.textContent = S.run ? '⏸ עצירה' : '▶ המשך'; pz.setAttribute('aria-pressed', String(!S.run)); G.touch(); }, false);
  if (rate !== 1) G.btn(rate < 1 ? `הילוך איטי ×${+(1 / rate).toPrecision(2)}` : `הילוך מהיר ×${rate}`, () => { }).disabled = true;
  /* the scope (traces over simulated time) or the plot */
  const TR = spec.trace, PL = spec.plot; let sc = null, pu = null;
  if (TR) { const w = document.createElement('div'); w.className = 'lab-scope'; w.innerHTML = `<canvas width="900" height="${TR.h || 170}" aria-hidden="true"></canvas><p class="lab-leg" lang="en">${TR.keys.map(k => `<span style="--c:${k[2]}">${k[1]}</span>`).join('')}<small>${LB('window ' + lf(TR.span * (TR.disp || 1), 0) + ' ' + (TR.unit || 's'))}</small></p>`; ctl.appendChild(w); sc = { cv: w.querySelector('canvas'), buf: [], n: 0 }; }
  if (PL) { const w = document.createElement('div'); w.className = 'lab-scope lab-plot'; w.innerHTML = `<canvas width="900" height="${PL.h || 260}" aria-hidden="true"></canvas>${PL.leg ? `<p class="lab-leg" lang="en">${PL.leg.map(([t, c]) => `<span style="--c:${c}">${t}</span>`).join('')}</p>` : ''}`; ctl.appendChild(w); pu = labPlotU(w.querySelector('canvas')); }
  const scopeDraw = () => { const cv = sc.cv, g = cv.getContext('2d'), W = cv.width, H = cv.height, b = sc.buf, n = TR.keys.length; g.direction = 'ltr'; g.fillStyle = LABC.cream; g.fillRect(0, 0, W, H);
    const fv = v => typeof v === 'function' ? v(S) : v, li = j => Array.isArray(TR.lanes) ? TR.lanes[j] : TR.lanes ? j : 0, nL = Array.isArray(TR.lanes) ? Math.max(...TR.lanes) + 1 : TR.lanes ? n : 1, lane = j => [H * li(j) / nL + 8, H * (li(j) + 1) / nL - 6];
    const t1 = b.length ? b[b.length - 1][0] : 0, t0 = t1 - TR.span, X = t => 6 + (t - t0) / TR.span * (W - 12);
    for (let k = 1; k < nL; k++) { g.strokeStyle = 'rgba(27,47,90,.14)'; g.beginPath(); g.moveTo(0, H * k / nL); g.lineTo(W, H * k / nL); g.stroke(); }
    (TR.marks || []).forEach(([v0, j, col]) => { const ln = lane(j), v = fv(v0), lo = fv(TR.keys[j][3]), hi = fv(TR.keys[j][4]), y = ln[1] - (v - lo) / (hi - lo) * (ln[1] - ln[0]); g.strokeStyle = col; g.setLineDash([5, 5]); g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); g.setLineDash([]); });
    TR.keys.forEach(([, , col, lo0, hi0], j) => { const lo = fv(lo0), hi = fv(hi0), ln = lane(j); if (b.length < 2) return; const Y = v => ln[1] - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo || 1) * (ln[1] - ln[0]);
      g.strokeStyle = col; g.lineWidth = 2.4; g.beginPath(); b.forEach((r, i) => { const x = X(r[0]), y = Y(r[1][j]); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); });
    (TR.names || []).forEach((t, k) => { g.fillStyle = LABC.navy; g.font = '700 14px system-ui, Arial'; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(t, 8, H * k / nL + 3); }); };
  /* the loop */
  let R = spec.calc(S.P, S);
  const hud = () => { (spec.stats || []).forEach(([k, , f]) => { G.statEl[k].textContent = f(R, S); }); const m = spec.msg ? spec.msg(R, S) : ''; if (m !== G.msg._m) { G.msg._m = m; G.msg.innerHTML = m; } G.msg.classList.toggle('alarm', !!(spec.alarm && spec.alarm(R, S))); };
  const simStep = h => { S.t += h; if (spec.step) spec.step(S, h); };
  const advanceSim = hs => { if (spec.dt) { S.acc += hs; while (S.acc >= spec.dt * 0.999999) { S.acc -= spec.dt; simStep(spec.dt); } } else if (spec.step) { const n = Math.max(1, Math.ceil(hs / (spec.hmax || 1 / 240))); for (let i = 0; i < n; i++) simStep(hs / n); } else S.t += hs; };
  let pn = 0;
  const tick = (dtReal, draw = true) => { const hs = dtReal * rate; if (S.run && hs > 0) advanceSim(hs); R = spec.calc(S.P, S); upd(dtReal, R, S);
    if (sc && S.run && hs > 0) { sc.buf.push([S.t, TR.keys.map(([k]) => +(typeof k === 'function' ? k(R, S) : R[k]) || 0)]); while (sc.buf.length > 2 && sc.buf[0][0] < S.t - TR.span) sc.buf.shift(); if (draw && ++sc.n % 2 === 0) scopeDraw(); }
    if (pu && draw && (++pn % 3 === 0 || dtReal === 0)) PL.draw(pu, R, S); hud(); };
  G.setLoop(dt => tick(dt), () => S.run && (spec.busy ? spec.busy(S, R) : true));
  Object.assign(api, {
    lab: spec.id, state: () => ({ P: Object.assign({}, S.P), t: S.t, x: JSON.parse(JSON.stringify(S.x)), R: spec.calc(S.P, S), msg: G.msg.textContent, alarm: G.msg.classList.contains('alarm') }),
    set(o) { Object.assign(S.P, o); Object.keys(o).forEach(k => spec.onSet && spec.onSet(S, k)); rows.forEach(r => r.sync()); tick(0); G.touch(); return api.state(); },
    act(name) { const a = spec.act && spec.act[name]; if (a) a(S); rows.forEach(r => r.sync()); if (!S.run) { S.run = true; pz.textContent = '⏸ עצירה'; pz.setAttribute('aria-pressed', 'false'); } tick(0); G.touch(); return api.state(); },
    advance(sec) { const run = S.run, hr = 1 / 120; S.run = true; let left = sec / rate; while (left > 1e-12) { const d = Math.min(hr, left); tick(d, false); left -= d; } if (sc) scopeDraw(); if (pu) PL.draw(pu, R, S); S.run = run; api.renderNow(); return api.state(); },
    scope: () => sc ? sc.buf.slice() : null, ctl,
    getState: () => ({ v: 1, P: Object.assign({}, S.P), orbit: api.orbit() }), setState(s) { if (!s) return; if (s.P) api.set(s.P); api.setOrbit(s.orbit); } });
  tick(0); if (sc) scopeDraw(); api.renderNow(); return api;
}

/* the windows: 3d:<lab id>, on its topic, first among the demonstrations */
WIN.add({ id: 'lab3d', test: w => w.startsWith('3d:') && !!LABS[w.slice(3)], info: w => ({ kind: 'sim', t: LABS[w.slice(3)].title }), ctx: () => 'SHARED',
  mount: (w, el) => { const spec = LABS[w.slice(3)]; el.innerHTML = `<div class="lab-wrap"></div><p class="note">${spec.note}</p>`; const host = el.querySelector('.lab-wrap');
    if (typeof THREE === 'undefined') { host.innerHTML = '<p class="note">ספריית התלת-ממד לא נטענה.</p>'; return null; }
    const h = labMount(THREE, host, spec); el.fh3d = h; if (!h) return null;
    return { getState: () => h.getState(), setState: s => h.setState(s), pause: () => h.pause(), resume: () => h.resume(), destroy: () => h.destroy() }; } });
/* called once, after the last lab file */
function labRegister() { Object.values(LABS).forEach(spec => { const n = zNode(spec.node), w = '3d:' + spec.id; if (n && !n.around.includes(w)) n.around.unshift(w); }); }
