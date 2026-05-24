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
      "Current visual evidence and strict zero-tolerance pair-diff tests are tracked per component.",
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
        "State visual evidence and assertions should be added per component rather than using a generic matrix blindly.",
      ),
    },
  };
}

const entryOverrides: Record<string, ComparisonEntry> = {
  accordion: styledLiveOfficialEntry({
    slug: "accordion",
    title: "Accordion",
    category: "Components",
    summary:
      "Collapsible disclosure group mounted on both stacks with S2 size, density, quiet, disabled, and multiple-expansion controls.",
    styledSummary: "React Spectrum Accordion vs Solid Spectrum Accordion.",
    styledNote:
      "React uses @react-spectrum/s2 Accordion directly; Solid uses @proyecto-viviana/solid-spectrum Accordion with the S2 Disclosure title/header/panel composition and solidaria disclosure state.",
  }),

  disclosure: styledLiveOfficialEntry({
    slug: "disclosure",
    title: "Disclosure",
    category: "Components",
    summary:
      "Standalone collapsible section mounted on both stacks with S2 size, density, quiet, disabled, controlled expansion, panel role, title level, and header-action controls.",
    styledSummary: "React Spectrum Disclosure vs Solid Spectrum Disclosure.",
    styledNote:
      "React uses @react-spectrum/s2/Disclosure directly; Solid uses @proyecto-viviana/solid-spectrum Disclosure backed by solidaria disclosure state and S2 title/header/panel styling.",
  }),

  actionbar: styledLiveOfficialEntry({
    slug: "actionbar",
    title: "ActionBar",
    category: "Components",
    summary:
      "Bulk-selection ActionBar route mounted on both stacks with selected-count controls, clear-selection behavior, and ActionButton children.",
    styledSummary: "React Spectrum ActionBar vs Solid Spectrum ActionBar.",
    styledNote:
      "React uses @react-spectrum/s2 ActionBar directly; Solid uses @proyecto-viviana/solid-spectrum ActionBar with Solidaria ActionBar behavior while S2 visual parity work continues.",
  }),

  actionmenu: styledLiveOfficialEntry({
    slug: "actionmenu",
    title: "ActionMenu",
    category: "Components",
    summary:
      "More-actions menu route mounted on both stacks with S2 viewer controls for trigger size, menu size, alignment, direction, quiet state, and disabled state.",
    styledSummary: "React Spectrum ActionMenu vs Solid Spectrum ActionMenu.",
    styledNote:
      "React uses @react-spectrum/s2 ActionMenu with the official compositional MenuItem example; Solid uses @proyecto-viviana/solid-spectrum ActionMenu with static JSX MenuItem composition, the public trigger-facing API, localized default label, generated S2 More icon, generated S2 menu/item styling, pressScale trigger motion, and closed-trigger, open-menu, trigger interaction, placement-axis, forced-colors, reduced-motion, semantic accessibility, touch, virtual activation, target-size, and contrast evidence.",
  }),

  menu: styledLiveOfficialEntry({
    slug: "menu",
    title: "Menu",
    category: "Components",
    summary:
      "Compositional Menu route mounted on both stacks with S2 MenuTrigger placement controls, ActionButton trigger sizing, menu sizing, disabled trigger state, and selection modes.",
    styledSummary: "React Spectrum Menu vs Solid Spectrum Menu.",
    styledNote:
      "React uses @react-spectrum/s2 MenuTrigger, ActionButton, Menu, MenuItem, Text, and Keyboard directly; Solid uses @proyecto-viviana/solid-spectrum with the public Menu subpath, MenuContext export, top-level MenuTrigger popover behavior, generated S2 menu/item styling, and browser route contracts for action, selection, keyboard, and cleanup behavior.",
  }),

  breadcrumbs: styledLiveOfficialEntry({
    slug: "breadcrumbs",
    title: "Breadcrumbs",
    category: "Components",
    summary:
      "Hierarchy navigation route mounted on both stacks with S2 size, disabled, dynamic collection action, and responsive overflow breadcrumb menu controls.",
    styledSummary: "React Spectrum Breadcrumbs vs Solid Spectrum Breadcrumbs.",
    styledNote:
      "React uses @react-spectrum/s2 Breadcrumbs and Breadcrumb directly; Solid uses @proyecto-viviana/solid-spectrum with the public Breadcrumbs subpath, BreadcrumbsContext export, static child support, dynamic collection actions, link DOM props, and responsive overflow measurement composition.",
  }),

  calendar: styledLiveOfficialEntry({
    slug: "calendar",
    title: "Calendar",
    category: "Components",
    summary:
      "Single-date Calendar route mounted on both stacks with the official viewer controls plus route-testable value, validation, unavailable-date, immutable, locale calendar, and custom calendar states.",
    styledSummary: "React Spectrum Calendar vs Solid Spectrum Calendar.",
    styledNote:
      "React uses @react-spectrum/s2 Calendar directly; Solid uses @proyecto-viviana/solid-spectrum with the public Calendar subpath, CalendarContext export and root ref merge, S2 firstDayOfWeek string normalization, invalid selected-cell error description linkage, localized RangeCalendar selection prompt descriptions across React Aria's prompt locale set, multi-month grid composition and heading spacer parity, pageBehavior/selectionAlignment state support, keyboard matrix parity, focus/reset state parity, keyboard/virtual focus-visible cell state, unavailable-date strike parity, Unicode display calendars, custom createCalendar routing, forced-colors computed contracts, seven-column default grid geometry, S2 header/nav token parity, and strict zero-tolerance Calendar-root pair diff evidence for the deterministic unselected grid, controlled selected date, and deterministic multi-month layout.",
  }),

  rangecalendar: styledLiveOfficialEntry({
    slug: "rangecalendar",
    title: "RangeCalendar",
    category: "Components",
    summary:
      "Date-range Calendar route mounted on both stacks with controlled range value, focusedValue, validation, unavailable-date, non-contiguous range, paging, first weekday, and multi-month controls.",
    styledSummary: "React Spectrum RangeCalendar vs Solid Spectrum RangeCalendar.",
    styledNote:
      "React uses @react-spectrum/s2 RangeCalendar directly; Solid uses @proyecto-viviana/solid-spectrum RangeCalendar with S2 header/nav styling, strict zero-tolerance month-grid pair diffs, a bounded isolated root shell pair diff, exact seven-column month grid geometry, root ref/context merging, controlled range value, validation error linkage, unavailable-date strike treatment, firstDayOfWeek string normalization, Provider locale and Unicode/custom calendar routing, forced-colors computed contracts, visibleMonths/pageBehavior/selectionAlignment routing, and DateRangePicker popover reuse without the old fixed-width gutter.",
  }),

  toast: styledLiveOfficialEntry({
    slug: "toast",
    title: "Toast",
    category: "Components",
    summary:
      "Toast route mounted on both stacks with S2 ToastContainer/ToastQueue primitives, variant methods, placement, multi-toast stack controls, action, close-on-action, timeout, and Notifications landmark controls.",
    styledSummary:
      "React Spectrum ToastContainer/ToastQueue vs Solid Spectrum ToastContainer/ToastQueue.",
    styledNote:
      "React uses @react-spectrum/s2 ToastContainer and ToastQueue directly; Solid uses @proyecto-viviana/solid-spectrum ToastContainer and ToastQueue on top of Solidaria/Solid Stately toast primitives with S2 variant mapping, S2-localized Show all/Clear all/Collapse controls, default bottom placement, collapsed/expanded stack controls, the Notifications F6 landmark, Solid top-layer overlay/live-region exclusion marker, focus transfer/restoration on removed toasts, DOM option passthrough, clear-without-onClose parity, 5s minimum auto-dismiss, actionable-toast no-auto-dismiss behavior, and bounded default-surface React-vs-Solid pair-diff evidence.",
  }),

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

  avatar: styledLiveOfficialEntry({
    slug: "avatar",
    title: "Avatar",
    category: "Components",
    summary:
      "Entity thumbnail mounted on both stacks with numeric S2 sizing and over-background outline coverage.",
    styledSummary: "React Spectrum Avatar vs Solid Spectrum Avatar.",
    styledNote:
      "React uses @react-spectrum/s2 Avatar directly; Solid uses @proyecto-viviana/solid-spectrum Avatar with S2-derived image wrapper styling.",
  }),

  avatargroup: styledLiveOfficialEntry({
    slug: "avatargroup",
    title: "AvatarGroup",
    category: "Components",
    summary:
      "Related avatar collection mounted on both stacks with S2 overlap, label, and child context coverage.",
    styledSummary: "React Spectrum AvatarGroup vs Solid Spectrum AvatarGroup.",
    styledNote:
      "React uses @react-spectrum/s2 AvatarGroup and Avatar directly; Solid uses @proyecto-viviana/solid-spectrum AvatarGroup and Avatar with S2-derived group and child context styling.",
  }),

  badge: styledLiveOfficialEntry({
    slug: "badge",
    title: "Badge",
    category: "Components",
    summary:
      "Color-categorized metadata badge mounted on both stacks with S2 variant, fill, size, overflow, icon, and skeleton wrapper coverage.",
    styledSummary: "React Spectrum Badge vs Solid Spectrum Badge.",
    styledNote:
      "React uses @react-spectrum/s2 Badge directly; Solid uses @proyecto-viviana/solid-spectrum Badge with S2-derived control, text, icon, and skeleton wrapper handling.",
  }),

  statuslight: styledLiveOfficialEntry({
    slug: "statuslight",
    title: "StatusLight",
    category: "Components",
    summary:
      "Color-coded status label mounted on both stacks with S2 semantic and categorical variants, size, role, text, and skeleton consumer coverage.",
    styledSummary: "React Spectrum StatusLight vs Solid Spectrum StatusLight.",
    styledNote:
      "React uses @react-spectrum/s2 StatusLight directly; Solid uses @proyecto-viviana/solid-spectrum StatusLight with S2-derived wrapper, SVG light, text, role, and skeleton handling.",
  }),

  meter: styledLiveOfficialEntry({
    slug: "meter",
    title: "Meter",
    category: "Components",
    summary:
      "Progress meter mounted on both stacks with S2 value range, label/value placement, semantic variants, static color, size, and skeleton wrapper coverage.",
    styledSummary: "React Spectrum Meter vs Solid Spectrum Meter.",
    styledNote:
      "React uses @react-spectrum/s2 Meter directly; Solid uses @proyecto-viviana/solid-spectrum Meter with S2-derived wrapper, label/value, track/fill, static color, and skeleton handling.",
  }),

  form: styledLiveOfficialEntry({
    slug: "form",
    title: "Form",
    category: "Components",
    summary:
      "Form layout and inherited field props mounted on both stacks with S2 grid, label placement, size, disabled, required, validation, and submit control coverage.",
    styledSummary: "React Spectrum Form vs Solid Spectrum Form.",
    styledNote:
      "React uses @react-spectrum/s2 Form directly; Solid uses @proyecto-viviana/solid-spectrum Form with S2-derived grid styling and FormContext inheritance into TextField and Button.",
  }),

  divider: styledLiveOfficialEntry({
    slug: "divider",
    title: "Divider",
    category: "Components",
    summary:
      "Visual separator mounted on both stacks with S2 orientation, thickness, static color, and separator semantics.",
    styledSummary: "React Spectrum Divider vs Solid Spectrum Divider.",
    styledNote:
      "React uses @react-spectrum/s2 Divider directly; Solid uses @proyecto-viviana/solid-spectrum Divider with S2-derived separator styling and solidaria-components semantics.",
  }),

  dropzone: styledLiveOfficialEntry({
    slug: "dropzone",
    title: "DropZone",
    category: "Components",
    summary:
      "Drag-and-drop upload target mounted on both stacks with S2 size, filled-state replacement banner, accessible hidden drop button, and callback-count evidence.",
    styledSummary: "React Spectrum DropZone vs Solid Spectrum DropZone.",
    styledNote:
      "React uses @react-spectrum/s2 DropZone and IllustratedMessage directly; Solid uses @proyecto-viviana/solid-spectrum DropZone with solidaria-components drag/drop behavior, S2-derived root/banner styling, localized replacement text, and IllustratedMessage drop-target context.",
  }),

  icons: styledLiveOfficialEntry({
    slug: "icons",
    title: "Icons",
    category: "Components",
    summary:
      "Icon primitive route mounted on both stacks with labelled, decorative, skeleton, and button-context icon usage.",
    styledSummary: "React Spectrum createIcon vs Solid Spectrum createIcon.",
    styledNote:
      "React uses @react-spectrum/s2 createIcon through the comparison icon primitive; Solid uses @proyecto-viviana/solid-spectrum createIcon with the same accessibility and contextual rendering states.",
  }),

  illustrations: styledLiveOfficialEntry({
    slug: "illustrations",
    title: "Illustrations",
    category: "Components",
    summary:
      "Illustration primitive route mounted on both stacks with labelled, decorative, and skeleton illustration usage.",
    styledSummary: "React Spectrum createIllustration vs Solid Spectrum createIllustration.",
    styledNote:
      "React uses @react-spectrum/s2 createIllustration through comparison illustration primitives; Solid uses @proyecto-viviana/solid-spectrum createIllustration with the same labelled, decorative, and loading-context states.",
  }),

  illustratedmessage: styledLiveOfficialEntry({
    slug: "illustratedmessage",
    title: "IllustratedMessage",
    category: "Components",
    summary:
      "Illustrated empty-state message mounted on both stacks with S2 size, orientation, illustration, heading, content, and action composition coverage.",
    styledSummary: "React Spectrum IllustratedMessage vs Solid Spectrum IllustratedMessage.",
    styledNote:
      "React uses @react-spectrum/s2 IllustratedMessage directly; Solid uses @proyecto-viviana/solid-spectrum IllustratedMessage with S2-derived grid, typography, illustration context, and ButtonGroup slot styling.",
  }),

  inlinealert: styledLiveOfficialEntry({
    slug: "inlinealert",
    title: "InlineAlert",
    category: "Components",
    summary:
      "Inline alert mounted on both stacks with S2 semantic variants, fill styles, autofocus, localized status icons, heading, and content composition coverage.",
    styledSummary: "React Spectrum InlineAlert vs Solid Spectrum InlineAlert.",
    styledNote:
      "React uses @react-spectrum/s2 InlineAlert directly; Solid uses @proyecto-viviana/solid-spectrum InlineAlert with S2-derived root, icon, heading/content context, focus ring, and localized icon labels.",
  }),

  image: styledLiveOfficialEntry({
    slug: "image",
    title: "Image",
    category: "Components",
    summary:
      "Image wrapper mounted on both stacks with loading, error, conditional source, and coordinator coverage.",
    styledSummary: "React Spectrum Image vs Solid Spectrum Image.",
    styledNote:
      "React uses @react-spectrum/s2 Image and ImageCoordinator directly; Solid uses @proyecto-viviana/solid-spectrum Image and ImageCoordinator with S2-derived wrapper, loading, error, and source behavior.",
  }),

  link: styledLiveOfficialEntry({
    slug: "link",
    title: "Link",
    category: "Components",
    summary:
      "Inline and standalone navigation link mounted on both stacks with S2 variant, static color, quiet, and skeleton text coverage.",
    styledSummary: "React Spectrum Link vs Solid Spectrum Link.",
    styledNote:
      "React uses @react-spectrum/s2 Link directly; Solid uses @proyecto-viviana/solid-spectrum Link with S2-derived text, focus, static color, and skeleton handling.",
  }),

  skeleton: styledLiveOfficialEntry({
    slug: "skeleton",
    title: "Skeleton",
    category: "Components",
    summary:
      "Skeleton wrapper mounted on both stacks with real Image, Text, and Icon children so loading context is visible.",
    styledSummary: "React Spectrum Skeleton vs Solid Spectrum Skeleton.",
    styledNote:
      "React uses @react-spectrum/s2 Skeleton directly; Solid uses @proyecto-viviana/solid-spectrum Skeleton with S2-derived loading styles, synchronized animation, and child context consumers.",
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
      "React uses @react-spectrum/s2 ToggleButton directly; Solid uses @proyecto-viviana/solid-spectrum ToggleButton with S2-derived styles, React Aria standalone-id/group-key semantics, and controlled aria-pressed selection.",
  }),

  togglebuttongroup: styledLiveOfficialEntry({
    slug: "togglebuttongroup",
    title: "ToggleButtonGroup",
    category: "Components",
    summary:
      "Related selectable ToggleButtons mounted on both stacks with controlled single-selection state.",
    styledSummary: "React Spectrum ToggleButtonGroup vs Solid Spectrum ToggleButtonGroup.",
    styledNote:
      "React uses @react-spectrum/s2 ToggleButtonGroup and ToggleButton directly; Solid uses @proyecto-viviana/solid-spectrum ToggleButtonGroup and ToggleButton with S2-derived group styles, React Aria single/multiple semantics, and S2 child-prop fallback behavior.",
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

  card: styledLiveOfficialEntry({
    slug: "card",
    title: "Card",
    category: "Components",
    summary: "Standalone object Card mounted on both stacks with preview, content, and text slots.",
    styledSummary: "React Spectrum Card vs Solid Spectrum Card.",
    styledNote:
      "React uses @react-spectrum/s2 Card, CardPreview, Image, Content, and Text directly; Solid uses @proyecto-viviana/solid-spectrum Card, CardPreview, Image, Content, and Text with S2-derived size, density, variant, preview, and slot styling.",
  }),

  cardview: styledLiveOfficialEntry({
    slug: "cardview",
    title: "CardView",
    category: "Components",
    summary: "Selectable card collection mounted on both stacks with controlled single selection.",
    styledSummary: "React Spectrum CardView vs Solid Spectrum CardView.",
    styledNote:
      "React uses @react-spectrum/s2 CardView and Card directly; Solid uses @proyecto-viviana/solid-spectrum CardView and Card over shared GridList semantics with source-backed layout options, selectionStyle to selectionBehavior mapping, controlled selection, and official Content/Text slot composition.",
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

  checkboxgroup: styledLiveOfficialEntry({
    slug: "checkboxgroup",
    title: "CheckboxGroup",
    category: "Components",
    summary:
      "Multi-selection option group with S2 field layout, checkbox group context, help text, and controlled value state.",
    styledSummary:
      "React Spectrum CheckboxGroup/Checkbox vs Solid Spectrum CheckboxGroup/Checkbox.",
    styledNote:
      "React uses @react-spectrum/s2 CheckboxGroup and Checkbox directly; Solid uses @proyecto-viviana/solid-spectrum CheckboxGroup and Checkbox with S2-derived field layout and group-propagated checkbox size/emphasis.",
  }),

  colorarea: styledLiveOfficialEntry({
    slug: "colorarea",
    title: "ColorArea",
    category: "Components",
    summary:
      "Two-dimensional color selection surface mounted on both stacks with the official controlled red/green example, default/controlled value modes, colorSpace, channel axes, form fields, ARIA labels, and disabled state.",
    styledSummary: "React Spectrum ColorArea vs Solid Spectrum ColorArea.",
    styledNote:
      "React uses @react-spectrum/s2/ColorArea directly; Solid uses @proyecto-viviana/solid-spectrum ColorArea with the public ColorArea subpath, S2 root/thumb/loupe styling, generated gradient background, hidden channel range inputs, controlled/default value routing, colorSpace conversion, form name forwarding, RTL channel geometry, and route controls covering the documented S2 API surface.",
  }),

  colorslider: styledLiveOfficialEntry({
    slug: "colorslider",
    title: "ColorSlider",
    category: "Components",
    summary:
      "Single-channel color slider mounted on both stacks with S2 label/output layout, controlled/default value modes, colorSpace, channel selection, orientation, form forwarding, ARIA labels, and disabled state.",
    styledSummary: "React Spectrum ColorSlider vs Solid Spectrum ColorSlider.",
    styledNote:
      "React uses @react-spectrum/s2/ColorSlider directly; Solid uses @proyecto-viviana/solid-spectrum ColorSlider with the public ColorSlider subpath, S2 root/track/thumb/loupe styling, generated channel gradient, hidden range input forwarding, controlled/default value routing, colorSpace conversion, RTL and vertical geometry, and route controls covering the documented S2 API surface.",
  }),

  colorwheel: styledLiveOfficialEntry({
    slug: "colorwheel",
    title: "ColorWheel",
    category: "Components",
    summary:
      "Circular hue control mounted on both stacks with S2 ring geometry, controlled/default value modes, size, form forwarding, ARIA labels, and disabled state.",
    styledSummary: "React Spectrum ColorWheel vs Solid Spectrum ColorWheel.",
    styledNote:
      "React uses @react-spectrum/s2/ColorWheel directly; Solid uses @proyecto-viviana/solid-spectrum ColorWheel with the public ColorWheel subpath, S2 root/track/thumb/loupe styling, ring-only pointer activation, hidden range input forwarding, controlled/default value routing, and route controls covering the documented S2 API surface.",
  }),

  colorswatch: styledLiveOfficialEntry({
    slug: "colorswatch",
    title: "ColorSwatch",
    category: "Components",
    summary:
      "Static color preview swatch mounted on both stacks with color value, colorName, S2 size and rounding, transparent/no-color slash rendering, ARIA labels/details, id, and slot controls.",
    styledSummary: "React Spectrum ColorSwatch vs Solid Spectrum ColorSwatch.",
    styledNote:
      "React uses @react-spectrum/s2/ColorSwatch directly; Solid uses @proyecto-viviana/solid-spectrum ColorSwatch with the public ColorSwatch subpath, React Aria color naming, transparent/no-color slash rendering, S2 size/rounding/border styles, and route controls covering the documented API surface.",
  }),

  colorswatchpicker: styledLiveOfficialEntry({
    slug: "colorswatchpicker",
    title: "ColorSwatchPicker",
    category: "Components",
    summary:
      "Selectable palette of color swatches mounted on both stacks with controlled/default value modes, density, size, rounding, ARIA labels/details, id, and slot controls.",
    styledSummary: "React Spectrum ColorSwatchPicker vs Solid Spectrum ColorSwatchPicker.",
    styledNote:
      "React uses @react-spectrum/s2/ColorSwatchPicker directly with its ColorSwatch child composition; Solid uses @proyecto-viviana/solid-spectrum ColorSwatchPicker with the public ColorSwatchPicker subpath, S2 listbox/item/selection styling, ColorSwatch child wrapping, React Aria selection semantics, and route controls covering the documented picker API surface.",
  }),

  colorfield: styledLiveOfficialEntry({
    slug: "colorfield",
    title: "ColorField",
    category: "Components",
    summary:
      "Hex and channel color input mounted on both stacks with controlled/default color values, S2 field layout, labels/help/error text, validation state, form forwarding, and route controls for the documented API surface.",
    styledSummary: "React Spectrum ColorField vs Solid Spectrum ColorField.",
    styledNote:
      "React uses @react-spectrum/s2/ColorField directly; Solid uses @proyecto-viviana/solid-spectrum ColorField with the public ColorField subpath, S2 field/group/input/help/error styling, React Aria hex and color-channel state, hidden channel form input forwarding, validation behavior, and route controls covering labels, help/error text, size, label alignment, form props, ARIA labelling/details, id, and slot.",
  }),

  combobox: styledLiveOfficialEntry({
    slug: "combobox",
    title: "ComboBox",
    category: "Components",
    summary:
      "Filterable single-selection field with S2 field layout, text input, trigger button, help text, validation, and listbox state.",
    styledSummary: "React Spectrum ComboBox vs Solid Spectrum ComboBox.",
    styledNote:
      "React uses @react-spectrum/s2 ComboBox and ComboBoxItem directly; Solid uses @proyecto-viviana/solid-spectrum ComboBox and ComboBoxItem with S2-derived field layout, trigger button, input, help text, validation styling, and listbox popover over the Solid ComboBox primitive.",
  }),

  radiogroup: styledLiveOfficialEntry({
    slug: "radiogroup",
    title: "RadioGroup",
    category: "Components",
    summary:
      "Single-selection option group with S2 field layout, radio geometry, help text, and controlled value state.",
    styledSummary: "React Spectrum RadioGroup/Radio vs Solid Spectrum RadioGroup/Radio.",
    styledNote:
      "React uses @react-spectrum/s2 RadioGroup and Radio directly; Solid uses @proyecto-viviana/solid-spectrum RadioGroup and Radio with S2-derived field layout, wrapper, circle, and press-scale styling.",
  }),

  numberfield: styledLiveOfficialEntry({
    slug: "numberfield",
    title: "NumberField",
    category: "Components",
    summary:
      "Numeric text entry with S2 field layout, stepper controls, help text, validation, and controlled value state.",
    styledSummary: "React Spectrum NumberField vs Solid Spectrum NumberField.",
    styledNote:
      "React uses @react-spectrum/s2 NumberField directly; Solid uses @proyecto-viviana/solid-spectrum NumberField with S2-derived label, field group, input, stepper buttons, help text, and validation styling.",
  }),

  picker: styledLiveOfficialEntry({
    slug: "picker",
    title: "Picker",
    category: "Components",
    summary:
      "Single-selection dropdown with S2 field layout, trigger, selected value, help text, validation, and listbox state.",
    styledSummary: "React Spectrum Picker vs Solid Spectrum Picker.",
    styledNote:
      "React uses @react-spectrum/s2 Picker directly; Solid uses @proyecto-viviana/solid-spectrum Picker with S2-derived field layout, trigger, selected value, icons, help text, and validation styling over the Solid Select primitive.",
  }),

  slider: styledLiveOfficialEntry({
    slug: "slider",
    title: "Slider",
    category: "Components",
    summary:
      "Single-thumb range input with S2 field layout, track, fill, thumb, and controlled value state.",
    styledSummary: "React Spectrum Slider vs Solid Spectrum Slider.",
    styledNote:
      "React uses @react-spectrum/s2 Slider directly; Solid uses @proyecto-viviana/solid-spectrum Slider with S2-derived label/output, track, filled track, thumb hit area, and thumb styling.",
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

  textarea: styledLiveOfficialEntry({
    slug: "textarea",
    title: "TextArea",
    category: "Components",
    summary:
      "Multiline text entry with S2 field layout, auto-height textarea, help text, validation, and value state.",
    styledSummary: "React Spectrum TextArea vs Solid Spectrum TextArea.",
    styledNote:
      "React uses @react-spectrum/s2 TextArea directly; Solid uses @proyecto-viviana/solid-spectrum TextArea with S2-derived label, field group, textarea input, help text, auto-height, and validation styling.",
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

  switch: styledLiveOfficialEntry({
    slug: "switch",
    title: "Switch",
    category: "Components",
    summary:
      "Binary setting toggle with S2 track/handle geometry, press behavior, and controlled selected state.",
    styledSummary: "React Spectrum Switch vs Solid Spectrum Switch.",
    styledNote:
      "React uses @react-spectrum/s2 Switch directly; Solid uses @proyecto-viviana/solid-spectrum Switch with S2-derived wrapper, track, handle transform, and handle press-scale styling.",
  }),

  tabs: {
    ...styledLiveOfficialEntry({
      slug: "tabs",
      title: "Tabs",
      category: "Components",
      summary:
        "Tabbed content with required labeling, collection composition, selection state, orientation, density, label behavior, keyboard activation, and panel mounting.",
      styledSummary: "React Spectrum Tabs vs Solid Spectrum Tabs.",
      styledNote:
        "React uses @react-spectrum/s2 Tabs directly; Solid uses @proyecto-viviana/solid-spectrum Tabs with S2-derived tablist, tab, indicator, Text/Icon slot, and panel styling. Horizontal overflow collapse into the S2 Tabs Picker is still tracked as the remaining styled parity blocker.",
    }),
    componentStatus: "parity",
    parity: "partial",
    priority: "live",
    gapSummary: [
      "React and Solid styled tab demos are mounted from their public packages.",
      "Route controls cover selection, disabled keys, orientation, density, label behavior, keyboard activation, icon/Text composition, force-mounted panels, and static/dynamic collections.",
      "Solid styled Tabs still need the upstream horizontal overflow collapse branch that swaps the tab row for the S2 Tabs Picker.",
    ],
    layers: {
      styled: layerTrack(
        "Styled Tabs",
        "React Spectrum Tabs vs Solid Spectrum Tabs.",
        "live",
        "live",
        "Both styled stacks are live, but the Solid overflow-collapse branch is still pending.",
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
        ["datefield", "DateField"],
        ["timefield", "TimeField"],
        ["daterangepicker", "DateRangePicker"],
        ["datepicker", "DatePicker"],
        ["contextualhelp", "ContextualHelp"],
        ["tooltip", "Tooltip"],
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
        summary:
          title === "Dialog"
            ? "Dialog has a live comparison island with S2 trigger, modal surface, title/content slots, close-button styling, routed title/body/size/role/dismissal/open controls, focus containment, outside/Escape behavior, and bounded open-surface visual evidence."
            : title === "DateRangePicker"
              ? "DateRangePicker has a live comparison island with segmented range fields, routed date/date-time range values, calendar constraints, form owner/name props, locale/custom-calendar routes, exact closed-field pair-diff evidence, and open popover evidence."
              : title === "DateField"
                ? "DateField has a live comparison island with S2 segmented field styling, contextual help, controlled date/time values, leading-zero formatting, form owner/name and associated form-data evidence, native and aria validation behavior routing, constraints, unavailable-date invalidation, strict closed-field pair-diff evidence, and Provider locale routing."
                : title === "TimeField"
                  ? "TimeField has a live comparison island with S2 segmented field styling, contextual help, controlled time values, leading-zero formatting, form owner/name and associated form-data evidence, native and aria validation behavior routing, constraints, strict closed-field pair-diff evidence, and Provider locale routing."
                  : title === "DatePicker"
                    ? "DatePicker has a live comparison island with contextual help, controlled date/date-time values, leading-zero formatting, routed calendar constraints, validation behavior, associated form data evidence, locale/custom-calendar routes, strict closed-field pair-diff evidence, two-month popup state, and open popover evidence."
                    : title === "ContextualHelp"
                      ? "ContextualHelp has a live comparison island with S2 icon ActionButton trigger composition, routed heading/content/footer, variant, trigger size, controlled open, placement, React-pinned offset geometry, container padding, flip, and press/touch popover behavior coverage."
                      : title === "Tooltip"
                        ? "Tooltip has a live comparison island with S2 ActionButton trigger composition, routed content, placement, trigger mode, 1500ms delay default, containerPadding, crossOffset, defaultOpen, controlled true/false/undefined open state, disabled suppression, flip, close-on-press controls, S2 arrow styling, and hover/focus/Escape/scroll lifecycle coverage."
                        : `${title} has an initial live comparison island. Exhaustive states remain open.`,
        parity: "partial",
        priority: "live",
        gapSummary: [
          title === "Dialog"
            ? "React styled Dialog is mounted from @react-spectrum/s2 with DialogTrigger, Dialog, Heading, and Content."
            : title === "ContextualHelp"
              ? "React styled ContextualHelp is mounted from @react-spectrum/s2 with Heading, Content, and Footer children."
              : title === "Tooltip"
                ? "React styled Tooltip is mounted from @react-spectrum/s2 with TooltipTrigger, icon-only ActionButton trigger, S2 Tooltip content, S2 default delay/padding/cross-axis geometry, arrow-boundary clamp, and React Aria close-on-scroll behavior."
                : "React styled island remains mounted from @react-spectrum/s2.",
          title === "DateRangePicker"
            ? "Solid styled DateRangePicker is mounted from @proyecto-viviana/solid-spectrum and reuses the S2 RangeCalendar popover with routed picker state."
            : title === "Dialog"
              ? "Solid styled Dialog is mounted from @proyecto-viviana/solid-spectrum with S2 token styling, S2 size aliases, slot composition, close-button parity, role routing, controlled/default open state, outside dismissal, and Escape-dismiss wiring."
              : title === "DateField"
                ? "Solid styled DateField is mounted from @proyecto-viviana/solid-spectrum and mirrors the S2 segmented FieldGroup composition."
                : title === "TimeField"
                  ? "Solid styled TimeField is mounted from @proyecto-viviana/solid-spectrum and mirrors the S2 segmented FieldGroup composition."
                  : title === "DatePicker"
                    ? "Solid styled DatePicker is mounted from @proyecto-viviana/solid-spectrum and guarded by focused DatePicker specs."
                    : title === "ContextualHelp"
                      ? "Solid styled ContextualHelp is mounted from @proyecto-viviana/solid-spectrum with a press-open Popover trigger instead of Tooltip."
                      : title === "Tooltip"
                        ? "Solid styled Tooltip is mounted from @proyecto-viviana/solid-spectrum with S2 token styling, S2 arrow path, trigger-level placement/containerPadding/crossOffset/defaultOpen routing, explicit id merge, disabled suppression, close-on-scroll, cross-axis padding and arrow-boundary geometry, no-flip main-axis overflow parity, and hover/focus behavior."
                        : "Solid styled wiring was removed from the comparison app until it renders the real solid-spectrum component again.",
          title === "DateRangePicker"
            ? "Assistive-technology transcript rows remain tracked after the route, time, locale, and custom-calendar parity pass."
            : title === "Dialog"
              ? "Package gates cover DialogContainer/onDismiss, AlertDialog actions, FullscreenDialog, CustomDialog/CloseButton, slot visibility, and dismissible ButtonGroup suppression; live screen-reader transcript tooling remains tracked beyond DOM ARIA/focus assertions."
              : title === "DateField"
                ? "Screen-reader transcript evidence remains tracked after contextual help, route, form, native/aria validation behavior, unavailable-date invalidation, and strict closed-field parity pass."
                : title === "TimeField"
                  ? "Screen-reader transcript evidence remains tracked after contextual help, leading-zero, route, form, native/aria validation behavior, and strict closed-field parity pass."
                  : title === "DatePicker"
                    ? "Assistive-technology transcript rows, strict open-popover pair-diff, and full popup style token ledger evidence remain tracked after the contextual-help, leading-zero, validation, route, time, locale, form, and closed-field parity pass."
                    : title === "ContextualHelp"
                      ? "Assistive-technology transcript rows remain tracked after the strict open-popover visual pair-diff, press/touch substitution, controlled route, and modeled-controls pass."
                      : title === "Tooltip"
                        ? "Standalone RAC-only rendering escape hatches such as triggerRef, render overrides, and portal container remain tracked outside the S2 styled slice; live SR transcript evidence remains tracked beyond DOM ARIA assertions."
                        : "Detailed state matrices and strict visual assertions remain incomplete.",
        ],
        layers: {
          styled: layerTrack(
            `Styled ${title}`,
            `React Spectrum ${title} vs Solid styled implementation.`,
            "live",
            title === "Dialog" ||
              title === "DatePicker" ||
              title === "DateRangePicker" ||
              title === "DateField" ||
              title === "TimeField" ||
              title === "ContextualHelp" ||
              title === "Tooltip"
              ? "live"
              : "missing",
            title === "Dialog"
              ? "Solid styled Dialog is mounted from @proyecto-viviana/solid-spectrum with S2 surface/header/content/close-button styling, S2 size aliases, controlled/default open behavior, role routing, outside/Escape dismissal, focus containment, and modeled side-panel controls."
              : title === "DatePicker"
                ? "Solid styled DatePicker is mounted from @proyecto-viviana/solid-spectrum; S2 calendar-state routing covers contextual help, controlled date/date-time values, leading-zero segments, popup TimeField state, maxVisibleMonths, firstDayOfWeek, pageBehavior, min/max, unavailable dates, validation behavior, associated form data, locale/custom calendar routing, and strict closed-field pair-diff evidence."
                : title === "DateField"
                  ? "Solid styled DateField is mounted from @proyecto-viviana/solid-spectrum with the S2 field shell, contextual help, segmented DateInput, required/invalid/help text surface, hidden form input, associated form data, date-time granularity, hour cycle, leading-zero formatting, native/aria validation behavior, unavailable-date invalidation, strict closed-field pair-diff evidence, and locale route controls."
                  : title === "TimeField"
                    ? "Solid styled TimeField is mounted from @proyecto-viviana/solid-spectrum with the S2 field shell, contextual help, segmented TimeInput, required/invalid/help text surface, hidden form input, associated form data, granularity, leading-zero formatting, hour cycle, native/aria validation behavior, strict closed-field pair-diff evidence, and locale route controls."
                    : title === "DateRangePicker"
                      ? "Solid styled DateRangePicker is mounted from @proyecto-viviana/solid-spectrum; S2 field-shell segment parity is asserted for the closed field, popup RangeCalendar geometry has bounded grid screenshot evidence, and date-time, locale, and custom-calendar routes are covered."
                      : title === "ContextualHelp"
                        ? "Solid styled ContextualHelp is mounted from @proyecto-viviana/solid-spectrum with S2 ActionButton trigger, Popover surface, Heading/Content/Footer slots, variant icons, controlled open state, placement routing, React-pinned offset geometry, menu-helper submenu defaults, and press/touch activation."
                        : title === "Tooltip"
                          ? "Solid styled Tooltip is mounted from @proyecto-viviana/solid-spectrum with S2 neutral surface styling, always-on arrow by default, trigger-level placement/start/end routing, routed containerPadding/crossOffset/defaultOpen/open-state controls, disabled suppression, close-on-scroll, cross-axis padding and arrow-boundary clamp geometry, no-flip main-axis overflow parity, hover/focus behavior, Escape cleanup, and modeled viewer controls."
                          : `Solid styled ${title} is not live until the route imports and renders the real solid-spectrum component.`,
          ),
          components: layerTrack(
            `Component ${title}`,
            "Component-layer parity target.",
            "live",
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
