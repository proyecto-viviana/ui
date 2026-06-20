import { existsSync, readFileSync } from "node:fs";
import { defineConfig } from "vite-plus";
import solid from "vite-plugin-solid";
import macros from "unplugin-parcel-macros";

const macroCssIdPattern = /^macro-[a-f0-9]+\.css$/;
const macroCssImportPattern = /import\s+["']macro-[a-f0-9]+\.css["'];\n?/g;

function getMacroCssFileName(id: string) {
  const fileName = id.split("/").pop();
  return fileName && macroCssIdPattern.test(fileName) ? fileName : null;
}

function removeMacroCssImports(code: string) {
  return code.replace(macroCssImportPattern, "");
}

function getMacroCssContent(content: unknown) {
  if (typeof content === "string") {
    return content;
  }

  if (content && typeof content === "object" && "code" in content) {
    const code = (content as { code: unknown }).code;
    return typeof code === "string" ? code : null;
  }

  return null;
}

function s2Macros() {
  const plugin = macros.rolldown();
  const macroCssCache = new Map<string, string>();

  const cacheMacroCss = (id: string, content: unknown) => {
    const fileName = getMacroCssFileName(id);
    const css = getMacroCssContent(content);
    if (fileName && css != null) {
      macroCssCache.set(fileName, css);
    }
    return css;
  };

  return {
    ...plugin,
    async transform(this: unknown, code: string, id: string) {
      const result = await plugin.transform?.call(this, code, id);
      const transformedCode =
        typeof result === "string"
          ? result
          : result && typeof result === "object" && "code" in result
            ? String(result.code)
            : "";

      for (const match of transformedCode.matchAll(/import\s+["'](macro-[a-f0-9]+\.css)["'];/g)) {
        const content = await plugin.load?.call(this, match[1]);
        cacheMacroCss(match[1], content);
      }

      return result;
    },
    async resolveId(this: unknown, id: string, importer?: string, options?: object) {
      const resolved = await plugin.resolveId?.call(this, id, importer, options);
      if (resolved) {
        return resolved;
      }
      const fileName = getMacroCssFileName(id);
      if (fileName && macroCssCache.has(fileName)) {
        return fileName;
      }
      return resolved;
    },
    loadInclude(id: string) {
      const fileName = getMacroCssFileName(id);
      return (
        (fileName != null && macroCssCache.has(fileName)) || (plugin.loadInclude?.(id) ?? false)
      );
    },
    async load(this: unknown, id: string) {
      if (plugin.loadInclude?.(id)) {
        const content = await plugin.load?.call(this, id);
        const css = cacheMacroCss(id, content);
        if (css != null) {
          return css;
        }
        return content;
      }
      const fileName = getMacroCssFileName(id);
      if (fileName) {
        return macroCssCache.get(fileName);
      }
      return null;
    },
    renderChunk(code: string) {
      return removeMacroCssImports(code);
    },
  };
}

// Curated public surface: the `.` barrel, the hand-picked PascalCase component
// aliases (each backed by a package.json subpath export), and the JSX-free style
// macro modules. Keep in sync with package.json `exports`.
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

// The style macro modules are JSX-free, so they're built only in the DOM (`.js`)
// pass and served via the `import`/`solid` `.js` conditions. A `.jsx` copy would
// only be re-compiled by every consumer's Solid plugin — and at ~1.26 MB it tripped
// the 500 KB deopt for nothing. See `./style` in package.json.
const styleEntries = ["src/style/index.ts", "src/style/runtime.ts"];

const entry = [...new Set([...subpathEntries, ...barrelTargets("src/index.ts")])];
const jsxEntry = entry.filter((e) => !styleEntries.includes(e));

const deps = {
  alwaysBundle: [/^@adobe\/spectrum-tokens(\/.*)?$/],
  neverBundle: [
    "solid-js",
    "solid-js/web",
    "solid-js/store",
    "@proyecto-viviana/solidaria-components",
  ],
  onlyBundle: [/^@adobe\/spectrum-tokens$/],
};

const css = {
  fileName: "styles.css",
  splitting: false,
  inject: false,
  minify: true,
};

const copiedCssFiles = ["components.css", "font-faces.css", "theme.css"].map((fileName) => ({
  from: `src/${fileName}`,
  to: "dist",
  flatten: true,
}));

export default defineConfig({
  pack: [
    {
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
        return { ...options, chunkFileNames: "_chunk/[name].js" };
      },
      plugins: [s2Macros(), solid({ solid: { generate: "dom", hydratable: true } })],
      deps,
      copy: copiedCssFiles,
    },
    {
      // JSX preserved (macro-expanded) -> dist/*.jsx — the `solid` export
      // condition. The consumer's compiler turns this into DOM
      // or SSR per-environment, so no separate pre-built SSR bundle is needed.
      // The style() macro still runs here (style() -> class strings), so
      // consumers don't need the macro plugin; styles.css comes from the DOM
      // build above. The JSX-free style modules are excluded (served as `.js`).
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
          entryFileNames: "[name].jsx",
          chunkFileNames: "_chunk/[name].jsx",
        };
      },
      plugins: [s2Macros()],
      deps,
    },
  ],
});
