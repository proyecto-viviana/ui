# Audit verification — ticket #546

Each row is a finding the conductor reproduced itself. A worker's word is not
a row. `fixed` names the commit; `ticket` names where unfixed work lives.

| lens | finding | reproduced by | outcome |
| --- | --- | --- | --- |
| 1 | Virtualizer item effect strands its ResizeObserver and frame behind an early `return` | new test `releases item observers and pending frames on unmount` fails on the old source (2 observers never disconnect), passes on the fix; suite 79/79 | fixed, this commit |
