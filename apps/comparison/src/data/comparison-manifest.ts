import {
  reactSpectrumCatalogue,
  reactSpectrumCatalogueSource,
  type ReactSpectrumCatalogueCategory,
} from "./react-spectrum-catalogue";

export type ComparisonLayerId = "styled" | "components" | "headless" | "state";
export type ComponentStatus = "parity" | "composition" | "tracked-gap";
export type ComparisonSlug = string;
export type ParityStatus = "matched" | "partial" | "gap";
export type DemoStatus = "live" | "tracked" | "missing" | "na";
export type CatalogueSource = "react-spectrum-s2";

export interface LayerTrack {
  label: string;
  summary: string;
  react: DemoStatus;
  solid: DemoStatus;
  note: string;
}

export interface ComparisonEntry {
  slug: ComparisonSlug;
  title: string;
  category: ReactSpectrumCatalogueCategory;
  componentStatus: ComponentStatus;
  summary: string;
  parity: ParityStatus;
  priority: "live" | "tracked";
  gapSummary: string[];
  docsUrl?: string;
  catalogueSource: CatalogueSource;
  layers: Record<ComparisonLayerId, LayerTrack>;
}

export const layerOrder: ComparisonLayerId[] = ["styled", "components", "headless", "state"];

function layerTrack(
  label: string,
  summary: string,
  react: DemoStatus,
  solid: DemoStatus,
  note: string,
): LayerTrack {
  return { label, summary, react, solid, note };
}

function createGapEntry(input: {
  slug: string;
  title: string;
  category: ReactSpectrumCatalogueCategory;
  docsUrl: string;
}): ComparisonEntry {
  return {
    slug: input.slug,
    title: input.title,
    category: input.category,
    componentStatus: "tracked-gap",
    summary: `${input.title} is listed in the official React Spectrum S2 catalogue and is on the comparison roadmap.`,
    parity: "gap",
    priority: "tracked",
    docsUrl: input.docsUrl,
    catalogueSource: "react-spectrum-s2",
    gapSummary: [
      "React Spectrum reference demo is not wired yet.",
      "Solid styled/component parity is marked missing until implemented and tested.",
      "State matrix and screenshot baselines are not yet captured.",
    ],
    layers: {
      styled: layerTrack(
        `Styled ${input.title}`,
        "Official React Spectrum component vs Solid styled implementation.",
        "tracked",
        "missing",
        "Roadmap entry. Wire the exact React Spectrum component first, then implement Solid parity and state screenshots.",
      ),
      components: layerTrack(
        `Component ${input.title}`,
        "Component-layer parity target where a lower-level component exists.",
        "tracked",
        "missing",
        "Tracked separately from the styled surface so missing lower-layer APIs stay visible.",
      ),
      headless: layerTrack(
        `Headless ${input.title}`,
        "ARIA behavior primitives and keyboard contract.",
        "tracked",
        "missing",
        "Use semantic queries and real user-like interactions before styling assertions.",
      ),
      state: layerTrack(
        `${input.title} State`,
        "State primitives and controlled/uncontrolled behavior.",
        "tracked",
        "missing",
        "State coverage must be component-specific rather than blindly canonical.",
      ),
    },
  };
}

function styledLiveOfficialEntry(input: {
  slug: string;
  title: string;
  category: ReactSpectrumCatalogueCategory;
  summary: string;
  styledSummary: string;
  styledNote: string;
}): ComparisonEntry {
  return {
    ...createGapEntry({
      slug: input.slug,
      title: input.title,
      category: input.category,
      docsUrl: `${reactSpectrumCatalogueSource.docsBase}/${input.title.replace(/\s+/g, "")}`,
    }),
    componentStatus: "tracked-gap",
    summary: input.summary,
    parity: "partial",
    priority: "live",
    gapSummary: [
      "Styled React Spectrum and Solid comparison islands are mounted.",
      "Default screenshots and strict zero-tolerance pair-diff tests are committed.",
      "The entry remains a tracked gap until those pair-diff tests pass pixel-perfectly and exhaustive state coverage is complete.",
    ],
    layers: {
      styled: layerTrack(
        `Styled ${input.title}`,
        input.styledSummary,
        "live",
        "live",
        input.styledNote,
      ),
      components: layerTrack(
        `Component ${input.title}`,
        "Component-layer parity target.",
        "tracked",
        "tracked",
        "Tracked separately from the styled Spectrum comparison surface.",
      ),
      headless: layerTrack(
        `Headless ${input.title}`,
        "ARIA behavior hooks below the styled layer.",
        "tracked",
        "tracked",
        "Tracked for keyboard, focus, and semantic parity once the styled surface is stable.",
      ),
      state: layerTrack(
        `${input.title} State`,
        "Component-specific state coverage.",
        "tracked",
        "tracked",
        "State screenshots and assertions should be added per component rather than using a generic matrix blindly.",
      ),
    },
  };
}

