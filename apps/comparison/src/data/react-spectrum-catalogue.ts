export type ReactSpectrumCatalogueCategory = "Components";

export interface ReactSpectrumCatalogueEntry {
  slug: string;
  title: string;
  category: ReactSpectrumCatalogueCategory;
  docsPath: string;
}

const reactSpectrumDocsBase = "https://react-spectrum.adobe.com";

function component(title: string, slug = title.toLowerCase()): ReactSpectrumCatalogueEntry {
  return {
    slug,
    title,
    category: "Components",
    docsPath: `${reactSpectrumDocsBase}/${title.replace(/\s+/g, "")}`,
  };
}

export const reactSpectrumCatalogue = [
  component("Accordion"),
  component("ActionBar"),
  component("ActionButton"),
  component("ActionButtonGroup"),
  component("ActionMenu"),
  component("Avatar"),
  component("AvatarGroup"),
  component("Badge"),
  component("Breadcrumbs"),
  component("Button"),
  component("ButtonGroup"),
  component("Calendar"),
  component("Card"),
  component("CardView"),
  component("Checkbox"),
  component("CheckboxGroup"),
  component("ColorArea"),
  component("ColorField"),
  component("ColorSlider"),
  component("ColorSwatch"),
  component("ColorSwatchPicker"),
  component("ColorWheel"),
  component("ComboBox"),
  component("ContextualHelp"),
  component("DateField"),
  component("DatePicker"),
  component("DateRangePicker"),
  component("Dialog"),
  component("Disclosure"),
  component("Divider"),
  component("DropZone"),
  component("Form"),
  component("Icons", "icons"),
  component("IllustratedMessage"),
  component("Illustrations", "illustrations"),
  component("Image"),
  component("InlineAlert"),
  component("LabeledValue"),
  component("Link"),
  component("LinkButton"),
  component("ListBox"),
  component("ListView"),
  component("Menu"),
  component("Meter"),
  component("NumberField"),
  component("Picker"),
  component("Popover"),
  component("ProgressBar"),
  component("ProgressCircle"),
  component("Provider"),
  component("RadioGroup"),
  component("RangeCalendar"),
  component("RangeSlider"),
  component("SearchField"),
  component("SegmentedControl"),
  component("SelectBoxGroup"),
  component("Skeleton"),
  component("Slider"),
  component("StatusLight"),
  component("Switch"),
  component("TableView"),
  component("Tabs"),
  component("TagGroup"),
  component("TextArea"),
  component("TextField"),
  component("TimeField"),
  component("Toast"),
  component("ToggleButton"),
  component("ToggleButtonGroup"),
  component("Tooltip"),
  component("TreeView"),
] as const satisfies readonly ReactSpectrumCatalogueEntry[];

export type ReactSpectrumComponentSlug = (typeof reactSpectrumCatalogue)[number]["slug"];

export const reactSpectrumCatalogueSource = {
  name: "React Spectrum S2 component catalogue",
  url: `${reactSpectrumDocsBase}/ActionButton`,
  docsBase: reactSpectrumDocsBase,
} as const;
