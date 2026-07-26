/**
 * Extracts the public prop surface of each published register straight from the
 * TypeScript type checker, and writes one committed data file per register.
 *
 * Why generate rather than hand-write: the hand-authored tables under
 * `apps/web/src/routes/solid-spectrum/docs/components/` already print variant
 * lists that no longer exist in source (`button.tsx` still advertises
 * `'premium' | 'genai'` for a register that dropped them). A table nobody can
 * verify rots silently. This walks the barrel, so the docs cannot claim a prop
 * the package does not export.
 *
 * The one design decision worth explaining is the member filter. Asking the
 * checker for a component's apparent type returns everything it structurally
 * has, which for anything extending `JSX.HTMLAttributes<T>` means ~540 members
 * — the entire DOM event surface. Across the viviana-ui barrel that is 40,966
 * members, of which only 24% carry any doc comment. Filtering instead by *where
 * each member was declared* — keep what our own workspace packages declare,
 * drop what `solid-js`'s JSX namespace does — leaves 3,367 members at 87.7%
 * documented, with no per-component exclusion list to maintain. `BadgeProps`
 * goes from 456 members to the 12 it actually declares.
 *
 * Run: `vp run api:extract` (writes) or `vp run guard:api-reference` (verifies).
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import * as path from "node:path";
import ts from "typescript";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");

/** The registers we publish reference docs for, in site order. */
export const REGISTERS = [
  { id: "viviana-ui", packageName: "@proyecto-viviana/ui", dir: "packages/viviana-ui" },
  {
    id: "solid-spectrum",
    packageName: "@proyecto-viviana/solid-spectrum",
    dir: "packages/solid-spectrum",
  },
] as const;

export const OUTPUT_DIR = "apps/web/src/data/api-reference";

/**
 * One file per page, not one per register.
 *
 * The first cut wrote both registers as two whole-package JSON files. They came
 * to 1.8 MB, Vite folded them into a single chunk because the layout imports
 * the page list, and every reference page then paid 136 kB gzipped to render
 * one table. Splitting per page means a route pulls only its own component.
 */
export const PAGES_DIR = `${OUTPUT_DIR}/pages`;

export interface ApiProp {
  name: string;
  /** Rendered type, with `| undefined` stripped — optionality is its own field. */
  type: string;
  /** Present when the type is a closed union of literals, so pages can list them. */
  values?: string[];
  required: boolean;
  default?: string;
  description: string;
  /** Workspace package that declares this member — `solidaria` props are inherited. */
  origin: string;
}

export interface ApiEntry {
  /** Exported interface name, e.g. `ButtonProps`. */
  name: string;
  /** Component name the interface documents, e.g. `Button`. */
  component: string;
  /** Repo-relative declaration site. */
  source: string;
  props: ApiProp[];
}

export interface ApiPage {
  slug: string;
  title: string;
  /** Interface names shown on this page, the page's own component first. */
  entries: string[];
}

export interface ApiRegister {
  id: string;
  packageName: string;
  /** Every value export of the barrel, so the guard can spot undocumented ones. */
  exports: string[];
  entries: ApiEntry[];
  pages: ApiPage[];
}

/**
 * A page per source directory, because that is how the package authors already
 * grouped the work — `src/menu/` holds Menu, MenuItem, MenuSection and
 * MenuTrigger, and those belong on one page.
 *
 * `OWN_PAGE` promotes the components that share a directory with a bigger
 * sibling but are separate components in their own right: DatePicker is not a
 * footnote to Calendar, and UserCard is not a footnote to Card. The list is
 * deliberately the only hand-maintained input here, and it fails safe — a
 * component nobody promoted still gets documented, just on its neighbour's
 * page rather than its own.
 */
