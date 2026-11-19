/* the formula box of a node as a window of the math level (the boxes are in 71d) */
WIN.add({ id: 'formk', test: w => /^f:/.test(w), info: w => ({ kind: 'formulas', t: 'נוסחאות: ' + (FORMT[w.slice(2)] || w.slice(2)) }), mount: (w, el) => { el.innerHTML = formBox(w.slice(2)); } });
