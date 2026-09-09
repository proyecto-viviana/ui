/** @vitest-environment jsdom */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { fireEvent, render } from "@solidjs/testing-library";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "../src/tabs";
import { ListView, ListViewItem } from "../src/list";
import { Breadcrumb, Breadcrumbs } from "../src/breadcrumbs";
import { StepList } from "../src/steplist";
import { Link } from "../src/link";
import { Toolbar } from "../src/toolbar";
import { Disclosure, DisclosurePanel, DisclosureTitle } from "../src/disclosure";
import { Text } from "../src/text";
import { TreeFixture } from "./fixtures/tree";

const sheetPath = ["packages/viviana-ui/dist/styles.css", "dist/styles.css"]
  .map((candidate) => resolve(process.cwd(), candidate))
  .find((candidate) => existsSync(candidate));
if (!sheetPath) throw new Error("build viviana-ui before running this test");
const sheet = readFileSync(sheetPath, "utf8");

/* The style() macro hashes each declaration into its own atom class, so the only way to
 * read a component's paint back is to take the classes it actually put on the element and
 * look their rules up in the built sheet. Asserting on the source object instead would
 * pass on a branch that never reaches the DOM. Mirrors Selection.register.test.tsx. */
function declarationsOf(element: Element): string {
  return [...element.classList]
    .map((atom) => {
      const escaped = atom.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`\\.${escaped}\\{([^}]*)\\}`).exec(sheet)?.[1] ?? "";
    })
    .join(";");
}

/* Every atom rule mentioning the class, INCLUDING the ones nested in an @media or a
 * state selector — `declarationsOf` only sees the bare `.atom{...}` form. */
function allRulesFor(element: Element): string {
  return [...element.classList]
    .map((atom) => {
      const escaped = atom.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return [...sheet.matchAll(new RegExp(`\\.${escaped}[^{]*\\{([^}]*)\\}`, "g"))]
        .map((match) => match[1])
        .join(";");
    })
    .join(";");
}

function terminalTabs(trailing?: string) {
  return render(() => (
    <Tabs aria-label="Console" variant="terminal" defaultSelectedKey="output">
      <TabList trailing={trailing}>
        <Tab id="output">Output</Tab>
        <Tab id="problems">Problems</Tab>
      </TabList>
      <TabPanels>
        <TabPanel id="output">out</TabPanel>
        <TabPanel id="problems">prob</TabPanel>
      </TabPanels>
    </Tabs>
  ));
}

describe("Tabs variant=terminal — the register's matte command strip", () => {
  it("paints the well on the WRAPPER, so the trailing readout sits inside the strip", () => {
    /* Regression: painting the strip on the `role=tablist` element itself is the obvious
     * shortcut, and it puts the trailing readout — which must be a sibling of the tablist
     * for `aria-required-children` — OUTSIDE the well, floating next to it. The fill,
     * dither and hairline therefore belong to the wrapper, not to the list. */
    const { container } = terminalTabs("24 lines");
    const list = container.querySelector('[role="tablist"]')!;
    const wrapper = list.parentElement!;
    const rules = declarationsOf(wrapper);
    expect(rules).toContain("background-color:var(--surface-well)");
    expect(rules).toContain("repeating-conic-gradient(var(--well-scan)");
    expect(rules).toContain("border-color:var(--well-border)");
    expect(declarationsOf(list)).not.toContain("var(--surface-well)");
  });

  it("renders `trailing` as a sibling of the tablist, never as one of its children", () => {
    /* A non-tab element inside `role=tablist` fails axe's aria-required-children and makes
     * the strip's own tab count wrong for assistive tech. */
    const { container } = terminalTabs("24 lines");
    const list = container.querySelector('[role="tablist"]')!;
    const readout = container.querySelector('[data-rsp-slot="trailing"]')!;
    expect(readout.textContent).toBe("24 lines");
    expect(list.contains(readout)).toBe(false);
    expect(readout.parentElement).toBe(list.parentElement);
  });

  it("omits the trailing element entirely when no readout is given", () => {
    const { container } = terminalTabs();
    expect(container.querySelector('[data-rsp-slot="trailing"]')).toBeNull();
  });

  it("suppresses the sliding selection indicator — the filled chip IS the selection", () => {
    /* The underline slides under a tab that already carries a filled, ringed background;
     * both together read as two competing selections. */
    const { container } = terminalTabs();
    expect(container.querySelector('[data-rsp-slot="selection-indicator"]')).toBeNull();
  });

  it("gives the selected chip the accent ring and reserves that ring at rest", () => {
    /* Adding a border only on selection reflows the whole row by 2px every time the user
     * moves between tabs. Every chip carries the 1px box; only its colour changes. */
    const { container } = terminalTabs();
    const tabs = [...container.querySelectorAll('[role="tab"]')];
    const selected = tabs.find((tab) => tab.getAttribute("aria-selected") === "true")!;
    const idle = tabs.find((tab) => tab.getAttribute("aria-selected") !== "true")!;
    expect(declarationsOf(selected)).toContain("border-color:var(--accent-primary-ring)");
    expect(declarationsOf(selected)).toContain("background-color:var(--surface-active)");
    // `transparent` is minified to the shortest equivalent hex in the built sheet.
    expect(declarationsOf(idle)).toContain("border-color:#0000");
    expect(declarationsOf(idle)).toContain("border-top-width:1px");
  });

  it("never collapses into the overflow picker", () => {
    /* The strip is a fixed-width instrument in a well; swapping it for a Picker at narrow
     * widths would replace the register's most recognisable chrome with a dropdown. */
    const { container } = terminalTabs();
    expect(
      container.querySelector(".solidaria-Tabs")!.getAttribute("data-tabs-overflow-state"),
    ).toBe("tabs");
  });
});

