/**
 * ColorEditor headless component
 *
 * A composite component that combines ColorArea, ColorSlider, and ColorField
 * into a complete color editing UI. Pure composition — no new ARIA hooks needed.
 * Based on @react-spectrum/color source:
 * https://github.com/adobe/react-spectrum/blob/5ecb3333001313e83898cd07644227897e3bae1f/packages/@adobe/react-spectrum/src/color/ColorEditor.tsx.
 */

import { type JSX, createSignal, For, Show, splitProps, createMemo } from "solid-js";
import {
  ColorPicker,
  ColorArea,
  ColorAreaGradient,
  ColorAreaThumb,
  ColorSlider,
  ColorSliderTrack,
  ColorSliderThumb,
  ColorField,
  ColorFieldInput,
} from "./Color";
import { getColorChannels } from "@proyecto-viviana/solid-stately";
import type { Color, ColorChannel, ColorSpace } from "@proyecto-viviana/solid-stately";

export type ColorEditorColorSpace = "rgb" | "hsl" | "hsb";

export interface ColorEditorRenderProps {
  colorSpace: ColorEditorColorSpace | "hex";
}

export interface ColorEditorProps {
  /** The current color value (controlled). */
  value?: Color | string;
  /** The default color value (uncontrolled). */
  defaultValue?: Color | string;
  /** Handler called when the color changes. */
  onChange?: (color: Color) => void;
  /** Whether to hide the alpha channel. */
  hideAlphaChannel?: boolean;
  /** The initial color space. @default 'hex' */
  colorSpace?: ColorEditorColorSpace | "hex";
  /** Handler called when the color space changes. */
  onColorSpaceChange?: (colorSpace: ColorEditorColorSpace | "hex") => void;
  /** The CSS class name. */
  class?: string | ((renderProps: ColorEditorRenderProps) => string);
  /** The inline style. */
  style?: JSX.CSSProperties;
  /** Children override. If provided, replaces the default layout. */
  children?: JSX.Element;
  /** Whether the editor is disabled. */
  isDisabled?: boolean;
}

/**
 * ColorEditor provides a default UI for editing colors.
 *
 * Composes: ColorArea + ColorSlider (hue) + optional ColorSlider (alpha) +
 * color space selector + channel ColorFields.
 */
export function ColorEditor(props: ColorEditorProps): JSX.Element {
  const [local] = splitProps(props, [
    "value",
    "defaultValue",
    "onChange",
    "hideAlphaChannel",
    "colorSpace",
    "onColorSpaceChange",
    "class",
    "style",
    "children",
    "isDisabled",
  ]);

  const [activeSpace, setActiveSpace] = createSignal<ColorEditorColorSpace | "hex">(
    local.colorSpace ?? "hex",
  );

  const handleSpaceChange = (space: ColorEditorColorSpace | "hex") => {
    setActiveSpace(space);
    local.onColorSpaceChange?.(space);
  };

  const channels = createMemo<ColorChannel[]>(() => {
    const space = activeSpace();
    if (space === "hex") return [];
    return getColorChannels(space as ColorSpace);
  });

  const resolvedClass = () => {
    if (typeof local.class === "function") {
      return local.class({ colorSpace: activeSpace() });
    }
    return local.class ?? "";
  };

  if (local.children) {
    return (
      <div class={resolvedClass()} style={local.style}>
        <ColorPicker
          value={local.value}
          defaultValue={local.defaultValue}
          onChange={local.onChange}
        >
          {() => local.children}
        </ColorPicker>
      </div>
    );
  }

  const areaChannels = createMemo(() => {
    const space = activeSpace();
    if (space === "hsb" || space === "hex") {
      return {
        x: "saturation" as ColorChannel,
        y: "brightness" as ColorChannel,
        colorSpace: "hsb" as ColorSpace,
      };
    }
    if (space === "hsl") {
      return {
        x: "saturation" as ColorChannel,
        y: "lightness" as ColorChannel,
        colorSpace: "hsl" as ColorSpace,
      };
    }
    return {
      x: "green" as ColorChannel,
      y: "blue" as ColorChannel,
      colorSpace: "rgb" as ColorSpace,
    };
  });

  return (
    <div
      class={`solidaria-ColorEditor ${resolvedClass()}`}
      style={local.style}
      data-color-space={activeSpace()}
    >
      <ColorPicker value={local.value} defaultValue={local.defaultValue} onChange={local.onChange}>
        {() => (
          <>
            <div class="solidaria-ColorEditor-top">
              <ColorArea
                xChannel={areaChannels().x}
                yChannel={areaChannels().y}
                isDisabled={local.isDisabled}
              >
                {() => (
                  <>
                    <ColorAreaGradient />
                    <ColorAreaThumb />
                  </>
                )}
              </ColorArea>

              <ColorSlider channel="hue" isDisabled={local.isDisabled} aria-label="Hue">
                {() => <ColorSliderTrack>{() => <ColorSliderThumb />}</ColorSliderTrack>}
              </ColorSlider>

              <Show when={!local.hideAlphaChannel}>
                <ColorSlider channel="alpha" isDisabled={local.isDisabled} aria-label="Alpha">
                  {() => <ColorSliderTrack>{() => <ColorSliderThumb />}</ColorSliderTrack>}
                </ColorSlider>
              </Show>
            </div>

            <div class="solidaria-ColorEditor-bottom">
              <select
                value={activeSpace()}
                onChange={(e) =>
                  handleSpaceChange(e.currentTarget.value as ColorEditorColorSpace | "hex")
                }
                disabled={local.isDisabled}
                aria-label="Color format"
                class="solidaria-ColorEditor-format"
              >
                <option value="hex">Hex</option>
                <option value="rgb">RGB</option>
                <option value="hsl">HSL</option>
                <option value="hsb">HSB</option>
              </select>

              <Show
                when={activeSpace() !== "hex"}
                fallback={
                  <ColorField isDisabled={local.isDisabled} aria-label="Hex color">
                    {() => <ColorFieldInput />}
                  </ColorField>
                }
              >
                <For each={channels()}>
                  {(channel) => (
                    <ColorField
                      channel={channel}
                      isDisabled={local.isDisabled}
                      aria-label={channel}
                    >
                      {() => <ColorFieldInput />}
                    </ColorField>
                  )}
                </For>
              </Show>

              <Show when={!local.hideAlphaChannel && activeSpace() !== "hex"}>
                <ColorField channel="alpha" isDisabled={local.isDisabled} aria-label="Alpha">
                  {() => <ColorFieldInput />}
                </ColorField>
              </Show>
            </div>
          </>
        )}
      </ColorPicker>
    </div>
  );
}