const OWN_PAGE = new Set([
  "ActionButton",
  "ActionMenu",
  "AlertDialog",
  "AssetCard",
  "ColorArea",
  "ColorEditor",
  "ColorField",
  "ColorSlider",
  "ColorSwatch",
  "ColorSwatchPicker",
  "ColorWheel",
  "DateField",
  "DatePicker",
  "DateRangePicker",
  "LinkButton",
  "ProductCard",
  "RangeCalendar",
  "RangeSlider",
  "TimeField",
  "ToggleButton",
  "UserCard",
]);

/** Interfaces that describe render-prop payloads or context values, not props. */
const NOT_A_COMPONENT = /(?:RenderProps|ContextValue|StateProps|HookProps)$/;

function buildPages(entries: ApiEntry[]): ApiPage[] {
  const groups = new Map<string, ApiEntry[]>();
  for (const entry of entries) {
    const segments = entry.source.split("/");
    // packages/<pkg>/src/<dir>/<file> — flat modules fall back to their basename.
    const directory =
      segments.length > 4 ? segments[3] : segments[segments.length - 1].replace(/\.tsx?$/, "");
    // A promoted component takes its sub-parts with it, but only from its own
    // directory — `ColorSwatchPickerItem` follows `ColorSwatchPicker` out of
    // `src/color/`, while `ActionButtonGroup` keeps its own directory's page.
    const promoted = [...OWN_PAGE]
      .filter(
        (name) =>
          entry.component.startsWith(name) &&
          entries.some(
            (other) =>
              other.component === name &&
              other.source.startsWith(`packages/`) &&
              other.source.split("/")[3] === directory,
          ),
      )
      .sort((a, b) => b.length - a.length)[0];
    const slug = (
      promoted ?? (OWN_PAGE.has(entry.component) ? entry.component : directory)
    ).toLowerCase();
    const group = groups.get(slug);
    if (group) group.push(entry);
    else groups.set(slug, [entry]);
  }

  const pages: ApiPage[] = [];
  for (const [slug, group] of groups) {
    // The page's own component: an exact slug match when there is one, else the
    // shortest real component name — `Menu` over `MenuTrigger`.
    const candidates = group.filter((entry) => !NOT_A_COMPONENT.test(entry.name));
    const bare = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
    const ranked = (candidates.length > 0 ? candidates : group).slice().sort((a, b) => {
      const aExact = bare(a.component) === bare(slug) ? 0 : 1;
      const bExact = bare(b.component) === bare(slug) ? 0 : 1;
      return aExact - bExact || a.component.length - b.component.length;
    });
    const primary = ranked[0];
    const rest = group
      .filter((entry) => entry !== primary)
      .sort((a, b) => a.component.localeCompare(b.component));
    pages.push({
      slug,
      title: primary.component,
      entries: [primary.name, ...rest.map((entry) => entry.name)],
    });
  }

  return pages.sort((a, b) => a.slug.localeCompare(b.slug));
}

/**
 * A member counts as public API we own when the file that declares it lives in
 * this workspace's `packages/`. Everything else is ambient DOM plumbing that
 * arrives through `extends JSX.HTMLAttributes<T>` and belongs in one sentence
 * of prose, not in 500 table rows.
 */
function declaringPackage(symbol: ts.Symbol): string | undefined {
  const file = symbol.declarations?.[0]?.getSourceFile().fileName;
  if (!file || file.includes("/node_modules/")) return undefined;
  const [, tail] = file.split(`${path.sep}packages${path.sep}`);
  return tail?.split(path.sep)[0];
}

/** Optional props type as `T | undefined`; the table shows `T` and a flag. */
function stripUndefined(type: ts.Type, checker: ts.TypeChecker): ts.Type {
  return type.isUnion() ? checker.getNonNullableType(type) : type;
}

/** Closed literal unions are the useful part of a variant prop — list them. */
function literalValues(type: ts.Type): string[] | undefined {
  if (!type.isUnion()) return undefined;
  const values: string[] = [];
  for (const part of type.types) {
    if (part.isStringLiteral()) values.push(`'${part.value}'`);
    else if (part.isNumberLiteral()) values.push(String(part.value));
    else if (part.flags & ts.TypeFlags.BooleanLiteral) values.push(checkerBoolean(part));
    else return undefined;
  }
  return values.length > 1 ? values : undefined;
}

