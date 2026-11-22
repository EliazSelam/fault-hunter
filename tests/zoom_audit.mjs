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
ok(await pg.evaluate(() => [...document.querySelectorAll('.zup')].map(b => b.dataset.zn).sort().join() === 'interlock,iocards,rel,valve'), 'the relay shows every mechanism it is part of');
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
ok(await pg.evaluate(() => ZS.node === 'vac' && [...document.querySelectorAll('.hubbtn b')].some(h => /^0\./.test(h.textContent)) && [...document.querySelectorAll('.hubbtn b')].some(h => /^3\./.test(h.textContent))), 'entering the part opens its node with layer 1 before layer 2');
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
ok(near(AV.dof.dof, 6.25, 0.05) && near(AV.dof.b, 12, 1e-9), 'animation dof: ±λ/(2NA²) = ±6.25 µm, b = 2·NA·Δz');
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
{ const names = ['K' + 'LA', 'Orbo' + 'tech', 'Lumi' + 'na', 'Per' + 'Fix', 'Omni' + 'sphere', 'Eco' + 'Net']; ok(await pg.evaluate(ns => !new RegExp('\\b(' + ns.join('|') + ')\\b').test(document.documentElement.innerHTML), names), 'no company or product names'); }
/* the right layers first: the views bar and the world map */
await pg.evaluate(() => go('zoom', 'world')); await pg.waitForTimeout(250);
ok(await pg.evaluate(() => { const top = [...document.querySelectorAll('.zsub > button[data-zv]')].map(b => b.dataset.zv); const back = [...document.querySelectorAll('.zsub details.zback2 [data-zv]')].map(b => b.dataset.zv); return top.join() === 'book,progress,machine,path,central,world,sims,node,appx' && back.join() === 'tree,3d,dedup'; }), 'views bar: the machine, the world map, the simulations first; tree, layers and duplicates behind the scenes');
ok(await pg.evaluate(() => document.querySelectorAll('.wcity').length === ZOOM.length && document.querySelectorAll('.wstat').length >= 5), 'world map: a point for every topic of the book, appendices included, and the statistics');
await pg.evaluate(() => document.querySelector('.wcity[data-zn="relay"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))); await pg.waitForTimeout(250);
ok(await pg.evaluate(() => ZS.node === 'relay'), 'world map: a city opens its topic');
/* information bundled */
await pg.evaluate(() => go('zoom', 'optics')); await pg.waitForTimeout(250); await pg.evaluate(() => document.querySelector('.hubbtn[data-hub="eng"]').click()); await pg.waitForTimeout(250);
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
await pg.evaluate(() => document.querySelector('.hubbtn[data-hub="show"]').click()); await pg.waitForTimeout(250);
ok(await pg.evaluate(() => document.querySelector('#hubpanel [data-s][aria-current="step"]').dataset.s === '2'), 'F02: back from another hub, the demo is on the same step');
await pg.evaluate(() => go('zoom', 'laser')); await pg.waitForTimeout(250); await pg.evaluate(() => go('zoom', 'cam')); await pg.waitForTimeout(400);
ok(await pg.evaluate(() => document.querySelector('#hubpanel [data-s][aria-current="step"]').dataset.s === '2'), 'F02: back from another topic, the demo is on the same step');
await pg.evaluate(() => zOpenWindow('laser', 'anim:crater')); await pg.waitForTimeout(400);
await pg.evaluate(() => { const a = document.querySelector('#hubpanel .zbody').animApi; a.setParam('E', 6); a.go(3); }); await pg.evaluate(() => document.querySelector('.hubbtn[data-hub="show"]').click()); await pg.waitForTimeout(150);
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
  const len0 = await p3.evaluate(() => history.length); await p3.evaluate(() => document.querySelector('.hubbtn[data-hub="show"]').click()); await p3.waitForTimeout(150);
  ok(await p3.evaluate(n => history.length === n && /^#\/zoom\/laser\/show\//.test(location.hash), len0), 'F09: changing the hub updates the address without a new history entry');
  await p3.evaluate(() => document.querySelector('.hubbtn[data-hub="math"]').click()); await p3.waitForTimeout(150);
  await p3.reload(); await p3.waitForTimeout(800);
  ok(await p3.evaluate(() => { const x = document.querySelector('#hubpanel .zbody').animApi; return x && x.step === 3 && x.P.E === 6; }), 'F09: reloading the link returns to the same attempt');
  await p3.evaluate(() => go('zoom', 'relay')); await p3.waitForTimeout(250); await p3.goBack(); await p3.waitForTimeout(500);
  ok(await p3.evaluate(() => ZS.node === 'laser'), 'F09: back after moving to another topic returns to the first');
  await p3.goto(base + '#/zoom/machine?m=aos&sel=laser'); await p3.waitForTimeout(700);
  ok(await p3.evaluate(() => MS.machine === 'aos' && MS.sel === 'laser'), 'F09: a machine link opens that machine with that part selected');
  ok(await p3.evaluate(() => { const top = ZVIEW.list.filter(v => v[2] === 'main').map(v => v[0]).join(); return top === 'book,progress,machine,path,central,world,sims,node,appx'; }), 'the views bar comes from one list');
  await p3.close(); }
/* stage 2, step 6: nothing in the zoom tab is reassigned after load */
{ const src = require('fs').readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const re = /^(zNodeView|zMount|zInfo|mSide|zSubnav|zWireSub|showZoom|zMachineView|zTreeView|zAppxView|mSelect|mSetMachine|zOpenWindow|showAbout|zWinCtx) = /m;
  ok(!re.test(src), 'step 6: no function of the zoom tab is reassigned (found: ' + (src.match(re) || [''])[0] + ')');
  const zsrc = ['77-zoom', '78-zoom-views', '79-machine3d', '80-integrate', '81-polish', '82-machines', '83-anim', '84-hub', '85-layers', '86-links'].map(f => require('fs').readFileSync(path.join(ROOT, 'src', f + '.js'), 'utf8')).join('\n');
  ok(!/\(function \(orig\)|^const _\w+ = (z|m)[A-Za-z]+;/m.test(zsrc), 'step 6: the zoom source files have no wrapper pattern'); }
await pg.evaluate(() => { MS.path = []; MS.sel = null; go('zoom', 'machine'); }); await pg.waitForTimeout(250);
ok(await pg.evaluate(() => !!document.querySelector('.mbar .mmach') && !!document.getElementById('mFind') && MBAR_TOOLS.map(t => t.id).join() === 'machine,finder,run,fault'), 'step 6: the machine bar tools are in place (machine switch, finder, run, fault)');
await pg.evaluate(() => { const i = document.getElementById('mFind'); i.value = zSimList().find(s => s.w === 'sim:cr3d').t; i.dispatchEvent(new Event('change')); }); await pg.waitForTimeout(500);
ok(await pg.evaluate(() => ZS.node === 'laser' && !!document.querySelector('#hubpanel .zwin canvas')), 'step 6: the finder opens a simulation in place');
await pg.evaluate(() => { MS.path = []; MS.sel = null; go('zoom', 'machine'); }); await pg.waitForTimeout(250);
await pg.evaluate(() => { const i = document.getElementById('mFind'); i.value = 'שסתום הוואקום: מהבקר לאוויר'; i.dispatchEvent(new Event('change')); }); await pg.waitForTimeout(400);
ok(await pg.evaluate(() => MS.sel === 'valve'), 'step 6: the finder jumps to a topic in the machine');
ok(await pg.evaluate(() => { MS.sel = null; MS.machine = 'aoi'; mSelect('laser'); return MS.machine === 'aos' && /machine\?/.test(location.hash) && /sel=laser/.test(location.hash) && /m=aos/.test(location.hash); }), 'step 6: selecting an AOS part switches the machine and writes the address, through the hooks');
await pg.evaluate(() => go('about')); await pg.waitForTimeout(200);
ok(await pg.evaluate(() => { document.querySelector('.about [data-tour]').click(); const on = !!document.getElementById('ztour'); document.getElementById('ztClose').click(); return on; }), 'step 6: the about page starts the tour');
await pg.evaluate(() => { MS.sel = null; MS.path = []; });
/* stage 2, step 4: activity handles */
const badH = await pg.evaluate(() => { const bad = []; for (const w of ZOOM.flatMap(zWindows)) { const el = document.createElement('div'); document.body.appendChild(el); try { const h = zMount(w, el); if (!h || el.act !== h || ['getState', 'setState', 'pause', 'resume', 'destroy'].some(k => typeof h[k] !== 'function') || h.getState().v !== 1) bad.push(w); } catch (e) { bad.push(w + ': ' + e.message); } el.remove(); } return bad.slice(0, 6); });
ok(badH.length === 0, `step 4: every window returns an activity handle (not: ${badH.join(', ')})`);
await pg.evaluate(() => go('zoom', 'cam')); await pg.waitForTimeout(500);
ok(await pg.evaluate(() => { const el = document.querySelector('#hubpanel .zbody'); el.act.setState({ v: 1, step: 2, camera: [{ yaw: 1.1, pitch: 0.9, dist: 8 }] }); const c = el.querySelector('canvas')._V.st, s = el.act.getState(); return Math.abs(c.yaw - 1.1) < 1e-9 && Math.abs(c.pitch - 0.9) < 1e-9 && c.dist === 8 && s.step === '2' && s.camera[0].yaw === 1.1; }), 'step 4: a 3D scene\u2019s camera and step are read and set through its handle');
ok(await pg.evaluate(() => { const h = HS.snap; return Object.values(h).every(s => s.v === 1 && typeof s.w === 'string'); }), 'step 4: saved snapshots carry a version and their window');
/* stage 2, step 3: sections */
ok(await pg.evaluate(() => NODE_SECTIONS.map(s => s.id).join() === 'visit,path,crumb,title,seq,mastery,hub,children,seqend'), 'step 3: the topic page is the sections visit, path, crumb, title, its place in the book, mastery, hub, children, the next and previous in the book, in that order');
await pg.evaluate(() => go('zoom', 'relay')); await pg.waitForTimeout(250);
ok(await pg.evaluate(() => [...document.querySelector('.zmain').children].map(e => e.className.split(' ')[0] || e.tagName).join() === 'zpath,zsibs,zcrumb,H2,zseq,pth-node,hub,zring,ztiles,zseqend'), 'step 3: the topic page has the same elements in the same order as before, with its place in the book under the title and the next and previous in the book at the end');
await pg.evaluate(() => { document.querySelector('.zpath [data-zn="vac"]').click(); }); await pg.waitForTimeout(250);
ok(await pg.evaluate(() => ZS.node === 'vac'), 'step 3: a path button moves once, to that topic');
await pg.evaluate(() => { MS.path = []; MS.sel = null; go('zoom', 'machine'); mSetMachine('aoi'); }); await pg.waitForTimeout(250);
ok(await pg.evaluate(() => MSIDE.map(s => s.id).join() === 'visit,mexp,course,mwhole,inner,whole,part,line' && [...document.querySelectorAll('#mside .msec')].map(e => e.dataset.sec).join() === 'mexp,course,mwhole,whole'), 'step 3: the machine panel is a list of sections; with nothing selected: progress, the course, the machine\u2019s topics, the machine');
await pg.evaluate(() => mSelect('table')); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => [...document.querySelectorAll('#mside .msec')].map(e => e.dataset.sec).join() === 'part'), 'step 3: a selected part shows only its section');
await pg.evaluate(() => { MS.sel = null; mSide(); });
const built = await pg.evaluate(() => document.documentElement.outerHTML.length);
/* stage 2, step 2: views */
/* a view in the bar renders with its button current; a view outside it (group 'hidden', such as the backup page) renders the bar, so the way back is there, with no button current */
for (const v of await pg.evaluate(() => Object.keys(ZVIEW.views).filter(v => v !== 'node' && v !== 'level'))) { await pg.evaluate(v => go('zoom', v), v); await pg.waitForTimeout(120); const inBar = await pg.evaluate(v => ZVIEW.views[v].group !== 'hidden', v);
  ok(await pg.evaluate(([v, inBar]) => inBar ? !!document.querySelector(`.zsub [data-zv="${v}"][aria-current="page"]`) : !!document.querySelector('.zsub') && !document.querySelector('.zsub [aria-current="page"]'), [v, inBar]), `step 2: view ${v} renders with its bar` + (inBar ? '' : ' (outside the bar)')); }
await pg.evaluate(() => go('zoom', 'L2')); await pg.waitForTimeout(120); ok(await pg.evaluate(() => !!document.querySelector('.zsub') && document.querySelectorAll('.ztile').length > 0), 'step 2: a scale view renders with the bar');
/* stage 2, step 1: window kinds */
ok(await pg.evaluate(() => { const all = new Set(ZOOM.flatMap(zWindows)); return [...all].every(w => !!WIN.of(w)) && [...all].filter(w => w.startsWith('anim:')).every(w => WIN.of(w).id === 'anim') && [...all].filter(w => /^c:[^:]+:(parts|words|tryit|drills|say|full|schematic|numbers)$/.test(w)).every(w => WIN.of(w).id === 'sections') && WIN.of('t:cam:scene').id === 'base'; }), 'step 1: every window resolves to one kind, and the right one');
/* v2.36: report-driven corrections, four new animations, the graph, the seven levels */
const src = await pg.evaluate(() => ({ fid: TOPICS.find(t => t.id === 'aoi').steps.find(s => s.id === 'fid').what, home: TOPICS.find(t => t.id === 'aoi').steps.find(s => s.id === 'home').num, ff: TOPICS.find(t => t.id === 'cam').steps.find(s => s.id === 'ff').what }));
ok(/ארבעה בפינות/.test(src.fid) && /שלושה הם המינימום/.test(src.fid), 'accuracy: the registration story and the simulation agree on three as the minimum and four in the demo');
ok(/ערך להמחשה/.test(src.home), 'accuracy: the homing repeatability is marked as an illustration');
ok(/זה פישוט/.test(src.ff) && /תמונת חושך/.test(src.ff), 'accuracy: flat-field is called a simplification and mentions the dark frame');
await pg.evaluate(() => { MS.path = []; MS.sel = null; go('zoom', 'machine'); mSetMachine('aos'); }); await pg.waitForTimeout(200);
ok(await pg.evaluate(() => /הסרה בלבד/.test(document.getElementById('mside').textContent)), 'accuracy: the AOS demo says it is removal only');
await pg.evaluate(() => mSetMachine('aoi')); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => /בחירה של ההדגמה, לא הגדרה של AOI/.test(document.getElementById('mside').textContent)), 'accuracy: line-scan is the demo\u2019s choice, not the definition of AOI');
await pg.evaluate(() => mSetMachine('line')); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => /שני מסלולים שונים/.test(document.getElementById('mside').textContent) && !!document.querySelector('#mside [data-handoff]')), 'the line panel names the two paths and links to the handoff');
const N2 = await pg.evaluate(() => { const C = id => ANIMS[id].calc(Object.fromEntries(ANIMS[id].params.map(p => [p[0], p[5]]))); return { st: C('strobe'), na: C('na'), na2: ANIMS.na.calc({ NA: 0.4, lam: 0.5 }), na1: ANIMS.na.calc({ NA: 0.2, lam: 0.5 }), tl: C('tilt'), tlOk: ANIMS.tilt.calc({ zL: -10, zR: 10, NA: 0.25 }), h1: ANIMS.handoff.calc({ mode: 0, e: 2 }), h2: ANIMS.handoff.calc({ mode: 2, e: 5 }) }; });
ok(Math.abs(N2.st.duty - 0.2) < 1e-9 && Math.abs(N2.st.Ps - 3) < 1e-9 && Math.abs(N2.st.dTs - 1.5) < 1e-9 && Math.abs(N2.st.zs - 3.45) < 1e-6 && N2.st.okS && !N2.st.okC && Math.abs(N2.st.Pc / N2.st.Ps - 5) < 1e-9, 'strobe: 20% duty, 3 W, 1.5 °C, 3.45 µm in focus; continuous needs 5× the power and drifts out of the depth of field');
ok(Math.abs(N2.na1.r - 1.525) < 1e-3 && Math.abs(N2.na1.dof - 12.5) < 1e-9 && Math.abs(N2.na2.r * 2 - N2.na1.r) < 1e-9 && Math.abs(N2.na2.dof * 4 - N2.na1.dof) < 1e-9, 'NA: r = 1.525 µm and DOF = 12.5 µm as on the lens page; doubling NA halves r and quarters DOF exactly');
ok(Math.abs(N2.tl.theta - 0.6) < 1e-9 && Math.abs(N2.tl.edge - 9.6) < 1e-9 && !N2.tl.aligned && N2.tlOk.aligned, 'tilt: 0.6 mrad and 9.6 µm at the edge as on the tilt page; the default is misaligned, and a smaller shim difference aligns it');
ok(N2.h1.hit && !N2.h2.hit, 'handoff: a registration residual inside the example margin hits, outside it misses');
ok(await pg.evaluate(() => ['strobe', 'na', 'tilt', 'handoff'].every(id => WIN.of('anim:' + id).id === 'anim' && zWindows(zNode(ANIMS[id].node)).includes('anim:' + id)) && hubOf('anim:handoff') === 'flow' && hubOf('anim:strobe') === 'math'), 'the four new animations are windows of their topics, the handoff at the flow level');
await pg.evaluate(() => { ZG.q = ''; ZG.ctx = 'all'; go('zoom', 'sims'); }); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => zSimList().filter(s => s.kind === 'anim').length >= 14), 'the gallery lists all the animations');
/* the graph */
await pg.evaluate(() => go('zoom', 'world')); await pg.waitForTimeout(300);
ok(await pg.evaluate(() => document.querySelectorAll('.wcity').length === ZOOM.length && document.querySelectorAll('.wedges line').length > 20 && !!document.querySelector('.wmapwrap.wdark')), 'graph: a node for every topic, edges for "made of", a dark stage');
await pg.evaluate(() => document.querySelector('.wcity[data-zn="relay"]').dispatchEvent(new Event('pointerenter'))); 
ok(await pg.evaluate(() => document.querySelector('.wmap').classList.contains('dim') && document.querySelector('.wcity[data-zn="relay"]').classList.contains('hot') && document.querySelectorAll('.wcity.nb').length >= 3), 'graph: hovering a node lights it and its neighbours and dims the rest');
await pg.evaluate(() => document.querySelector('.wcity[data-zn="relay"]').dispatchEvent(new Event('pointerleave')));
await pg.fill('#wq', 'סליל'); ok(await pg.evaluate(() => document.querySelectorAll('.wcity.match').length >= 1 && document.querySelectorAll('.wcity.nomatch').length > 20), 'graph: search marks matches and dims the rest'); await pg.fill('#wq', '');
await pg.evaluate(() => document.querySelector('[data-wf="AOS"]').click()); ok(await pg.evaluate(() => document.querySelector('.wcity[data-zn="cam"]').classList.contains('off') && !document.querySelector('.wcity[data-zn="laser"]').classList.contains('off')), 'graph: the AOS filter hides AOI-only topics'); await pg.evaluate(() => document.querySelector('[data-wf="all"]').click());
/* the seven levels */
ok(await pg.evaluate(() => HUBS.map(h => h[0]).join() === 'show,flow,eng,math,rev,fault,integ' && ZOOM.every(z => zWindows(z).every(w => HUBS.some(h => h[0] === hubOf(w))))), 'levels: seven in the cone\u2019s order, and every window of every topic belongs to one');
await pg.evaluate(() => go('zoom', 'cam')); await pg.waitForTimeout(300);
ok(await pg.evaluate(() => [...document.querySelectorAll('.hubbtn b')].map(b => b.textContent.split('.')[0]).join('') === '0123456' && !!document.querySelector('.hubnext button')), 'levels: the camera shows 0 to 6 in order, with a continue-down button');
await pg.evaluate(() => document.querySelector('.hubnext button').click()); await pg.waitForTimeout(250);
ok(await pg.evaluate(() => document.querySelector('.hubbtn[aria-pressed="true"]').dataset.hub === 'flow'), 'levels: continue down goes to the next level');
await pg.evaluate(() => document.querySelector('.hubbtn[data-hub="integ"]').click()); await pg.waitForTimeout(200);
ok(await pg.evaluate(() => !document.querySelector('.hubnext')), 'levels: the last level has nothing below it');
/* v2.37: the AOI scan simulator and the vacuum-hold animation */
const SC = await pg.evaluate(() => ({ d: scanCalc(1200, 2, 5), bal: scanCalc(1200, 0.5, 5), fast: scanCalc(2000, 2, 5), coarse: scanCalc(1200, 0.5, 12) }));
ok(Math.abs(SC.d.f - 240) < 1e-9 && Math.abs(SC.d.b - 2.4) < 1e-9 && Math.abs(SC.d.frac - 0.48) < 1e-9 && Math.abs(SC.d.swath - 81.92) < 1e-9 && Math.abs(SC.d.area - 983.04) < 1e-6 && Math.abs(SC.d.panelS - 360000 / 98304) < 1e-9, 'scan: f = v/p = 240 kHz, b = v·t = 2.4 µm (48% of a pixel), swath 81.92 mm, 983 cm²/s, 3.66 s per panel');
ok(Math.abs(SC.d.tmax - 0.625) < 1e-9 && Math.abs(SC.d.vmax - 375) < 1e-9, 'scan: the 15% blur limit gives t ≤ 0.625 µs or v ≤ 375 mm/s');
ok(SC.bal.found.every(d => d.ok) && SC.bal.nFalse === 0 && SC.bal.frac <= 0.15, 'scan: the balanced default is inside the blur limit and finds all six defects with no false call');
ok(SC.fast.found.some(d => !d.ok) && SC.fast.nFalse > 0 && SC.coarse.found.filter(d => !d.ok).length >= 3, 'scan: too fast for the pulse misses a defect and raises false calls; a coarse pixel misses the small ones');
await pg.evaluate(() => zOpenWindow('proc', 'scan:aoi')); await pg.waitForTimeout(500);
ok(await pg.evaluate(() => { const a = document.querySelector('#hubpanel .zbody').scanApi; return a.state === 'idle' && a.flash === false && a.running === false && document.querySelector('[data-ss="flash"]').getAttribute('aria-pressed') === 'false'; }), 'scan: opens idle, nothing running, and the strobe glow is off until pressed');
await pg.evaluate(() => document.querySelector('[data-ss="start"]').click()); await pg.waitForTimeout(300);
ok(await pg.evaluate(() => { const a = document.querySelector('#hubpanel .zbody').scanApi; return a.state === 'run' && a.flash === false; }), 'scan: starting the scan does not turn the strobe glow on');
const rec = await pg.evaluate(() => { const a = document.querySelector('#hubpanel .zbody').scanApi; a.finish(); a.verdict.D1 = 'real'; a.verdict.D2 = 'real'; a.verdict.D6 = 'false'; const s = a.suspects(); return { n: s.length, r1: a.route(s.find(q => q.id === 'D1')), r2: a.route(s.find(q => q.id === 'D2')), r6: a.route(s.find(q => q.id === 'D6')), txt: a.record() }; });
ok(rec.n === 6 && /^AOS/.test(rec.r1) && /^לא ל-AOS/.test(rec.r2) && /התראת שווא/.test(rec.r6), 'scan: a verified short goes to laser removal, a verified open does not, a false call is closed');
ok(/bare-board copper only/.test(rec.txt) && /origin at fiducial F1/.test(rec.txt) && /registers to its own fiducials/.test(rec.txt) && !/solder paste|pick|SKEW|FPGA|deposition/i.test(rec.txt) && /x 262\.00 mm \| y 241\.50 mm/.test(rec.txt), 'scan: the record names its frame and scope, carries panel coordinates, and has no assembly-stage defects or repairs');
const CL = await pg.evaluate(() => ({ a: ANIMS.clamp.calc({ h: 0.8, z0: 1.6, C: VT.C }), b: ANIMS.clamp.calc({ h: 2, z0: 4, C: 3 }), h2: ANIMS.clamp.calc({ h: 1.6, z0: 1.6, C: VT.C }), vac: vacCalc().vac }));
ok(Math.abs(CL.a.dP - CL.vac) < 1e-9 && Math.abs(CL.a.qreq - 1.048576) < 1e-6 && CL.a.resid === 0 && CL.a.ok, 'clamp: the same ΔP as the vacuum model; 0.8 mm with a 1.6 mm bow needs 1.05 kPa and lies flat');
ok(Math.abs(CL.h2.qreq / CL.a.qreq - 8) < 1e-9, 'clamp: twice the thickness needs eight times the pressure (h³)');
ok(Math.abs(CL.b.qreq - 40.96) < 1e-6 && CL.b.resid > CL.b.half && !CL.b.ok && Math.abs(CL.b.resid - 4000 * (1 - CL.b.dP / 40.96)) < 1e-6, 'clamp: a thick, bowed panel on a leaking table keeps a bow larger than the depth of field');
ok(await pg.evaluate(() => zWindows(zNode('vac')).includes('anim:clamp') && zWindows(zNode('proc')).includes('scan:aoi') && hubOf('scan:aoi') === 'show' && zSimList().some(s => s.w === 'scan:aoi')), 'the scan simulator is a showcase window of the process and in the gallery; the clamp animation belongs to the vacuum table');
/* v2.38: the laser scan head in real-time 3D */
const SHT = await pg.evaluate(() => ({ k: shCalc(), w0: LZ.w0, z: shTrace(0, 0), a: shTrace(3, 0), b: shTrace(0, -2), c: shTrace(2, 3) }));
ok(Math.abs(SHT.k.w0 - SHT.w0) < 0.05 && Math.abs(SHT.k.field - 2 * 100 * 2 * 7.2 * Math.PI / 180) < 1e-9 && SHT.k.D === 3.75, 'scan head: w0 = 2λf/(πD) reproduces the laser model\'s 6 µm waist; field = 2·f·2θ = 50.3 mm');
ok(Math.abs(SHT.z.mm[0]) < 1e-9 && Math.abs(SHT.z.mm[1]) < 1e-9 && Math.abs(SHT.z.d2[1] + 1) < 1e-12, 'scan head: with both mirrors at rest the beam leaves straight down, onto the centre');
const d2r = Math.PI / 180;
ok(Math.abs(Math.abs(SHT.a.ax) - 6 * d2r) < 1e-12 && Math.abs(SHT.a.az) < 1e-12 && Math.abs(Math.abs(SHT.b.az) - 4 * d2r) < 1e-12 && Math.abs(SHT.b.ax) < 1e-12, 'scan head: a mirror turned by θ turns the beam by 2θ, each mirror on its own axis');
ok(Math.abs(SHT.c.mm[0] - 100 * SHT.c.ax) < 1e-12 && Math.abs(SHT.c.spot[0] - 10 * SHT.c.ax) < 1e-12 && Math.abs(SHT.c.P2[0]) > 0 && Math.abs(SHT.c.P3[1] + 4.7) < 1e-12, 'scan head: the drawn spot is f·θ of the traced ray, and the ray is traced through the second mirror to the lens plane');
await pg.evaluate(() => zOpenWindow('laserunit', '3d:scanhead')); await pg.waitForTimeout(1200);
const H3 = await pg.evaluate(async () => { const b = document.querySelector('#hubpanel .zbody'), h = b.fh3d; if (!h) return null; const wait = ms => new Promise(r => setTimeout(r, ms));
  const o = { parts: h.parts.join(), beam0: h.getState().beam }; h.setExplode(0, true); await wait(400); const f0 = h.frames; await wait(500); o.idle = h.frames - f0;
  h.setExplode(1, true); o.ex = h.getState().explode; h.setCamera('top', true); h.select('galvo_y'); const s1 = JSON.stringify(h.getState()); h.setState(JSON.parse(s1)); o.round = JSON.stringify(h.getState()) === s1; o.sel = h.getState().selected;
  o.info = document.querySelector('.fh3d-info h4').textContent; h.select(null); h.setExplode(0, true); h.setBeam(true); await wait(500); o.moving = h.frames; await wait(1500); o.moving = h.frames - o.moving; o.tr = h.trace().mm;
  const act = b.act.getState(); o.act = act.beam === true && act.v === 1; const host = document.querySelector('.fh3dhost'); h.destroy(); o.empty = host.children.length; const h2 = FH3D.mountScanHead(THREE, host, { reducedMotion: true }); await wait(300); const g0 = h2.frames; h2.setBeam(true); await wait(400); o.still = h2.frames - g0; o.a = Math.abs(h2.trace().mm[0]) + Math.abs(h2.trace().mm[1]); h2.destroy(); o.empty2 = host.children.length; return o; });
