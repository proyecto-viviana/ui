import { existsSync, readFileSync } from "node:fs";
import { defineConfig } from "vite-plus";
import solid from "vite-plugin-solid";
import { packageAttributionBanner } from "../../scripts/package-attribution-banner.mjs";
import {
  packageMacros,
  selectPackPasses,
  sourceMapWarningGuard,
} from "../../scripts/package-macro-plugin.mjs";

// Viviana UI is a reskinned FORK of @proyecto-viviana/solid-spectrum: the styled
// top layer is duplicated (src/) and its S2 theme remapped to the Glasselated
// register (translucent --surface-* surfaces + backdrop blur), while the shared
// headless stack (solid-stately -> solidaria -> solidaria-components) is reused
// untouched. This build mirrors solid-spectrum's own vite.config so the style()
// macro bakes viviana's forked theme values into the atomic base (dist/styles.css)
// at build time — a re-export could never reskin, since the macro bakes at build.

// Curated public surface: the `.` barrel, the hand-picked PascalCase component
// aliases (each backed by a package.json subpath export), the JSX-free style
// macro modules, and the viviana-only `src/vite.ts` macro preset. Keep in sync
// with package.json `exports`.
const subpathEntries = [
  "src/index.ts",
  "src/ActionButton.ts",
  "src/Button.ts",
  "src/CenterBaseline.ts",
  "src/ContrastIcon.ts",
  "src/FileTrigger.ts",
  "src/LightenIcon.ts",
  "src/LinkButton.ts",
  "src/Picker.ts",
  "src/Provider.ts",
  "src/SearchField.ts",
  "src/SegmentedControl.ts",
  "src/Switch.ts",
  "src/TextArea.ts",
  "src/TextField.ts",
  "src/ActionMenu.ts",
  "src/Breadcrumbs.ts",
  "src/Calendar.ts",
  "src/ColorArea.ts",
  "src/ColorField.ts",
  "src/ColorSlider.ts",
  "src/ColorSwatch.ts",
  "src/ColorSwatchPicker.ts",
  "src/ColorWheel.ts",
  "src/disclosure-export.ts",
  "src/Card.ts",
  "src/CardView.ts",
  "src/ListView.ts",
  "src/TreeView.ts",
  "src/RangeCalendar.ts",
  "src/Menu.ts",
  "src/Tabs.ts",
  "src/GitHubIcon.ts",
  "src/style/index.ts",
  "src/style/runtime.ts",
  "src/vite.ts",
];

// Every module the `.` barrel re-exports from, promoted to its own build entry so
// `dist/index.jsx` stays a thin re-export barrel instead of inlining the whole
// library — a bundled barrel runs past Solid's 500 KB compiler deopt threshold for
// any consumer that touches it. Derived from the barrel's own `from "./…"`
// specifiers so the entry set can't drift out of sync.
//
// vite preserves each entry's path relative to `src`, so `src/provider/index.tsx`
// emits `dist/provider/index.jsx` right next to the `dist/provider/index.d.ts` that
// `tsc -p tsconfig.build.json` emits — never a flat `dist/provider.jsx` sibling,
// which would shadow the type directory when TypeScript resolves the barrel's
// `export … from "./provider"` and collapse every re-exported type to `{}`.
// Barrel targets deliberately left inlined rather than promoted to their own
// entry. `src/icon/index.tsx` re-exports `* as s2wfIcons` — the full 410-icon set
// — which the public barrel never re-exports. Promoting it to an entry would root
// that namespace and defeat tree-shaking (a 631 KB chunk over the deopt limit);
// inlining its used surface into the barrel lets the unused namespace drop. The
// individual `./icon/s2wf-icons/<Name>` icons stay their own (tiny) entries.
const inlineIntoBarrel = new Set(["src/icon/index.tsx"]);

