/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach } from "vite-plus/test";
import { createRoot, createSignal } from "solid-js";
import {
  // Utils
  isRTL,
  createCacheKey,
  // Locale
  I18nProvider,
  useLocale,
  createDefaultLocale,
  getDefaultLocale,
  // NumberFormatter
  NumberFormatter,
  createNumberFormatter,
  // Date formatter
  createDateFormatter,
  // Collator
  createCollator,
  // Filter
  createFilter,
} from "../src/i18n";

// ============================================
// RTL UTILITIES
// ============================================

describe("isRTL", () => {
  it("should return true for Arabic", () => {
    expect(isRTL("ar")).toBe(true);
    expect(isRTL("ar-SA")).toBe(true);
    expect(isRTL("ar-EG")).toBe(true);
  });

  it("should return true for Hebrew", () => {
    expect(isRTL("he")).toBe(true);
    expect(isRTL("he-IL")).toBe(true);
  });

  it("should return true for Persian/Farsi", () => {
    expect(isRTL("fa")).toBe(true);
    expect(isRTL("fa-IR")).toBe(true);
  });

  it("should return true for Urdu", () => {
    expect(isRTL("ur")).toBe(true);
    expect(isRTL("ur-PK")).toBe(true);
  });

  it("should return false for English", () => {
    expect(isRTL("en")).toBe(false);
    expect(isRTL("en-US")).toBe(false);
    expect(isRTL("en-GB")).toBe(false);
  });

  it("should return false for Spanish", () => {
    expect(isRTL("es")).toBe(false);
    expect(isRTL("es-ES")).toBe(false);
    expect(isRTL("es-MX")).toBe(false);
  });

  it("should return false for Chinese", () => {
    expect(isRTL("zh")).toBe(false);
    expect(isRTL("zh-CN")).toBe(false);
    expect(isRTL("zh-TW")).toBe(false);
  });

  it("should return false for Japanese", () => {
    expect(isRTL("ja")).toBe(false);
    expect(isRTL("ja-JP")).toBe(false);
  });

  it("should return false for French", () => {
    expect(isRTL("fr")).toBe(false);
    expect(isRTL("fr-FR")).toBe(false);
  });

  it("should return false for German", () => {
    expect(isRTL("de")).toBe(false);
    expect(isRTL("de-DE")).toBe(false);
  });
});

describe("createCacheKey", () => {
  it("should return locale string when no options provided", () => {
    expect(createCacheKey("en-US")).toBe("en-US");
    expect(createCacheKey("fr-FR")).toBe("fr-FR");
  });

  it("should return locale string when options is undefined", () => {
    expect(createCacheKey("en-US", undefined)).toBe("en-US");
  });

  it("should return locale string when options is empty", () => {
    expect(createCacheKey("en-US", {})).toBe("en-US");
  });

  it("should combine locale with sorted options", () => {
    const key1 = createCacheKey("en-US", { style: "currency", currency: "USD" });
    const key2 = createCacheKey("en-US", { currency: "USD", style: "currency" });
    expect(key1).toBe(key2);
  });

  it("should produce different keys for different locales", () => {
    const key1 = createCacheKey("en-US", { style: "decimal" });
    const key2 = createCacheKey("de-DE", { style: "decimal" });
    expect(key1).not.toBe(key2);
  });

  it("should produce different keys for different options", () => {
    const key1 = createCacheKey("en-US", { style: "decimal" });
    const key2 = createCacheKey("en-US", { style: "percent" });
    expect(key1).not.toBe(key2);
  });
});

// ============================================
// LOCALE
// ============================================

describe("getDefaultLocale", () => {
  it("should return a locale object with locale and direction", () => {
    const locale = getDefaultLocale();
    expect(locale).toHaveProperty("locale");
    expect(locale).toHaveProperty("direction");
    expect(typeof locale.locale).toBe("string");
    expect(["ltr", "rtl"]).toContain(locale.direction);
  });

  it("should return ltr direction for en-US", () => {
    // Note: This test depends on the browser/system locale or fallback
    const locale = getDefaultLocale();
    // In test environment, usually defaults to en-US
    if (locale.locale.startsWith("en")) {
      expect(locale.direction).toBe("ltr");
    }
  });
});

