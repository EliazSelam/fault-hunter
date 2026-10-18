#!/usr/bin/env bash
# Builds a single self-contained index.html from src/.
set -euo pipefail
cd "$(dirname "$0")"
{
  cat src/00-shell.html
  echo '<script>'
  cat src/10-components.js src/11-components-optics-power.js src/20-systems.js src/30-scenarios.js \
      src/35-foundations.js src/36-mechanical-drawing.js src/38-level0-and-schematic-set.js \
      src/37-glossary.js src/39a-principles-intros-definitions.js src/39b-systems-path-challenge.js \
      src/39c-plain-language.js src/39d-boards.js src/39e-question-bank.js src/39f-solution-schematics.js \
      src/39g-board-library.js src/39h-boards-and-optics-hubs.js src/39i-digital-logic.js \
      src/39j-driver-questions-formulas-selfcheck.js src/40-app.js src/41-version-and-links.js
  echo '</script></body></html>'
} > index.html
echo "Built index.html ($(wc -c < index.html) bytes)"
