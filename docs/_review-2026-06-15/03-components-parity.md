# 03 — Components Parity Audit (solidaria-components)

Scope: `packages/solidaria-components/src/*.tsx` + `contexts.ts` + `utils.tsx`,
compared against `react-spectrum/packages/react-aria-components/src/<Component>.tsx`.
Standard: AGENTS.md Rules #1 (certified), #2 (mirror, don't invent), #4
(composition/slots/contexts live here, mirroring upstream), #5 (structure not
patch), #7 (tests must fail).

Lane note: `Menu.tsx` / `ActionMenu.tsx` + `.changeset/menu-parity-followups.md`
are in flight. Findings here touch Menu only where the defect is shared
infrastructure (`Text`/`TextContext`, `utils.tsx`), not the Menu-specific
follow-ups already queued.

Good news first (so severities are calibrated): `data-*` attribute coverage is
strong — a per-component diff of every `data-*` literal (upstream vs Solid) for
Menu, ListBox, ComboBox, Select, Dialog, Popover, Tooltip, Tabs, Table, Tree,
GridList, TagGroup, Checkbox, Switch, Slider, NumberField, Breadcrumbs, Calendar,
DatePicker, DateField, TextField, SearchField, RadioGroup found **no** missing
attributes except the cross-cutting `data-rac` (below). Context _names_ all
exist. The defects are semantic: contexts that carry the wrong values, a
composition model that diverges from upstream, and shared slot/merge primitives
that are present but bypassed or non-functional.

---

### [CRITICAL] `Text` + `TextContext` cannot carry slots — description/label wiring is dead across all collection items

- Evidence: `packages/solidaria-components/src/Text.tsx:10` declares
  `export const TextContext = createContext<null>(null)` — typed `null`, so it
  can never carry a value. `Text` (`Text.tsx:12-18`) renders
  `<span class style>{children}</span>` and **ignores `props.slot` and every
  other prop** (no `id`, no `aria-*`, no context merge). Upstream:
  `react-aria-components/src/Text.tsx:20-23` —
  `TextContext = createContext<ContextValue<TextProps, HTMLElement>>({})` and
  `[props, ref] = useContextProps(props, ref, TextContext)`; collection items
  feed it slotted props, e.g. ListBox `react-aria-components/src/ListBox.tsx:446-456`
  provides `[TextContext, {slots: {[DEFAULT_SLOT]: labelProps, label: labelProps,
description: descriptionProps}}]`, and Menu does the same at
  `react-aria-components/src/Menu.tsx:482-488`.
- In Solid, **no component provides `TextContext` with slot values** (grep for
  `TextContext.Provider`/`TextContext,` across `src/*.tsx` returns nothing), and
  Menu/ListBox/GridList don't even import `Text`. Item label is wired only via a
  primitive-string fast path (`Menu.tsx:1590`, `ListBox.tsx:810`:
  `<span {...itemAria.labelProps}>`); the **description slot is never wired**, and
  structured `<Text slot="label">` / `<Text slot="description">` children receive
  no `id`/aria association at all.
- Why: Rule #1 (accessibility certification) + Rule #2/#4. Upstream's
  `aria-labelledby`/`aria-describedby` on options/menu-items/gridlist-items point
  at the `id`s that `Text` slots inject. Without them, the accessible
  description is silently absent and `<MenuItem><Text slot="label">…</Text>
<Text slot="description">…</Text></MenuItem>` (the canonical upstream pattern)
  is broken. A test that mounts an item with a `description` slot and asserts the
  computed `aria-describedby` would fail.
- Fix: re-type `TextContext` to `ContextValue<SlottedValue<TextProps>>`; make
  `Text` resolve `useSlottedContext(TextContext, props.slot)` and spread the
  resolved props (`id`, `aria-*`, ref) onto the span; have ListBox/Menu/GridList/
  Tree items provide `[TextContext, {slots: {[DEFAULT_SLOT]: labelProps, label,
description}}]` around their children (as upstream does).

---

### [CRITICAL] ComboBox / Select / DatePicker abandon upstream's slot-context composition and invent bespoke subcomponents