describe("createDefaultLocale", () => {
  it("should return an accessor that provides locale info", () => {
    createRoot((dispose) => {
      const locale = createDefaultLocale();

      expect(typeof locale).toBe("function");
      expect(locale()).toHaveProperty("locale");
      expect(locale()).toHaveProperty("direction");

      dispose();
    });
  });
});

describe("useLocale", () => {
  it("should return default locale when used outside provider", () => {
    createRoot((dispose) => {
      const locale = useLocale();

      expect(typeof locale).toBe("function");
      expect(locale()).toHaveProperty("locale");
      expect(locale()).toHaveProperty("direction");

      dispose();
    });
  });
});

describe("I18nProvider", () => {
  it("should provide locale to children", () => {
    createRoot((dispose) => {
      let capturedLocale: ReturnType<typeof useLocale> | undefined;

      const el = (
        <I18nProvider locale="en-US">
          {(() => {
            capturedLocale = useLocale();
            return null;
          })()}
        </I18nProvider>
      );

      expect(capturedLocale).toBeDefined();
      expect(capturedLocale!().locale).toBe("en-US");
      expect(capturedLocale!().direction).toBe("ltr");

      dispose();
    });
  });

  it("should provide RTL direction for Arabic locale", () => {
    createRoot((dispose) => {
      let capturedLocale: ReturnType<typeof useLocale> | undefined;

      const el = (
        <I18nProvider locale="ar-SA">
          {(() => {
            capturedLocale = useLocale();
            return null;
          })()}
        </I18nProvider>
      );

      expect(capturedLocale!().locale).toBe("ar-SA");
      expect(capturedLocale!().direction).toBe("rtl");

      dispose();
    });
  });

  it("should provide RTL direction for Hebrew locale", () => {
    createRoot((dispose) => {
      let capturedLocale: ReturnType<typeof useLocale> | undefined;

      const el = (
        <I18nProvider locale="he-IL">
          {(() => {
            capturedLocale = useLocale();
            return null;
          })()}
        </I18nProvider>
      );

      expect(capturedLocale!().locale).toBe("he-IL");
      expect(capturedLocale!().direction).toBe("rtl");

      dispose();
    });
  });

  it("should use browser default when no locale provided", () => {
    createRoot((dispose) => {
      let capturedLocale: ReturnType<typeof useLocale> | undefined;

      const el = (
        <I18nProvider>
          {(() => {
            capturedLocale = useLocale();
            return null;
          })()}
        </I18nProvider>
      );

      expect(capturedLocale).toBeDefined();
      expect(capturedLocale!().locale).toBeTruthy();

      dispose();
    });
  });

  it("should support nested providers", () => {
    createRoot((dispose) => {
      let outerLocale: ReturnType<typeof useLocale> | undefined;
      let innerLocale: ReturnType<typeof useLocale> | undefined;

      const el = (
        <I18nProvider locale="en-US">
          {(() => {
            outerLocale = useLocale();
            return (
              <I18nProvider locale="de-DE">
                {(() => {
                  innerLocale = useLocale();
                  return null;
                })()}
              </I18nProvider>
            );
          })()}
        </I18nProvider>
      );

      expect(outerLocale!().locale).toBe("en-US");
      expect(innerLocale!().locale).toBe("de-DE");

      dispose();
    });
  });
});

// ============================================
// NUMBER FORMATTER
// ============================================

