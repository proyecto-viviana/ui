# Receipt: #610 Release-Bound Waiver Expiry

**Date:** 2026-10-04  
**Ticket:** #610  
**Status:** verified  

## 1. Summary of Changes

1. **Shape Selection (Candidate 1: Read the Release):**
   - Implemented release-bound expiry in `apps/comparison/scripts/certified-waivers.ts`.
   - Added semver parsing and precedence comparison: `parseSemver`, `compareSemver`, and `isReleaseTooFar`.
   - Added `readCurrentRelease(repoRoot)` which reads `@proyecto-viviana/ui` from `packages/viviana-ui/package.json` (or respects `VIVIANA_RELEASE_VERSION` env override).
   - Added field `release` to `CertifiedWaiver` interface (`release?: string`).
   - Validated that `release` must be a valid semver string in `parseWaiverEntries`.
   - In `evaluateCertifiedWaivers`:
     - When `waiver.release` is set: if `compareSemver(currentRelease, waiver.release) > 0`, the waiver expires (`kind: "expired"`), failing the verdict.
     - If `isReleaseTooFar(currentRelease, waiver.release)`: fails the verdict with `kind: "expires-too-far"`.
     - Legacy date `expires` retained for backwards compatibility when explicitly specified.

2. **Migrated `apps/comparison/e2e/certified-waivers.json`:**
   - All 5 tracked waiver entries migrated from `expires: "2026-10-21"` to `release: "0.8.0-rc.0"`.
   - The file carries zero hand-typed horizon dates.

3. **Proof & Verification:**
   - `vp run comparison:test:certified-waivers` passed: 71/71 tests (38/38 in `certified-waivers.test.ts`).
   - `vp run comparison:guard:certified-waiver-tickets` passed: 5/5 waivers agree with the board.
   - Tested both ways:
     - Release has not shipped (`currentRelease: "0.8.0-rc.0"`, `waiver.release: "0.8.0-rc.0"`): active, waives failure, exit 0.
     - Release has shipped (`currentRelease: "0.8.0-rc.1"` / `"0.8.0"`, `waiver.release: "0.8.0-rc.0"`): expired, failure remains unwaived, exit 1.
