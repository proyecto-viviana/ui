/**
 * guard:s2-intl-catalog — the S2 intl catalogs shipped by solid-spectrum and
 * viviana-ui equal the pinned @react-spectrum/s2 JSON exactly.
 *
 * Oracle: `react-spectrum/packages/@react-spectrum/s2/intl/<locale>.json` in the
 * materialized upstream checkout (`node scripts/check-upstream-oracle.mjs
 * --acquire`). The published S2 package ships only ICU-compiled functions
 * (`dist/private/intl/*.mjs`), so the source JSON is the only comparable form.
 *
 * Per port: the locale set matches (no missing, no extra locale); each local
 * `src/intl/<locale>.json` equals the pinned JSON key for key; the `s2IntlStrings`
 * export serves the same dictionary. A missing key, an extra key, or a drifted
 * value fails the guard and is named. Absent oracle fails, never skips.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

type Catalog = Record<string, string>;

const ROOT = process.cwd();
const ORACLE_INTL = path.join(ROOT, "react-spectrum", "packages", "@react-spectrum", "s2", "intl");
const PORTS = [
  { name: "solid-spectrum", dir: path.join(ROOT, "packages", "solid-spectrum", "src", "intl") },
  { name: "viviana-ui", dir: path.join(ROOT, "packages", "viviana-ui", "src", "intl") },
];
const MAX_DIFFS_PER_LOCALE = 5;

if (!existsSync(ORACLE_INTL)) {
  process.stderr.write(
    `guard:s2-intl-catalog — FAIL: vendored upstream oracle not materialized ` +
      `(${path.relative(ROOT, ORACLE_INTL)} absent). Run \`node scripts/check-upstream-oracle.mjs --acquire\` to run this guard.\n`,
  );
  process.exit(1);
}

function readCatalog(file: string): Catalog {
  return JSON.parse(readFileSync(file, "utf8")) as Catalog;
}

function localesIn(dir: string): string[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => name.replace(/\.json$/, ""))
    .sort();
}

/** Key-level differences of `actual` against `expected`, at most MAX_DIFFS_PER_LOCALE. */
function diffCatalog(expected: Catalog, actual: Catalog): string[] {
  const diffs: string[] = [];
  for (const key of Object.keys(expected)) {
    if (!(key in actual)) diffs.push(`missing key ${key}`);
    else if (actual[key] !== expected[key]) {
      diffs.push(
        `${key}: ${JSON.stringify(actual[key])} ≠ pinned ${JSON.stringify(expected[key])}`,
      );
    }
  }
  for (const key of Object.keys(actual)) {
    if (!(key in expected)) diffs.push(`extra key ${key}`);
  }
  return diffs.length > MAX_DIFFS_PER_LOCALE
    ? [...diffs.slice(0, MAX_DIFFS_PER_LOCALE), `… ${diffs.length - MAX_DIFFS_PER_LOCALE} more`]
    : diffs;
}

const pinnedLocales = localesIn(ORACLE_INTL);
const pinned = new Map(
  pinnedLocales.map((locale) => [locale, readCatalog(path.join(ORACLE_INTL, `${locale}.json`))]),
);

const failures: string[] = [];
let checkedLocales = 0;

for (const port of PORTS) {
  const localLocales = localesIn(port.dir);
  const missing = pinnedLocales.filter((locale) => !localLocales.includes(locale));
  const extra = localLocales.filter((locale) => !pinnedLocales.includes(locale));
  if (missing.length > 0)
    failures.push(`${port.name}: locales missing from src/intl: ${missing.join(", ")}`);
  if (extra.length > 0)
    failures.push(`${port.name}: locales not in the pinned S2 catalog: ${extra.join(", ")}`);

  const mod = (await import(pathToFileURL(path.join(port.dir, "index.ts")).href)) as {
    s2IntlStrings?: Record<string, Catalog>;
  };
  const shipped = mod.s2IntlStrings;
  if (!shipped) {
    failures.push(`${port.name}: src/intl/index.ts does not export s2IntlStrings`);
    continue;
  }
  const shippedLocales = Object.keys(shipped).sort();
  if (shippedLocales.join(",") !== pinnedLocales.join(",")) {
    failures.push(
      `${port.name}: s2IntlStrings exports [${shippedLocales.join(", ")}]; pinned catalog has [${pinnedLocales.join(", ")}]`,
    );
  }

  for (const locale of pinnedLocales) {
    const expected = pinned.get(locale)!;
    if (localLocales.includes(locale)) {
      const localDiffs = diffCatalog(expected, readCatalog(path.join(port.dir, `${locale}.json`)));
      for (const diff of localDiffs) failures.push(`${port.name} src/intl/${locale}.json: ${diff}`);
    }
    if (shipped[locale]) {
      const shippedDiffs = diffCatalog(expected, shipped[locale]);
      for (const diff of shippedDiffs)
        failures.push(`${port.name} s2IntlStrings["${locale}"]: ${diff}`);
    }
    checkedLocales += 1;
  }
}

if (failures.length > 0) {
  process.stderr.write(
    "guard:s2-intl-catalog — FAIL: shipped S2 catalogs drift from the pinned JSON:\n",
  );
  for (const failure of failures) process.stderr.write(`- ${failure}\n`);
  process.exit(1);
}

process.stdout.write(
  `guard:s2-intl-catalog — PASS: ${pinnedLocales.length} pinned locales × ${PORTS.length} ports ` +
    `(${checkedLocales} catalogs, JSON and s2IntlStrings) equal the pinned S2 catalog.\n`,
);
