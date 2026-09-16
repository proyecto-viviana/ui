import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import {
  comboBoxDemoDefaults,
  comboBoxDemoPropsFromSearch,
  comboBoxItemsForPreset,
  normalizeComboBoxDemoProps,
  serializeComboBoxDemoProps,
} from "./combobox-demo";

const here = dirname(fileURLToPath(import.meta.url));
const solidFixtures = join(here, "../components/solid/fixtures/styled");
const reactFixtures = join(here, "../components/react/fixtures/styled");

function read(path: string): string {
  return readFileSync(path, "utf8");
}

describe("ComboBox and Picker comparison fixtures form wrap (M7)", () => {
  it("Solid ComboBox only renders an external form when demoProps.form is set", () => {
    const source = read(join(solidFixtures, "combobox.tsx"));
    expect(source).not.toContain("combobox-external-form");
    expect(source).toMatch(/demoProps\(\)\.form\s*\n\s*\? h\("form"/);
  });

  it("Solid Picker only renders an external form when demoProps.form is set", () => {
    const source = read(join(solidFixtures, "picker.tsx"));
    expect(source).not.toContain("picker-external-form");
    expect(source).toMatch(/demoProps\(\)\.form\s*\n\s*\? h\("form"/);
  });

  it("React ComboBox and Picker still gate the external form on demoProps.form", () => {
    const comboBox = read(join(reactFixtures, "combobox.js"));
    const picker = read(join(reactFixtures, "picker.js"));
    expect(comboBox).toContain(
      'demoProps.form ? jsx("form", { id: demoProps.form, hidden: true }) : null',
    );
    expect(picker).toContain(
      'demoProps.form ? jsx("form", { id: demoProps.form, hidden: true }) : null',
    );
  });
});

describe("ComboBox D13 fixture protocol (#245-A)", () => {
  it("normalizes selectedKey=none to no key and round-trips new fields", () => {
    const normalized = normalizeComboBoxDemoProps({
      selectedKey: "none",
      eventLog: true,
      itemsSource: "defaultItems",
    });
    expect(normalized.selectedKey).toBe("none");
    expect(normalized.eventLog).toBe(true);
    expect(normalized.itemsSource).toBe("defaultItems");
    const serialized = serializeComboBoxDemoProps(normalized);
    expect(serialized).toContain('"selectedKey":"none"');
    expect(serialized).toContain('"eventLog":true');
  });

  it("omitting URL params keeps selectedKey=pro and itemsSource=items", () => {
    const fromEmpty = comboBoxDemoPropsFromSearch("");
    expect(comboBoxDemoDefaults.selectedKey).toBe("pro");
    expect(comboBoxDemoDefaults.itemsSource).toBe("items");
    expect(fromEmpty.selectedKey).toBe("pro");
    expect(fromEmpty.itemsSource).toBe("items");
  });

  it("comboBoxItemsForPreset returns expected shapes", () => {
    expect(comboBoxItemsForPreset("empty")).toEqual([]);
    expect(comboBoxItemsForPreset("many").length).toBe(50);
  });
});
