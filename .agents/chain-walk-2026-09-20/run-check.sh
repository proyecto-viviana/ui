#!/usr/bin/env bash
cd /home/emoporemilio/projects/viviana-hub/ui || exit 9
OUT=.agents/chain-walk-2026-09-20/check.out.txt
echo "start $(date -Iseconds) avail=$(free -m | awk '/^Mem:/{print $7}')MB" > "$OUT"
s=$(date +%s)
NO_COLOR=1 timeout 1200 vp run check >> "$OUT" 2>&1
echo "LEG=check EXIT=$? SECONDS=$(( $(date +%s) - s ))" >> "$OUT"
