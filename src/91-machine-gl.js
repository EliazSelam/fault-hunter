/* ============ The machine, drawn in real-time 3D ============
   The machine view keeps its logic (parts, explode, selection, opening a part, the line, picking, names): this file only
   replaces the picture. A WebGL canvas sits under the view's own canvas and shows the same parts from the same camera;
   the view's canvas stays on top for the names and the pointer. If WebGL is missing, nothing here runs and the old drawing stays.
   Every part is built inside the boxes of MPARTS, so what you click is what you see. Colours: palette shades only. */
function fh3dMachine(THREE, cv, V) {
  const K = fh3dKit(THREE), C = K.C, keep = K.keep, { rbox, can, tube, lathe, paint, brushed, knurl } = K;
  /* a browser that would draw 3D in software only (no graphics acceleration) keeps the earlier drawing: a slow picture is worse than a plain one */
  let renderer; try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: !FH3D.software }); } catch (e) { return null; }
  if (!FH3D.software) { const g = renderer.getContext(), x = g.getExtension('WEBGL_debug_renderer_info'), name = x ? String(g.getParameter(x.UNMASKED_RENDERER_WEBGL)) : ''; if (/swiftshader|llvmpipe|software|basic render/i.test(name)) { renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss(); return null; } }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.setClearColor(0x000000, 0);
  const gl = renderer.domElement; gl.className = 'mgl'; gl.setAttribute('aria-hidden', 'true'); cv.parentNode.insertBefore(gl, cv); cv.classList.add('mtop');
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
  const groups = [];   /* { g, id, m, p, dx } */
  const world = new THREE.Group(); root.add(world);
  const clear = () => { groups.length = 0; while (world.children.length) world.remove(world.children[0]); };
  const buildMachine = () => { mCopies().forEach(({ p, dx, m }) => { const g = new THREE.Group(); (PB[p.id] || (gg => p.boxes.forEach(b => B(gg, b, byKey[b[6]] || 'navy'))))(g, p); world.add(g); groups.push({ g, id: p.id, m, p, dx }); });
    if (MS.machine === 'line') { const g = new THREE.Group(); B(g, [-0.7, 0.7, -0.6, 0.6, 0, 1.0], 'cream', 0.05, 0.1); B(g, [-0.74, 0.74, -0.64, 0.64, 1.0, 1.1], 'navy', 0.03, 0.1); B(g, [-0.5, 0.5, 0.3, 0.4, 1.1, 1.5], 'navy', 0.03, 0.05); B(g, [-0.46, 0.46, 0.285, 0.3, 1.14, 1.46], 'lamp', 0.005, 0.03); B(g, [-0.2, 0.2, -0.2, 0.1, 1.1, 1.13], 'pcb', 0.01, 0.03); world.add(g); groups.push({ g, id: 'verify', m: 'verify', p: { ex: [0, 0, 0], id: 'verify' }, dx: 0 });
      const way = new THREE.Group(); for (let x = -2.7; x < 3.3; x += 0.5) B(way, [x, x + 0.28, -0.05, 0.05, -0.5, -0.485], 'lamp', 0.005, 0.02); world.add(way); groups.push({ g: way, id: 'way', m: 'way', p: { ex: [0, 0, 0], id: 'way' }, dx: 0 }); } };
  const innerMat = ip => /עדשה|חלון/.test(ip.t) ? 'glass' : /סליל|ליפופי/.test(ip.t) ? 'brass' : /LED|נורי/.test(ip.t) ? 'lamp' : /כרטיס|מעבד/.test(ip.t) ? 'pcb' : /מיסבים|ציר|בורג|בוכנה|קפיץ|סרגל/.test(ip.t) ? 'steel' : /משטח/.test(ip.t) ? 'alu' : byKey[ip.c] || 'navy';
  const buildInner = node => { const S = 1.25; INNER[node].forEach((ip, i) => { const g = new THREE.Group(), b = ip.b.map(v => v * S), m = innerMat(ip), round = ROUND.test(ip.t) ? longAxis(ip.b) : null, d = [b[1] - b[0], b[3] - b[2], b[5] - b[4]], c = [(b[0] + b[1]) / 2, (b[2] + b[3]) / 2, (b[4] + b[5]) / 2];
      if (round) { const ai = 'xyz'.indexOf(round), o = [0, 1, 2].filter(k => k !== ai), r = Math.min(d[o[0]], d[o[1]]) / 2, geo = can(r, -d[ai] / 2, d[ai] / 2, Math.min(r, d[ai]) * 0.14, round === 'y' ? null : round, 40), sc = [1, 1, 1]; sc[o[0]] = d[o[0]] / (2 * r); sc[o[1]] = d[o[1]] / (2 * r); const mesh = put(g, geo, m, c); mesh.scale.set(sc[0], sc[1], sc[2]);
        if (m === 'brass') for (let k = 0; k < 6; k++) { const t = put(g, tube(r * 1.03, -d[ai] / 2 + (k + 0.5) * d[ai] / 6 - d[ai] / 30, -d[ai] / 2 + (k + 0.5) * d[ai] / 6 + d[ai] / 30, r * 0.06, round === 'y' ? null : round), 'brown', c); t.scale.set(sc[0], sc[1], sc[2]); } }
      else { B(g, b, m === 'pcb' ? 'navy' : m); if (m === 'pcb') { const flat = d.indexOf(Math.min(...d)); if (flat === 2) { face(g, d[0] * 0.94, d[1] * 0.94, 'pcb', [c[0], c[1], b[5] + 0.004]); B(g, [c[0] - d[0] * 0.18, c[0] + d[0] * 0.18, c[1] - d[1] * 0.2, c[1] + d[1] * 0.2, b[5], b[5] + 0.07], 'black', 0.015, 0.02); } else { const f = face(g, flat === 1 ? d[0] * 0.94 : d[1] * 0.94, d[2] * 0.94, 'pcb', flat === 1 ? [c[0], b[2] - 0.004, c[2]] : [b[0] - 0.004, c[1], c[2]]); if (flat === 1) f.rotation.x = Math.PI / 2; else f.rotation.y = -Math.PI / 2; } } }
      world.add(g); groups.push({ g, id: 'in:' + i, m: 'inner', p: { ex: ip.ex.map(v => v * S), id: 'in:' + i }, dx: 0, inner: i }); }); };

  /* ---------- the machine at work: one cycle per press, never by itself ----------
     AOI: the camera sweeps along the gantry over a coupon while the table steps between swaths; AOS: the head registers on two
     fiducials, then goes to each excess-copper defect of the same coupon and removes it. Shown slowed down. The swath comes
     from scanCalc; which defects are repaired comes from AOISCAN.removal. Stage travel is what this model's axes can reach. */
  const RUNC = (() => { const sc = scanCalc(1200, 0.5, 5), U = 3.2 / 600, sw = sc.swath * U, x0 = -1.3, x1 = 1.3, y0 = -0.96, n = 3, slow = 8;
    const yc = [0, 1, 2].map(i => y0 + sw * (i + 0.5)), map = d => [x0 + d.x / AOISCAN.coupon.w * (x1 - x0), y0 + d.y / AOISCAN.coupon.h * (n * sw)];
    return { sc, U, sw, x0, x1, y0, n, slow, yc, camY: -0.38, camHome: -0.65, lasY: -0.375, lasHome: 0.7, regX: 1.15, regY: -0.39, passT: (x1 - x0) / U / 1200 * slow,
      defects: sc.found.map(d => ({ id: d.id, cls: d.cls, name: d.name, p: map(d), ok: d.ok })), targets: sc.found.filter(d => d.ok && AOISCAN.removal.has(d.cls)).map(d => ({ id: d.id, cls: d.cls, p: map(d) })), fid: [[-1.45, -1.1], [1.45, -1.1]] }; })();
  const RUN = { on: false, kind: null, t0: 0, tau: 0, status: '', cam: 0, table: 0, lit: false, beam: false, flash: false, prog: [0, 0, 0], dir: [1, -1, 1], fixed: 0, firing: -1, burn: 0, off: {} };
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
  const paintOv = () => { og.clearRect(0, 0, 632, 472); const R = RUNC, h = R.sw * 200; og.lineWidth = 2; og.strokeStyle = 'rgba(214,232,247,.55)'; og.setLineDash([8, 6]); og.strokeRect(PX(R.x0), PY(R.y0 + R.n * R.sw), (R.x1 - R.x0) * 200, R.n * h); og.setLineDash([]);
    const seen = d => { if (RUN.kind === 'aos') return true; const i = Math.min(R.n - 1, Math.max(0, Math.floor((d.p[1] - R.y0) / R.sw))), k = RUN.prog[i], f = (d.p[0] - R.x0) / (R.x1 - R.x0); return RUN.dir[i] > 0 ? k >= f : k >= 1 - f; };
    if (RUN.kind === 'aoi') R.yc.forEach((y, i) => { const k = RUN.prog[i]; if (k <= 0) return; const w = (R.x1 - R.x0) * 200 * k, xa = RUN.dir[i] > 0 ? PX(R.x0) : PX(R.x1) - w; og.fillStyle = 'rgba(214,232,247,.26)'; og.fillRect(xa, PY(y + R.sw / 2), w, h); });
    R.defects.forEach(d => { if (!d.ok || !seen(d)) return; const t = R.targets.findIndex(q => q.id === d.id), x = PX(d.p[0]), y = PY(d.p[1]), fixed = RUN.kind === 'aos' && t >= 0 && t < RUN.fixed, burn = RUN.kind === 'aos' && t === RUN.firing ? RUN.burn : fixed ? 1 : 0;
      if (RUN.kind === 'aos' && t < 0) { og.strokeStyle = 'rgba(214,232,247,.35)'; og.lineWidth = 2; og.beginPath(); og.arc(x, y, 9, 0, 7); og.stroke(); return; }
      if (RUN.kind === 'aos' && burn < 1) { og.fillStyle = '#7B5A3C'; og.beginPath(); og.arc(x, y, 7 * (1 - burn), 0, 7); og.fill(); }
      og.strokeStyle = fixed ? '#D6E8F7' : '#EEE9E0'; og.lineWidth = 3; og.beginPath(); og.arc(x, y, 13, 0, 7); og.stroke(); og.fillStyle = '#EEE9E0'; og.font = '600 15px system-ui, sans-serif'; og.fillText(d.id + (fixed ? ' ✓' : ''), x + 16, y - 10); });
    if (RUN.kind === 'aos') R.fid.forEach(([fxx, fyy]) => { og.strokeStyle = '#D6E8F7'; og.lineWidth = 2; og.beginPath(); og.arc(PX(fxx), PY(fyy), 8, 0, 7); og.moveTo(PX(fxx) - 13, PY(fyy)); og.lineTo(PX(fxx) + 13, PY(fyy)); og.moveTo(PX(fxx), PY(fyy) - 13); og.lineTo(PX(fxx), PY(fyy) + 13); og.stroke(); });
    ovt.needsUpdate = true; };
  const LT = t => `<bdi dir="ltr">${t}</bdi>`;
  const ez = k => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, mix = (a, b, k) => a + (b - a) * k;
  /* the cycle as a list of steps: [seconds, what the step does at progress k, the line shown while it runs] */
  const timeline = kind => { const R = RUNC, S = [], off = y => R.camY - y; if (kind === 'aoi') {
      S.push([0.9, k => { RUN.cam = mix(R.camHome, R.x0, ez(k)); RUN.table = mix(0, off(R.yc[0]), ez(k)); }, 'הראש והשולחן נוסעים לתחילת האזור']);
      R.yc.forEach((y, i) => { const a = RUN.dir[i] > 0 ? R.x0 : R.x1, b = RUN.dir[i] > 0 ? R.x1 : R.x0;
        S.push([R.passT, k => { RUN.cam = mix(a, b, k); RUN.table = off(y); RUN.prog[i] = k; RUN.lit = k < 1; }, `סריקה: מעבר ${i + 1} מתוך ${R.n} · קצב שורות ${LT(f1(R.sc.f) + ' kHz')} · רוחב מעבר ${LT(f1(R.sc.swath, 1) + ' mm')} · מוצג בהילוך איטי פי ${R.slow}`]);
        if (i < R.n - 1) S.push([0.55, k => { RUN.table = mix(off(y), off(R.yc[i + 1]), ez(k)); }, 'השולחן מתקדם ברוחב מעבר אחד']); });
      S.push([2.4, () => { }, `הסריקה הסתיימה: ${R.defects.filter(d => d.ok).length} חשדות סומנו, והם עוברים לאימות`]);
      S.push([0.9, k => { RUN.cam = mix(R.x0, R.camHome, ez(k)); RUN.table = mix(off(R.yc[R.n - 1]), 0, ez(k)); }, 'חזרה לנקודת הבית']); }
    else { let cx = R.lasHome, ty = 0; const go = (x, y, text, d) => { const ax = cx, ay = ty; S.push([d || 1.0, k => { RUN.cam = mix(ax, x, ez(k)); RUN.table = mix(ay, y, ez(k)); }, text]); cx = x; ty = y; };
      R.fid.forEach((f, i) => { go(f[0] - (R.regX - R.lasHome), R.regY - f[1], `רישום: מצלמת הרישום נוסעת לסימן ${i + 1} מתוך 2`); S.push([0.5, k => { RUN.flash = k < 1; }, `רישום: סימן ${i + 1} נמדד, והמכונה מתאימה את מערכת הצירים שלה לפאנל`]); });
      R.targets.forEach((t, j) => { go(t.p[0], R.lasY - t.p[1], `הראש נוסע אל ${LT(t.id)}: נחושת עודפת שאומתה`); S.push([1.1, k => { RUN.beam = k < 1; RUN.firing = k < 1 ? j : -1; RUN.burn = k; if (k >= 1) RUN.fixed = Math.max(RUN.fixed, j + 1); }, `הסרה בלייזר ב-${LT(t.id)} · רדיוס כתם ${LT(f1(LZ.w0, 0) + ' µm')} · פגם ${j + 1} מתוך ${R.targets.length}`]); });
      S.push([2.0, () => { }, `התיקון הסתיים: ${R.targets.length} פגמי נחושת עודפת הוסרו. חוסר נחושת לא מתוקן כאן`]); go(R.lasHome, 0, 'חזרה לנקודת הבית', 0.9); }
    return S; };
  let steps = [], total = 0, hudEl = null;
  const hud = text => { if (!hudEl) { hudEl = document.createElement('div'); hudEl.className = 'mrunhud nogl'; hudEl.setAttribute('aria-live', 'polite'); cv.parentNode.appendChild(hudEl); } if (hudEl._t !== text) { hudEl._t = text; hudEl.innerHTML = text; } hudEl.hidden = !text; };
  const seek = t => { const R = RUNC; RUN.tau = t; RUN.prog = [0, 0, 0]; RUN.lit = RUN.beam = RUN.flash = false; RUN.fixed = 0; RUN.firing = -1; RUN.burn = 0; RUN.cam = RUN.kind === 'aoi' ? R.camHome : R.lasHome; RUN.table = 0; let left = t, cur = null;
    for (const s of steps) { if (left < s[0]) { s[1](left / s[0]); cur = s; break; } s[1](1); left -= s[0]; } RUN.status = cur ? cur[2] : '';
    const dx = RUN.cam - (RUN.kind === 'aoi' ? R.camHome : R.lasHome); RUN.off = RUN.kind === 'aoi' ? { cam: [dx, 0], lens: [dx, 0], strobe: [dx, 0], table: [0, RUN.table], panel: [0, RUN.table] } : { laser: [dx, 0], reg: [dx, 0], table: [0, RUN.table], panel: [0, RUN.table] };
    scanLine.visible = wash.visible = cone.visible = RUN.kind === 'aoi' && RUN.lit; beamCore.visible = beamGlow.visible = spark.visible = RUN.beam; regGlow.visible = RUN.flash;
    if (RUN.kind === 'aoi') { const i = RUN.prog.findIndex(k => k > 0 && k < 1); scanLine.scale.y = R.sw; scanLine.position.set(RUN.cam, R.camY, 0.418); wash.position.set(RUN.cam, R.camY, 0.45); cone.position.set(RUN.cam, R.camY, 0.565); void i; }
    else { beamCore.position.set(RUN.cam, R.lasY, 0.805); beamGlow.position.copy(beamCore.position); spark.position.set(RUN.cam, R.lasY, 0.44); const pulse = 0.4 + 0.25 * Math.sin(t * 40); spark.scale.set(pulse, pulse, 1); regGlow.position.set(RUN.cam + (R.regX - R.lasHome), R.regY, 1.28); }
    paintOv(); hud(RUN.status); return cur; };
  const runStop = () => { if (!RUN.on) return; RUN.on = false; RUN.off = {}; fx.visible = false; ovm.visible = false; hud(''); lastSig = ''; if (api.onRun) api.onRun(false); };
  const runStart = () => { if (RUN.on || MS.machine === 'line' || MS.path.length) return false; RUN.kind = MS.machine; steps = timeline(RUN.kind); total = steps.reduce((a, s) => a + s[0], 0); RUN.on = true; RUN.t0 = performance.now(); const pr = groups.find(r => r.id === 'panel'); if (pr) pr.g.add(ovm); ovm.visible = true; fx.visible = true; seek(0); lastSig = ''; if (api.onRun) api.onRun(true); return true; };
  /* ---------- per frame: place, light up, dim, aim the camera like the view does ---------- */
  let built = null, lastSig = '', dead = false, frames = 0; const X = new THREE.Vector3(1, 0, 0), tmp = new THREE.Vector3(), hot = new THREE.Color(C.blue);
  const setLook = (rec, hl, dim, hide) => { rec.g.visible = !hide; if (hide) return; const k = (hl ? 1 : 0) + (dim ? 2 : 0); if (rec.look === k) return; rec.look = k;
    rec.g.traverse(o => { if (!o.isMesh || o.userData.fx) return; const m = o.material, tr = dim || o.userData.tr; if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; } m.opacity = dim ? o.userData.o * 0.12 : o.userData.o; m.depthWrite = !tr; o.castShadow = !tr;
      if (hl && !o.userData.e) { m.emissive.copy(hot); m.emissiveIntensity = 0.42; } else { m.emissive.setHex(o.userData.e); m.emissiveIntensity = o.userData.ei; } }); };
  const toWorld = (v) => tmp.set(v[0], v[1], v[2]).applyAxisAngle(X, -Math.PI / 2).clone();
  const aim = () => { const s = V.st, cy = Math.cos(s.yaw), sy = Math.sin(s.yaw), cp = Math.cos(s.pitch), sp = Math.sin(s.pitch), f = [sy * cp, cy * cp, -sp], u = [sy * sp, cy * sp, cp], c = MS.C;
    cam.position.copy(toWorld([c[0] - s.dist * f[0], c[1] - s.dist * f[1], c[2] - s.dist * f[2]])); cam.up.copy(toWorld(u)); cam.lookAt(toWorld(c));
    cam.fov = 2 * Math.atan(cv.height / 2 / s.fov) * 180 / Math.PI; cam.aspect = cv.width / cv.height; cam.setViewOffset(cv.width, cv.height, 0, -30, cv.width, cv.height); cam.updateProjectionMatrix(); };
  const fit = () => { const w = cv.clientWidth, h = cv.clientHeight; if (w && h) { renderer.setSize(w, h, false); gl.style.width = w + 'px'; gl.style.height = h + 'px'; lastSig = ''; } };
  const ro = new ResizeObserver(fit); ro.observe(cv); fit();
  const api = {
    render() { if (dead) return; const inner = MS.path.length ? MS.path[MS.path.length - 1] : null, sigB = inner ? 'in:' + inner : 'm:' + MS.machine;
      if (sigB !== built) { clear(); if (inner) buildInner(inner); else buildMachine(); built = sigB; const far = MS.machine === 'line' && !inner; Object.assign(key.shadow.camera, far ? { left: -18, right: 18, top: 14, bottom: -14, near: 1, far: 70 } : { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 60 }); key.shadow.camera.updateProjectionMatrix(); floor.position.z = inner ? -1.4 : -0.5; lastSig = ''; }
      if (RUN.on) { if (MS.sel || inner || MS.machine !== RUN.kind || MS.target > 0.02 || MS.assembling) runStop(); else if (!RUN.manual) { const t = (performance.now() - RUN.t0) / 1000; if (t >= total) runStop(); else seek(t); } }
      const s = V.st, sig = [RUN.on ? RUN.tau : '', built, s.yaw.toFixed(4), s.pitch.toFixed(4), s.dist.toFixed(3), MS.C.map(v => v.toFixed(3)).join(), MS.E.toFixed(4), MS.IE.toFixed(4), MS.hover, MS.sel, MS.isel].join('|'); if (sig === lastSig) return; lastSig = sig;
      const selNode = MS.sel && !inner ? (MPARTS.find(p => p.id === MS.sel) || {}).node : null;
      groups.forEach(rec => { if (inner) { const e = MS.IE; rec.g.position.set(e * rec.p.ex[0], e * rec.p.ex[1], e * rec.p.ex[2]); setLook(rec, MS.hover === rec.id, MS.isel != null && MS.isel !== rec.inner, false); return; }
        const e = MS.E, p = rec.p, ro = RUN.on && RUN.off[rec.id]; rec.g.position.set(rec.dx + e * p.ex[0] + (ro ? ro[0] : 0), e * p.ex[1] + (ro ? ro[1] : 0), e * p.ex[2]); const dim = !!MS.sel && rec.id !== MS.sel && !(selNode && p.node === selNode);
        setLook(rec, rec.id === MS.hover || MS.hover === 'M:' + rec.m, dim, rec.id === 'door' && MS.sel && MS.sel !== 'door'); });
      aim(); renderer.render(scene, cam); frames++; },
    /* where the 3D camera puts a point of the machine, in the view canvas's own pixels: must agree with the view's projection */
    project(p) { aim(); cam.updateMatrixWorld(); const v = toWorld(p).project(cam); return [(v.x + 1) / 2 * cv.width, (1 - v.y) / 2 * cv.height]; },
    run(on) { if (on === false) { runStop(); return false; } RUN.manual = false; return runStart(); }, running: () => RUN.on,
    /* for checks: put the cycle at a given second and draw it */
    runSeek(t) { if (!RUN.on) return null; RUN.manual = true; const c = seek(Math.min(t, total - 1e-6)); lastSig = ''; api.render(); return { status: RUN.status, cam: RUN.cam, table: RUN.table, lit: RUN.lit, beam: RUN.beam, flash: RUN.flash, prog: RUN.prog.slice(), fixed: RUN.fixed, total, step: c ? steps.indexOf(c) : -1 }; },
    runPlan: () => ({ swath: RUNC.sw, U: RUNC.U, passT: RUNC.passT, yc: RUNC.yc.slice(), targets: RUNC.targets.map(t => t.id + ':' + t.cls), defects: RUNC.defects.length, total: timeline(MS.machine).reduce((a, q) => a + q[0], 0) }),
    info: () => ({ built, groups: groups.length, meshes: (() => { let n = 0; world.traverse(o => { if (o.isMesh) n++; }); return n; })(), frames, looks: groups.map(r => [r.id, r.look, r.g.visible]), pos: groups.map(r => [r.id, r.g.position.x - r.dx, r.g.position.y]) }),
    destroy() { if (dead) return; runStop(); if (hudEl && hudEl.parentNode) hudEl.parentNode.removeChild(hudEl); dead = true; ro.disconnect(); clear(); K.trash.forEach(o => o.dispose && o.dispose()); renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss(); if (gl.parentNode) gl.parentNode.removeChild(gl); cv.classList.remove('mtop'); }
  };
  return api;
}
if (window.FH3D) window.FH3D.machine = fh3dMachine;
/* leaving the page frees the 3D context */
GO_BEFORE.push(() => { if (MS.gl) { MS.gl.destroy(); MS.gl = null; } });

