/* Panel 15 — Scene & HUD. The two atmosphere components the register needs but
   S2 has no counterpart for: SceneBackdrop paints the graded, dithered scene a
   hero sits on, and HudFrame puts the corner brackets, CRT grille and scan
   sweep around media. Both are pure scenery — aria-hidden, pointer-events:none
   — so everything here is decoration around real content, never instead of it. */
import { createFileRoute } from "@tanstack/solid-router";
import { type JSX } from "solid-js";
import { Flex, Heading, HudFrame, SceneBackdrop, Text } from "@proyecto-viviana/ui";
import { Demo, Panel, Row } from "@/components/showcase/chrome";
import { panelBySlug, panelSeo } from "@/components/showcase/registry";
import { useTheme } from "@/utils/theme";

export const Route = createFileRoute("/showcase/scene")({
  head: () => panelSeo("scene"),
  component: Page,
});

const captionStyle: JSX.CSSProperties = {
  font: "var(--type-terminal)",
  "font-family": "var(--font-mono)",
  color: "var(--text-secondary)",
};

/* SceneBackdrop pins itself to its parent, so the parent is what decides the
   hero's size and stacking. */
const heroStyle: JSX.CSSProperties = {
  position: "relative",
  "min-height": "260px",
  overflow: "hidden",
  "border-radius": "8px",
  display: "flex",
  "align-items": "flex-end",
};

const heroContentStyle: JSX.CSSProperties = {
  position: "relative",
  padding: "24px",
};

const mediaStyle: JSX.CSSProperties = {
  display: "block",
  width: "100%",
  height: "180px",
  "object-fit": "cover",
};

function Page() {
  const def = panelBySlug("scene")!;
  const { isDark } = useTheme();
  const plate = () => `/glasselated/${isDark() ? "bg-scene-night" : "bg-scene"}.png`;

  return (
    <Panel def={def}>
      <Demo label="SceneBackdrop — the graded, pixelated plate under a hero, with the dithered veil over it">
        <div style={heroStyle}>
          <SceneBackdrop src={plate()} />
          <div style={heroContentStyle}>
            <Heading level={2}>Now rendering</Heading>
            <Text>
              The scene is scenery: it is aria-hidden and takes no pointer events, so the copy above
              it keeps every bit of its own semantics.
            </Text>
          </div>
        </div>
      </Demo>

      <Demo label="SceneBackdrop · generated layers — skyline and perspective grid with no image at all">
        <div style={heroStyle}>
          <SceneBackdrop skyline grid sweep />
          <div style={heroContentStyle}>
            <span style={captionStyle}>skyline + grid + sweep · no src</span>
          </div>
        </div>
      </Demo>

      <Demo label="HudFrame · brackets — S (14px arms), M (22px), L (26px)">
        <Row>
          <Flex direction="column" gap="xs">
            <HudFrame brackets="S">
              <img src="/glasselated/thumb-1.png" alt="" style={mediaStyle} width="320" />
            </HudFrame>
            <span style={captionStyle}>brackets=&quot;S&quot;</span>
          </Flex>
          <Flex direction="column" gap="xs">
            <HudFrame brackets="M" scanlines>
              <img src="/glasselated/thumb-1.png" alt="" style={mediaStyle} width="320" />
            </HudFrame>
            <span style={captionStyle}>brackets=&quot;M&quot; · scanlines</span>
          </Flex>
          <Flex direction="column" gap="xs">
            <HudFrame brackets="L" channel="live" sweep>
              <img src="/glasselated/thumb-1.png" alt="" style={mediaStyle} width="320" />
            </HudFrame>
            <span style={captionStyle}>
              brackets=&quot;L&quot; · channel=&quot;live&quot; · sweep
            </span>
          </Flex>
        </Row>
      </Demo>
    </Panel>
  );
}
