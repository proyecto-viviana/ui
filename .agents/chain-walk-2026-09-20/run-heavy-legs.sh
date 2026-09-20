#!/usr/bin/env bash
# The three `ci:release-readiness` legs the earlier walk could not take: `build`
# writes dist/ inside the writer's checkout, `typecheck:apps` reads what `build`
# wrote (apps resolve @proyecto-viviana/* to ./dist/*.d.ts, so it must run
# straight after it), and the journeys driver is the one heavy browser slot.
# Run only with the writer idle and the tree clean; a red from a leg taken
# mid-edit carries no information.
set -u
cd "$(dirname "$0")/../.." || exit 1
OUT="$(dirname "$0")"
BASE=$(git rev-parse --short HEAD)
echo "tree: $BASE  started: $(date -Is)"
echo "dirty under packages|scripts: $(git status --porcelain packages/ scripts/ | wc -l)"
echo

for leg in "$@"; do
  avail=$(free -m | awk '/^Mem:/{print $7}')
  if [ "$avail" -lt 3000 ]; then
    echo "LEG=$leg SKIPPED avail=${avail}MB — under the 3000MB floor"
    continue
  fi
  start=$(date +%s)
  log="$OUT/leg-${leg//:/-}.out.txt"
  timeout 3600 vp run "$leg" >"$log" 2>&1
  code=$?
  echo "LEG=$leg EXIT=$code SECONDS=$(( $(date +%s) - start )) avail_before=${avail}MB log=$(basename "$log")"
  grep -hE "^ *Test Files|^ *Tests |error TS|^ *Duration" "$log" | tail -4 | sed 's/^/    /'
  [ $code -ne 0 ] && echo "    STOPPING: a later leg reads what this one writes"
  [ $code -ne 0 ] && break
done
echo
echo "tree still $BASE: $([ "$(git rev-parse --short HEAD)" = "$BASE" ] && echo yes || echo "NO - a commit landed mid-walk")"
