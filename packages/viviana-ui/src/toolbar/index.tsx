import { type JSX, splitProps } from "solid-js";
import {
  Toolbar as HeadlessToolbar,
  type ToolbarProps as HeadlessToolbarProps,
  type ToolbarRenderProps,
} from "@proyecto-viviana/solidaria-components";
import { style } from "../style" with { type: "macro" };

export type { ToolbarRenderProps };
export type ToolbarProps = HeadlessToolbarProps;

// S2 1.5.1 ships Toolbar as a bare unstyled passthrough, but viviana-ui owns
// its own register: an unstyled toolbar renders as a plain block and its
// controls stack with no rhythm. Layout only — flex along the toolbar axis
// with a consistent gap; the controls keep their own paint. `alignSelf: start`
// stops column-flex parents from stretching the row full-width.
const toolbarStyles = style<{ orientation: "horizontal" | "vertical" }>({
  display: "flex",
  alignSelf: "start",
  justifySelf: "start",
  gap: 8,
  flexDirection: {
    orientation: {
      horizontal: "row",
      vertical: "column",
    },
  },
  alignItems: {
    orientation: {
      horizontal: "center",
      vertical: "start",
    },
  },
});

/**
 * A toolbar is a container for a set of interactive controls, such as buttons,
 * menus, or checkboxes, with arrow key navigation between them.
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
  const [local, headlessProps] = splitProps(props, ["class"]);

  const mergedClass = (rp: ToolbarRenderProps): string => {
    const cls = local.class;
    return [
      toolbarStyles({ orientation: rp.orientation }),
      typeof cls === "function" ? cls(rp) : cls,
    ]
      .filter(Boolean)
      .join(" ");
  };

  return <HeadlessToolbar {...headlessProps} class={mergedClass} />;
}
