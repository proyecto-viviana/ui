/* Panel 11 — Color. Every color-family component, wired to real register
   palette values (blues/ambers/violets/reds — no green), composed from the
   shared Panel/Demo/Row chrome. */
import { createFileRoute } from "@tanstack/solid-router";
import { For } from "solid-js";
import {
  ColorArea,
  ColorEditor,
  ColorField,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  ColorSwatchPickerItem,
  ColorWheel,
} from "@proyecto-viviana/ui";
import { Demo, Panel, Row } from "@/components/showcase/chrome";
import { panelBySlug, panelSeo } from "@/components/showcase/registry";

export const Route = createFileRoute("/showcase/color")({
  head: () => panelSeo("color"),
  component: ColorPanel,
});

const FIELD_SIZES = ["S", "M", "L", "XL"] as const;
const SWATCH_SIZES = ["XS", "S", "M", "L"] as const;
const SWATCH_ROUNDING = ["default", "none", "full"] as const;
const PALETTE = ["#2e90fa", "#f79009", "#8b5cf6", "#f04438"] as const;

function ColorPanel() {
  const def = panelBySlug("color")!;

  return (
    <Panel def={def}>
      <Demo label="ColorArea · 2D gradient — drag to set saturation & lightness">
        <ColorArea
          defaultValue="hsl(210, 100%, 50%)"
          xChannel="saturation"
          yChannel="lightness"
          aria-label="Color"
        />
      </Demo>

      <Demo label="ColorWheel · hue ring — drag around the track">
        <ColorWheel defaultValue="hsl(210, 100%, 50%)" aria-label="Hue" />
      </Demo>

      <Demo label="ColorSlider · channel — hue and alpha">
        <Row>
          <ColorSlider channel="hue" defaultValue="hsl(210, 100%, 50%)" label="Hue" />
          <ColorSlider channel="alpha" defaultValue="hsla(210, 100%, 50%, 0.6)" label="Alpha" />
        </Row>
      </Demo>

      <Demo label="ColorField · hex input — sizes">
        <Row>
          <For each={FIELD_SIZES}>
            {(size) => (
              <ColorField size={size} defaultValue="#2e90fa" aria-label={`Color ${size}`} />
            )}
          </For>
        </Row>
      </Demo>

      <Demo label="ColorSwatch · sizes">
        <Row>
          <For each={SWATCH_SIZES}>
            {(size) => <ColorSwatch size={size} color="#2e90fa" aria-label={`Swatch ${size}`} />}
          </For>
        </Row>
      </Demo>

      <Demo label="ColorSwatch · rounding">
        <Row>
          <For each={SWATCH_ROUNDING}>
            {(rounding) => (
              <ColorSwatch rounding={rounding} color="#8b5cf6" aria-label={`Swatch ${rounding}`} />
            )}
          </For>
        </Row>
      </Demo>

      <Demo label="ColorSwatchPicker · palette — blues, ambers, violets, reds, no green">
        <ColorSwatchPicker aria-label="Accent color" defaultValue={PALETTE[0]}>
          <For each={PALETTE}>{(color) => <ColorSwatch color={color} />}</For>
        </ColorSwatchPicker>
      </Demo>

      <Demo label="ColorSwatchPickerItem · explicit items — compatibility composition">
        <ColorSwatchPicker
          aria-label="Accent color, explicit items"
          defaultValue={PALETTE[1]}
          rounding="full"
        >
          <For each={PALETTE}>{(color) => <ColorSwatchPickerItem color={color} />}</For>
        </ColorSwatchPicker>
      </Demo>

      <Demo label="ColorEditor · full editor — area, hue & alpha sliders, format select, channel fields">
        <ColorEditor defaultValue="hsl(210, 100%, 50%)" />
      </Demo>
    </Panel>
  );
}
