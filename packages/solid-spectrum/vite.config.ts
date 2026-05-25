import { defineConfig } from "vite-plus";
import solid from "vite-plugin-solid";
import macros from "unplugin-parcel-macros";

const macroCssIdPattern = /^macro-[a-f0-9]+\.css$/;

function s2Macros() {
  const plugin = macros.rolldown();
  const macroCssCache = new Map<string, unknown>();

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
        if (content != null) {
          macroCssCache.set(match[1], content);
        }
      }

      return result;
    },
    async resolveId(this: unknown, id: string, importer?: string, options?: object) {
      const resolved = await plugin.resolveId?.call(this, id, importer, options);
      if (resolved) {
        return resolved;
      }
      if (macroCssIdPattern.test(id) && macroCssCache.has(id)) {
        return id;
      }
      return resolved;
    },
    loadInclude(id: string) {
      return macroCssCache.has(id) || (plugin.loadInclude?.(id) ?? false);
    },
    async load(this: unknown, id: string) {
      if (plugin.loadInclude?.(id)) {
        const content = await plugin.load?.call(this, id);
        if (content != null) {
          macroCssCache.set(id, content);
          return content;
        }
      }
      return macroCssCache.get(id);
    },
  };
}

const entry = [
  "src/index.ts",
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
  "src/RangeCalendar.ts",
  "src/Menu.ts",
  "src/Tabs.ts",
  "src/style/index.ts",
  "src/style/runtime.ts",
];

const ssrEntry = Object.fromEntries(
  entry.map((file) => {
    let name = file.replace(/^src\//, "").replace(/\.ts$/, "");
    return [`${name}.ssr`, file];
  }),
);

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
      plugins: [s2Macros(), solid({ solid: { generate: "dom", hydratable: true } })],
      deps,
      copy: [{ from: "src/*.css", to: "dist", flatten: true }],
    },
    {
      entry: ssrEntry,
      format: ["esm"],
      target: "esnext",
      platform: "node",
      outDir: "dist",
      clean: false,
      sourcemap: true,
      dts: false,
      fixedExtension: false,
      hash: false,
      outputOptions(options) {
        return {
          ...options,
          chunkFileNames: "[name].ssr.js",
        };
      },
      plugins: [s2Macros(), solid({ solid: { generate: "ssr" } })],
      deps,
    },
  ],
});
