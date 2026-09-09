/**
 * The /examples screens must be composed from the library, not from app CSS.
 *
 * The examples exist to prove one claim: @proyecto-viviana/ui can build a whole
 * product surface on its own. That claim is only worth something if the app
 * cannot quietly patch the gaps — one inline colour, one hand-authored
 * keyframe, one `border: 1px solid #333` and the screens stop being evidence
 * and start being a mock-up. So this guard reads the examples source and fails
 * on the four ways paint leaks in:
 *
 *   1. an import from anywhere but the library, the router, Solid, and the
 *      examples' own modules;
 *   2. a `style=` attribute in TSX;
 *   3. a class name that is not `ex-*` (which would reach some other
 *      stylesheet's paint);
 *   4. a declaration in `examples.css` that is not box metrics — or any
 *      `@keyframes` at all, since stepped motion is the register's job.
 *
 * A missing capability is therefore a blocker to report against the library,
 * never something to work around here.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const SOURCE_DIRS = ["apps/web/src/routes/examples", "apps/web/src/components/examples"];
const STYLESHEET = "apps/web/src/styles/examples.css";

/* Modules the screens may import from. The library is the point; the router
   and Solid are the framework the page runs on; `@/components/examples/*`,
   `@/styles/*` and `@/seo` are the examples' own surface. */
const ALLOWED_IMPORTS = [
  /^@proyecto-viviana\/ui(\/[A-Za-z0-9-]+)?$/,
  /^@tanstack\/solid-router$/,
  /^solid-js(\/[a-z]+)?$/,
  /^@\/components\/examples\//,
  /^@\/styles\//,
  /^@\/seo$/,
  /^\.{1,2}\//,
];

/* Two narrow exceptions, each pinned to the one file that owns it.
 *
 * `UNSAFE_PortalProvider` lives in `@proyecto-viviana/solidaria` and is how a
 * themed island keeps its portal overlays inside its own scope; `useTheme` in
 * `@/utils/theme` is the site's single owner of `data-color-scheme`, and the
 * alternative is a second theme mechanism, which is worse than an exception.
 * Neither is paint, and neither is reachable from a screen route: the theme
 * import is confined to `ThemeToggle`, the one control both the app chrome and
 * the landing nav render. */
const IMPORT_EXCEPTIONS = new Map<string, RegExp[]>([
  [
    "apps/web/src/components/examples/ExamplesShell.tsx",
    [/^@proyecto-viviana\/solidaria$/, /^@\/utils\/theme$/],
  ],
  ["apps/web/src/components/examples/ThemeToggle.tsx", [/^@\/utils\/theme$/]],
]);

/* Box metrics. Anything that paints — colour, border, font, shadow, filter,
   background, transition, animation — is absent on purpose. */
const ALLOWED_DECLARATIONS = [
  "display",
  "gap",
  "row-gap",
  "column-gap",
  "order",
  "padding",
  "margin",
  "width",
  "height",
  "position",
  "inset",
  "top",
  "right",
  "bottom",
  "left",
  "overflow",
  "overflow-x",
  "overflow-y",
  "z-index",
  "aspect-ratio",
  "box-sizing",
  "flex",
];
const ALLOWED_DECLARATION_PREFIXES = [
  "grid-",
  "flex-",
  "place-",
  "align-",
  "justify-",
  "min-",
  "max-",
  "padding-",
  "margin-",
  "inset-",
];

const CLASS_NAME = /^ex-[a-z0-9-]+$/;

const failures: string[] = [];

function fail(file: string, message: string): void {
  failures.push(`${file}: ${message}`);
}

async function listSourceFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await listSourceFiles(full)));
    else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) files.push(full);
  }
  return files.sort();
}

function isAllowedImport(specifier: string, file: string): boolean {
  if (ALLOWED_IMPORTS.some((pattern) => pattern.test(specifier))) return true;
  return (IMPORT_EXCEPTIONS.get(file) ?? []).some((pattern) => pattern.test(specifier));
}

for (const dir of SOURCE_DIRS) {
  for (const file of await listSourceFiles(dir)) {
    const source = await readFile(file, "utf8");

    for (const [, specifier] of source.matchAll(/from\s+["']([^"']+)["']/g)) {
      if (!isAllowedImport(specifier, file)) {
        fail(file, `imports "${specifier}", which is not on the examples allowlist.`);
      }
    }

    if (/\sstyle=\s*[{"']/.test(source)) {
      fail(file, "uses a `style=` attribute; paint belongs to the library.");
    }

    for (const [, value] of source.matchAll(/\bclass=["']([^"']+)["']/g)) {
      for (const name of value.split(/\s+/).filter(Boolean)) {
        if (!CLASS_NAME.test(name)) {
          fail(file, `uses the class "${name}"; examples classes must match ex-[a-z0-9-]+.`);
        }
      }
    }
  }
}

const stylesheet = await readFile(STYLESHEET, "utf8");
if (/@keyframes/.test(stylesheet)) {
  fail(STYLESHEET, "declares @keyframes; stepped motion is component-owned.");
}

/* Strip comments, then read every `property:` at the head of a declaration. */
const declarations = stylesheet.replace(/\/\*[\s\S]*?\*\//g, "");
for (const [, property] of declarations.matchAll(/(?:^|[;{])\s*([a-z-]+)\s*:/g)) {
  const allowed =
    ALLOWED_DECLARATIONS.includes(property) ||
    ALLOWED_DECLARATION_PREFIXES.some((prefix) => property.startsWith(prefix));
  if (!allowed) {
    fail(STYLESHEET, `declares "${property}"; examples.css is layout-only.`);
  }
}

if (failures.length > 0) {
  console.error("Examples purity check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error(
    "The examples compose from @proyecto-viviana/ui only. A missing capability is a " +
      "library gap to report, not something to patch in the app.",
  );
  process.exit(1);
}

console.log(`OK: examples are library-pure across ${SOURCE_DIRS.length} directories.`);
