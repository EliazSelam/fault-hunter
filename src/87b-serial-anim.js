/* ============ Serial communication: animation of the UART sampling error (v2.63) and its place in the 3D machine ============ */
ANIMS.baud = { node: 'serial', t: 'UART: שגיאת קצב והדגימה שזזה',
  params: [['err', 'שגיאת קצב במקלט Δ', -8, 8, 0.1, 3, '%']],
  calc: P => { const d = P.err / 100, k = 9, shift = d * (k + .5), lim = .5 / (k + .5) * 100; return { d, shift, lim, ok: Math.abs(shift) < .5 }; },
  steps: [(P, V) => `המקלט מתחיל לספור מקצה ה-START ודוגם כל ביט באמצעו: אחרי k + ½ זמני ביט (START הוא k = 0).`,
    (P, V) => `שעון המקלט שונה ב-Δ = <b>${P.err}%</b>, ולכן הדגימה של ביט k זזה ב-Δ · (k + ½) זמני ביט.`,
    (P, V) => `ביט ה-STOP הוא k = 9 ב-8N1. הזזה שם: Δ · 9.5 = <b>${(V.shift).toFixed(2)}</b> ביט.`,
    (P, V) => `הדגימה חייבת להישאר בתוך הביט, כלומר פחות מחצי ביט: ${V.ok ? '<b>נקרא נכון</b>' : '<b>נדגם בביט הלא נכון</b>'}. הגבול: Δ &lt; 0.5 / 9.5 = <b>${V.lim.toFixed(2)}%</b>.`],
  draw(ctx, W, H, P, V, s) {
    const f = uartFrame(0x41, 8, null, 1), bits = f.bits.slice(1, 11), bw = (W - 80) / 10, x0 = 40, y1 = 90, y0 = 150;
    ctx.strokeStyle = AC.ink; ctx.lineWidth = 2; ctx.beginPath(); bits.forEach((b, i) => { const y = b ? y1 : y0; if (i === 0) ctx.moveTo(x0, y); else ctx.lineTo(x0 + i * bw, y); ctx.lineTo(x0 + (i + 1) * bw, y); }); ctx.stroke();
    ctx.lineWidth = 1; ctx.strokeStyle = AC.tint; for (let i = 0; i <= 10; i++) { ctx.beginPath(); ctx.moveTo(x0 + i * bw, 60); ctx.lineTo(x0 + i * bw, 220); ctx.stroke(); }
    ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.textAlign = 'center'; ['START', 'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'STOP'].forEach((t, i) => ctx.fillText(t, x0 + (i + .5) * bw, 52));
    if (s >= 1) for (let k = 0; k < 10; k++) { const x = x0 + (k + .5) * (1 + V.d) * bw, bad = Math.floor((k + .5) * (1 + V.d)) !== k; ctx.fillStyle = bad ? AC.mech : AC.live; ctx.beginPath(); ctx.arc(x, 185, 5, 0, 7); ctx.fill(); ctx.strokeStyle = bad ? AC.mech : AC.live; ctx.beginPath(); ctx.moveTo(x, 185); ctx.lineTo(x, k < 10 && bits[Math.max(0, Math.min(9, Math.floor((k + .5) * (1 + V.d))))] ? y1 : y0); ctx.stroke(); }
    ctx.fillStyle = AC.text; ctx.textAlign = 'left'; ctx.fillText('sample points of the receiver (brown = wrong bit)', x0, 215); if (s >= 3) ctx.fillText(`STOP sample shift: ${V.shift.toFixed(2)} bit · limit ±0.5 bit`, x0, 245);
  } };
{ const n = zNode('serial'); if (n && !n.around.includes('anim:baud')) n.around.unshift('anim:baud'); }
INNER.ecat.push(IB('serial', 'פורטי שירות (UART) ושבב CAN', [-0.9, -0.55, -0.3, 0.3, 0, 0.15], [-1.0, 0, 0], 'text'));
