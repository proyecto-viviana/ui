import path from "node:path";
import { stripVTControlCharacters } from "node:util";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import solid from "@astrojs/solid-js";
import macros from "unplugin-parcel-macros";

const oneLineWarningFilters = ["`transformWithEsbuild` is deprecated"];

const comparisonWarningFilters = [
  "[PLUGIN_TIMINGS]",
  "Some Vite plugin hook timings are larger",
  "[plugin builtin:vite-reporter]",
  "Some chunks are larger than 500 kB after minification",
];

const shouldSuppressOneLineWarning = (message) =>
  oneLineWarningFilters.some((filter) => String(message).includes(filter));

const shouldSuppressComparisonWarning = (message) =>
  comparisonWarningFilters.some((filter) => String(message).includes(filter));

const warningFilterPatch = Symbol.for("viviana-ui.comparison.warning-filter");

const patchWarningOutputStream = (stream) => {
  if (stream[warningFilterPatch]) {
    return;
  }
  stream[warningFilterPatch] = true;

  const originalWrite = stream.write.bind(stream);
  let suppressingWarningBlock = false;

  stream.write = (chunk, ...args) => {
    const text =
      typeof chunk === "string"
        ? chunk
        : chunk instanceof Uint8Array
          ? Buffer.from(chunk).toString("utf8")
          : null;

    if (text == null) {
      return originalWrite(chunk, ...args);
    }

    const segments = text.split(/(?<=\n)/);
    const keptSegments = [];
    let changed = false;

    for (const segment of segments) {
      const message = stripVTControlCharacters(segment);
      const isBlank = message.trim() === "";

      if (suppressingWarningBlock) {
        changed = true;
        if (isBlank) {
          suppressingWarningBlock = false;
        }
        continue;
      }

      if (shouldSuppressOneLineWarning(message)) {
        changed = true;
        continue;
      }

      if (shouldSuppressComparisonWarning(message)) {
        changed = true;
        suppressingWarningBlock = true;
        continue;
      }

      keptSegments.push(segment);
    }

    if (!changed) {
      return originalWrite(chunk, ...args);
    }

    const filteredText = keptSegments.join("");
    if (filteredText.length === 0) {
      const callback = args.find((arg) => typeof arg === "function");
      if (callback) {
        queueMicrotask(callback);
      }
      return true;
    }

    return originalWrite(
      typeof chunk === "string" ? filteredText : Buffer.from(filteredText),
      ...args,
    );
  };
};

const suppressKnownUpstreamWarnings = () => {
  const originalWarn = console.warn.bind(console);
  console.warn = (...args) => {
    const message = args.map(String).join(" ");
    if (shouldSuppressOneLineWarning(message)) {
      return;
    }
    originalWarn(...args);
  };

  patchWarningOutputStream(process.stdout);
  patchWarningOutputStream(process.stderr);
};

suppressKnownUpstreamWarnings();

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(appRoot, "../..");
const localSolidPackages = [
  "@proyecto-viviana/solid-stately",
  "@proyecto-viviana/solidaria",
  "@proyecto-viviana/solidaria-components",
  "@proyecto-viviana/solid-spectrum",
];

