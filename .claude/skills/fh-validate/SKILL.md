---
name: fh-validate
description: Validation gate for the Fault Hunter learning system (this repo). Use it whenever you add or change anything under src/ (a simulation, a lab bench, a lesson, a principle, a fault scenario, a question, a number in the text), before every commit, push or artifact publish, and whenever the user says "בדוק", "תאמתי", "ולידציה", "האם זה נכון" or asks whether the material is accurate. It defines what "verified" means here (independent physics models, term audit, scenario audit, page crawl), runs all of it with one command, and says how to extend the checks so new content is covered too.
---

# fh-validate

The user is preparing for a technical interview and studies from this material. A wrong number or an undefined term is worse than a missing one, because they will repeat it in the interview. So "done" here means **checked by something independent of the code that produced it**, and reported with the real output.

## The one command

```bash
tests/run_all.sh                    # build + every suite
tests/run_all.sh models teach       # only some: build, verify, models, teach, scenarios
```

It prints one PASS/FAIL line per suite, the size of index.html, and the failure lines. Paste the summary lines into your reply. Never say "validated" or "בדוק" without a run after the last edit.

| Suite | File | What it proves |
|---|---|---|
| build | `build.sh` | `src/` concatenates into one `index.html` (order is in build.sh; a new file must be added there) |
| verify | `tests/verify.mjs` | `runVerify()` numbers and logic, then a crawl of every page and sub-page for JS errors, `NaN`, `undefined`, `Infinity` |
| models | `tests/validate_models.py` + `model_harness.js` | Every simulation readout matches a Python model written **from the physics**, over a grid |
| teach | `tests/teach_audit.mjs` | Every from-zero lesson defines every lexicon term it uses, inside the same lesson; every step has what / why / what you see |
| scenarios | `tests/scenario_audit.mjs` | Every fault scenario has a valid structure, a scoring path, a working learn link, and the teaching layer (`plain`, `hints`, `pi`) |

## What to do for each kind of change

Read `references/extending.md` for the exact code shapes. In short:

- **New or changed simulation / lab bench.** Add cases to `validate_models.py` with `add(id, state, [(expected, decimals), ...])`. For a lab bench, set `cases[-1]['lab'] = 'LAB_X'` or `'SENS_BENCH.k'`. Derive the expected value from the physics in Python. Do not port the JavaScript, because a ported bug agrees with itself. Cover the grid edges and every fault mode, not only the default state. If the page has a new nav, add it to the crawl in `verify.mjs`.
- **New number in text** (question, worked example, formula example). Add a `VERIFY` entry so `runVerify()` recomputes it. Re-derive it by hand once and show the derivation to the user if they asked for validation.
- **New lesson or new technical word.** Run `teach`. If a term is undefined, either define it in that lesson's words table or add it to `LEX` in `src/54-lexicon.js` as `[label, definition, aliases]`. Use a `=` alias for short words that occur inside other Hebrew words, as with קבל and מקבל.
- **New or rewritten fault scenario.** Run `scenarios`. Each one needs `plain`, at least 2 `hints`, a `mech` chain of 3 or more steps, and `pi`. `plain` explains the system from zero. `hints` go from a general principle to a specific measurement and never name the answer. `pi` is the index into `PRINCIPLES`. Then check the semantics by hand, because no script can: every wrong option must be contradicted by at least one test result; the key tests must be enough to reach the answer; and `why` must only use facts the tests revealed.
- **New constant or model assumption.** Tag it in the UI as an example or assumption, and list it in `VALIDATION.md` §4.

## When something fails

1. Read the failing line in the log, not just the summary. The path is printed at the end.
2. Decide which side is wrong: the simulation, the reference model, or the parser. Lab readouts have hit parser traps before: a Hebrew prefix hyphen, as in ב-4.4, read as a minus sign; and a phase lag shown as a negative number.
3. Fix the real cause. Do not widen a tolerance, delete a case, or relax an audit rule to make it pass. If a tolerance genuinely needs to change, say why in the reply and in VALIDATION.md.
4. Re-run the whole suite. A fix in one model can break a crawl page.
5. Record real defects you found in the corrections table in `VALIDATION.md` §3.

## Before commit and publish

- `tests/run_all.sh` passes, and you quote its lines.
- `VALIDATION.md` totals match the run (model checks, pages crawled, lessons, scenarios). Update `README.md` if a tab or test was added.
- Commit as `Eliaz Selam <eliaz.es1234@gmail.com>` with the session's attribution trailers. Never put a model identifier in a commit or file.
- Publish `index.html` to the existing artifact URL in README.md, not to a new one.

## How to report to the user

The user's style is Problem → Method → Result → Validation → Conclusion, in Hebrew, with a table. Give the suite lines as they printed. State what was **not** checked automatically (scenario semantics, wording, model idealizations such as no scope bandwidth or cable capacitance). Use "בדוק" only when every suite passed after the last change.
