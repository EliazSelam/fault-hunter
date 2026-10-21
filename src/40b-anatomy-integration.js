/* ============ Anatomy figures: the circuit as a live machine ============ */
const ANAT_INFO = {
  relay: { he: 'המעגל של השאלה, כמכונה חיה: הזז את העכבר לרוחב הכרטיס כדי לשנות את V_G, וראה מתי הממסר נמשך, מתי הנורה נדלקת, ומתי ה-MOSFET מתחמם.', q: ['Q21', 'Q64', 'Q65', 'Q66'] },
  linescan: { he: 'מצלמת line-scan על מסוע: הזז את העכבר כדי לשנות את מהירות הסרט, והחלף בין טריגר מאנקודר לטריגר משעון (Enter או הכפתור). עם אנקודר, התמונה נשארת עגולה בכל מהירות. עם שעון, היא נמתחת או מתכווצת.', q: ['Q34', 'Q38', 'Q58'] }
};
function anatBlock(id) {
  return `<div class="anat" data-anat="${id}"><p class="anatcap"><b>נסה בעצמך.</b> ${ANAT_INFO[id].he}</p><div class="anatframe"></div><p class="anatcredit">איור אינטראקטיבי שנבנה עם הסקיל Anatomy (MIT). הערכים הם דוגמה.</p></div>`;
}
function mountAnat(root) {
  (root || document).querySelectorAll('.anat:not([data-mounted])').forEach(box => {
    box.setAttribute('data-mounted', '');
    const f = document.createElement('iframe');
    f.title = 'MOSFET drives a relay'; f.loading = 'lazy'; f.setAttribute('scrolling', 'no');
    f.srcdoc = ANATOMY_HTML[box.dataset.anat];
    f.addEventListener('load', () => {
      try {
        const d = f.contentDocument, root = document.documentElement;
        const light = root.getAttribute('data-theme') === 'light' || (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: light)').matches);
        d.body.setAttribute('data-theme', light ? 'light' : 'dark');
        const page = d.querySelector('.iso-page'); if (page) page.style.margin = '8px auto';
        const fit = () => { f.style.height = d.documentElement.scrollHeight + 'px'; };
        fit(); new ResizeObserver(fit).observe(d.body);
      } catch (e) { }
    });
    box.querySelector('.anatframe').appendChild(f);
  });
}
(function () {
  const _af = ansFig;
  ansFig = function (q) { const id = Object.keys(ANAT_INFO).find(k => ANAT_INFO[k].q.includes(q.id)); return _af(q) + (id ? anatBlock(id) : ''); };
  const COMP_FIG = { relay: ['relay', 'המעגל כמכונה'], linescan: ['linescan', 'הסריקה כמכונה'] };
  const _s1 = showS1;
  showS1 = function (id) { _s1(id); const cid = id || COMPONENTS[0].id; const f = COMP_FIG[cid]; if (f) { const sec = document.getElementById('comp'); if (sec) sec.insertAdjacentHTML('beforeend', '<h3>' + f[1] + '</h3>' + anatBlock(f[0])); } mountAnat(content); };
  new MutationObserver(() => { if (content.querySelector('.anat:not([data-mounted])')) mountAnat(content); }).observe(content, { childList: true, subtree: true });
})();
