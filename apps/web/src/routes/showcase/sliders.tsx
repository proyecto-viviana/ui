/* Panel 13 — Sliders. Continuous input: single and range, composed from the
   shared Panel/Demo/Row chrome per the buttons.tsx exemplar. The filled
   track is always the register's accent — there is no neutral fill to
   sweep, so size, track style, and disabled state carry these demos. */
import { createFileRoute } from "@tanstack/solid-router";
import { For } from "solid-js";
import { RangeSlider, Slider } from "@proyecto-viviana/ui";
import { Demo, Panel, Row } from "@/components/showcase/chrome";
import { panelBySlug } from "@/components/showcase/registry";

export const Route = createFileRoute("/showcase/sliders")({
  component: Page,
});

const SIZES = ["S", "M", "L", "XL"] as const;
const SIZE_LABELS: Record<(typeof SIZES)[number], string> = {
  S: "Small",
  M: "Medium",
  L: "Large",
  XL: "Extra large",
};
const TRACK_STYLES = ["thin", "thick"] as const;
const TRACK_STYLE_LABELS: Record<(typeof TRACK_STYLES)[number], string> = {
  thin: "Thin",
  thick: "Thick",
};

function Page() {
  const def = panelBySlug("sliders")!;

  return (
    <Panel def={def}>
      <Demo label="Slider · basic — filled track reads the current value">
        <Row>
          <Slider label="Volume" defaultValue={40} />
        </Row>
      </Demo>

      <Demo label="Slider · min, max, step">
        <Row>
          <Slider label="Zoom" minValue={50} maxValue={200} step={10} defaultValue={100} />
        </Row>
      </Demo>

      <Demo label="Slider · track styles">
        <Row>
          <For each={TRACK_STYLES}>
            {(trackStyle) => (
              <Slider
                label={TRACK_STYLE_LABELS[trackStyle]}
                trackStyle={trackStyle}
                defaultValue={60}
              />
            )}
          </For>
        </Row>
      </Demo>

      <Demo label="Slider · sizes">
        <Row>
          <For each={SIZES}>
            {(size) => <Slider label={SIZE_LABELS[size]} size={size} defaultValue={50} />}
          </For>
        </Row>
      </Demo>

      <Demo label="Slider · states">
        <Row>
          <Slider label="Disabled" defaultValue={30} isDisabled />
        </Row>
      </Demo>

      <Demo label="RangeSlider · basic">
        <Row>
          <RangeSlider label="Price range" defaultValue={{ start: 20, end: 80 }} />
        </Row>
      </Demo>

      <Demo label="RangeSlider · sizes">
        <Row>
          <For each={SIZES}>
            {(size) => (
              <RangeSlider
                label={SIZE_LABELS[size]}
                size={size}
                defaultValue={{ start: 20, end: 80 }}
              />
            )}
          </For>
        </Row>
      </Demo>

      <Demo label="RangeSlider · states">
        <Row>
          <RangeSlider label="Disabled" defaultValue={{ start: 30, end: 70 }} isDisabled />
        </Row>
      </Demo>
    </Panel>
  );
}
