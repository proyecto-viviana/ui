#!/usr/bin/env bash
# Walks the ci:release-readiness legs that do NOT depend on `build`, one at a
# time, recording each exit code and duration. Run against a committed tree:
# a red from a leg run mid-edit carries no information (see the __dbg.test.tsx
# note in the conductor record).
#
# Excluded on purpose:
#   build           — writes dist/ inside the writer's checkout
#   typecheck:apps  — apps resolve @proyecto-viviana/* to ./dist/*.d.ts, so it
#                     is build-dependent; it belongs to whoever runs build
set -u
cd "$(dirname "$0")/../.." || exit 1
OUT="$(dirname "$0")"
BASE=$(git rev-parse --short HEAD)
echo "tree: $BASE  started: $(date -Is)"
echo "dirty under packages|scripts: $(git status --porcelain packages/ scripts/ | wc -l)"
echo

for leg in "$@"; do
  start=$(date +%s)
  log="$OUT/leg-${leg//:/-}.out.txt"
  timeout 1800 vp run "$leg" >"$log" 2>&1
  code=$?
  dur=$(( $(date +%s) - start ))
  avail=$(free -m | awk '/^Mem:/{print $7}')
  echo "LEG=$leg EXIT=$code SECONDS=$dur avail=${avail}MB log=$(basename "$log")"
  grep -hE "^ *Test Files|^ *Tests " "$log" | tail -2 | sed 's/^/    /'
done
echo
echo "tree still $BASE: $([ "$(git rev-parse --short HEAD)" = "$BASE" ] && echo yes || echo "NO - writer landed a commit mid-walk")"
