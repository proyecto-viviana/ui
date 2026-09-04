/**
 * @vitest-environment jsdom
 *
 * Failing-first catalog checks: formatting under ar-AE, de-DE, ja-JP, and he-IL
 * must return the upstream string, not silent English fallback.
 */

import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { I18nProvider, createStringFormatter } from "../src/i18n";
import { searchFieldIntlStrings } from "../src/searchfield/intl";
import { tableIntlStrings } from "../src/table/intl";
import { tagIntlStrings } from "../src/tag/intl";
import { autocompleteIntlStrings } from "../src/autocomplete/intl";
import { breadcrumbsIntlStrings } from "../src/breadcrumbs/intl";
import { gridIntlStrings } from "../src/grid/intl";
import { gridListIntlStrings } from "../src/gridlist/intl";
import { overlaysIntlStrings } from "../src/overlays/intl";
import { toastIntlStrings } from "../src/toast/intl";
import { treeIntlStrings } from "../src/tree/intl";
import type { LocalizedStrings } from "@internationalized/string";

const LOCALES = ["ar-AE", "de-DE", "ja-JP", "he-IL"] as const;

function FormatProbe<K extends string>(props: {
  strings: LocalizedStrings<K, string>;
  messageKey: K;
  packageName?: string;
}) {
  const formatter = createStringFormatter(props.strings, props.packageName);
  return <span data-testid="formatted">{formatter().format(props.messageKey)}</span>;
}

function expectCatalog(options: {
  name: string;
  strings: LocalizedStrings<string, string>;
  messageKey: string;
  packageName: string;
  expected: Record<(typeof LOCALES)[number], string>;
  english: string;
}) {
  describe(options.name, () => {
    it.each(LOCALES)("formats %s from the catalog, not English fallback", (locale) => {
      const expected = options.expected[locale];
      render(() => (
        <I18nProvider locale={locale}>
          <FormatProbe
            strings={options.strings}
            messageKey={options.messageKey}
            packageName={options.packageName}
          />
        </I18nProvider>
      ));
      expect(screen.getByTestId("formatted")).toHaveTextContent(expected);
      if (expected !== options.english) {
        expect(screen.getByTestId("formatted")).not.toHaveTextContent(options.english);
      }
    });
  });
}

describe("react-aria intl catalogs", () => {
  expectCatalog({
    name: "searchfield",
    strings: searchFieldIntlStrings,
    messageKey: "Clear search",
    packageName: "@react-aria/searchfield",
    english: "Clear search",
    expected: {
      "ar-AE": "مسح البحث",
      "de-DE": "Suche zurücksetzen",
      "ja-JP": "検索をクリア",
      "he-IL": "נקה חיפוש",
    },
  });

  expectCatalog({
    name: "table",
    strings: tableIntlStrings,
    messageKey: "sortable",
    packageName: "@react-aria/table",
    english: "sortable column",
    expected: {
      "ar-AE": "عمود قابل للترتيب",
      "de-DE": "sortierbare Spalte",
      "ja-JP": "並べ替え可能な列",
      "he-IL": "עמודה שניתן למיין",
    },
  });

  expectCatalog({
    name: "tag",
    strings: tagIntlStrings,
    messageKey: "removeButtonLabel",
    packageName: "@react-aria/tag",
    english: "Remove",
    expected: {
      "ar-AE": "إزالة",
      "de-DE": "Entfernen",
      "ja-JP": "削除",
      "he-IL": "הסר",
    },
  });

  expectCatalog({
    name: "autocomplete",
    strings: autocompleteIntlStrings,
    messageKey: "collectionLabel",
    packageName: "@react-aria/autocomplete",
    english: "Suggestions",
    expected: {
      "ar-AE": "مقترحات",
      "de-DE": "Empfehlungen",
      "ja-JP": "候補",
      "he-IL": "הצעות",
    },
  });

  expectCatalog({
    name: "breadcrumbs",
    strings: breadcrumbsIntlStrings,
    messageKey: "breadcrumbs",
    packageName: "@react-aria/breadcrumbs",
    english: "Breadcrumbs",
    expected: {
      "ar-AE": "عناصر الواجهة",
      "de-DE": "Breadcrumbs",
      "ja-JP": "パンくずリスト",
      "he-IL": "שבילי ניווט",
    },
  });

  expectCatalog({
    name: "grid",
    strings: gridIntlStrings,
    messageKey: "select",
    packageName: "@react-aria/grid",
    english: "Select",
    expected: {
      "ar-AE": "تحديد",
      "de-DE": "Auswählen",
      "ja-JP": "選択",
      "he-IL": "בחר",
    },
  });

  expectCatalog({
    name: "gridlist",
    strings: gridListIntlStrings,
    messageKey: "hasActionAnnouncement",
    packageName: "@react-aria/gridlist",
    english: "Row has action",
    expected: {
      "ar-AE": "يحتوي الصف على إجراء",
      "de-DE": "Zeile hat Aktion",
      "ja-JP": "行にはアクションがあります",
      "he-IL": "בשורה יש פעולה",
    },
  });

  expectCatalog({
    name: "overlays",
    strings: overlaysIntlStrings,
    messageKey: "dismiss",
    packageName: "@react-aria/overlays",
    english: "Dismiss",
    expected: {
      "ar-AE": "تجاهل",
      "de-DE": "Schließen",
      "ja-JP": "閉じる",
      "he-IL": "התעלם",
    },
  });

  expectCatalog({
    name: "toast",
    strings: toastIntlStrings,
    messageKey: "close",
    packageName: "@react-aria/toast",
    english: "Close",
    expected: {
      "ar-AE": "إغلاق",
      "de-DE": "Schließen",
      "ja-JP": "閉じる",
      "he-IL": "סגור",
    },
  });

  expectCatalog({
    name: "tree",
    strings: treeIntlStrings,
    messageKey: "expand",
    packageName: "@react-aria/tree",
    english: "Expand",
    expected: {
      "ar-AE": "تمديد",
      "de-DE": "Erweitern",
      "ja-JP": "展開",
      "he-IL": "הרחב",
    },
  });
});
