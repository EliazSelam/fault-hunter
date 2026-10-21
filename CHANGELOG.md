# Changelog

Versions follow [Semantic Versioning](https://semver.org/): MAJOR.MINOR.PATCH.

## [1.2.0] — 2026-10-21

- Second live figure: a line-scan camera on a conveyor, showing why the trigger must come from the encoder and not a clock. Switch the source and the belt speed; the captured image stays round with the encoder and stretches or squashes with the clock. Shown in questions Q34, Q38, Q58 and on the line-scan component page.
- Both figures passed the Anatomy line-end check (0 floating ends) in light and dark themes.

## [1.1.0] — 2026-10-19

- First live figure built with the Anatomy skill: a relay bench driven by a MOSFET, shown in questions Q21, Q64, Q65, Q66 and on the relay component page.
- `figures/` with the build script, the vendored Anatomy kit (MIT) and `THIRD_PARTY_NOTICES.md`.
- Self-check ignores embedded figure frames when scanning pages.

## [1.0.0] — 2026-10-18 — first public release

Consolidates the development iterations below into the first public version.

- Learning path, foundations, digital logic, components, optics, boards, systems, integrated machine, technical test, fault challenge, standards and interview prep.
- 79 questions (45 with solution schematics), 37 faults, 225 glossary entries.
- Automated self-check (numbers, logic, page crawl) and GitHub Actions for verification and Pages deployment.
- Version number in the footer, and deep links for every page.

## Development iterations (before 1.0.0)

| Iteration | Change |
|---|---|
| 0.14 | Digital logic hub, interview-style driver questions with full schematics, formulas for every component and system, built-in self-check |
| 0.13 | Separate tabs for boards (investigation and failure analysis) and optics |
| 0.12 | Board library: 7 real board types |
| 0.11 | Solution schematics in answers |
| 0.10 | Technical-test question bank |
| 0.9 | Electronic boards: six-step system, test bench, board faults |
| 0.8 | Plain-language layer and simple/full mode |
| 0.7 | Learning path, system intros before faults, inline definitions, failure principles |
| 0.6 | Schematic set with cross-references, level-0 faults, balanced answer options |
| 0.5 | Mechanical drawing from zero and glossary |
| 0.4 | Foundations: reading schematics from zero |
| 0.3 | Fault challenge with downtime scoring |
| 0.1–0.2 | Components, systems, integrated machine, standards |
