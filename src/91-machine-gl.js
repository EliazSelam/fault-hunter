/* ============ The machine, drawn in real-time 3D ============
   The machine view keeps its logic (parts, explode, selection, opening a part, the line, picking, names): this file only
   replaces the picture. A WebGL canvas sits under the view's own canvas and shows the same parts from the same camera;
   the view's canvas stays on top for the names and the pointer. If WebGL is missing, nothing here runs and the old drawing stays.
   Every part is built inside the boxes of MPARTS, so what you click is what you see. Colours: palette shades only. */
/* one renderer, one studio and one set of materials and part builders for the whole book: the machine view and the topic
   objects take turns on it (only one of them is on a page at a time). null where 3D would be drawn in software only. */
let FH3D_REAL = null, FH3D_NO = false;
function fh3dCore(THREE) {
  if (FH3D_REAL) return FH3D.software || !FH3D_REAL.soft ? FH3D_REAL : null; if (FH3D_NO && !FH3D.software) return null;
  const K = fh3dKit(THREE), C = K.C, keep = K.keep, { rbox, can, tube, lathe, paint, brushed, knurl } = K;
  /* a browser that would draw 3D in software only (no graphics acceleration) keeps the earlier drawing: a slow picture is worse than a plain one */
  let renderer; try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { FH3D_NO = true; return null; }
  const soft = (() => { const g = renderer.getContext(), x = g.getExtension('WEBGL_debug_renderer_info'), name = x ? String(g.getParameter(x.UNMASKED_RENDERER_WEBGL)) : ''; return /swiftshader|llvmpipe|software|basic render/i.test(name); })();
  if (soft && !FH3D.software) { K.trash.forEach(o => o.dispose && o.dispose()); renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss(); FH3D_NO = true; return null; }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.setClearColor(0x000000, 0);
  const gl = renderer.domElement; gl.setAttribute('aria-hidden', 'true');
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(47, 1100 / 680, 0.2, 200); scene.environment = K.studio(renderer);
  /* the machine's axes have z up; the studio has y up */
  const root = new THREE.Group(); root.rotation.x = -Math.PI / 2; scene.add(root);
  const key = new THREE.DirectionalLight(C.cream, 2.5); key.position.set(-9, 17, 11); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 7; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  scene.add(key, key.target); const fill = new THREE.DirectionalLight(C.light, 0.8); fill.position.set(14, 6, 8); scene.add(fill); const rim = new THREE.DirectionalLight(C.blue, 1.8); rim.position.set(3, 8, -16); scene.add(rim); scene.add(new THREE.AmbientLight(C.light, 0.3));
  const floor = new THREE.Mesh(keep(new THREE.PlaneGeometry(90, 90)), keep(new THREE.ShadowMaterial({ opacity: 0.42, color: 0x0d1830 }))); floor.receiveShadow = true; root.add(floor);
  /* ---------- materials ---------- */
  const M = o => keep(new THREE.MeshPhysicalMaterial(o)), tex = (w, h, fn, rep) => { const t = paint(w, h, fn); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rep) t.repeat.set(rep[0], rep[1]); return t; };
  const granite = tex(256, 256, (g, w, h) => { g.fillStyle = '#35312e'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { const v = K.rnd(); g.fillStyle = v > 0.7 ? 'rgba(238,233,224,.28)' : v > 0.35 ? 'rgba(74,69,64,.9)' : 'rgba(20,18,17,.55)'; g.fillRect(K.rnd() * w, K.rnd() * h, 1 + K.rnd() * 2.2, 1 + K.rnd() * 2.2); } }, [0.5, 0.5]);
  const holes = tex(512, 400, (g, w, h) => { g.fillStyle = '#c9ced4'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2826'; for (let i = 0; i < 30; i++) for (let j = 0; j < 23; j++) { g.beginPath(); g.arc(14 + i * 16.7, 14 + j * 16.9, 2.6, 0, 7); g.fill(); } g.strokeStyle = '#1B2F5A'; g.lineWidth = 3; [w / 3, 2 * w / 3].forEach(x => { g.beginPath(); g.moveTo(x, 6); g.lineTo(x, h - 6); g.stroke(); }); g.strokeRect(5, 5, w - 10, h - 10); });
  const pcb = tex(512, 384, (g, w, h) => { g.fillStyle = '#1B2F5A'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7B5A3C'; g.lineCap = 'round'; g.lineWidth = 4; for (let i = 0; i < 13; i++) { const y = 26 + i * 27; g.beginPath(); g.moveTo(24, y); g.lineTo(150 + (i % 4) * 46, y); g.lineTo(170 + (i % 4) * 46, y + 13); g.lineTo(w - 24, y + 13); g.stroke(); } g.fillStyle = '#7B5A3C'; for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++) { g.beginPath(); g.arc(360 + i * 14, 300 + j * 14, 4, 0, 7); g.fill(); } g.strokeStyle = '#D6E8F7'; g.lineWidth = 2; [[18, 18], [w - 18, 18], [18, h - 18], [w - 18, h - 18]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 7, 0, 7); g.stroke(); }); });
  const vents = tex(64, 64, (g, w, h) => { g.fillStyle = '#9a9a9a'; g.fillRect(0, 0, w, h); g.fillStyle = '#222'; for (let i = 0; i < 8; i++) g.fillRect(8, 4 + i * 8, w - 16, 3); }, [1, 2]);
  const wind = paint(8, 64, (g, w, h) => { g.fillStyle = '#888'; g.fillRect(0, 0, w, h); g.fillStyle = '#ddd'; for (let i = 0; i < 16; i++) g.fillRect(0, i * 4, w, 2); }); wind.repeat.set(1, 3);
  const lamin = paint(8, 64, (g, w, h) => { g.fillStyle = '#999'; g.fillRect(0, 0, w, h); g.fillStyle = '#555'; for (let i = 0; i < 32; i++) g.fillRect(0, i * 2, w, 1); }); lamin.repeat.set(1, 4);
  const grating = tex(256, 16, (g, w, h) => { g.fillStyle = '#D6E8F7'; g.fillRect(0, 0, w, h); g.fillStyle = '#1B2F5A'; for (let i = 0; i < 64; i++) g.fillRect(i * 4, 2, 2, h - 4); }, [6, 1]);
  const thread = knurl.clone(); thread.repeat.set(2, 70); thread.needsUpdate = true; keep(thread);
  const mat = {
    granite: M({ map: granite, metalness: 0.1, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.25 }),
    alu: M({ color: C.cream, metalness: 1, roughness: 0.4, roughnessMap: brushed, clearcoat: 0.2, envMapIntensity: 1.15 }),
    steel: M({ color: C.cream, metalness: 1, roughness: 0.22, envMapIntensity: 1.3 }),
    thread: M({ color: C.cream, metalness: 1, roughness: 0.35, bumpMap: thread, bumpScale: 1.6 }),
    navy: M({ color: C.navy, metalness: 0.55, roughness: 0.34, clearcoat: 0.85, clearcoatRoughness: 0.2, envMapIntensity: 1.3 }),
    blue: M({ color: C.blue, metalness: 0.75, roughness: 0.32, clearcoat: 0.6, envMapIntensity: 1.3 }),
    black: M({ color: 0x23211f, metalness: 0.8, roughness: 0.5, roughnessMap: brushed, clearcoat: 0.4 }),
    knurl: M({ color: 0x2c2926, metalness: 0.9, roughness: 0.55, bumpMap: knurl, bumpScale: 2 }),
    brass: M({ color: C.brown, metalness: 1, roughness: 0.26, envMapIntensity: 1.5 }),
    brown: M({ color: C.brown, metalness: 0.2, roughness: 0.45, clearcoat: 0.7 }),
    cream: M({ color: C.cream, metalness: 0.15, roughness: 0.5, clearcoat: 0.45, clearcoatRoughness: 0.35 }),
    shell: M({ color: 0x8fa3b8, metalness: 0.35, roughness: 0.5, roughnessMap: brushed, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
    char: M({ color: C.char, metalness: 0.3, roughness: 0.55 }),
    table: M({ map: holes, metalness: 0.9, roughness: 0.38, envMapIntensity: 1.1 }),
    pcb: M({ map: pcb, metalness: 0.3, roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.3 }),
    vent: M({ color: C.navy, metalness: 0.5, roughness: 0.4, bumpMap: vents, bumpScale: 1.5, clearcoat: 0.5 }),
    glass: M({ color: C.light, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.34, envMapIntensity: 2.2, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false }),
    pane: M({ color: C.light, metalness: 0, roughness: 0.08, transparent: true, opacity: 0.1, envMapIntensity: 1.5, side: THREE.DoubleSide, depthWrite: false }),
    tint: M({ color: C.light, metalness: 0.1, roughness: 0.25, transparent: true, opacity: 0.5, clearcoat: 0.8, depthWrite: false }),
    copper: M({ color: C.brown, metalness: 1, roughness: 0.34, bumpMap: wind, bumpScale: 1.4, envMapIntensity: 1.4 }),
    lam: M({ color: 0x3a3632, metalness: 0.85, roughness: 0.5, bumpMap: lamin, bumpScale: 1.2 }),
    grat: M({ map: grating, metalness: 0.6, roughness: 0.3 }),
    ring: M({ color: C.blue, emissive: C.blue, emissiveIntensity: 1.6, roughness: 0.4 }),
    lamp: M({ color: C.light, emissive: C.light, emissiveIntensity: 1.3, roughness: 0.3 })
  };
  const byKey = { mech: 'brown', ink: 'navy', live: 'blue', tint: 'tint', text: 'char' };
  /* ---------- building ---------- */
  const put = (g, geo, m, p) => { const o = new THREE.Mesh(geo, keep((typeof m === 'string' ? mat[m] : m).clone())); if (p) o.position.set(p[0], p[1], p[2]); const tr = o.material.transparent; o.castShadow = !tr; o.receiveShadow = !tr; o.userData.o = o.material.opacity; o.userData.tr = tr; o.userData.e = o.material.emissive.getHex(); o.userData.ei = o.material.emissiveIntensity; g.add(o); return o; };
  /* a rounded block that fills a box [x0, x1, y0, y1, z0, z1] */
  const B = (g, b, m, r, corner) => { const w = b[1] - b[0], h = b[3] - b[2], d = b[5] - b[4], mn = Math.min(w, h, d); return put(g, rbox(w, h, d, r != null ? r : mn * 0.16, null, corner != null ? corner : Math.min(w, h) * 0.1), m, [(b[0] + b[1]) / 2, (b[2] + b[3]) / 2, (b[4] + b[5]) / 2]); };
  /* a chamfered cylinder along an axis, from a to b, centred on the other two coordinates */
  const Cy = (g, ax, a, b, r, c, m, ch) => put(g, can(r, a, b, ch != null ? ch : r * 0.12, ax === 'y' ? null : ax, 40), m, ax === 'x' ? [0, c[0], c[1]] : ax === 'y' ? [c[0], 0, c[1]] : [c[0], c[1], 0]);
  const Tb = (g, ax, a, b, r, wall, c, m) => put(g, tube(r, a, b, wall, ax === 'y' ? null : ax), m, ax === 'x' ? [0, c[0], c[1]] : ax === 'y' ? [c[0], 0, c[1]] : [c[0], c[1], 0]);
  const face = (g, w, h, m, p) => put(g, keep(new THREE.PlaneGeometry(w, h)), m, p);
  const PB = {
    base(g) { B(g, [-3.2, 3.2, -2.4, 2.4, -0.5, 0], 'granite', 0.07, 0.3); [[-2.9, -2.1], [2.9, -2.1], [-2.9, 2.1], [2.9, 2.1]].forEach(([x, y]) => Cy(g, 'z', -0.5, -0.42, 0.2, [x, y], 'steel')); },
    rails(g) { [-1.5, 1.5].forEach(x => { B(g, [x - 0.1, x + 0.1, -2.2, 2.2, 0, 0.06], 'navy', 0.02, 0.03); B(g, [x - 0.055, x + 0.055, -2.2, 2.2, 0.05, 0.15], 'steel', 0.022, 0.02); [-1.0, 1.0].forEach(y => B(g, [x - 0.1, x + 0.1, y - 0.22, y + 0.22, 0.09, 0.19], 'black', 0.03, 0.03)); }); },
    screw(g) { Cy(g, 'y', -2.1, 2.1, 0.055, [0, 0.1], 'thread', 0.01); [-2.02, 2.02].forEach(y => B(g, [-0.15, 0.15, y - 0.08, y + 0.08, 0.01, 0.2], 'alu', 0.03, 0.04)); B(g, [-0.13, 0.13, -0.15, 0.15, 0.03, 0.19], 'black', 0.03, 0.04); },
    motor(g) { put(g, lathe([[0, -2.9], [0.2, -2.9], [0.225, -2.87], [0.225, -2.42], [0.19, -2.4], [0, -2.4]], null, 40), 'navy', [0, 0, 0.225]); for (let i = 0; i < 5; i++) Tb(g, 'y', -2.84 + i * 0.085, -2.80 + i * 0.085, 0.238, 0.03, [0, 0.225], 'black'); B(g, [-0.25, 0.25, -2.4, -2.3, 0, 0.45], 'alu', 0.03, 0.07); B(g, [-0.09, 0.09, -2.75, -2.55, 0.42, 0.5], 'black', 0.02, 0.02); },
    brake(g) { Cy(g, 'y', -2.3, -2.18, 0.2, [0, 0.225], 'brass', 0.02); Tb(g, 'y', -2.27, -2.21, 0.212, 0.03, [0, 0.225], 'black'); },
    enc(g) { Cy(g, 'y', -3.12, -2.9, 0.17, [0, 0.23], 'blue', 0.03); Tb(g, 'y', -3.0, -2.96, 0.176, 0.02, [0, 0.23], 'ring'); Cy(g, 'y', -3.16, -3.12, 0.06, [0, 0.23], 'black'); },
    table(g) { B(g, [-1.8, 1.8, -1.4, 1.4, 0.2, 0.38], 'alu', 0.035, 0.12); face(g, 3.5, 2.7, 'table', [0, 0, 0.3806]); [[-1.65, -1.25], [1.65, -1.25], [-1.65, 1.25], [1.65, 1.25]].forEach(([x, y]) => Cy(g, 'z', 0.15, 0.2, 0.12, [x, y], 'black')); },
    panel(g) { B(g, [-1.6, 1.6, -1.2, 1.2, 0.38, 0.41], 'navy', 0.012, 0.06); face(g, 3.16, 2.36, 'pcb', [0, 0, 0.4112]); },
    valve(g) { B(g, [1.85, 2.25, 0.8, 1.2, 0.2, 0.33], 'navy', 0.03, 0.05); Cy(g, 'z', 0.33, 0.44, 0.13, [2.05, 1.0], 'black'); Cy(g, 'z', 0.44, 0.46, 0.08, [2.05, 1.0], 'brass'); Cy(g, 'x', 1.78, 1.85, 0.045, [1.0, 0.265], 'brass'); },
    sens(g) { Cy(g, 'z', 0.2, 0.34, 0.11, [2.025, 0.425], 'blue'); Cy(g, 'z', 0.34, 0.38, 0.06, [2.025, 0.425], 'black'); Tb(g, 'z', 0.27, 0.29, 0.115, 0.02, [2.025, 0.425], 'ring'); },
    gantry(g) { [[-2.6, -2.3], [2.3, 2.6]].forEach(([a, b]) => { B(g, [a, b, -0.25, 0.25, 0, 1.8], 'navy', 0.06, 0.08); B(g, [a - 0.06, b + 0.06, -0.31, 0.31, 0, 0.1], 'alu', 0.03, 0.08); }); B(g, [-2.6, 2.6, -0.25, 0.25, 1.8, 2.1], 'navy', 0.08, 0.1);
      [1.88, 2.02].forEach(z => B(g, [-2.2, 2.2, -0.29, -0.25, z - 0.025, z + 0.025], 'steel', 0.012, 0.01)); B(g, [-2.45, 2.45, -0.015, 0.015, 2.1, 2.112], 'ring', 0.005, 0.005); },
    cam(g) { B(g, [-0.95, -0.35, -0.5, -0.25, 1.38, 2.0], 'blue', 0.045, 0.05); for (let i = 0; i < 5; i++) B(g, [-0.965, -0.335, -0.515, -0.235, 1.5 + i * 0.09, 1.535 + i * 0.09], 'black', 0.014, 0.05); Cy(g, 'z', 1.2, 1.38, 0.115, [-0.65, -0.375], 'black'); Tb(g, 'z', 1.26, 1.32, 0.122, 0.02, [-0.65, -0.375], 'knurl'); Cy(g, 'z', 2.0, 2.06, 0.05, [-0.5, -0.375], 'steel'); Tb(g, 'z', 1.93, 1.95, 0.02, 0.02, [-0.86, -0.51], 'ring'); },
    lens(g) { put(g, lathe([[0, 0.82], [0.06, 0.82], [0.085, 0.84], [0.1, 0.9], [0.1, 1.17], [0.085, 1.2], [0, 1.2]], 'z', 40), 'black', [-0.65, -0.38, 0]); Tb(g, 'z', 0.98, 1.08, 0.106, 0.02, [-0.65, -0.38], 'knurl'); Tb(g, 'z', 0.83, 0.86, 0.09, 0.02, [-0.65, -0.38], 'brass'); const s = keep(new THREE.SphereGeometry(0.062, 24, 12)); s.scale(1, 1, 0.35); put(g, s, 'glass', [-0.65, -0.38, 0.822]); },
    strobe(g) { B(g, [-1.05, -0.25, -0.62, -0.47, 0.735, 0.82], 'black', 0.025, 0.03); B(g, [-1.02, -0.28, -0.6, -0.49, 0.72, 0.74], 'lamp', 0.008, 0.02); },
    laser(g) { B(g, [0.4, 1.0, -0.5, -0.25, 1.46, 2.0], 'alu', 0.045, 0.05); B(g, [0.47, 0.93, -0.512, -0.5, 1.56, 1.9], 'pane', 0.004, 0.04); Cy(g, 'z', 1.24, 1.46, 0.12, [0.7, -0.375], 'black'); Tb(g, 'z', 1.2, 1.25, 0.125, 0.03, [0.7, -0.375], 'brass'); Tb(g, 'z', 1.33, 1.39, 0.127, 0.02, [0.7, -0.375], 'knurl'); const s = keep(new THREE.SphereGeometry(0.085, 24, 12)); s.scale(1, 1, 0.3); put(g, s, 'glass', [0.7, -0.375, 1.215]); Tb(g, 'z', 1.92, 1.94, 0.02, 0.02, [0.93, -0.51], 'ring'); },
    lsrc(g) { B(g, [0.4, 1.25, -0.2, 0.2, 2.12, 2.45], 'navy', 0.05, 0.06); for (let i = 0; i < 6; i++) B(g, [0.5 + i * 0.12, 0.54 + i * 0.12, -0.21, 0.21, 2.2, 2.465], 'black', 0.012, 0.02); Cy(g, 'x', 1.25, 1.31, 0.06, [0, 2.28], 'steel'); Tb(g, 'x', 0.38, 0.4, 0.05, 0.03, [0, 2.3], 'ring'); },
    reg(g) { Cy(g, 'z', 1.36, 1.6, 0.09, [1.15, -0.39], 'blue'); Cy(g, 'z', 1.3, 1.36, 0.07, [1.15, -0.39], 'black'); Tb(g, 'z', 1.44, 1.46, 0.094, 0.02, [1.15, -0.39], 'ring'); const s = keep(new THREE.SphereGeometry(0.05, 20, 10)); s.scale(1, 1, 0.3); put(g, s, 'glass', [1.15, -0.39, 1.305]); },
    cab(g) { B(g, [3.4, 3.46, -1.5, 1.5, 0, 2.6], 'shell', 0.02, 0.06); B(g, [3.4, 4.6, -1.5, 1.5, 2.5, 2.6], 'shell', 0.03, 0.08); B(g, [3.4, 4.6, -1.5, 1.5, 0, 0.12], 'shell', 0.03, 0.08); [-1.5, 1.42].forEach(y => B(g, [3.4, 4.6, y, y + 0.08, 0, 2.6], 'shell', 0.03, 0.06));
      B(g, [4.575, 4.6, -1.42, 1.42, 0.12, 2.5], 'pane', 0.008, 0.05); B(g, [4.6, 4.64, -1.3, -1.18, 1.15, 1.45], 'steel', 0.015, 0.02); [[2.0, 2.08], [1.06, 1.14]].forEach(([a, b]) => B(g, [3.46, 3.5, -1.38, 1.38, a, b], 'steel', 0.012, 0.01));
      [[-1.36, 0.14, 0.5], [0.3, 1.3, 0.5]].forEach(([a, b, z]) => B(g, [3.46, 3.6, a, b, z - 0.12, z + 0.12], 'black', 0.03, 0.04)); B(g, [3.6, 4.5, -1.3, 1.3, 0.12, 0.2], 'char', 0.02, 0.05); },
    psu(g) { B(g, [3.5, 3.9, -1.3, -0.6, 1.7, 2.4], 'vent', 0.035, 0.05); Cy(g, 'x', 3.48, 3.5, 0.03, [-1.15, 2.28], 'lamp'); B(g, [3.47, 3.5, -1.2, -0.7, 1.74, 1.84], 'black', 0.01, 0.02); },
    ctrl(g) { B(g, [3.5, 3.9, -0.4, 0.4, 1.7, 2.4], 'blue', 0.035, 0.05); [-0.25, -0.15, -0.05].forEach(y => Cy(g, 'x', 3.48, 3.5, 0.025, [y, 2.3], 'lamp')); [[-0.3, -0.05], [0.05, 0.3]].forEach(([a, b]) => B(g, [3.47, 3.5, a, b, 1.78, 1.96], 'black', 0.01, 0.03)); },
    io(g) { B(g, [3.5, 3.9, 0.6, 1.3, 1.7, 2.4], 'navy', 0.035, 0.05); for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) Cy(g, 'x', 3.485, 3.5, 0.018, [0.7 + i * 0.1, 2.3 - j * 0.09], j ? 'ring' : 'lamp'); B(g, [3.47, 3.5, 0.66, 1.24, 1.76, 2.0], 'black', 0.01, 0.02); },
    relay(g) { for (let i = 0; i < 5; i++) { const y = -1.18 + i * 0.2; B(g, [3.5, 3.9, y, y + 0.16, 0.9, 1.06], 'navy', 0.02, 0.03); B(g, [3.52, 3.88, y + 0.01, y + 0.15, 1.06, 1.3], 'tint', 0.025, 0.03); B(g, [3.6, 3.8, y + 0.04, y + 0.12, 1.07, 1.22], 'brass', 0.02, 0.02); } },
    fuse(g) { for (let i = 0; i < 5; i++) { const y = 0.22 + i * 0.2; B(g, [3.5, 3.9, y, y + 0.16, 0.9, 1.3], 'char', 0.025, 0.03); Cy(g, 'x', 3.46, 3.5, 0.045, [y + 0.08, 1.16], 'steel'); B(g, [3.49, 3.5, y + 0.05, y + 0.11, 0.96, 1.0], 'lamp', 0.004, 0.01); } },
    door(g) { B(g, [-3.3, 3.3, -2.5, -2.45, 0, 2.8], 'pane', 0.01, 0.1); B(g, [-3.3, 3.3, 2.45, 2.5, 0, 2.8], 'pane', 0.01, 0.1); B(g, [-3.3, -3.25, -2.5, 2.5, 0, 2.8], 'pane', 0.01, 0.1);
      [[-3.3, -2.5], [3.26, -2.5], [-3.3, 2.46], [3.26, 2.46]].forEach(([x, y]) => B(g, [x, x + 0.07, y, y + 0.07, 0, 2.8], 'alu', 0.015, 0.015)); [[-3.3, 3.33, -2.5, -2.43], [-3.3, 3.33, 2.46, 2.53], [-3.3, -3.23, -2.5, 2.53]].forEach(q => B(g, [q[0], q[1], q[2], q[3], 2.74, 2.81], 'alu', 0.015, 0.015)); },
    ilock(g) { B(g, [2.7, 2.95, -2.62, -2.5, 1.0, 1.25], 'navy', 0.025, 0.03); Cy(g, 'y', -2.66, -2.62, 0.035, [2.82, 1.12], 'steel'); Tb(g, 'y', -2.625, -2.615, 0.05, 0.02, [2.82, 1.2], 'ring'); },
    estop(g) { B(g, [3.0, 3.25, -2.56, -2.5, 1.4, 1.65], 'cream', 0.02, 0.04); Cy(g, 'y', -2.6, -2.56, 0.06, [3.125, 1.525], 'steel'); put(g, lathe([[0, -2.66], [0.07, -2.66], [0.1, -2.64], [0.1, -2.61], [0.06, -2.6], [0, -2.6]], null, 32), 'brown', [3.125, 0, 1.525]); }
  };
  const innerMat = ip => /עדשה|חלון/.test(ip.t) ? 'glass' : /סליל|ליפופי/.test(ip.t) ? 'brass' : /LED|נורי/.test(ip.t) ? 'lamp' : /כרטיס|מעבד/.test(ip.t) ? 'pcb' : /מיסבים|ציר|בורג|בוכנה|קפיץ|סרגל/.test(ip.t) ? 'steel' : /משטח/.test(ip.t) ? 'alu' : byKey[ip.c] || 'navy';

  /* ---------- inner parts as what they are: a library of small models, chosen by the part's name and built inside its box ----------
     Each model works in a local frame laid into the box (x along one axis of the box, z along another), so the same relay or
     capacitor fits whichever way its box lies. Sizes below are fractions of the box. */
  const dims = b => [b[1] - b[0], b[3] - b[2], b[5] - b[4]], mid3 = b => [(b[0] + b[1]) / 2, (b[2] + b[3]) / 2, (b[4] + b[5]) / 2], E3 = i => new THREE.Vector3(i === 0 ? 1 : 0, i === 1 ? 1 : 0, i === 2 ? 1 : 0);
  const frame = (g, b, ax, az) => { const d = dims(b), c = mid3(b), Xv = E3(ax), Zv = E3(az), Yv = new THREE.Vector3().crossVectors(Zv, Xv), q = new THREE.Group(); q.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(Xv, Yv, Zv)); q.position.set(c[0], c[1], c[2]); g.add(q); return [q, d[ax], d[3 - ax - az], d[az]]; };
  const fThin = (g, b) => { const d = dims(b), az = d.indexOf(Math.min(...d)), o = [0, 1, 2].filter(i => i !== az); return frame(g, b, d[o[0]] >= d[o[1]] ? o[0] : o[1], az); };       /* z = the thin side, x = the long one */
  const fLong = (g, b) => { const d = dims(b), ax = d[0] > d[2] * 1.05 && d[0] >= d[1] ? 0 : d[1] > d[2] * 1.05 && d[1] > d[0] ? 1 : 2; return frame(g, b, ax, ax === 2 ? 1 : 2); };            /* x = the long side */
  const fUp = (g, b) => { const d = dims(b); return frame(g, b, d[0] >= d[1] ? 0 : 1, 2); };                                                                                              /* z = up */
  const sph = (q, r, sc, pos, m) => { const ge = keep(new THREE.SphereGeometry(r, 24, 14)); ge.scale(sc[0], sc[1], sc[2]); return put(q, ge, m, pos); };
  const helix = (q, R, z0, z1, turns, r, m) => { const c = new THREE.Curve(); c.getPoint = (t, v) => (v || new THREE.Vector3()).set(R * Math.cos(t * turns * 2 * Math.PI), R * Math.sin(t * turns * 2 * Math.PI), z0 + (z1 - z0) * t); return put(q, keep(new THREE.TubeGeometry(c, Math.round(turns * 14), r, 6)), m); };
  const around = (q, n, fn) => { for (let k = 0; k < n; k++) { const a = k / n * 2 * Math.PI; fn(Math.cos(a), Math.sin(a), k, a); } };
  const fet = (q, cx, L, W, H) => { B(q, [cx - L * 0.42, cx + L * 0.42, -W * 0.3, W * 0.12, -H * 0.18, H * 0.22], 'black'); B(q, [cx - L * 0.42, cx + L * 0.42, W * 0.12, W * 0.3, -H * 0.18, H / 2], 'steel', Math.min(L, W) * 0.04); Cy(q, 'y', W * 0.1, W * 0.32, L * 0.12, [cx, H * 0.36], 'black', 0.002); [-1, 0, 1].forEach(k => B(q, [cx + k * L * 0.26 - L * 0.05, cx + k * L * 0.26 + L * 0.05, -W * 0.08, W * 0.02, -H / 2, -H * 0.18], 'steel', L * 0.02)); };
  const resAt = (q, y, L, R) => { Cy(q, 'x', -L / 2, L / 2, R * 0.16, [y, 0], 'steel'); Cy(q, 'x', -L * 0.28, L * 0.28, R, [y, 0], 'cream', R * 0.4); [['brown', -0.18], ['navy', -0.06], ['blue', 0.06]].forEach(([m, o]) => Tb(q, 'x', L * o - L * 0.025, L * o + L * 0.025, R * 1.04, R * 0.1, [y, 0], m)); };
  const capAt = (q, x, y, R, H) => { Cy(q, 'z', -H / 2, H / 2 - H * 0.04, R, [x, y], 'navy', R * 0.12); Cy(q, 'z', H / 2 - H * 0.04, H / 2, R * 0.9, [x, y], 'steel', 0.002); B(q, [x - R * 0.28, x + R * 0.28, y - R * 1.03, y - R * 0.9, -H * 0.4, H * 0.38], 'cream', R * 0.03); };
  const relayIn = (q, x0, x1, W, H) => { const cx = (x0 + x1) / 2, w = x1 - x0, R = Math.min(w, W) * 0.24; B(q, [x0, x1, -W / 2, W / 2, -H / 2, -H * 0.36], 'black'); Cy(q, 'z', -H * 0.36, H * 0.2, R, [cx - w * 0.14, 0], 'copper', 0.003); Cy(q, 'z', -H * 0.36, H * 0.24, R * 0.35, [cx - w * 0.14, 0], 'steel'); B(q, [cx - w * 0.36, cx + w * 0.34, -W * 0.2, W * 0.2, H * 0.24, H * 0.3], 'steel', H * 0.02); B(q, [cx + w * 0.22, cx + w * 0.3, -W * 0.16, W * 0.16, -H * 0.36, H * 0.24], 'brass', w * 0.03); B(q, [x0 + w * 0.02, x1 - w * 0.02, -W * 0.48, W * 0.48, -H * 0.36, H / 2], 'tint', Math.min(w, W) * 0.08); };
  const IL = {
    ledBar(g, b) { const [q, L, W, H] = fLong(g, b), n = Math.max(4, Math.round(L / 0.16)); B(q, [-L / 2, L / 2, -W / 2, W / 2, -H * 0.25, H / 2], 'black'); for (let i = 0; i < n; i++) sph(q, Math.min(W, H) * 0.3, [1, 1, 0.8], [-L / 2 + (i + 0.5) * L / n, 0, -H * 0.25], 'lamp'); },
    leds(g, b) { const [q, L, W, H] = fThin(g, b); B(q, [-L / 2, L / 2, -W / 2, W / 2, -H / 2, -H * 0.2], 'navy'); ['lamp', 'ring', 'lamp'].forEach((m, i) => sph(q, Math.min(W, L / 3) * 0.3, [1, 1, 1], [(i - 1) * L * 0.3, 0, -H * 0.2], m)); },
    sensor(g, b) { const [q, L, W, H] = fThin(g, b); B(q, [-L / 2, L / 2, -W / 2, W / 2, -H / 2, -H * 0.15], 'navy'); B(q, [-L * 0.44, L * 0.44, -W * 0.3, W * 0.3, -H * 0.15, H * 0.35], 'black'); B(q, [-L * 0.4, L * 0.4, -W * 0.1, W * 0.1, H * 0.33, H / 2], 'glass', H * 0.03); for (let i = 0; i < 10; i++) B(q, [-L * 0.42 + i * L * 0.093 - L * 0.012, -L * 0.42 + i * L * 0.093 + L * 0.012, -W * 0.48, -W * 0.34, -H * 0.15, -H * 0.05], 'brass', 0.004); },
    lensBarrel(g, b) { const [q, L, W, H] = fLong(g, b), R = Math.min(W, H) / 2; Cy(q, 'x', -L / 2, L / 2, R * 0.92, [0, 0], 'black', R * 0.12); Tb(q, 'x', -L * 0.12, L * 0.12, R, R * 0.1, [0, 0], 'knurl'); Tb(q, 'x', L / 2 - L * 0.1, L / 2 - L * 0.04, R * 0.97, R * 0.1, [0, 0], 'brass'); sph(q, R * 0.72, [0.35, 1, 1], [L / 2, 0, 0], 'glass'); sph(q, R * 0.6, [0.35, 1, 1], [-L / 2, 0, 0], 'glass'); },
    lensEl(g, b) { const [q, L, W, H] = fThin(g, b), R = Math.min(L, W) / 2; Tb(q, 'z', -H / 2, H / 2, R, R * 0.14, [0, 0], 'black'); sph(q, R * 0.87, [1, 1, Math.max(0.12, H * 0.6 / (R * 0.87))], [0, 0, 0], 'glass'); },
    lensMount(g, b) { const [q, L, W, H] = fThin(g, b), R = Math.min(L, W) / 2; Tb(q, 'z', -H / 2, H / 2, R, R * 0.3, [0, 0], 'black'); Tb(q, 'z', H * 0.1, H / 2 + H * 0.05, R * 0.74, R * 0.06, [0, 0], 'brass'); around(q, 3, (c, s2) => Cy(q, 'z', -H / 2, H / 2 + H * 0.25, R * 0.07, [R * 0.85 * c, R * 0.85 * s2], 'brass')); },
    cable(g, b) { const [q, L, W, H] = fLong(g, b), R = Math.min(W, H) * 0.32; Cy(q, 'x', -L / 2, L / 2, R, [0, 0], 'navy', R * 0.2); Cy(q, 'x', -L / 2, -L / 2 + L * 0.16, R * 1.5, [0, 0], 'steel'); Cy(q, 'x', L / 2 - L * 0.16, L / 2, R * 1.5, [0, 0], 'steel'); },
    coil(g, b) { const d = dims(b), mn = Math.min(...d), md = d.slice().sort((x, y) => x - y)[1], az = mn < 0.5 * md ? d.indexOf(mn) : 2, o = [0, 1, 2].filter(i => i !== az), [q, L, W, H] = frame(g, b, d[o[0]] >= d[o[1]] ? o[0] : o[1], az), R = Math.min(L, W) / 2, fl = H * 0.1;
      if (H < R * 0.7) { Tb(q, 'z', -H / 2, H / 2, R, R * 0.1, [0, 0], 'steel'); Tb(q, 'z', -H * 0.42, H * 0.42, R * 0.88, R * 0.42, [0, 0], 'copper'); Tb(q, 'z', -H / 2, H / 2, R * 0.42, R * 0.14, [0, 0], 'steel'); return; }   /* a flat ring coil, as in a brake */
      Cy(q, 'z', -H / 2, -H / 2 + fl, R, [0, 0], 'cream', fl * 0.3); Cy(q, 'z', H / 2 - fl, H / 2, R, [0, 0], 'cream', fl * 0.3); Cy(q, 'z', -H / 2 + fl, H / 2 - fl, R * 0.86, [0, 0], 'copper', 0.003); Tb(q, 'z', -H / 2 - H * 0.02, H / 2 + H * 0.02, R * 0.34, R * 0.12, [0, 0], 'steel'); },
    stator(g, b) { const [q, L, W, H] = fThin(g, b), R = Math.min(L, W) / 2; Tb(q, 'z', -H / 2, H / 2, R, R * 0.2, [0, 0], 'lam'); around(q, 6, (c, s2, k, a) => { const u = new THREE.Group(); u.position.set(R * 0.6 * c, R * 0.6 * s2, 0); u.rotation.z = a; q.add(u); B(u, [-R * 0.16, R * 0.16, -R * 0.2, R * 0.2, -H * 0.46, H * 0.46], 'copper', R * 0.07); B(u, [R * 0.12, R * 0.22, -R * 0.1, R * 0.1, -H * 0.4, H * 0.4], 'lam', R * 0.02); }); },
    plunger(g, b) { const [q, L, W, H] = fLong(g, b), R = Math.min(W, H) / 2, u = new THREE.Group(); Cy(q, 'x', -L / 2, L / 2, R * 0.5, [0, 0], 'steel'); Cy(q, 'x', -L / 2, -L / 2 + L * 0.14, R * 0.95, [0, 0], 'brass'); u.rotation.y = Math.PI / 2; q.add(u); helix(u, R * 0.8, 0, L * 0.46, 7, R * 0.11, 'steel'); },
    valveBody(g, b) { const [q, L, W, H] = fThin(g, b); B(q, [-L * 0.4, L * 0.4, -W / 2, W / 2, -H / 2, H / 2], 'navy'); Cy(q, 'x', -L / 2, -L * 0.4, H * 0.3, [0, 0], 'brass'); Cy(q, 'x', L * 0.4, L / 2, H * 0.3, [0, 0], 'brass'); Tb(q, 'z', H / 2 - H * 0.1, H / 2 + H * 0.05, Math.min(L, W) * 0.24, Math.min(L, W) * 0.06, [0, 0], 'steel'); },
    solenoidValve(g, b) { const [q, L, W, H] = fUp(g, b), R = Math.min(L, W) * 0.36; B(q, [-L / 2, L / 2, -W / 2, W / 2, -H / 2, -H * 0.1], 'navy'); Cy(q, 'z', -H * 0.1, H / 2 - H * 0.07, R, [0, 0], 'copper', 0.003); Cy(q, 'z', H / 2 - H * 0.07, H / 2, R * 1.1, [0, 0], 'cream'); Cy(q, 'x', -L / 2 - L * 0.1, -L / 2, H * 0.09, [0, -H * 0.3], 'brass'); },
    relay(g, b) { const [q, L, W, H] = fUp(g, b); relayIn(q, -L / 2, L / 2, W, H); },
    relays(g, b) { const [q, L, W, H] = fUp(g, b); relayIn(q, -L / 2, -L * 0.03, W, H); relayIn(q, L * 0.03, L / 2, W, H); },
    contacts(g, b) { const [q, L, W, H] = fThin(g, b); B(q, [-L / 2, -L * 0.3, -W / 2, W / 2, -H / 2, H / 2], 'cream'); [-1, 1].forEach(k => { B(q, [-L * 0.34, L / 2, k * W * 0.24 - W * 0.04, k * W * 0.24 + W * 0.04, -H * 0.36, H * 0.36], 'brass', W * 0.02); sph(q, W * 0.1, [1, 1, 1], [L * 0.42, k * W * 0.13, 0], 'steel'); }); },
    diode(g, b) { const [q, L, W, H] = fLong(g, b), R = Math.min(W, H) * 0.4; Cy(q, 'x', -L / 2, L / 2, R * 0.14, [0, 0], 'steel'); Cy(q, 'x', -L * 0.28, L * 0.28, R, [0, 0], 'black', R * 0.15); Tb(q, 'x', L * 0.14, L * 0.22, R * 1.03, R * 0.1, [0, 0], 'cream'); },
    bridge(g, b) { const [q, L, W, H] = fThin(g, b); B(q, [-L * 0.42, L * 0.42, -W * 0.42, W * 0.42, -H * 0.2, H / 2], 'black'); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([i, j]) => Cy(q, 'z', -H / 2, -H * 0.2, Math.min(L, W) * 0.05, [i * L * 0.28, j * W * 0.28], 'steel')); Cy(q, 'z', H / 2, H / 2 + 0.004, Math.min(L, W) * 0.08, [0, 0], 'steel', 0.001); },
    mosfet(g, b) { const [q, L, W, H] = fUp(g, b); fet(q, 0, L, W, H); },
    fets4(g, b) { const [q, L, W, H] = fUp(g, b); for (let k = 0; k < 4; k++) fet(q, -L / 2 + (k + 0.5) * L / 4, L / 4 * 0.9, W, H); },
    resistor(g, b) { const [q, L, W, H] = fLong(g, b); resAt(q, 0, L, Math.min(W, H) * 0.42); },
    resistors(g, b) { const [q, L, W, H] = fLong(g, b), R = Math.min(W / 2, H) * 0.4; resAt(q, -W / 4, L, R); resAt(q, W / 4, L, R); },
    cap(g, b) { const [q, L, W, H] = fUp(g, b); capAt(q, 0, 0, Math.min(L, W) / 2, H); },
    caps(g, b) { const [q, L, W, H] = fUp(g, b), n = Math.max(2, Math.round(L / W)), R = Math.min(W, L / n) * 0.46; for (let k = 0; k < n; k++) capAt(q, -L / 2 + (k + 0.5) * L / n, 0, R, H); },
    rotor(g, b) { const [q, L, W, H] = fLong(g, b), R = Math.min(W, H) / 2; Cy(q, 'x', -L / 2, L / 2, R * 0.74, [0, 0], 'steel'); Cy(q, 'x', -L / 2 - L * 0.08, L / 2 + L * 0.08, R * 0.2, [0, 0], 'steel'); for (let k = 0; k < 8; k++) { const u = new THREE.Group(); u.rotation.x = k * Math.PI / 4; q.add(u); B(u, [-L * 0.45, L * 0.45, -R * 0.27, R * 0.27, R * 0.72, R * 0.98], k % 2 ? 'blue' : 'brown', R * 0.06); } },
    shaft(g, b) { const [q, L, W, H] = fLong(g, b), R = Math.min(W, H) / 2; Cy(q, 'x', -L / 2, L / 2, R, [0, 0], 'steel', R * 0.2); [-0.36, 0.36].forEach(o => { Tb(q, 'x', L * o - L * 0.035, L * o + L * 0.035, R * 2.6, R * 0.7, [0, 0], 'steel'); Tb(q, 'x', L * o - L * 0.028, L * o + L * 0.028, R * 1.9, R * 0.9, [0, 0], 'black'); }); },
    bearing(g, b) { const [q, L, W, H] = fThin(g, b), R = Math.min(L, W) / 2; Tb(q, 'z', -H / 2, H / 2, R, R * 0.28, [0, 0], 'steel'); Tb(q, 'z', -H * 0.4, H * 0.4, R * 0.72, R * 0.22, [0, 0], 'black'); Tb(q, 'z', -H / 2, H / 2, R * 0.5, R * 0.2, [0, 0], 'brass'); },
    transformer(g, b) { const [q, L, W, H] = fUp(g, b); B(q, [-L / 2, L / 2, -W * 0.2, W * 0.2, -H / 2, H / 2], 'lam', Math.min(L, H) * 0.05); B(q, [-L * 0.3, L * 0.3, -W / 2, W / 2, -H * 0.3, H * 0.3], 'copper', Math.min(L, W) * 0.12); [-1, 1].forEach(k => B(q, [-L * 0.34, L * 0.34, -W / 2, W / 2, k * H * 0.33 - H * 0.03, k * H * 0.33 + H * 0.03], 'cream', H * 0.02)); },
    fuse(g, b) { const [q, L, W, H] = fLong(g, b), R = Math.min(W, H) / 2; Cy(q, 'x', -L * 0.3, L * 0.3, R * 0.82, [0, 0], 'glass'); Cy(q, 'x', -L / 2, -L * 0.28, R, [0, 0], 'steel'); Cy(q, 'x', L * 0.28, L / 2, R, [0, 0], 'steel'); Cy(q, 'x', -L * 0.3, L * 0.3, R * 0.08, [0, 0], 'steel'); },
    terminals(g, b) { const [q, L, W, H] = fThin(g, b), n = Math.max(2, Math.min(6, Math.round(L / 0.18))); B(q, [-L / 2, L / 2, -W / 2, W / 2, -H / 2, H * 0.2], 'char'); for (let k = 0; k < n; k++) { const x = -L / 2 + (k + 0.5) * L / n; Cy(q, 'z', H * 0.1, H / 2, Math.min(L / n, W) * 0.3, [x, 0], 'brass'); if (k) B(q, [x - L / n / 2 - L * 0.008, x - L / n / 2 + L * 0.008, -W * 0.46, W * 0.46, H * 0.2, H * 0.42], 'char', 0.004); } },
    ports(g, b) { const [q, L, W, H] = fThin(g, b), n = Math.max(1, Math.min(4, Math.round(L / 0.3))); for (let k = 0; k < n; k++) { const x = -L / 2 + (k + 0.5) * L / n, w = L / n; B(q, [x - w * 0.44, x + w * 0.44, -W / 2, W / 2, -H / 2, H / 2], 'steel'); B(q, [x - w * 0.3, x + w * 0.3, -W * 0.3, W * 0.3, H / 2 - H * 0.25, H / 2 + 0.004], 'black', 0.006); sph(q, Math.min(w, W) * 0.07, [1, 1, 0.6], [x - w * 0.34, W * 0.4, H / 2], 'lamp'); sph(q, Math.min(w, W) * 0.07, [1, 1, 0.6], [x + w * 0.34, W * 0.4, H / 2], 'ring'); } },
    carriage(g, b) { const [q, L, W, H] = fThin(g, b); B(q, [-L / 2, L / 2, -W * 0.14, W * 0.14, -H / 2, -H * 0.05], 'steel', H * 0.06); B(q, [-L * 0.28, L * 0.28, -W / 2, W / 2, -H * 0.2, H / 2], 'navy'); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([i, j]) => Cy(q, 'z', H / 2 - H * 0.05, H / 2 + H * 0.05, W * 0.06, [i * L * 0.18, j * W * 0.32], 'steel')); [-1, 1].forEach(k => B(q, [k > 0 ? L * 0.28 : -L * 0.32, k > 0 ? L * 0.32 : -L * 0.28, -W * 0.4, W * 0.4, -H * 0.2, H * 0.4], 'blue', L * 0.01)); },
    ballscrew(g, b) { const [q, L, W, H] = fLong(g, b), R = Math.min(W, H) / 2; Cy(q, 'x', -L * 0.44, L * 0.44, R, [0, 0], 'thread', R * 0.1); Cy(q, 'x', -L / 2, -L * 0.44, R * 0.6, [0, 0], 'steel'); Cy(q, 'x', L * 0.44, L / 2, R * 0.6, [0, 0], 'steel'); },
    ballnut(g, b) { const [q, L, W, H] = frame(g, b, 0, 2), R = Math.min(W, H) / 2; Cy(q, 'x', -L / 2, -L / 2 + L * 0.28, R, [0, 0], 'steel'); Cy(q, 'x', -L / 2 + L * 0.28, L / 2, R * 0.72, [0, 0], 'navy'); Cy(q, 'x', -L / 2 - 0.005, L / 2 + 0.005, R * 0.3, [0, 0], 'black', 0.002); around(q, 4, (c, s2) => Cy(q, 'x', -L / 2 - 0.012, -L / 2 + L * 0.05, R * 0.08, [R * 0.84 * c, R * 0.84 * s2], 'black', 0.002)); },
    scale(g, b) { const [q, L, W, H] = fThin(g, b); B(q, [-L / 2, L / 2, -W / 2, W / 2, -H / 2, H / 2], 'steel', Math.min(W, H) * 0.2); face(q, L * 0.98, W * 0.8, 'grat', [0, 0, H / 2 + 0.004]); },
    motorBody(g, b) { const [q, L, W, H] = fLong(g, b), R = Math.min(W, H) / 2; Cy(q, 'x', -L * 0.4, L * 0.34, R * 0.9, [0, 0], 'navy', R * 0.1); for (let k = 0; k < 4; k++) Tb(q, 'x', -L * 0.3 + k * L * 0.13, -L * 0.25 + k * L * 0.13, R * 0.95, R * 0.07, [0, 0], 'black'); B(q, [L * 0.34, L * 0.42, -R, R, -R, R], 'alu', R * 0.03, R * 0.25); Cy(q, 'x', L * 0.42, L / 2, R * 0.22, [0, 0], 'steel'); Cy(q, 'x', -L / 2, -L * 0.4, R * 0.7, [0, 0], 'blue'); Tb(q, 'x', -L * 0.47, -L * 0.44, R * 0.72, R * 0.05, [0, 0], 'ring'); },
    shutter(g, b) { const [q, L, W, H] = fThin(g, b); put(q, rbox(L, W, H * 0.5, H * 0.1, [[-L * 0.15, 0, Math.min(W, L) * 0.26]], Math.min(L, W) * 0.1), 'black', [0, 0, -H * 0.25]); B(q, [-L * 0.1, L * 0.3, -W * 0.42, W * 0.42, 0, H * 0.2], 'steel', H * 0.05); Cy(q, 'z', -H / 2, H / 2, W * 0.3, [L * 0.38, 0], 'copper', 0.003); },
    camSmall(g, b) { const [q, L, W, H] = fUp(g, b), R = Math.min(L * 0.7, W) * 0.34; B(q, [-L / 2, L * 0.2, -W / 2, W / 2, -H * 0.1, H / 2], 'blue'); Cy(q, 'z', -H / 2, -H * 0.1, R, [-L * 0.15, 0], 'black'); sph(q, R * 0.7, [1, 1, 0.35], [-L * 0.15, 0, -H / 2], 'glass'); Tb(q, 'z', -H * 0.16, -H * 0.12, R * 1.05, R * 0.1, [-L * 0.15, 0], 'ring'); Cy(q, 'z', -H / 2, H * 0.3, L * 0.11, [L * 0.37, 0], 'steel'); },
    switchUnit(g, b) { const [q, L, W, H] = fUp(g, b), R = Math.min(L, W); B(q, [-L / 2, L / 2, -W / 2, W / 2, -H / 2, H * 0.2], 'navy'); Cy(q, 'z', H * 0.2, H / 2, R * 0.22, [0, 0], 'steel'); Tb(q, 'z', H * 0.2, H * 0.27, R * 0.3, R * 0.05, [0, 0], 'ring'); },
    pswitch(g, b) { const [q, L, W, H] = fUp(g, b), R = Math.min(L, W) / 2; Cy(q, 'z', -H * 0.2, H / 2, R * 0.9, [0, 0], 'blue'); Cy(q, 'z', -H / 2, -H * 0.2, R * 0.4, [0, 0], 'brass'); Tb(q, 'z', H * 0.2, H * 0.27, R * 0.93, R * 0.06, [0, 0], 'ring'); },
    estop(g, b) { const [q, L, W, H] = fUp(g, b), R = Math.min(L, W) / 2; B(q, [-L / 2, L / 2, -W / 2, W / 2, -H / 2, -H * 0.15], 'cream'); Cy(q, 'z', -H * 0.15, H * 0.1, R * 0.5, [0, 0], 'steel'); put(q, lathe([[0, H * 0.1], [R * 0.85, H * 0.1], [R * 0.95, H * 0.2], [R * 0.9, H * 0.36], [R * 0.5, H / 2], [0, H / 2]], 'z', 32), 'brown'); },
    doorPane(g, b) { const [q, L, W, H] = fThin(g, b), t = Math.min(L, W) * 0.035; B(q, [-L / 2, L / 2, -W / 2, W / 2, -H * 0.3, H * 0.3], 'pane', H * 0.1); [[-L / 2, L / 2, W / 2 - t, W / 2], [-L / 2, L / 2, -W / 2, -W / 2 + t], [-L / 2, -L / 2 + t, -W / 2, W / 2], [L / 2 - t, L / 2, -W / 2, W / 2]].forEach(r => B(q, [r[0], r[1], r[2], r[3], -H / 2, H / 2], 'alu', H * 0.2, t * 0.3)); B(q, [L * 0.36, L * 0.4, -W * 0.14, W * 0.14, H / 2, H / 2 + H * 1.4], 'steel', H * 0.3); },
    plate(g, b) { const [q, L, W, H] = fThin(g, b); B(q, [-L / 2, L / 2, -W / 2, W / 2, -H / 2, H / 2], 'alu', H * 0.25, Math.min(L, W) * 0.05); face(q, L * 0.97, W * 0.97, 'table', [0, 0, H / 2 + 0.004]); },
    manifold(g, b) { const [q, L, W, H] = fThin(g, b); B(q, [-L / 2, L / 2, -W / 2, W / 2, -H / 2, H * 0.2], 'navy', H * 0.12, Math.min(L, W) * 0.05); for (let k = 0; k < 3; k++) { const x = -L / 2 + (k + 0.5) * L / 3; B(q, [x - L * 0.145, x + L * 0.145, -W * 0.42, W * 0.42, H * 0.2, H / 2], 'tint', H * 0.08, L * 0.03); Cy(q, 'y', W / 2, W / 2 + W * 0.05, H * 0.28, [x, -H * 0.1], 'brass'); } },
    venturi(g, b) { const [q, L, W, H] = fLong(g, b), R = Math.min(W, H) / 2; put(q, lathe([[0, -L / 2], [R, -L / 2], [R, -L * 0.3], [R * 0.45, -L * 0.06], [R * 0.45, L * 0.06], [R, L * 0.3], [R, L / 2], [0, L / 2]], 'x', 32), 'brass'); Cy(q, 'z', -R * 1.5, 0, R * 0.32, [0, 0], 'brass'); },
    disc(g, b) { const [q, L, W, H] = fThin(g, b), R = Math.min(L, W) / 2; Tb(q, 'z', -H * 0.3, H * 0.3, R, R * 0.42, [0, 0], 'brown'); Tb(q, 'z', -H / 2, H / 2, R * 0.5, R * 0.25, [0, 0], 'steel'); around(q, 6, (c, s2) => Cy(q, 'z', -H / 2, H / 2, R * 0.07, [R * 0.78 * c, R * 0.78 * s2], 'steel')); },
    pcb(g, b, fets) { const [q, L, W, H] = fThin(g, b), t = Math.min(H * 0.3, 0.05), zb = -H / 2 + t, hc = H - t; B(q, [-L / 2, L / 2, -W / 2, W / 2, -H / 2, zb], 'navy', t * 0.3, Math.min(L, W) * 0.04); face(q, L * 0.96, W * 0.96, 'pcb', [0, 0, zb + 0.003]);
      if (fets) [-0.2, 0.08].forEach(o => { const u = new THREE.Group(); u.position.set(0, 0, zb + hc / 2); q.add(u); fet(u, L * o, L * 0.2, Math.min(W * 0.5, hc * 2), hc); }); else B(q, [-L * 0.2, L * 0.2, -W * 0.22, W * 0.22, zb, zb + Math.min(hc * 0.5, 0.09)], 'black', 0.01);
      [-1, 1].forEach(k => Cy(q, 'z', zb, zb + hc * 0.8, Math.min(L, W) * 0.07, [L * 0.36, k * W * 0.26], 'blue')); B(q, [-L * 0.47, -L * 0.34, -W * 0.3, W * 0.3, zb, zb + hc * 0.6], 'cream', 0.01); sph(q, Math.min(L, W) * 0.035, [1, 1, 1], [L * 0.12, W * 0.38, zb], 'lamp'); }
  };
  const IRULES = [[/LED/, 'ledBar'], [/נוריות/, 'leds'], [/חיישן line/, 'sensor'], [/גוף העדשה/, 'lensMount'], [/עדשת מיקוד|^עדשה$/, 'lensBarrel'], [/עדשה/, 'lensEl'], [/כבל/, 'cable'], [/כרטיס/, 'pcbFets'], [/ליפופי/, 'stator'], [/שסתום סולנואיד/, 'solenoidValve'], [/סליל/, 'coil'], [/בוכנה/, 'plunger'], [/גוף השסתום/, 'valveBody'],
    [/ממסרי/, 'relays'], [/ממסר/, 'relay'], [/מגעים/, 'contacts'], [/גשר דיודות/, 'bridge'], [/דיוד/, 'diode'], [/ארבעת טרנזיסטורי/, 'fets4'], [/MOSFET/, 'mosfet'], [/נגדי/, 'resistors'], [/נגד/, 'resistor'], [/קבלי/, 'caps'], [/קבל/, 'cap'], [/רוטור/, 'rotor'], [/מיסבים וציר/, 'shaft'], [/מיסבים/, 'bearing'], [/שנאי/, 'transformer'], [/פיוז/, 'fuse'],
    [/פורטי|כניסת האנקודר/, 'ports'], [/הדקי|מחברים|יציאה למנוע/, 'terminals'], [/קרון/, 'carriage'], [/בורג כדורי/, 'ballscrew'], [/אום/, 'ballnut'], [/סרגל/, 'scale'], [/מנוע/, 'motorBody'], [/תריס/, 'shutter'], [/מצלמת/, 'camSmall'], [/מיתוג|בקר ה|מחולל|מעבד|גשר H/, 'pcb'], [/מתג לחץ/, 'pswitch'], [/מתג/, 'switchUnit'], [/לחצן/, 'estop'], [/דלת/, 'doorPane'], [/משטח/, 'plate'], [/סעפת/, 'manifold'], [/ונטורי/, 'venturi'], [/דיסק/, 'disc']];
  const innerKind = t => { const r = IRULES.find(q => q[0].test(t)); return r ? r[1] : null; };
  /* one inner part: the model its name calls for, or a plain rounded body in the right material */
  const innerPart = (g, ip, S) => { const kind = innerKind(ip.t); if (kind) { const bb = ip.b.map(v => v * S); if (kind === 'pcbFets') IL.pcb(g, bb, true); else IL[kind](g, bb); return; } const b = ip.b.map(v => v * S), m = innerMat(ip), round = ROUND.test(ip.t) ? longAxis(ip.b) : null, d = [b[1] - b[0], b[3] - b[2], b[5] - b[4]], c = [(b[0] + b[1]) / 2, (b[2] + b[3]) / 2, (b[4] + b[5]) / 2];
      if (round) { const ai = 'xyz'.indexOf(round), o = [0, 1, 2].filter(k => k !== ai), r = Math.min(d[o[0]], d[o[1]]) / 2, geo = can(r, -d[ai] / 2, d[ai] / 2, Math.min(r, d[ai]) * 0.14, round === 'y' ? null : round, 40), sc = [1, 1, 1]; sc[o[0]] = d[o[0]] / (2 * r); sc[o[1]] = d[o[1]] / (2 * r); const mesh = put(g, geo, m, c); mesh.scale.set(sc[0], sc[1], sc[2]);
        if (m === 'brass') for (let k = 0; k < 6; k++) { const t = put(g, tube(r * 1.03, -d[ai] / 2 + (k + 0.5) * d[ai] / 6 - d[ai] / 30, -d[ai] / 2 + (k + 0.5) * d[ai] / 6 + d[ai] / 30, r * 0.06, round === 'y' ? null : round), 'brown', c); t.scale.set(sc[0], sc[1], sc[2]); } }
      else { B(g, b, m === 'pcb' ? 'navy' : m); if (m === 'pcb') { const flat = d.indexOf(Math.min(...d)); if (flat === 2) { face(g, d[0] * 0.94, d[1] * 0.94, 'pcb', [c[0], c[1], b[5] + 0.004]); B(g, [c[0] - d[0] * 0.18, c[0] + d[0] * 0.18, c[1] - d[1] * 0.2, c[1] + d[1] * 0.2, b[5], b[5] + 0.07], 'black', 0.015, 0.02); } else { const f = face(g, flat === 1 ? d[0] * 0.94 : d[1] * 0.94, d[2] * 0.94, 'pcb', flat === 1 ? [c[0], b[2] - 0.004, c[2]] : [b[0] - 0.004, c[1], c[2]]); if (flat === 1) f.rotation.x = Math.PI / 2; else f.rotation.y = -Math.PI / 2; } } }
  };
  const X = new THREE.Vector3(1, 0, 0), tmp = new THREE.Vector3(), toWorld = v => tmp.set(v[0], v[1], v[2]).applyAxisAngle(X, -Math.PI / 2).clone();
  /* aim the 3D camera exactly like view3 projects: same yaw, pitch, distance, focal length and vertical offset */
  const aim = (V, c, oy, cv) => { const s = V.st, cy = Math.cos(s.yaw), sy = Math.sin(s.yaw), cp = Math.cos(s.pitch), sp = Math.sin(s.pitch), f = [sy * cp, cy * cp, -sp], u = [sy * sp, cy * sp, cp];
    cam.position.copy(toWorld([c[0] - s.dist * f[0], c[1] - s.dist * f[1], c[2] - s.dist * f[2]])); cam.up.copy(toWorld(u)); cam.lookAt(toWorld(c));
    cam.fov = 2 * Math.atan(cv.height / 2 / s.fov) * 180 / Math.PI; cam.aspect = cv.width / cv.height; cam.setViewOffset(cv.width, cv.height, 0, -oy, cv.width, cv.height); cam.updateProjectionMatrix(); };
  const core = { K, C, keep, rbox, can, tube, lathe, paint, renderer, gl, scene, cam, root, key, floor, mat, byKey, put, B, Cy, Tb, face, PB, innerPart, innerKind, toWorld, aim, soft, owner: null,
    project(p, cv) { cam.updateMatrixWorld(); const v = toWorld(p).project(cam); return [(v.x + 1) / 2 * cv.width, (1 - v.y) / 2 * cv.height]; },
    /* put the 3D canvas under a view's own canvas; whoever had it before lets go first. Returns a mark for release. */
    attach(cv, cls) { if (core.owner) core.owner.destroy(); gl.className = cls; cv.parentNode.insertBefore(gl, cv); cv.classList.add('mtop'); return K.trash.length; },
    fit(cv) { const w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return false; renderer.setSize(w, h, false); gl.style.width = w + 'px'; gl.style.height = h + 'px'; gl.style.left = cv.offsetLeft + 'px'; gl.style.top = cv.offsetTop + 'px'; return true; },
    release(mark, cv) { K.trash.splice(mark).forEach(o => o.dispose && o.dispose()); if (gl.parentNode) gl.parentNode.removeChild(gl); cv.classList.remove('mtop'); } };
  FH3D_REAL = core; return core;
}
function fh3dMachine(THREE, cv, V) {
  const core = fh3dCore(THREE); if (!core) return null;
  const { K, C, keep, paint, renderer, gl, scene, cam, root, key, floor, B, PB, byKey } = core, mark = core.attach(cv, 'mgl');
  const groups = [];   /* { g, id, m, p, dx } */
  const world = new THREE.Group(); root.add(world);
  const clear = () => { groups.length = 0; while (world.children.length) world.remove(world.children[0]); };
  const buildMachine = () => { mCopies().forEach(({ p, dx, m }) => { const g = new THREE.Group(); (PB[p.id] || (gg => p.boxes.forEach(b => B(gg, b, byKey[b[6]] || 'navy'))))(g, p); world.add(g); groups.push({ g, id: p.id, m, p, dx }); });
    if (MS.machine === 'line') { const g = new THREE.Group(); B(g, [-0.7, 0.7, -0.6, 0.6, 0, 1.0], 'cream', 0.05, 0.1); B(g, [-0.74, 0.74, -0.64, 0.64, 1.0, 1.1], 'navy', 0.03, 0.1); B(g, [-0.5, 0.5, 0.3, 0.4, 1.1, 1.5], 'navy', 0.03, 0.05); B(g, [-0.46, 0.46, 0.285, 0.3, 1.14, 1.46], 'lamp', 0.005, 0.03); B(g, [-0.2, 0.2, -0.2, 0.1, 1.1, 1.13], 'pcb', 0.01, 0.03); world.add(g); groups.push({ g, id: 'verify', m: 'verify', p: { ex: [0, 0, 0], id: 'verify' }, dx: 0 });
      const way = new THREE.Group(); for (let x = -2.7; x < 3.3; x += 0.5) B(way, [x, x + 0.28, -0.05, 0.05, -0.5, -0.485], 'lamp', 0.005, 0.02); world.add(way); groups.push({ g: way, id: 'way', m: 'way', p: { ex: [0, 0, 0], id: 'way' }, dx: 0 }); } };
  const buildInner = node => { const S = 1.25; INNER[node].forEach((ip, i) => { const g = new THREE.Group(); core.innerPart(g, ip, S); world.add(g); groups.push({ g, id: 'in:' + i, m: 'inner', p: { ex: ip.ex.map(v => v * S), id: 'in:' + i }, dx: 0, inner: i }); }); };

  /* ---------- the machine at work: one cycle per press, never by itself ----------
     AOI: the camera sweeps along the gantry over a coupon while the table steps between swaths; AOS: the head registers on two
     fiducials, then goes to each excess-copper defect of the same coupon and removes it. Shown slowed down. The swath comes
     from scanCalc; which defects are repaired comes from AOISCAN.removal. Stage travel is what this model's axes can reach. */
  const RUNC = (() => { const sc = scanCalc(1200, 0.5, 5), U = 3.2 / 600, sw = sc.swath * U, x0 = -1.3, x1 = 1.3, y0 = -0.96, n = 3, slow = 8;
    const yc = [0, 1, 2].map(i => y0 + sw * (i + 0.5)), map = d => [x0 + d.x / AOISCAN.coupon.w * (x1 - x0), y0 + d.y / AOISCAN.coupon.h * (n * sw)];
    return { sc, U, sw, x0, x1, y0, n, slow, yc, camY: -0.38, camHome: -0.65, lasY: -0.375, lasHome: 0.7, regX: 1.15, regY: -0.39, passT: (x1 - x0) / U / 1200 * slow,
      defects: sc.found.map(d => ({ id: d.id, cls: d.cls, name: d.name, p: map(d), ok: d.ok })), targets: sc.found.filter(d => d.ok && AOISCAN.removal.has(d.cls)).map(d => ({ id: d.id, cls: d.cls, p: map(d) })), fid: [[-1.45, -1.1], [1.45, -1.1]] }; })();
  const RUN = { on: false, kind: null, t0: 0, tau: 0, status: '', cam: 0, table: 0, cam2: 0, table2: 0, pan: [0, 0, 0], verd: 0, stage: 'scan', dxA: 0, dxB: 0, hide: {}, lit: false, beam: false, flash: false, prog: [0, 0, 0], dir: [1, -1, 1], fixed: 0, firing: -1, burn: 0, off: {}, fault: null, blind: false, halted: false, lost: new Set(), tg: [] };
  const fx = new THREE.Group(); fx.visible = false; root.add(fx);
  const glow = paint(128, 128, (g, w) => { const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, 'rgba(214,232,247,1)'); r.addColorStop(0.3, 'rgba(214,232,247,.7)'); r.addColorStop(0.65, 'rgba(48,120,176,.28)'); r.addColorStop(1, 'rgba(48,120,176,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const addM = (o) => keep(new THREE.MeshBasicMaterial(Object.assign({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }, o)));
  const fxMesh = (geo, m) => { const o = new THREE.Mesh(geo, m); o.userData.fx = true; fx.add(o); return o; }, sprite = (sx, sy) => { const o = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: glow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }))); o.scale.set(sx, sy, 1); fx.add(o); return o; };
  const scanLine = fxMesh(keep(new THREE.BoxGeometry(0.035, 1, 0.006)), addM({ color: C.light, opacity: 0.95 })), wash = sprite(1.5, 1.5), cone = fxMesh(keep(new THREE.CylinderGeometry(0.09, 0.32, 0.31, 20, 1, true)), addM({ color: C.light, opacity: 0.16, side: THREE.DoubleSide })); cone.rotation.x = Math.PI / 2;
  const beamCore = fxMesh(keep(new THREE.CylinderGeometry(0.012, 0.012, 0.79, 10)), addM({ color: C.light, opacity: 1 })), beamGlow = fxMesh(keep(new THREE.CylinderGeometry(0.05, 0.05, 0.79, 12)), addM({ color: C.blue, opacity: 0.4 })), spark = sprite(0.5, 0.5), regGlow = sprite(0.45, 0.45); beamCore.rotation.x = beamGlow.rotation.x = Math.PI / 2;
  /* what has been scanned, found and fixed is painted on the panel itself, so it travels with it */
  const ovc = document.createElement('canvas'); ovc.width = 632; ovc.height = 472; const og = ovc.getContext('2d'), ovt = keep(new THREE.CanvasTexture(ovc)); ovt.colorSpace = THREE.SRGBColorSpace;
  const ovm = new THREE.Mesh(keep(new THREE.PlaneGeometry(3.16, 2.36)), keep(new THREE.MeshBasicMaterial({ map: ovt, transparent: true, depthWrite: false }))); ovm.position.set(0, 0, 0.4135); ovm.userData.fx = true; ovm.visible = false;
  const PX = x => (x + 1.58) * 200, PY = y => (1.18 - y) * 200;
  /* injected faults: which pass a point is in, the vacuum fault's blurred zone and its false calls (fractions along the pass) */
  const FZOOM = 5.6, BLX = 0.18, passOf = y => Math.min(RUNC.n - 1, Math.max(0, Math.floor((y - RUNC.y0) / RUNC.sw))), VACZ = [0.35, 0.75], VACQ = [0.42, 0.51, 0.6];
  /* the names of the suspects stand above the panel and always face the viewer, whichever way the machine is turned */
  const labTex = {}, labOf = t => labTex[t] || (labTex[t] = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d'); g.font = '700 34px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 7; g.strokeStyle = 'rgba(27,47,90,.9)'; g.strokeText(t, 128, 34); g.fillStyle = '#EEE9E0'; g.fillText(t, 128, 34); const x = keep(new THREE.CanvasTexture(c)); x.colorSpace = THREE.SRGBColorSpace; return x; })());
  const labs = AOISCAN.defects.map(() => { const sp = new THREE.Sprite(keep(new THREE.SpriteMaterial({ transparent: true, depthWrite: false }))); sp.scale.set(0.52, 0.13, 1); sp.visible = false; ovm.add(sp); return sp; });
  const setLab = (i, on, text, p) => { const sp = labs[i]; sp.visible = on; if (!on) return; sp.userData.t = text; const x = labOf(text); if (sp.material.map !== x) { sp.material.map = x; sp.material.needsUpdate = true; } sp.position.set(p[0], p[1] + 0.13, 0.12); };
  const paintOv = () => { og.clearRect(0, 0, 632, 472); const R = RUNC, h = R.sw * 200; og.lineWidth = 2; og.strokeStyle = 'rgba(214,232,247,.55)'; og.setLineDash([8, 6]); og.strokeRect(PX(R.x0), PY(R.y0 + R.n * R.sw), (R.x1 - R.x0) * 200, R.n * h); og.setLineDash([]);
    const rep = RUN.stage === 'repair', ver = RUN.stage === 'verify' || RUN.stage === 'carry2'; const seen = d => { if (RUN.stage !== 'scan') return true; const i = Math.min(R.n - 1, Math.max(0, Math.floor((d.p[1] - R.y0) / R.sw))), k = RUN.prog[i], f = (d.p[0] - R.x0) / (R.x1 - R.x0); return RUN.dir[i] > 0 ? k >= f : k >= 1 - f; };
    const F = RUN.fault, sh = d => F === 'backlash' && RUN.dir[passOf(d.p[1])] < 0 ? BLX : 0;
    if (RUN.stage === 'scan') R.yc.forEach((y, i) => { const k = RUN.prog[i]; if (k <= 0) return; const w = (R.x1 - R.x0) * 200 * k, xa = (RUN.dir[i] > 0 ? PX(R.x0) : PX(R.x1) - w) + (F === 'backlash' && RUN.dir[i] < 0 ? BLX * 200 : 0), ya = PY(y + R.sw / 2);
      og.fillStyle = F === 'strobe' && i > 0 ? 'rgba(40,36,33,.8)' : F ? 'rgba(214,232,247,.42)' : 'rgba(214,232,247,.26)'; og.fillRect(xa, ya, w, h);
      if (F === 'backlash' && RUN.dir[i] < 0) { og.strokeStyle = '#7B5A3C'; og.lineWidth = 4; og.setLineDash([10, 7]); og.strokeRect(xa - BLX * 200, ya, w, h); og.setLineDash([]); }
      if (F === 'trig' && i === 1) for (let gx = PX(R.x0) + 22; gx < PX(R.x1); gx += 44) if (gx > xa && gx < xa + w) { og.fillStyle = 'rgba(27,47,90,.95)'; og.fillRect(gx, ya, 12, h); }
      if (F === 'vac' && i === 1) { const xs = Math.max(xa, PX(R.x0 + (R.x1 - R.x0) * VACZ[0])), xe = Math.min(xa + w, PX(R.x0 + (R.x1 - R.x0) * VACZ[1])); if (xe > xs) { og.save(); og.beginPath(); og.rect(xs, ya, xe - xs, h); og.clip(); og.fillStyle = 'rgba(123,90,60,.45)'; og.fillRect(xs, ya, xe - xs, h); og.strokeStyle = 'rgba(123,90,60,.95)'; og.lineWidth = 6; for (let q = xs - h; q < xe; q += 16) { og.beginPath(); og.moveTo(q, ya + h); og.lineTo(q + h, ya); og.stroke(); } og.restore(); } } });
    if (F === 'vac') VACQ.forEach(f => { const x = R.x0 + (R.x1 - R.x0) * f, y = R.yc[1]; if (RUN.stage === 'scan' && RUN.prog[1] < 1 - f) return; og.strokeStyle = '#EEE9E0'; og.lineWidth = 4; og.setLineDash([6, 4]); og.beginPath(); og.arc(PX(x), PY(y), 16, 0, 7); og.stroke(); og.setLineDash([]); og.fillStyle = '#EEE9E0'; og.font = '800 24px system-ui'; og.textAlign = 'center'; og.fillText('?', PX(x), PY(y) + 8); });
    R.defects.forEach((d, di) => { setLab(di, false); if (!d.ok || !seen(d)) return; if (RUN.lost.has(d.id)) { og.strokeStyle = 'rgba(123,90,60,.9)'; og.lineWidth = 2; og.setLineDash([3, 4]); og.beginPath(); og.arc(PX(d.p[0]), PY(d.p[1]), 13, 0, 7); og.stroke(); og.setLineDash([]); return; }
      const t = RUN.tg.findIndex(q => q.id === d.id), x = PX(d.p[0] + sh(d)), y = PY(d.p[1]), fixed = rep && t >= 0 && t < RUN.fixed, burn = (rep && t === RUN.firing ? RUN.burn : fixed ? 1 : 0) * (F === 'defocus' ? 0.45 : 1), bad = F === 'defocus' && fixed;
      if (rep && t < 0) { og.strokeStyle = 'rgba(214,232,247,.35)'; og.lineWidth = 2; og.beginPath(); og.arc(x, y, 9, 0, 7); og.stroke(); return; }
      if (rep && burn < 1) { og.fillStyle = '#7B5A3C'; og.beginPath(); og.arc(x, y, 7 * (1 - burn), 0, 7); og.fill(); }
      if (bad) { og.strokeStyle = 'rgba(123,90,60,.9)'; og.lineWidth = 2; og.setLineDash([4, 3]); og.beginPath(); og.arc(x, y, 22, 0, 7); og.stroke(); og.setLineDash([]); }
      og.strokeStyle = fixed && !bad ? '#D6E8F7' : '#EEE9E0'; og.lineWidth = 3; og.beginPath(); og.arc(x, y, 13, 0, 7); og.stroke(); setLab(di, true, d.id + (bad ? ' ✗' : fixed ? ' ✓' : ver && di < RUN.verd ? (t >= 0 ? ' · AOS' : ' · הנדסה') : ''), [d.p[0] + sh(d), d.p[1]]); });
    if (rep) R.fid.forEach(([fxx, fyy]) => { og.strokeStyle = '#D6E8F7'; og.lineWidth = 2; og.beginPath(); og.arc(PX(fxx), PY(fyy), 8, 0, 7); og.moveTo(PX(fxx) - 13, PY(fyy)); og.lineTo(PX(fxx) + 13, PY(fyy)); og.moveTo(PX(fxx), PY(fyy) - 13); og.lineTo(PX(fxx), PY(fyy) + 13); og.stroke(); });
    ovt.needsUpdate = true; };
  const LT = t => `<bdi dir="ltr">${t}</bdi>`;
  const ez = k => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, mix = (a, b, k) => a + (b - a) * k;
  /* the cycle as a list of steps: [seconds, what the step does at progress k, the line shown while it runs] */
  /* the scan and the repair as lists of steps, shared by the single machines and by the line */
  let halt = false;   /* set while building a timeline whose fault stops the machine */
  const scanSteps = (S, passT, name) => { const R = RUNC, off = y => R.camY - y, F = RUN.fault;
    S.push([0.9, k => { RUN.stage = 'scan'; RUN.cam = mix(R.camHome, R.x0, ez(k)); RUN.table = mix(0, off(R.yc[0]), ez(k)); }, name + 'הראש והשולחן נוסעים לתחילת האזור']);
    for (let i = 0; i < R.n; i++) { const y = R.yc[i], a = RUN.dir[i] > 0 ? R.x0 : R.x1, b = RUN.dir[i] > 0 ? R.x1 : R.x0, sym = F && FSYM[F] ? FSYM[F](i) : '';
      const text = `${name}סריקה: מעבר ${i + 1} מתוך ${R.n} · קצב שורות ${LT(f1(R.sc.f) + ' kHz')} · רוחב מעבר ${LT(f1(R.sc.swath, 1) + ' mm')}` + (name ? '' : ` · מוצג בהילוך איטי פי ${R.slow}`);
      if (F === 'door' && i === 1) { S.push([passT / 2, k => { RUN.cam = mix(a, b, k / 2); RUN.table = off(y); RUN.prog[i] = k / 2; RUN.lit = true; }, text]);
        S.push([3.2, () => { RUN.cam = mix(a, b, 0.5); RUN.prog[i] = 0.5; RUN.lit = false; RUN.halted = true; }, `${name}⚠ הצירים נעצרו באמצע מעבר והתאורה כבתה. הדרייבר לא דיווח על שגיאה משלו`]); halt = true; return; }
      S.push([passT, k => { RUN.cam = mix(a, b, k); RUN.table = off(y); RUN.prog[i] = k; RUN.lit = k < 1; }, (sym ? `${name}⚠ ${sym} · מעבר ${i + 1} מתוך ${R.n}` : text)]);
      if (i < R.n - 1) S.push([name ? 0.4 : 0.55, k => { RUN.table = mix(off(y), off(R.yc[i + 1]), ez(k)); }, name + 'השולחן מתקדם ברוחב מעבר אחד']); } };
  const repairSteps = (S, name, tm) => { const R = RUNC; let cx = R.lasHome, ty = 0; const go = (x, y, text, d) => { const ax = cx, ay = ty; S.push([d || tm, k => { RUN.stage = 'repair'; RUN.cam2 = mix(ax, x, ez(k)); RUN.table2 = mix(ay, y, ez(k)); }, text]); cx = x; ty = y; };
    for (let i = 0; i < R.fid.length; i++) { const f = R.fid[i]; go(f[0] - (R.regX - R.lasHome), R.regY - f[1], `${name}רישום: מצלמת הרישום נוסעת לסימן ${i + 1} מתוך 2`);
      if (RUN.fault === 'fid' && i === 1) { S.push([tm * 2.4, k => { RUN.flash = k < 1 && Math.floor(k * 6) % 2 === 0; }, `${name}רישום: מחפשים את סימן 2, ושוב, ושוב`]); S.push([3.2, () => { RUN.flash = false; RUN.halted = true; }, `${name}⚠ סימן 2 לא נמצא אחרי שלושה ניסיונות. המכונה עצרה בלי לירות`]); halt = true; return () => { }; }
      S.push([tm / 2, k => { RUN.flash = k < 1; }, `${name}רישום: סימן ${i + 1} נמדד, והמכונה מתאימה את מערכת הצירים שלה לפאנל`]); }
    RUN.tg.forEach((t, j) => { go(t.p[0], R.lasY - t.p[1], `${name}הראש נוסע אל ${LT(t.id)}: נחושת עודפת שאומתה`); S.push([tm * 1.1, k => { RUN.beam = k < 1; RUN.firing = k < 1 ? j : -1; RUN.burn = k; if (k >= 1) RUN.fixed = Math.max(RUN.fixed, j + 1); }, RUN.fault === 'defocus' && j > 0 ? `${name}⚠ ${FSYM.defocus()} · פגם ${j + 1} מתוך ${RUN.tg.length}` : `${name}הסרה בלייזר ב-${LT(t.id)} · רדיוס כתם ${LT(f1(LZ.w0, 0) + ' µm')} · פגם ${j + 1} מתוך ${RUN.tg.length}`]); });
    return (text, d) => go(R.lasHome, 0, text, d); };
  /* the cycle as a list of steps: [seconds, what the step does at progress k, the line shown while it runs] */
  const timeline = kind => { const R = RUNC, S = [], off = y => R.camY - y, nFalse = RUN.fault === 'vac' ? VACQ.length : 0, nOk = R.defects.filter(d => d.ok && !RUN.lost.has(d.id)).length, nAll = nOk + nFalse, nFix = RUN.tg.length; halt = false;
    if (kind === 'aoi') { scanSteps(S, R.passT, ''); if (halt) return S;
      S.push([2.4, () => { }, `הסריקה הסתיימה: ${nAll} חשדות סומנו, והם עוברים לאימות`]);
      S.push([0.9, k => { RUN.cam = mix(R.x0, R.camHome, ez(k)); RUN.table = mix(off(R.yc[R.n - 1]), 0, ez(k)); }, 'חזרה לנקודת הבית']); }
    else if (kind === 'aos') { const home = repairSteps(S, '', 1.0); if (halt) return S; S.push([2.0, () => { }, RUN.fault === 'defocus' ? `⚠ הירי הסתיים, אבל בכל ${nFix} המטרות נשארה נחושת` : `התיקון הסתיים: ${nFix} פגמי נחושת עודפת הוסרו. חוסר נחושת לא מתוקן כאן`]); home('חזרה לנקודת הבית', 0.9); }
    else { /* the whole line: scan, carry to verification, verify, carry to repair, repair */
      /* the panel is carried overhead: straight up out of the open top, across above the cabinet and the glass, and straight down */
      const span = RUN.dxB - RUN.dxA, top = 2.75, seg = (k, a, b) => ez(Math.max(0, Math.min(1, (k - a) / (b - a)))), carry = (k, x0, x1, z0, z1) => [mix(x0, x1, seg(k, 0.22, 0.78)), 0, k < 0.5 ? mix(z0, top, seg(k, 0, 0.28)) : mix(top, z1, seg(k, 0.72, 1))];
      scanSteps(S, 1.5, `מכונת ${LT('AOI')} · `); if (halt) return S;
      S.push([0.7, k => { RUN.cam = mix(R.x0, R.camHome, ez(k)); RUN.table = mix(off(R.yc[R.n - 1]), 0, ez(k)); }, `מכונת ${LT('AOI')} · ${nAll} חשדות סומנו`]);
      S.push([2.8, k => { RUN.stage = 'carry'; RUN.pan = carry(k, 0, span / 2, 0, 0.85); }, 'הפאנל מורם ועובר מלמעלה לתחנת האימות']);
      S.push([3.2, k => { RUN.stage = 'verify'; RUN.verd = Math.min(nOk, Math.floor(k * (nOk + 0.5))); }, 'תחנת האימות · מפעיל בודק כל חשד בהגדלה ומחליט: פגם אמיתי או התראת שווא']);
      S.push([1.8, () => { RUN.verd = nOk; }, (nFalse ? `תחנת האימות · ${nFalse} התראות שווא נדחו · ` : `תחנת האימות · `) + `${nOk} פגמים אומתו: ${nFix} של נחושת עודפת עוברים ל-${LT('AOS')}, ${nOk - nFix} של חוסר נחושת עוברים להחלטת הנדסה`]);
      S.push([2.8, k => { RUN.stage = 'carry2'; RUN.pan = carry(k, span / 2, span, 0.85, 0); }, `הפאנל עובר מלמעלה למכונת ${LT('AOS')}`]);
      repairSteps(S, `מכונת ${LT('AOS')} · `, 0.7); if (halt) return S;
      S.push([3.0, () => { }, RUN.fault === 'defocus' ? `⚠ הקו סיים, אבל בכל ${nFix} המטרות שנורו נשארה נחושת` : `הקו סיים: ${nAll} חשדות · ${nOk} אומתו · ${nFix} הוסרו בלייזר · ${nOk - nFix} להחלטת הנדסה`]); }
    return S; };
  let steps = [], total = 0, hudEl = null;
  const hud = text => { if (!hudEl) { hudEl = document.createElement('div'); hudEl.className = 'mrunhud nogl'; hudEl.setAttribute('aria-live', 'polite'); cv.parentNode.appendChild(hudEl); } if (hudEl._t !== text) { hudEl._t = text; hudEl.innerHTML = text; } hudEl.hidden = !text; };
  const seek = t => { const R = RUNC, line = RUN.kind === 'line'; RUN.tau = t; RUN.prog = [0, 0, 0]; RUN.lit = RUN.beam = RUN.flash = false; RUN.fixed = 0; RUN.firing = -1; RUN.burn = 0; RUN.cam = R.camHome; RUN.cam2 = R.lasHome; RUN.table = RUN.table2 = 0; RUN.pan = [0, 0, 0]; RUN.verd = 0; RUN.halted = false; RUN.stage = RUN.kind === 'aos' ? 'repair' : 'scan'; let left = t, cur = null;
    for (const s of steps) { if (left < s[0]) { s[1](left / s[0]); cur = s; break; } s[1](1); left -= s[0]; } RUN.status = cur ? cur[2] : '';
    const d1 = RUN.cam - R.camHome, d2 = RUN.cam2 - R.lasHome, py = RUN.stage === 'repair' ? RUN.table2 : RUN.stage === 'scan' ? RUN.table : 0;
    RUN.off = line ? { 'aoi:cam': [d1, 0], 'aoi:lens': [d1, 0], 'aoi:strobe': [d1, 0], 'aoi:table': [0, RUN.table], 'aoi:panel': [RUN.pan[0], RUN.pan[1] + py, RUN.pan[2]], 'aos:laser': [d2, 0], 'aos:reg': [d2, 0], 'aos:table': [0, RUN.table2] }
      : RUN.kind === 'aoi' ? { cam: [d1, 0], lens: [d1, 0], strobe: [d1, 0], table: [0, RUN.table], panel: [0, RUN.table] } : { laser: [d2, 0], reg: [d2, 0], table: [0, RUN.table2], panel: [0, RUN.table2] };
    const xa = line ? RUN.dxA : 0, xb = line ? RUN.dxB : 0;
    scanLine.visible = wash.visible = cone.visible = RUN.stage === 'scan' && RUN.lit; beamCore.visible = beamGlow.visible = spark.visible = RUN.beam; regGlow.visible = RUN.flash;
    scanLine.scale.y = R.sw; scanLine.position.set(xa + RUN.cam, R.camY, 0.418); wash.position.set(xa + RUN.cam, R.camY, 0.45); cone.position.set(xa + RUN.cam, R.camY, 0.565);
    beamCore.position.set(xb + RUN.cam2, R.lasY, 0.805); beamGlow.position.copy(beamCore.position); spark.position.set(xb + RUN.cam2, R.lasY, 0.44); const pulse = 0.4 + 0.25 * Math.sin(t * 40); spark.scale.set(pulse, pulse, 1); regGlow.position.set(xb + RUN.cam2 + (R.regX - R.lasHome), R.regY, 1.28);
    if (line) MS.Ct = [RUN.dxA + RUN.pan[0], 0, 1.0];   /* the view follows the panel along the line */
    paintOv(); hud(RUN.status); if (hudEl) hudEl.classList.toggle('alarm', /⚠/.test(RUN.status)); return cur; };
  const runStop = () => { if (!RUN.on) return; if (RUN.kind === 'line' && MS.machine === 'line') { MS.Ct = [0.5, 0, 1.0]; MS.distT = 24; } if (RUN.close) { MS.Ct = [0.5, 0, 1.0]; MS.distT = 12; RUN.close = false; } RUN.on = false; RUN.off = {}; fx.visible = false; ovm.visible = false; hud(''); lastSig = ''; if (api.onRun) api.onRun(false); };
  const runStart = () => { if (RUN.on || MS.path.length) return false; RUN.kind = MS.machine; mFaultClose();
    const can = MFAULTS.filter(f => RUN.kind === 'line' || f.m === RUN.kind), want = MS.fault || ''; RUN.blind = want === 'rand'; RUN.fault = RUN.blind ? can[Math.floor(Math.random() * can.length)].id : can.some(f => f.id === want) ? want : null;
    RUN.lost = new Set(RUNC.defects.filter(d => d.ok && ((RUN.fault === 'trig' && passOf(d.p[1]) === 1 && (d.p[0] - RUNC.x0) / (RUNC.x1 - RUNC.x0) > 0.6 && (d.p[0] - RUNC.x0) / (RUNC.x1 - RUNC.x0) < 0.8) || (RUN.fault === 'strobe' && passOf(d.p[1]) > 0))).map(d => d.id)); RUN.tg = RUNC.targets.filter(t => !RUN.lost.has(t.id)); RUN.close = !!RUN.fault && RUN.kind !== 'line'; if (RUN.close) { MS.Ct = [0, -0.25, 0.45]; MS.distT = FZOOM; } const ra = groups.find(r => r.m === 'aoi'), rb = groups.find(r => r.m === 'aos'); RUN.dxA = ra ? ra.dx : 0; RUN.dxB = rb ? rb.dx : 0; RUN.hide = RUN.kind === 'line' ? { 'aos:panel': 1 } : {}; if (RUN.kind === 'line') MS.distT = 13; steps = timeline(RUN.kind); total = steps.reduce((a, s) => a + s[0], 0); RUN.on = true; RUN.t0 = performance.now(); const pr = groups.find(r => r.id === 'panel' && (RUN.kind !== 'line' || r.m === 'aoi')); if (pr) pr.g.add(ovm); ovm.visible = true; fx.visible = true; seek(0); lastSig = ''; if (api.onRun) api.onRun(true); return true; };
  /* ---------- per frame: place, light up, dim, aim the camera like the view does ---------- */
  let built = null, lastSig = '', dead = false, frames = 0; const hot = new THREE.Color(C.blue);
  const setLook = (rec, hl, dim, hide) => { rec.g.visible = !hide; if (hide) return; const k = (hl ? 1 : 0) + (dim ? 2 : 0); if (rec.look === k) return; rec.look = k;
    rec.g.traverse(o => { if (!o.isMesh || o.userData.fx) return; const m = o.material, tr = dim || o.userData.tr; if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; } m.opacity = dim ? o.userData.o * 0.12 : o.userData.o; m.depthWrite = !tr; o.castShadow = !tr;
      if (hl && !o.userData.e) { m.emissive.copy(hot); m.emissiveIntensity = 0.42; } else { m.emissive.setHex(o.userData.e); m.emissiveIntensity = o.userData.ei; } }); };
  const aim = () => core.aim(V, MS.C, 30, cv);
  const fit = () => { if (core.fit(cv)) lastSig = ''; };
  const ro = new ResizeObserver(fit); ro.observe(cv); fit();
  const api = {
    render() { if (dead) return; const inner = MS.path.length ? MS.path[MS.path.length - 1] : null, sigB = inner ? 'in:' + inner : 'm:' + MS.machine;
      if (sigB !== built) { clear(); if (inner) buildInner(inner); else buildMachine(); built = sigB; const far = MS.machine === 'line' && !inner; Object.assign(key.shadow.camera, far ? { left: -18, right: 18, top: 14, bottom: -14, near: 1, far: 70 } : { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 60 }); key.shadow.camera.updateProjectionMatrix(); floor.position.z = inner ? -1.4 : -0.5; lastSig = ''; }
      if (RUN.on) { if (MS.sel || inner || MS.machine !== RUN.kind || MS.target > 0.02 || MS.assembling) runStop(); else if (!RUN.manual) { const t = (performance.now() - RUN.t0) / 1000; if (t >= total) { const f = RUN.fault, bl = RUN.blind; runStop(); if (f) mFaultDiag(cv.parentNode, f, bl); } else seek(t); } }
      const s = V.st, sig = [RUN.on ? RUN.tau : '', built, s.yaw.toFixed(4), s.pitch.toFixed(4), s.dist.toFixed(3), MS.C.map(v => v.toFixed(3)).join(), MS.E.toFixed(4), MS.IE.toFixed(4), MS.hover, MS.sel, MS.isel].join('|'); if (sig === lastSig) return; lastSig = sig;
      const selNode = MS.sel && !inner ? (MPARTS.find(p => p.id === MS.sel) || {}).node : null;
      groups.forEach(rec => { if (inner) { const e = MS.IE; rec.g.position.set(e * rec.p.ex[0], e * rec.p.ex[1], e * rec.p.ex[2]); setLook(rec, MS.hover === rec.id, MS.isel != null && MS.isel !== rec.inner, false); return; }
        const e = MS.E, p = rec.p, key = rec.m + ':' + rec.id, ro = RUN.on && (RUN.off[key] || RUN.off[rec.id]); rec.g.position.set(rec.dx + e * p.ex[0] + (ro ? ro[0] : 0), e * p.ex[1] + (ro ? ro[1] : 0), e * p.ex[2] + (ro && ro[2] ? ro[2] : 0)); const dim = !!MS.sel && rec.id !== MS.sel && !(selNode && p.node === selNode);
        setLook(rec, rec.id === MS.hover || MS.hover === 'M:' + rec.m, dim, (rec.id === 'door' && MS.sel && MS.sel !== 'door') || !!(RUN.on && RUN.hide[key])); });
      aim(); renderer.render(scene, cam); frames++; },
    /* where the 3D camera puts a point of the machine, in the view canvas's own pixels: must agree with the view's projection */
    project(p) { aim(); return core.project(p, cv); },
    run(on) { if (on === false) { runStop(); return false; } RUN.manual = false; return runStart(); }, running: () => RUN.on,
    /* for checks: put the cycle at a given second and draw it */
    runSeek(t) { if (!RUN.on) return null; RUN.manual = true; const c = seek(Math.min(t, total - 1e-6)); lastSig = ''; api.render(); return { status: RUN.status, cam: RUN.cam, table: RUN.table, cam2: RUN.cam2, table2: RUN.table2, pan: RUN.pan.slice(), stage: RUN.stage, verd: RUN.verd, lit: RUN.lit, beam: RUN.beam, flash: RUN.flash, prog: RUN.prog.slice(), fixed: RUN.fixed, total, step: c ? steps.indexOf(c) : -1 }; },
    runLabels: () => labs.filter(q => q.visible).map(q => q.userData.t),
    runFault: () => ({ fault: RUN.fault, blind: RUN.blind, halted: RUN.halted, lost: [...RUN.lost], targets: RUN.tg.map(t => t.id), alarm: !!(hudEl && hudEl.classList.contains('alarm')) }),
    runDiag() { if (RUN.fault) mFaultDiag(cv.parentNode, RUN.fault, RUN.blind); },
    runPlan: () => ({ swath: RUNC.sw, U: RUNC.U, passT: RUNC.passT, yc: RUNC.yc.slice(), targets: RUNC.targets.map(t => t.id + ':' + t.cls), defects: RUNC.defects.length, total: timeline(MS.machine).reduce((a, q) => a + q[0], 0) }),
    innerKind: core.innerKind,
    /* for checks: build every inner part alone and compare what was built with the part's box (allowing thin shafts their bearings) */
    innerFit() { const bad = []; let n = 0; Object.entries(INNER).forEach(([k, list]) => list.forEach(ip => { const g = new THREE.Group(); core.innerPart(g, ip, 1); g.updateMatrixWorld(true); const bx = new THREE.Box3().setFromObject(g), b = ip.b, d = [b[1] - b[0], b[3] - b[2], b[5] - b[4]], m = 0.35 * Math.max(...d) + 0.02; n++;
        if (bx.min.x < b[0] - m || bx.max.x > b[1] + m || bx.min.y < b[2] - m || bx.max.y > b[3] + m || bx.min.z < b[4] - m || bx.max.z > b[5] + m || bx.isEmpty()) bad.push(k + ':' + ip.t); })); return { n, bad }; },
    info: () => ({ built, groups: groups.length, meshes: (() => { let n = 0; world.traverse(o => { if (o.isMesh) n++; }); return n; })(), frames, looks: groups.map(r => [r.id, r.look, r.g.visible]), pos: groups.map(r => [r.id, r.g.position.x - r.dx, r.g.position.y]) }),
    destroy() { if (dead) return; runStop(); if (hudEl && hudEl.parentNode) hudEl.parentNode.removeChild(hudEl); dead = true; ro.disconnect(); clear(); root.remove(world); root.remove(fx); if (core.owner === api) core.owner = null; core.release(mark, cv); }
  };
  core.owner = api; return api;
}
if (window.FH3D) window.FH3D.machine = fh3dMachine;
/* ---- the object in the middle of a topic page, on the same renderer ----
   The same choice as hubGeometry: the topic's inner parts spread out, its part of the machine, the inner part it is, or the whole machine small. */
