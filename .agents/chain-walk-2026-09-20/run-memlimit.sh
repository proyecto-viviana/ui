#!/usr/bin/env bash
# #556 item 2: whole discovered set under pool=vmThreads with the Vitest 4
# top-level `vmMemoryLimit` ceiling from vitest.config.ts (NOT `poolOptions`,
# which Vitest 4 removed). Bounded on purpose: a watchdog kills the real vitest
# process at 9000 MB and `timeout` caps the run at 25 minutes, so this cannot
# become a fifth 101-minute death.
cd /home/emoporemilio/projects/viviana-hub/ui || exit 9
OUT=.agents/chain-walk-2026-09-20/memlimit-control.out.txt
RSS=.agents/chain-walk-2026-09-20/memlimit-control.rss.txt
{ echo "start $(date -Iseconds) avail=$(free -m | awk '/^Mem:/{print $7}')MB"
  echo "cmd: vitest run, no vmMemoryLimit (control), watchdog 9000MB, timeout 1500s"; } > "$OUT"
: > "$RSS"
NO_COLOR=1 CI=1 timeout 1500 ./node_modules/.bin/vitest run --reporter=default >> "$OUT" 2>&1 &
wrapper=$!
( while kill -0 $wrapper 2>/dev/null; do
    for pid in $(pgrep -f "vitest/vitest.mjs"); do
      mb=$(( $(ps -o rss= -p "$pid" 2>/dev/null | tr -d ' ') / 1024 ))
      echo "$(date +%H:%M:%S) vitest=${mb}MB avail=$(free -m | awk '/^Mem:/{print $7}')MB" >> "$RSS"
      if [ "$mb" -gt 9000 ]; then
        echo "WATCHDOG killed the run at ${mb}MB $(date -Iseconds)" >> "$OUT"
        kill -9 "$pid" 2>/dev/null
      fi
    done
    sleep 5
  done ) &
wait $wrapper
echo "EXIT=$? at $(date -Iseconds) avail=$(free -m | awk '/^Mem:/{print $7}')MB" >> "$OUT"
