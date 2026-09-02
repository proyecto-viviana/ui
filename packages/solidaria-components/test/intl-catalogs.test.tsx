/**
 * Failing-first RAC catalog checks: formatting under ar-AE, de-DE, ja-JP, and
 * he-IL must return the upstream string. dropzoneLabel is "DropZone" in some
 * locales including English — de-DE/ja-JP prove the loader is not stuck on en-US.
 */

import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { I18nProvider, createStringFormatter } from "@proyecto-viviana/solidaria";
import { racIntlStrings, type RacIntlStrings } from "../src/intl";

function FormatProbe(props: { messageKey: keyof RacIntlStrings }) {
  const formatter = createStringFormatter(racIntlStrings, "react-aria-components");
  return <span data-testid="formatted">{formatter().format(props.messageKey)}</span>;
}

describe("react-aria-components intl catalog", () => {
  it.each([
    ["ar-AE", "selectPlaceholder", "حدد عنصرًا", "Select an item"],
    ["de-DE", "selectPlaceholder", "Element wählen", "Select an item"],
    ["ja-JP", "selectPlaceholder", "項目を選択", "Select an item"],
    ["he-IL", "selectPlaceholder", "בחר פריט", "Select an item"],
    ["ar-AE", "tableResizer", "أداة تغيير الحجم", "Resizer"],
    ["de-DE", "tableResizer", "Größenanpassung", "Resizer"],
    ["ja-JP", "tableResizer", "サイズ変更ツール", "Resizer"],
    ["he-IL", "tableResizer", "שינוי גודל", "Resizer"],
    ["de-DE", "dropzoneLabel", "Ablegebereich", "DropZone"],
    ["ja-JP", "dropzoneLabel", "ドロップゾーン", "DropZone"],
    ["ar-AE", "colorSwatchPicker", "تغييرات الألوان", "Color swatches"],
    ["de-DE", "colorSwatchPicker", "Farbfelder", "Color swatches"],
    ["ja-JP", "colorSwatchPicker", "カラースウォッチ", "Color swatches"],
    ["he-IL", "colorSwatchPicker", "דוגמיות צבע", "Color swatches"],
  ] as const)(
    "formats %s %s from the catalog, not English fallback",
    (locale, key, expected, english) => {
      render(() => (
        <I18nProvider locale={locale}>
          <FormatProbe messageKey={key} />
        </I18nProvider>
      ));
      expect(screen.getByTestId("formatted")).toHaveTextContent(expected);
      if (expected !== english) {
        expect(screen.getByTestId("formatted")).not.toHaveTextContent(english);
      }
    },
  );
});
