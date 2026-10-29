# Contributing

Edit files in `src/`, then run `tests/run_all.sh`. A change is ready when it prints `ALL SUITES PASSED`. A new file must also be added to `build.sh`.

## Adding a fault (challenge)

Push an object to `SCN` (see `src/30-scenarios.js`, `src/39d-boards.js` and `src/50-pcb-aoi.js` for examples; the teaching layer for each fault lives in `src/64-scenario-teach.js`):

```js
{ id: 'L2-09', lvl: 2, area: 'אופטיקה', title: 'כותרת קצרה',
  sys: 's2:vac',            // where the background explanation lives
  pr: 'timing',             // failure principle (see PRIN)
  exp: 'מה היה אמור לקרות',
  ctx: 'מה קורה בפועל ומה השתנה לאחרונה',
  sym: ['מה המפעיל אומר', 'Alarm: ...'],
  tests: [['שם הבדיקה', 5, 'מה רואים', 1],   // 1 = part of the efficient path
          ['בדיקה שלא מקדמת', 30, 'אין שינוי', 0]],
  opts: ['התשובה הנכונה', 'מסיח', 'מסיח', 'מסיח'], a: 0,   // shuffled on screen; keep the correct one NOT the longest
  why: 'מה הכריע', ver: 'איך מאמתים שהתיקון הצליח',
  fix: ['Corrective', 'Preventive'], learn: ['s2', 'vac'] }
```

## Adding a question (technical test)

Push an object to `QB` (see `src/39e-question-bank.js`). If it involves numbers, add a line to `VERIFY` in `src/39j-driver-questions-formulas-selfcheck.js` so the self-check recomputes it. A solution schematic goes in `AF` with the question id as key.

## Rules for content

1. Explain what a system is for before any fault.
2. Explain every new term on first appearance, in words that are already defined.
3. Tag values as example, model assumption or equipment-dependent. Never invent equipment data.
4. Show the causal chain from the root cause to what the operator sees.
