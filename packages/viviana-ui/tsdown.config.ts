import { defineConfig } from "tsdown";

// viviana-ui re-exports solid-spectrum and adds its own product components (the
// relocated cards / feed / shell pieces). Externalize solid-spectrum so its
// `solid` condition propagates down to its JSX-preserved entry; for our own
// components we preserve JSX here too (jsx: "preserve" below) so the consumer
// compiles them per-environment (DOM vs SSR). Build `./style` as JS too:
// @parcel/macros cannot strip TypeScript from macro entrypoints under node_modules.
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
    // Relocated viviana product components (Solid .tsx — JSX preserved below).
    "src/CalendarCard.ts",
    "src/Chip.ts",
    "src/Conversation.ts",
    "src/EventCard.ts",
    "src/Logo.ts",
    "src/PageLayout.ts",
    "src/ProfileCard.ts",
    "src/ProjectCard.ts",
    "src/TimelineItem.ts",
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
      "@proyecto-viviana/solidaria-components",
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
  inputOptions(options) {
    // Keep JSX in the emitted .js instead of compiling it to a runtime; the Solid
    // consumer compiles it per-environment, matching the re-export philosophy.
    options.transform = { ...(options.transform ?? {}), jsx: "preserve" };
    return options;
  },
  outputOptions: { entryFileNames: "[name].js" },
});
