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
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

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

function ColorPage() {
  const [sliderColor, setSliderColor] = createSignal(parseColor("hsl(200, 100%, 50%)"));
  const [areaColor, setAreaColor] = createSignal(parseColor("hsb(200, 100%, 100%)"));
  const [wheelColor, setWheelColor] = createSignal(parseColor("hsl(200, 100%, 50%)"));
  const [fieldColor, setFieldColor] = createSignal<Color | null>(parseColor("#3b82f6"));
  const [swatchColor, setSwatchColor] = createSignal<Color>(parseColor("#3b82f6"));
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
        description="Adjust a single color channel (hue, saturation, lightness, red, green, blue, alpha)."
        code={`<ColorSlider channel="hue" value={color()} onChange={setColor}>
  {() => (
    <ColorSliderTrack class="h-6 rounded-md">
      {() => <ColorSliderThumb class="w-4 h-4 rounded-full border-2 border-white shadow-md" />}
    </ColorSliderTrack>
  )}
</ColorSlider>`}
      >
        <div class="max-w-sm space-y-4">
          <ColorSlider channel="hue" value={sliderColor()} onChange={setSliderColor} class="w-full">
            {() => (
              <>
                <div class="flex justify-between text-xs text-primary-400 mb-1">
                  <span>Hue</span>
                  <span>{Math.round(sliderColor().getChannelValue("hue"))}°</span>
                </div>
                <ColorSliderTrack class="h-6 rounded-md">
                  {() => (
                    <ColorSliderThumb class="w-4 h-4 rounded-full border-2 border-white shadow-md transform -translate-y-1/2 top-1/2" />
                  )}
                </ColorSliderTrack>
              </>
            )}
          </ColorSlider>
          <div class="flex items-center gap-2">
            <div
              class="w-8 h-8 rounded border border-bg-400"
              style={{ background: sliderColor().toString("css") }}
            />
            <span class="text-xs text-primary-400">{sliderColor().toString("css")}</span>
          </div>
        </div>
      </Example>

      <Example
        title="ColorArea"
        description="A 2D picker for two channels simultaneously (e.g., saturation + brightness)."
        code={`<ColorArea value={color()} onChange={setColor} xChannel="saturation" yChannel="brightness">
  {() => (
    <>
      <ColorAreaGradient class="w-full h-full" />
      <ColorAreaThumb class="w-4 h-4 rounded-full border-2 border-white shadow-md" />
    </>
  )}
</ColorArea>`}
      >
        <div class="flex items-start gap-4">
          <ColorArea
            value={areaColor()}
            onChange={setAreaColor}
            xChannel="saturation"
            yChannel="brightness"
            class="w-40 h-40 rounded-lg overflow-hidden"
          >
            {() => (
              <>
                <ColorAreaGradient class="w-full h-full" />
                <ColorAreaThumb class="w-4 h-4 rounded-full border-2 border-white shadow-md" />
              </>
            )}
          </ColorArea>
          <div class="flex items-center gap-2">
            <div
              class="w-8 h-8 rounded border border-bg-400"
              style={{ background: areaColor().toString("css") }}
            />
            <span class="text-xs text-primary-400">{areaColor().toString("css")}</span>
          </div>
        </div>
      </Example>

      <Example
        title="ColorWheel"
        description="A circular hue selector."
        code={`<ColorWheel value={color()} onChange={setColor}>
  {() => (
    <>
      <ColorWheelTrack class="rounded-full" />
      <ColorWheelThumb class="w-4 h-4 rounded-full border-2 border-white shadow-md" />
    </>
  )}
</ColorWheel>`}
      >
        <div class="flex items-center gap-4">
          <ColorWheel value={wheelColor()} onChange={setWheelColor}>
            {() => (
              <>
                <ColorWheelTrack class="rounded-full" />
                <ColorWheelThumb class="w-4 h-4 rounded-full border-2 border-white shadow-md" />
              </>
            )}
          </ColorWheel>
          <div class="space-y-1">
            <div
              class="w-10 h-10 rounded border border-bg-400"
              style={{ background: wheelColor().toString("css") }}
            />
            <span class="text-xs text-primary-400 block">
              Hue: {Math.round(wheelColor().getChannelValue("hue"))}°
            </span>
          </div>
        </div>
      </Example>

      <Example
        title="ColorField"
        description="A text input for entering color values in hex, RGB, HSL, or other formats."
        code={`<ColorField label="Color" value={color()} onChange={setColor}>
  {() => (
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 rounded" style={{ background: color()?.toString('css') }} />
      <ColorFieldInput class="flex-1 px-3 py-2 rounded border..." />
    </div>
  )}
</ColorField>`}
      >
        <div class="max-w-xs">
          <ColorField label="Color" value={fieldColor()} onChange={setFieldColor}>
            {() => (
              <>
                <div class="text-xs text-primary-400 mb-1">Color</div>
                <div class="flex items-center gap-2">
                  <div
                    class="w-8 h-8 rounded border border-bg-400 shrink-0"
                    style={{ background: fieldColor()?.toString("css") || "transparent" }}
                  />
                  <ColorFieldInput class="flex-1 px-3 py-2 rounded-md border border-primary-700 bg-bg-200 text-primary-100 text-sm focus:outline-none focus:border-accent" />
                </div>
              </>
            )}
          </ColorField>
        </div>
      </Example>

      <Example
        title="ColorSwatch"
        description="A simple color preview square."
        code={`<ColorSwatch color={parseColor('#3b82f6')} class="w-10 h-10 rounded" />`}
      >
        <div class="flex flex-wrap gap-3">
          <For each={swatchColors}>
            {(c) => <ColorSwatch color={parseColor(c)} class="w-10 h-10 rounded-lg" />}
          </For>
        </div>
      </Example>

      <Example
        title="ColorSwatchPicker"
        description="An accessible palette picker — a group of ColorSwatchPickerItems with selection state."
        code={`<ColorSwatchPicker value={color()} onChange={setColor} aria-label="Pick a color">
  <ColorSwatchPickerItem color={parseColor('#ef4444')} />
  <ColorSwatchPickerItem color={parseColor('#3b82f6')} />
</ColorSwatchPicker>`}
      >
        <div class="space-y-3">
          <ColorSwatchPicker
            value={pickerColor()}
            onChange={setPickerColor}
            aria-label="Pick a color"
          >
            <For each={swatchColors}>{(c) => <ColorSwatchPickerItem color={parseColor(c)} />}</For>
          </ColorSwatchPicker>
          <div class="flex items-center gap-2">
            <div
              class="w-6 h-6 rounded border border-bg-400"
              style={{ background: pickerColor().toString("css") }}
            />
            <span class="text-xs text-primary-400">{pickerColor().toString("css")}</span>
          </div>
        </div>
      </Example>

      <Example
        title="ColorEditor"
        description="A full-featured, styled color editor combining area, wheel, sliders, and format input."
        code={`<ColorEditor value={color()} onChange={setColor} />`}
      >
        <div class="space-y-3">
          <ColorEditor value={editorColor()} onChange={setEditorColor} />
          <div class="flex items-center gap-2">
            <div
              class="w-6 h-6 rounded border border-bg-400"
              style={{ background: editorColor().toString("css") }}
            />
            <span class="text-xs text-primary-400">{editorColor().toString("css")}</span>
          </div>
        </div>
      </Example>

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>All color pickers support full keyboard navigation</li>
          <li>ColorSlider: Arrow keys adjust the value; Page Up/Down for larger steps</li>
          <li>ColorArea: Arrow keys move the 2D thumb</li>
          <li>ColorWheel: Arrow keys rotate the hue</li>
          <li>ColorField: Standard text input semantics with format validation</li>
          <li>ColorSwatchPicker: Arrow keys navigate swatches, Enter/Space selects</li>
          <li>
            Current color value is announced via <code>aria-valuetext</code>
          </li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
