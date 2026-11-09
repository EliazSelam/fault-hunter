#!/usr/bin/env bash
# Build, then run every check. Exit code is non-zero if any suite fails.
# Usage: tests/run_all.sh            (all suites)
#        tests/run_all.sh models     (only the named suites: build, verify, models, teach, scenarios, figures, terms, topics, map)
set -u
cd "$(dirname "$0")/.."
OUT="${VALIDATE_OUT:-$(mktemp -d)}"; export VALIDATE_OUT="$OUT"
want() { [ $# -eq 0 ] && return 0; for a in $SEL; do [ "$a" = "$1" ] && return 0; done; return 1; }
SEL="${*:-build verify models teach scenarios figures terms topics map}"
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
printf '%s\n' "${RES[@]}"
echo "index.html: $(wc -c < index.html) bytes · logs: $OUT"
if [ $FAIL -ne 0 ]; then echo "---- failures"; grep -h "^FAIL\|^✗\|^  " "$OUT"/*.log | head -60; exit 1; fi
echo "ALL SUITES PASSED"