describe("ListView rows — the register's leading '>' mark", () => {
  function listView() {
    return render(() => (
      <ListView
        aria-label="Lessons"
        items={[
          { id: "a", title: "Radiometry", meta: "12 min" },
          { id: "b", title: "Colorimetry", meta: "8 min" },
        ]}
        selectionMode="single"
        selectionStyle="highlight"
        defaultSelectedKeys={["b"]}
      >
        {(row: { id: string; title: string; meta: string }) => (
          <ListViewItem id={row.id} textValue={row.title} description={row.meta}>
            <Text slot="label">{row.title}</Text>
          </ListViewItem>
        )}
      </ListView>
    ));
  }

  it("keeps the mark out of the row's accessible name", () => {
    /* The mark is a ">" character. Left exposed, every row would announce as
     * "> Radiometry", and a screen-reader user would hear punctuation on every row. */
    const { container } = listView();
    const mark = container.querySelector('[data-rsp-slot="mark"]')!;
    expect(mark.textContent).toBe(">");
    expect(mark.getAttribute("aria-hidden")).toBe("true");
  });

  it("reserves the mark's track at rest instead of inserting it on selection", () => {
    /* If the mark only existed on the selected row, selecting a row would shift its title
     * sideways by ~16px. It is always in the grid; it fades and slides into place. */
    const { container } = listView();
    const rows = [...container.querySelectorAll("[data-list-view-item]")];
    expect(rows.length).toBe(2);
    for (const row of rows) {
      expect(row.querySelector('[data-rsp-slot="mark"]')).not.toBeNull();
    }
    const idle = rows.find((row) => row.getAttribute("aria-selected") !== "true")!;
    const idleRules = declarationsOf(idle.querySelector('[data-rsp-slot="mark"]')!);
    expect(idleRules).toContain("opacity:0");
    expect(idleRules).toContain("grid-column-start:mark");
    expect(idleRules).toContain("--translateX:-3px");
  });

  it("pins the mark solid on the selected row", () => {
    const { container } = listView();
    const selected = [...container.querySelectorAll("[data-list-view-item]")].find(
      (row) => row.getAttribute("aria-selected") === "true",
    )!;
    const rules = declarationsOf(selected.querySelector('[data-rsp-slot="mark"]')!);
    expect(rules).toContain("opacity:1");
    expect(rules).toContain("--translateX:0px");
  });

  it("draws rows on the register's 9px/12px box and 6px row corner", () => {
    /* The 12px inset is what keeps the mark clear of the row edge; S2's 4px gutter puts
     * the caret flush against the container border. */
    const { container } = listView();
    const rules = declarationsOf(container.querySelector("[data-list-view-item]")!);
    expect(rules).toContain("padding-top:9px");
    expect(rules).toContain("--radius:6px");
  });
});

describe("Breadcrumbs — the command-bar path", () => {
  it("separates segments with a literal '/', not a chevron glyph", () => {
    /* The register writes a breadcrumb trail as a shell path. A chevron icon between mono
     * segments reads as a disclosure affordance, which is what the OVERFLOW menu uses. */
    const { container } = render(() => (
      <Breadcrumbs aria-label="Path" items={[{ id: "a" }, { id: "b" }]} getKey={(i) => i.id}>
        {(item: { id: string }) => <Breadcrumb>{item.id}</Breadcrumb>}
      </Breadcrumbs>
    ));
    const separators = [...container.querySelectorAll('[data-rsp-slot="separator"]')];
    expect(separators.length).toBe(1);
    expect(separators[0].textContent).toBe("/");
    expect(separators[0].getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector('[data-rsp-slot="separator"] svg')).toBeNull();
  });

  it("colours walkable segments with the structure channel and the leaf with plain ink", () => {
    /* Regression: with every segment on the same neutral ink there is no cue which parts
     * of the path are navigable, which is the entire point of a breadcrumb trail. */
    const { container } = render(() => (
      <Breadcrumbs aria-label="Path" items={[{ id: "a" }, { id: "b" }]} getKey={(i) => i.id}>
        {(item: { id: string }) => <Breadcrumb>{item.id}</Breadcrumb>}
      </Breadcrumbs>
    ));
    const items = [...container.querySelectorAll("li > span > *")];
    const rules = items.map((item) => allRulesFor(item));
    expect(rules.some((rule) => rule.includes("color:var(--status-info)"))).toBe(true);
    expect(rules.some((rule) => rule.includes("color:light-dark(#0f1622,#f4f8ff)"))).toBe(true);
  });
});

