/* ============ Two systems that work, in 3D (v2.47) ============
   The vacuum table and the safety chain were taught as steps over a drawing. Here each one runs: you press, it acts,
   and every number on the screen comes from the same model as the rest of the book (vacCalc for the vacuum, stopCalc
   for the stop). Same contract as the scan head (FH3D_CSS, fh3dKit, own renderer, draws only while something moves,
   destroys itself when it leaves the page), so a window can hold it and save its state. */

/* ---- the safety chain's logic, pure: two channels, manual reset, cross-monitoring ----
   Channel A and B each pass through a contact of the door switch and of the emergency stop. The relay drops when either
   opens. It closes again only on Reset, with both closed and both having opened since the last start: a contact that never
   opened (welded) is found at the next demand, and the relay refuses to start. A single fault does not lose the stop. */
const CHAIN0 = { door: true, estop: false, weld: false, on: false, cycA: true, cycB: true, fault: false, msg: 'ready' };
const chainAB = S => ({ A: S.door && !S.estop, B: (S.door || S.weld) && !S.estop });
function chainLogic(S0, ev) {
  const S = Object.assign({}, S0);
  if (ev === 'door') S.door = !S.door; else if (ev === 'estop') S.estop = !S.estop; else if (ev === 'weld') S.weld = !S.weld;
  const { A, B } = chainAB(S); if (!A) S.cycA = true; if (!B) S.cycB = true;
  if (ev === 'reset') {
    if (S.on) S.msg = 'already';
    else if (!A || !B) S.msg = 'open';
    else if (!S.cycA || !S.cycB) { S.fault = true; S.msg = 'disc'; }
    else { S.on = true; S.fault = false; S.cycA = S.cycB = false; S.msg = 'run'; }
  } else if (S.on && (!A || !B)) { S.on = false; S.msg = 'trip'; }
  else if (ev !== 'weld') S.msg = S.on ? 'run' : !A || !B ? 'open' : 'closed';
  return S;
}

