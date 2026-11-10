/* ============ Everything around the machine: the last topics become parts, the machine leads, the rest are appendices ============ */
/* the servo drive in the cabinet holds the control loop; the transmission, brake and drive open further */
MPARTS.push({ id: 'drive', node: 'loop', t: 'דרייבר הסרבו', boxes: [[3.5, 3.9, -0.1, 0.5, 0.2, 0.8, 'ink']], ex: [4.2, 0.3, 0.3].map(v => v * 1.5) });
Object.assign(INNER, {
  loop: [IB('loop', 'בקר ה-PID', [-0.5, 0.5, -0.3, 0.3, 0.3, 0.6], [0, 0, 0.7], 'live'), IB('pwm', 'גשר H ו-PWM', [-0.5, 0.5, -0.3, 0.3, -0.1, 0.2], [0, -0.9, 0]), IB('enc', 'כניסת האנקודר', [0.7, 1.0, -0.15, 0.15, 0, 0.3], [0.9, 0, 0], 'text'), IB('motor', 'יציאה למנוע', [-1.0, -0.7, -0.15, 0.15, 0, 0.3], [-0.9, 0, 0], 'mech')],
  pwm: [IB('mosfet', 'ארבעת טרנזיסטורי הגשר', [-0.6, 0.6, -0.15, 0.15, 0, 0.3], [0, 0, 0.7]), IB('pwm', 'מחולל ה-PWM', [-0.3, 0.3, 0.4, 0.6, 0, 0.2], [0, 0.8, 0], 'live')],
  trans: [IB('trans', 'בורג כדורי', [-1.2, 1.2, -0.08, 0.08, -0.08, 0.08], [0, 0, 0], 'text'), IB('trans', 'אום כדורים', [-0.2, 0.2, -0.2, 0.2, -0.2, 0.2], [0, 0, 0.8], 'ink'), IB('fits', 'מיסבים והתאמות', [1.25, 1.45, -0.25, 0.25, -0.25, 0.25], [0.8, 0, 0], 'mech')],
  brake: [IB('coil', 'סליל הבלם', [-0.4, 0.4, -0.1, 0.1, -0.4, 0.4], [0, 0, 0.7], 'mech'), IB('brake', 'דיסקת חיכוך וקפיצים', [-0.45, 0.45, 0.2, 0.3, -0.45, 0.45], [0, 0.8, 0], 'text')]
});
/* the whole machine also has two topics of its own: the cycle it runs and the way it is brought up */
const _mSide80 = mSide;
mSide = function () {
  _mSide80();
  const S = $('#mside'); if (!S || MS.sel || MS.path.length) return;
  S.insertAdjacentHTML('afterbegin', `<div class="mwhole"><p class="kb">המכונה כולה</p><p><button type="button" class="zgo" data-zn="proc">המחזור: סריקה, מציאה ותיקון ←</button></p><p><button type="button" class="zgo" data-zn="bringup">הפעלה ראשונה, ATP ושטח ←</button></p></div>`);
  S.querySelectorAll('.mwhole [data-zn]').forEach(b => b.addEventListener('click', () => { ZS.dir = 1; go('zoom', b.dataset.zn); }));
};
/* every topic of the machine is reachable inside the 3D machine */
function mReach() {
  const got = new Set(['proc', 'bringup']), open = [];
  MPARTS.forEach(p => { if (p.node) { got.add(p.node); open.push(p.node); } });
  while (open.length) { const n = open.pop(); (INNER[n] || []).forEach(ip => { if (!got.has(ip.node)) { got.add(ip.node); open.push(ip.node); } }); }
  return { got, missing: ZOOM.filter(z => !ZAPPX.has(z.id) && !got.has(z.id)).map(z => z.id) };
}
/* appendices: no old indexes, only what is outside the machine and what serves the whole book */
const ZRES_SHOWN = ZRES.filter(([r]) => !['p:path', 'p:topic', 'p:about'].includes(r));
zAppxView = (function (orig) { return function () { orig(); const tiles = content.querySelectorAll('.ztile[data-route]'); tiles.forEach(t => { if (!ZRES_SHOWN.some(([r]) => r.slice(2) === t.dataset.route)) t.remove(); }); }; })(zAppxView);