ok(H3 && H3.parts === 'housing,fiber_port,beam_expander,galvo_x,galvo_y,ftheta_lens,protective_window,camera_port,cable_bundle', 'scan head: nine named parts in optical order');
ok(H3 && H3.beam0 === false && H3.idle <= 1, 'scan head: the beam is off on open, and nothing is drawn while nothing changes');
ok(H3 && H3.ex === 1 && H3.round && H3.sel === 'galvo_y' && H3.info === 'מראה שנייה' && H3.act, 'scan head: explode, camera and selection round-trip through the state, and the window\'s activity handle carries it');
ok(H3 && H3.moving >= 2 && (Math.abs(H3.tr[0]) + Math.abs(H3.tr[1])) > 0, 'scan head: with the beam on the mirrors swing and the spot moves');
ok(H3 && H3.empty === 0 && H3.empty2 === 0 && H3.still <= 2 && H3.a < 1e-9, 'scan head: destroy leaves the container empty, it mounts again, and under reduced motion the mirrors stay still');
ok(await pg.evaluate(() => zWindows(zNode('laserunit')).includes('3d:scanhead') && hubOf('3d:scanhead') === 'show' && zSimList().some(s => s.w === '3d:scanhead') && typeof THREE === 'object' && THREE.REVISION === '159'), 'scan head: a showcase window of the laser unit, in the gallery; the 3D library is inlined at a pinned revision');
/* v2.39: the machine itself is drawn in real-time 3D, from the same camera the view uses */
const noAccel = await pg.evaluate(() => MS.gl == null);
await pg.evaluate(() => { FH3D.software = true; go('zoom', 'machine'); }); await pg.waitForTimeout(900);
const MG = await pg.evaluate(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)), o = { gl: !!MS.gl }; if (!MS.gl) return o; mSetMachine('aoi'); MS.rot = false; MS.assembling = false; MS.E = MS.target = 0.4; await wait(1800);
  const V = document.getElementById('mc')._V; o.err = Math.max(...[[0, 0, 0], [3, 2, 1], [-3, -2, 2.5], [4.6, 1.5, 2.6], [1, -2.6, 0.2]].map(p => { const a = V.proj([p[0] - MS.C[0], p[1] - MS.C[1], p[2] - MS.C[2]]), b = MS.gl.project(p); return Math.hypot(a[0] - b[0], a[1] - b[1]); }));
  let i = MS.gl.info(); o.aoi = i.built === 'm:aoi' && i.groups === mCopies().length && i.meshes > 100; MS.gl.render(); const f0 = MS.gl.info().frames; MS.gl.render(); MS.gl.render(); o.idle = MS.gl.info().frames - f0;
  mSelect('table'); await wait(500); i = MS.gl.info(); const L = Object.fromEntries(i.looks.map(l => [l[0], l])); o.sel = L.table[1] === 0 && L.cam[1] === 2 && L.door[2] === false; o.polys = MS.polys.length > 20 && !!mPickAt('table');
  mOpen('vac'); await wait(600); i = MS.gl.info(); o.inner = i.built === 'in:vac' && i.groups === INNER.vac.length; mUp(); mSelect(null); mSetMachine('line'); await wait(600); i = MS.gl.info(); o.line = i.built === 'm:line' && i.groups === mCopies().length + 2; mSetMachine('aoi'); await wait(300);
  const cv = document.getElementById('mc'), d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let k = 3; k < d.length; k += 4) if (d[k]) n++; o.top = n / (d.length / 4);
  /* v2.40: the machine at work */
  const btn = document.getElementById('mRun'); o.r0 = !MS.gl.running() && !btn.hidden && /סריקה/.test(btn.textContent) && !document.querySelector('.mrunhud:not([hidden])');
  const P = MS.gl.runPlan(), sc = scanCalc(1200, 0.5, 5); o.plan = Math.abs(P.swath - sc.swath * 3.2 / 600) < 1e-12 && Math.abs(P.passT - 2.6 / (3.2 / 600) / 1200 * 8) < 1e-9 && P.targets.join() === 'D1:short,D4:protrusion,D6:residue' && P.defects === 6;
  btn.click(); await wait(100); o.r1 = MS.gl.running() && btn.getAttribute('aria-pressed') === 'true';
  let r = MS.gl.runSeek(0.9 + P.passT + 0.55 + P.passT / 2); const looks = () => Object.fromEntries(MS.gl.info().pos.map(q => [q[0], q]));
  o.mid = /מעבר 2 מתוך 3/.test(r.status) && r.lit && !r.beam && Math.abs(r.cam) < 1e-9 && Math.abs(r.table - (-0.38 - P.yc[1])) < 1e-9 && r.prog[0] === 1 && Math.abs(r.prog[1] - 0.5) < 1e-9 && r.prog[2] === 0;
  let L2 = looks(); o.moved = Math.abs(L2.cam[1] - 0.65) < 1e-9 && Math.abs(L2.lens[1] - 0.65) < 1e-9 && Math.abs(L2.strobe[1] - 0.65) < 1e-9 && Math.abs(L2.table[2] - r.table) < 1e-9 && Math.abs(L2.panel[2] - r.table) < 1e-9 && L2.gantry[1] === 0 && L2.base[2] === 0;
  o.reach = [0, 1, 2].every(i => { const off = -0.38 - P.yc[i]; return -1.4 + off >= -2.2 && 1.4 + off <= 2.2; });
  o.labs = MS.gl.runLabels().join() === 'D2,D4,D5,D6'; r = MS.gl.runSeek(P.total - 2.0); o.labsEnd = MS.gl.runLabels().length === 6; MS.gl.runSeek(0.9 + P.passT + 0.55 + P.passT / 2);
  mSelect('table'); await wait(250); o.stopSel = !MS.gl.running() && btn.getAttribute('aria-pressed') === 'false'; mSelect(null); await wait(200);
  mSetMachine('aos'); await wait(500); o.aosBtn = /תיקון/.test(btn.textContent); btn.click(); await wait(100); const P2 = MS.gl.runPlan(); r = MS.gl.runSeek(1.2); o.reg = /רישום/.test(r.status) && r.flash && !r.beam;
  r = MS.gl.runSeek(1.0 + 0.5 + 1.0 + 0.5 + 1.0 + 0.5); o.fire = r.beam && /D1/.test(r.status) && r.fixed === 0; r = MS.gl.runSeek(P2.total - 1.5); o.labsFix = MS.gl.runLabels().join() === 'D1 ✓,D4 ✓,D6 ✓'; o.done = !r.beam && r.fixed === 3 && /חוסר נחושת לא מתוקן/.test(r.status); L2 = looks(); o.aosParts = Math.abs(L2.lsrc[1]) < 0.1 && Math.abs(L2.laser[1]) > 0.25;
  /* v2.43: the whole line */
  MS.gl.run(false); mSetMachine('line'); await wait(500); o.lineBtn = !btn.hidden && /הקו/.test(btn.textContent) && !MS.gl.running(); btn.click(); await wait(100); const PL = MS.gl.runPlan(), vis = () => Object.fromEntries(MS.gl.info().looks.map(q => [q[0] + (q[3] || ''), q[2]]));
  const at = t => MS.gl.runSeek(t), stages = [2, 8.6, 13.2, 16.6, 21].map(t => at(t).stage).join(); o.lineStages = stages === 'scan,carry,verify,carry2,repair'; r = at(8.6); o.lineOver = r.pan[2] > 2.5 && r.pan[0] > 0 && r.pan[0] < 7;
  r = at(2); o.lineA = r.lit && Math.abs(MS.Ct[0] + 7) < 1e-9 && r.pan[0] === 0; r = at(13.2); const labs = MS.gl.runLabels(); o.lineV = Math.abs(r.pan[0] - 7) < 1e-9 && Math.abs(MS.Ct[0]) < 1e-9 && r.verd === 6 && labs.filter(x => / · AOS$/.test(x)).map(x => x.slice(0, 2)).join() === 'D1,D4,D6' && labs.filter(x => /הנדסה/.test(x)).length === 3;
  r = at(PL.total - 1); o.lineB = Math.abs(r.pan[0] - 14) < 1e-9 && Math.abs(r.pan[2]) < 1e-9 && Math.abs(MS.Ct[0] - 7) < 1e-9 && r.fixed === 3 && !r.beam && /3 הוסרו בלייזר/.test(r.status) && MS.gl.runLabels().join() === 'D1 ✓,D4 ✓,D6 ✓';
  const pv = MS.gl.info().looks.filter(q => q[0] === 'panel').map(q => q[2]); o.lineHide = pv.length === 2 && pv.filter(Boolean).length === 1; MS.gl.run(false); await wait(200); o.lineBack = MS.gl.info().looks.filter(q => q[0] === 'panel').every(q => q[2]) && MS.Ct[0] === 0.5 && MS.distT === 24; mSetMachine('aoi'); await wait(300);

  go('about'); await wait(200); o.freed = MS.gl === null && !document.querySelector('.mgl'); const keepM = FH3D.machine; FH3D.machine = null; go('zoom', 'machine'); await wait(600); const c2 = document.getElementById('mc'), d2 = c2.getContext('2d').getImageData(0, 0, c2.width, c2.height).data; let n2 = 0; for (let k = 3; k < d2.length; k += 4) if (d2[k]) n2++; o.fallback = MS.gl === null && n2 / (d2.length / 4) > 0.08; FH3D.machine = keepM; go('zoom', 'machine'); await wait(500); o.back = !!MS.gl; FH3D.software = false; go('zoom', 'machine'); await wait(300); o.soft = MS.gl === null; return o; });
