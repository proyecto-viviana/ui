#!/usr/bin/env bash
cd /home/emoporemilio/projects/viviana-hub/ui || exit 9
D=.agents/chain-walk-2026-09-20
OUT=$D/verify-testrun.out.txt
RSS=$D/verify-testrun.rss.txt
: > "$OUT"; : > "$RSS"
( while true; do
    p=$(pgrep -f "vitest" | head -1)
    [ -n "$p" ] && echo "$(date +%H:%M:%S) vitest=$(( $(awk '/VmRSS/{print $2}' /proc/$p/status 2>/dev/null || echo 0) / 1024 ))MB avail=$(free -m | awk '/^Mem:/{print $7}')MB" >> "$RSS"
    sleep 5
  done ) &
W=$!
s=$(date +%s)
NO_COLOR=1 timeout 1800 vp run test:run > "$OUT" 2>&1
E=$?
kill $W 2>/dev/null
echo "LEG=test:run EXIT=$E SECONDS=$(( $(date +%s) - s ))" >> "$OUT"
