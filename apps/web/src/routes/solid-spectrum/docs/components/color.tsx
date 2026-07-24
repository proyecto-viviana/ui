import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, For } from "solid-js";
import {
  ColorSwatchPicker,
  ColorSwatchPickerItem,
  ColorEditor,
} from "@proyecto-viviana/solid-spectrum";
import {
  ColorSlider,
  ColorSliderTrack,
  ColorSliderThumb,
  ColorArea,
  ColorAreaGradient,
  ColorAreaThumb,
  ColorWheel,
  ColorWheelTrack,
  ColorWheelThumb,
  ColorField,
  ColorFieldInput,
  ColorSwatch,
} from "@proyecto-viviana/solidaria-components";
import { parseColor, type Color } from "@proyecto-viviana/solid-stately";
// Layout and type around the demos come from the design system. The demos themselves
// stay on the packages this page documents; the headless ones own no paint at all, so
// their geometry and state styling lives in styles/headless-demos.css.
import { Flex, Text, typeRoles } from "@proyecto-viviana/ui";
import { DocPage, Example, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/color")({
  component: ColorPage,
});

const swatchColors = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#6b7280",
];

/** The chip-and-value line every demo below closes with. */
function ColorReadout(props: { color: string; children?: string }) {
  return (
    <Flex alignItems="center" gap={2}>
      <div class="hd-color-preview" style={{ background: props.color }} />
      <Text styles={typeRoles.meta}>{props.children ?? props.color}</Text>
    </Flex>
  );
}

