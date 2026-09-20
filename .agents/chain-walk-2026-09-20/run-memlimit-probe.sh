#!/usr/bin/env bash
# #556 item 2 probe: does poolOptions.vmThreads.memoryLimit bound the process at
# all? One package's tests, peak RSS of the real vitest process sampled every 2s.
# $1 is a label written into the output.
cd /home/emoporemilio/projects/viviana-hub/ui || exit 9
OUT=".agents/chain-walk-2026-09-20/memlimit-probe-$1.txt"
{ echo "label=$1 start $(date -Iseconds)"; } > "$OUT"
NO_COLOR=1 CI=1 timeout 900 ./node_modules/.bin/vitest run packages/solidaria-components/test >> "$OUT" 2>&1 &
wrapper=$!
peak=0
( while kill -0 $wrapper 2>/dev/null; do
    for pid in $(pgrep -f "vitest/vitest.mjs"); do
      mb=$(( $(ps -o rss= -p "$pid" | tr -d ' ') / 1024 ))
      [ "$mb" -gt "$peak" ] && peak=$mb
      if [ "$mb" -gt 9000 ]; then
        echo "WATCHDOG killed at ${mb}MB" >> "$OUT"; kill -9 "$pid" 2>/dev/null
      fi
    done
    echo "peak=${peak}MB $(date +%H:%M:%S)" > ".agents/chain-walk-2026-09-20/memlimit-probe-$1.peak"
    sleep 2
  done ) &
wait $wrapper
echo "EXIT=$? at $(date -Iseconds)" >> "$OUT"
