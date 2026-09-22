/**
 * Shared fixtures for the field-adornment SSR/hydrate twin (#545 class 2),
 * covering both components the baseline carries rows for: `TextField` and
 * `SearchField`.
 *
 * `suffix={<Keyboard>…</Keyboard>}` is the shape `/showcase/inputs` uses, and
 * `Keyboard` reads `KeyboardContext`. A JSX prop compiles to a getter, so every
 * read of `suffix` runs the component body — including the read that
 * `PrefixInputProvider`'s computed id set triggers from inside the input's ref
 * callback, which Solid 2 applies with no owner.
 */
import { children } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Keyboard } from "../../src/text/Keyboard";
import { SearchField } from "../../src/searchfield";
import { TextField } from "../../src/textfield";

export function TextFieldAdornmentsFixture(): JSX.Element {
  return (
    <TextField
      label="Ask the tutor"
      prefix={<Keyboard>⌘</Keyboard>}
      suffix={<Keyboard>↵</Keyboard>}
    />
  );
}

/**
 * Reactive-text adornments, for `guard:idiomatic-solid` anti-pattern 2 (#545,
 * #611). TextField resolves both adornments through `children()` and renders
 * the result, which is the shape the guard flags: #135 froze a rendered
 * `children()` snapshot of mixed text at its server value. `prefix` wraps the
 * signal read in an element, `suffix` passes bare mixed text — the exact #135
 * shape — so the hydrate half measures both.
 */
export function TextFieldReactiveAdornmentsFixture(props: { count: () => number }): JSX.Element {
  return (
    <TextField
      label="Ask the tutor"
      prefix={<Keyboard>wrapped: {props.count()}</Keyboard>}
      suffix={<>bare: {props.count()}</>}
    />
  );
}

/**
 * The same two adornments on `SearchField`, whose `children()` block is the
 * twin of TextField's (`src/searchfield/index.tsx:426`, `:427`) but whose
 * render is not: it gates the prefix through a `<Show>` that has a fallback,
 * the input through a second `<Show>` keyed on either adornment, and the suffix
 * through a third, all inside a div carrying its own `isFocusWithin` signal. A
 * `<Show>` that re-renders would re-resolve the snapshot where TextField's
 * would not, so the two baseline rows for that file are measured here rather
 * than argued from TextField's shape.
 */
export function SearchFieldReactiveAdornmentsFixture(props: { count: () => number }): JSX.Element {
  return (
    <SearchField
      label="Find a tutor"
      prefix={<Keyboard>wrapped: {props.count()}</Keyboard>}
      suffix={<>bare: {props.count()}</>}
    />
  );
}

/**
 * Controls for the same measurement, with no field in them. Both resolve
 * mixed-text children with `children()`; they differ only in WHERE the
 * snapshot is read.
 *
 * `SnapshotInJsx` reads it inside the JSX expression — the shape the guard
 * flags and the shape the four #545 sites use. `SnapshotInBody` reads it once
 * in the component body, which `createComponent` runs untracked, so the insert
 * receives a plain value with nothing to re-run. The second control is what
 * gives this harness teeth: a run where it does not freeze is a run that
 * proves nothing about the first.
 */
function SnapshotInJsx(props: { children?: JSX.Element }): JSX.Element {
  const resolved = children(() => props.children);
  return <em data-control="in-jsx">{resolved()}</em>;
}

function SnapshotInBody(props: { children?: JSX.Element }): JSX.Element {
  const resolved = children(() => props.children);
  const frozen = resolved();
  return <em data-control="in-body">{frozen}</em>;
}

export function ChildrenSnapshotInJsxFixture(props: { count: () => number }): JSX.Element {
  return <SnapshotInJsx>control: {props.count()}</SnapshotInJsx>;
}

export function ChildrenSnapshotInBodyFixture(props: { count: () => number }): JSX.Element {
  return <SnapshotInBody>control: {props.count()}</SnapshotInBody>;
}