- Evidence: upstream ComboBox composes from **generic** `<Label>`, `<Input>`,
  `<Button>`, `<Popover>`, `<ListBox>`, `<Text slot=…>`, `<FieldError>`, wired by
  a `Provider` carrying **11 contexts**:
  `react-aria-components/src/ComboBox.tsx:224-249`
  (`ComboBoxStateContext, LabelContext, ButtonContext, InputContext,
OverlayTriggerStateContext, PopoverContext, ListBoxContext, ListStateContext,
TextContext{description,errorMessage slots}, GroupContext{isInvalid,isDisabled},
FieldErrorContext, ComboBoxValueContext`). Upstream Select is the same
  (`Select.tsx:201-224`) and has **no** `SelectTrigger`/`SelectListBox`
  subcomponents — you use bare `<Button>`/`<ListBox>`/`<Popover>`.
- Solid ComboBox provides only **2** contexts — `ComboBoxContext` +
  `ComboBoxStateContext` (`packages/solidaria-components/src/ComboBox.tsx:565-611`)
  — and packs everything into a private `ComboBoxContextValue`, then requires
  bespoke `ComboBoxInput`/`ComboBoxLabel`/`ComboBoxButton`/`ComboBoxListBox`/
  `ComboBoxValue` subcomponents (exported in `index.ts:412-445`). Generic
  `Input`/`Button`/`Text` do **not** read `ComboBoxContext`
  (confirmed: no such import in `TextField.tsx`/`Button.tsx`/`Text.tsx`), and
  ComboBox never feeds `InputContext`/`LabelContext`/`ButtonContext`/
  `PopoverContext`/`ListBoxContext`/`TextContext`/`FieldErrorContext`/
  `OverlayTriggerStateContext`. Select mirrors this with
  `SelectTrigger`/`SelectValue`/`SelectListBox`/`SelectOption`
  (`Select.tsx:141,193…`, `index.ts:247-266`).
- Why: Rule #2 (don't invent — upstream has the answer) and Rule #4 (composition
  belongs here, _mirroring_ upstream). Upstream code
  `<ComboBox><Label/><Input/><Button/><Popover><ListBox>…</ListBox></Popover>
</ComboBox>` does not port — it silently renders an unwired Input/Button. The
  bespoke subcomponents are undocumented local additions standing in for the
  upstream slot model, i.e. silent structural drift (Rule #2 forbids exactly
  this). It also fans the form/validation surface out of the shared
  `GroupContext`/`FieldErrorContext` path.
- Fix: feed the generic slot contexts from `<ComboBox>`/`<Select>`/`<DatePicker>`
  (Label/Input/Button/Popover/ListBox/Text/FieldError/Group/OverlayTriggerState),
  so bare upstream children wire automatically. Keep the bespoke subcomponents
  only as explicitly documented local-addition aliases, not the sole API.

---

### [HIGH] `useContextProps` / `useSlottedContext` are present but non-functional and bypassed by every component (patch-as-structure)

- Evidence: `utils.tsx:163-170` `useContextProps` does
  `return [{ ...context, ...props }, ref]` — a plain spread. It does **not**
  `mergeProps` (so event handlers like `onPress`/`onClick`/`onFocus` from context
  are **overwritten**, not chained) and does **not** merge refs. Upstream
  `react-aria-components/src/utils.tsx:187-217` uses
  `mergeProps(contextProps, props)` + `mergeRefs` + special `style` merging.
  `utils.tsx:157-161` `useSlottedContext` is just `useContext(context)` — it
  drops the `slot` parameter entirely, never resolves `ctx.slots[slotKey]`, and
  never throws on an invalid slot. Upstream `utils.tsx:167-185` resolves the slot
  and `throw`s `Invalid slot "x". Valid slot names are …` for an unknown slot.
- Both are exported (`index.ts:21-22`) yet **no component calls either**
  (grep: zero call sites outside `utils.tsx`). Instead Button
  (`Button.tsx:203-211`), ListBox (`ListBox.tsx:204-206`), ComboBox, Menu, etc.
  each hand-roll `contextProps?.slots?.[props.slot ?? "default"]` + `mergeProps`
  inline — slightly differently each time.