function checkerBoolean(type: ts.Type): string {
  return (type as ts.IntrinsicType).intrinsicName === "true" ? "true" : "false";
}

function extractRegister(register: (typeof REGISTERS)[number]): ApiRegister {
  const packageDir = path.join(REPO_ROOT, register.dir);
  const configPath = ts.findConfigFile(packageDir, ts.sys.fileExists, "tsconfig.json");
  if (!configPath) throw new Error(`No tsconfig.json under ${register.dir}`);
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath));
  const program = ts.createProgram({
    rootNames: parsed.fileNames,
    options: parsed.options,
  });
  const checker = program.getTypeChecker();

  const barrelPath = path.join(packageDir, "src/index.ts");
  const barrel = program.getSourceFile(barrelPath);
  if (!barrel) throw new Error(`Barrel not in program: ${register.dir}/src/index.ts`);
  const barrelSymbol = checker.getSymbolAtLocation(barrel);
  if (!barrelSymbol) throw new Error(`Barrel has no module symbol: ${register.dir}`);

  const moduleExports = checker.getExportsOfModule(barrelSymbol);
  const valueExports: string[] = [];
  const entries: ApiEntry[] = [];

  for (const exported of moduleExports) {
    const name = exported.getName();
    const resolved =
      exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    if (resolved.flags & ts.SymbolFlags.Value) valueExports.push(name);
    if (!name.endsWith("Props")) continue;

    const declaration = resolved.declarations?.[0];
    if (!declaration) continue;
    let declared: ts.Type;
    try {
      declared = checker.getDeclaredTypeOfSymbol(resolved);
    } catch {
      continue;
    }

    const props: ApiProp[] = [];
    for (const member of checker.getApparentType(declared).getProperties()) {
      const origin = declaringPackage(member);
      if (!origin) continue;
      const site = member.declarations?.[0];
      if (!site) continue;

      const memberType = checker.getTypeOfSymbolAtLocation(member, site);
      const required = !(member.flags & ts.SymbolFlags.Optional);
      const display = required ? memberType : stripUndefined(memberType, checker);
      const defaultTag = member.getJsDocTags().find((tag) => tag.name === "default");

      props.push({
        name: member.getName(),
        type: checker.typeToString(display, site, ts.TypeFormatFlags.NoTruncation),
        ...(literalValues(display) ? { values: literalValues(display) } : {}),
        required,
        ...(defaultTag ? { default: ts.displayPartsToString(defaultTag.text).trim() } : {}),
        description: ts
          .displayPartsToString(member.getDocumentationComment(checker))
          .replace(/\s+/g, " ")
          .trim(),
        origin,
      });
    }

    // Icon and illustration wrappers declare nothing of their own — they are
    // pure SVG passthroughs. A table with no rows is noise, not documentation.
    if (props.length === 0) continue;

    entries.push({
      name,
      component: name.replace(/Props$/, ""),
      source: path
        .relative(REPO_ROOT, declaration.getSourceFile().fileName)
        .split(path.sep)
        .join("/"),
      props,
    });
  }

  entries.sort((a, b) => a.name.localeCompare(b.name));
  return {
    id: register.id,
    packageName: register.packageName,
    exports: valueExports.sort((a, b) => a.localeCompare(b)),
    entries,
    pages: buildPages(entries),
  };
}

/** A prop that differs between the registers, or exists in only one of them. */
export interface PropDivergence {
  prop: string;
  kind: "only-here" | "only-there" | "values";
  /** Literal values this register has and the other does not. */
  here?: string[];
  /** Literal values the other register has and this one does not. */
  there?: string[];
}