function fh3dObject(THREE, cv, V, id) {
  const core = fh3dCore(THREE); if (!core) return null;
  const { renderer, cam, scene, root, key, floor, B, PB, byKey } = core, mark = core.attach(cv, 'mgl hubgl');
  const world = new THREE.Group(); root.add(world); let kind = '', parts = 0;
  const wrap = (k, c) => { const g = new THREE.Group(); g.scale.setScalar(k); g.position.set(-c[0] * k, -c[1] * k, -c[2] * k); world.add(g); parts++; return g; };
  const build = (g, p) => (PB[p.id] || (gg => p.boxes.forEach(b => B(gg, b, byKey[b[6]] || 'navy'))))(g, p), mid = b => [(b[0] + b[1]) / 2, (b[2] + b[3]) / 2, (b[4] + b[5]) / 2];
  const mp = MPARTS.find(p => p.node === id); let ip = null; if (!INNER[id] && !mp) for (const list of Object.values(INNER)) { ip = list.find(x => x.node === id); if (ip) break; }
  if (INNER[id]) { kind = 'inner'; INNER[id].forEach(q => { const g = new THREE.Group(); core.innerPart(g, q, 1); g.position.set(0.9 * q.ex[0], 0.9 * q.ex[1], 0.9 * q.ex[2]); world.add(g); parts++; }); }
  else if (mp) { kind = 'part'; const bx = mp.boxes, c = [0, 1, 2].map(a => bx.reduce((s, b) => s + mid(b)[a], 0) / bx.length), ext = Math.max(...bx.map(b => Math.max(b[1] - b[0], b[3] - b[2], b[5] - b[4]))); build(wrap(2.2 / ext, c), mp); }
  else if (ip) { kind = 'one'; const b = ip.b, ext = Math.max(b[1] - b[0], b[3] - b[2], b[5] - b[4]); core.innerPart(wrap(2.0 / ext, mid(b)), ip, 1); }
  else { kind = 'machine'; MPARTS.filter(p => p.id !== 'door').forEach(p => build(wrap(0.42, [0, 0, 0]), p)); }
  floor.position.z = -1.3; Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 60 }); key.shadow.camera.updateProjectionMatrix();
  let last = '', dead = false, frames = 0; const fit = () => { if (core.fit(cv)) last = ''; }, ro = new ResizeObserver(fit); ro.observe(cv); fit();
  const api = { kind, parts,
    render() { if (dead) return; const s = V.st, sig = [s.yaw.toFixed(4), s.pitch.toFixed(4), s.dist.toFixed(3)].join(); if (sig === last) return; last = sig; core.aim(V, [0, 0, 0], V.st.oy || 0, cv); renderer.render(scene, cam); frames++; },
    project(p) { core.aim(V, [0, 0, 0], V.st.oy || 0, cv); return core.project(p, cv); }, frames: () => frames,
    destroy() { if (dead) return; dead = true; ro.disconnect(); root.remove(world); if (core.owner === api) core.owner = null; core.release(mark, cv); } };
  core.owner = api; return api;
}
if (window.FH3D) window.FH3D.object = fh3dObject;
GO_BEFORE.push(() => { if (HS.gl) { HS.gl.destroy(); HS.gl = null; } });
/* leaving the page lets go of the 3D canvas */
GO_BEFORE.push(() => { if (MS.gl) { MS.gl.destroy(); MS.gl = null; } });