ok(MG.gl && MG.back && (!noAccel || MG.soft), 'machine 3D: the machine view runs on the real-time renderer, and a browser without graphics acceleration keeps the earlier drawing');
ok(MG.gl && MG.err < 0.5, 'machine 3D: the 3D camera puts every point where the view\'s own projection does (so names and clicks land on the parts)');
ok(MG.gl && MG.aoi && MG.idle === 0, 'machine 3D: one group per part of the machine, and nothing is drawn while nothing changes');
ok(MG.gl && MG.sel && MG.polys, 'machine 3D: a selected part stays solid, the others fade, the enclosure hides, and picking still works');
ok(MG.gl && MG.inner && MG.line, 'machine 3D: an opened part shows its inner parts, and the line shows both machines, the station and the way between them');
ok(MG.gl && MG.top < 0.05, 'machine 3D: the view\'s own canvas carries only the names over the 3D picture');
ok(MG.gl && MG.r0 && MG.r1, 'machine at work: nothing runs until the run button is pressed');
ok(MG.gl && MG.plan, 'machine at work: the swath is the scan model\'s, and the repair targets are exactly the excess-copper defects');
ok(MG.gl && MG.mid && MG.moved, 'machine at work: mid-scan the camera, lens and strobe ride the gantry together, the table and panel step together, and the frame stays');
ok(MG.gl && MG.reach, 'machine at work: every table position of the scan is inside the travel of the rails');
ok(MG.gl && MG.stopSel, 'machine at work: selecting a part stops the cycle');
ok(MG.gl && MG.aosBtn && MG.reg && MG.fire && MG.done && MG.aosParts, 'machine at work: the repair registers first, fires only over a target, ends with three removed, and the laser source stays on the gantry');
ok(MG.gl && MG.lineBtn && MG.lineStages, 'the line at work: one press runs scan, carry, verify, carry and repair, in that order');
ok(MG.gl && MG.lineA && MG.lineV && MG.lineB, 'the line at work: the panel is scanned at the AOI machine, verified at the station (excess copper to AOS, missing copper to engineering) and repaired at the AOS machine, and the view follows it');
ok(MG.gl && MG.lineOver, 'the line at work: between stations the panel is carried above the cabinet and the glass, not through them');
ok(MG.gl && MG.lineHide && MG.lineBack, 'the line at work: one panel travels (the AOS machine\'s own is hidden meanwhile), and stopping puts everything back');
ok(MG.gl && MG.labs && MG.labsEnd && MG.labsFix, 'machine at work: suspects are named as the line passes them, with labels that face the viewer, and repaired ones are ticked');
ok(MG.gl && MG.freed && MG.fallback, 'machine 3D: leaving the page frees the 3D context, and without 3D the earlier drawing still appears');
/* v2.41.1: a hovered part's name must not stay after the pointer leaves, and it is centred on its box */
await pg.evaluate(() => { FH3D.software = true; go('zoom', 'machine'); }); await pg.waitForTimeout(700);
ok(await pg.evaluate(async () => { MS.rot = false; MS.assembling = false; MS.E = MS.target = 0; mSelect(null); await new Promise(r => setTimeout(r, 300)); const cv = document.getElementById('mc'); MS.hover = 'gantry'; await new Promise(r => setTimeout(r, 120));
  const p = MPARTS.find(x => x.id === 'gantry'), c = mCenter(p), q = cv._V.proj([c[0] - MS.C[0], c[1] - MS.C[1], c[2] + 0.35 - MS.C[2]]), ctx = cv.getContext('2d'); ctx.font = '600 13px system-ui, sans-serif'; const w = ctx.measureText(p.t).width + 14;
  const dark = (x0, x1) => { const d = ctx.getImageData(Math.round(x0), Math.round(q[1] - 16), Math.max(1, Math.round(x1 - x0)), 14).data; let n = 0; for (let k = 0; k < d.length; k += 4) if (d[k + 3] > 200 && d[k] < 120) n++; return n; };
  const inside = dark(q[0] - w / 2 + 2, q[0] + w / 2 - 2), outside = dark(q[0] + w / 2 + 3, q[0] + w / 2 + 3 + w / 2); cv.dispatchEvent(new PointerEvent('pointerleave')); const r = inside > 20 && outside === 0 && MS.hover === null; FH3D.software = false; go('zoom', 'machine'); return r; }), 'machine view: the name of a hovered part sits inside its box, and leaves with the pointer');
