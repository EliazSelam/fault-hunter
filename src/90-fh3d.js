/* ============ FH3D: real-time 3D with Three.js. First object: the laser scan head ============
   One contract for every 3D object: FH3D.mountX(THREE, container, opts) -> handle
   handle = { parts, setExplode, getExplode, setBeam, setCamera, select, highlight, getState, setState, pause, resume, resize, destroy }.
   The module builds everything inside the container (canvas, HUD, its own style), draws only when something changed,
   and cleans up after itself when the container leaves the page. No network, no files: textures are painted at run time.
   The numbers on the HUD come from shCalc and shTrace below, and the drawn beam is the same trace. */
const SH = {
  lam: LZ.lam,          // µm, the same wavelength as the laser model
  f: 100,               // mm, focal length of the f-theta lens (example)
  din: 0.75,            // mm, beam diameter out of the fiber collimator (example)
  mag: 5,               // beam expander
  mech: 7.2,            // degrees, mechanical range of each mirror (example)
  raster: 4             // degrees, mechanical amplitude of the demo raster
};
const SHV = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], norm: a => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; },
  refl: (d, n) => SHV.sub(d, SHV.mul(n, 2 * SHV.dot(d, n))),
  rotY: (a, t) => [a[0] * Math.cos(t) + a[2] * Math.sin(t), a[1], -a[0] * Math.sin(t) + a[2] * Math.cos(t)],
  rotX: (a, t) => [a[0], a[1] * Math.cos(t) - a[2] * Math.sin(t), a[1] * Math.sin(t) + a[2] * Math.cos(t)]
};
/* geometry of the head, in scene units (1 unit = 10 mm). The working distance under the lens is drawn shorter than the focal length, to keep the picture compact; the spot position is still f·θ. */
const SHG = { A: [0, 0, 0], B: [0, 0, 3], n1: SHV.norm([-1, 0, 1]), n2: SHV.norm([0, -1, -1]), yLens: -4.7, yPanel: -11.6, in0: [-6.9, 0, 0] };
/* what the optics give: waist radius w0 = 2·λ·f / (π·D), field = 2·f·θ with θ = 2 × the mechanical angle */
function shCalc() {
  const D = SH.din * SH.mag, w0 = 2 * SH.lam * 1e-3 * SH.f / (Math.PI * D) * 1e3, opt = 2 * SH.mech * Math.PI / 180;
  return { D, w0, field: 2 * SH.f * opt, zr: Math.PI * w0 * w0 / SH.lam };
}
/* the ray through the two mirrors and the lens, for mechanical angles a1 and a2 in degrees. The picture is drawn from this. */
function shTrace(a1, a2) {
  const t1 = a1 * Math.PI / 180, t2 = a2 * Math.PI / 180, n1 = SHV.rotY(SHG.n1, t1), n2 = SHV.rotX(SHG.n2, t2);
  const d1 = SHV.refl([1, 0, 0], n1), s = SHV.dot(SHV.sub(SHG.B, SHG.A), n2) / SHV.dot(d1, n2), P2 = SHV.add(SHG.A, SHV.mul(d1, s));
  const d2 = SHV.refl(d1, n2), P3 = SHV.add(P2, SHV.mul(d2, (SHG.yLens - P2[1]) / d2[1]));
  const ax = Math.atan2(d2[0], -d2[1]), az = Math.atan2(d2[2], -d2[1]);
  return { n1, n2, d1, d2, P2, P3, ax, az, mm: [SH.f * ax, SH.f * az], spot: [SH.f / 10 * ax, SHG.yPanel, SHG.B[2] + SH.f / 10 * az] };
}
const SH_PARTS = [
  ['housing', 'מארז', 'מגן על האופטיקה ומחזיק אותה ביישור', [['חומר', 'אלומיניום'], ['מבנה', 'שני חצאים וחלון'], ['אטימות', 'לאבק']]],
  ['fiber_port', 'כניסת סיב', 'מכניסה את אור הלייזר למארז', [['אורך גל', () => `${SH.lam * 1000} nm`], ['קוטר קרן', () => `${SH.din} mm`], ['כיוון', 'לאורך הציר']]],
  ['beam_expander', 'מרחיב קרן', 'מגדיל את קוטר הקרן כדי שתתמקד לכתם קטן', [['הגדלה', () => `×${SH.mag}`], ['קוטר יציאה', () => `${shCalc().D} mm`], ['מיקוד', 'טבעת ידנית']]],
  ['galvo_x', 'מראה ראשונה', 'מסיטה את הקרן בציר X של הפאנל', [['טווח מכני', () => `±${SH.mech}°`], ['הסטת קרן', 'פי 2 מזווית המראה'], ['ציר סיבוב', 'אנכי']]],
  ['galvo_y', 'מראה שנייה', 'מסיטה את הקרן בציר Y של הפאנל', [['טווח מכני', () => `±${SH.mech}°`], ['הסטת קרן', 'פי 2 מזווית המראה'], ['ציר סיבוב', 'אופקי']]],
  ['ftheta_lens', 'עדשת מיקוד שטוחת שדה', 'ממקדת את הקרן על מישור: המיקום שווה למוקד כפול הזווית', [['אורך מוקד', () => `${SH.f} mm`], ['שדה', () => `${f1(shCalc().field, 1)} mm`], ['רדיוס כתם', () => `${f1(shCalc().w0, 1)} µm`]]],
  ['protective_window', 'חלון מגן', 'מגן על העדשה מאדים ומפסולת של התיקון', [['חומר', 'זכוכית'], ['מיקום', 'מתחת לעדשה'], ['החלפה', 'כשמתלכלך']]],
  ['camera_port', 'פתח מצלמה', 'מצלמת הרישום רואה את האזור שבו הקרן פוגעת', [['תפקיד', 'רישום לסימני הפאנל'], ['מתי', 'לפני כל תיקון'], ['כיוון', 'מהצד']]],
  ['cable_bundle', 'צרור כבלים', 'מחבר את המנועים והחיישנים לבקר', [['מנועים', '2'], ['משוב מיקום', '2'], ['שחרור מאמץ', 'בכניסה']]]
];
const FH3D_CSS = `.fh3d-root{position:relative;width:100%;height:100%;min-height:420px;border-radius:18px;overflow:hidden;background:radial-gradient(ellipse at 50% 42%,#3078B0 0%,#1B2F5A 38%,#0d1830 100%);outline:none;touch-action:pan-y;direction:rtl;font-family:inherit}
.fh3d-root:focus-visible{box-shadow:0 0 0 3px #D6E8F7}.fh3d-root canvas{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab}.fh3d-root canvas:active{cursor:grabbing}
.fh3d-card{background:rgba(238,233,224,.92);border:1px solid rgba(27,47,90,.3);border-radius:12px;color:#4A4540;box-shadow:0 6px 24px rgba(13,24,48,.35);backdrop-filter:blur(6px)}
.fh3d-stats{position:absolute;top:12px;left:12px;display:grid;grid-template-columns:repeat(2,auto);gap:8px;pointer-events:none}.fh3d-stat{padding:6px 12px;display:flex;flex-direction:column;min-width:104px}.fh3d-stat span{font-size:11px;opacity:.8}.fh3d-stat b{font-size:17px;color:#1B2F5A;direction:ltr;text-align:right;font-variant-numeric:tabular-nums}
.fh3d-info{position:absolute;top:150px;left:12px;width:min(250px,40%);padding:10px 14px;transition:opacity .25s,transform .25s}.fh3d-info[hidden]{display:block;opacity:0;transform:translateY(-6px);pointer-events:none}.fh3d-info h4{margin:0 0 2px;font-size:16px;color:#1B2F5A}.fh3d-info p{margin:0 0 6px;font-size:13px;line-height:1.45}.fh3d-info dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:2px 10px;font-size:12px}.fh3d-info dt{opacity:.75}.fh3d-info dd{margin:0;font-weight:600;color:#1B2F5A}
.fh3d-bar{position:absolute;bottom:12px;left:12px;right:12px;padding:8px 10px;display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center}.fh3d-bar button{font:inherit;font-size:13px;padding:5px 12px;border-radius:999px;border:1px solid rgba(27,47,90,.45);background:transparent;color:#1B2F5A;cursor:pointer;transition:background .15s,color .15s}.fh3d-bar button:hover{background:#D6E8F7}.fh3d-bar button[aria-pressed="true"]{background:#1B2F5A;color:#EEE9E0}.fh3d-bar button:focus-visible{outline:2px solid #3078B0;outline-offset:2px}
.fh3d-bar label{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#1B2F5A}.fh3d-bar input[type=range]{width:120px;accent-color:#3078B0}.fh3d-sep{width:1px;align-self:stretch;background:rgba(27,47,90,.25)}.fh3d-parts{position:absolute;top:12px;right:12px;display:flex;flex-direction:column;gap:5px;padding:8px;max-height:calc(100% - 96px);overflow:auto}.fh3d-parts button{font:inherit;font-size:12px;padding:4px 12px;border-radius:999px;border:1px solid rgba(27,47,90,.35);background:transparent;color:#1B2F5A;cursor:pointer;text-align:right}.fh3d-parts button:hover{background:#D6E8F7}.fh3d-parts button[aria-pressed="true"]{background:#1B2F5A;color:#EEE9E0}.fh3d-parts button:focus-visible{outline:2px solid #3078B0;outline-offset:2px}.fh3d-parts b{font-size:11px;opacity:.7;font-weight:600;padding:0 4px 2px}
.fh3d-hint{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:12px 18px;font-size:14px}`;
/* the shared kit: painted textures, rounded geometry and a small studio to reflect. Everything it makes is tracked in trash for dispose. */
function fh3dKit(THREE) {
  const C = { navy: 0x1B2F5A, blue: 0x3078B0, light: 0xD6E8F7, char: 0x4A4540, brown: 0x7B5A3C, cream: 0xEEE9E0 };
  const trash = [], keep = o => { trash.push(o); return o; };
  /* ---------- painted textures ---------- */
  const paint = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = keep(new THREE.CanvasTexture(c)); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const brushed = paint(256, 256, (g, w, h) => { g.fillStyle = '#8a8a8a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 1400; i++) { const y = rnd() * h, l = 30 + rnd() * 200, x = rnd() * w, v = 90 + rnd() * 110 | 0; g.strokeStyle = `rgba(${v},${v},${v},${0.10 + rnd() * 0.25})`; g.lineWidth = 0.5 + rnd(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y); g.stroke(); g.beginPath(); g.moveTo(x - w, y); g.lineTo(x + l - w, y); g.stroke(); } }); brushed.repeat.set(0.35, 0.35);
  const knurl = paint(64, 64, (g, w, h) => { g.fillStyle = '#777'; g.fillRect(0, 0, w, h); g.strokeStyle = '#ddd'; g.lineWidth = 3; for (let i = -64; i < 128; i += 8) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 64, 64); g.stroke(); g.beginPath(); g.moveTo(i + 64, 0); g.lineTo(i, 64); g.stroke(); } }); knurl.repeat.set(14, 1);
  /* ---------- environment: a small studio rendered once, so metal and glass have something to reflect ---------- */
  const studio = renderer => { const es = new THREE.Scene(), sky = paint(16, 128, (g, w, h) => { const r = g.createLinearGradient(0, 0, 0, h); r.addColorStop(0, '#D6E8F7'); r.addColorStop(0.35, '#3078B0'); r.addColorStop(0.62, '#1B2F5A'); r.addColorStop(1, '#0d1830'); g.fillStyle = r; g.fillRect(0, 0, w, h); });
    sky.colorSpace = THREE.SRGBColorSpace; const dome = new THREE.Mesh(keep(new THREE.SphereGeometry(60, 24, 16)), keep(new THREE.MeshBasicMaterial({ map: sky, side: THREE.BackSide }))); es.add(dome);
    const box = (w, h, col, k, p, look) => { const m = new THREE.Mesh(keep(new THREE.PlaneGeometry(w, h)), keep(new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide }))); m.position.set(p[0], p[1], p[2]); m.lookAt(look[0], look[1], look[2]); es.add(m); };
    box(30, 18, C.cream, 9, [-22, 26, 18], [0, 0, 0]); box(14, 30, C.light, 5, [34, 6, 8], [0, 0, 0]); box(40, 6, C.light, 7, [0, 14, -36], [0, 0, 0]); box(18, 18, C.cream, 3, [6, 40, 0], [0, 0, 0]);
    const pm = new THREE.PMREMGenerator(renderer), rt = pm.fromScene(es, 0.03); trash.push(rt); pm.dispose(); return rt.texture; }
  /* ---------- geometry kit: everything is rounded ---------- */
  const rshape = (w, h, c) => { const s = new THREE.Shape(), x = w / 2, y = h / 2; c = Math.min(c, x, y); s.moveTo(-x + c, -y); s.lineTo(x - c, -y); s.absarc(x - c, -y + c, c, -Math.PI / 2, 0); s.lineTo(x, y - c); s.absarc(x - c, y - c, c, 0, Math.PI / 2); s.lineTo(-x + c, y); s.absarc(-x + c, y - c, c, Math.PI / 2, Math.PI); s.lineTo(-x, -y + c); s.absarc(-x + c, -y + c, c, Math.PI, 1.5 * Math.PI); return s; };
  /* a slab w × h, d thick along z, every edge rounded by r; holes = [[x, y, radius]] or [[x, y, w, h, corner]] */
  const rbox = (w, h, d, r, holes, corner) => { r = Math.max(0.0005, Math.min(r, w * 0.45, h * 0.45, d * 0.45)); const s = rshape(w - 2 * r, h - 2 * r, corner || 0.02);
    (holes || []).forEach(q => { if (q.length === 3) { const p = new THREE.Path(); p.absarc(q[0], q[1], q[2] + r, 0, 2 * Math.PI, true); s.holes.push(p); } else { s.holes.push(new THREE.Path(rshape(q[2] + 2 * r, q[3] + 2 * r, q[4] + r).getPoints(10).map(v => new THREE.Vector2(v.x + q[0], v.y + q[1])).reverse())); } });
    const g = keep(new THREE.ExtrudeGeometry(s, { depth: d - 2 * r, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 4, curveSegments: 10 })); g.translate(0, 0, -(d - 2 * r) / 2); return g; };
  /* a turned part: profile = [[radius, height], …] around y, then laid along the wanted axis */
  const lathe = (pts, axis, seg) => { const g = keep(new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg || 48)); if (axis === 'x') g.rotateZ(-Math.PI / 2); if (axis === 'z') g.rotateX(Math.PI / 2); return g; };
  /* a cylinder from y0 to y1 with chamfered ends */
  const can = (r, y0, y1, ch, axis, seg) => lathe([[0, y0], [r - ch, y0], [r, y0 + ch], [r, y1 - ch], [r - ch, y1], [0, y1]], axis, seg);
  const tube = (r, y0, y1, wall, axis) => lathe([[r - wall, y0], [r - 0.04, y0], [r, y0 + 0.04], [r, y1 - 0.04], [r - 0.04, y1], [r - wall, y1], [r - wall, y0]], axis);
  return { C, trash, keep, paint, rnd, brushed, knurl, studio, rshape, rbox, lathe, can, tube };
}
function fh3dMountScanHead(THREE, container, opts) {
  opts = opts || {}; const reduce = !!opts.reducedMotion, K = fh3dKit(THREE), C = K.C, trash = K.trash, keep = K.keep, V = (a, b, c) => Array.isArray(a) ? new THREE.Vector3(a[0], a[1], a[2]) : new THREE.Vector3(a, b, c);
  /* ---------- DOM ---------- */
  container.innerHTML = ''; const root = document.createElement('div'); root.className = 'fh3d-root nogl'; root.tabIndex = 0; root.setAttribute('role', 'group'); root.setAttribute('aria-label', 'ראש הסריקה של הלייזר בתלת-ממד. גרירה מסובבת, חצים מסובבים, פלוס ומינוס מקרבים ומרחיקים.');
  const style = document.createElement('style'); style.textContent = FH3D_CSS; root.appendChild(style); container.appendChild(root);
  let renderer; try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { root.innerHTML += '<div class="fh3d-card fh3d-hint">הדפדפן הזה לא מציג תלת-ממד (WebGL כבוי). שאר החלונות של הנושא עובדים כרגיל.</div>'; return null; }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.setClearColor(0x000000, 0); const cv = renderer.domElement; cv.setAttribute('aria-hidden', 'true'); root.appendChild(cv);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(32, 1, 0.5, 300);
  const { paint, brushed, knurl, studio, rshape, rbox, lathe, can, tube } = K;
  const glowTex = paint(128, 128, (g, w) => { const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, 'rgba(214,232,247,1)'); r.addColorStop(0.25, 'rgba(214,232,247,.75)'); r.addColorStop(0.6, 'rgba(48,120,176,.3)'); r.addColorStop(1, 'rgba(48,120,176,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  scene.environment = studio(renderer);
  /* ---------- light ---------- */
  const key = new THREE.DirectionalLight(C.cream, 2.6); key.position.set(-9, 34, 14); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 8; key.shadow.bias = -0.0005;
  Object.assign(key.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 110 }); key.target.position.set(0, -6, 1); scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(C.light, 0.9); fill.position.set(24, 6, 10); scene.add(fill); const rim = new THREE.DirectionalLight(C.blue, 2.2); rim.position.set(4, 12, -28); scene.add(rim); scene.add(new THREE.AmbientLight(C.light, 0.25));
  /* ---------- materials ---------- */
  const M = (o) => keep(new THREE.MeshPhysicalMaterial(o));
  const mat = {
    alu: M({ color: C.cream, metalness: 1, roughness: 0.42, roughnessMap: brushed, bumpMap: brushed, bumpScale: 0.6, clearcoat: 0.25, clearcoatRoughness: 0.4, envMapIntensity: 1.15 }),
    aluDark: M({ color: C.navy, metalness: 0.9, roughness: 0.45, roughnessMap: brushed, envMapIntensity: 1.2 }),
    black: M({ color: 0x23211f, metalness: 0.85, roughness: 0.5, roughnessMap: brushed, clearcoat: 0.5, clearcoatRoughness: 0.35 }),
    knurl: M({ color: 0x2c2926, metalness: 0.9, roughness: 0.55, bumpMap: knurl, bumpScale: 2.2 }),
    brass: M({ color: C.brown, metalness: 1, roughness: 0.24, envMapIntensity: 1.5 }),
    mirror: M({ color: C.cream, metalness: 1, roughness: 0.02, envMapIntensity: 1.8 }),
    glass: M({ color: C.light, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.32, envMapIntensity: 2.2, clearcoat: 1, clearcoatRoughness: 0.02, side: THREE.DoubleSide, depthWrite: false }),
    pane: M({ color: C.light, metalness: 0, roughness: 0.06, transparent: true, opacity: 0.13, envMapIntensity: 1.6, side: THREE.DoubleSide, depthWrite: false }),
    rubber: M({ color: 0x2f2c29, metalness: 0, roughness: 0.85 }),
    ring: M({ color: C.blue, emissive: C.blue, emissiveIntensity: 1.4, metalness: 0.2, roughness: 0.4 }),
    cable: M({ color: C.navy, metalness: 0.1, roughness: 0.6, clearcoat: 0.6 }),
    steel: M({ color: C.cream, metalness: 1, roughness: 0.25 })
  };
  /* ---------- parts ---------- */
  const parts = {}, order = SH_PARTS.map(p => p[0]), model = new THREE.Group(); scene.add(model);
  order.forEach(id => { const g = new THREE.Group(); g.name = id; parts[id] = g; model.add(g); });
  /* every mesh gets its own material, so one part can be lit or dimmed without touching another */
  const put = (parent, geo, material, p, sub) => { const m = new THREE.Mesh(geo, keep(material.clone())); if (p) m.position.set(p[0], p[1], p[2]); m.castShadow = !material.transparent; m.receiveShadow = !material.transparent; m.userData.o = material.opacity; m.userData.tr = material.transparent; (sub || parent).add(m); let q = sub || parent; while (q && !parts[q.name]) q = q.parent; m.userData.part = q ? q.name : parent.name; return m; };
  const moves = [];   /* [object, explode vector] */
  const sub = (id, vec) => { const g = new THREE.Group(); parts[id].add(g); moves.push([g, V(vec)]); return g; };
  const bolt = (g, p, axis) => put(parts.housing, can(0.17, 0, 0.14, 0.04, axis, 12), mat.steel, p, g);
  /* housing: base, back and front stay; the two cover halves open sideways */
  { const fixed = sub('housing', [0, 0, 0]), ha = sub('housing', [0, 2.6, -6]), hb = sub('housing', [0, 2.6, 6]);
    const base = rbox(12.6, 12.1, 0.6, 0.12, [[0, 3, 2.35]], 0.5); base.rotateX(Math.PI / 2); put(parts.housing, base, mat.alu, [-1, -3.5, 0.75], fixed);
    const back = rbox(12.1, 8.6, 0.55, 0.12, [[0.75, -1.0, 0.72], [3.75, 0.8, 0.5]], 0.5); back.rotateY(Math.PI / 2); put(parts.housing, back, mat.alu, [-7.03, 0.8, 0.75], fixed);
    const front = rbox(12.1, 8.6, 0.55, 0.12, [[2.25, -0.2, 0.55]], 0.5); front.rotateY(Math.PI / 2); put(parts.housing, front, mat.alu, [5.03, 0.8, 0.75], fixed);
    put(parts.housing, rbox(11.5, 8.6, 0.5, 0.12, null, 0.5), mat.alu, [-1, 0.8, -5.05], ha);
    const topA = rbox(11.5, 5.7, 0.5, 0.12, null, 0.4); topA.rotateX(Math.PI / 2); put(parts.housing, topA, mat.alu, [-1, 5.35, -2.2], ha);
    put(parts.housing, rbox(11.5, 8.6, 0.5, 0.12, [[0.6, -0.4, 7.4, 5.2, 0.7]], 0.5), mat.alu, [-1, 0.8, 6.55], hb);
    put(parts.housing, rbox(7.6, 5.4, 0.08, 0.03, null, 0.7), mat.pane, [-0.4, 0.4, 6.55], hb);
    const topB = rbox(11.5, 5.7, 0.5, 0.12, null, 0.4); topB.rotateX(Math.PI / 2); put(parts.housing, topB, mat.alu, [-1, 5.35, 3.7], hb);
    [[-6.2, 4.6], [4.2, 4.6], [-6.2, -3.0], [4.2, -3.0]].forEach(([x, y]) => { bolt(hb, [x, y, 6.78], 'z'); const b = bolt(ha, [x, y, -5.28], 'z'); b.rotation.x = Math.PI; });
    [[-6.2, -4.4], [4.2, -4.4], [-6.2, 5.9], [4.2, 5.9]].forEach(([x, z]) => bolt(fixed, [x, -3.2, z], 'y')); }
  /* fiber port and its fiber */
  { const g = sub('fiber_port', [-4, 0, 0]); put(parts.fiber_port, lathe([[0, -8.5], [0.42, -8.5], [0.5, -8.4], [0.5, -7.7], [0.72, -7.6], [0.72, -7.34], [0.95, -7.3], [0.95, -6.75], [0.6, -6.75], [0, -6.75]], 'x'), mat.steel, null, g);
    put(parts.fiber_port, tube(0.74, -7.62, -7.34, 0.06, 'x'), mat.knurl, null, g);
    const path = new THREE.CatmullRomCurve3([V(-8.5, 0, 0), V(-10.2, 0, 0), V(-11.8, -0.6, -0.8), V(-13, -2.6, -2.2), V(-13.4, -5.5, -3)]); put(parts.fiber_port, keep(new THREE.TubeGeometry(path, 40, 0.13, 10)), mat.cable, null, g);
    put(parts.fiber_port, lathe([[0.14, -9.6], [0.3, -9.4], [0.34, -8.5], [0, -8.5]], 'x'), mat.rubber, null, g); }
  /* beam expander: a barrel, two glass elements, a knurled focus ring and a thread */
  { const g = sub('beam_expander', [0, 3.6, 0]); put(parts.beam_expander, lathe([[0.55, -6.2], [0.78, -6.2], [0.82, -6.15], [0.82, -4.9], [0.95, -4.8], [0.95, -2.5], [0.9, -2.2], [0.74, -2.2], [0.74, -4.7], [0.55, -4.85], [0.55, -6.2]], 'x'), mat.black, null, g);
    put(parts.beam_expander, tube(1.03, -4.25, -3.35, 0.09, 'x'), mat.knurl, null, g);
    for (let i = 0; i < 5; i++) put(parts.beam_expander, tube(0.985, -3.2 + i * 0.13, -3.13 + i * 0.13, 0.04, 'x'), mat.steel, null, g);
    put(parts.beam_expander, tube(0.86, -6.0, -5.8, 0.05, 'x'), mat.brass, null, g);
    const lens = (r, x, k) => { const s = keep(new THREE.SphereGeometry(r, 32, 16)); s.scale(k, 1, 1); put(parts.beam_expander, s, mat.glass, [x, 0, 0], g); }; lens(0.5, -5.9, 0.28); lens(0.7, -2.45, 0.3);
    const foot = rbox(1.5, 2.6, 0.5, 0.1, null, 0.2); put(parts.beam_expander, foot, mat.aluDark, [-4.2, -2.05, 0], g).rotation.y = Math.PI / 2;
    put(parts.beam_expander, tube(1.0, -4.75, -4.4, 0.06, 'x'), mat.aluDark, null, g); }
  /* a mirror on a motor */
  const galvo = (id, at, axis, vec, n0) => { const g = sub(id, vec), ax = axis === 'y' ? [0, 1, 0] : [1, 0, 0], P = k => [at[0] + ax[0] * k, at[1] + ax[1] * k, at[2] + ax[2] * k];
    const body = lathe([[0, 1.05], [0.5, 1.05], [0.62, 1.2], [0.86, 1.3], [0.9, 1.45], [0.9, 3.1], [0.84, 3.2], [0.84, 3.34], [0.9, 3.44], [0.9, 4.0], [0.78, 4.2], [0, 4.2]], axis, 56); put(parts[id], body, mat.aluDark, at, g);
    put(parts[id], tube(0.865, 3.2, 3.34, 0.1, axis), mat.ring, at, g);
    for (let i = 0; i < 4; i++) put(parts[id], tube(0.93, 1.7 + i * 0.3, 1.82 + i * 0.3, 0.05, axis), mat.black, at, g);
    put(parts[id], can(0.34, 4.2, 4.5, 0.06, axis, 20), mat.rubber, at, g);
    const flange = rbox(2.5, 2.5, 0.26, 0.08, [[0, 0, 0.62]], 0.45); if (axis === 'y') flange.rotateX(Math.PI / 2); else flange.rotateY(Math.PI / 2); put(parts[id], flange, mat.alu, P(1.42), g);
    const spin = new THREE.Group(); spin.position.set(at[0], at[1], at[2]); g.add(spin);
    put(parts[id], can(0.13, 0.5, 1.1, 0.03, axis, 16), mat.steel, null, spin);
    const q0 = new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), V(n0)), hold = new THREE.Group(); hold.quaternion.copy(q0); spin.add(hold);
    put(parts[id], rbox(1.7, 1.3, 0.14, 0.045, null, 0.12), mat.mirror, null, hold);
    put(parts[id], rbox(axis === 'y' ? 0.5 : 0.3, axis === 'y' ? 0.3 : 0.5, 0.3, 0.06, null, 0.05), mat.black, axis === 'y' ? [0, 0.6, -0.1] : [0.8, 0, -0.1], hold);
    return spin; };
  const spin1 = galvo('galvo_x', SHG.A, 'y', [0, 3.6, 0], SHG.n1), spin2 = galvo('galvo_y', SHG.B, 'x', [0, 0, 4.6], SHG.n2);
  /* f-theta lens under the base */
  { const g = sub('ftheta_lens', [0, -3.2, 0]), at = [0, 0, 3];
    put(parts.ftheta_lens, lathe([[1.5, -3.15], [2.3, -3.15], [2.3, -3.8], [2.75, -3.85], [2.8, -3.95], [2.8, -4.3], [2.3, -4.4], [2.3, -6.0], [2.15, -6.25], [1.75, -6.25], [1.75, -6.05], [1.9, -5.9], [1.9, -3.6], [1.5, -3.5], [1.5, -3.15]], null, 64), mat.black, at, g);
    put(parts.ftheta_lens, tube(2.34, -5.2, -4.75, 0.08, null), mat.knurl, at, g);
    put(parts.ftheta_lens, lathe([[1.55, -6.34], [2.1, -6.34], [2.17, -6.27], [2.17, -6.12], [1.55, -6.12], [1.55, -6.34]], null, 64), mat.brass, at, g);
    const front = keep(new THREE.SphereGeometry(1.72, 48, 24)); front.scale(1, 0.34, 1); put(parts.ftheta_lens, front, mat.glass, [0, -5.95, 3], g);
    const top = keep(new THREE.SphereGeometry(1.5, 40, 20)); top.scale(1, 0.3, 1); put(parts.ftheta_lens, top, mat.glass, [0, -3.5, 3], g); }
  { const g = sub('protective_window', [0, -5.6, 0]), at = [0, 0, 3];
    put(parts.protective_window, lathe([[1.6, -6.95], [2.15, -6.95], [2.2, -6.9], [2.2, -6.5], [2.15, -6.45], [1.9, -6.45], [1.9, -6.6], [1.6, -6.6], [1.6, -6.95]], null, 64), mat.aluDark, at, g);
    put(parts.protective_window, can(1.75, -6.8, -6.68, 0.02, null, 48), mat.glass, at, g);
    put(parts.protective_window, tube(2.24, -6.82, -6.62, 0.06, null), mat.knurl, at, g); }
  { const g = sub('camera_port', [3.6, 0, 0]);
    put(parts.camera_port, lathe([[0.3, 4.9], [0.58, 4.9], [0.58, 5.3], [0.8, 5.34], [0.8, 5.5], [0.58, 5.54], [0.58, 6.5], [0.3, 6.5], [0.3, 4.9]], 'x'), mat.black, [0, 0.6, -1.5], g);
    put(parts.camera_port, tube(0.62, 5.8, 6.2, 0.05, 'x'), mat.knurl, [0, 0.6, -1.5], g);
    put(parts.camera_port, rbox(1.9, 1.9, 2.3, 0.22, null, 0.3), mat.aluDark, [7.65, 0.6, -1.5], g).rotation.y = Math.PI / 2;
    put(parts.camera_port, tube(0.4, 8.8, 8.86, 0.3, 'x'), mat.ring, [0, 0.6, -1.5], g);
    const s = keep(new THREE.SphereGeometry(0.3, 20, 10)); s.scale(0.3, 1, 1); put(parts.camera_port, s, mat.glass, [4.95, 0.6, -1.5], g); }
  { const g = sub('cable_bundle', [-3.6, -0.6, -1.2]);
    put(parts.cable_bundle, lathe([[0, -7.25], [0.5, -7.25], [0.62, -7.35], [0.62, -7.9], [0.5, -8.0], [0.42, -8.9], [0.3, -9.0], [0, -9.0]], 'x'), mat.rubber, [0, 1.6, -3.0], g);
    [[0, 0.14, C.navy], [0.16, -0.1, C.char], [-0.16, -0.1, C.blue]].forEach(([dz, dy, col], i) => { const p = new THREE.CatmullRomCurve3([V(-8.9, 1.6 + dy, -3 + dz), V(-10.4, 1.5 + dy, -3.2 + dz), V(-11.8, 0.2 + dy, -4.2 + dz * 2), V(-12.6, -2.6, -5 + dz * 3 - i * 0.2), V(-12.9, -5.6, -5.4 + dz * 4)]); const m = put(parts.cable_bundle, keep(new THREE.TubeGeometry(p, 40, 0.12, 10)), mat.cable, null, g); m.material.color.setHex(col); }); }
  /* ---------- stage: a small panel under the head, a soft shadow, and the beam ---------- */
  const stage = new THREE.Group(); scene.add(stage);
  const pc = document.createElement('canvas'); pc.width = pc.height = 512; const pg = pc.getContext('2d'), pbase = document.createElement('canvas'); pbase.width = pbase.height = 512;
  { const g = pbase.getContext('2d'); g.fillStyle = '#1B2F5A'; g.fillRect(0, 0, 512, 512); g.strokeStyle = '#7B5A3C'; g.lineWidth = 7; g.lineCap = 'round'; for (let i = 0; i < 9; i++) { const y = 60 + i * 49; g.beginPath(); g.moveTo(40, y); g.lineTo(200 + (i % 3) * 40, y); g.lineTo(240 + (i % 3) * 40, y + 24); g.lineTo(472, y + 24); g.stroke(); } g.fillStyle = '#7B5A3C'; for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) { g.beginPath(); g.arc(70 + i * 34, 30 + j * 462, 9, 0, 7); g.fill(); } }
  const ptex = keep(new THREE.CanvasTexture(pc)); ptex.colorSpace = THREE.SRGBColorSpace; ptex.anisotropy = 4;
  const panel = new THREE.Mesh((() => { const g = rbox(9, 9, 0.3, 0.1, null, 0.5); g.rotateX(-Math.PI / 2); return g; })(), keep(new THREE.MeshPhysicalMaterial({ color: C.navy, metalness: 0.2, roughness: 0.5, clearcoat: 0.6 }))); panel.position.set(0, SHG.yPanel - 0.16, 3); panel.receiveShadow = true; panel.castShadow = true; stage.add(panel);
  const pface = new THREE.Mesh(keep(new THREE.PlaneGeometry(8.6, 8.6)), keep(new THREE.MeshPhysicalMaterial({ map: ptex, metalness: 0.35, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3 }))); pface.rotation.x = -Math.PI / 2; pface.position.set(0, SHG.yPanel, 3); pface.receiveShadow = true; stage.add(pface);
  const floor = new THREE.Mesh(keep(new THREE.PlaneGeometry(120, 120)), keep(new THREE.ShadowMaterial({ opacity: 0.38, color: 0x0d1830 }))); floor.rotation.x = -Math.PI / 2; floor.position.y = SHG.yPanel - 0.35; floor.receiveShadow = true; stage.add(floor);
  const beam = new THREE.Group(); beam.visible = false; scene.add(beam);
  const coreM = keep(new THREE.MeshBasicMaterial({ color: C.light })), glowM = keep(new THREE.MeshBasicMaterial({ color: C.blue, transparent: true, opacity: 0.38, blending: THREE.AdditiveBlending, depthWrite: false }));
  const segGeo = keep(new THREE.CylinderGeometry(1, 1, 1, 14, 1, true)), coneGeo = keep(new THREE.CylinderGeometry(1, 0.1, 1, 20, 1, true));
  const seg = (r, cone) => { const g = new THREE.Group(), a = new THREE.Mesh(cone ? coneGeo : segGeo, coreM), b = new THREE.Mesh(cone ? coneGeo : segGeo, glowM); a.scale.set(r, 1, r); b.scale.set(r * 2.6, 1, r * 2.6); g.add(a, b); beam.add(g); return g; };
  const UP = V(0, 1, 0), tv = V(0, 0, 0), setSeg = (g, a, b) => { tv.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]); const l = tv.length(); g.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); g.scale.y = l; g.quaternion.setFromUnitVectors(UP, tv.normalize()); };
  const s0 = seg(0.035), s1 = seg(0.1), s2 = seg(0.1), s3 = seg(0.1), s4 = seg(0.1, true); setSeg(s0, SHG.in0, [-6.2, 0, 0]); setSeg(s1, [-2.2, 0, 0], SHG.A);
  const spot = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }))); spot.scale.set(1.5, 1.5, 1); beam.add(spot);
  const hit = (p) => { const s = new THREE.Sprite(spot.material); s.scale.set(0.7, 0.7, 1); s.position.set(p[0], p[1], p[2]); beam.add(s); return s; }; hit(SHG.A); const hit2 = hit(SHG.B);
  /* ---------- outline for hover and selection: the same shape, pushed out along its normals, drawn from behind ---------- */
  const hullMat = (w, op) => { const m = keep(new THREE.MeshBasicMaterial({ color: C.light, side: THREE.BackSide, transparent: true, opacity: op, depthWrite: false })); m.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `vec3 transformed = position + normalize(normal) * ${w.toFixed(3)};`); }; m.customProgramCacheKey = () => 'fh3d-hull-' + w; return m; };
  const hullHover = hullMat(0.07, 0.75), hullSel = hullMat(0.1, 0.95), hulls = { hover: [], sel: [] };
  const setHull = (kind, id) => { hulls[kind].forEach(h => h.parent && h.parent.remove(h)); hulls[kind] = []; if (!id || !parts[id]) return; const list = []; parts[id].traverse(o => { if (o.isMesh && !o.userData.hull && !o.userData.tr) list.push(o); });
    list.forEach(o => { const h = new THREE.Mesh(o.geometry, kind === 'sel' ? hullSel : hullHover); h.userData.hull = true; h.position.copy(o.position); h.quaternion.copy(o.quaternion); h.scale.copy(o.scale); h.raycast = () => { }; o.parent.add(h); hulls[kind].push(h); }); };
  /* ---------- state ---------- */
  const S = { explode: reduce ? 0 : 1, explodeTo: 0, beam: false, camera: 'hero', selected: null, hover: null, speed: 1, playing: true, t: 0, a1: 0, a2: 0, tour: -1, tourT: 0 };
  const CAMS = { hero: [-0.5, 0.2, 50, [0, -4.4, 1.5]], front: [0, 0.05, 48, [0, -4.4, 1.5]], top: [-0.3, 1.2, 46, [0, -3, 1.5]], inside: [-0.42, 0.16, 15.5, [0.1, -0.5, 1.5]] };
  const O = { yaw: -0.5, pitch: 0.2, dist: 50, tx: 0, ty: -4.4, tz: 1.5 }, G = Object.assign({}, O); let camT = 1, camFrom = null, dirty = true, paused = false, visible = true, dead = false, raf = 0, last = 0;
  const ease = k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2, touch = () => { dirty = true; if (!raf && !paused && !dead) raf = requestAnimationFrame(frame); };
  const goCam = (v, instant) => { Object.assign(G, { yaw: v[0], pitch: v[1], dist: v[2], tx: v[3][0], ty: v[3][1], tz: v[3][2] }); if (instant || reduce) { Object.assign(O, G); camT = 1; } else { camFrom = Object.assign({}, O); camT = 0; } touch(); };
  const applyCam = () => { const cp = Math.cos(O.pitch); cam.position.set(O.tx + O.dist * cp * Math.sin(O.yaw), O.ty + O.dist * Math.sin(O.pitch), O.tz + O.dist * cp * Math.cos(O.yaw)); cam.lookAt(O.tx, O.ty, O.tz); };
  const applyExplode = () => { const k = ease(S.explode); moves.forEach(([g, v]) => g.position.set(v.x * k, v.y * k, v.z * k)); beam.visible = S.beam && S.explode < 0.02; };
  const qy = new THREE.Quaternion(), qx = new THREE.Quaternion(), AX = V(1, 0, 0), trail = [];
  const applyBeam = () => { const T = shTrace(S.a1, S.a2); spin1.quaternion.copy(qy.setFromAxisAngle(UP, S.a1 * Math.PI / 180)); spin2.quaternion.copy(qx.setFromAxisAngle(AX, S.a2 * Math.PI / 180));
    setSeg(s2, SHG.A, T.P2); setSeg(s3, T.P2, T.P3); setSeg(s4, T.P3, T.spot); spot.position.set(T.spot[0], T.spot[1] + 0.05, T.spot[2]); hit2.position.set(T.P2[0], T.P2[1], T.P2[2]);
    if (S.beam && S.explode < 0.02) { trail.push([T.spot[0], T.spot[2] - 3]); if (trail.length > 220) trail.shift(); }
    pg.drawImage(pbase, 0, 0); pg.lineCap = 'round'; for (let i = 1; i < trail.length; i++) { const a = trail[i - 1], b = trail[i], k = i / trail.length; pg.strokeStyle = `rgba(214,232,247,${0.85 * k * k})`; pg.lineWidth = 3; pg.beginPath(); pg.moveTo((a[0] / 8.6 + 0.5) * 512, (a[1] / 8.6 + 0.5) * 512); pg.lineTo((b[0] / 8.6 + 0.5) * 512, (b[1] / 8.6 + 0.5) * 512); pg.stroke(); } ptex.needsUpdate = true; return T; };
  const dim = () => { model.traverse(o => { if (!o.isMesh || o.userData.hull) return; const off = S.selected && o.userData.part !== S.selected; const tr = off || o.userData.tr; if (o.material.transparent !== tr) { o.material.transparent = tr; o.material.needsUpdate = true; } o.material.opacity = off ? o.userData.o * 0.22 : o.userData.o; o.material.depthWrite = !off && !o.userData.tr; o.castShadow = !off && !o.userData.tr; }); };
  /* ---------- HUD ---------- */
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }, L = t => `<bdi dir="ltr">${t}</bdi>`;
  const stats = el('div', 'fh3d-stats'), KC = shCalc(), statEl = {};
  [['w0', 'רדיוס הכתם'], ['field', 'שדה הסריקה'], ['ang', 'זוויות המראות'], ['pos', 'מיקום הכתם']].forEach(([k, t]) => { const c = el('div', 'fh3d-card fh3d-stat', `<span>${t}</span><b></b>`); statEl[k] = c.querySelector('b'); stats.appendChild(c); }); root.appendChild(stats);
  statEl.w0.textContent = `${f1(KC.w0, 1)} µm`; statEl.field.textContent = `${f1(KC.field, 1)} mm`;
  const info = el('div', 'fh3d-card fh3d-info'); info.hidden = true; info.setAttribute('aria-live', 'polite'); root.appendChild(info);
  const bar = el('div', 'fh3d-card fh3d-bar'); root.appendChild(bar);
  const btn = (t, fn, pressed) => { const b = el('button', '', t); b.type = 'button'; if (pressed != null) b.setAttribute('aria-pressed', pressed); b.addEventListener('click', () => fn(b)); bar.appendChild(b); return b; };
  const bBeam = btn('קרן', () => api.setBeam(!S.beam), false), bPlay = btn('❚❚ עצור', () => { S.playing = !S.playing; sync(); touch(); }), bSpeed = btn('', () => { S.speed = S.speed === 1 ? 5 : 1; sync(); });
  bar.appendChild(el('span', 'fh3d-sep')); const exl = el('label', '', 'פירוק <input type="range" min="0" max="1" step="0.01" value="0" aria-label="פירוק המכלול">'); bar.appendChild(exl); const exr = exl.querySelector('input'); exr.addEventListener('input', () => api.setExplode(+exr.value, true));
  bar.appendChild(el('span', 'fh3d-sep')); const camB = {}; [['hero', 'מבט כללי'], ['front', 'חזית'], ['top', 'מלמעלה'], ['inside', 'פנימה, אל המראות']].forEach(([k, t]) => { camB[k] = btn(t, () => api.setCamera(k), false); });
  const bTour = btn('סיור מצלמה', () => { if (S.tour >= 0) { S.tour = -1; sync(); return; } S.tour = 0; S.tourT = 0; S.explodeTo = 0.55; api.select(order[0]); sync(); touch(); }, false); if (reduce) bTour.hidden = true;
  const pbox = el('div', 'fh3d-card fh3d-parts', '<b>החלקים, לפי סדר האור</b>'); root.appendChild(pbox); const partB = {};
  SH_PARTS.forEach(([id, name]) => { const b = el('button', '', name); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.addEventListener('click', () => api.select(S.selected === id ? null : id)); b.addEventListener('focus', () => api.highlight(id)); b.addEventListener('blur', () => api.highlight(null)); b.addEventListener('pointerenter', () => api.highlight(id)); b.addEventListener('pointerleave', () => api.highlight(null)); pbox.appendChild(b); partB[id] = b; });
  const sync = () => { bBeam.setAttribute('aria-pressed', S.beam); bBeam.textContent = S.beam ? 'קרן: פועלת' : 'קרן: כבויה'; bPlay.textContent = S.playing ? '❚❚ עצור' : '▶ נגן'; bSpeed.innerHTML = 'מהירות ' + L('×' + S.speed); bTour.setAttribute('aria-pressed', S.tour >= 0);
    Object.entries(camB).forEach(([k, b]) => b.setAttribute('aria-pressed', S.camera === k)); Object.entries(partB).forEach(([k, b]) => b.setAttribute('aria-pressed', S.selected === k)); exr.value = S.explodeTo;
    const p = SH_PARTS.find(q => q[0] === S.selected); info.hidden = !p; if (p) info.innerHTML = `<h4>${p[1]}</h4><p>${p[2]}</p><dl>${p[3].map(([a, b]) => `<dt>${a}</dt><dd>${typeof b === 'function' ? L(b()) : b}</dd>`).join('')}</dl>`; };
  const hud = T => { statEl.ang.textContent = `${S.a1 >= 0 ? '+' : '−'}${f1(Math.abs(S.a1), 1)}°  ${S.a2 >= 0 ? '+' : '−'}${f1(Math.abs(S.a2), 1)}°`; statEl.pos.textContent = `${f1(T.mm[0], 1)}, ${f1(T.mm[1], 1)} mm`; };
  /* ---------- the frame: nothing is drawn unless something changed ---------- */
  const tri = u => { const k = u - Math.floor(u); return k < 0.5 ? 4 * k - 1 : 3 - 4 * k; };
  function frame(now) { raf = 0; if (dead) return; if (!root.isConnected) { api.destroy(); return; } if (paused || !visible) return; const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now; let busy = false;
    if (Math.abs(S.explode - S.explodeTo) > 0.001) { const stepv = dt / 1.6; S.explode += Math.sign(S.explodeTo - S.explode) * Math.min(stepv, Math.abs(S.explodeTo - S.explode)); busy = true; } else S.explode = S.explodeTo;
    if (camT < 1) { camT = Math.min(1, camT + dt / 0.8); const k = ease(camT); Object.keys(G).forEach(q => { O[q] = camFrom[q] + (G[q] - camFrom[q]) * k; }); busy = true; }
    if (S.beam && S.playing && !reduce && S.explode < 0.02) { S.t += dt * S.speed; S.a1 = SH.raster * tri(S.t * 0.9); S.a2 = SH.raster * (2 * ((S.t * 0.06) % 1) - 1); busy = true; }
    if (S.tour >= 0) { S.tourT += dt; if (S.tourT > 12 / order.length) { S.tourT = 0; S.tour++; if (S.tour >= order.length) { S.tour = -1; S.explodeTo = 0; api.select(null); api.setCamera('hero'); } else api.select(order[S.tour]); sync(); } busy = true; }
    applyExplode(); const T = applyBeam(); hud(T); applyCam(); renderer.render(scene, cam); dirty = false; api.frames++;
    if (busy || dirty) raf = requestAnimationFrame(frame); else last = 0; }
  /* ---------- pointer, wheel and keys ---------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), pick = e => { const r = cv.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, cam); const h = ray.intersectObject(model, true).find(q => !q.object.userData.hull && q.object.material.opacity > 0.3); return h ? h.object.userData.part : null; };
  let drag = null; const free = () => { camT = 1; Object.assign(G, O); S.camera = null; };
  const onDown = e => { drag = { x: e.clientX, y: e.clientY, moved: 0 }; cv.setPointerCapture(e.pointerId); }, onMove = e => { if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.moved += Math.abs(dx) + Math.abs(dy); drag.x = e.clientX; drag.y = e.clientY; if (drag.moved > 4) { free(); O.yaw -= dx * 0.006; O.pitch = Math.max(-0.3, Math.min(1.45, O.pitch + dy * 0.005)); sync(); touch(); } } else { const p = pick(e); if (p !== S.hover) api.highlight(p); } };
  const onUp = e => { if (drag && drag.moved <= 4) api.select(pick(e)); drag = null; }, onLeave = () => { if (!drag) api.highlight(null); };
  const onWheel = e => { if (document.activeElement !== root && !root.contains(document.activeElement)) return; e.preventDefault(); free(); O.dist = Math.max(12, Math.min(90, O.dist * (e.deltaY > 0 ? 1.08 : 0.93))); sync(); touch(); };
  const onKey = e => { if (e.target !== root) return; const k = e.key; let used = true; if (k === 'ArrowLeft') { free(); O.yaw -= 0.1; } else if (k === 'ArrowRight') { free(); O.yaw += 0.1; } else if (k === 'ArrowUp') { free(); O.pitch = Math.min(1.45, O.pitch + 0.08); } else if (k === 'ArrowDown') { free(); O.pitch = Math.max(-0.3, O.pitch - 0.08); } else if (k === '+' || k === '=') { free(); O.dist = Math.max(12, O.dist * 0.9); } else if (k === '-') { free(); O.dist = Math.min(90, O.dist * 1.1); } else if (k === 'Escape') api.select(null); else used = false; if (used) { e.preventDefault(); sync(); touch(); } };
  cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove); cv.addEventListener('pointerup', onUp); cv.addEventListener('pointerleave', onLeave); root.addEventListener('wheel', onWheel, { passive: false }); root.addEventListener('keydown', onKey);
  const fit = () => { const w = root.clientWidth || 800, h = root.clientHeight || 520; renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = w / h < 1 ? 46 : 32; cam.updateProjectionMatrix(); touch(); };
  const ro = new ResizeObserver(fit); ro.observe(root); const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) touch(); }); io.observe(root);
  const watch = setInterval(() => { if (!root.isConnected) api.destroy(); }, 1500);
  /* ---------- the handle ---------- */
  const api = { parts: order.slice(), frames: 0,
    setExplode(t, instant) { S.explodeTo = Math.max(0, Math.min(1, +t || 0)); if (instant || reduce) S.explode = S.explodeTo; sync(); touch(); }, getExplode: () => S.explodeTo,
    setBeam(on) { S.beam = !!on; if (!S.beam) { trail.length = 0; } sync(); touch(); },
    setCamera(name, instant) { if (!CAMS[name]) return; S.camera = name; goCam(CAMS[name], instant); sync(); },
    select(id) { S.selected = parts[id] ? id : null; setHull('sel', S.selected); dim(); if (S.selected && S.tour >= 0) { const b = new THREE.Box3().setFromObject(parts[id]), c = b.getCenter(V(0, 0, 0)); goCam([O.yaw + 0.5, 0.3, 26, [c.x, c.y, c.z]]); } sync(); touch(); if (opts.onSelect) opts.onSelect(S.selected); },
    highlight(id) { id = parts[id] ? id : null; if (id === S.hover) return; S.hover = id; setHull('hover', id === S.selected ? null : id); touch(); if (opts.onHover) opts.onHover(id); },
    getState: () => ({ v: 1, explode: S.explodeTo, beam: S.beam, camera: S.camera, selected: S.selected, orbit: { yaw: G.yaw, pitch: G.pitch, dist: G.dist }, speed: S.speed }),
    setState(s) { if (!s) return; if (s.speed) S.speed = s.speed === 5 ? 5 : 1; if (s.explode != null) api.setExplode(s.explode, true); if (s.beam != null) api.setBeam(s.beam); if (s.camera && CAMS[s.camera]) api.setCamera(s.camera, true); else if (s.orbit) { S.camera = null; Object.assign(G, s.orbit); Object.assign(O, G); camT = 1; } if ('selected' in s) api.select(s.selected); sync(); touch(); },
    pause() { paused = true; if (raf) { cancelAnimationFrame(raf); raf = 0; } }, resume() { paused = false; last = 0; touch(); }, resize: fit, trace: () => shTrace(S.a1, S.a2), angles: (a, b) => { S.a1 = a; S.a2 = b; touch(); },
    renderNow() { applyExplode(); const T = applyBeam(); hud(T); applyCam(); renderer.render(scene, cam); },
    destroy() { if (dead) return; dead = true; if (raf) cancelAnimationFrame(raf); clearInterval(watch); ro.disconnect(); io.disconnect();
      cv.removeEventListener('pointerdown', onDown); cv.removeEventListener('pointermove', onMove); cv.removeEventListener('pointerup', onUp); cv.removeEventListener('pointerleave', onLeave); root.removeEventListener('wheel', onWheel); root.removeEventListener('keydown', onKey);
      trash.forEach(o => o.dispose && o.dispose()); renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss(); if (container.contains(root)) container.removeChild(root); } };
  /* ---------- start ---------- */
  fit(); Object.assign(O, { yaw: CAMS.hero[0], pitch: CAMS.hero[1], dist: CAMS.hero[2] }); Object.assign(G, O); dim(); sync();
  if (opts.initialState) api.setState(opts.initialState); else if (reduce) { S.explode = S.explodeTo = 0; }
  api.renderNow(); touch(); return api;
}
window.FH3D = { mountScanHead: fh3dMountScanHead, software: false };

