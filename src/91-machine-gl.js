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
  /* ---------- per frame: place, light up, dim, aim the camera like the view does ---------- */
  let built = null, lastSig = '', dead = false, frames = 0; const X = new THREE.Vector3(1, 0, 0), tmp = new THREE.Vector3(), hot = new THREE.Color(C.blue);
  const setLook = (rec, hl, dim, hide) => { rec.g.visible = !hide; if (hide) return; const k = (hl ? 1 : 0) + (dim ? 2 : 0); if (rec.look === k) return; rec.look = k;
    rec.g.traverse(o => { if (!o.isMesh) return; const m = o.material, tr = dim || o.userData.tr; if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; } m.opacity = dim ? o.userData.o * 0.12 : o.userData.o; m.depthWrite = !tr; o.castShadow = !tr;
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
      const s = V.st, sig = [built, s.yaw.toFixed(4), s.pitch.toFixed(4), s.dist.toFixed(3), MS.C.map(v => v.toFixed(3)).join(), MS.E.toFixed(4), MS.IE.toFixed(4), MS.hover, MS.sel, MS.isel].join('|'); if (sig === lastSig) return; lastSig = sig;
      const selNode = MS.sel && !inner ? (MPARTS.find(p => p.id === MS.sel) || {}).node : null;
      groups.forEach(rec => { if (inner) { const e = MS.IE; rec.g.position.set(e * rec.p.ex[0], e * rec.p.ex[1], e * rec.p.ex[2]); setLook(rec, MS.hover === rec.id, MS.isel != null && MS.isel !== rec.inner, false); return; }
        const e = MS.E, p = rec.p; rec.g.position.set(rec.dx + e * p.ex[0], e * p.ex[1], e * p.ex[2]); const dim = !!MS.sel && rec.id !== MS.sel && !(selNode && p.node === selNode);
        setLook(rec, rec.id === MS.hover || MS.hover === 'M:' + rec.m, dim, rec.id === 'door' && MS.sel && MS.sel !== 'door'); });
      aim(); renderer.render(scene, cam); frames++; },
    /* where the 3D camera puts a point of the machine, in the view canvas's own pixels: must agree with the view's projection */
    project(p) { aim(); cam.updateMatrixWorld(); const v = toWorld(p).project(cam); return [(v.x + 1) / 2 * cv.width, (1 - v.y) / 2 * cv.height]; },
    info: () => ({ built, groups: groups.length, meshes: (() => { let n = 0; world.traverse(o => { if (o.isMesh) n++; }); return n; })(), frames, looks: groups.map(r => [r.id, r.look, r.g.visible]) }),
    destroy() { if (dead) return; dead = true; ro.disconnect(); clear(); K.trash.forEach(o => o.dispose && o.dispose()); renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss(); if (gl.parentNode) gl.parentNode.removeChild(gl); cv.classList.remove('mtop'); }
  };
  return api;
}
if (window.FH3D) window.FH3D.machine = fh3dMachine;
/* leaving the page frees the 3D context */
GO_BEFORE.push(() => { if (MS.gl) { MS.gl.destroy(); MS.gl = null; } });
