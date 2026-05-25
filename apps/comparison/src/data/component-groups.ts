import type { ComparisonEntry, ComparisonSlug } from "./comparison-manifest";

export interface ComponentGroupDefinition {
  id: string;
  title: string;
  slugs: readonly ComparisonSlug[];
}

export interface ComponentSidebarGroup {
  id: string;
  title: string;
  entries: readonly ComparisonEntry[];
}

export const componentGroupDefinitions = [
  {
    id: "button-family",
    title: "Button Family",
    slugs: [
      "actionbar",
      "actionbutton",
      "actionbuttongroup",
      "actionmenu",
      "button",
      "buttongroup",
      "linkbutton",
      "togglebutton",
      "togglebuttongroup",
    ],
  },
  {
    id: "form-input",
    title: "Form & Input",
    slugs: [
      "checkbox",
      "checkboxgroup",
      "combobox",
      "form",
      "numberfield",
      "picker",
      "radiogroup",
      "rangeslider",
      "searchfield",
      "segmentedcontrol",
      "selectboxgroup",
      "slider",
      "switch",
      "textarea",
      "textfield",
    ],
  },
  {
    id: "date-time",
    title: "Date & Time",
    slugs: ["calendar", "datefield", "datepicker", "daterangepicker", "rangecalendar", "timefield"],
  },
  {
    id: "collections",
    title: "Collections",
    slugs: ["card", "cardview", "listview", "menu", "tableview", "taggroup", "treeview"],
  },
  {
    id: "navigation-structure",
    title: "Navigation & Structure",
    slugs: ["accordion", "breadcrumbs", "disclosure", "divider", "link", "tabs"],
  },
  {
    id: "overlays",
    title: "Overlays",
    slugs: ["contextualhelp", "dialog", "popover", "toast", "tooltip"],
  },
  {
    id: "feedback-status",
    title: "Feedback & Status",
    slugs: [
      "badge",
      "inlinealert",
      "meter",
      "progressbar",
      "progresscircle",
      "skeleton",
      "statuslight",
    ],
  },
  {
    id: "color-media",
    title: "Color & Media",
    slugs: [
      "avatar",
      "avatargroup",
      "colorarea",
      "colorfield",
      "colorslider",
      "colorswatch",
      "colorswatchpicker",
      "colorwheel",
      "dropzone",
      "icons",
      "illustratedmessage",
      "illustrations",
      "image",
    ],
  },
  {
    id: "foundation",
    title: "Foundation",
    slugs: ["provider"],
  },
] as const satisfies readonly ComponentGroupDefinition[];

const groupBySlug = new Map<ComparisonSlug, ComponentGroupDefinition>();

for (const group of componentGroupDefinitions) {
  for (const slug of group.slugs) {
    groupBySlug.set(slug, group);
  }
}

export function getComparisonEntryGroupId(slug: ComparisonSlug): string {
  return groupBySlug.get(slug)?.id ?? "other";
}

export function groupComparisonEntries(
  entries: readonly ComparisonEntry[],
): readonly ComponentSidebarGroup[] {
  const entriesBySlug = new Map(entries.map((entry) => [entry.slug, entry]));
  const groups: ComponentSidebarGroup[] = componentGroupDefinitions
    .map((group) => ({
      id: group.id,
      title: group.title,
      entries: group.slugs
        .map((slug) => entriesBySlug.get(slug))
        .filter((entry): entry is ComparisonEntry => entry != null),
    }))
    .filter((group) => group.entries.length > 0);

  const groupedSlugs = new Set<ComparisonSlug>(
    componentGroupDefinitions.flatMap((group) => group.slugs),
  );
  const otherEntries = entries.filter((entry) => !groupedSlugs.has(entry.slug));

  if (otherEntries.length > 0) {
    groups.push({
      id: "other",
      title: "Other",
      entries: otherEntries,
    });
  }

  return groups;
}
