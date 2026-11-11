// The zoom: five scales from component to process, built from existing windows.
// Fails on: a window with no home or two homes, a window that does not render, two windows with the same content,
// a part that is not at a lower scale, a node not reachable by zooming in from the process, broken zoom navigation,
// missing authorship, or a link to the code.
import { createRequire } from 'module'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1200, height: 900 } }); const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.goto(url.pathToFileURL(path.join(ROOT, 'index.html')).href + '#/zoom'); await pg.waitForTimeout(500);
const P = []; let n = 0; const ok = (c, m) => { n++; if (!c) P.push(m); };
const D = await pg.evaluate(() => ({ nodes: ZOOM.map(z => ({ id: z.id, level: z.level, parts: z.parts, wins: zWindows(z), appx: ZAPPX.has(z.id) })), levels: ZLEVELS.map(l => l[0]) }));
/* one home per window */
const home = {}; D.nodes.forEach(z => z.wins.forEach(w => (home[w] = home[w] || []).push(z.id)));
Object.entries(home).forEach(([w, h]) => ok(h.length === 1, `window ${w}: ${h.length} homes (${h.join(', ')})`));
/* structure */
const byId = Object.fromEntries(D.nodes.map(z => [z.id, z]));
D.nodes.forEach(z => z.parts.forEach(p => ok(byId[p] && byId[p].level < z.level, `${z.id}: part ${p} exists at a lower scale`)));
D.levels.forEach(l => ok(D.nodes.some(z => z.level === l), `scale ${l} has nodes`));
const seen = new Set(); const walk = id => { if (seen.has(id)) return; seen.add(id); byId[id].parts.forEach(walk); }; D.nodes.filter(z => z.level === 5).forEach(z => walk(z.id));
D.nodes.filter(z => !z.appx).forEach(z => ok(seen.has(z.id), `${z.id}: reachable by zooming in from the top scale`));
D.nodes.filter(z => z.appx).forEach(z => ok(!D.nodes.some(o => o.parts.includes(z.id)), `${z.id}: an appendix is not a part of the machine`));
/* every window renders, and no two windows carry the same content */
const text = {};
for (const w of Object.keys(home)) {
  const r = await pg.evaluate(w => { const el = document.createElement('div'); document.getElementById('content').appendChild(el); try { zMount(w, el); } catch (e) { return { err: e.message }; } const t = el.textContent.replace(/\s+/g, ' ').trim(); const hasUi = el.querySelectorAll('canvas,svg,iframe,input,button,math,table').length; el.remove(); return { t, hasUi }; }, w);
  ok(!r.err && (r.t.length > 20 || r.hasUi), `window ${w}: renders${r.err ? ' (' + r.err + ')' : ''}`);
  if (r.t && r.t.length > 40 && !/^t:|^s:|^sim:|^fig:|:bench$/.test(w)) text[w] = r.t;
}
const ws = Object.keys(text);
for (let i = 0; i < ws.length; i++) for (let j = i + 1; j < ws.length; j++) ok(text[ws[i]] !== text[ws[j]], `duplicate content: ${ws[i]} and ${ws[j]}`);
/* navigation */
await pg.evaluate(() => go('zoom', 'proc')); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => document.querySelectorAll('.zdown').length === 7 && !!document.querySelector('.zsub') && !!document.querySelector('#hubpanel .zwin .zbody').innerHTML.trim()), 'process: its first window is open, the views bar is there, and it zooms into 7 systems');
await pg.evaluate(() => document.querySelector('.zdown[data-zn="vac"]').click()); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => ZS.node === 'vac' && !!document.querySelector('.zmain.zin')), 'zoom in goes down one scale, with the zoom-in motion');
await pg.evaluate(() => document.querySelector('.zdown[data-zn="valve"]').click()); await pg.waitForTimeout(150);
await pg.evaluate(() => document.querySelector('.zdown[data-zn="relay"]').click()); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => [...document.querySelectorAll('.zup')].map(b => b.dataset.zn).sort().join() === 'interlock,iocards,valve'), 'the relay shows every mechanism it is part of');
await pg.evaluate(() => document.querySelector('.zdown[data-zn="coil"]').click()); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => ZS.node === 'coil' && /סליל/.test(document.querySelector('#hubpanel').textContent)), 'down to the component: the coil card');
await pg.evaluate(() => document.querySelector('.zup').click()); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => !!document.querySelector('.zmain.zout')), 'zoom out goes up, with the zoom-out motion');
await pg.evaluate(() => document.querySelector('.zplane[data-zl="4"]').click()); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => document.querySelectorAll('.ztile').length === ZOOM.filter(z => z.level === 4 && !ZAPPX.has(z.id)).length), 'the level stack opens a scale with its nodes');
await pg.evaluate(() => go('zoom', 'trig')); await pg.waitForTimeout(150);
const before = await pg.evaluate(() => document.querySelector('#hubpanel .zwin').dataset.w); await pg.evaluate(() => document.querySelector('.hubpills button[aria-pressed="false"]').click()); await pg.waitForTimeout(150);
ok(await pg.evaluate(b => document.querySelector('#hubpanel .zwin').dataset.w !== b && !!document.querySelector('#hubpanel .zwin .zbody').innerHTML.trim() && document.querySelectorAll('#hubpanel .zwin').length === 1, before), 'another window of the hub opens in its place, one at a time');
/* authorship */
ok(await pg.evaluate(() => { const a = document.querySelector('.byline a'); return !!a && a.href.includes('linkedin.com/in/eliaz-selam') && /Eliaz Selam/.test(document.querySelector('.byline').textContent); }), 'header byline: name and LinkedIn');
ok(await pg.evaluate(() => /Eliaz Selam/.test(document.getElementById('titleblock').textContent) && !!document.querySelector('#titleblock a[href*="linkedin"]')), 'title block: designed and drawn by, with LinkedIn');
ok(await pg.evaluate(() => document.querySelector('meta[name="author"]').content === 'Eliaz Selam' && /Eliaz Selam/.test(document.querySelector('meta[property="og:title"]').content)), 'share tags carry the name');
ok(await pg.evaluate(() => !/github/i.test(document.querySelector('.byline').innerHTML + document.getElementById('titleblock').innerHTML + document.querySelector('footer').innerHTML)), 'no code link in the byline, title block or footer');
/* coverage: every existing page has a home, is the same content under another address, or is a shared resource */
const cov = await pg.evaluate(() => { const c = zCoverage(); return [c.rows.length, c.missing.map(m => m.r)]; });
ok(cov[1].length === 0, `every one of ${cov[0]} pages is accounted for (missing: ${cov[1].join(', ')})`);
/* tree by scale */
await pg.evaluate(() => { ZT.q = ''; ZT.core = false; ZT.ctx = 'all'; ZT.branch = null; go('zoom', 'tree'); }); await pg.waitForTimeout(150);
const all = await pg.evaluate(() => document.querySelectorAll('.ztcard').length);
ok(await pg.evaluate(n => document.querySelectorAll('.ztcol').length === 5 && n === ZOOM.filter(z => !ZAPPX.has(z.id)).length, all), `tree: five columns with all ${all} machine topics`);
await pg.click('#ztCore'); await pg.waitForTimeout(100); ok(await pg.evaluate(() => [...document.querySelectorAll('.ztcard')].every(c => c.classList.contains('core')) && document.querySelectorAll('.ztcard').length === ZCORE.size), 'tree: core only shows the core chain'); await pg.click('#ztCore'); await pg.waitForTimeout(100);
await pg.click('[data-ctx="AOS"]'); await pg.waitForTimeout(100); ok(await pg.evaluate(() => ![...document.querySelectorAll('.ztcard .zid')].some(z => ['CAM', 'TRIG', 'OPTICS'].includes(z.textContent))), 'tree: the AOS filter hides AOI-only topics'); await pg.click('[data-ctx="all"]'); await pg.waitForTimeout(100);
await pg.click('[data-br="vac"]'); await pg.waitForTimeout(100); ok(await pg.evaluate(() => { const ids = [...document.querySelectorAll('.ztcard .zid')].map(z => z.textContent.toLowerCase()); return ids.includes('vac') && ids.includes('relay') && ids.includes('coil') && !ids.includes('optics'); }), 'tree: a branch filter shows the branch down to its components'); await pg.click('[data-br="proc"]'); await pg.waitForTimeout(100);
await pg.fill('#ztq', 'סליל'); await pg.waitForTimeout(150); ok(await pg.evaluate(() => document.querySelectorAll('.ztcard').length >= 1 && [...document.querySelectorAll('.ztcard h3')].every(h => /סליל/.test(h.textContent))), 'tree: search filters by name');
await pg.evaluate(() => { ZT.q = ''; }); 
/* 3D stack */
await pg.evaluate(() => { Z3.rot = false; go('zoom', '3d'); }); await pg.waitForTimeout(400);
const hit = await pg.evaluate(() => { const c = document.getElementById('z3c'), r = c.getBoundingClientRect(), h = zHit3d('vac'); return h ? [r.left + h[0] * r.width / c.width, r.top + h[1] * r.height / c.height] : null; });
ok(!!hit, '3D: the vacuum table has a clickable spot');
if (hit) { await pg.mouse.click(hit[0], hit[1]); await pg.waitForTimeout(250); ok(await pg.evaluate(() => ZS.node === 'vac'), '3D: clicking a topic opens it in the zoom'); }
/* duplicates report */
await pg.evaluate(() => go('zoom', 'dedup')); await pg.waitForTimeout(150); await pg.click('#zRun'); await pg.waitForTimeout(400);
ok(await pg.evaluate(() => /✓/.test(document.getElementById('zLiveOut').textContent) && /0 עם יותר מבית אחד · 0 זוגות/.test(document.getElementById('zLiveOut').textContent)), 'duplicates report: the live check finds none');
ok(await pg.evaluate(() => document.querySelectorAll('.zlog').length >= 5 && /0 בלי בית/.test(document.querySelector('#content').textContent)), 'duplicates report: the log and full coverage');
/* about */
await pg.evaluate(() => go('about')); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => { const li = document.querySelector('.abtn.li'), gh = document.querySelector('.abtn.gh'); return !!li && !!gh && li.href.includes('linkedin.com/in/eliaz-selam') && gh.href.includes('github.com/EliazSelam') && /Eliaz Selam/.test(document.querySelector('.about').textContent); }), 'about: the project is mine, with LinkedIn and GitHub buttons');
/* the machine in 3D: the main layer */
await pg.evaluate(() => { MS.E = 0; MS.target = 0; MS.assembling = false; MS.sel = null; MS.rot = false; go('zoom'); }); await pg.waitForTimeout(400);
ok(await pg.evaluate(() => location.hash === '#/zoom' || location.hash === '#/zoom/machine') && await pg.evaluate(() => !!document.getElementById('mc') && document.querySelectorAll('.zsub [data-zv="machine"][aria-current="page"]').length === 1), 'the zoom opens on the machine in 3D');
ok(await pg.evaluate(() => MPARTS.filter(p => p.node).every(p => zNode(p.node))), 'every machine part is a zoom topic');
ok(await pg.evaluate(() => [...new Set(MPARTS.filter(p => p.node).map(p => p.node))].length >= 20), 'the machine shows at least 20 topics as parts');
const mp = await pg.evaluate(() => mPickAt('table')); ok(!!mp, 'the vacuum table can be clicked');
if (mp) { await pg.mouse.click(mp[0], mp[1]); await pg.waitForTimeout(300); ok(await pg.evaluate(() => MS.sel === 'table' && /שכבה 1/.test(document.getElementById('mside').textContent) && /שכבה 2/.test(document.getElementById('mside').textContent)), 'clicking a part selects it and lists its two layers'); }
await pg.evaluate(() => document.querySelector('#mside .zgo[data-zn]').click()); await pg.waitForTimeout(250);
ok(await pg.evaluate(() => ZS.node === 'vac' && [...document.querySelectorAll('.hubbtn small')].some(h => /שכבה 1/.test(h.textContent)) && [...document.querySelectorAll('.hubbtn small')].some(h => /שכבה 2/.test(h.textContent))), 'entering the part opens its node with layer 1 before layer 2');
await pg.evaluate(() => { const s = document.getElementById('mE'); }); 
await pg.evaluate(() => go('zoom', 'appx')); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => document.querySelectorAll('.ztile[data-zn]').length === ZAPPX.size && document.querySelectorAll('.ztile[data-route]').length === ZRES_SHOWN.length && !document.querySelector('.ztile[data-route="path"], .ztile[data-route="topic"]')), 'appendices: the topics outside the machine and the shared resources, without the old indexes');
/* everything around the machine */
ok(await pg.evaluate(() => mReach().missing.length === 0), `every machine topic is reachable inside the 3D machine (missing: ${await pg.evaluate(() => mReach().missing.join(', '))})`);
ok(await pg.evaluate(() => NAV_GROUPS.map(g => g[0]).join() === 'machine,appx,about'), 'navigation: the machine, appendices, about');
ok(await pg.evaluate(() => { const shown = new Set(NAV_GROUPS.flatMap(g => g[3])); return [...document.querySelectorAll('nav.sheets button')].every(b => shown.has(b.dataset.sheet) || b.hidden); }), 'navigation: every other tab is reached from inside the machine, not from the top bar');
{ const p2 = await b.newPage(); await p2.goto(url.pathToFileURL(path.join(ROOT, 'index.html')).href); await p2.waitForTimeout(500); ok(await p2.evaluate(() => !!document.getElementById('mc') && document.querySelector('.navgroups [aria-pressed="true"]').dataset.grp === 'machine'), 'with no address the book opens on the machine'); await p2.close(); }
await pg.evaluate(() => { MS.path = []; MS.sel = null; go('zoom', 'machine'); }); await pg.waitForTimeout(200);
ok(await pg.evaluate(() => !!document.querySelector('#mside .mwhole [data-zn="proc"]') && !!document.querySelector('#mside .mwhole [data-zn="bringup"]')), 'the whole machine offers its cycle and its bring-up');
/* moving around and curiosity */
await pg.evaluate(() => { localStorage.removeItem('fh-explored'); go('zoom', 'valve'); }); await pg.waitForTimeout(200);
ok(await pg.evaluate(() => { const p = [...document.querySelectorAll('.zpath [data-zn]')].map(b => b.dataset.zn); return p[p.length - 1] === 'valve' && p.includes('vac') && p.includes('proc'); }), 'path bar: from the machine down to the topic');
ok(await pg.evaluate(() => document.querySelectorAll('.zsibs button').length >= 1 || zSiblings('valve').length === 1), 'siblings at the same scale are offered');
await pg.keyboard.press('ArrowUp'); await pg.waitForTimeout(200); ok(await pg.evaluate(() => ZS.node === 'vac'), 'arrow up zooms out');
await pg.keyboard.press('ArrowDown'); await pg.waitForTimeout(200); ok(await pg.evaluate(() => ZS.node === 'valve'), 'arrow down zooms in');
await pg.evaluate(() => go('zoom', 'cam')); await pg.waitForTimeout(150); await pg.keyboard.press('ArrowLeft'); await pg.waitForTimeout(200);
ok(await pg.evaluate(() => ZS.node !== 'cam' && zNode(ZS.node).level === 4), 'arrow left moves to the next topic at the same scale');
ok(await pg.evaluate(() => ['valve', 'vac', 'cam'].every(id => zExplored().has(id))), 'visited topics are counted as explored');
await pg.evaluate(() => { MS.path = []; MS.sel = null; go('zoom', 'machine'); }); await pg.waitForTimeout(250);
ok(await pg.evaluate(() => /ביקרת ב-\d+ מתוך \d+/.test(document.querySelector('#mside .mexp').textContent) && !!document.querySelector('#mside [data-nx]')), 'the machine shows exploration progress and what to explore next');
ok(await pg.evaluate(() => MPARTS.filter(p => p.node).every(p => zTeaser(p.node) || !zWindows(zNode(p.node)).some(w => /^t:|^c:/.test(w)))), 'every part with questions has a teaser question');
ok(await pg.evaluate(() => { mJump('diode'); return MS.path.length >= 1 && INNER[MS.path[MS.path.length - 1]][MS.isel].node === 'diode'; }), 'the finder jumps into the machine, opened down to a component');
await pg.evaluate(() => { MS.path = []; MS.sel = null; });
/* two machines and the simulations gallery */
await pg.evaluate(() => { MS.path = []; MS.sel = null; MS.E = 0; MS.assembling = false; MS.rot = false; go('zoom', 'machine'); mSetMachine('aos'); }); await pg.waitForTimeout(400);
ok(await pg.evaluate(() => { const ids = new Set(MS.polys.map(p => p[2])); return ids.has('laser') && !ids.has('cam') && !ids.has('strobe'); }), 'the AOS machine shows the laser head and not the camera');
await pg.evaluate(() => mSetMachine('aoi')); await pg.waitForTimeout(300);
ok(await pg.evaluate(() => { const ids = new Set(MS.polys.map(p => p[2])); return ids.has('cam') && !ids.has('laser'); }), 'the AOI machine shows the camera and not the laser head');
await pg.evaluate(() => mSetMachine('line')); await pg.waitForTimeout(400);
ok(await pg.evaluate(() => { const ids = new Set(MS.polys.map(p => p[2])); return ids.has('M:aoi') && ids.has('M:aos') && ids.has('M:verify'); }), 'the line shows both machines and the verification station');
const aosAt = await pg.evaluate(() => mPickAt('M:aos'));
if (aosAt) { await pg.mouse.click(aosAt[0], aosAt[1]); await pg.waitForTimeout(250); }
ok(await pg.evaluate(() => MS.machine === 'aos'), 'clicking the AOS machine on the line enters it');
ok(await pg.evaluate(() => !document.querySelector('#mside .mreal')), 'no notes about specific companies on the machines');
await pg.evaluate(() => { mSetMachine('aoi'); mSelect('laser'); }); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => MS.machine === 'aos'), 'selecting an AOS part switches to the AOS machine');
await pg.evaluate(() => { MS.sel = null; mSetMachine('aoi'); ZG.q = ''; ZG.ctx = 'all'; go('zoom', 'sims'); }); await pg.waitForTimeout(200);
ok(await pg.evaluate(() => document.querySelectorAll('.simcard').length === zSimList().length && zSimList().length >= 20), 'the gallery lists every simulation');
ok(await pg.evaluate(() => { const s = zSimList(); const cr = s.find(x => x.w === 'sim:cr3d'), sc = s.find(x => x.w === 'sim:scan3d'); return cr && cr.ctx === 'AOS' && sc && sc.ctx === 'AOI'; }), 'the gallery files the crater under AOS and the scan head under AOI');
await pg.fill('#sgq', 'מכתש'); await pg.waitForTimeout(150); await pg.click('.simcard'); await pg.waitForTimeout(600);
ok(await pg.evaluate(() => ZS.node === 'laser' && !!document.querySelector('.zwin.zfocus canvas')), 'finding the crater opens it in place in its topic');
await pg.evaluate(() => { ZG.q = ''; });
/* the physics and math layer, animated: same numbers as the models */
const AV = await pg.evaluate(() => Object.fromEntries(Object.entries(ANIMS).map(([k, A]) => [k, A.calc(Object.fromEntries(A.params.map(p => [p[0], p[5]])))])));
const near = (a, b, tol) => Math.abs(a - b) <= tol;
ok(near(AV.scan.f, 51.2, 0.1) && near(AV.scan.b, 0.5, 1e-9) && near(AV.scan.bpx, 0.10, 0.005), 'animation scan: f = v/p = 51.2 kHz, blur 0.50 µm = 0.10 px, as in the camera model');
ok(near(AV.dof.dof, 22.5, 0.05) && near(AV.dof.b, 6, 1e-9), 'animation dof: ±λ/(2NA²) = ±22.5 µm, b = 2·NA·Δz');
ok(near(AV.crater.F0, 7.07, 0.01) && near(AV.crater.D, 10.6, 0.05) && near(AV.crater.h0, 6.2, 0.05) && near(AV.crater.Dc, 4.7, 0.06), 'animation crater: F₀ 7.07, D 10.6, depth 6.2, full cut 4.7 µm, as in the laser simulation');
ok(await pg.evaluate(() => { const a = ANIMS.pump.calc({ S: VT.S, C: VT.C, V: VT.V }), b = vacCalc(); return Math.abs(a.pss - b.pss) < 1e-9 && Math.abs(a.tth - b.tth) < 1e-9; }), 'animation pump: the same p_ss and t_th as the vacuum model');
ok(near(AV.servo.wn, 200, 1e-6) && near(AV.servo.z, 0.61, 1e-9) && near(AV.servo.Mp, 8.9, 0.05) && Math.abs(AV.servo.ts - AV.servo.ts4) / AV.servo.ts4 < 0.15, 'animation servo: ω_n 200, ζ 0.61, Mp 8.9%, simulated settling within 15% of 4/(ζω_n)');
ok(near(AV.coil.I, 0.05, 1e-9) && near(AV.coil.tau, 0.2 / 480, 1e-12), 'animation coil: I = V/R = 50 mA, τ = L/R');
ok(await pg.evaluate(() => Object.values(ANIMS).every(A => zWindows(zNode(A.node)).includes('anim:' + Object.keys(ANIMS).find(k => ANIMS[k] === A)))), 'every animation is a window of its topic');
await pg.evaluate(() => zOpenWindow('laser', 'anim:crater')); await pg.waitForTimeout(500);
const an = await pg.evaluate(() => { const el = [...document.querySelectorAll('.zwin')].find(s => s.dataset.w === 'anim:crater').querySelector('.zbody'); const first = el.querySelector('.asteps li.cur').dataset.as; el.querySelector('[data-ab="next"]').click(); const second = el.querySelector('.asteps li.cur').dataset.as; const r = el.querySelector('[data-ap="E"]'); r.value = 8; r.dispatchEvent(new Event('input')); return [first, second, el.querySelector('.asteps li[data-as="1"]').textContent, !!el.querySelector('canvas')]; });
ok(an[0] === '0' && an[1] === '1' && /14\.1/.test(an[2]) && an[3], `the crater animation steps forward and its formulas follow the slider (${an[2].slice(0, 60)})`);
ok(await pg.evaluate(() => zSimList().filter(s => s.kind === 'anim').length === Object.keys(ANIMS).length), 'the animations are in the simulations gallery');
/* each topic as an object with its hubs */
for (const id of await pg.evaluate(() => ZOOM.filter(z => !ZAPPX.has(z.id)).map(z => z.id))) {
  await pg.evaluate(id => go('zoom', id), id); await pg.waitForTimeout(60);
  ok(await pg.evaluate(() => !!document.querySelector('.hubobj') && document.querySelectorAll('.hubbtn').length >= 1 && document.querySelectorAll('#hubpanel .zwin').length === 1 && !document.querySelector('.zaround')), `${id}: an object in the middle, hubs around it, one window open`);
}
ok(await pg.evaluate(() => { let n = 0; ZOOM.forEach(z => { const by = {}; zWindows(z).forEach(w => by[hubOf(w)] = 1); n += Object.keys(by).length; }); return n > 0 && ZOOM.every(z => zWindows(z).every(w => HUBS.some(h => h[0] === hubOf(w)))); }), 'every window belongs to a hub');
{ const names = ['K' + 'LA', 'Orbo' + 'tech', 'Lumi' + 'na', 'Per' + 'Fix', 'Omni' + 'sphere', 'Eco' + 'Net']; ok(await pg.evaluate(ns => !new RegExp(ns.join('|')).test(document.documentElement.innerHTML), names), 'no company or product names'); }
/* the right layers first: the views bar and the world map */
await pg.evaluate(() => go('zoom', 'world')); await pg.waitForTimeout(250);
ok(await pg.evaluate(() => { const top = [...document.querySelectorAll('.zsub > button[data-zv]')].map(b => b.dataset.zv); const back = [...document.querySelectorAll('.zsub details.zback2 [data-zv]')].map(b => b.dataset.zv); return top.join() === 'machine,world,sims,node,appx' && back.join() === 'tree,3d,dedup'; }), 'views bar: the machine, the world map, the simulations first; tree, layers and duplicates behind the scenes');
ok(await pg.evaluate(() => document.querySelectorAll('.wcity').length === zMachineTopics().length && document.querySelectorAll('.wstat').length >= 5), 'world map: a city for every topic of the machine, and the statistics');
await pg.evaluate(() => document.querySelector('.wcity[data-zn="relay"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))); await pg.waitForTimeout(250);
ok(await pg.evaluate(() => ZS.node === 'relay'), 'world map: a city opens its topic');
/* information bundled */
await pg.evaluate(() => go('zoom', 'optics')); await pg.waitForTimeout(250); await pg.evaluate(() => document.querySelector('.hubbtn[data-hub="inside"]').click()); await pg.waitForTimeout(250);
ok(await pg.evaluate(() => document.querySelectorAll('.hubpills .hubgrp').length >= 2 && document.querySelectorAll('.hubpills .hubgt').length >= 2), 'a hub groups its windows by subject');
ok(await pg.evaluate(() => { const g = [...document.querySelectorAll('.hubpills .hubgrp')]; return g.every(x => { const l = [...x.querySelectorAll('button')].map(b => b.textContent); return new Set(l).size === l.length; }); }), 'within a subject, every window has a distinct name');
/* the four new animations reproduce the models */
const AV2 = await pg.evaluate(() => Object.fromEntries(['quad', 'pwmr', 'drop', 'frame'].map(k => [k, ANIMS[k].calc(Object.fromEntries(ANIMS[k].params.map(p => [p[0], p[5]])))])));
ok(Math.abs(AV2.quad.res - 1) < 1e-9 && Math.abs(AV2.quad.fc - 250) < 1e-9, 'animation quad: 10 mm lead / (4 × 2500) = 1 µm per count, 250 kHz counts at 1500 rpm');
ok(Math.abs(AV2.pwmr.Vavg - 14.4) < 1e-9 && Math.abs(AV2.pwmr.dI - 0.288) < 1e-9, 'animation pwm: V_avg = D·V = 14.4 V, ripple V·D(1−D)/(L·f) = 288 mA');
ok(await pg.evaluate(() => { const v = ANIMS.drop.calc({ I: 2, Lc: 12, A: 0.75 }); const m = pwrCalc().branches[1]; return Math.abs(v.Vend - m.Vend) < 1e-9; }), 'animation drop: the same voltage at the I/O branch end as the power model');
ok(await pg.evaluate(() => Math.abs(ANIMS.frame.calc({ bytes: 0, Tc: 1 }).tF - ecatCalc().tFrame * 1e6) < 1e-9 && ANIMS.frame.calc({ bytes: 10500, Tc: 1 }).over), 'animation frame: the same frame time as the EtherCAT model, and overrun with 10,500 extra bytes');
/* stage 1 of the review: continuity fixes, each with its own behaviour check */
await pg.evaluate(() => go('zoom', 'cam')); await pg.waitForTimeout(400);
await pg.evaluate(() => { const c = document.querySelector('#hubpanel canvas'); c.setAttribute('tabindex', '0'); c.focus(); }); await pg.keyboard.press('ArrowLeft'); await pg.waitForTimeout(200);
ok(await pg.evaluate(() => ZS.node === 'cam'), 'F01: an arrow key inside an activity stays in the activity');
await pg.evaluate(() => document.activeElement.blur()); await pg.keyboard.press('ArrowLeft'); await pg.waitForTimeout(200);
ok(await pg.evaluate(() => ZS.node !== 'cam'), 'F01: the same arrow from the page still moves along the level');
await pg.evaluate(() => go('zoom', 'cam')); await pg.waitForTimeout(400);
await pg.evaluate(() => document.querySelectorAll('#hubpanel [data-s]')[2].click()); await pg.evaluate(() => document.querySelector('.hubbtn[data-hub="math"]').click()); await pg.waitForTimeout(150);
await pg.evaluate(() => document.querySelector('.hubbtn[data-hub="demo"]').click()); await pg.waitForTimeout(250);
ok(await pg.evaluate(() => document.querySelector('#hubpanel [data-s][aria-current="step"]').dataset.s === '2'), 'F02: back from another hub, the demo is on the same step');
await pg.evaluate(() => go('zoom', 'laser')); await pg.waitForTimeout(250); await pg.evaluate(() => go('zoom', 'cam')); await pg.waitForTimeout(400);
ok(await pg.evaluate(() => document.querySelector('#hubpanel [data-s][aria-current="step"]').dataset.s === '2'), 'F02: back from another topic, the demo is on the same step');
await pg.evaluate(() => zOpenWindow('laser', 'anim:crater')); await pg.waitForTimeout(400);
await pg.evaluate(() => { const a = document.querySelector('#hubpanel .zbody').animApi; a.setParam('E', 6); a.go(3); }); await pg.evaluate(() => document.querySelector('.hubbtn[data-hub="demo"]').click()); await pg.waitForTimeout(150);
await pg.evaluate(() => document.querySelector('.hubbtn[data-hub="math"]').click()); await pg.waitForTimeout(250);
ok(await pg.evaluate(() => { const a = document.querySelector('#hubpanel .zbody').animApi; return a && a.step === 3 && a.P.E === 6; }), 'F02: an animation comes back with its step and its parameters');
ok(await pg.evaluate(() => /הנחה:/.test(ANIMS.scan.steps[4]({ v: 250, p: 4.88, t: 2 }, ANIMS.scan.calc({ v: 250, p: 4.88, t: 2 }))) && /חשיפה אלקטרונית/.test(ANIMS.scan.steps[4]({ v: 250, p: 4.88, t: 2 }, ANIMS.scan.calc({ v: 250, p: 4.88, t: 2 })))), 'F03: the continuous-light case is stated as an assumption, with the electronic-shutter alternative');
const clk = await pg.evaluate(async () => { const a = document.querySelector('#hubpanel .zbody').animApi, el = document.querySelector('#hubpanel .zbody'); el.querySelector('[data-ab="play"]').click(); el.querySelector('[data-ab="play"]').click(); const t1 = a.simTime; await new Promise(r => setTimeout(r, 350)); return [a.frozen, t1, a.simTime]; });
ok(clk[0] && clk[1] === clk[2], 'F04: pausing an animation freezes its clock');
await pg.evaluate(() => { MS.path = []; MS.sel = null; go('zoom', 'machine'); mSetMachine('aos'); }); await pg.waitForTimeout(250);
ok(await pg.evaluate(() => /AOS/.test(document.querySelector('#mside h3').textContent) && /פישוט לימודי/.test(document.getElementById('mside').textContent)), 'F05: the AOS machine is named and explained as AOS, with the shared parts marked as a simplification');
await pg.evaluate(() => mSetMachine('aoi')); await pg.waitForTimeout(200);
ok(await pg.evaluate(() => /ביקרת/.test(document.getElementById('mside').textContent) && !/חקרת/.test(document.getElementById('mside').textContent)), 'F06: visits are called visits');
await pg.evaluate(() => go('zoom', 'relay')); await pg.waitForTimeout(300);
const yaw = await pg.evaluate(async () => { const V = document.querySelector('.hubobj')._V, y1 = V.st.yaw; await new Promise(r => setTimeout(r, 300)); return [y1, V.st.yaw]; });
ok(yaw[0] === yaw[1], 'F08: the topic object stays still while an activity is open');
ok(await pg.evaluate(() => { const o = document.querySelector('.hubobj'); return o.getAttribute('role') === 'button' && o.tabIndex === 0 && !!document.querySelector('.hubfind'); }), 'F10: the topic object is a keyboard button, with a visible button beside it');
await pg.evaluate(() => go('zoom', 'world')); await pg.waitForTimeout(250);
ok(await pg.evaluate(() => document.querySelector('.wmap').getAttribute('role') === 'group' && document.querySelectorAll('.wlist [data-zn]').length >= zMachineTopics().length), 'F10: the world map has every topic as a list too');
/* stage 2: permanent links and the back button (F09) */
{ const p3 = await b.newPage({ viewport: { width: 1200, height: 900 } }); const base = url.pathToFileURL(path.join(ROOT, 'index.html')).href;
  await p3.goto(base + '#/zoom/laser/math/anim%3Acrater'); await p3.waitForTimeout(700);
  ok(await p3.evaluate(() => ZS.node === 'laser' && document.querySelector('#hubpanel .zwin').dataset.w === 'anim:crater'), 'F09: a link opens the topic with that window');
  await p3.evaluate(() => { const x = document.querySelector('#hubpanel .zbody').animApi; x.setParam('E', 6); x.go(3); });
  const len0 = await p3.evaluate(() => history.length); await p3.evaluate(() => document.querySelector('.hubbtn[data-hub="demo"]').click()); await p3.waitForTimeout(150);
  ok(await p3.evaluate(n => history.length === n && /^#\/zoom\/laser\/demo\//.test(location.hash), len0), 'F09: changing the hub updates the address without a new history entry');
  await p3.evaluate(() => document.querySelector('.hubbtn[data-hub="math"]').click()); await p3.waitForTimeout(150);
  await p3.reload(); await p3.waitForTimeout(800);
  ok(await p3.evaluate(() => { const x = document.querySelector('#hubpanel .zbody').animApi; return x && x.step === 3 && x.P.E === 6; }), 'F09: reloading the link returns to the same attempt');
  await p3.evaluate(() => go('zoom', 'relay')); await p3.waitForTimeout(250); await p3.goBack(); await p3.waitForTimeout(500);
  ok(await p3.evaluate(() => ZS.node === 'laser'), 'F09: back after moving to another topic returns to the first');
  await p3.goto(base + '#/zoom/machine?m=aos&sel=laser'); await p3.waitForTimeout(700);
  ok(await p3.evaluate(() => MS.machine === 'aos' && MS.sel === 'laser'), 'F09: a machine link opens that machine with that part selected');
  ok(await p3.evaluate(() => { const top = ZVIEW.list.filter(v => v[2] === 'main').map(v => v[0]).join(); return top === 'machine,world,sims,node,appx'; }), 'the views bar comes from one list');
  await p3.close(); }
/* stage 2, step 3: sections */
ok(await pg.evaluate(() => NODE_SECTIONS.map(s => s.id).join() === 'visit,path,crumb,title,hub,children'), 'step 3: the topic page is the sections visit, path, crumb, title, hub, children, in that order');
await pg.evaluate(() => go('zoom', 'relay')); await pg.waitForTimeout(250);
ok(await pg.evaluate(() => [...document.querySelector('.zmain').children].map(e => e.className.split(' ')[0] || e.tagName).join() === 'zpath,zsibs,zcrumb,H2,hub,zring,ztiles'), 'step 3: the topic page has the same elements in the same order as before');
await pg.evaluate(() => { document.querySelector('.zpath [data-zn="vac"]').click(); }); await pg.waitForTimeout(250);
ok(await pg.evaluate(() => ZS.node === 'vac'), 'step 3: a path button moves once, to that topic');
await pg.evaluate(() => { MS.path = []; MS.sel = null; go('zoom', 'machine'); mSetMachine('aoi'); }); await pg.waitForTimeout(250);
ok(await pg.evaluate(() => MSIDE.map(s => s.id).join() === 'visit,mexp,mwhole,inner,whole,part,line' && [...document.querySelectorAll('#mside .msec')].map(e => e.dataset.sec).join() === 'mexp,mwhole,whole'), 'step 3: the machine panel is a list of sections; with nothing selected: progress, the machine\u2019s topics, the machine');
await pg.evaluate(() => mSelect('table')); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => [...document.querySelectorAll('#mside .msec')].map(e => e.dataset.sec).join() === 'part'), 'step 3: a selected part shows only its section');
await pg.evaluate(() => { MS.sel = null; mSide(); });
const built = await pg.evaluate(() => document.documentElement.outerHTML.length);
/* stage 2, step 2: views */
for (const v of await pg.evaluate(() => Object.keys(ZVIEW.views).filter(v => v !== 'node' && v !== 'level'))) { await pg.evaluate(v => go('zoom', v), v); await pg.waitForTimeout(120); ok(await pg.evaluate(v => !!document.querySelector(`.zsub [data-zv="${v}"][aria-current="page"]`), v), `step 2: view ${v} renders with its bar`); }
await pg.evaluate(() => go('zoom', 'L2')); await pg.waitForTimeout(120); ok(await pg.evaluate(() => !!document.querySelector('.zsub') && document.querySelectorAll('.ztile').length > 0), 'step 2: a scale view renders with the bar');
/* stage 2, step 1: window kinds */
ok(await pg.evaluate(() => { const all = new Set(ZOOM.flatMap(zWindows)); return [...all].every(w => !!WIN.of(w)) && [...all].filter(w => w.startsWith('anim:')).every(w => WIN.of(w).id === 'anim') && [...all].filter(w => /^c:[^:]+:(parts|words|tryit|drills|say|full|schematic|numbers)$/.test(w)).every(w => WIN.of(w).id === 'sections') && WIN.of('t:cam:scene').id === 'base'; }), 'step 1: every window resolves to one kind, and the right one');
/* multi-level disassembly */
const inner = await pg.evaluate(() => { const desc = id => { const s = new Set(); const w = x => { if (s.has(x)) return; s.add(x); zNode(x).parts.forEach(w); }; w(id); return s; };
  return Object.entries(INNER).map(([n, parts]) => [n, !!zNode(n), parts.filter(ip => !desc(n).has(ip.node)).map(ip => ip.node)]); });
inner.forEach(([n, exists, bad]) => ok(exists && bad.length === 0, `inner assembly of ${n}: every part is ${n} itself or a part of it (not: ${bad.join(', ')})`));
await pg.evaluate(() => { MS.E = 0; MS.assembling = false; MS.path = []; MS.sel = null; MS.rot = false; go('zoom', 'machine'); }); await pg.waitForTimeout(300);
await pg.evaluate(() => mSelect('table')); await pg.waitForTimeout(200);
ok(await pg.evaluate(() => !!document.querySelector('#mside [data-mo="vac"]')), 'a part with an inner assembly offers to open it');
await pg.evaluate(() => document.querySelector('#mside [data-mo="vac"]').click()); await pg.waitForTimeout(1500);
ok(await pg.evaluate(() => MS.path.join() === 'vac' && MS.IE > 0.9 && MS.polys.length > 10), 'opening the table explodes its inner parts');
await pg.evaluate(() => { MS.isel = INNER.vac.findIndex(p => p.node === 'valve'); mSide(); document.querySelector('#mside [data-mo="valve"]').click(); }); await pg.waitForTimeout(1500);
await pg.evaluate(() => { MS.isel = INNER.valve.findIndex(p => p.node === 'relay'); mSide(); document.querySelector('#mside [data-mo="relay"]').click(); }); await pg.waitForTimeout(1500);
ok(await pg.evaluate(() => MS.path.join('>') === 'vac>valve>relay' && /המכונה/.test(document.querySelector('.mcrumb').textContent)), 'down three levels: table, valve, relay, with the path shown');
const coil = await pg.evaluate(() => mPickAt('in:' + INNER.relay.findIndex(p => p.node === 'coil')));
ok(!!coil, 'the relay\u2019s coil can be clicked'); if (coil) { await pg.mouse.click(coil[0], coil[1]); await pg.waitForTimeout(200); ok(await pg.evaluate(() => INNER.relay[MS.isel] && INNER.relay[MS.isel].node === 'coil' && /סליל/.test(document.getElementById('mside').textContent)), 'clicking the coil shows the component'); }
await pg.evaluate(() => document.querySelector('#mside [data-mup]').click()); await pg.waitForTimeout(200);
ok(await pg.evaluate(() => MS.path.join('>') === 'vac>valve'), 'one level up goes back to the valve');
await pg.evaluate(() => document.querySelector('.mcrumb [data-mlv="0"]').click()); await pg.waitForTimeout(200);
ok(await pg.evaluate(() => MS.path.length === 0), 'the breadcrumb returns to the whole machine');
/* the demo tour */
await pg.evaluate(() => go('about')); await pg.waitForTimeout(150); await pg.click('.about [data-tour]'); await pg.waitForTimeout(250);
const tourWant = ['#/zoom/machine', '#/zoom/machine', '#/zoom/proc', '#/zoom/vac', '#/zoom/valve', '#/zoom/relay', '#/zoom/coil', '#/zoom/tree', '#/zoom/3d', '#/zoom/dedup', '#/about'];
for (let i = 0; i < tourWant.length; i++) {
  const r = await pg.evaluate(() => [location.hash, !!document.getElementById('ztour'), document.querySelector('#ztour .ztn').textContent]);
  ok(r[0].split('?')[0] === tourWant[i] && r[1] && r[2].includes(`${i + 1}/${tourWant.length}`), `tour step ${i + 1}: ${tourWant[i]} with its bar (${r[0]})`);
  if (i === 1) { await pg.waitForTimeout(4200); ok(await pg.evaluate(() => MS.path.join('>') === 'vac>valve>relay'), 'tour: the disassembly step opens the table, the valve and the relay'); }
  if (i === 9) { await pg.waitForTimeout(500); ok(await pg.evaluate(() => /✓/.test(document.getElementById('zLiveOut').textContent)), 'tour: the duplicates step runs the live check'); }
  await pg.click('#ztNext'); await pg.waitForTimeout(250);
}
ok(await pg.evaluate(() => !document.getElementById('ztour')), 'tour: the last step closes the bar');
await b.close();
if (errs.length) P.push(...errs.map(e => 'js error: ' + e));
console.log(`zoom: ${D.nodes.length} nodes, ${Object.keys(home).length} windows, ${n} checks`);
if (P.length) { console.log('PROBLEMS (' + P.length + ')'); P.slice(0, 40).forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL ZOOM CHECKS PASSED');
