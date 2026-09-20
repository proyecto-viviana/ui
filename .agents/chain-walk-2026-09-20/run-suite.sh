#!/usr/bin/env bash
# Whole-suite walk for #556. Streams per-file lines; records the exit code.
cd /home/emoporemilio/projects/viviana-hub/ui || exit 9
OUT=.agents/chain-walk-2026-09-20/whole-suite.out.txt
{
  echo "start $(date -Iseconds) avail=$(free -m | awk '/^Mem:/{print $7}')MB"
  echo "cmd: vitest run --reporter=default (default concurrency, pool=vmThreads)"
} > "$OUT"
NO_COLOR=1 CI=1 ./node_modules/.bin/vitest run --reporter=default >> "$OUT" 2>&1
code=$?
echo "EXIT=$code at $(date -Iseconds) avail=$(free -m | awk '/^Mem:/{print $7}')MB" >> "$OUT"
