#!/usr/bin/env bash
# Queue item 1: walk the cheap legs of ci:release-readiness one at a time and
# record an exit code for each. The chain is &&-joined, so run as one command it
# stops at the first red and hides the rest; every red needs its own name.
cd /home/emoporemilio/projects/viviana-hub/ui || exit 9
OUT=.agents/chain-walk-2026-09-20/guards.out.txt
: > "$OUT"
for leg in guard:workflow-pins guard:gate-server-reuse guard:attribution \
           guard:generated-icons guard:theme-base guard:dependency-security \
           guard:certified-case-floor guard:source-artifacts guard:package-sourcemaps; do
  echo "=================== $leg ===================" >> "$OUT"
  s=$(date +%s)
  NO_COLOR=1 timeout 600 vp run "$leg" >> "$OUT" 2>&1
  echo "LEG=$leg EXIT=$? SECONDS=$(( $(date +%s) - s ))" >> "$OUT"
done
echo "WALK DONE $(date -Iseconds)" >> "$OUT"
