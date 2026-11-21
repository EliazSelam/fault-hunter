/* ============ Terms of the extra hubs: one definition per term, where each is explained, and its category ============ */
TERM_CATS.splice(TERM_CATS.indexOf('מכונות והספק'), 0, 'אלגוריתמים ונתונים');
{ const HCAT = { fit: 'אלגוריתמים ונתונים', img: 'אלגוריתמים ונתונים', stat: 'אלגוריתמים ונתונים', sig: 'בקרה ותנועה', rel: 'בטיחות ותקנים' };
  const inLex = k => LEX.some(e => e[0].toLowerCase() === k.toLowerCase() || e[2].some(a => a.replace(/^=/, '').toLowerCase() === k.toLowerCase()));
  Object.entries(HXTERMS).forEach(([k, hub]) => { if (hub === '_') return;
    if (inLex(k) && !HXDUP.includes(k)) { delete GLOSS[k]; delete GSHORT[k]; }   /* the lexicon already defines it: keep one definition */
    const H = HUBX[hub], page = H.nav.map(n => n[0]).find(id => H.pages[id] && !['lab', 'q'].includes(id) && H.pages[id]().includes(k));
    if (!TERM_LINK[k]) TERM_LINK[k] = hub + '/' + (page || H.nav[0][0]);
    if (!TERM_CAT[k] && !HXDUP.includes(k)) TERM_CAT[k] = HCAT[hub];
  });
}