/* the button that runs one cycle; it exists only where the 3D picture does */
MBAR_TOOLS.push({ id: 'run', slot: 'end',
  html: () => `<button type="button" id="mRun" aria-pressed="false" hidden></button>`,
  wire: bar => { const b = bar.querySelector('#mRun'); if (!b) return; const label = on => { b.hidden = !MS.gl; b.setAttribute('aria-pressed', !!on); b.textContent = on ? '❚❚ עצור' : MS.machine === 'line' ? '▶ הפעל את הקו' : MS.machine === 'aos' ? '▶ הפעל תיקון' : '▶ הפעל סריקה'; };
    label(false); if (MS.gl) MS.gl.onRun = label; b.addEventListener('click', () => { if (!MS.gl) return; if (MS.gl.running()) MS.gl.run(false); else { MS.target = 0; MS.assembling = false; const e = document.getElementById('mE'); if (e) e.value = 0; if (MS.sel) mSelect(null); MS.E = Math.min(MS.E, 0.02); MS.gl.run(true); } }); } });
MHOOK.afterMachine.push(() => { const b = document.getElementById('mRun'); if (b && MS.gl) { MS.gl.run(false); b.hidden = false; b.textContent = MS.machine === 'line' ? '▶ הפעל את הקו' : MS.machine === 'aos' ? '▶ הפעל תיקון' : '▶ הפעל סריקה'; } });

