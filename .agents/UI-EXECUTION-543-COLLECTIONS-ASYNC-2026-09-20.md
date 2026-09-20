# UI execution receipt: #543 collections and async

Date: 2026-09-20

Accepted source baseline: `e4c3b26bb51db905e3b50b15ff84c7c52221c0de`

Status: bounded source generation accepted; #543 and #531 remain in progress.
#532 is merged, not verified.

## Accepted scope and source generations

The final task allowlist is exactly 24 paths: the 20 current task paths plus
#531, generated status, generated roadmap, and this receipt. Five separate #534
paths are preserved byte-for-byte and unstaged. No dependency, public API,
Picker implementation, Select test, shared interaction-modality, or Spectrum
Tree source change is included.

Generation one completes collection/async fixture lifecycle ownership. The 15
styled fixtures are `autocomplete`, `cardview`, `combobox`, `dnd-listbox`,
`gridlist`, `image`, `listbox`, `listview`, `picker`, `selectboxgroup`,
`tableview`, `taggroup`, `toast`, `treeview`, and `virtualizer`. Their final 16
forbidden nested cleanup registrations are returned through the existing owner
boundary, while the shared hydrate test supplies real rendered semantics,
identity, cleanup, disposal, and remount proof. The permanent Tree test records
the independently diagnosed dynamic-item identity behavior; Tree source did not
need repair.

Generation two covers actual Spectrum Picker keyboard focus. The new Picker
case uses its real S2 Popover/Virtualizer/ListLayout composition and real
`PickerItem` rows. The only product change is the existing
`getInteractionModality()` keyboard-only exception in SelectListBox: non-keyboard
modalities retain the early return, while keyboard modality reaches the existing
`focusSafely` option path. The original Stage-B Picker case alone was corrected
to navigate from a genuinely focused option after full settlement.

## Accepted Stage A and Tree evidence

- `/tmp/ui-543-collections-async-stage-a-final-20.log`: exit 0; 20 passed,
  109 skipped, 129 total; SHA-256
  `8363dc1d7c9fb23a319da4d06eb533c0a0bdb3f31c45de9ef1da7d0ff661d095`.
- `/tmp/ui-543-collections-async-stage-a-tree-owning-file.log`: exit 0;
  16/16 passed; SHA-256
  `4689a3851ce4253ae47d1f3b102d31c0fef2e0ef5af29e91ae7fce501da4aae1`.
- The accepted Stage A behavior includes the restored TreeView `disabledItem`
  matrix, replacement re-querying, retained Weekly selection, and the observed
  Photos focus reconciliation after focused Archive removal. The temporary
  console-only diagnostic remains explicitly inconclusive and is absent from
  the final 139-case inventory.

## Actual Picker RED to GREEN chronology

The qualifying RED first proved its prerequisite: the actual trigger was active
and received ArrowDown; after the established flush plus one microtask, the real
listbox existed and Pro was selected and logically focused. After exactly one
rAF and timeout(0), the dialog still owned DOM focus instead of Pro. The failure
therefore occurred only at the intended handoff boundary.

- `/tmp/ui-543-picker-focus-focused.log`: exit 1; 1 failed, 21 skipped,
  22 total; SHA-256
  `88079ad7bb18de1748ae7e03a32188db81c0a3b6302ca63071f46efba437e10f`.
- Minimal Select keyboard-only guard applied.
- `/tmp/ui-543-picker-focus-green.log`: exit 0; 1 passed, 21 skipped,
  22 total; SHA-256
  `942ba32b5301cce3b3d668f101cf0593dba7d287ee7792bdcbab7a77112d7e85`.
- `/tmp/ui-543-picker-focus-pointer-negative.log`: exit 0; 1 passed,
  85 skipped, 86 total; SHA-256
  `ef001a0c3351a980b12d60904818a70296abf9f5423350bcd684e0d543246458`.
- `/tmp/ui-543-picker-focus-select-full.log`: exit 0; 86/86 passed;
  SHA-256
  `5249879a2ab4699a37c8e02f2d50fddb36ce36e4a3d079640b2f5532f735a113`.
- `/tmp/ui-543-picker-focus-picker-full.log`: exit 0; 22/22 passed;
  SHA-256
  `9c8ebdf0a7f2b033acab0a6922f0219c3a779d524de586d036729bacae17ca55`.
- `/tmp/ui-543-picker-focus-stage-b10.log`: exit 0; 10 passed,
  129 skipped, 139 total; SHA-256
  `f3f8e99679d8906466e6159ab4118edbe9ea0a969c5c5951047c915ee36cf5e8`.