/** The payload a single reference page loads — nothing else. */
export interface ApiPageData {
  slug: string;
  title: string;
  packageName: string;
  /** Name of the register documented against, for the divergence callout. */
  comparedWith: string;
  entries: ApiEntry[];
  /** Keyed by interface name; absent keys have no divergence. */
  divergence: Record<string, PropDivergence[]>;
}

/**
 * What this register's component does that the other one's does not.
 *
 * Computed here rather than in the page, so a reference page never loads the
 * other register's data to render a three-line callout. Worth having at all
 * because the two registers share component names and shapes often enough that
 * a reader assumes they are the same component: `Button` has `create`,
 * `warning` and `success` here and `premium` and `genai` there, so one shared
 * table would print a lie for whichever package you actually installed.
 */
function diffEntry(here: ApiEntry, there: ApiEntry | undefined): PropDivergence[] {
  if (!there) return [];
  const differences: PropDivergence[] = [];
  for (const prop of here.props) {
    const match = there.props.find((candidate) => candidate.name === prop.name);
    if (!match) {
      differences.push({ prop: prop.name, kind: "only-here" });
    } else if (prop.values && match.values) {
      const gained = prop.values.filter((value) => !match.values!.includes(value));
      const lost = match.values.filter((value) => !prop.values!.includes(value));
      if (gained.length > 0 || lost.length > 0) {
        differences.push({ prop: prop.name, kind: "values", here: gained, there: lost });
      }
    }
  }
  for (const prop of there.props) {
    if (!here.props.some((candidate) => candidate.name === prop.name)) {
      differences.push({ prop: prop.name, kind: "only-there" });
    }
  }
  return differences;
}

export function buildPageData(
  register: ApiRegister,
  page: ApiPage,
  other: ApiRegister,
): ApiPageData {
  const entries = page.entries
    .map((name) => register.entries.find((entry) => entry.name === name))
    .filter((entry): entry is ApiEntry => entry !== undefined);

  const divergence: Record<string, PropDivergence[]> = {};
  for (const entry of entries) {
    const differences = diffEntry(
      entry,
      other.entries.find((candidate) => candidate.name === entry.name),
    );
    if (differences.length > 0) divergence[entry.name] = differences;
  }

  return {
    slug: page.slug,
    title: page.title,
    packageName: register.packageName,
    comparedWith: other.packageName,
    entries,
    divergence,
  };
}