/* ---------- a live fault: inject one into the cycle, watch the symptom, name the cause ----------
   Each fault changes only what the cycle shows (what is imaged, found, fired or stopped), in the way its physics says,
   and then asks for the cause. "Random" hides which one it is. Each answer leads to the topic that teaches it. */
const MFAULTS = [
  { id: 'vac', m: 'aoi', t: 'דליפת ואקום', node: 'vac', sym: 'באמצע המעבר השני התמונה מטושטשת, ובדיוק שם צצו חשדות שאין להם הסבר. תחנת האימות דחתה אותם.',
    cause: 'הוואקום לא מחזיק: הפאנל מתרומם במקום אחד ויוצא מעומק השדה',
    why: 'פאנל שלא נצמד לשולחן מתרומם במקום אחד. עומק השדה של העדשה הוא עשרות מיקרונים, ולכן רק האזור שהתרומם מטושטש. תמונה מטושטשת שונה מהתכנון, והמכונה מסמנת חשדות שווא. בודקים את לחץ הוואקום, את האטמים, ופאנל קטן שלא מכסה את כל החורים.' },
  { id: 'trig', m: 'aoi', t: 'פולסים חסרים מהאנקודר', node: 'trig', sym: 'במעבר השני יש פסים ריקים לרוחב התמונה, ופגם שהיה באחד מהם לא סומן.',
    cause: 'הטריגר מהאנקודר מאבד פולסים, ולכן חלק מהשורות לא צולמו',
    why: 'מצלמת line-scan מצלמת שורה בכל פולס מהאנקודר של הציר: לפי מיקום, לא לפי זמן. פולס שאבד הוא שורה שלא צולמה, ופגם שנפל עליה לא נמצא. בודקים את הכבל והמחבר של האנקודר, רעש על קו הטריגר, והגדרת המחלק.' },
  { id: 'strobe', m: 'aoi', t: 'התאורה נחלשה', node: 'cam', sym: 'מהמעבר השני והלאה התמונה כהה, והפגמים שם לא סומנו.',
    cause: 'הסטרוב נחלש או לא נדלק בכל טריגר, ולכן התמונה כהה',
    why: 'בכל שורה המצלמה אוספת אור רק בזמן ההבזק. הבזק חלש נותן תמונה כהה וניגודיות נמוכה, ופגם קטן לא עובר את סף ההחלטה. בודקים את המתח והזרם לנוריות, את הטמפרטורה שלהן, ואת התזמון בין הטריגר להבזק.' },
  { id: 'backlash', m: 'aoi', t: 'backlash בציר', node: 'trans', sym: 'המעבר השני, שנוסע בכיוון ההפוך, מוסט הצידה ביחס לראשון ולשלישי, וגם הסימונים שלו מוסטים.',
    cause: 'backlash בתמסורת: בהיפוך כיוון יש פער שהאנקודר שעל המנוע לא רואה',
    why: 'מעבר אחד נוסע קדימה והבא חוזר. בהיפוך כיוון הבורג מסתובב מעט לפני שהעומס זז, ואנקודר שעל המנוע סופר את הסיבוב הזה כתנועה. לכן רק המעברים ההפוכים מוסטים, ובאותו גודל. בודקים backlash עם שעון מדידה, ומפצים בבקר או מחליפים את המום.' },
  { id: 'door', m: 'aoi', t: 'interlock של דלת', node: 'interlock', sym: 'באמצע מעבר הצירים נעצרו והתאורה כבתה. הדרייבר לא דיווח על שגיאה משלו.',
    cause: 'מעגל ה-interlock נפתח (דלת או מתג), ושרשרת הבטיחות ניתקה את ההנעה',
    why: 'שרשרת הבטיחות לא עוברת דרך התוכנה: כשמגע הדלת נפתח, ממסר הבטיחות מנתק את ההנעה, והצירים עוצרים בכל מקום שהם. זו לא שגיאת דרייבר, ולכן הוא לא מדווח עליה. בודקים את המגעים בשרשרת לפי הסדר, ואת המחבר של מתג הדלת.' },
  { id: 'defocus', m: 'aos', t: 'הלייזר לא בפוקוס', node: 'laserunit', sym: 'הלייזר ירה על כל המטרות, אבל בכולן נשארה נחושת. הכתם שנראה במצלמה רחב מהרגיל.',
    cause: 'הלייזר לא בפוקוס: הכתם רחב, וה-fluence יורד מתחת לסף ההסרה',
    why: 'fluence הוא אנרגיה ליחידת שטח, ולכן הוא יורד כמו אחד חלקי ריבוע רדיוס הכתם: כתם רחב פי 2 נותן fluence קטן פי 4. מתחת לסף ההסרה הנחושת מתחממת ולא מוסרת. כתם רחב, ולא רק נחושת שנשארה, הוא מה שמבדיל זאת מהספק נמוך. בודקים את גובה הפאנל ואת כיול הפוקוס.' },
  { id: 'fid', m: 'aos', t: 'סימן רישום לא נמצא', node: 'reg', sym: 'מצלמת הרישום חיפשה את הסימן השני שוב ושוב, ואז המכונה עצרה בלי לירות.',
    cause: 'סימן הרישום (fiducial) מלוכלך או פגום, ולכן אי אפשר להתאים את מערכת הצירים',
    why: 'בלי שני סימנים אי אפשר לחשב את ההיסט ואת הסיבוב של הפאנל, ולכן המכונה לא יורה: ירי במקום לא ידוע עלול לחתוך מוליך תקין. בודקים את ניקיון הסימן, את התאורה של מצלמת הרישום, ואת חלון החיפוש.' }
];
/* what the HUD says while the fault shows (empty: this pass is not affected) */
const FSYM = { vac: i => i === 1 ? 'באמצע המעבר התמונה מטושטשת' : '', trig: i => i === 1 ? 'פסים ריקים בתמונה' : '', strobe: i => i > 0 ? 'התמונה כהה' : '',
  backlash: i => i % 2 === 1 ? 'המעבר מוסט הצידה ביחס לקודם' : '', defocus: () => 'הכתם במצלמה רחב מהרגיל' };
