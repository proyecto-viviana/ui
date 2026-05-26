import path from "node:path";
import { stripVTControlCharacters } from "node:util";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import solid from "@astrojs/solid-js";

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

const shouldSuppressComparisonBuildLog = (level, log) => {
  if (level !== "warn") {
    return false;
  }

  const message = String(log?.message ?? log);
  return log?.code === "PLUGIN_TIMINGS" || shouldSuppressComparisonWarning(message);
};

const comparisonBuildWarningPolicy = () => ({
  chunkSizeWarningLimit: 2200,
  rollupOptions: {
    onLog(level, log, defaultHandler) {
      if (shouldSuppressComparisonBuildLog(level, log)) {
        return;
      }
      defaultHandler(level, log);
    },
  },
  rolldownOptions: {
    checks: {
      pluginTimings: false,
    },
  },
});

export default defineConfig(({ command }) => ({
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
    // The comparison app intentionally bundles both reference React S2 and
    // Solid implementations. Keep build output focused on actionable warnings.
    build: {
      assetsInlineLimit: 0,
      ...comparisonBuildWarningPolicy(),
    },
    environments: {
      client: {
        build: comparisonBuildWarningPolicy(),
      },
      ssr: {
        build: comparisonBuildWarningPolicy(),
      },
    },
    resolve: {
      alias: [
        {
          find: "@comparison",
          replacement: path.resolve(appRoot, "src"),
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
      noExternal: command === "build" ? true : localSolidPackages,
    },
  },
}));
