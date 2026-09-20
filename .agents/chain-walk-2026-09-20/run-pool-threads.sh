#!/usr/bin/env bash
# #556 experiment: same suite, pool=threads instead of vmThreads, with an RSS curve.
cd /home/emoporemilio/projects/viviana-hub/ui || exit 9
OUT=.agents/chain-walk-2026-09-20/pool-threads.out.txt
RSS=.agents/chain-walk-2026-09-20/pool-threads.rss.txt
{ echo "start $(date -Iseconds) avail=$(free -m | awk '/^Mem:/{print $7}')MB"
  echo "cmd: vitest run --pool=threads --reporter=default"; } > "$OUT"
: > "$RSS"
NO_COLOR=1 CI=1 ./node_modules/.bin/vitest run --pool=threads --reporter=default >> "$OUT" 2>&1 &
vp=$!
( while kill -0 $vp 2>/dev/null; do
    tot=$(ps -o rss= --ppid $vp 2>/dev/null | awk '{s+=$1} END {print s+0}')
    own=$(ps -o rss= -p $vp 2>/dev/null | tr -d ' ')
    echo "$(date +%H:%M:%S) main=$(( ${own:-0} / 1024 ))MB kids=$(( tot / 1024 ))MB avail=$(free -m | awk '/^Mem:/{print $7}')MB" >> "$RSS"
    sleep 3
  done ) &
wait $vp
code=$?
echo "EXIT=$code at $(date -Iseconds) avail=$(free -m | awk '/^Mem:/{print $7}')MB" >> "$OUT"