describe("TreeView — the outline tree", () => {
  it("uses the mono '>' mark as the disclosure affordance and rotates it when open", () => {
    /* One glyph means "opens/leads somewhere" across the rail, the list rows and the tree.
     * A filled chevron icon here would make the tree the one place it does not. */
    const { container } = render(() => <TreeFixture />);
    const button = container.querySelector('[data-rsp-slot="expand-button"]')!;
    const mark = button.querySelector("span")!;
    expect(mark.textContent).toBe(">");
    expect(mark.getAttribute("aria-hidden")).toBe("true");
    expect(button.querySelector("svg")).toBeNull();
    expect(declarationsOf(mark)).toContain("rotate:90deg");
  });
});

describe("StepList — channel marks", () => {
  it("keeps the step NUMBER in the accessible name after the bubble became a glyph", () => {
    /* The number used to live in the visible marker, which `aria-labelledby` points at.
     * Swapping that marker for a ✓/>/░ glyph silently drops "Step 2" from the announced
     * name unless the number moves to a visually-hidden span first. */
    const { getByRole } = render(() => (
      <StepList
        aria-label="Checkout"
        items={[
          { key: "details", label: "Details" },
          { key: "review", label: "Review" },
        ]}
        defaultSelectedKey="review"
      />
    ));
    expect(getByRole("link", { name: "2 Current: Review" })).toBeTruthy();
    expect(getByRole("link", { name: "1 Completed: Details" })).toBeTruthy();
  });

  it("marks done / now / not-reached with distinct glyphs", () => {
    const { container } = render(() => (
      <StepList
        aria-label="Checkout"
        items={[
          { key: "details", label: "Details" },
          { key: "review", label: "Review" },
          { key: "confirm", label: "Confirm" },
        ]}
        defaultSelectedKey="review"
      />
    ));
    const marks = [...container.querySelectorAll("li")].map(
      (li) => li.querySelector("span[aria-hidden=true]")!.textContent,
    );
    expect(marks).toEqual(["✓", ">", "░"]);
  });
});

describe("Link — underline policy", () => {
  it("keeps the underline on INLINE links at rest", () => {
    /* Dropping it would leave colour as the only cue that a run of body text is a link
     * (WCAG 1.4.1). Standalone links are chrome and carry their own box, so they may
     * reveal the underline on hover — inline ones may not. */
    const { getByRole } = render(() => <Link href="#">Read the brief</Link>);
    expect(declarationsOf(getByRole("link"))).toContain("text-decoration:underline");
  });

  it("drops the underline on STANDALONE links until hover", () => {
    const { getByRole } = render(() => (
      <Link href="#" isStandalone>
        Read the brief
      </Link>
    ));
    const link = getByRole("link");
    expect(declarationsOf(link)).toContain("text-decoration:none");
    fireEvent.pointerEnter(link, { pointerType: "mouse" });
    expect(declarationsOf(link)).toContain("text-decoration:underline");
  });
});

describe("Toolbar — the command strip", () => {
  it("mounts its controls in a dithered matte well, not on bare page", () => {
    /* A bare flex row of ActionButtons reads as loose buttons; the well is what makes the
     * run read as one instrument, and it is the same strip terminal Tabs and ActionBar use. */
    const { getByRole } = render(() => (
      <Toolbar aria-label="Formatting">
        <button type="button">Bold</button>
      </Toolbar>
    ));
    const rules = declarationsOf(getByRole("toolbar"));
    expect(rules).toContain("background-color:var(--surface-well)");
    expect(rules).toContain("repeating-conic-gradient(var(--well-scan)");
    expect(rules).toContain("border-color:var(--well-border)");
    expect(rules).toContain("padding-inline-start:4px");
  });
});

describe("Disclosure — a header is a list row", () => {
  it("uses the mono '>' mark, rotated when the panel is open", () => {
    const { container } = render(() => (
      <Disclosure defaultExpanded>
        <DisclosureTitle>Details</DisclosureTitle>
        <DisclosurePanel>Body</DisclosurePanel>
      </Disclosure>
    ));
    const mark = container.querySelector('[data-rsp-slot="disclosure-chevron"]')!;
    expect(mark.tagName.toLowerCase()).toBe("span");
    expect(mark.textContent).toBe(">");
    expect(declarationsOf(mark)).toContain("rotate:90deg");
  });

  it("takes the register's row fill on hover instead of a neutral scrim", () => {
    const { container } = render(() => (
      <Disclosure>
        <DisclosureTitle>Details</DisclosureTitle>
        <DisclosurePanel>Body</DisclosurePanel>
      </Disclosure>
    ));
    const trigger = container.querySelector('[data-rsp-slot="disclosure-trigger"]')!;
    expect(declarationsOf(trigger)).toContain("border-start-start-radius:6px");
    fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
    expect(declarationsOf(trigger)).toContain("var(--surface-hover)");
  });
});
