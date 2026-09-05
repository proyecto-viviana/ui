export type DefaultVisualCase = {
  slug: string;
  title: string;
  threshold: {
    maxMismatchRatio: number;
    maxDimensionDelta: number;
    pixelThreshold: number;
  };
  /**
   * `"floor"` means the threshold is a coarse pair-diff ceiling, not
   * React-vs-Solid acceptance. A 40% ButtonGroup canvas miss can still pass
   * here. The exact-pair control gate (when one exists) lives on a tighter spec.
   */
  kind?: "asserted" | "floor";
  floorReason?: string;
};

export const defaultVisualCases: DefaultVisualCase[] = [
  {
    slug: "provider",
    title: "Provider",
    threshold: { maxMismatchRatio: 0.34, maxDimensionDelta: 2, pixelThreshold: 0 },
  },
  {
    slug: "button",
    title: "Button",
    threshold: { maxMismatchRatio: 0.18, maxDimensionDelta: 2, pixelThreshold: 0 },
  },
  {
    slug: "actionbutton",
    title: "ActionButton",
    threshold: { maxMismatchRatio: 0.18, maxDimensionDelta: 2, pixelThreshold: 0 },
  },
  {
    slug: "actionbuttongroup",
    title: "ActionButtonGroup",
    threshold: { maxMismatchRatio: 0.22, maxDimensionDelta: 24, pixelThreshold: 0 },
  },
  {
    slug: "buttongroup",
    title: "ButtonGroup",
    // FLOOR, not acceptance. 40% of the default canvas may diverge and this
    // test still passes. There is no `buttongroup.certified.spec.ts`. The exact
    // pair for the grouped control itself is
    // `grouped-button-controls-visual.spec.ts` (`expectExactScreenshotPair`).
    // Do not treat a green default-state pair as ButtonGroup visual parity.
    kind: "floor",
    floorReason:
      "ButtonGroup default canvas pair is a 40% mismatch floor, not React-vs-Solid acceptance. grouped-button-controls-visual.spec.ts is the exact-pair control gate; there is no D3 certified unit.",
    threshold: { maxMismatchRatio: 0.4, maxDimensionDelta: 4, pixelThreshold: 0 },
  },
  {
    slug: "togglebutton",
    title: "ToggleButton",
    threshold: { maxMismatchRatio: 0.18, maxDimensionDelta: 8, pixelThreshold: 0 },
  },
];