/* distractors for the AOS faults, which are fewer: wrong, but a reasonable first guess */
const MFAULT_ALT = { aos: ['מקור הלייזר נחלש, וההספק בכל פולס נמוך מדי', 'תחנת האימות שלחה רשימת מטרות שגויה'] };
const mFaultOpts = id => { const F = MFAULTS.find(f => f.id === id), same = MFAULTS.filter(f => f.m === F.m && f.id !== id).map(f => f.cause), pool = [...same, ...(MFAULT_ALT[F.m] || [])].slice(0, 3);
  return [F.cause, ...pool].map(t => [t, pathHash(id + t)]).sort((a, b) => a[1] - b[1]).map(x => x[0]); };
function mFaultClose() { const el = document.getElementById('mFaultQ'); if (el) el.remove(); }
function mFaultDiag(host, id, blind) {
  const F = MFAULTS.find(f => f.id === id); if (!F || !host) return; mFaultClose(); const opts = mFaultOpts(id), el = document.createElement('div');
  el.id = 'mFaultQ'; el.className = 'mfq nogl'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'אבחון תקלה');
  el.innerHTML = `<button type="button" class="mfqx" aria-label="סגור">✕</button><p><b>⚠ ${blind ? 'משהו לא תקין במחזור הזה.' : 'תקלה מוזרקת: ' + F.t + '.'}</b> ${F.sym}</p><p><b>מה הסיבה?</b></p><div class="tp">${opts.map((o, j) => `<button type="button" data-fo="${j}">${o}</button>`).join('')}</div><div class="mfqr" aria-live="polite"></div>`;
  host.appendChild(el); el.querySelector('.mfqx').addEventListener('click', mFaultClose);
  el.querySelectorAll('[data-fo]').forEach(b => b.addEventListener('click', () => { const ok = opts[+b.dataset.fo] === F.cause; el.querySelectorAll('[data-fo]').forEach(x => { x.disabled = true; if (opts[+x.dataset.fo] === F.cause) x.classList.add('right'); }); if (!ok) b.classList.add('wrong');
    try { reviewRecord('mf:' + id, ok); } catch (e) { }
    el.querySelector('.mfqr').innerHTML = `<p><b>${ok ? 'נכון.' : 'לא זה.'}</b> ${F.why}</p><p><button type="button" data-fgo="${F.node}">📖 ${zNode(F.node).t.split(':')[0]}</button> <button type="button" data-fagain>🎲 עוד תקלה אקראית</button></p>`;
    el.querySelector('[data-fgo]').addEventListener('click', () => go('zoom', F.node));
    el.querySelector('[data-fagain]').addEventListener('click', () => { MS.fault = 'rand'; const s = document.getElementById('mFault'); if (s) s.value = 'rand'; mFaultClose(); if (MS.gl) MS.gl.run(true); }); })); }
MS.fault = '';
/* the fault menu beside the run button: none, random (to diagnose), or one by name; only the faults of the machine shown */
MBAR_TOOLS.push({ id: 'fault', slot: 'end',
  html: () => `<label class="vh" for="mFault">תקלה להזרקה</label><select id="mFault" hidden title="הזרק תקלה למחזור הבא"></select>`,
  wire: bar => { const s = bar.querySelector('#mFault'); if (!s) return; const fill = () => { const can = MFAULTS.filter(f => MS.machine === 'line' || f.m === MS.machine); if (MS.fault && MS.fault !== 'rand' && !can.some(f => f.id === MS.fault)) MS.fault = '';
      s.innerHTML = `<option value="">בלי תקלה</option><option value="rand">⚠ תקלה אקראית: אבחן</option>` + can.map(f => `<option value="${f.id}">⚠ ${f.t}</option>`).join(''); s.value = MS.fault; s.hidden = !MS.gl; };
    fill(); s._fill = fill; s.addEventListener('change', () => { MS.fault = s.value; }); } });
MHOOK.afterMachine.push(() => { const s = document.getElementById('mFault'); if (s && s._fill) s._fill(); mFaultClose(); });
GO_BEFORE.push(mFaultClose);