/* the button that runs one cycle; it exists only where the 3D picture does */
MBAR_TOOLS.push({ id: 'run', slot: 'end',
  html: () => `<button type="button" id="mRun" aria-pressed="false" hidden></button>`,
  wire: bar => { const b = bar.querySelector('#mRun'); if (!b) return; const label = on => { b.hidden = !MS.gl || MS.machine === 'line'; b.setAttribute('aria-pressed', !!on); b.textContent = on ? '❚❚ עצור' : MS.machine === 'aos' ? '▶ הפעל תיקון' : '▶ הפעל סריקה'; };
    label(false); if (MS.gl) MS.gl.onRun = label; b.addEventListener('click', () => { if (!MS.gl) return; if (MS.gl.running()) MS.gl.run(false); else { MS.target = 0; MS.assembling = false; const e = document.getElementById('mE'); if (e) e.value = 0; if (MS.sel) mSelect(null); MS.E = Math.min(MS.E, 0.02); MS.gl.run(true); } }); } });
MHOOK.afterMachine.push(() => { const b = document.getElementById('mRun'); if (b && MS.gl) { MS.gl.run(false); b.hidden = MS.machine === 'line'; b.textContent = MS.machine === 'aos' ? '▶ הפעל תיקון' : '▶ הפעל סריקה'; } });
