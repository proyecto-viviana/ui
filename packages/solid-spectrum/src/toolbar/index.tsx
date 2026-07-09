import { type JSX } from "solid-js";
import {
  Toolbar as HeadlessToolbar,
  type ToolbarProps as HeadlessToolbarProps,
  type ToolbarRenderProps,
} from "@proyecto-viviana/solidaria-components";

export type { ToolbarRenderProps };
export type ToolbarProps = HeadlessToolbarProps;

/**
 * A toolbar is a container for a set of interactive controls, such as buttons,
 * menus, or checkboxes, with arrow key navigation between them.
 *
 * React Spectrum S2 (1.5.1) ships Toolbar as a bare passthrough over the
 * react-aria-components `Toolbar` — no styling, no variant, no size — so this
 * mirrors it exactly. See `@react-spectrum/s2/src/Toolbar.tsx`.
 *
 * @example
 * ```tsx
 * <Toolbar aria-label="Text formatting">
 *   <Button>Bold</Button>
 *   <Button>Italic</Button>
 *   <Button>Underline</Button>
 * </Toolbar>
 * ```
 */
export function Toolbar(props: ToolbarProps): JSX.Element {
  return <HeadlessToolbar {...props} />;
}