The focused GREEN proves real Pro focus after the handoff, active-element
ArrowDown navigation to enabled Enterprise with matching logical focus, Enter
selection `enterprise`, live trigger update, popup close, and trigger-focus
restoration. The pointer negative retains dialog focus and frozen option
tabindexes.

## Rejected generic Select experiments

The earlier generic Select-in-Popover attempts are historical, non-qualifying
evidence and are not part of the accepted ownership chain:

- `...-red.log` and `...-red-asserted.log` each failed 1/87 with 86 skipped but
  lacked the required pre-handoff attribution checkpoint.
- `...-green.log` was interrupted without a test result and is not evidence.
- `...-qualifying-red.log` failed 1/87 because awaited keyboard handling had
  already advanced beyond the required open/Pro prerequisite.
- `...-final-qualifying-red.log` failed 1/87 because synchronous dispatch had
  not yet established the open/Pro prerequisite.

The temporary generic regression was removed. `Select.test.tsx` remains at its
baseline SHA-256
`9ca8f3f7f89a20b20b9ce2aafac30b90f80b2d0548d674df7fc52da9f26f4dcf`.

## Final released validation

All heavy commands ran one at a time with installed Node 24.21.0 and local Vite
Plus. Accepted Select86, Picker22, and Tree16 were not repeated after the final
source generation because no relevant source changed.

- Whole shared hydrate file, exactly once:
  `/tmp/ui-543-collections-async-final-whole-hydrate.log`; exit 0; one file
  passed, 139/139 cases passed; duration 12.14 s; SHA-256
  `ca59b0b48e88b905902ef4a06b5048baa59289cadc159e955321be2ac81de388`.
  Three CSS stylesheet parse notices are retained as non-failing output.
- Root typecheck, exactly once:
  `/tmp/ui-543-collections-async-final-typecheck.log`; **exit 0**; SHA-256
  `2a44a4b1140b0789696a6dab27074225f6c85a65ae46d66fc965c52b74830011`.
  The sparse terminal log is not substituted for the explicit exit result.
- Final AST cleanup census:
  `/tmp/ui-543-collections-async-final-census.log`; exit 0;
  `registrations=0`, `files=0`; SHA-256
  `cdead0eec10189f6403f2a89dee3d6f58fb9ec123ef673c2f02ce858d0f10b04`.

The first scoped format check identified five allowlisted files. Local Vite
Plus formatted exactly those files, and the complete 24-path format recheck
then exited 0. This was a mechanical formatting-only update, not a relevant
behavioral source change, so the accepted heavy suites were not repeated. The
19 code/test paths then passed scoped lint; non-Git trailing-whitespace and
conflict-marker checks found no matches.

The repository generator exited 0 after writing current status and roadmap.
The actual current-docs checker then exited 0 with `docs:check passed`.

## Final worktree source and test hashes

