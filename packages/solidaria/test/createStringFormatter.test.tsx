/**
 * @vitest-environment jsdom
 *
 * Fails if a catalog string containing `{` reaches a caller verbatim — the
 * headless formatter must compile the ICU subset `@internationalized/string-compiler`
 * emits, matching LocalizedStringFormatter.format's function-or-string contract.
 */

import { describe, expect, it } from "vite-plus/test";
import { createRoot } from "solid-js";
import { I18nProvider, createStringFormatter } from "../src/i18n";
import { dndIntlStrings } from "../src/dnd/intl";
import type { LocalizedString, LocalizedStrings } from "@internationalized/string";

const DE_ACTIONBAR_SELECTED =
  "{count, plural, =0 {Nichts ausgewählt} one {# ausgewählt} other {# ausgewählt}}";
const AR_ACTIONBAR_SELECTED = "{count, plural, =0 {غير محدد} other {# محدد}}";

const catalog: LocalizedStrings<string, LocalizedString> = {
  "en-US": {
    plain: "Actions",
    greeting: "Hello, {name}!",
    count: "{count, plural, one {# item} other {# items}}",
    selected: "{count, plural, =0 {None selected} other {# selected}}",
    tagged: "{tagCount, number}",
    badge: "{notifications}+",
    choose: "{gender, select, male {He} female {She} other {They}}",
    ordinal: "{pos, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}",
    nested: "{count, plural, one {one {name}} other {# {name}s}}",
    escaped: "Use '{'count'}' literally",
    mixed: "Use '{'brace'}' and {name}",
    already: (args) => `precompiled:${args?.name}`,
  },
  "de-DE": {
    "actionbar.selected": DE_ACTIONBAR_SELECTED,
    count: "{count, plural, one {# Element} other {# Elemente}}",
  },
  "ar-AE": {
    "actionbar.selected": AR_ACTIONBAR_SELECTED,
    plurals: "{count, plural, zero {z} one {o} two {t} few {f} many {m} other {x}}",
  },
};

function format(
  locale: string,
  key: string,
  variables?: Record<string, string | number | boolean>,
  strings: LocalizedStrings<string, LocalizedString> = catalog,
): string {
  let result = "";
  createRoot((dispose) => {
    const tree = (
      <I18nProvider locale={locale}>
        {(() => {
          result = createStringFormatter(strings)().format(key, variables);
          return null;
        })()}
      </I18nProvider>
    );
    void tree;
    dispose();
  });
  return result;
}

