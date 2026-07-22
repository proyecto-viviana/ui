import { type JSX, splitProps } from "solid-js";
import {
  ColorEditor as HeadlessColorEditor,
  type ColorEditorProps as HeadlessColorEditorProps,
} from "@proyecto-viviana/solidaria-components";
import { css } from "../style" with { type: "macro" };

export interface ColorEditorProps extends Omit<HeadlessColorEditorProps, "class" | "style"> {
  /** Additional CSS class name. */
  class?: string;
}

// ColorEditor composes several headless primitives (ColorArea, ColorSlider,
// ColorField) plus a native format <select>, and styles them through descendant
// selectors — the internal parts hardcode their own class names and expose no
// per-part class hook. The single-element style() macro can't express
// descendant/native-element targeting, so styling flows through the css() macro
// escape hatch instead: it ships real CSS in the package bundle (same asset
// pipeline as style()) and supports the nesting these parts need. There is no S2
// upstream for ColorEditor; values mirror the S2 neutral palette (fixed
// light-dark pairs, scheme-aware via the Provider's color-scheme).
const editorStyles = css(`
  display: flex;
  flex-direction: column;
  gap: 12px;
  --pv-field-bg: light-dark(#fff, #222);
  --pv-field-border: light-dark(#d5d5d5, #3d3d3d);
  --pv-text: light-dark(#222, #e6e6e6);
  --pv-text-subtle: light-dark(#6b6b6b, #b9b9b9);
  --pv-focus: light-dark(#4b75ff, #4069fd);

  & label { color: var(--pv-text-subtle); }
  & input { color: var(--pv-text); }

  & .solidaria-ColorEditor-top { display: flex; flex-direction: column; gap: 8px; }
  & .solidaria-ColorEditor-bottom { display: flex; gap: 8px; align-items: flex-end; }

  /* The headless parts ship gradients and thumb positions as inline styles but
   * carry NO dimensions — unsized they collapse to 0x0 and the editor renders
   * as just its bottom row. Sizes mirror the standalone styled ColorArea /
   * ColorSlider (192px surface, 24px track, 16px white-ring thumb). */
  & .solidaria-ColorArea {
    position: relative;
    width: 192px;
    height: 192px;
    border-radius: 6px;
    outline: 1px solid light-dark(rgb(0 0 0 / 0.1), rgb(255 255 255 / 0.1));
    outline-offset: -1px;
  }
  & .solidaria-ColorArea-gradient {
    position: absolute;
    inset: 0;
    border-radius: inherit;
  }
  & .solidaria-ColorSlider { width: 192px; }
  & .solidaria-ColorSlider-track {
    position: relative;
    height: 24px;
    border-radius: 6px;
    outline: 1px solid light-dark(rgb(0 0 0 / 0.1), rgb(255 255 255 / 0.1));
    outline-offset: -1px;
  }
  & .solidaria-ColorArea-thumb,
  & .solidaria-ColorSlider-thumb {
    width: 16px;
    height: 16px;
    box-sizing: border-box;
    border-radius: 50%;
    border: 2px solid #fff;
    outline: 1px solid rgb(0 0 0 / 0.42);
  }

  & .solidaria-ColorEditor-format {
    height: 32px;
    padding-inline: 8px;
    font-size: 0.875rem;
    border-radius: 6px;
    border: 1px solid var(--pv-field-border);
    background: var(--pv-field-bg);
    color: var(--pv-text-subtle);
    outline: none;
  }
  & .solidaria-ColorEditor-format:focus-visible {
    outline: 2px solid var(--pv-focus);
    outline-offset: 2px;
  }

  & .solidaria-ColorField-input {
    background: var(--pv-field-bg);
    border: 1px solid var(--pv-field-border);
    color: var(--pv-text);
    border-radius: 6px;
  }
`);

/**
 * A complete color editor with area, hue slider, alpha slider,
 * color space selector, and channel fields.
 */
export function ColorEditor(props: ColorEditorProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class"]);

  return (
    <HeadlessColorEditor
      {...headlessProps}
      class={[editorStyles, local.class].filter(Boolean).join(" ")}
    />
  );
}