/* ---- a small stage shared by both: renderer, studio, light, orbit, HUD, a frame that runs only while needed ---- */
/* every live stage, so one that left the page frees its WebGL context before a new one is made (a browser keeps only a few) */
const FH3D_LIVE = new Set(), fh3dSweep = () => FH3D_LIVE.forEach(a => { if (!a.root.isConnected) a.destroy(); });
GO_BEFORE.push(() => setTimeout(fh3dSweep, 0));
function fh3dStage(THREE, container, label, cam0) {
  fh3dSweep();
  const K = fh3dKit(THREE), C = K.C, keep = K.keep, V = (x, y, z) => new THREE.Vector3(x, y, z);
  container.innerHTML = ''; const root = document.createElement('div'); root.className = 'fh3d-root nogl'; root.tabIndex = 0; root.setAttribute('role', 'group'); root.setAttribute('aria-label', label + '. גרירה מסובבת, חצים מסובבים, פלוס ומינוס מקרבים.');
  const style = document.createElement('style'); style.textContent = FH3D_CSS + '.fh3d-msg{position:absolute;top:12px;right:12px;width:min(300px,46%);padding:9px 13px;font-size:13px;line-height:1.5}.fh3d-msg b{color:#1B2F5A}.fh3d-msg.alarm{background:rgba(123,90,60,.95);color:#EEE9E0}.fh3d-msg.alarm b{color:#EEE9E0}'; root.appendChild(style); container.appendChild(root);
  let renderer; try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { root.innerHTML += '<div class="fh3d-card fh3d-hint">הדפדפן הזה לא מציג תלת-ממד (WebGL כבוי). שאר החלונות של הנושא עובדים כרגיל.</div>'; return null; }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.setClearColor(0, 0);
  const cv = renderer.domElement; cv.setAttribute('aria-hidden', 'true'); root.appendChild(cv);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(32, 1, 0.3, 300); scene.environment = K.studio(renderer);
  const key = new THREE.DirectionalLight(C.cream, 2.4); key.position.set(-8, 24, 14); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 6; Object.assign(key.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 80 }); scene.add(key);
  const fill = new THREE.DirectionalLight(C.light, 0.8); fill.position.set(18, 6, 12); const rim = new THREE.DirectionalLight(C.blue, 1.8); rim.position.set(2, 10, -20); scene.add(fill, rim, new THREE.AmbientLight(C.light, 0.3));
  const floor = new THREE.Mesh(keep(new THREE.PlaneGeometry(80, 80)), keep(new THREE.ShadowMaterial({ opacity: 0.28 }))); floor.rotation.x = -Math.PI / 2; floor.position.y = -3.4; floor.receiveShadow = true; scene.add(floor);
  const M = o => keep(new THREE.MeshPhysicalMaterial(o)), mat = {
    alu: M({ color: C.cream, metalness: 1, roughness: 0.4, roughnessMap: K.brushed, envMapIntensity: 1.1 }), navy: M({ color: C.navy, metalness: 0.7, roughness: 0.45, roughnessMap: K.brushed }),
    char: M({ color: C.char, metalness: 0.3, roughness: 0.6 }), cream: M({ color: C.cream, metalness: 0, roughness: 0.55, clearcoat: 0.4 }), brown: M({ color: C.brown, metalness: 0.9, roughness: 0.3 }),
    light: M({ color: C.light, metalness: 0.1, roughness: 0.5 }), blue: M({ color: C.blue, metalness: 0.3, roughness: 0.45 }), hose: M({ color: C.navy, metalness: 0.05, roughness: 0.7, clearcoat: 0.5 }),
    glass: M({ color: C.light, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }), dark: M({ color: 0x14110f, metalness: 0.2, roughness: 0.9 }) };
  const led = col => { const m = keep(new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0 })); m.userData.led = true; return m; };
  const add = (geo, m, p, parent) => { const o = new THREE.Mesh(geo, m); if (p) o.position.set(p[0], p[1], p[2]); o.castShadow = o.receiveShadow = true; (parent || scene).add(o); return o; };
  const box = (w, h, d, r) => K.rbox(w, d, h, r || 0.05).rotateX(-Math.PI / 2);   /* w along x, h along y, d along z */
  /* a pipe between two points */
  const pipe = (a, b, r, m, parent) => { const d = V(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length(), o = add(keep(new THREE.CylinderGeometry(r, r, L, 16)), m, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], parent); o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return o; };
  /* points that travel along polylines */
  const flow = (n, size, col) => { const g = keep(new THREE.BufferGeometry()), pos = new Float32Array(n * 3); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const m = keep(new THREE.PointsMaterial({ color: col, size, transparent: true, opacity: 0.9, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, map: K.paint(32, 32, (g2, w) => { const r = g2.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g2.fillStyle = r; g2.fillRect(0, 0, w, w); }) })); const P = new THREE.Points(g, m); P.frustumCulled = false; scene.add(P);
    const parts = Array.from({ length: n }, (_, i) => ({ path: -1, u: (i * 0.618) % 1 })); let paths = [];
    const at = (pth, u) => { let s = u * pth.len; for (let i = 1; i < pth.p.length; i++) { const l = pth.l[i - 1]; if (s <= l || i === pth.p.length - 1) { const k = l ? Math.min(1, s / l) : 0, a = pth.p[i - 1], b = pth.p[i]; return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; } s -= l; } return pth.p[0]; };
    return { P, set(list) { paths = list.map(p => { const l = []; for (let i = 1; i < p.pts.length; i++) l.push(Math.hypot(p.pts[i][0] - p.pts[i - 1][0], p.pts[i][1] - p.pts[i - 1][1], p.pts[i][2] - p.pts[i - 1][2])); return { p: p.pts, l, len: l.reduce((a, b) => a + b, 0), v: p.v, w: p.w || 1 }; }); },
      step(dt) { const tot = paths.reduce((a, p) => a + p.w, 0); let shown = 0; parts.forEach((q, i) => { if (!paths.length) { pos[i * 3 + 1] = -99; return; } if (q.path < 0 || q.path >= paths.length) { let r = (i * 0.37 % 1) * tot; q.path = paths.findIndex(p => (r -= p.w) < 0); if (q.path < 0) q.path = 0; }
        const p = paths[q.path]; q.u += dt * p.v / Math.max(0.1, p.len); if (q.u >= 1) { q.u -= 1; q.path = -1; } if (p.v <= 0) { pos[i * 3 + 1] = -99; return; } const xyz = at(p, q.u); pos.set(xyz, i * 3); shown++; }); g.attributes.position.needsUpdate = true; return shown; } }; };
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const stats = el('div', 'fh3d-stats'), statEl = {}; root.appendChild(stats);
  const stat = (k, t) => { const c = el('div', 'fh3d-card fh3d-stat', `<span>${t}</span><b></b>`); statEl[k] = c.querySelector('b'); stats.appendChild(c); };
  const msg = el('div', 'fh3d-card fh3d-msg'); msg.setAttribute('aria-live', 'polite'); root.appendChild(msg);
  const bar = el('div', 'fh3d-card fh3d-bar'); root.appendChild(bar);
  const btn = (t, fn, pressed) => { const b = el('button', '', t); b.type = 'button'; if (pressed != null) b.setAttribute('aria-pressed', pressed); b.addEventListener('click', () => fn(b)); bar.appendChild(b); return b; };
  /* orbit */
  const O = Object.assign({}, cam0), lim = { min: 8, max: 60 }; let dirty = true, raf = 0, last = 0, paused = false, visible = true, dead = false, busy = () => false, step = () => { };
  const touch = () => { dirty = true; if (!raf && !paused && !dead) raf = requestAnimationFrame(frame); };
  const place = () => { const cp = Math.cos(O.pitch); cam.position.set(O.t[0] + O.dist * cp * Math.sin(O.yaw), O.t[1] + O.dist * Math.sin(O.pitch), O.t[2] + O.dist * cp * Math.cos(O.yaw)); cam.lookAt(O.t[0], O.t[1], O.t[2]); };
  const api = { frames: 0, root };
  function frame(now) { raf = 0; if (dead) return; if (!root.isConnected) { api.destroy(); return; } if (paused || !visible) return; const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    step(dt); place(); renderer.render(scene, cam); api.frames++; dirty = false; if (busy() || drag) raf = requestAnimationFrame(frame); else last = 0; }
  let drag = null;
  const onDown = e => { drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); touch(); }, onMove = e => { if (!drag) return; O.yaw -= (e.clientX - drag.x) * 0.006; O.pitch = Math.max(-0.1, Math.min(1.4, O.pitch + (e.clientY - drag.y) * 0.005)); drag.x = e.clientX; drag.y = e.clientY; touch(); }, onUp = () => { drag = null; };
  const onWheel = e => { if (document.activeElement !== root && !root.contains(document.activeElement)) return; e.preventDefault(); O.dist = Math.max(lim.min, Math.min(lim.max, O.dist * (e.deltaY > 0 ? 1.08 : 0.93))); touch(); };
  const onKey = e => { if (e.target !== root) return; const k = e.key, f = { ArrowLeft: () => O.yaw -= 0.1, ArrowRight: () => O.yaw += 0.1, ArrowUp: () => O.pitch = Math.min(1.4, O.pitch + 0.08), ArrowDown: () => O.pitch = Math.max(-0.1, O.pitch - 0.08), '+': () => O.dist = Math.max(lim.min, O.dist * 0.9), '=': () => O.dist = Math.max(lim.min, O.dist * 0.9), '-': () => O.dist = Math.min(lim.max, O.dist * 1.1) }[k]; if (f) { f(); e.preventDefault(); touch(); } };
  cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove); cv.addEventListener('pointerup', onUp); root.addEventListener('wheel', onWheel, { passive: false }); root.addEventListener('keydown', onKey);
  const fitHooks = [], fit = () => { const w = root.clientWidth || 800, h = root.clientHeight || 520; renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = w / h < 1 ? 46 : 32; cam.updateProjectionMatrix(); fitHooks.forEach(f => f(w, h)); touch(); };
  const ro = new ResizeObserver(fit); ro.observe(root); const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) touch(); }); io.observe(root);
  Object.assign(api, { pause() { paused = true; if (raf) { cancelAnimationFrame(raf); raf = 0; } }, resume() { paused = false; last = 0; touch(); }, orbit: () => ({ yaw: O.yaw, pitch: O.pitch, dist: O.dist }), setOrbit(o) { if (o) { Object.assign(O, o); touch(); } },
    renderNow() { step(0); place(); renderer.render(scene, cam); api.frames++; },
    destroy() { if (dead) return; dead = true; FH3D_LIVE.delete(api); if (raf) cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); cv.removeEventListener('pointerdown', onDown); cv.removeEventListener('pointermove', onMove); cv.removeEventListener('pointerup', onUp); root.removeEventListener('wheel', onWheel); root.removeEventListener('keydown', onKey);
      K.trash.forEach(o => o.dispose && o.dispose()); renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss(); if (container.contains(root)) container.removeChild(root); } });
  fit(); FH3D_LIVE.add(api);
  return { THREE, K, C, V, scene, mat, led, add, box, pipe, flow, stat, statEl, stats, msg, btn, bar, el, touch, api, cam, O, lim, place, renderer, base: new Set(scene.children), onFit: f => fitHooks.push(f), setLoop(s, b) { step = s; busy = b; } };
}