function ColorPage() {
  const [sliderColor, setSliderColor] = createSignal(parseColor("hsl(200, 100%, 50%)"));
  const [areaColor, setAreaColor] = createSignal(parseColor("hsb(200, 100%, 100%)"));
  const [wheelColor, setWheelColor] = createSignal(parseColor("hsl(200, 100%, 50%)"));
  const [fieldColor, setFieldColor] = createSignal<Color | null>(parseColor("#3b82f6"));
  const [pickerColor, setPickerColor] = createSignal<Color>(parseColor("#3b82f6"));
  const [editorColor, setEditorColor] = createSignal<Color>(parseColor("hsl(200, 100%, 50%)"));

  return (
    <DocPage
      title="Color Components"
      description="A suite of color picking primitives: sliders, 2D areas, wheels, text fields, swatches, and a full-featured editor. All are keyboard accessible and support multiple color formats."
      importCode={`// Headless primitives (solidaria-components):
import { ColorSlider, ColorSliderTrack, ColorSliderThumb } from '@proyecto-viviana/solidaria-components';
import { ColorArea, ColorAreaGradient, ColorAreaThumb } from '@proyecto-viviana/solidaria-components';
import { ColorWheel, ColorWheelTrack, ColorWheelThumb } from '@proyecto-viviana/solidaria-components';
import { ColorField, ColorFieldInput, ColorSwatch } from '@proyecto-viviana/solidaria-components';

// Styled components (ui):
import { ColorSwatchPicker, ColorSwatchPickerItem, ColorEditor } from '@proyecto-viviana/solid-spectrum';

// Utilities:
import { parseColor, type Color } from '@proyecto-viviana/solid-stately';`}
    >
      <Example
        title="ColorSlider"
        description="Adjust a single color channel (hue, saturation, lightness, red, green, blue, alpha). The primitives ship no paint, so the track and thumb below are sized by your own CSS."
        code={`<ColorSlider channel="hue" value={color()} onChange={setColor}>
  {() => (
    <ColorSliderTrack class="slider-track">
      {() => <ColorSliderThumb class="slider-thumb" />}
    </ColorSliderTrack>
  )}
</ColorSlider>`}
      >
        <Flex direction="column" gap={4} style={{ "max-width": "24rem" }}>
          <ColorSlider
            channel="hue"
            value={sliderColor()}
            onChange={setSliderColor}
            class="hd-color-slider"
          >
            {() => (
              <>
                <Flex justifyContent="between" style={{ "margin-bottom": "4px" }}>
                  <span class={typeRoles.label}>Hue</span>
                  <span class={typeRoles.meta}>
                    {Math.round(sliderColor().getChannelValue("hue"))}°
                  </span>
                </Flex>
                <ColorSliderTrack class="hd-slider-track">
                  {() => <ColorSliderThumb class="hd-slider-thumb hd-slider-thumb--centered" />}
                </ColorSliderTrack>
              </>
            )}
          </ColorSlider>
          <ColorReadout color={sliderColor().toString("css")} />
        </Flex>
      </Example>

      <Example
        title="ColorArea"
        description="A 2D picker for two channels simultaneously (e.g., saturation + brightness)."
        code={`<ColorArea value={color()} onChange={setColor} xChannel="saturation" yChannel="brightness">
  {() => (
    <>
      <ColorAreaGradient class="area-gradient" />
      <ColorAreaThumb class="slider-thumb" />
    </>
  )}
</ColorArea>`}
      >
        <Flex alignItems="start" gap={4}>
          <ColorArea
            value={areaColor()}
            onChange={setAreaColor}
            xChannel="saturation"
            yChannel="brightness"
            class="hd-color-area"
          >
            {() => (
              <>
                <ColorAreaGradient class="hd-color-area__gradient" />
                <ColorAreaThumb class="hd-slider-thumb" />
              </>
            )}
          </ColorArea>
          <ColorReadout color={areaColor().toString("css")} />
        </Flex>
      </Example>

      <Example
        title="ColorWheel"
        description="A circular hue selector."
        code={`<ColorWheel value={color()} onChange={setColor}>
  {() => (
    <>
      <ColorWheelTrack class="wheel-track" />
      <ColorWheelThumb class="slider-thumb" />
    </>
  )}
</ColorWheel>`}
      >
        <Flex alignItems="center" gap={4}>
          <ColorWheel value={wheelColor()} onChange={setWheelColor}>
            {() => (
              <>
                <ColorWheelTrack class="hd-color-wheel__track" />
                <ColorWheelThumb class="hd-slider-thumb" />
              </>
            )}
          </ColorWheel>
          <ColorReadout color={wheelColor().toString("css")}>
            {`Hue: ${Math.round(wheelColor().getChannelValue("hue"))}°`}
          </ColorReadout>
        </Flex>
      </Example>

      <Example
        title="ColorField"
        description="A text input for entering color values in hex, RGB, HSL, or other formats."
        code={`<ColorField label="Color" value={color()} onChange={setColor}>
  {() => (
    <div class="row">
      <div class="swatch" style={{ background: color()?.toString('css') }} />
      <ColorFieldInput class="color-input" />
    </div>
  )}
</ColorField>`}
      >
        <div style={{ "max-width": "20rem" }}>
          <ColorField label="Color" value={fieldColor()} onChange={setFieldColor}>
            {/* ColorField renders its own `label`, so the row below is just the swatch and
                the input — a second hand-written label would duplicate it. */}
            {() => (
              <Flex alignItems="center" gap={2} style={{ "margin-top": "4px" }}>
                <div
                  class="hd-color-preview"
                  style={{ background: fieldColor()?.toString("css") || "transparent" }}
                />
                <ColorFieldInput class="hd-color-input" />
              </Flex>
            )}
          </ColorField>
        </div>
      </Example>

      <Example
        title="ColorSwatch"
        description="A simple color preview square."
        code={`<ColorSwatch color={parseColor('#3b82f6')} class="swatch" />`}
      >
        <Flex wrap gap={3}>
          <For each={swatchColors}>
            {(c) => <ColorSwatch color={parseColor(c)} class="hd-swatch hd-swatch--lg" />}
          </For>
        </Flex>
      </Example>

      <Example
        title="ColorSwatchPicker"
        description="An accessible palette picker — a group of ColorSwatchPickerItems with selection state."
        code={`<ColorSwatchPicker value={color()} onChange={setColor} aria-label="Pick a color">
  <ColorSwatchPickerItem color={parseColor('#ef4444')} />
  <ColorSwatchPickerItem color={parseColor('#3b82f6')} />
</ColorSwatchPicker>`}
      >
        <Flex direction="column" gap={3}>
          <ColorSwatchPicker
            value={pickerColor()}
            onChange={setPickerColor}
            aria-label="Pick a color"
          >
            <For each={swatchColors}>{(c) => <ColorSwatchPickerItem color={parseColor(c)} />}</For>
          </ColorSwatchPicker>
          <ColorReadout color={pickerColor().toString("css")} />
        </Flex>
      </Example>

      <Example
        title="ColorEditor"
        description="A full-featured, styled color editor combining area, wheel, sliders, and format input."
        code={`<ColorEditor value={color()} onChange={setColor} />`}
      >
        <Flex direction="column" gap={3}>
          <ColorEditor value={editorColor()} onChange={setEditorColor} />
          <ColorReadout color={editorColor().toString("css")} />
        </Flex>
      </Example>

      <AccessibilitySection>
        <li>All color pickers support full keyboard navigation</li>
        <li>ColorSlider: Arrow keys adjust the value; Page Up/Down for larger steps</li>
        <li>ColorArea: Arrow keys move the 2D thumb</li>
        <li>ColorWheel: Arrow keys rotate the hue</li>
        <li>ColorField: Standard text input semantics with format validation</li>
        <li>ColorSwatchPicker: Arrow keys navigate swatches, Enter/Space selects</li>
        <li>
          Current color value is announced via <code>aria-valuetext</code>
        </li>
      </AccessibilitySection>
    </DocPage>
  );
}
