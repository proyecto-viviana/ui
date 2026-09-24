---
"@proyecto-viviana/solidaria": patch
---

Take the field id in `createLabels` from the caller instead of generating one inside a lazy prop getter, so hydration ids stay in step with the server.