/* ---- framing and the narrow layout, for any stage (v2.56; written for the labs in v2.55.1) ----
   The camera's target and distance are solved so that what was built on the stage (its meshes, its labels, and o.frame: points or a
   function returning points, for a moving part's travel) fits between the HUD cards and the button bar, at any width; solved again on
   resize unless the viewer moved the camera. o.under is the place under the picture: the message goes there at every width (o.msgUnder),
   the HUD cards on a narrow stage (≤ 640 px), where labels also grow and the stage's height follows the content. */
function fh3dFit(G, o) {
  o = o || {}; const api = G.api, V3 = G.THREE.Vector3, tmp = new V3(), under = o.under; let auto = null, fitW = 0, fitN = 0;
  if (under && o.msgUnder) { G.msg.classList.add('lab-msg'); under.insertBefore(G.msg, under.firstChild); }
  const framePts = () => { G.scene.updateMatrixWorld(true); const pts = [], spr = [];
    G.scene.children.filter(c => !G.base.has(c)).forEach(r => r.traverse(c => { if (c.isSprite) { if (c.visible && c.userData.wf) spr.push(c); return; } if (!c.isMesh || c.isInstancedMesh || c.userData.noFrame) return;
      const gm = c.geometry; if (!gm.boundingBox) gm.computeBoundingBox(); const b = gm.boundingBox; for (let i = 0; i < 8; i++) pts.push(new V3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).applyMatrix4(c.matrixWorld)); }));
    (typeof o.frame === 'function' ? o.frame() : o.frame || []).forEach(p => pts.push(new V3(p[0], p[1], p[2]))); return { pts, spr }; };
  const bounds = (F, cam) => { const v = new V3(), tf = Math.tan(cam.fov * Math.PI / 360), a = cam.aspect; let x0 = 9, x1 = -9, y0 = 9, y1 = -9; const put = (x, y) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); };
    F.pts.forEach(p => { v.copy(p).applyMatrix4(cam.matrixWorldInverse); const z = -v.z; if (z < 0.05) { put(-9, -9); put(9, 9); } else put(v.x / (z * tf * a), v.y / (z * tf)); });
    F.spr.forEach(s => { v.copy(s.getWorldPosition(tmp)).applyMatrix4(cam.matrixWorldInverse); const z = -v.z; if (z < 0.05) return; const cx = v.x / (z * tf * a), cy = v.y / (z * tf), dx = s.scale.x * s.userData.wf / 2 / (z * tf * a), dy = s.scale.y * 0.82 / 2 / (z * tf); put(cx - dx, cy - dy); put(cx + dx, cy + dy); });
    return [x0, x1, y0, y1]; };
  /* the bands the HUD takes at the top and the bottom, in CSS px (a running opening animation scales the rects: divide it out) */
  const bands = () => { const r = api.root.getBoundingClientRect(), k = r.width / (api.root.clientWidth || r.width || 1), sb = G.stats.getBoundingClientRect(), bb = G.bar.getBoundingClientRect(), inside = G.stats.parentElement === api.root, mi = G.msg.parentElement === api.root ? G.msg.getBoundingClientRect() : null;
    const top = Math.max(inside && sb.height ? (sb.bottom - r.top) / k + 8 : 10, mi && mi.height ? (mi.bottom - r.top) / k + 8 : 10); return [top, bb.height ? (r.bottom - bb.top) / k + 8 : 10]; };
  const room = () => { const [top, bot] = bands(), W = api.root.clientWidth, H = api.root.clientHeight, side = 12 / W; return [-1 + 2 * side, 1 - 2 * side, -1 + 2 * bot / H, 1 - 2 * top / H]; };
  const narrow = () => api.root.clientWidth && api.root.clientWidth <= 640;
  const placeStats = () => { if (!under) return; const inside = G.stats.parentElement === api.root; if (narrow() && inside) under.insertBefore(G.stats, under.firstChild); else if (!narrow() && !inside) api.root.insertBefore(G.stats, G.bar); };
  const autoFrame = () => { if (!api.root.clientWidth || !api.root.clientHeight) return; const F = framePts(); if (!F.pts.length) return; const cam = G.cam, O = G.O, [ax0, ax1, ay0, ay1] = room(), Rv = new V3(), Uv = new V3();
    for (let it = 0; it < 40; it++) { G.place(); cam.updateMatrixWorld(true); const [x0, x1, y0, y1] = bounds(F, cam), tf = Math.tan(cam.fov * Math.PI / 360), s = Math.max((x1 - x0) / (ax1 - ax0), (y1 - y0) / (ay1 - ay0)), dx = (x0 + x1 - ax0 - ax1) / 2, dy = (y0 + y1 - ay0 - ay1) / 2;
      if (Math.abs(s - 1) < 0.003 && Math.abs(dx) < 0.003 && Math.abs(dy) < 0.003) break; Rv.setFromMatrixColumn(cam.matrixWorld, 0); Uv.setFromMatrixColumn(cam.matrixWorld, 1); const kx = dx * O.dist * tf * cam.aspect, ky = dy * O.dist * tf;
      O.t = [O.t[0] + Rv.x * kx + Uv.x * ky, O.t[1] + Rv.y * kx + Uv.y * ky, O.t[2] + Rv.z * kx + Uv.z * ky]; O.dist = Math.max(4, Math.min(140, O.dist * (it < 30 ? s : Math.max(1, s) * 1.01))); }
    G.place(); auto = { yaw: G.O.yaw, pitch: G.O.pitch, dist: G.O.dist }; G.lim.max = Math.max(60, G.O.dist * 1.8); G.lim.min = Math.min(8, G.O.dist * 0.35); G.touch(); };
  const untouched = () => !auto || (Math.abs(G.O.yaw - auto.yaw) < 1e-9 && Math.abs(G.O.pitch - auto.pitch) < 1e-9 && Math.abs(G.O.dist - auto.dist) < 1e-9);
  /* labels grow on a narrow stage, so their text stays readable when the camera has to move back */
  const tagScale = () => { const k = Math.max(1, Math.min(1.7, 640 / (api.root.clientWidth || 640))); G.scene.traverse(c => { if (c.isSprite && c.userData.s0) c.scale.set(c.userData.s0[0] * k, c.userData.s0[1] * k, 1); }); };
  /* on a narrow stage a wide scene is limited by the width; the stage's height then follows the content's own aspect (only while the
     camera is automatic, and only a few passes per width, so it cannot oscillate) */
  const fitHeight = () => { const host = api.root.parentElement, W = api.root.clientWidth, H = api.root.clientHeight; if (!W || !H || !host || !under) return; if (W > 640) { if (host.style.height) host.style.height = ''; return; }
    if (W !== fitW) { fitW = W; fitN = 0; } if (fitN++ > 3) return; G.place(); G.cam.updateMatrixWorld(true); const [x0, x1, y0, y1] = bounds(framePts(), G.cam), [top, bot] = bands();
    const asp = ((y1 - y0) * H) / Math.max(1e-6, (x1 - x0) * W), want = Math.round(Math.max(280, Math.min(o.hMax || 470, asp * (W - 24) + top + bot + 6))); api.fitInfo = { W, H, asp, want, top, bot, n: fitN, b: [x0, x1, y0, y1] }; if (Math.abs(want - H) > 6) host.style.height = want + 'px'; };
  G.onFit(() => { placeStats(); tagScale(); if (untouched()) { autoFrame(); fitHeight(); } });
  /* for the checks: render once without the shadow floor and report where the pixels are, and how many fall under the HUD cards or the bar */
  const frameCheck = () => { const hid = []; G.scene.traverse(c => { if (c.material && c.material.isShadowMaterial && c.visible) { c.visible = false; hid.push(c); } }); api.renderNow();
    const gl = G.renderer.getContext(), w = gl.drawingBufferWidth, h = gl.drawingBufferHeight, px = new Uint8Array(w * h * 4); gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px); hid.forEach(c => { c.visible = true; }); api.renderNow();
    const r = api.root.getBoundingClientRect(), k = w / r.width, rect = e => { if (e.parentElement !== api.root) return null; const b = e.getBoundingClientRect(); return b.width ? [(b.left - r.left) * k, (b.top - r.top) * k, (b.right - r.left) * k, (b.bottom - r.top) * k] : null; }, sR = rect(G.stats), bR = rect(G.bar), mR = rect(G.msg);
    let x0 = w, x1 = -1, y0 = h, y1 = -1, n = 0, inS = 0, inB = 0; const inR = (R, x, y) => R && x >= R[0] && x < R[2] && y >= R[1] && y < R[3];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (px[(y * w + x) * 4 + 3] < 12) continue; const yy = h - 1 - y; n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; if (inR(sR, x, yy) || inR(mR, x, yy)) inS++; if (inR(bR, x, yy)) inB++; }
    return { w, h, k, n, box: [x0, y0, x1, y1], inS, inB, dist: G.O.dist, auto: !!auto }; };
  return { autoFrame, untouched, frameCheck, all() { placeStats(); tagScale(); autoFrame(); fitHeight(); } };
}

