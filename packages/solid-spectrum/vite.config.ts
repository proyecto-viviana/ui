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

const entry = [
  "src/index.ts",
  "src/ActionButton.ts",
  "src/Button.ts",
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
  "src/CalendarCard.ts",
  "src/Chip.ts",
  "src/Conversation.ts",
  "src/EventCard.ts",
  "src/GitHubIcon.ts",
  "src/Logo.ts",
  "src/PageLayout.ts",
  "src/ProfileCard.ts",
  "src/ProjectCard.ts",
  "src/TimelineItem.ts",
  "src/style/index.ts",
  "src/style/runtime.ts",
];

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
      // build above.
      entry,
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
          chunkFileNames: "[name].jsx",
        };
      },
      plugins: [s2Macros()],
      deps,
    },
  ],
});
