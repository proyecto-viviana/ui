/* The examples taxonomy — the ten Terminal Glass product screens, one child
   route each under /examples. Where the showcase panels are organised by
   COMPONENT ("here is every Button"), the examples are organised by SCREEN
   ("here is a whole product page built from them"), so `components` lists the
   exported names each screen is responsible for putting to work and `needs`
   names the register capabilities the screen still waits on. Both are lists of
   plain strings so the registry test can check them against the package's real
   export surface and against workstream B's plan. */
import { seo } from "@/seo";

export interface ExampleDef {
  /** Route slug under /examples/. */
  readonly slug: string;
  /** Two-digit screen number, in register voice ("01"). */
  readonly num: string;
  readonly title: string;
  readonly blurb: string;
  /** Public @proyecto-viviana/ui export names this screen composes. */
  readonly components: readonly string[];
  /** Register capabilities this screen still needs from the library. */
  readonly needs: readonly string[];
  /** What carries this screen's single filled fuchsia ask, or "" for none. */
  readonly fuchsiaFill: string;
}

export const EXAMPLES: readonly ExampleDef[] = [
  {
    slug: "landing",
    num: "01",
    title: "Landing",
    blurb: "The front door: scene, hero, and one filled ask — no app chrome.",
    components: [
      "SceneBackdrop",
      "HudFrame",
      "Link",
      "Button",
      "Heading",
      "Text",
      "Well",
      "TextField",
      "TerminalLog",
      "Badge",
      "Card",
      "CardPreview",
      "Image",
      "Flex",
      "Grid",
    ],
    needs: ["display-xl type role", "scan sweep", "HUD brackets", "boot-in log", "dither veil"],
    fuchsiaFill: "+ Start free",
  },
  {
    slug: "home",
    num: "02",
    title: "Home",
    blurb: "The daily surface: focus, streak, level, what to continue, what is due.",
    components: [
      "Card",
      "Well",
      "Badge",
      "HudFrame",
      "PixelMeter",
      "ProgressBar",
      "TerminalLog",
      "ListView",
      "ListViewItem",
      "LinkButton",
      "Image",
      "Heading",
      "Text",
    ],
    needs: ["media HUD readout", "terminal list rows"],
    fuchsiaFill: "Review 4 · ~6 min",
  },
  {
    slug: "explore",
    num: "03",
    title: "Explore",
    blurb: "The index four days in: filter chips, a hero journey, and four tiles.",
    components: [
      "TagGroup",
      "Tag",
      "Card",
      "CardPreview",
      "HudFrame",
      "Image",
      "Meter",
      "Button",
      "Content",
      "Footer",
      "Heading",
      "Text",
    ],
    needs: ["HUD brackets", "corner tag", "segmented progress"],
    fuchsiaFill: "+ Create",
  },
  {
    slug: "explore-empty",
    num: "04",
    title: "Explore — empty",
    blurb: "The same index on day zero: shimmer skeletons and an outline tree.",
    components: [
      "Card",
      "CardPreview",
      "TerminalLog",
      "Skeleton",
      "Image",
      "TagGroup",
      "Tag",
      "StatusLight",
      "Badge",
      "Divider",
      "Heading",
      "Text",
    ],
    needs: ["shimmer grid", "outline tree well", "console strip"],
    fuchsiaFill: "+ Create",
  },
  {
    slug: "lesson",
    num: "05",
    title: "Lesson",
    blurb: "The workbench: player, code well, checkpoint quiz, tutor.",
    components: [
      "Tabs",
      "TabList",
      "Tab",
      "TabPanels",
      "TabPanel",
      "Well",
      "TerminalLog",
      "Card",
      "CardPreview",
      "Content",
      "Footer",
      "HudFrame",
      "SceneBackdrop",
      "ProgressBar",
      "Image",
      "Button",
      "ActionButton",
      "Switch",
      "RadioGroup",
      "Radio",
      "Badge",
      "Divider",
      "Grid",
      "Flex",
      "Heading",
      "Text",
    ],
    needs: ["code-well line numbers", "typed reply"],
    fuchsiaFill: "+ Create",
  },
  {
    slug: "theater",
    num: "06",
    title: "Theater",
    blurb: "Full-bleed playback with a transcript drawer and a speed menu.",
    components: [
      "ActionButton",
      "Badge",
      "Button",
      "Card",
      "Heading",
      "HudFrame",
      "Image",
      "LinkButton",
      "Menu",
      "MenuButton",
      "MenuTrigger",
      "ProgressBar",
      "SearchField",
      "Tabs",
      "TabList",
      "TabPanels",
      "TerminalLog",
      "Text",
      "Well",
    ],
    needs: ["CRT scanline overlay", "scan sweep", "HUD brackets", "HUD readouts", "caption box"],
    fuchsiaFill: "● 214 WATCHING",
  },
  {
    slug: "live",
    num: "07",
    title: "Live",
    blurb: "A live session: poll, chat, raise hand, and one fuchsia LIVE badge.",
    components: ["Badge", "Card", "Well", "RadioGroup", "Radio", "Meter", "ToggleButton", "Avatar"],
    needs: ["pixel radio", "boot-in log", "non-seekable segment progress"],
    fuchsiaFill: "● LIVE · 214",
  },
  {
    slug: "profile",
    num: "08",
    title: "Profile",
    blurb: "A person as a terminal: stats, an activity map, journeys, badges.",
    components: [
      "Badge",
      "Card",
      "Well",
      "SceneBackdrop",
      "PixelMeter",
      "ProgressBar",
      "TerminalLog",
      "LinkButton",
      "Image",
      "Heading",
      "Text",
    ],
    needs: ["per-cell activity heat", "ELSH type role", "scheme-swapped scene image"],
    fuchsiaFill: "+ Create",
  },
  {
    slug: "settings",
    num: "09",
    title: "Settings",
    blurb: "Preferences as an rc file: nineteen numbered lines you can edit.",
    components: [
      "Card",
      "Well",
      "Switch",
      "SegmentedControl",
      "SegmentedControlItem",
      "TextField",
      "InlineAlert",
      "TerminalLog",
      "Badge",
      "Button",
      "Heading",
      "Content",
      "Text",
    ],
    needs: ["rc-file editor row", "ELSH shape swatch"],
    fuchsiaFill: "",
  },
  {
    slug: "playground",
    num: "10",
    title: "Playground",
    blurb: "A render viewport with five parameter sliders and a running log.",
    components: [
      "Card",
      "Well",
      "HudFrame",
      "Image",
      "Badge",
      "ProgressBar",
      "Tabs",
      "TabList",
      "Tab",
      "TabPanels",
      "TabPanel",
      "Slider",
      "TerminalLog",
      "Button",
      "Heading",
      "Text",
      "Flex",
    ],
    needs: ["pixel slider", "HUD brackets", "HUD readouts", "warn log channel"],
    fuchsiaFill: "+ Create",
  },
];

export function exampleBySlug(slug: string): ExampleDef | undefined {
  return EXAMPLES.find((example) => example.slug === slug);
}

/**
 * Head tags for one example screen, derived from its registry entry.
 *
 * Mirrors the showcase's `panelSeo`: the blurb alone runs ~55 characters, so
 * the component names are appended up to the 158-character description budget
 * — they are the words someone actually searches for. Deriving it here rather
 * than writing it per route is what keeps the tab, the search result and the
 * on-page heading from drifting apart.
 */
export function exampleSeo(slug: string) {
  const def = exampleBySlug(slug);
  if (!def) {
    throw new Error(`exampleSeo: no example screen named "${slug}".`);
  }

  let description = def.blurb;
  const names: string[] = [];
  for (const name of def.components) {
    const next = [...names, name].join(", ");
    if (`${description} ${next}.`.length > 158) break;
    names.push(name);
  }
  if (names.length > 0) {
    description = `${description} ${names.join(", ")}.`;
  }

  return seo({
    title: `${def.title} · Examples`,
    description,
    path: `/examples/${def.slug}`,
  });
}
