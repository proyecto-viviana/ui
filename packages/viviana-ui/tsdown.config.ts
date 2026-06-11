import { defineConfig } from "tsdown";

// viviana-ui is a thin re-export of solid-spectrum. Externalize solid-spectrum so
// the `solid` condition propagates down to its JSX-preserved entry (the consumer
// compiles that per-environment). Build `./style` as JS too: @parcel/macros cannot
// strip TypeScript from macro entrypoints once they live under node_modules.
export default defineConfig({
  entry: [
    "src/index.ts",
    "src/style.ts",
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
  ],
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
      "@proyecto-viviana/solid-spectrum/ActionButton",
      "@proyecto-viviana/solid-spectrum/Button",
      "@proyecto-viviana/solid-spectrum/ContrastIcon",
      "@proyecto-viviana/solid-spectrum/FileTrigger",
      "@proyecto-viviana/solid-spectrum/LightenIcon",
      "@proyecto-viviana/solid-spectrum/LinkButton",
      "@proyecto-viviana/solid-spectrum/Picker",
      "@proyecto-viviana/solid-spectrum/Provider",
      "@proyecto-viviana/solid-spectrum/SearchField",
      "@proyecto-viviana/solid-spectrum/SegmentedControl",
      "@proyecto-viviana/solid-spectrum/Switch",
      "@proyecto-viviana/solid-spectrum/TextArea",
      "@proyecto-viviana/solid-spectrum/TextField",
    ],
  },
  outputOptions: { entryFileNames: "[name].js" },
});