const stripViteRequestSuffix = (id) => id.split(/[?#]/, 1)[0];
const macroImportPattern = /with[\s\n]*\{\s*type:[\s\n]*["']macro["'][\s\n]*\}/;
const macroCssIdPattern = /^macro-[a-f0-9]+\.css$/;
const macroCssImportPattern = /import\s+["'](macro-[a-f0-9]+\.css)["'];/g;

const getMacroCssFileName = (id) => {
  const fileName = stripViteRequestSuffix(id).split("/").pop();
  return fileName && macroCssIdPattern.test(fileName) ? fileName : null;
};

const getMacroCssContent = (content) => {
  if (typeof content === "string") {
    return content;
  }

  if (content && typeof content === "object" && "code" in content) {
    return typeof content.code === "string" ? content.code : null;
  }

  return null;
};

const comparisonS2Macros = () => {
  const plugin = macros.raw();
  const macroCssCache = new Map();

  const cacheMacroCss = (id, content) => {
    const fileName = getMacroCssFileName(id);
    const css = getMacroCssContent(content);
    if (fileName && css != null) {
      macroCssCache.set(fileName, css);
    }
    return css;
  };

  return {
    name: `${plugin.name}-comparison`,
    enforce: plugin.enforce,
    // Astro can pass query-suffixed client script ids to Vite. The macro
    // plugin's include check expects the original .ts/.tsx path.
    async transform(code, id) {
      if (!macroImportPattern.test(code)) {
        return null;
      }

      const filePath = stripViteRequestSuffix(id);
      const result = await plugin.transform?.call(this, code, filePath);
      const transformedCode =
        typeof result === "string"
          ? result
          : result && typeof result === "object" && "code" in result
            ? String(result.code)
            : "";

      for (const match of transformedCode.matchAll(macroCssImportPattern)) {
        const content = await plugin.load?.call(this, match[1]);
        cacheMacroCss(match[1], content);
      }

      return result;
    },
    async resolveId(id, importer, options) {
      const resolved = await plugin.resolveId?.call(this, id, importer, options);
      if (resolved) {
        return resolved;
      }

      const fileName = getMacroCssFileName(id);
      if (fileName && macroCssCache.has(fileName)) {
        return fileName;
      }

      return null;
    },
    loadInclude(id) {
      const fileName = getMacroCssFileName(id);
      return (
        (fileName != null && macroCssCache.has(fileName)) ||
        (plugin.loadInclude?.(stripViteRequestSuffix(id)) ?? false)
      );
    },
    async load(id) {
      const normalizedId = stripViteRequestSuffix(id);
      if (plugin.loadInclude?.(normalizedId)) {
        const content = await plugin.load?.call(this, normalizedId);
        const css = cacheMacroCss(normalizedId, content);
        return css ?? content;
      }

      const fileName = getMacroCssFileName(id);
      return fileName ? (macroCssCache.get(fileName) ?? null) : null;
    },
    watchChange(id, change) {
      plugin.watchChange?.call(this, stripViteRequestSuffix(id), change);
    },
  };
};

export default defineConfig({
  integrations: [
    react({
      include: ["src/components/react/**/*"],
      exclude: [
        "src/components/solid/**/*",
        "../../packages/solid-stately/src/**/*",
        "../../packages/solidaria/src/**/*",
        "../../packages/solidaria-components/src/**/*",
        "../../packages/solid-spectrum/src/**/*",
      ],
    }),
    solid({
      include: ["src/components/solid/**/*"],
      exclude: ["src/components/react/**/*"],
    }),
  ],
  vite: {
    plugins: [comparisonS2Macros()],
    build: {
      assetsInlineLimit: 0,
    },
    resolve: {
      alias: [
        {
          find: "@comparison",
          replacement: path.resolve(appRoot, "src"),
        },
        {
          find: /^@proyecto-viviana\/solid-spectrum\/style$/,
          replacement: path.resolve(repoRoot, "packages/solid-spectrum/src/style/index.ts"),
        },
        {
          find: /^@proyecto-viviana\/solid-spectrum\/style\/runtime$/,
          replacement: path.resolve(repoRoot, "packages/solid-spectrum/src/style/runtime.ts"),
        },
        {
          find: /^@proyecto-viviana\/solid-stately$/,
          replacement: path.resolve(repoRoot, "packages/solid-stately/dist/index.js"),
        },
        {
          find: /^@proyecto-viviana\/solidaria$/,
          replacement: path.resolve(repoRoot, "packages/solidaria/dist/index.js"),
        },
        {
          find: /^@proyecto-viviana\/solidaria-components$/,
          replacement: path.resolve(repoRoot, "packages/solidaria-components/dist/index.js"),
        },
        {
          find: /^@proyecto-viviana\/solid-spectrum$/,
          replacement: path.resolve(repoRoot, "packages/solid-spectrum/dist/index.js"),
        },
      ],
    },
    server: {
      fs: {
        allow: [repoRoot],
      },
    },
    optimizeDeps: {
      exclude: localSolidPackages,
      include: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "react-dom/client",
        "solid-js",
        "solid-js/web",
      ],
    },
    ssr: {
      noExternal: localSolidPackages,
    },
  },
});