describe("NumberFormatter", () => {
  it("should format basic numbers", () => {
    const formatter = new NumberFormatter("en-US");
    expect(formatter.format(1234)).toBe("1,234");
    expect(formatter.format(1234.56)).toBe("1,234.56");
  });

  it("should format currency", () => {
    const formatter = new NumberFormatter("en-US", {
      style: "currency",
      currency: "USD",
    });
    expect(formatter.format(1234.56)).toBe("$1,234.56");
  });

  it("should format currency with Euro", () => {
    const formatter = new NumberFormatter("de-DE", {
      style: "currency",
      currency: "EUR",
    });
    const result = formatter.format(1234.56);
    // German format uses different decimal/thousand separators
    expect(result).toContain("€");
    expect(result).toContain("1.234,56");
  });

  it("should format percent", () => {
    const formatter = new NumberFormatter("en-US", {
      style: "percent",
    });
    expect(formatter.format(0.25)).toBe("25%");
    expect(formatter.format(1)).toBe("100%");
  });

  it("should format with minimum fraction digits", () => {
    const formatter = new NumberFormatter("en-US", {
      minimumFractionDigits: 2,
    });
    expect(formatter.format(1234)).toBe("1,234.00");
  });

  it("should format with maximum fraction digits", () => {
    const formatter = new NumberFormatter("en-US", {
      maximumFractionDigits: 1,
    });
    expect(formatter.format(1234.56)).toBe("1,234.6");
  });

  it("should use different grouping for different locales", () => {
    const enFormatter = new NumberFormatter("en-US");
    const deFormatter = new NumberFormatter("de-DE");

    expect(enFormatter.format(1234567.89)).toBe("1,234,567.89");
    expect(deFormatter.format(1234567.89)).toBe("1.234.567,89");
  });

  it("should format negative numbers", () => {
    const formatter = new NumberFormatter("en-US");
    expect(formatter.format(-1234)).toBe("-1,234");
  });

  it("should format zero", () => {
    const formatter = new NumberFormatter("en-US");
    expect(formatter.format(0)).toBe("0");
  });

  describe("formatRange", () => {
    it("should format a range of numbers", () => {
      const formatter = new NumberFormatter("en-US");
      const result = formatter.formatRange(10, 100);
      // Should contain both numbers and a separator
      expect(result).toMatch(/10.*100/);
    });

    it("should format same number range", () => {
      const formatter = new NumberFormatter("en-US");
      const result = formatter.formatRange(50, 50);
      // Same number range should still format
      expect(result).toMatch(/50/);
    });
  });

  describe("formatToParts", () => {
    it("should return parts array", () => {
      const formatter = new NumberFormatter("en-US", {
        style: "currency",
        currency: "USD",
      });
      const parts = formatter.formatToParts(1234.56);

      expect(Array.isArray(parts)).toBe(true);
      expect(parts.length).toBeGreaterThan(0);

      const types = parts.map((p) => p.type);
      expect(types).toContain("currency");
      expect(types).toContain("integer");
    });
  });

  describe("resolvedOptions", () => {
    it("should return resolved options", () => {
      const formatter = new NumberFormatter("en-US", {
        style: "currency",
        currency: "USD",
      });
      const options = formatter.resolvedOptions();

      expect(options.locale).toBe("en-US");
      expect(options.style).toBe("currency");
      expect(options.currency).toBe("USD");
    });
  });
});

describe("createNumberFormatter", () => {
  it("should return a formatter accessor", () => {
    createRoot((dispose) => {
      const formatter = createNumberFormatter();
      expect(typeof formatter).toBe("function");
      expect(formatter()).toBeInstanceOf(NumberFormatter);

      dispose();
    });
  });

  it("should format numbers based on default locale", () => {
    createRoot((dispose) => {
      const formatter = createNumberFormatter();
      const result = formatter().format(1234);
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");

      dispose();
    });
  });

  it("should format currency when options provided", () => {
    createRoot((dispose) => {
      const el = (
        <I18nProvider locale="en-US">
          {(() => {
            const formatter = createNumberFormatter({
              style: "currency",
              currency: "USD",
            });
            expect(formatter().format(1234.56)).toBe("$1,234.56");
            return null;
          })()}
        </I18nProvider>
      );

      dispose();
    });
  });

  it("should respect locale from provider", () => {
    createRoot((dispose) => {
      const el = (
        <I18nProvider locale="de-DE">
          {(() => {
            const formatter = createNumberFormatter({
              style: "currency",
              currency: "EUR",
            });
            const result = formatter().format(1234.56);
            expect(result).toContain("€");
            expect(result).toContain("1.234,56");
            return null;
          })()}
        </I18nProvider>
      );

      dispose();
    });
  });

  it("should format percent", () => {
    createRoot((dispose) => {
      const el = (
        <I18nProvider locale="en-US">
          {(() => {
            const formatter = createNumberFormatter({ style: "percent" });
            expect(formatter().format(0.5)).toBe("50%");
            return null;
          })()}
        </I18nProvider>
      );

      dispose();
    });
  });
});

