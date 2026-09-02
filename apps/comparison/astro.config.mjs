import path from "node:path";
import { stripVTControlCharacters } from "node:util";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import { getContainerRenderer } from "@astrojs/react/container-renderer";
import solid from "@astrojs/solid-js";
import reactVitePlugin from "@vitejs/plugin-react";
import macros from "unplugin-parcel-macros";

const oneLineWarningFilters = [
  "`transformWithEsbuild` is deprecated",
  '`optimizeDeps.esbuildOptions` option was specified by "astro:dev-toolbar" plugin',
  "You or a plugin you are using have set `optimizeDeps.esbuildOptions`",
  "`resolve.alias` contains an alias with `customResolver` option",
];

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
  "@proyecto-viviana/kumo",
  "@proyecto-viviana/solid-spectrum",
];
const reactNoExternalPackages = ["@mui/material", "@mui/base", "@babel/runtime", "use-immer"];

const stripViteRequestSuffix = (id) => id.split(/[?#]/, 1)[0];
const macroImportPattern = /with[\s\n]*\{\s*type:[\s\n]*["']macro["'][\s\n]*\}/;
const macroCssIdPattern = /^macro-[a-f0-9]+\.css$/;
const macroCssImportPattern = /import\s+["'](macro-[a-f0-9]+\.css)["'];/g;

const getMacroCssFileName = (id) => {
  const fileName = stripViteRequestSuffix(id).split("/").pop();
  return fileName && macroCssIdPattern.test(fileName) ? fileName : null;
};

const comparisonReactOptionsPlugin = ({
  experimentalReactChildren = false,
  experimentalDisableStreaming = false,
}) => {
  const virtualModule = "astro:react:opts";
  const virtualModuleId = `\0${virtualModule}`;

  return {
    name: "@astrojs/react:opts",
    resolveId(id) {
      return id === virtualModule ? virtualModuleId : undefined;
    },
    load(id) {
      if (id !== virtualModuleId) {
        return undefined;
      }

      return {
        code: `export default {
  experimentalReactChildren: ${JSON.stringify(experimentalReactChildren)},
  experimentalDisableStreaming: ${JSON.stringify(experimentalDisableStreaming)}
}`,
      };
    },
  };
};

const isObject = (value) => value != null && typeof value === "object" && !Array.isArray(value);

const normalizeReactBabelConfigForVitePlus = (config, options) => {
  if (!isObject(config)) {
    return config;
  }

  const { esbuild, optimizeDeps, oxc, ...rest } = config;
  const normalizedConfig = { ...rest };

  if (isObject(esbuild)) {
    normalizedConfig.oxc = {
      ...(isObject(oxc) ? oxc : {}),
      jsx: {
        ...(isObject(oxc?.jsx) ? oxc.jsx : {}),
        runtime: options.jsxRuntime ?? "automatic",
        ...(options.jsxImportSource ? { importSource: options.jsxImportSource } : {}),
      },
    };
  } else if (oxc !== undefined) {
    normalizedConfig.oxc = oxc;
  }

  if (isObject(optimizeDeps)) {
    const { esbuildOptions, rollupOptions, ...normalizedOptimizeDeps } = optimizeDeps;
    if (Object.keys(normalizedOptimizeDeps).length > 0) {
      normalizedConfig.optimizeDeps = normalizedOptimizeDeps;
    }
  }

  return normalizedConfig;
};

const patchReactVitePluginForVitePlus = (plugin, options) => {
  if (plugin.name !== "vite:react-babel" || typeof plugin.config !== "function") {
    return plugin;
  }

  return {
    ...plugin,
    async config(...args) {
      const config = await plugin.config.apply(this, args);
      return normalizeReactBabelConfigForVitePlus(config, options);
    },
  };
};

const getComparisonReactVitePlugins = (options) => {
  const plugins = reactVitePlugin({
    ...options,
    disableOxcRecommendation: true,
  });

  return (Array.isArray(plugins) ? plugins : [plugins]).map((plugin) =>
    patchReactVitePluginForVitePlus(plugin, options),
  );
};

const comparisonReact = ({
  include,
  exclude,
  babel,
  experimentalReactChildren,
  experimentalDisableStreaming,
} = {}) => ({
  name: "@astrojs/react",
  hooks: {
    "astro:config:setup": ({ command, addRenderer, updateConfig, injectScript }) => {
      const renderer = getContainerRenderer();
      const reactPluginOptions = { include, exclude, babel };

      addRenderer(renderer);
      updateConfig({
        vite: {
          optimizeDeps: {
            include: [renderer.clientEntrypoint],
            exclude: [renderer.serverEntrypoint],
          },
          plugins: [
            ...getComparisonReactVitePlugins(reactPluginOptions),
            comparisonReactOptionsPlugin({
              experimentalReactChildren: Boolean(experimentalReactChildren),
              experimentalDisableStreaming: Boolean(experimentalDisableStreaming),
            }),
          ],
          ssr: {
            noExternal: reactNoExternalPackages,
          },
        },
      });

      if (command === "dev") {
        const preamble = reactVitePlugin.preambleCode.replace("__BASE__", "/");
        injectScript("before-hydration", preamble);
      }
    },
    "astro:config:done": ({ logger, config }) => {
      const jsxRendererNames = ["@astrojs/react", "@astrojs/preact", "@astrojs/solid-js"];
      const enabledJsxRenderers = config.integrations.filter((renderer) =>
        jsxRendererNames.includes(renderer.name),
      );

      if (enabledJsxRenderers.length > 1 && !include && !exclude) {
        logger.warn(
          "More than one JSX renderer is enabled. Set the `include` or `exclude` option to avoid unexpected behavior.",
        );
      }
    },
  },
});

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
      // The native macro transform only supports JS/TS extensions; invoking it
      // for any other module (e.g. an .astro docs page that merely *quotes* a
      // `with { type: 'macro' }` import inside a code sample) passes an
      // undefined Type to the napi binding and crashes the build. Mirror the
      // underlying plugin's own transformInclude gate before delegating.
      if (!(plugin.transformInclude?.call(this, filePath) ?? true)) {
        return null;
      }

      const result = await plugin.transform?.call(this, code, filePath);
      const transformedCode =
        typeof result === "string"
          ? result
          : result && typeof result === "object" && "code" in result
            ? String(result.code)
            : "";

      for (const match of transformedCode.matchAll(macroCssImportPattern)) {
        try {
          const content = await plugin.load?.call(this, match[1]);
          cacheMacroCss(match[1], content);
        } catch {
          // Asset already evicted by a competing build pass; if we cached it on
          // a prior transform it will still resolve at `load` time.
        }
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
      const fileName = getMacroCssFileName(id);

      // Serve macro CSS from our own cache FIRST. It is populated during
      // `transform` (right after the asset is minted, while it is still present
      // in the raw plugin's map) and is never evicted — so it is immune to the
      // raw plugin's file-keyed "remove old assets" deletion. Astro runs two
      // build passes (client, then server) that share unplugin-parcel-macros'
      // module-global, content-addressed `assets` map; a re-transform in the
      // server pass evicts an id another module still imports, leaving the raw
      // `load` (`assets.get(id).content`) to crash on `undefined`. Consulting
      // the cache before the raw plugin sidesteps that race entirely, which is
      // what lets a Solid island SSR through the macro pipeline at all.
      if (fileName && macroCssCache.has(fileName)) {
        return macroCssCache.get(fileName);
      }

      if (plugin.loadInclude?.(normalizedId)) {
        try {
          const content = await plugin.load?.call(this, normalizedId);
          const css = cacheMacroCss(normalizedId, content);
          return css ?? content;
        } catch {
          // The raw asset was evicted by a competing build pass (content-addressed
          // ids collide across Astro's client+server passes). Fall through to the
          // cache below, which retains the content-verified CSS.
        }
      }

      return fileName ? (macroCssCache.get(fileName) ?? null) : null;
    },
    watchChange(id, change) {
      plugin.watchChange?.call(this, stripViteRequestSuffix(id), change);
    },
  };
};

export default defineConfig({
  integrations: [
    comparisonReact({
      // The current React comparison island is precompiled JS. Keep the React
      // dev transform scoped to future raw JSX/TSX files so Fast Refresh does
      // not wrap the manual mount path before Astro's preamble is available.
      include: ["src/components/react/**/*.jsx", "src/components/react/**/*.tsx"],
      exclude: [
        "src/components/solid/**/*",
        "../../packages/solid-stately/src/**/*",
        "../../packages/solidaria/src/**/*",
        "../../packages/solidaria/dist/**/*.jsx",
        "../../packages/solidaria-components/src/**/*",
        "../../packages/solidaria-components/dist/**/*.jsx",
        "../../packages/kumo/src/**/*",
        "../../packages/kumo/dist/**/*.jsx",
        "../../packages/solid-spectrum/src/**/*",
        "../../packages/viviana-ui/src/**/*",
      ],
    }),
    solid({
      include: [
        "src/components/solid/**/*",
        "../../packages/solid-stately/src/**/*",
        "../../packages/solidaria/src/**/*",
        "../../packages/solidaria/dist/**/*.jsx",
        "../../packages/solidaria-components/src/**/*",
        "../../packages/solidaria-components/dist/**/*.jsx",
        "../../packages/kumo/src/**/*",
        "../../packages/kumo/dist/**/*.jsx",
        "../../packages/solid-spectrum/src/**/*",
        "../../packages/viviana-ui/src/**/*",
      ],
      exclude: ["src/components/react/**/*"],
    }),
  ],
  vite: {
    plugins: [comparisonS2Macros()],
    build: {
      assetsInlineLimit: 0,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalized = id.replaceAll("\\", "/");
            if (
              normalized.includes("/node_modules/react-dom/") ||
              normalized.includes("/node_modules/scheduler/") ||
              /\/node_modules\/react\//.test(normalized)
            ) {
              return "react-runtime";
            }
            if (normalized.includes("/node_modules/solid-js/")) {
              return "solid-runtime";
            }
            return undefined;
          },
        },
      },
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
          // Preserve JSX so Astro's Solid integration can select its SSR or DOM
          // transform. The compiled `.js` fallback contains browser templates
          // and throws when the D12 hydration oracle prerenders on the server.
          replacement: path.resolve(repoRoot, "packages/solidaria/dist/index.jsx"),
        },
        {
          find: /^@proyecto-viviana\/solidaria-components$/,
          replacement: path.resolve(repoRoot, "packages/solidaria-components/dist/index.jsx"),
        },
        {
          find: /^@proyecto-viviana\/kumo$/,
          replacement: path.resolve(repoRoot, "packages/kumo/dist/index.jsx"),
        },
        {
          find: /^@proyecto-viviana\/kumo\/components\/button$/,
          replacement: path.resolve(repoRoot, "packages/kumo/dist/components/button.jsx"),
        },
        {
          find: /^@proyecto-viviana\/kumo\/styles\.css$/,
          replacement: path.resolve(repoRoot, "packages/kumo/dist/styles.css"),
        },
        {
          find: /^@proyecto-viviana\/solid-spectrum$/,
          replacement: path.resolve(repoRoot, "packages/solid-spectrum/src/index.ts"),
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