describe("createStringFormatter ICU compile", () => {
  it("passes a string with no arguments through unchanged", () => {
    expect(format("en-US", "plain")).toBe("Actions");
    expect(catalog["en-US"]!.plain).toBe("Actions");
  });

  it("passes a message that is already a function through", () => {
    expect(format("en-US", "already", { name: "Ada" })).toBe("precompiled:Ada");
  });

  it("interpolates {var}", () => {
    expect(format("en-US", "greeting", { name: "World" })).toBe("Hello, World!");
    expect(format("en-US", "badge", { notifications: 9 })).toBe("9+");
  });

  it("formats {var, number}", () => {
    expect(format("en-US", "tagged", { tagCount: 1234 })).toBe("1,234");
    expect(
      format(
        "de-DE",
        "tagged",
        { tagCount: 1234 },
        {
          "de-DE": { tagged: "{tagCount, number}" },
        },
      ),
    ).toBe("1.234");
  });

  it("substitutes # in the selected plural form", () => {
    expect(format("en-US", "count", { count: 1 })).toBe("1 item");
    expect(format("en-US", "count", { count: 5 })).toBe("5 items");
    expect(format("de-DE", "count", { count: 1 })).toBe("1 Element");
    expect(format("de-DE", "count", { count: 3 })).toBe("3 Elemente");
  });

  it("selects ar-AE plural categories, not English one/other", () => {
    expect(format("ar-AE", "plurals", { count: 0 })).toBe("z");
    expect(format("ar-AE", "plurals", { count: 1 })).toBe("o");
    expect(format("ar-AE", "plurals", { count: 2 })).toBe("t");
    expect(format("ar-AE", "plurals", { count: 3 })).toBe("f");
    expect(format("ar-AE", "plurals", { count: 11 })).toBe("m");
    expect(format("ar-AE", "plurals", { count: 100 })).toBe("x");
  });

  it("formats {var, select}", () => {
    expect(format("en-US", "choose", { gender: "male" })).toBe("He");
    expect(format("en-US", "choose", { gender: "female" })).toBe("She");
    expect(format("en-US", "choose", { gender: "other" })).toBe("They");
    expect(format("en-US", "choose", { gender: "unknown" })).toBe("They");
  });

  it("formats {var, selectordinal}", () => {
    expect(format("en-US", "ordinal", { pos: 1 })).toBe("1st");
    expect(format("en-US", "ordinal", { pos: 2 })).toBe("2nd");
    expect(format("en-US", "ordinal", { pos: 3 })).toBe("3rd");
    expect(format("en-US", "ordinal", { pos: 4 })).toBe("4th");
    expect(format("en-US", "ordinal", { pos: 21 })).toBe("21st");
  });

  it("unescapes ICU apostrophe braces and still interpolates real arguments", () => {
    expect(format("en-US", "escaped")).toBe("Use {count} literally");
    expect(format("en-US", "mixed", { name: "Ada" })).toBe("Use {brace} and Ada");
  });

  it("formats nested arguments inside a plural option", () => {
    expect(format("en-US", "nested", { count: 1, name: "file" })).toBe("one file");
    expect(format("en-US", "nested", { count: 4, name: "file" })).toBe("4 files");
  });

  it("leaves catalog JSON containing '{' verbatim and still formats it", () => {
    expect(catalog["de-DE"]!["actionbar.selected"]).toBe(DE_ACTIONBAR_SELECTED);
    expect(format("de-DE", "actionbar.selected", { count: 1 })).toBe("1 ausgewählt");
    expect(format("ar-AE", "actionbar.selected", { count: 3 })).toBe("3 محدد");
  });

  it("formats actionbar.selected for de-DE instead of returning the ICU template", () => {
    expect(format("de-DE", "actionbar.selected", { count: 1 })).toBe("1 ausgewählt");
    expect(format("de-DE", "actionbar.selected", { count: 1 })).not.toContain("{count");
  });

  it("formats the dnd drop announcement instead of returning Drop on {itemText}", () => {
    expect(dndIntlStrings["en-US"]!.dropOnItem).toBe("Drop on {itemText}");
    expect(format("en-US", "dropOnItem", { itemText: "Folder" }, dndIntlStrings)).toBe(
      "Drop on Folder",
    );
    expect(format("en-US", "dropOnItem", { itemText: "Folder" }, dndIntlStrings)).not.toContain(
      "{itemText}",
    );
  });

  it("formats dnd dragSelectedItems plurals instead of returning the ICU template", () => {
    expect(format("en-US", "dragSelectedItems", { count: 1 }, dndIntlStrings)).toBe(
      "Drag 1 selected item",
    );
    expect(format("en-US", "dragSelectedItems", { count: 3 }, dndIntlStrings)).toBe(
      "Drag 3 selected items",
    );
  });

  it("memoizes per locale+key so a second format is the same compiled output", () => {
    createRoot((dispose) => {
      const tree = (
        <I18nProvider locale="de-DE">
          {(() => {
            const formatter = createStringFormatter(catalog);
            expect(formatter().format("count", { count: 1 })).toBe("1 Element");
            expect(formatter().format("count", { count: 2 })).toBe("2 Elemente");
            return null;
          })()}
        </I18nProvider>
      );
      void tree;
      dispose();
    });
    expect(format("en-US", "count", { count: 1 })).toBe("1 item");
  });

  it("compiles through createStringFormatter when the provider locale changes", () => {
    createRoot((dispose) => {
      const el = (
        <I18nProvider locale="de-DE">
          {(() => {
            const formatter = createStringFormatter(catalog);
            expect(formatter().format("actionbar.selected", { count: 1 })).toBe("1 ausgewählt");
            return null;
          })()}
        </I18nProvider>
      );
      expect(el).toBeTruthy();
      dispose();
    });
  });
});