/* v2.41: the topic object on the same renderer */
const HG = await pg.evaluate(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)), o = {}; FH3D.software = true; const transparent = cv => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let k = 3; k < d.length; k += 4) if (d[k]) n++; return n === 0; };
  go('zoom', 'vac'); await wait(500); let cv = document.querySelector('.hubobj'); o.inner = !!HS.gl && HS.gl.kind === 'inner' && HS.gl.parts === INNER.vac.length && transparent(cv) && document.querySelectorAll('canvas.mgl.hubgl').length === 1 && MS.gl === null;
  const V = cv._V; o.err = HS.gl ? Math.max(...[[0, 0, 0], [1, 0.5, 0.8], [-1, -1, -1]].map(q => { const a = V.proj(q), b = HS.gl.project(q); return Math.hypot(a[0] - b[0], a[1] - b[1]); })) : 9;
  HS.gl.render(); const f0 = HS.gl.frames(); HS.gl.render(); HS.gl.render(); o.idle = HS.gl.frames() - f0; V.st.yaw += 0.3; HS.gl.render(); o.turn = HS.gl.frames() - f0;
  const kinds = {}; for (const id of ZOOM.map(z => z.id)) { if (Object.keys(kinds).length === 4) break; const want = INNER[id] ? 'inner' : MPARTS.some(q => q.node === id) ? 'part' : Object.values(INNER).some(l => l.some(q => q.node === id)) ? 'one' : 'machine'; if (kinds[want]) continue; go('zoom', id); await wait(350); kinds[want] = HS.gl && HS.gl.kind === want && HS.gl.parts > 0 ? id : false; }
  o.kinds = ['inner', 'part', 'one', 'machine'].every(k => kinds[k]); o.one = document.querySelectorAll('canvas.mgl').length === 1;
  go('zoom', 'machine'); await wait(500); o.swap = !!MS.gl && HS.gl === null && document.querySelectorAll('canvas.mgl').length === 1 && !document.querySelector('canvas.hubgl'); go('zoom', 'vac'); await wait(400); o.back = !!HS.gl && MS.gl === null;
  go('about'); await wait(200); o.freed = HS.gl === null && !document.querySelector('canvas.mgl'); FH3D.software = false; go('zoom', 'vac'); await wait(400); const c2 = document.querySelector('.hubobj'); o.fallback = HS.gl === null && !transparent(c2); return o; });
