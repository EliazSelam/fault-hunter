# Extending the checks

## Model case (tests/validate_models.py)

```python
# component or system: id from COMPONENTS / SYSTEMS, state overrides the control defaults
add('psu', {'I': 8, 'L': 15, 'A': 0.75}, [(2 * 8 * 0.0175 * 15 / 0.75, 2)])   # ΔV = 2·I·ρL/A, 2 decimals
add('servo', {'kp': 400, 'ki': 50, 'kd': 40}, [('os', ref_os), ('ts', ref_ts_ms)], sys_=True)
# lab bench: def expression evaluated in the page
add('hall', {'d': 4, 'pol': 'n'}, [(B, 1)]); cases[-1]['lab'] = 'SENS_BENCH.hall'
```

- Each expected item is `(value, decimals)`. It passes if some number in the readout equals `round(value, decimals)` within half a display digit, plus 0.1% for time-stepped models.
- The harness collects every number in `out.textContent`. An expected value can therefore pass by coincidence if the readout contains many numbers. Prefer values with enough digits, and check that the readout is not a long list.
- Signs: if the UI shows a lag as negative, the expected value is negative.
- A new model gets its own reference function near the top of the file, with a docstring that names the formula and its source.

## Text number (VERIFY)

`VERIFY` (defined in `src/39j-driver-questions-formulas-selfcheck.js`, extended with `VERIFY.push(...)` in `src/50-pcb-aoi.js` and `src/52-zero-components.js`) holds `[label, computed, expected, tolerance]`. `computed` is calculated from the inputs in code; `expected` is the value written in the text. `runVerify()` fails when they differ by more than the tolerance. Put new entries next to the content they check.

```js
VERIFY.push(['ZC psu ΔV 8A 15m 0.75mm²', 2 * 8 * 0.0175 * 15 / 0.75, 5.6, 0.01]);
```

## Lexicon term (src/54-lexicon.js)

```js
['Debounce', 'סינון קפיצות מגע: התעלמות משינויים קצרים מ-X ms אחרי שמגע נסגר', ['debounce', 'דיבאונס']],
['קבל', 'רכיב שאוגר מטען חשמלי...', ['=קבל', 'קבלים']],   // '=' : exact word only, no Hebrew prefix letters
```

## Scenario teaching layer

Attach fields by id (see `src/64-scenario-teach.js`):

```js
'L1-02': { pi: 0,            // index into PRINCIPLES (0-based)
  plain: 'מה החיישן עושה, מה הבקר מצפה לקבל, ולמה "נורית דולקת" לא אומרת שהאות הגיע.',
  hints: ['כלל: מודדים מהמקור והלאה. איפה האות עוד קיים, ואיפה הוא נעלם?',
          'מדוד בכניסת הבקר עם פאנל ובלי פאנל. מה אמור להשתנות?',
          'השווה את מה שכתוב על החיישן למה שכתוב בשרטוט.'] }
```

Add `mech`: 3–4 steps, cause → mechanism → effect → what you observe. The hints go from the principle, to where to look, to which measurement. The last hint still leaves the conclusion to the reader.

## Crawl (tests/verify.mjs)

For a new hub with sub-pages, add a loop `for (const sub of await pg.evaluate('X_NAV.map(n=>n[0])')) { await pg.evaluate(\`go('x','${sub}')\`); await chk('x:' + sub); }`.