function barrelTargets(barrelPath: string): string[] {
  const source = readFileSync(barrelPath, "utf8");
  const targets = new Set<string>();
  for (const match of source.matchAll(/from\s+"(\.\/[^"]+)"/g)) {
    const base = `src/${match[1].slice(2)}`;
    const file = [`${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`].find(
      existsSync,
    );
    if (file && !inlineIntoBarrel.has(file)) targets.add(file);
  }
  return [...targets];
}

// The JSX-free modules — the style macro modules and the `src/vite.ts` macro
// preset — are built only in the DOM (`.js`) pass and served via the
// `import`/`solid` `.js` conditions. A `.jsx` copy would only be re-compiled by
// every consumer's Solid plugin for nothing.
const styleEntries = ["src/style/index.ts", "src/style/runtime.ts", "src/vite.ts"];

const entry = [...new Set([...subpathEntries, ...barrelTargets("src/index.ts")])];
const jsxEntry = entry.filter((e) => !styleEntries.includes(e));

const deps = {
  alwaysBundle: [/^@adobe\/spectrum-tokens(\/.*)?$/],
  neverBundle: [
    "solid-js",
    "solid-js/web",
    "solid-js/store",
    /^@proyecto-viviana\/solidaria-components(\/.*)?$/,
    // src/vite.ts imports unplugin-parcel-macros; it's an (optional) peer that
    // must stay external so dist/vite.js uses the app's installed instance (the
    // macro runs at the app's build, not ours).
    "unplugin-parcel-macros",
  ],
  onlyBundle: false,
};

const css = {
  fileName: "styles.css",
  splitting: false,
  inject: false,
  minify: true,
};

const copiedCssFiles = ["components.css", "font-faces.css", "theme.css", "viviana-tokens.css"].map(
  (fileName) => ({
    from: `src/${fileName}`,
    to: "dist",
    flatten: true,
  }),
);

// The two passes run one process each (`PACK_PASS=dom` then `PACK_PASS=jsx` in
// the build script) — see selectPackPasses. The DOM pass cleans `dist`; the JSX
// pass adds to it, so the order is fixed.
export default defineConfig({
  pack: selectPackPasses({
    dom: {
      entry,
      format: ["esm"],
      target: "esnext",
      platform: "browser",
      outDir: "dist",
      clean: true,
      sourcemap: true,
      dts: false,
      fixedExtension: false,
      hash: false,
      css,
      // Shared chunks routed to a reserved subdir so a `dist/<name>.js` chunk can
      // never collide with a per-module output directory.
      outputOptions(options) {
        return {
          ...options,
          banner: packageAttributionBanner,
          chunkFileNames: "_chunk/[name].js",
        };
      },
      plugins: [
        sourceMapWarningGuard(),
        packageMacros(),
        solid({ solid: { generate: "dom", hydratable: true } }),
      ],
      deps,
      copy: copiedCssFiles,
    },
    jsx: {
      // JSX preserved (macro-expanded) -> dist/*.jsx — the `solid` export
      // condition. The consumer's compiler turns this into DOM
      // or SSR per-environment, so no separate pre-built SSR bundle is needed.
      // The style() macro still runs here (style() -> class strings), so
      // consumers don't need the macro plugin; styles.css comes from the DOM
      // build above. The JSX-free modules are excluded (served as `.js`).
      entry: jsxEntry,
      format: ["esm"],
      target: "esnext",
      platform: "browser",
      outDir: "dist",
      clean: false,
      sourcemap: true,
      dts: false,
      fixedExtension: false,
      hash: false,
      inputOptions(options) {
        options.transform = { ...(options.transform || {}), jsx: "preserve" };
        return options;
      },
      outputOptions(options) {
        return {
          ...options,
          banner: packageAttributionBanner,
          entryFileNames: "[name].jsx",
          chunkFileNames: "_chunk/[name].jsx",
        };
      },
      plugins: [sourceMapWarningGuard(), packageMacros({ stripCssImports: true })],
      deps,
    },
  }),
});