```text
5db0e93b2c56cf688714983dee6b6c6bb864bdd96fc3a6c75785027534dd176c  apps/comparison/src/components/solid/fixtures/styled/autocomplete.tsx
19ce86d5f151d3a2756bde3038977a1a911ab41be7647d21aa02a6e079bb8340  apps/comparison/src/components/solid/fixtures/styled/cardview.tsx
7ca7cc505bac8eb69129ef752ddf457662194f0e071de14418fa7310e790af3f  apps/comparison/src/components/solid/fixtures/styled/combobox.tsx
30ead6754114c57155dee4a576cbdb18861cbe67a5e91ab3fb71a9af2c16698f  apps/comparison/src/components/solid/fixtures/styled/dnd-listbox.tsx
a5d493202ecc835adf2fba95a29926eff4edbb4445d59978adf93a07bf35a62c  apps/comparison/src/components/solid/fixtures/styled/gridlist.tsx
3e397576640d6373893a6552d282a958a92f23f91690c9af13fd6df723d48e94  apps/comparison/src/components/solid/fixtures/styled/image.tsx
ebb3fae6464818173831d5bbafbc35896ea98b9d90d8d71f870580305319f277  apps/comparison/src/components/solid/fixtures/styled/listbox.tsx
0eeafb39ec6c8edf9e7d2cb115e7e770f7ff86f3113f7fe329b24fd07b671085  apps/comparison/src/components/solid/fixtures/styled/listview.tsx
6a64aa2fe3153faa9c2ba818843fa6e40b29ce6e6be14fec8563ae5bec013a1d  apps/comparison/src/components/solid/fixtures/styled/picker.tsx
0aeaade3f4f6bd896d71aa4299883cd93e7f5b1b38eddd9fdfccf4f99c76fdf7  apps/comparison/src/components/solid/fixtures/styled/selectboxgroup.tsx
24e7cdfab5a8ddd65b772762403015bbe568a5ad8b49d59e5112fb8582df620a  apps/comparison/src/components/solid/fixtures/styled/tableview.tsx
24d7e58362c34f7e8a3059debc2d7f2a2d8eea6f5c84c170d6d0718de946d880  apps/comparison/src/components/solid/fixtures/styled/taggroup.tsx
3ec3d8bff9c2c15f1369b9a19b9da7ec65b5abb7b4b1eb95672e06e2f2a4a278  apps/comparison/src/components/solid/fixtures/styled/toast.tsx
9723fca769a99a3fe14d389b1d081d2aa315fe755be40eb93b3a40fa419e4e5b  apps/comparison/src/components/solid/fixtures/styled/treeview.tsx
1c9fccd342b6fb78a0b3490fb76f172069d60c6e0abd90e5c6e47ee77c6e4861  apps/comparison/src/components/solid/fixtures/styled/virtualizer.tsx
abea352b6ee47c8307a6cc779b92a688bc335cbcb9dc792ba4677b2fb413f48d  apps/comparison/test/solid-integration/fixtures.hydrate.test.tsx
febab4c035c32af23ca35834e5eb546f9b21f3bac62dd6be352b085d45374f6d  packages/solid-spectrum/test/Tree.test.tsx
e9da13c50ae1d3cbca906b58e9af9185ea34d5e45e50f1c3c15456f72b864d47  packages/solid-spectrum/test/Picker.test.tsx
762727b04f88546cfc31539560087c0d296d1a75e92dac0fd79011093edcf0fc  packages/solidaria-components/src/Select.tsx
```

Protected #534 work remains exact:

```text
7c51470ec2dd4ba385a1af66c136efc99f14659e443f740d5d2c7e97294a8f33  packages/solidaria-components/test/Button.test.tsx
0bec2fbe0a4855ed6749da0104e7f6029bb65066cfe4bbaf67b67fb0d4fa1eac  packages/solidaria-components/test/Tooltip.test.tsx
31c0be0a17cfa870e9ad180d3faef79a8d164df0bce6d390f70db8e84944e0f5  packages/solidaria/src/interactions/createHover.ts
f3b7574fd4b1cd8965083c2e4df94044d7d139067936cebb823995508a67e1ae  packages/solidaria/test/createHover.test.tsx
4492658cdb3af38c57c2a67e7f36bc3e8b4953a435f2f65e3cd1b457ad3d7b86  packages/solidaria/test/createTooltip.test.tsx
```

Final ticket and generated-view hashes are:

```text
b7676c8e50abc06d5b68430a891cd0f893163d4f0c11c5718b1a22aefa69ce9b  .claude/tickets/tasks/543-restore-solid-2-comparison-app-development.md
9666b525e804ece7f38fa7401006ba5eadbfc72ea4e1bb10bd68fc7b4a639b08  .claude/tickets/initiatives/531-solid-2-foundation-upgrade-vanguard.md
74cd4a384786fddfebe35591c89f9372356a1da6ccce4d57fce7250ce286266f  .claude/current/status.md
08bde05c1db0f717cfa65734c29e53c841d3f19ea7629cf66597ca319a093062  .claude/current/roadmap.md
```

The receipt's non-self-referential final SHA-256 is recorded in
`/tmp/ui-543-picker-focus-result.md`.

## Scope accounting and remaining gates

This fresh worker began with 23 dirty paths: 18 task paths plus five protected
paths. Picker test and Select source increased the current pre-doc state to 25:
20 task paths plus five protected. The final authorized task allowlist is 24,
not the current pre-doc dirty count. Adding #531, generated status, generated
roadmap, and this receipt produces the expected final checkout dirt of 29 paths:
24 task plus five protected. #543 is already among the current 20 task paths.
The index remains empty; no staging, commit, push, install, network/provider, or
dependency action occurred.

Remaining #543 gates are explicit:

- classify and resolve the known 1,353/1,553/944 strict diagnostics without
  suppression;
- run actual Astro island SSR/hydration and exact identity proof for the final
  fixture generation;
- run real-browser collection/async navigation, Picker/overlay focus, and
  clean-console behavior;
- complete broader comparison/web compatibility, four-layer builds,
  attribution, packaging, and #139/#194/#537 same-revision release proof.

#543 and #531 remain in progress. #532 remains merged, not verified. This
receipt is an evidence boundary, not foundation or release acceptance.
