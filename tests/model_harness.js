// Hebrew prefix + hyphen (ב-4.4) is not a minus sign, so it is turned into a space before parsing.
// Runs component/system simulations over a parameter grid and records every number in the readout.
const { chromium } = require('playwright'); const fs = require('fs');
const cases = JSON.parse(fs.readFileSync(process.argv[2]));
(async () => { const b = await chromium.launch(); const p = await b.newPage();
await p.goto(require('url').pathToFileURL(require('path').resolve(__dirname, '..', 'index.html')).href); await p.waitForTimeout(400);
const res = await p.evaluate(cases => cases.map(cs => {
  const def = cs.lab ? eval(cs.lab) : cs.sys ? SYSTEMS.find(x => x.id === cs.id) : COMPONENTS.find(x => x.id === cs.id);
  const s = {}; (def.controls || []).forEach(c => s[c.id] = c.val); if (def.init) def.init(s); Object.assign(s, cs.s);
  const st = document.createElement('div'), out = document.createElement('div');
  def.render(s, st, out);
  const txt = out.textContent.replace(/([\u0590-\u05FF])-(?=\d)/g, '$1 '); const nums = (txt.replace(/−/g, '-').match(/-?\d+(\.\d+)?/g) || []).map(Number);
  return { ...cs, txt, nums };
}), cases);
fs.writeFileSync(process.argv[3], JSON.stringify(res)); await b.close(); })();
