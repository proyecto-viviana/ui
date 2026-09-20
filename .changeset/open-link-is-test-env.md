---
"@proyecto-viviana/solidaria": patch
---

`openLink` reads the test flag through `isTestEnv()` instead of a bare
`process.env.NODE_ENV`. The bare reference compiled under typecheck but not
under the declaration build, which omits Node types on purpose.
