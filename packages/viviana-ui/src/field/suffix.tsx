/**
 * Shared field `suffix` slot — the trailing counterpart of `prefix.tsx`.
 *
 * Viviana UI v2 (Glasselated): upstream S2's FieldGroup carries only a leading
 * `prefix`; the register's prompt wells (TerminalGlassLab panel 02) also park a
 * trailing adornment inside the field — the `⌘K` / `↵` key hint flush against
 * the input's end. This slot is that register addition: same styling contract
 * as the prefix (`gray-600`, `flex-shrink: 0`, icon sized to
 * `fontRelative(20)`) mirrored to the trailing side (`margin-start:
 * text-to-visual`).
 *
 * Accessibility follows the prefix's certified pattern: the suffix's id is
 * appended to the input's `aria-labelledby` through the same
 * `PrefixInputProvider` (pass both ids space-separated) — a unit suffix like
 * "kg" belongs in the accessible name exactly as a unit prefix does.
 */
import { type JSX } from "solid-js";
import { CenterBaseline } from "../icon/center-baseline";
import { IconContext, type IconContextValue } from "../icon";
import { fontRelative, style } from "../style" with { type: "macro" };

const suffixStyles = style({
  color: "gray-600",
  flexShrink: 0,
  marginStart: "text-to-visual",
});

const suffixIconStyles = style({
  size: fontRelative(20),
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

const suffixIconContext: IconContextValue = { styles: suffixIconStyles };

/** Renders a field suffix node (text or icon) with the trailing slot styling. */
export function FieldSuffix(props: { id: string; children: JSX.Element }): JSX.Element {
  return (
    <IconContext.Provider value={suffixIconContext}>
      <CenterBaseline id={props.id} styles={suffixStyles}>
        {props.children}
      </CenterBaseline>
    </IconContext.Provider>
  );
}