const entryOverrides: Record<string, ComparisonEntry> = {
  provider: {
    ...createGapEntry({
      slug: "provider",
      title: "Provider",
      category: "Components",
      docsUrl: `${reactSpectrumCatalogueSource.docsBase}/Provider`,
    }),
    componentStatus: "tracked-gap",
    summary: "Root-scoped theming, inherited props, locale, direction, and overlay containment.",
    parity: "partial",
    priority: "live",
    gapSummary: [
      "Styled provider demos are mounted in both ecosystems.",
      "Provider is not accepted as matched until its strict pair-diff test passes pixel-perfectly.",
      "Component and headless layers are utility-level rather than end-user primitives.",
    ],
    layers: {
      styled: layerTrack(
        "Styled Provider",
        "Theme scope, inheritance, and nested overrides.",
        "live",
        "live",
        "This is the main parity target after the provider work.",
      ),
      components: layerTrack(
        "Component Utilities",
        "Provider-like utility composition for headless components.",
        "tracked",
        "tracked",
        "Not yet rendered as a first-class showcase because the parity target is the styled Provider surface.",
      ),
      headless: layerTrack(
        "ARIA Utilities",
        "Locale, direction, and modal plumbing below the styled layer.",
        "na",
        "na",
        "Tracked in source review rather than a visual comparison.",
      ),
      state: layerTrack(
        "State Layer",
        "Provider itself is not a state primitive.",
        "na",
        "na",
        "No direct state-layer equivalent to render here.",
      ),
    },
  },

  button: {
    ...createGapEntry({
      slug: "button",
      title: "Button",
      category: "Components",
      docsUrl: `${reactSpectrumCatalogueSource.docsBase}/Button`,
    }),
    componentStatus: "tracked-gap",
    summary:
      "Baseline parity probe across styled, component, and headless layers with inherited provider props.",
    parity: "partial",
    priority: "live",
    gapSummary: [
      "Styled, component, and headless button demos are all live.",
      "Styled Button is not accepted as matched until the strict S2 pair-diff test is pixel-perfect.",
      "Next work is exhaustive variant/state screenshot coverage after default styling parity is fixed.",
    ],
    layers: {
      styled: layerTrack(
        "Styled Button",
        "React Spectrum Button vs Solid Spectrum Button.",
        "live",
        "live",
        "Solid renders @proyecto-viviana/solid-spectrum Button with S2-derived generated styles and solidaria-components behavior.",
      ),
      components: layerTrack(
        "Component Button",
        "react-aria-components Button vs solidaria-components Button.",
        "live",
        "live",
        "Useful for parity below the design-system skin.",
      ),
      headless: layerTrack(
        "Headless Button",
        "useButton vs createButton.",
        "live",
        "live",
        "This layer validates the normalized press behavior API directly.",
      ),
      state: layerTrack(
        "State Layer",
        "Buttons do not have an independent state primitive.",
        "na",
        "na",
        "No dedicated state layer for simple press actions.",
      ),
    },
  },

  actionbutton: styledLiveOfficialEntry({
    slug: "actionbutton",
    title: "ActionButton",
    category: "Components",
    summary: "Task-oriented ActionButton reference mounted with React Spectrum and Solid Spectrum.",
    styledSummary: "React Spectrum ActionButton vs Solid Spectrum ActionButton.",
    styledNote:
      "React uses @react-spectrum/s2 ActionButton directly; Solid uses @proyecto-viviana/solid-spectrum ActionButton with S2-derived styles.",
  }),

  actionbuttongroup: styledLiveOfficialEntry({
    slug: "actionbuttongroup",
    title: "ActionButtonGroup",
    category: "Components",
    summary: "Related action collection with single selection and action tracking on both stacks.",
    styledSummary: "React Spectrum ActionButtonGroup vs Solid Spectrum ActionButtonGroup.",
    styledNote:
      "React uses @react-spectrum/s2 ActionButtonGroup and ActionButton directly; Solid uses @proyecto-viviana/solid-spectrum ActionButtonGroup and ActionButton.",
  }),

  buttongroup: styledLiveOfficialEntry({
    slug: "buttongroup",
    title: "ButtonGroup",
    category: "Components",
    summary: "Grouped related buttons mounted on both stacks for layout and overflow parity work.",
    styledSummary: "React Spectrum ButtonGroup vs Solid Spectrum ButtonGroup.",
    styledNote:
      "React uses @react-spectrum/s2 ButtonGroup directly; Solid uses @proyecto-viviana/solid-spectrum ButtonGroup and Button.",
  }),

  linkbutton: styledLiveOfficialEntry({
    slug: "linkbutton",
    title: "LinkButton",
    category: "Components",
    summary: "Navigation link rendered with S2 Button visual treatment on both stacks.",
    styledSummary: "React Spectrum LinkButton vs Solid Spectrum LinkButton.",
    styledNote:
      "React uses @react-spectrum/s2 LinkButton directly; Solid uses @proyecto-viviana/solid-spectrum LinkButton with S2-derived button styles and solidaria-components link behavior.",
  }),

  togglebutton: styledLiveOfficialEntry({
    slug: "togglebutton",
    title: "ToggleButton",
    category: "Components",
    summary: "Selectable action button mounted on both stacks with controlled selected-state data.",
    styledSummary: "React Spectrum ToggleButton vs Solid Spectrum ToggleButton.",
    styledNote:
      "React uses @react-spectrum/s2 ToggleButton directly; Solid uses @proyecto-viviana/solid-spectrum ToggleButton with S2-derived styles.",
  }),

  togglebuttongroup: styledLiveOfficialEntry({
    slug: "togglebuttongroup",
    title: "ToggleButtonGroup",
    category: "Components",
    summary:
      "Related selectable ToggleButtons mounted on both stacks with controlled single-selection state.",
    styledSummary: "React Spectrum ToggleButtonGroup vs Solid Spectrum ToggleButtonGroup.",
    styledNote:
      "React uses @react-spectrum/s2 ToggleButtonGroup and ToggleButton directly; Solid uses @proyecto-viviana/solid-spectrum ToggleButtonGroup and ToggleButton with S2-derived group styles.",
  }),

  segmentedcontrol: styledLiveOfficialEntry({
    slug: "segmentedcontrol",
    title: "SegmentedControl",
    category: "Components",
    summary: "Mutually exclusive view-switching control mounted on both stacks.",
    styledSummary: "React Spectrum SegmentedControl vs Solid Spectrum SegmentedControl.",
    styledNote:
      "React uses @react-spectrum/s2 SegmentedControl and SegmentedControlItem directly; Solid uses @proyecto-viviana/solid-spectrum SegmentedControl and SegmentedControlItem over the shared headless toggle group semantics.",
  }),

  selectboxgroup: styledLiveOfficialEntry({
    slug: "selectboxgroup",
    title: "SelectBoxGroup",
    category: "Components",
    summary: "Selectable card list mounted on both stacks with controlled single selection.",
    styledSummary: "React Spectrum SelectBoxGroup vs Solid Spectrum SelectBoxGroup.",
    styledNote:
      "React uses @react-spectrum/s2 SelectBoxGroup and SelectBox directly; Solid uses @proyecto-viviana/solid-spectrum SelectBoxGroup and SelectBox over the shared headless ListBox semantics.",
  }),

  cardview: styledLiveOfficialEntry({
    slug: "cardview",
    title: "CardView",
    category: "Components",
    summary: "Selectable card collection mounted on both stacks with controlled single selection.",
    styledSummary: "React Spectrum CardView vs Solid Spectrum CardView.",
    styledNote:
      "React uses @react-spectrum/s2 CardView and Card directly; Solid uses @proyecto-viviana/solid-spectrum CardView and Card over the shared headless GridList semantics.",
  }),

  checkbox: styledLiveOfficialEntry({
    slug: "checkbox",
    title: "Checkbox",
    category: "Components",
    summary: "Binary selection control mounted on both stacks with controlled selected state.",
    styledSummary: "React Spectrum Checkbox vs Solid Spectrum Checkbox.",
    styledNote:
      "React uses @react-spectrum/s2 Checkbox directly; Solid uses @proyecto-viviana/solid-spectrum Checkbox with S2-derived box, icon, baseline, and press-scale styling.",
  }),

  textfield: styledLiveOfficialEntry({
    slug: "textfield",
    title: "TextField",
    category: "Components",
    summary: "Single-line text entry with S2 field layout, help text, validation, and value state.",
    styledSummary: "React Spectrum TextField vs Solid Spectrum TextField.",
    styledNote:
      "React uses @react-spectrum/s2 TextField directly; Solid uses @proyecto-viviana/solid-spectrum TextField with S2-derived label, field group, input, help text, and validation styling.",
  }),

  searchfield: styledLiveOfficialEntry({
    slug: "searchfield",
    title: "SearchField",
    category: "Components",
    summary: "Search text entry with S2 pill field layout, icon, clear action, and value state.",
    styledSummary: "React Spectrum SearchField vs Solid Spectrum SearchField.",
    styledNote:
      "React uses @react-spectrum/s2 SearchField directly; Solid uses @proyecto-viviana/solid-spectrum SearchField with S2-derived label, pill field group, search icon, clear button, input, help text, and validation styling.",
  }),

  tabs: {
    ...createGapEntry({
      slug: "tabs",
      title: "Tabs",
      category: "Components",
      docsUrl: `${reactSpectrumCatalogueSource.docsBase}/Tabs`,
    }),
    componentStatus: "parity",
    summary:
      "Strong parity slice because it spans styled and component layers and relies on collection semantics.",
    parity: "partial",
    priority: "live",
    gapSummary: [
      "React styled tab demo is mounted from @react-spectrum/s2.",
      "Solid styled tab wiring was removed from the comparison app until it renders the real solid-spectrum component again.",
      "State matrix and visual baselines still need expansion after Solid wiring returns.",
    ],
    layers: {
      styled: layerTrack(
        "Styled Tabs",
        "React Spectrum Tabs vs Solid Spectrum Tabs.",
        "live",
        "missing",
        "Solid styled Tabs are not live until the route imports and renders @proyecto-viviana/solid-spectrum Tabs.",
      ),
      components: layerTrack(
        "Component Tabs",
        "react-aria-components Tabs vs solidaria-components Tabs.",
        "live",
        "live",
        "React and Solid component tab demos are both mounted and comparable in the app runtime.",
      ),
      headless: layerTrack(
        "Headless Tabs",
        "Tabs behavior hooks below the component layer.",
        "tracked",
        "tracked",
        "Planned after the first comparison app slice is stable.",
      ),
      state: layerTrack(
        "Tabs State",
        "react-stately tabs state vs solid-stately tabs state.",
        "tracked",
        "tracked",
        "Valuable, but not yet visualized.",
      ),
    },
  },

  ...Object.fromEntries(
    (
      [
        ["dialog", "Dialog"],
        ["datepicker", "DatePicker"],
        ["tooltip", "Tooltip"],
        ["toast", "Toast"],
      ] as const
    ).map(([slug, title]) => [
      slug,
      {
        ...createGapEntry({
          slug,
          title,
          category: "Components",
          docsUrl: `${reactSpectrumCatalogueSource.docsBase}/${title}`,
        }),
        componentStatus: "parity",
        summary: `${title} has an initial live comparison island. Exhaustive states remain open.`,
        parity: "partial",
        priority: "live",
        gapSummary: [
          title === "Toast"
            ? "React Spectrum Toast reference remains tracked."
            : "React styled island remains mounted from @react-spectrum/s2.",
          "Solid styled wiring was removed from the comparison app until it renders the real solid-spectrum component again.",
          "Detailed state matrices and strict visual assertions remain incomplete.",
        ],
        layers: {
          styled: layerTrack(
            `Styled ${title}`,
            `React Spectrum ${title} vs Solid styled implementation.`,
            title === "Toast" ? "tracked" : "live",
            "missing",
            title === "Toast"
              ? "Solid styled Toast is not live until the route imports and renders @proyecto-viviana/solid-spectrum Toast."
              : `Solid styled ${title} is not live until the route imports and renders the real solid-spectrum component.`,
          ),
          components: layerTrack(
            `Component ${title}`,
            "Component-layer parity target.",
            title === "Toast" ? "tracked" : "live",
            "tracked",
            "Solid component comparison is still tracked separately from the styled island.",
          ),
          headless: layerTrack(
            `Headless ${title}`,
            "ARIA behavior hooks below the component layer.",
            "tracked",
            "tracked",
            "Tracked for later keyboard and screen reader parity work.",
          ),
          state: layerTrack(
            `${title} State`,
            "State-layer parity where a dedicated state primitive exists.",
            "tracked",
            "tracked",
            "Tracked in source/test parity rather than this initial visual island.",
          ),
        },
      } satisfies ComparisonEntry,
    ]),
  ),
};

const officialEntries = reactSpectrumCatalogue.map((catalogueEntry) => {
  const baseEntry = createGapEntry({
    slug: catalogueEntry.slug,
    title: catalogueEntry.title,
    category: catalogueEntry.category,
    docsUrl: catalogueEntry.docsPath,
  });

  return entryOverrides[catalogueEntry.slug] ?? baseEntry;
});

export const comparisonEntries: ComparisonEntry[] = officialEntries;

export const officialComparisonEntries = comparisonEntries.filter(
  (entry) => entry.catalogueSource === "react-spectrum-s2",
);

export const missingOfficialComparisonEntries = officialComparisonEntries.filter(
  (entry) => entry.layers.styled.react !== "live" || entry.layers.styled.solid !== "live",
);

export function getComparisonEntry(slug: string): ComparisonEntry | undefined {
  return comparisonEntries.find((entry) => entry.slug === slug);
}