/* ---- the window: the laser unit's object at the showcase level ---- */
function fh3dWindow(el) {
  el.innerHTML = `<div class="fh3dhost"></div><p class="note">ראש הסריקה מכוון את הקרן בלי להזיז את הפאנל: שתי מראות קטנות מסיטות אותה, ועדשה אחת ממקדת אותה על המישור. לחצו על חלק כדי לקרוא עליו, הזיזו את "פירוק" כדי לראות מה בפנים, והדליקו את הקרן כדי לעקוב אחרי האור. המספרים הם דוגמה ללימוד, מחושבים מאותו מודל לייזר של שאר החלונות, ולא מפרט של יצרן.</p>`;
  const host = el.querySelector('.fh3dhost'); if (typeof THREE === 'undefined') { host.innerHTML = '<p class="note">ספריית התלת-ממד לא נטענה.</p>'; return null; }
  const h = FH3D.mountScanHead(THREE, host, { reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, lang: 'he' }); el.fh3d = h; if (!h) return null;
  return { getState: () => h.getState(), setState: s => h.setState(s), pause: () => h.pause(), resume: () => h.resume(), destroy: () => h.destroy() };
}
WIN.add({ id: 'fh3d', test: w => w === '3d:scanhead', info: () => ({ kind: 'sim', t: 'ראש הסריקה של הלייזר בתלת-ממד: פירוק, קרן ומסלול האור' }), mount: (w, el) => fh3dWindow(el), ctx: () => 'AOS' });
(n => { if (n && !n.around.includes('3d:scanhead')) n.around.unshift('3d:scanhead'); })(zNode('laserunit'));
