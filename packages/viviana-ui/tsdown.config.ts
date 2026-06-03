import { defineConfig } from "tsdown";

// viviana-ui is a thin re-export of solid-spectrum. Externalize solid-spectrum so
// the `solid` condition propagates down to its JSX-preserved entry (the consumer
// compiles that per-environment). Build `./style` as JS too: @parcel/macros cannot
// strip TypeScript from macro entrypoints once they live under node_modules.
export default defineConfig({
  entry: ["src/index.ts", "src/style.ts"],
  format: ["esm"],
  platform: "neutral",
  outDir: "dist",
  sourcemap: true,
  clean: true,
  dts: true,
  deps: {
    neverBundle: [
      "solid-js",
      "solid-js/web",
      "solid-js/store",
      "@proyecto-viviana/solid-spectrum",
      "@proyecto-viviana/solid-spectrum/style",
    ],
  },
  outputOptions: { entryFileNames: "[name].js" },
});