// ============================================
// DATE FORMATTER
// ============================================

describe("createDateFormatter", () => {
  const testDate = new Date(2024, 0, 15, 14, 30, 0); // Jan 15, 2024, 2:30 PM

  it("should return a formatter accessor", () => {
    createRoot((dispose) => {
      const formatter = createDateFormatter();
      expect(typeof formatter).toBe("function");
      expect(formatter()).toBeInstanceOf(Intl.DateTimeFormat);

      dispose();
    });
  });

  it("should format dates with basic options", () => {
    createRoot((dispose) => {
      const el = (
        <I18nProvider locale="en-US">
          {(() => {
            const formatter = createDateFormatter({
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            const result = formatter().format(testDate);
            expect(result).toContain("January");
            expect(result).toContain("15");
            expect(result).toContain("2024");
            return null;
          })()}
        </I18nProvider>
      );

      dispose();
    });
  });

  it("should format dates with short style", () => {
    createRoot((dispose) => {
      const el = (
        <I18nProvider locale="en-US">
          {(() => {
            const formatter = createDateFormatter({ dateStyle: "short" });
            const result = formatter().format(testDate);
            expect(result).toBeTruthy();
            // Short format typically includes numbers
            expect(result).toMatch(/\d/);
            return null;
          })()}
        </I18nProvider>
      );

      dispose();
    });
  });

  it("should format time", () => {
    createRoot((dispose) => {
      const el = (
        <I18nProvider locale="en-US">
          {(() => {
            const formatter = createDateFormatter({
              hour: "numeric",
              minute: "2-digit",
            });
            const result = formatter().format(testDate);
            expect(result).toMatch(/2:30|14:30/);
            return null;
          })()}
        </I18nProvider>
      );

      dispose();
    });
  });

  it("should respect locale from provider for date format", () => {
    createRoot((dispose) => {
      const el = (
        <I18nProvider locale="de-DE">
          {(() => {
            const formatter = createDateFormatter({
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            const result = formatter().format(testDate);
            // German month name
            expect(result).toContain("Januar");
            return null;
          })()}
        </I18nProvider>
      );

      dispose();
    });
  });

  it("should respect locale from provider for French", () => {
    createRoot((dispose) => {
      const el = (
        <I18nProvider locale="fr-FR">
          {(() => {
            const formatter = createDateFormatter({
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            const result = formatter().format(testDate);
            // French month name
            expect(result).toContain("janvier");
            return null;
          })()}
        </I18nProvider>
      );

      dispose();
    });
  });
});

// ============================================
// COLLATOR
// ============================================

describe("createCollator", () => {
  it("should return a collator accessor", () => {
    createRoot((dispose) => {
      const collator = createCollator();
      expect(typeof collator).toBe("function");
      expect(collator()).toBeInstanceOf(Intl.Collator);

      dispose();
    });
  });

  it("should compare strings in locale order", () => {
    createRoot((dispose) => {
      const el = (
        <I18nProvider locale="en-US">
          {(() => {
            const collator = createCollator();
            expect(collator().compare("a", "b")).toBeLessThan(0);
            expect(collator().compare("b", "a")).toBeGreaterThan(0);
            expect(collator().compare("a", "a")).toBe(0);
            return null;
          })()}
        </I18nProvider>
      );

      dispose();
    });
  });

  it("should sort strings alphabetically", () => {
    createRoot((dispose) => {
      const el = (
        <I18nProvider locale="en-US">
          {(() => {
            const collator = createCollator();
            const items = ["banana", "apple", "cherry"];
            const sorted = [...items].sort((a, b) => collator().compare(a, b));
            expect(sorted).toEqual(["apple", "banana", "cherry"]);
            return null;
          })()}
        </I18nProvider>
      );

      dispose();
    });
  });

  it("should handle case-insensitive comparison with sensitivity: base", () => {
    createRoot((dispose) => {
      const el = (
        <I18nProvider locale="en-US">
          {(() => {
            const collator = createCollator({ sensitivity: "base" });
            expect(collator().compare("A", "a")).toBe(0);
            expect(collator().compare("Hello", "hello")).toBe(0);
            return null;
          })()}
        </I18nProvider>
      );

      dispose();
    });
  });

  it("should handle numeric sorting", () => {
    createRoot((dispose) => {
      const el = (
        <I18nProvider locale="en-US">
          {(() => {
            const collator = createCollator({ numeric: true });
            const items = ["a10", "a2", "a1"];
            const sorted = [...items].sort((a, b) => collator().compare(a, b));
            expect(sorted).toEqual(["a1", "a2", "a10"]);
            return null;
          })()}
        </I18nProvider>
      );

      dispose();
    });
  });

  it("should handle German locale with umlauts", () => {
    createRoot((dispose) => {
      const el = (
        <I18nProvider locale="de-DE">
          {(() => {
            const collator = createCollator();
            // In German, ä is sorted with a
            const items = ["äpfel", "apfel", "birne"];
            const sorted = [...items].sort((a, b) => collator().compare(a, b));
            // The order depends on locale rules
            expect(sorted[2]).toBe("birne");
            return null;
          })()}
        </I18nProvider>
      );

      dispose();
    });
  });
});

// ============================================
// FILTER
// ============================================

describe("createFilter", () => {
  it("should return a filter accessor", () => {
    createRoot((dispose) => {
      const filter = createFilter();
      expect(typeof filter).toBe("function");
      expect(filter()).toHaveProperty("startsWith");
      expect(filter()).toHaveProperty("endsWith");
      expect(filter()).toHaveProperty("contains");

      dispose();
    });
  });

  describe("startsWith", () => {
    it("should return true when string starts with substring", () => {
      createRoot((dispose) => {
        const el = (
          <I18nProvider locale="en-US">
            {(() => {
              const filter = createFilter();
              expect(filter().startsWith("Hello World", "Hello")).toBe(true);
              expect(filter().startsWith("Hello", "H")).toBe(true);
              return null;
            })()}
          </I18nProvider>
        );

        dispose();
      });
    });

    it("should return false when string does not start with substring", () => {
      createRoot((dispose) => {
        const el = (
          <I18nProvider locale="en-US">
            {(() => {
              const filter = createFilter();
              expect(filter().startsWith("Hello World", "World")).toBe(false);
              expect(filter().startsWith("abc", "b")).toBe(false);
              return null;
            })()}
          </I18nProvider>
        );

        dispose();
      });
    });

    it("should return true for empty substring", () => {
      createRoot((dispose) => {
        const el = (
          <I18nProvider locale="en-US">
            {(() => {
              const filter = createFilter();
              expect(filter().startsWith("Hello", "")).toBe(true);
              return null;
            })()}
          </I18nProvider>
        );

        dispose();
      });
    });

    it("should be case-insensitive with sensitivity: base", () => {
      createRoot((dispose) => {
        const el = (
          <I18nProvider locale="en-US">
            {(() => {
              const filter = createFilter({ sensitivity: "base" });
              expect(filter().startsWith("Hello World", "hello")).toBe(true);
              expect(filter().startsWith("HELLO", "hello")).toBe(true);
              return null;
            })()}
          </I18nProvider>
        );

        dispose();
      });
    });
  });

  describe("endsWith", () => {
    it("should return true when string ends with substring", () => {
      createRoot((dispose) => {
        const el = (
          <I18nProvider locale="en-US">
            {(() => {
              const filter = createFilter();
              expect(filter().endsWith("Hello World", "World")).toBe(true);
              expect(filter().endsWith("Hello", "o")).toBe(true);
              return null;
            })()}
          </I18nProvider>
        );

        dispose();
      });
    });

    it("should return false when string does not end with substring", () => {
      createRoot((dispose) => {
        const el = (
          <I18nProvider locale="en-US">
            {(() => {
              const filter = createFilter();
              expect(filter().endsWith("Hello World", "Hello")).toBe(false);
              expect(filter().endsWith("abc", "b")).toBe(false);
              return null;
            })()}
          </I18nProvider>
        );

        dispose();
      });
    });

    it("should return true for empty substring", () => {
      createRoot((dispose) => {
        const el = (
          <I18nProvider locale="en-US">
            {(() => {
              const filter = createFilter();
              expect(filter().endsWith("Hello", "")).toBe(true);
              return null;
            })()}
          </I18nProvider>
        );

        dispose();
      });
    });

    it("should be case-insensitive with sensitivity: base", () => {
      createRoot((dispose) => {
        const el = (
          <I18nProvider locale="en-US">
            {(() => {
              const filter = createFilter({ sensitivity: "base" });
              expect(filter().endsWith("Hello World", "WORLD")).toBe(true);
              return null;
            })()}
          </I18nProvider>
        );

        dispose();
      });
    });
  });

  describe("contains", () => {
    it("should return true when string contains substring", () => {
      createRoot((dispose) => {
        const el = (
          <I18nProvider locale="en-US">
            {(() => {
              const filter = createFilter();
              expect(filter().contains("Hello World", "lo Wo")).toBe(true);
              expect(filter().contains("Hello", "ell")).toBe(true);
              expect(filter().contains("abc", "b")).toBe(true);
              return null;
            })()}
          </I18nProvider>
        );

        dispose();
      });
    });

    it("should return false when string does not contain substring", () => {
      createRoot((dispose) => {
        const el = (
          <I18nProvider locale="en-US">
            {(() => {
              const filter = createFilter();
              expect(filter().contains("Hello World", "xyz")).toBe(false);
              expect(filter().contains("abc", "d")).toBe(false);
              return null;
            })()}
          </I18nProvider>
        );

        dispose();
      });
    });

    it("should return true for empty substring", () => {
      createRoot((dispose) => {
        const el = (
          <I18nProvider locale="en-US">
            {(() => {
              const filter = createFilter();
              expect(filter().contains("Hello", "")).toBe(true);
              return null;
            })()}
          </I18nProvider>
        );

        dispose();
      });
    });

    it("should be case-insensitive with sensitivity: base", () => {
      createRoot((dispose) => {
        const el = (
          <I18nProvider locale="en-US">
            {(() => {
              const filter = createFilter({ sensitivity: "base" });
              expect(filter().contains("Hello World", "LO WO")).toBe(true);
              expect(filter().contains("HELLO", "ell")).toBe(true);
              return null;
            })()}
          </I18nProvider>
        );

        dispose();
      });
    });

    it("should handle diacritics with sensitivity: base", () => {
      createRoot((dispose) => {
        const el = (
          <I18nProvider locale="en-US">
            {(() => {
              const filter = createFilter({ sensitivity: "base" });
              expect(filter().contains("café", "cafe")).toBe(true);
              expect(filter().contains("résumé", "resume")).toBe(true);
              return null;
            })()}
          </I18nProvider>
        );

        dispose();
      });
    });
  });

  describe("filtering lists", () => {
    it("should filter items in a list", () => {
      createRoot((dispose) => {
        const el = (
          <I18nProvider locale="en-US">
            {(() => {
              const filter = createFilter({ sensitivity: "base" });
              const items = ["Apple", "Banana", "Apricot", "Cherry"];

              const filtered = items.filter((item) => filter().startsWith(item, "ap"));

              expect(filtered).toEqual(["Apple", "Apricot"]);
              return null;
            })()}
          </I18nProvider>
        );

        dispose();
      });
    });

    it("should search items containing substring", () => {
      createRoot((dispose) => {
        const el = (
          <I18nProvider locale="en-US">
            {(() => {
              const filter = createFilter({ sensitivity: "base" });
              const items = ["Football", "Basketball", "Baseball", "Tennis"];

              const filtered = items.filter((item) => filter().contains(item, "ball"));

              expect(filtered).toEqual(["Football", "Basketball", "Baseball"]);
              return null;
            })()}
          </I18nProvider>
        );

        dispose();
      });
    });
  });
});
