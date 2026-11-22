#!/usr/bin/env bash
# Build, then run every check. Exit code is non-zero if any suite fails.
# Usage: tests/run_all.sh            (all suites)
#        tests/run_all.sh models     (only the named suites: build, verify, models, teach, scenarios, figures, terms, topics, map, zoom, sims, path, book, labs, backup, textbook, math, toc, live, progress, find, rtl, maps)
set -u
cd "$(dirname "$0")/.."
OUT="${VALIDATE_OUT:-$(mktemp -d)}"; export VALIDATE_OUT="$OUT"
want() { [ $# -eq 0 ] && return 0; for a in $SEL; do [ "$a" = "$1" ] && return 0; done; return 1; }
SEL="${*:-build verify models teach scenarios figures terms topics map zoom sims path book labs backup textbook math toc live progress find rtl maps}"
declare -a RES; FAIL=0
run() { local name="$1"; shift; if want "$name"; then
  "$@" > "$OUT/$name.log" 2>&1; local rc=$?
  RES+=("$( [ $rc -eq 0 ] && echo PASS || echo FAIL ) $name: $(tail -n 3 "$OUT/$name.log" | grep -v '^\s*$' | grep -v '^FAIL\|^✗\|^PROBLEMS\|^  ' | tail -n 1)")
  [ $rc -ne 0 ] && FAIL=1; fi; }
run build ./build.sh
if [ $FAIL -ne 0 ]; then echo "FAIL build: $(tail -n 5 "$OUT/build.log")"; exit 1; fi
run verify node tests/verify.mjs
run models python3 tests/validate_models.py
run teach node tests/teach_audit.mjs
run scenarios node tests/scenario_audit.mjs
run figures node tests/figures_audit.mjs
run terms node tests/terms_audit.mjs
run topics node tests/topics_audit.mjs
run map node tests/master_map.mjs
run zoom node tests/zoom_audit.mjs
run sims node tests/sims_audit.mjs
run path node tests/path_audit.mjs
run book node tests/book_audit.mjs
run labs node tests/labs_audit.mjs
run backup node tests/backup_audit.mjs
run textbook node tests/textbook_audit.mjs
run math node tests/math_audit.mjs
run toc node tests/toc_audit.mjs
run live node tests/hxsim_audit.mjs
run progress node tests/progress_audit.mjs
run find node tests/find_audit.mjs
run rtl node tests/rtl_audit.mjs
run maps node tests/maps_audit.mjs
printf '%s\n' "${RES[@]}"
echo "index.html: $(wc -c < index.html) bytes · logs: $OUT"
if [ $FAIL -ne 0 ]; then echo "---- failures"; grep -h "^FAIL\|^✗\|^  " "$OUT"/*.log | head -60; exit 1; fi
echo "ALL SUITES PASSED"
