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
      "Hierarchy navigation route mounted on both stacks with S2 size, disabled, dynamic collection action, and overflow breadcrumb menu controls.",
    styledSummary: "React Spectrum Breadcrumbs vs Solid Spectrum Breadcrumbs.",
    styledNote:
      "React uses @react-spectrum/s2 Breadcrumbs and Breadcrumb directly; Solid uses @proyecto-viviana/solid-spectrum with the public Breadcrumbs subpath, BreadcrumbsContext export, static child support, dynamic collection actions, link DOM props, and deterministic overflow menu composition.",
  }),

  calendar: styledLiveOfficialEntry({
    slug: "calendar",
    title: "Calendar",
    category: "Components",
    summary:
      "Single-date Calendar route mounted on both stacks with the official viewer controls plus route-testable value, validation, unavailable-date, immutable, locale calendar, and custom calendar states.",
    styledSummary: "React Spectrum Calendar vs Solid Spectrum Calendar.",
    styledNote:
      "React uses @react-spectrum/s2 Calendar directly; Solid uses @proyecto-viviana/solid-spectrum with the public Calendar subpath, CalendarContext export, S2 firstDayOfWeek string normalization, invalid selected-cell error description linkage, localized RangeCalendar selection prompt descriptions across React Aria's prompt locale set, multi-month grid composition, pageBehavior/selectionAlignment state support, keyboard matrix parity, focus/reset state parity, Unicode display calendars, custom createCalendar routing, forced-colors computed contracts, seven-column default grid geometry, S2 header/nav token parity, and strict zero-tolerance Calendar-root pair diff evidence for the deterministic unselected grid, controlled selected date, and deterministic multi-month layout.",
  }),

  rangecalendar: styledLiveOfficialEntry({
    slug: "rangecalendar",
    title: "RangeCalendar",
    category: "Components",
    summary:
      "Date-range Calendar route mounted on both stacks with controlled range value, focusedValue, validation, unavailable-date, non-contiguous range, paging, first weekday, and multi-month controls.",
    styledSummary: "React Spectrum RangeCalendar vs Solid Spectrum RangeCalendar.",
    styledNote:
      "React uses @react-spectrum/s2 RangeCalendar directly; Solid uses @proyecto-viviana/solid-spectrum RangeCalendar with S2 header/nav styling, strict zero-tolerance month-grid pair diffs, exact seven-column month grid geometry, controlled range value, validation error linkage, unavailable-date strike treatment, firstDayOfWeek string normalization, visibleMonths/pageBehavior/selectionAlignment routing, and DateRangePicker popover reuse without the old fixed-width gutter.",
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
        ["daterangepicker", "DateRangePicker"],
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
        summary:
          title === "DateRangePicker"
            ? "DateRangePicker has a live comparison island with segmented range fields, routed range value, calendar constraints, form names, exact closed-field pair-diff evidence, and open popover evidence. Time and locale states remain open."
            : `${title} has an initial live comparison island. Exhaustive states remain open.`,
        parity: "partial",
        priority: "live",
        gapSummary: [
          title === "Toast"
            ? "React Spectrum Toast reference remains tracked."
            : "React styled island remains mounted from @react-spectrum/s2.",
          title === "DateRangePicker"
            ? "Solid styled DateRangePicker is mounted from @proyecto-viviana/solid-spectrum and reuses the S2 RangeCalendar popover with routed picker state."
            : title === "DatePicker"
              ? "Solid styled DatePicker is mounted from @proyecto-viviana/solid-spectrum and guarded by focused DatePicker specs."
              : "Solid styled wiring was removed from the comparison app until it renders the real solid-spectrum component again.",
          title === "DateRangePicker"
            ? "Time and locale/calendar-system states remain incomplete."
            : "Detailed state matrices and strict visual assertions remain incomplete.",
        ],
        layers: {
          styled: layerTrack(
            `Styled ${title}`,
            `React Spectrum ${title} vs Solid styled implementation.`,
            title === "Toast" ? "tracked" : "live",
            title === "DatePicker" || title === "DateRangePicker" ? "live" : "missing",
            title === "DatePicker"
              ? "Solid styled DatePicker is mounted from @proyecto-viviana/solid-spectrum; S2 styling parity remains partial and guarded by focused DatePicker specs."
              : title === "DateRangePicker"
                ? "Solid styled DateRangePicker is mounted from @proyecto-viviana/solid-spectrum; S2 field-shell segment parity is asserted for the closed field, and the open RangeCalendar popover has bounded grid screenshot evidence plus separately tracked calendar-system/time rows."
                : title === "Toast"
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