export function serialize(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

/** Where the flagship register's reference pages live. */
export const ROUTES_DIR = "apps/web/src/routes/docs/components";
const ROUTES_BASE_PATH = "/docs/components";

/**
 * One route file per page.
 *
 * A single `$slug` route would be a quarter of the code, but the site's SEO,
 * sitemap and route-sweep gates all enumerate `routeTree.gen.ts` — a dynamic
 * segment would give 82 components one shared entry, one shared title and no
 * sitemap presence. These files are deliberately thin: everything real is in
 * the JSON beside them.
 *
 * The `props` suffix on the title is not decoration. Both registers ship an
 * Accordion, so `/docs/components/accordion` and
 * `/solid-spectrum/docs/components/accordion` would otherwise carry the same
 * `<title>` and compete for the same query — `test:seo` fails on exactly that.
 * The `<h1>` stays the bare component name; only the head is qualified.
 */
export function routeFile(page: ApiPageData): string {
  const propCount = page.entries.reduce((sum, entry) => sum + entry.props.length, 0);
  const title = `${page.title} props`;
  const description = `Every prop ${page.title} accepts in ${page.packageName} — ${propCount} documented from the package's own types.`;
  return `// Generated by \`vp run api:extract\`. Do not edit; change the package's types instead.
import { createFileRoute } from "@tanstack/solid-router";
import { ApiReference } from "@/components/docs";
import page from "@/data/api-reference/pages/${page.slug}.json";
import { seo } from "@/seo";

export const Route = createFileRoute("${ROUTES_BASE_PATH}/${page.slug}")({
  head: () =>
    seo({
      title: "${title}",
      description:
        ${JSON.stringify(description)},
      path: "${ROUTES_BASE_PATH}/${page.slug}",
    }),
  component: () => <ApiReference page={page} />,
});
`;
}

/**
 * The flagship register is the one with generated routes; solid-spectrum keeps
 * its hand-authored docs tree, which carries live examples this cannot. It is
 * still extracted, because the divergence callouts are computed against it.
 */
const ROUTED_REGISTER = "viviana-ui";

export function extractAll(): ApiRegister[] {
  return REGISTERS.map(extractRegister);
}

/** Everything this command owns: path relative to the repo root → contents. */
export function buildOutputs(): Map<string, string> {
  const registers = extractAll();
  const routed = registers.find((register) => register.id === ROUTED_REGISTER);
  const other = registers.find((register) => register.id !== ROUTED_REGISTER);
  if (!routed || !other) throw new Error("Both registers must extract");

  const outputs = new Map<string, string>();
  for (const page of routed.pages) {
    const data = buildPageData(routed, page, other);
    outputs.set(`${PAGES_DIR}/${page.slug}.json`, serialize(data));
    outputs.set(`${ROUTES_DIR}/${page.slug}.tsx`, routeFile(data));
  }

  // The sidebar and index need titles and slugs, and nothing else — keeping
  // this separate is what stops the layout from pulling in every prop table.
  outputs.set(
    `${OUTPUT_DIR}/pages.json`,
    serialize({
      packageName: routed.packageName,
      pages: routed.pages.map((page) => ({ slug: page.slug, title: page.title })),
      propCount: routed.entries.reduce((sum, entry) => sum + entry.props.length, 0),
    }),
  );

  // Barrel exports for both registers. Nothing imports this — it exists so the
  // guard can report which exported components have no reference page yet.
  outputs.set(
    `${OUTPUT_DIR}/exports.json`,
    serialize(
      Object.fromEntries(
        registers.map((register) => [
          register.id,
          { packageName: register.packageName, exports: register.exports },
        ]),
      ),
    ),
  );

  return outputs;
}

/** `--check` compares against what is committed instead of overwriting it. */
if (import.meta.filename === process.argv[1]) {
  const checkOnly = process.argv.includes("--check");
  for (const dir of [OUTPUT_DIR, PAGES_DIR, ROUTES_DIR]) {
    mkdirSync(path.join(REPO_ROOT, dir), { recursive: true });
  }

  let drifted = false;
  const report = (message: string) => {
    drifted = true;
    console.error(message);
  };

  const outputs = buildOutputs();
  for (const [relative, contents] of outputs) {
    const target = path.join(REPO_ROOT, relative);
    if (!checkOnly) {
      writeFileSync(target, contents);
      continue;
    }
    let current: string | undefined;
    try {
      current = readFileSync(target, "utf8");
    } catch {
      current = undefined;
    }
    if (current === contents) continue;
    report(
      current === undefined
        ? `MISSING ${relative} — run \`vp run api:extract\`.`
        : `DRIFT ${relative} no longer matches source — run \`vp run api:extract\`.`,
    );
  }

  // A component dropped from the package must not leave its page behind, or the
  // site keeps documenting an export that no longer exists.
  for (const dir of [PAGES_DIR, ROUTES_DIR]) {
    for (const name of readdirSync(path.join(REPO_ROOT, dir))) {
      const relative = `${dir}/${name}`;
      if (outputs.has(relative)) continue;
      if (checkOnly) report(`STALE ${relative} has no matching export.`);
      else rmSync(path.join(REPO_ROOT, relative));
    }
  }

  const pageCount = [...outputs.keys()].filter((key) => key.startsWith(`${PAGES_DIR}/`)).length;
  console.log(`${checkOnly ? "checked" : "wrote"} ${pageCount} reference pages`);
  if (drifted) process.exit(1);
}