/* ---- the vacuum table: a press, a pump-down, a pressure switch ----
   The solenoid valve sends compressed air through the venturi; its throat sucks the zones under the panel. p(t) is vacCalc's
   curve; the switch closes at the threshold; the bow of the panel follows the clamp model. A small panel with every zone
   open adds leaks (illustrative conductance): p settles above the threshold and the machine waits. */
const VAC3 = { Copen: 1.5, z: [[-3, -2], [3, -2], [-3, 2], [3, 2]] };
function vac3Calc(small, recipe) { const open = small && recipe === 'all' ? 2 : 0, C = VT.C + open * VAC3.Copen / 2, vc = vacCalc({ C }), A = small ? VT.A / 2 : VT.A; return Object.assign(vc, { C, open, A, Fk: t => (VT.patm - vc.P(t)) * A }); }
function fh3dMountVacuum(THREE, container, opts) {
  opts = opts || {}; const G = fh3dStage(THREE, container, 'שולחן ואקום בתלת-ממד: לחיצה מפעילה שאיבה', { yaw: -0.5, pitch: 0.2, dist: 31, t: [3, -1.6, 0.5] }); if (!G) return null;
  const { THREE: T3, K, C, scene, mat, led, add, box, pipe, flow, stat, statEl, msg, btn, touch, api } = G, L = t => `<bdi dir="ltr">${t}</bdi>`;
  /* the table: slab, holes, zone lines */
  add(box(12, 0.8, 8, 0.12), mat.navy, [0, -0.4, 0]);
  const holes = new T3.InstancedMesh(K.keep(new T3.CylinderGeometry(0.07, 0.07, 0.02, 10)), mat.dark, 19 * 13), hm = new T3.Matrix4(); let hi = 0;
  for (let i = 0; i < 19; i++) for (let j = 0; j < 13; j++) { hm.makeTranslation(-5.4 + i * 0.6, 0.005, -3.6 + j * 0.6); holes.setMatrixAt(hi++, hm); } scene.add(holes);
  add(box(12, 0.02, 0.05, 0.01), mat.light, [0, 0.01, 0]); add(box(0.05, 0.02, 8, 0.01), mat.light, [0, 0.01, 0]);
  /* the panel: a thin board with traces; its bow is drawn exaggerated */
  const ptex = K.paint(512, 340, (g, w, h) => { g.fillStyle = '#1B2F5A'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7B5A3C'; g.lineWidth = 5; for (let i = 0; i < 14; i++) { g.beginPath(); g.moveTo(10, 20 + i * 23); g.lineTo(w * 0.4, 20 + i * 23); g.lineTo(w * 0.55, 32 + i * 23); g.lineTo(w - 10, 32 + i * 23); g.stroke(); } }); ptex.colorSpace = T3.SRGBColorSpace;
  const pgeo = (w) => K.keep(new T3.BoxGeometry(w, 0.12, 7.4, 24, 1, 16)), panelMat = K.keep(new T3.MeshPhysicalMaterial({ map: ptex, roughness: 0.5, clearcoat: 0.6 }));
  const panel = add(pgeo(11.6), panelMat, [0, 2.07, 0]); const base = Float32Array.from(panel.geometry.attributes.position.array);
  /* under the table: a riser and a zone valve per zone, all to a collector, then to the venturi's throat */
  const zoneLed = VAC3.z.map(([x, z]) => { pipe([x, -0.8, z], [x, -1.9, z], 0.16, mat.alu); add(box(0.6, 0.45, 0.45, 0.06), mat.navy, [x, -1.4, z]); add(K.can(0.2, -0.22, 0.22, 0.04), mat.brown, [x, -1.4, z + 0.42]).rotation.x = Math.PI / 2; const l = add(K.keep(new T3.SphereGeometry(0.08, 12, 8)), led(C.light), [x + 0.33, -1.25, z]); pipe([x, -1.9, z], [0, -2.3, 0], 0.13, mat.alu); return l; });
  pipe([0, -2.3, 0], [8.6, -2.3, 0], 0.2, mat.alu);
  /* the venturi along z at x = 8.6: compressed air enters at the front, speeds up in the nozzle, the throat sucks the side port, the diffuser and the muffler let it out at the back */
  const cone = (a, b, ra, rb, m) => { const o = pipe(a, b, 1, m); o.geometry = G.K.keep(new T3.CylinderGeometry(rb, ra, Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), 20)); return o; }, VX = 8.6, VY = -2.3;
  pipe([VX, VY, 4.4], [VX, VY, 1.2], 0.3, mat.alu); cone([VX, VY, 1.2], [VX, VY, 0.3], 0.3, 0.12, mat.alu); pipe([VX, VY, 0.3], [VX, VY, -0.3], 0.12, mat.alu); cone([VX, VY, -0.3], [VX, VY, -2.6], 0.12, 0.38, mat.alu);
  add(K.can(0.55, 0, 1.2, 0.1, 'z'), mat.char, [VX, VY, -3.8]);
  pipe([VX, VY, 4.4], [VX, VY, 5.4], 0.14, mat.hose); pipe([VX, VY, 5.4], [12.4, VY, 5.4], 0.12, mat.hose);
  /* the solenoid valve on the air line: body, coil, a plunger that lifts when energized */
  add(box(1.0, 0.7, 0.8, 0.08), mat.navy, [VX, VY, 4.9]); add(K.can(0.32, 0, 0.9, 0.05), mat.brown, [VX, -1.95, 4.9]); const plunger = add(K.can(0.12, 0, 0.6, 0.03), mat.alu, [VX, -1.9, 4.9]); const solLed = add(K.keep(new T3.SphereGeometry(0.09, 12, 8)), led(C.light), [VX + 0.55, -1.75, 4.9]);
  /* the gauge and the pressure switch on the suction line */
  pipe([7.2, -2.3, 0], [7.2, 0.3, 0], 0.1, mat.alu); add(K.can(0.75, -0.18, 0.18, 0.05, 'z'), mat.alu, [7.2, 1.0, 0]);
  const gc = document.createElement('canvas'); gc.width = gc.height = 256; const gx = gc.getContext('2d'), gtex = K.keep(new T3.CanvasTexture(gc)); gtex.colorSpace = T3.SRGBColorSpace;
  const face = add(K.keep(new T3.CircleGeometry(0.68, 40)), K.keep(new T3.MeshBasicMaterial({ map: gtex })), [7.2, 1.0, 0.19]); face.castShadow = false;
  pipe([7.2, -0.9, 0], [7.2, -0.9, 0.7], 0.08, mat.alu); add(box(0.7, 0.5, 0.5, 0.06), mat.cream, [7.2, -0.9, 0.95]); const swLed = add(K.keep(new T3.SphereGeometry(0.1, 12, 8)), led(C.blue), [7.2, -0.6, 1.15]);
  const drawGauge = dp => { const g = gx, c = 128; g.fillStyle = '#EEE9E0'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#1B2F5A'; g.lineWidth = 4; g.beginPath(); g.arc(c, c, 118, 0, 7); g.stroke();
    const ang = v => Math.PI * 0.75 + (v / 100) * Math.PI * 1.5; g.lineWidth = 3; for (let v = 0; v <= 100; v += 10) { const a = ang(v); g.beginPath(); g.moveTo(c + Math.cos(a) * 96, c + Math.sin(a) * 96); g.lineTo(c + Math.cos(a) * 112, c + Math.sin(a) * 112); g.stroke(); }
    g.strokeStyle = '#7B5A3C'; g.lineWidth = 10; g.beginPath(); g.arc(c, c, 104, ang(VT.th), ang(100)); g.stroke(); g.fillStyle = '#1B2F5A'; g.font = '700 26px system-ui'; g.textAlign = 'center'; g.fillText('−kPa', c, c + 62); g.font = '700 34px system-ui'; g.fillText(dp.toFixed(0), c, c + 30);
    const a = ang(Math.max(0, Math.min(100, dp))); g.strokeStyle = '#3078B0'; g.lineWidth = 6; g.beginPath(); g.moveTo(c, c); g.lineTo(c + Math.cos(a) * 92, c + Math.sin(a) * 92); g.stroke(); g.fillStyle = '#1B2F5A'; g.beginPath(); g.arc(c, c, 10, 0, 7); g.fill(); gtex.needsUpdate = true; };
  /* air */
  const air = flow(260, 0.42, C.light), suck = flow(360, 0.36, C.light);
  /* state */
  const S = { small: false, recipe: 'all', phase: 'idle', t: 0, lower: 0 }; let vc = vac3Calc(false, 'all');
  const qreq = 384 * CLAMP.E * Math.pow(0.8e-3, 3) * 1.6e-3 / (60 * Math.pow(CLAMP.L, 4)) / 1000;   /* the clamp model: pressure to flatten a 0.8 mm board with a 1.6 mm bow */
  const pNow = () => S.phase === 'pump' ? vc.P(S.t) : VT.patm, dpNow = () => VT.patm - pNow();
  const setPanel = () => { const w = S.small ? 5.6 : 11.6; panel.geometry.dispose(); panel.geometry = pgeo(w); panel.userData.base = Float32Array.from(panel.geometry.attributes.position.array); panel.position.x = S.small ? -3 : 0; };
  panel.userData.base = base;
  const bend = () => { const dp = dpNow(), bow = (S.phase === 'pump' ? Math.max(0, 1 - dp / qreq) : 1) * 0.35, a = panel.geometry.attributes.position, b = panel.userData.base, w = S.small ? 5.6 : 11.6;
    for (let i = 0; i < a.count; i++) { const x = b[i * 3], z = b[i * 3 + 2]; a.array[i * 3 + 1] = b[i * 3 + 1] + bow * Math.sin(Math.PI * (x / w + 0.5)) * Math.sin(Math.PI * (z / 7.4 + 0.5)); } a.needsUpdate = true; panel.geometry.computeVertexNormals(); };
  const zoneOpen = i => S.recipe === 'all' || (S.small ? VAC3.z[i][0] < 0 : true), zoneCovered = i => !S.small || VAC3.z[i][0] < 0;
  const paths = () => { const p = pNow(), run = S.phase === 'pump', fq = run ? Math.max(0.05, (p - VT.pult) / (VT.patm - VT.pult)) : 0, out = [];
    VAC3.z.forEach(([x, z], i) => { if (!run || !zoneOpen(i)) return; const cov = zoneCovered(i), top = cov ? 0.05 : 1.6, sp = cov ? 6 * fq : 7; for (let k = 0; k < 3; k++) { const hx = x + (k - 1) * 1.2, hz = z + (k % 2 ? 0.6 : -0.6); out.push({ pts: [[hx, top, hz], [hx, -0.1, hz], [x, -0.8, z], [x, -1.9, z], [0, -2.3, 0], [8.6, -2.3, 0], [8.6, -2.3, -3.8]], v: sp, w: cov ? fq : 2 }); } });
    suck.set(out); air.set(run ? [{ pts: [[12.4, -2.3, 5.4], [8.6, -2.3, 5.4], [8.6, -2.3, 0], [8.6, -2.3, -4.4]], v: 14 }] : []); };
  const LED = (m, on, col) => { m.material.emissiveIntensity = on ? 2.2 : 0; m.material.color.setHex(on ? col : C.char); };
  const hud = () => { const p = pNow(), dp = VT.patm - p, ok = S.phase === 'pump' && p <= VT.patm - VT.th;
    statEl.p.textContent = `${f1(p, 1)} kPa`; statEl.dp.textContent = `${f1(dp, 1)} kPa`; statEl.t.textContent = S.phase === 'pump' ? `${f1(S.t, 2)} s` : '—'; statEl.F.textContent = `${f1(dp * vc.A, 1)} kN`;
    drawGauge(dp); LED(swLed, ok, C.blue); LED(solLed, S.phase === 'pump', C.light); plunger.position.y = S.phase === 'pump' ? -1.62 : -1.9; zoneLed.forEach((l, i) => LED(l, S.phase === 'pump' && zoneOpen(i), C.light));
    let m; if (S.phase === 'idle') m = `<b>מוכן.</b> לחצו "הפעל": הפאנל יורד, השסתום פותח אוויר דחוס לוונטורי, והלחץ מתחת לפאנל יורד. הסף של מתג הלחץ: ${L('−' + VT.th + ' kPa')}.`;
    else if (S.phase === 'lower') m = '<b>הפאנל יורד</b> על השולחן. הוא המכסה של מערכת הוואקום.';
    else if (ok) m = `<b>מתג הלחץ סגר</b> אחרי ${L(f1(vc.tth, 2) + ' s')}, וקבוע הזמן של השאיבה ${L(f1(vc.tau, 2) + ' s')}. הבקר ממשיך לסריקה. הכוח שמצמיד את הפאנל: ${L(f1(dp * vc.A, 1) + ' kN')}.`;
    else if (!vc.reach && S.t > 3 * vc.tau) m = `<b>הלחץ התייצב על ${L(f1(vc.pss, 1) + ' kPa')}, מעל הסף.</b> המתג לא סוגר והמכונה מחכה. ${vc.open} אזורים פתוחים בלי פאנל מעליהם: כל האוויר נכנס דרכם. סגרו אותם במתכון.`;
    else m = `<b>שאיבה:</b> הלחץ יורד בעקומה מעריכית לכיוון ${L(f1(vc.pss, 1) + ' kPa')}, עם קבוע זמן ${L(f1(vc.tau, 2) + ' s')}.`;
    msg.innerHTML = m; msg.classList.toggle('alarm', S.phase === 'pump' && !vc.reach && S.t > 3 * vc.tau); };
  stat('p', 'לחץ מוחלט'); stat('dp', 'ואקום'); stat('t', 'זמן מהפתיחה'); stat('F', 'כוח הצמדה');
  const bRun = btn('▶ הפעל', () => api.run()), bSmall = btn('', () => api.set({ small: !S.small }), false), bRec = btn('', () => api.set({ recipe: S.recipe === 'all' ? 'under' : 'all' }), false), bOff = btn('⟲ שחרר', () => api.reset());
  const sync = () => { bSmall.textContent = S.small ? 'פאנל: קטן (חצי שולחן)' : 'פאנל: מלא'; bSmall.setAttribute('aria-pressed', S.small); bRec.textContent = S.recipe === 'all' ? 'מתכון: כל האזורים' : 'מתכון: רק מתחת לפאנל'; bRec.setAttribute('aria-pressed', S.recipe !== 'all'); bRun.disabled = S.phase !== 'idle'; };
  G.setLoop(dt => { if (S.phase === 'lower') { S.lower = Math.min(1, S.lower + dt / 1.1); if (S.lower >= 1) { S.phase = 'pump'; S.t = 0; } } else if (S.phase === 'pump') S.t += dt;
      panel.position.y = 0.07 + (1 - S.lower) * 2; bend(); paths(); air.step(dt); suck.step(dt); hud(); sync(); },
    () => S.phase === 'lower' || (S.phase === 'pump' && S.t < Math.max(6 * vc.tau, (vc.reach ? vc.tth : 0) + 2) + 6));
  Object.assign(api, {
    run() { if (S.phase !== 'idle') return; vc = vac3Calc(S.small, S.recipe); S.phase = 'lower'; S.lower = 0; touch(); },
    reset() { S.phase = 'idle'; S.t = 0; S.lower = 0; touch(); },
    set(o) { if ('small' in o) { S.small = !!o.small; setPanel(); } if ('recipe' in o) S.recipe = o.recipe === 'under' ? 'under' : 'all'; vc = vac3Calc(S.small, S.recipe); if (S.phase === 'pump') S.t = 0; touch(); },
    /* for checks: jump to a time of the pump-down */
    seek(t) { vc = vac3Calc(S.small, S.recipe); S.phase = 'pump'; S.lower = 1; S.t = t; api.renderNow(); return api.state(); },
    state: () => { const p = pNow(); return { phase: S.phase, small: S.small, recipe: S.recipe, t: S.t, p, dp: VT.patm - p, ok: S.phase === 'pump' && p <= VT.patm - VT.th, pss: vc.pss, tth: vc.tth, tau: vc.tau, reach: vc.reach, open: vc.open, F: (VT.patm - p) * vc.A, flow: suck.P.geometry.attributes.position.array.filter((v, i) => i % 3 === 1 && v > -50).length, msg: msg.textContent, alarm: msg.classList.contains('alarm') }; },
    getState: () => ({ v: 1, small: S.small, recipe: S.recipe, orbit: api.orbit(), user: !FR.untouched() }),
    setState(s) { if (!s) return; api.set({ small: !!s.small, recipe: s.recipe }); if (s.user && s.orbit) api.setOrbit(s.orbit); } });
  const FR = fh3dFit(G, { under: opts.under, msgUnder: true }); api.frameCheck = FR.frameCheck;
  sync(); hud(); FR.all(); api.renderNow(); return api;
}

/* ---- the safety chain: a door, an emergency stop, a safety relay, a drive and its motor ---- */
function fh3dMountChain(THREE, container, opts) {
  opts = opts || {}; const G = fh3dStage(THREE, container, 'שרשרת הבטיחות בתלת-ממד: דלת, עצירת חירום, ממסר בטיחות ודרייבר', { yaw: -0.35, pitch: 0.32, dist: 25, t: [1.5, 1.2, 0] }); if (!G) return null;
  const { THREE: T3, K, C, scene, mat, led, add, box, pipe, flow, stat, statEl, msg, btn, touch, api } = G, L = t => `<bdi dir="ltr">${t}</bdi>`;
  /* the door: frame, a glass door on a hinge, the switch on the frame and the actuator tongue on the door */
  add(box(0.3, 5, 0.3), mat.alu, [-7, 1.5, 0]); add(box(0.3, 5, 0.3), mat.alu, [-2, 1.5, 0]); add(box(5.3, 0.3, 0.3), mat.alu, [-4.5, 4.1, 0]); add(box(5.3, 0.3, 0.3), mat.alu, [-4.5, -1.1, 0]);
  const hinge = new T3.Group(); hinge.position.set(-6.85, 1.5, 0.25); scene.add(hinge);
  add(box(4.6, 4.6, 0.06), mat.glass, [2.35, 0, 0], hinge); add(box(4.6, 0.14, 0.12), mat.alu, [2.35, 2.3, 0], hinge); add(box(4.6, 0.14, 0.12), mat.alu, [2.35, -2.3, 0], hinge); add(box(0.14, 4.6, 0.12), mat.alu, [4.6, 0, 0], hinge);
  add(box(0.5, 0.12, 0.12), mat.brown, [4.45, 1.2, 0.12], hinge);   /* tongue */
  add(box(0.5, 0.8, 0.45), mat.cream, [-2.1, 2.7, 0.42]); const swLed = add(K.keep(new T3.SphereGeometry(0.07, 10, 8)), led(C.blue), [-2.1, 3.0, 0.66]);
  /* the control box: emergency stop (mushroom) and reset */
  add(box(2.2, 1.6, 1.0), mat.cream, [1.2, 1.6, 0]); const es = new T3.Group(); es.position.set(0.7, 2.4, 0); scene.add(es); add(K.can(0.18, 0, 0.35, 0.03), mat.char, null, es); add(K.can(0.42, 0.35, 0.55, 0.08), mat.brown, null, es);
  const reset = add(K.can(0.2, 0, 0.18, 0.04), mat.blue, [1.75, 2.4, 0]);
  /* the safety relay: a DIN module with K1, K2 and a fault light; the drive and its motor */
  add(box(1.0, 2.2, 1.4), mat.navy, [4.2, 2.0, 0]); const kA = add(K.keep(new T3.SphereGeometry(0.09, 10, 8)), led(C.light), [3.95, 2.7, 0.72]), kB = add(K.keep(new T3.SphereGeometry(0.09, 10, 8)), led(C.light), [4.2, 2.7, 0.72]), kF = add(K.keep(new T3.SphereGeometry(0.09, 10, 8)), led(C.brown), [4.45, 2.7, 0.72]);
  add(box(1.6, 2.8, 1.6), mat.navy, [7.4, 2.0, 0]); const sto = add(K.keep(new T3.SphereGeometry(0.1, 10, 8)), led(C.light), [7.4, 3.0, 0.82]);
  add(K.can(0.75, 0, 2.2, 0.08, 'x'), mat.char, [6.3, -1.3, 0]); const disk = new T3.Group(); disk.position.set(8.6, -1.3, 0); scene.add(disk); add(K.can(0.5, 0, 0.15, 0.03, 'x'), mat.alu, null, disk); add(box(0.16, 0.5, 0.1), mat.brown, [0.2, 0.25, 0], disk);
  pipe([7.4, 0.6, 0], [7.4, -0.55, 0], 0.08, mat.hose);
  /* the wires: channel A (front) and B (back), from the relay through the stop and the door switch and back */
  const ch = dz => [[4.2, 1.2, dz], [4.2, 0.5, dz], [0.7, 0.5, dz], [0.7, 2.0, dz], [0.7, 0.5, dz], [-2.1, 0.5, dz], [-2.1, 2.3, dz], [-2.1, 0.3, dz], [3.6, 0.3, dz], [3.6, 1.1, dz]];
  [[0.2, mat.blue], [-0.2, mat.light]].forEach(([dz, m]) => { const p = ch(dz); for (let i = 1; i < p.length; i++) pipe(p[i - 1], p[i], 0.035, m); });
  [[0.2, mat.blue], [-0.2, mat.light]].forEach(([dz, m]) => { pipe([4.7, 2.6, dz], [6.6, 2.6, dz], 0.035, m); });
  const cur = flow(140, 0.3, C.light);
  /* state */
  let S = Object.assign({}, CHAIN0), door = 0, w = 0, ang = 0, press = 0, flash = 0;
  const STOP = stopCalc();
  const LED = (m, on, col) => { m.material.emissiveIntensity = on ? 2.4 : 0; m.material.color.setHex(on ? col : C.char); };
  const MSG = { ready: 'המעגל מוכן. שני הערוצים סגורים. הממסר מחכה ל-Reset: הפעלה היא תמיד החלטה של אדם.', run: 'הממסר סגור: STO משוחרר, והמנוע מסתובב. נסו לפתוח את הדלת.',
    trip: `ערוץ נפתח, והממסר ניתק את שתי היציאות. הדרייבר מקבל STO: אין מומנט. בלי בלימה המנוע ממשיך להסתובב עד שהחיכוך עוצר אותו, כמו כאן. זמן התגובה של השרשרת ${L(f1(STOP.tr * 1000, 0) + ' ms')}; ציר במהירות ${L(SAFE.v + ' m/s')} שנבלם ב-${L(SAFE.a + ' m/s²')} עוצר תוך ${L(f1(STOP.s * 1000, 0) + ' mm')}.`,
    open: 'ערוץ פתוח. Reset לא יעזור: הממסר מתחיל רק כששני הערוצים סגורים.', closed: 'שני הערוצים סגורים, אבל המכונה לא זזה לבד. לוחצים Reset.', already: 'הממסר כבר סגור.',
    disc: 'Reset נדחה: רק ערוץ אחד נפתח ונסגר. מגע בערוץ השני לא נפתח כשנדרש, כנראה מרותך. הממסר נועל את עצמו עד שהתקלה מתוקנת ושני הערוצים נפתחים שוב. תקלה יחידה לא ביטלה את העצירה, והיא נמצאה בדרישה הבאה.' };
  const sync = () => { bDoor.textContent = S.door ? '🚪 פתח את הדלת' : '🚪 סגור את הדלת'; bEs.textContent = S.estop ? '🛑 שחרר עצירת חירום' : '🛑 לחץ עצירת חירום'; bEs.setAttribute('aria-pressed', S.estop); bWeld.setAttribute('aria-pressed', S.weld); bWeld.textContent = S.weld ? '⚠ ערוץ B מרותך: פעיל' : '⚠ תקלה: מגע ערוץ B מרותך'; };
  const hud = () => { const { A, B } = chainAB(S); statEl.a.textContent = A ? 'סגור' : 'פתוח'; statEl.b.textContent = B ? 'סגור' : 'פתוח'; statEl.r.textContent = S.fault ? 'נעול: תקלה' : S.on ? 'סגור' : 'פתוח'; statEl.d.textContent = S.on ? 'מופעל' : 'STO';
    LED(kA, S.on, C.light); LED(kB, S.on, C.light); LED(kF, S.fault && Math.floor(flash * 3) % 2 === 0, C.brown); LED(sto, S.on, C.light); LED(swLed, S.door, C.blue);
    msg.innerHTML = '<b>' + { run: 'פועל.', trip: 'עצירה.', disc: 'תקלה.', open: 'פתוח.', closed: 'סגור.', ready: 'מוכן.', already: '' }[S.msg] + '</b> ' + MSG[S.msg]; msg.classList.toggle('alarm', S.msg === 'disc' || S.msg === 'trip');
    const { A: a, B: b } = chainAB(S), paths = []; if (a) paths.push({ pts: ch(0.2), v: 3 }); if (b) paths.push({ pts: ch(-0.2), v: 3 }); if (S.on) paths.push({ pts: [[4.7, 2.6, 0.2], [6.6, 2.6, 0.2]], v: 3, w: 0.4 }, { pts: [[4.7, 2.6, -0.2], [6.6, 2.6, -0.2]], v: 3, w: 0.4 }); cur.set(paths); };
  const ev = e => { S = chainLogic(S, e); sync(); touch(); };
  stat('a', 'ערוץ A'); stat('b', 'ערוץ B'); stat('r', 'ממסר בטיחות'); stat('d', 'דרייבר');
  const bDoor = btn('', () => ev('door')), bEs = btn('', () => ev('estop'), false), bRes = btn('⟲ Reset', () => ev('reset')), bWeld = btn('', () => ev('weld'), false);
  G.setLoop(dt => { door += ((S.door ? 0 : 1) - door) * Math.min(1, dt * 4); hinge.rotation.y = -1.3 * door; press += ((S.estop ? 1 : 0) - press) * Math.min(1, dt * 8); es.position.y = 2.4 - 0.18 * press;
      w = S.on ? Math.min(1, w + dt * 0.8) : Math.max(0, w - dt * 0.35); ang += w * dt * 9; disk.rotation.x = ang; flash += dt; hud(); cur.step(dt); },
    () => Math.abs(door - (S.door ? 0 : 1)) > 0.002 || Math.abs(press - (S.estop ? 1 : 0)) > 0.002 || w > 0 || S.on || S.fault || chainAB(S).A || chainAB(S).B);
  Object.assign(api, { event: e => { ev(e); return api.state(); }, state: () => Object.assign({}, S, chainAB(S), { speed: w, alarm: msg.classList.contains('alarm'), msgText: msg.textContent }),
    settle() { for (let i = 0; i < 400; i++) { door = S.door ? 0 : 1; press = S.estop ? 1 : 0; w = S.on ? 1 : 0; } api.renderNow(); return api.state(); },
    getState: () => ({ v: 1, logic: S, orbit: api.orbit(), user: !FR.untouched() }), setState(s) { if (!s) return; if (s.logic) S = Object.assign({}, CHAIN0, s.logic); if (s.user && s.orbit) api.setOrbit(s.orbit); sync(); touch(); } });
  /* the frame holds the door open too: it swings out toward the viewer (its far edge at the end and half way) */
  const FR = fh3dFit(G, { under: opts.under, msgUnder: true, frame: [[-5.6, -0.9, 4.8], [-5.6, 3.9, 4.8], [-3.1, -0.9, 3.1], [-3.1, 3.9, 3.1]] }); api.frameCheck = FR.frameCheck;
  sync(); hud(); FR.all(); api.renderNow(); return api;
}
Object.assign(FH3D, { vacuum: fh3dMountVacuum, chain: fh3dMountChain });

/* ---- the windows ---- */
const LIVE3D = { '3d:vacuum': ['vac', 'שולחן הוואקום בתלת-ממד: לוחצים, שואבים, והמתג מחליט', 'vacuum', 'הפאנל הוא המכסה של מערכת הוואקום. השסתום פותח אוויר דחוס לוונטורי, הצוואר הצר שלו יונק את האזורים מתחת לפאנל, ומתג הלחץ מאשר לבקר להמשיך רק כשהלחץ עבר את הסף. נסו פאנל קטן עם כל האזורים פתוחים: הלחץ מתייצב מעל הסף, והמכונה מחכה. המספרים מאותו מודל שאיבה של הנושא; הדליפה של אזור פתוח היא ערך להמחשה.'],
  '3d:chain': ['safety', 'שרשרת הבטיחות בתלת-ממד: דלת, עצירת חירום, ממסר ודרייבר', 'chain', 'שני ערוצים נפרדים עוברים דרך מתג הדלת ודרך עצירת החירום. ממסר הבטיחות מנתק כשאחד מהם נפתח, ומתחיל מחדש רק ב-Reset, כששניהם סגורים ושניהם נפתחו מאז ההתחלה הקודמת. הדליקו את התקלה "מגע מרותך", פתחו וסגרו את הדלת, ולחצו Reset.'] };
WIN.add({ id: 'live3d', test: w => !!LIVE3D[w], info: w => ({ kind: 'sim', t: LIVE3D[w][1] }), ctx: () => 'SHARED',
  mount: (w, el) => { const [, , fn, note] = LIVE3D[w]; el.innerHTML = `<div class="lab-wrap"><div class="fh3dhost lab-host"></div><div class="lab-ctl nogl"></div></div><p class="note">${note}</p>`; const wrap = el.querySelector('.lab-wrap'), host = wrap.querySelector('.fh3dhost');
    if (typeof THREE === 'undefined') { host.innerHTML = '<p class="note">ספריית התלת-ממד לא נטענה.</p>'; return null; }
    const h = FH3D[fn](THREE, host, { reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, under: wrap.querySelector('.lab-ctl') }); el.fh3d = wrap.fh3d = h; if (!h) return null;
    return { getState: () => h.getState(), setState: s => h.setState(s), pause: () => h.pause(), resume: () => h.resume(), destroy: () => h.destroy() }; } });
Object.entries(LIVE3D).forEach(([w, [node]]) => { const n = zNode(node); if (n && !n.around.includes(w)) n.around.unshift(w); });