- Why: Rule #5 (structure, not patch #50): the shared primitive exists but is
  inert, so every component reinvents slot/merge resolution and they will drift.
  Rule #7: the missing-slot `throw` is an observable upstream behavior with no
  Solid equivalent (a test feeding an invalid slot can't fail). Where context
  carries handlers, the spread-over-merge silently drops the context handler.
- Fix: make `useContextProps` use the package `mergeProps` + ref-merge and make
  `useSlottedContext` honor `slot`/`slots`/`null` and throw on invalid slot; then
  route components through them (delete the inline copies).

---

### [HIGH] `composeRenderProps` has the wrong signature vs upstream and is dead code

- Evidence: Solid `utils.tsx:129-140` `composeRenderProps(base, override)` merges
  two render-prop _objects_ and returns an object. Upstream
  `react-aria-components/src/utils.tsx:150-156`
  `composeRenderProps(value, wrap)` takes a value-or-function plus a `wrap`
  callback and returns a **function** `(renderProps) => wrap(resolved,
renderProps)`. Completely different contract. It is exported (`index.ts:19`)
  but has **zero internal call sites** (grep).
- Why: Rule #2 signature drift on a public, documented helper. `solid-spectrum`
  (and any consumer mirroring upstream) calling
  `composeRenderProps(className, (cls) => …)` the upstream way will get an object
  where a function is expected — a runtime break that no test guards.
- Fix: re-implement to match upstream `(value, wrap) => (renderProps) => …`, or
  remove it and document the replacement as a local addition. Either way, align
  the signature.

---

### [HIGH] `useRenderProps` drops `data-rac`, `defaultChildren`, `defaultStyle` and the `render` (custom element) prop

- Evidence: upstream `useRenderProps` (`react-aria-components/src/utils.tsx:99-144`)
  returns `'data-rac': ''` on every component, merges `defaultStyle` with computed
  style (`{...defaultStyle, ...computedStyle}`), passes `defaultChildren`/
  `defaultClassName`/`defaultStyle` **into** the render-prop functions
  (`className({...values, defaultClassName})`), and supports the `render` custom
  DOM-element override (`utils.tsx:270-351`, `dom` proxy). Solid `useRenderProps`
  (`utils.tsx:91-127`) emits no `data-rac` (confirmed: zero `data-rac` literals in
  the whole package), never injects `defaultChildren`/`defaultStyle` into the
  render-prop call, and there is no `render`/`dom` element-override mechanism
  anywhere in the package.
- Why: Rule #2. `[data-rac]` is a documented, user-observable selector that
  upstream's own starter CSS and many consumer stylesheets depend on; its absence
  means ported upstream CSS silently no-ops. Missing `defaultClassName`/
  `defaultStyle`/`defaultChildren` in the render-prop argument is a documented
  render-prop value that consumers use (`({defaultChildren}) => …`). The missing
  `render` prop drops upstream's "render as a router Link / custom element" story
  on every component.
- Fix: emit `data-rac=""` from the shared render path (or a documented
  Solid-equivalent), thread `defaultStyle`/`defaultChildren` into the render-prop
  args and style merge, and decide explicitly whether `render`-prop element
  override is in scope (document if intentionally omitted).

---

### [HIGH] ListBox renders `<ul>`/`<li>`; upstream renders `<div role>`/`<div role="option">`, and drops the `TextContext` + several item render props

- Evidence: Solid `ListBox.tsx:549` root is `<ul …>` and options are `<li …>`
  (`ListBox.tsx:786`). Upstream renders `<dom.div … role from listBoxProps>` and
  `<ElementType (div|a) … {...optionProps}>` — a flat `div[role=listbox]` /
  `div[role=option]` structure (`react-aria-components/src/ListBox.tsx:259,433`).
  Sections compound this: Solid wraps options in a nested
  `<ul role="group">` with a hand-rolled `<Header>` (`ListBox.tsx:582-611`) and
  does **not** call `useListBoxSection` for `headingProps`/`groupProps` nor
  provide `HeaderContext`; upstream `ListBoxSectionInner`
  (`react-aria-components/src/ListBox.tsx:302-333`) uses `useListBoxSection` +
  `useSlot` + `HeaderContext.Provider`.
- ListBoxItem render-prop values: Solid `ListBoxOptionRenderProps`
  (`ListBox.tsx:136-149`) carries only `isSelected/isFocused/isFocusVisible/
isPressed/isHovered/isDisabled`. Upstream `ItemRenderProps` additionally carries
  `selectionMode`, `selectionBehavior`, `allowsDragging`, `isDragging`,
  `isDropTarget`, `id` (`react-aria-components/src/ListBox.tsx:401-415` +
  `Collection` `ItemRenderProps`). Solid ListBox render values also **invent**
  `isDisabled` on `ListBoxRenderProps` (`ListBox.tsx:74`) which upstream's
  `ListBoxRenderProps` does not have, and **omit** upstream's `isDropTarget`,
  `layout`, `state` (`react-aria-components/src/ListBox.tsx:45-75`).
  `renderEmptyState` signature also drifts: upstream passes `ListBoxRenderProps`
  (`ListBox.tsx:91,244-252`); Solid takes none (`ListBox.tsx:117`).
- Item DOM attrs: Solid omits `data-allows-dragging` and `data-selection-mode`
  that upstream emits (`react-aria-components/src/ListBox.tsx:437,445`).
- Why: Rule #1/#2. The role-bearing element type, the section heading aria wiring
  (`useListBoxSection`), and the item render-prop surface are user-observable
  contracts; tests asserting `role`, `aria-labelledby` on a section, or
  `isDragging`/`selectionMode` in a render prop would fail.
- Fix: align element/role structure (or document the `ul/li` choice as a
  deliberate, tested local addition), route sections through `useListBoxSection` +
  `HeaderContext`, extend `ListBoxOptionRenderProps` to the full `ItemRenderProps`
  set, drop the invented `isDisabled`, add `isDropTarget`/`layout`/`state` to
  `ListBoxRenderProps`, restore `renderEmptyState(renderProps)`, and emit the two
  missing item data-attrs.

---

### [MEDIUM] `OverlayArrow` has no standalone `OverlayArrowContext`; placement only flows from PopoverContext

- Evidence: upstream `OverlayArrowContext`
  (`react-aria-components/src/OverlayArrow.tsx:30-33`) defaults to
  `{placement: 'bottom'}` and `OverlayArrow` reads it via `useContextProps`
  (`OverlayArrow.tsx:55`), so `<OverlayArrow>` works inside Tooltip/Popover/any
  overlay that provides the context. Solid exposes **no** `OverlayArrowContext`
  (grep returns nothing) — `OverlayArrow` (`Popover.tsx:626-657`) reads only
  `popoverContext` and returns `placement = null` when absent, so an
  `<OverlayArrow>` inside a Tooltip (or standalone) gets no placement and no
  `data-placement`.
- Why: Rule #2/#4. `data-placement="top|bottom|left|right"` and the `placement`
  render prop are documented selectors; they silently break outside a Popover.
- Fix: add `OverlayArrowContext` (default placement `'bottom'`), have
  `OverlayArrow` consume it via the slotted-context path, and have Tooltip/Popover
  provide it.

---

### [MEDIUM] `solidaria-*` default class prefix replaces upstream `react-aria-*` package-wide

- Evidence: every component uses `defaultClassName: "solidaria-X"` (e.g.
  `ListBox.tsx:313` `solidaria-ListBox`, `:738` `solidaria-ListBox-option`) where
  upstream uses `react-aria-X` (`react-aria-components/src/ListBox.tsx:239`
  `react-aria-ListBox`). Not found documented as a local addition in
  `.claude/current/`.
- Why: Rule #2 — the default `className` is a user-observable, documented value
  (upstream docs reference `.react-aria-ListBox` selectors). A consumer porting
  upstream CSS selectors gets no matches. This is plausibly a deliberate rebrand,
  but it is undocumented drift as written.
- Fix: either keep `react-aria-*` for drop-in CSS parity, or record the
  `solidaria-*` rename as an explicit, tested local-addition decision in
  `.claude/current/` and the certification notes.

---

### [LOW] `filterDOMProps` global allowlist diverges from upstream/shared util

- Evidence: Solid `filterDOMProps` (`utils.tsx:230-270`) hand-maintains a small
  `globalAttrs` set (`id, class, style, tabIndex, role, title, lang, dir, hidden,
draggable, accessKey, contentEditable, spellcheck`) and matches `on[A-Z]`
  handlers. Upstream RAC imports `filterDOMProps` from `@react-aria/utils`, whose
  global set is broader (e.g. `inputMode`, `translate`, `slot`, full ARIA + data
  passthrough) and also gates `GlobalDOMAttributes`. Divergence risks dropping
  valid global DOM attributes the upstream lets through.
- Why: Rule #2 — silent prop filtering drift; low because most components also
  spread aria/data explicitly.
- Fix: mirror `@react-aria/utils` `filterDOMProps` global set (the Solid
  `solidaria` layer likely already ports it — reuse it rather than re-deriving).

---

## SolidJS idiom & reactivity

Overall the package is idiomatic: components use `splitProps` rather than
destructuring (Dialog `Dialog.tsx:80`, ListBox `ListBox.tsx:208`, Tabs, etc.),
`<For>`/`<Show>` for collections, getter-based prop forwarding into state
factories (`ListBox.tsx:246-280`), and `mergeProps` from `solidaria`. Specific
points:

- [LOW] Reactivity-unsafe destructure: `utils.tsx:97`
  `const { class: className, style, defaultClassName } = props` reads `class`/
  `style` once at call time; if a caller passes a _changing_ `class`/`style`
  prop (rare but allowed), the memo closes over the stale value. Upstream's
  `useRenderProps` re-reads via `useMemo` deps. `RadioGroup.tsx:443`
  `const { state } = props` is the same pattern but `state` is stable, so benign.
  Prefer reading `props.class`/`props.style` inside the `createMemo`.
- [LOW] `useRenderProps` exposes `children` via a getter
  (`utils.tsx:122-124`) and a separate `renderChildren()` thunk. This is a
  reasonable SSR-safety choice, but it means render-prop children are re-invoked
  on every `renderChildren()` call site; ensure callers don't call it twice in
  one render (e.g. primitive-label branch vs fallback in `ListBox.tsx:809-813`
  is guarded, good).
- [INFO] `Provider` (`utils.tsx:172-176`) is a no-op that just returns
  `children` and ignores its `values` array — unlike upstream `Provider`
  (`react-aria-components/src/utils.tsx:46-53`) which actually wraps children in
  each context. It is exported (`index.ts:18`). It happens to be unused
  internally (components nest real `.Provider`s), but a consumer importing
  `Provider` to set multiple contexts (upstream's documented pattern) gets a
  silent no-op. Treat as part of the `utils.tsx` parity fix.

---

## Suspected (unconfirmed)

- Suspected: GridList / Tree items likely share the same dead-`TextContext`
  description-slot gap as ListBox/Menu (they also don't import `Text`), but I did
  not read their item bodies in full — verify they wire `aria-describedby` for a
  `description` slot.
- Suspected: Select/ComboBox `GroupContext{isInvalid,isDisabled}` and
  `FieldErrorContext` not being provided means a nested `<FieldError>` under
  `<Select>`/`<ComboBox>` won't render validation errors via the upstream path;
  confirm whether the bespoke `*ErrorMessage` subcomponents fully cover this.
- Suspected: the `render` (custom DOM element / router-link) prop being absent
  package-wide may break `<ListBoxItem href>` / `<Link>`-as-item routing parity
  beyond the simple `href` fast path; needs a routing test to confirm scope.
- Suspected: `composeRenderProps` and `useContextProps`/`useSlottedContext`
  being wrong _and_ unused suggests `solid-spectrum` may have its own private
  copies; if so, that is a second patch-as-structure layer worth a dedicated
  check (out of this scope, but flagged).
