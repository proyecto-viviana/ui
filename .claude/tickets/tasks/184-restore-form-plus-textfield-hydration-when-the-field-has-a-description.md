---
id: 184
type: task
title: "Restore Form plus TextField hydration when the field has a description"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
  - {
      state: in-progress,
      at: 2026-09-01,
      note: "root cause and fix landed; pending orchestrator verification",
    }
  - {
      state: verified,
      at: 2026-09-02,
      note: "orchestrator verified: Form.hydrate green in both styled packages (hydrate 26/27, only #134 red), SSR 26, unit 5686/273 files, typecheck, layer-boundary 532/76/0, full certified comparison run green after the mergeProps change; committed with changeset form-textfield-description-hydration",
    }
---

## Cause

`vp test run --config vitest.hydrate.config.ts` fails
`Form hydrates over SSR markup > Form+TextField (profile shape)` with
`Hydration Mismatch. Unable to find DOM nodes for hydration key: 0000000000100101140010000100`
thrown from `packages/solid-spectrum/src/textfield/index.tsx:431` (the
necessity-marker `<span>` inside `HeadlessLabel`). The SSR half wrote
`output/form-textfield-ssr.html` seconds earlier in the same run, so the
markup is current source. In that markup the server placed the label at key
`…0010000110` and the marker span at `…00100001110`; the client asks for
`…0010000100`. Server and client disagree on the hydration-key sequence.

The `Nombre` field (no description) hydrates. `Título` in the TextArea fixture
(`isRequired`, no description) hydrates. `Username` (`isRequired` plus
`description="3–20 caracteres"`) does not. The differing input is
`description`, the field/describedby slot path #56 is migrating. Solid aborts
hydration for the whole tree on the first mismatch; the test header records
that this exact class blanked consumer `/perfil` and `/foros` routes.

Not attributable to the six unpushed commits (`git diff origin/main..HEAD`
touches none of textfield / label / form / solidaria*). It is on
`origin/main`, most plausibly from the 2026-08-30 train, and no gate could
catch it because the hydrate suite is excluded (#160). `viviana-ui` copies
the same nest and has no Form hydrate suite.

## Work

Find the server/client ordering difference (a `createUniqueId` or
conditional-render order in the headless field/description path, or the
styled necessity `Show` nest) and fix it in the lowest owning layer. Add the
`isRequired` plus `description` shape to the Form SSR/hydrate fixtures and a
viviana-ui twin.

## Done when

Form.hydrate is 7/7 green, both styled copies hydrate the
`isRequired + description` TextField without a mismatch, and the regression
that names this key desync stays in the suite #160 puts on the ladder.

## Relationship

F-GATE-003 / F-SSR-001. Concrete cost of #160. Touches #56's slot path.
Sibling of #134 (the other red in the same run).

## Root cause

`useContextProps` → `mergeProps` probed the Label `children` getter on the
server, instantiating the necessity span once outside the SSR DOM and once
inside, so the server's hydration-key sequence ran one ahead of the client's.
The probe lived in `solidaria` `mergeProps` (`getValue()` during merge for
every getter, including JSX `children`). Description made the mismatch
visible because the necessity marker is a real DOM node whose key then
failed lookup. Fixed in `solidaria` `mergeProps` by never reading a
non-handler/class/style getter during merge; a later getter that yields
`undefined` falls back to the earlier value at read time.
