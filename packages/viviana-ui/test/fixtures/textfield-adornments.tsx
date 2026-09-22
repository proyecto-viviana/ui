/**
 * Shared fixture for the TextField adornment SSR/hydrate twin (#545 class 2).
 *
 * `suffix={<Keyboard>…</Keyboard>}` is the shape `/showcase/inputs` uses, and
 * `Keyboard` reads `KeyboardContext`. A JSX prop compiles to a getter, so every
 * read of `suffix` runs the component body — including the read that
 * `PrefixInputProvider`'s computed id set triggers from inside the input's ref
 * callback, which Solid 2 applies with no owner.
 */
import type { JSX } from "@solidjs/web";
import { Keyboard } from "../../src/text/Keyboard";
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