ok(HG.inner && HG.kinds, 'topic object 3D: a topic with inner parts shows them spread out, and each of the four kinds of object is built (inner parts, machine part, single inner part, whole machine)');
ok(HG.err < 0.5 && HG.idle === 0 && HG.turn === 1, 'topic object 3D: the same camera as the earlier drawing, drawn only when the view changes');
ok(HG.one && HG.swap && HG.back, 'topic object 3D: one 3D canvas for the whole book, handed between the machine and the topic object');
ok(HG.freed && HG.fallback, 'topic object 3D: leaving lets go of it, and without accelerated 3D the earlier drawing appears');
/* v2.44: the world map in three dimensions, with every kind of link, and its two other views */
await pg.evaluate(() => go('zoom', 'world')); await pg.waitForTimeout(400);
const WM = await pg.evaluate(async () => { const o = {}, L = zLinks(), by = k => L.filter(e => e.k === k), has = (k, a, b) => L.some(e => e.k === k && ((e.a === a && e.b === b) || (e.a === b && e.b === a)));
  o.kinds = ZLINK_KINDS.every(([k]) => by(k).length > 0); o.made = by('made').length === new Set(ZOOM.flatMap(n => n.parts.map(p => [n.id, p].sort().join('~')))).size; o.clean = L.every(e => e.a !== e.b && zNode(e.a) && zNode(e.b));
  o.works = TOPICS.every(T => (T.integ[4] || []).every(x => !zTopicNode(x) || zTopicNode(x) === zTopicNode(T.id) || has('works', zTopicNode(T.id).id, zTopicNode(x).id))); o.fault = has('fault', 'cam', 'vac') && has('fault', 'servo', 'enc') && has('fault', 'safety', 'interlock'); o.nLinks = L.length;
  const A = zWorldLayout(), B = zWorldLayout(); o.same = JSON.stringify(A) === JSON.stringify(B); o.storeys = ZOOM.every(n => Math.abs(A[n.id][2] - ZW.z(n.level)) < 1e-12) && ZW.z(5) > ZW.z(4) && ZW.z(2) > ZW.z(1); o.apart = Math.min(...ZOOM.flatMap((n, i) => ZOOM.slice(i + 1).map(m => Math.hypot(A[n.id][0] - A[m.id][0], A[n.id][1] - A[m.id][1], A[n.id][2] - A[m.id][2])))) > 0.25;
  const kid = ZOOM.filter(n => n.parts.length).every(n => n.parts.every(p => zNode(p).level < n.level)); o.down = kid;
  const svg = document.querySelector('.wmap'), w = svg._w, lines = [...svg.querySelectorAll('.wedges line')]; o.lines = lines.length === L.length && ZLINK_KINDS.every(([k]) => svg.querySelectorAll('.wedges line.wk-' + k).length === by(k).length);
  document.getElementById('wRot').getAttribute('aria-pressed') === 'true' && document.getElementById('wRot').click(); const tr = () => svg.querySelector('.wcity[data-zn="relay"]').getAttribute('transform'), t0 = tr(), ord0 = [...svg.querySelectorAll('.wcity')].map(g => g.dataset.zn).join(); w.st.yaw += 2.4; w.place(); o.turn = tr() !== t0 && [...svg.querySelectorAll('.wcity')].map(g => g.dataset.zn).join() !== ord0;
  w.st.yaw = 0; w.st.pitch = 0; w.place(); const y = id => +svg.querySelector(`.wcity[data-zn="${id}"]`).getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/)[2]; o.up = y('proc') < y('cam') && y('cam') < y('trig') && y('relay') < y('coil');
  document.querySelector('[data-wk="fault"]').click(); o.kindOff = [...svg.querySelectorAll('.wedges line.wk-fault')].every(l => l.classList.contains('off')) && ![...svg.querySelectorAll('.wedges line.wk-made')].some(l => l.classList.contains('off')); document.querySelector('[data-wk="fault"]').click();
  svg.querySelector('.wcity[data-zn="cam"]').dispatchEvent(new Event('pointerenter')); o.light = ['vac', 'servo', 'trig', 'optics', 'reg', 'proc'].every(id => svg.querySelector(`.wcity[data-zn="${id}"]`).classList.contains('nb')); svg.querySelector('.wcity[data-zn="cam"]').dispatchEvent(new Event('pointerleave'));
  o.appx = [...ZAPPX].every(id => svg.querySelector(`.wcity.appx[data-zn="${id}"]`));
  document.querySelector('[data-wv="index"]').click(); const idx = document.querySelector('[data-ws="index"]'); o.index = !idx.hidden && document.querySelector('[data-ws="map"]').hidden && idx.querySelectorAll('details').length === 5 && idx.querySelectorAll('.wtop').length === ZOOM.length && new Set([...idx.querySelectorAll('.wtop')].map(b => b.dataset.zn)).size === ZOOM.length && idx.querySelectorAll('.wrow').length > 40;
  document.querySelector('[data-wv="spec"]').click(); const txt = document.querySelector('.wspec').textContent; o.spec = ZOOM.every(n => txt.includes('### ' + n.t)) && txt.includes(L.length + ' קשרים') && [5, 4, 3, 2, 1].every(l => txt.includes('## רמה ' + l)) && txt === zWorldSpec();
  document.getElementById('wCopy').click(); await new Promise(r => setTimeout(r, 300)); o.copy = document.getElementById('wCopied').textContent.length > 5; document.querySelector('[data-wv="map"]').click(); o.back = !document.querySelector('[data-ws="map"]').hidden; return o; });
