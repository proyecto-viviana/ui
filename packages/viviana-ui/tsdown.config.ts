import { defineConfig } from "tsdown";

// viviana-ui is a thin re-export of solid-spectrum. Externalize solid-spectrum so
// the `solid` condition propagates down to its JSX-preserved entry (the consumer
// compiles that per-environment). Only the `.` entry is built; `./style` stays
// source — it's the parcel style() macro, expanded by the consumer's macro plugin.
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "neutral",
  outDir: "dist",
  sourcemap: true,
  clean: true,
  dts: true,
  deps: {
    neverBundle: ["solid-js", "solid-js/web", "solid-js/store", "@proyecto-viviana/solid-spectrum"],
  },
  outputOptions: { entryFileNames: "[name].js" },
});
