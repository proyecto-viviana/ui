/**
 * The value Spectrum `ProviderRoot` writes onto `lang` and `dir` when no
 * locale prop is set: `useLocale()` with no provider.
 */
import { useLocale } from "../../src/i18n/locale";

export function DefaultLocaleProbe() {
  const locale = useLocale();
  return <div id="locale-probe" lang={locale().locale} dir={locale().direction} />;
}
