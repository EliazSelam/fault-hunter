#!/usr/bin/env bash
# Builds a single self-contained index.html from src/.
set -euo pipefail
cd "$(dirname "$0")"
{
  cat src/00-shell.html
  echo '<script>'
  cat src/10-components.js src/11-components-optics-power.js src/12-aoi-components.js src/20-systems.js src/30-scenarios.js \
      src/35-foundations.js src/36-mechanical-drawing.js src/38-level0-and-schematic-set.js \
      src/37-glossary.js src/39a-principles-intros-definitions.js src/39b-systems-path-challenge.js \
      src/39c-plain-language.js src/39d-boards.js src/39e-question-bank.js src/39f-solution-schematics.js \
      src/39g-board-library.js src/39h-boards-and-optics-hubs.js src/39i-digital-logic.js \
      src/39j-driver-questions-formulas-selfcheck.js src/50-pcb-aoi.js src/51-zero.js src/52-zero-components.js src/53a-teach-electrical.js src/53b-teach-mech-optics.js src/54-lexicon.js src/55-teach-systems.js src/56-motors.js src/57-power-machines.js src/58-terms.js src/59-3d.js src/66-topics.js src/67-topic-levels.js src/68-topics-more.js src/69-topic-camera.js src/70-structure.js src/71-topics-pwr-ecat.js src/72-subjects.js src/73-master-map.js src/74-cone.js src/75-syllabus.js src/76-syllabus-ui.js src/65-nav.js src/60-lab-dmm.js src/61-lab-scope.js src/62-lab-sensors.js src/63-lab-hub-principles.js src/64-scenario-teach.js src/40-app.js src/42-anatomy.js src/41-version-and-links.js
  echo '</script></body></html>'
} > index.html
echo "Built index.html ($(wc -c < index.html) bytes)"