ok(WM.kinds && WM.made && WM.clean && WM.works && WM.fault, 'world 3D: links of four kinds from the book\'s own data (made of, work together, a fault leads there, also taught through): ' + WM.nLinks + ' in all');
ok(WM.same && WM.storeys && WM.apart && WM.down, 'world 3D: every topic stands on the storey of its scale, parts below what they make, no two on top of each other, and the layout is the same every time');
ok(WM.lines && WM.turn && WM.up, 'world 3D: a line for every link, the map turns in space with nearer points drawn over farther ones, and higher scales are higher on the screen');
ok(WM.kindOff && WM.light && WM.appx, 'world 3D: a kind of link can be switched off, a point lights everything linked to it by any kind, and appendix topics are on the map and marked');
ok(WM.index && WM.spec && WM.copy && WM.back, 'world: the same map as a collapsible index (every topic once, with its links) and as a full text specification that can be copied');
/* v2.42: inner parts as what they are, and the enclosure yields to what is inside it */
const IK = await pg.evaluate(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)), o = {}; FH3D.software = true; go('zoom', 'machine'); await wait(600); MS.rot = false; MS.assembling = false; MS.E = MS.target = 0; await wait(900);
  const all = Object.entries(INNER).flatMap(([k, l]) => l.map(q => [k, q.t])), kind = MS.gl.innerKind; o.none = all.filter(([k, t]) => !kind(t)).map(q => q.join(':')); o.kinds = new Set(all.map(([k, t]) => kind(t))).size;
  o.map = kind('סליל') === 'coil' && kind('ממסר בטיחות') === 'relay' && kind('MOSFET דרייבר') === 'mosfet' && kind('כרטיס דרייבר (MOSFET)') === 'pcbFets' && kind('קבל סינון') === 'cap' && kind('שנאי') === 'transformer' && kind('מתג המיתוג והבקר') === 'pcb' && kind('מתג לחץ') === 'pswitch' && kind('גוף העדשה ותושבת הטיה') === 'lensMount' && kind('עדשה קדמית') === 'lensEl' && kind('ממסר שמפעיל אותו מהבקר') === 'relay';
  o.fit = MS.gl.innerFit(); const cv = document.getElementById('mc'), r = cv.getBoundingClientRect(), inside = (x, y, q) => { let c = false; for (let a = 0, b = q.length - 1; a < q.length; b = a++) if ((q[a][1] > y) !== (q[b][1] > y) && x < (q[b][0] - q[a][0]) * (y - q[a][1]) / (q[b][1] - q[a][1]) + q[a][0]) c = !c; return c; };
  let both = 0, wrong = 0, alone = 0; for (let gx = 0.1; gx < 0.95; gx += 0.06) for (let gy = 0.1; gy < 0.95; gy += 0.06) { const x = gx * cv.width, y = gy * cv.height, ids = new Set(MS.polys.filter(pl => inside(x, y, pl[0])).map(pl => pl[2])); cv.dispatchEvent(new PointerEvent('pointermove', { clientX: r.left + gx * r.width, clientY: r.top + gy * r.height, bubbles: true }));
    if (ids.has('door') && ids.size > 1) { both++; if (MS.hover === 'door') wrong++; } else if (ids.has('door') && MS.hover === 'door') alone++; } o.got = both + ' points over a part behind glass, ' + alone + ' over glass alone'; o.pick = both > 10 && wrong === 0; o.door = alone > 0; cv.dispatchEvent(new PointerEvent('pointerleave')); FH3D.software = false; go('zoom', 'machine'); return o; });
ok(IK.none.length === 0 && IK.kinds >= 40 && IK.map, 'inner parts: every inner part of every assembly has its own model (' + IK.kinds + ' kinds), chosen by its name' + (IK.none.length ? ': missing ' + IK.none.join(', ') : ''));
ok(IK.fit.bad.length === 0 && IK.fit.n >= 60, 'inner parts: each model stays within its part\'s box (' + IK.fit.n + ' parts)' + (IK.fit.bad.length ? ': ' + IK.fit.bad.join(', ') : ''));
ok(IK.pick && IK.door, 'machine view: pointing at a part inside the glass enclosure picks the part, not the enclosure (' + IK.got + ')');
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
