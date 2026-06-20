import { defineConfig } from "vite-plus";
import solid from "vite-plugin-solid";
import { vivianaMacros } from "./src/vite";

// viviana-ui re-exports solid-spectrum and adds its own product components (the
// relocated cards / feed / shell pieces, styled via the S2 `style()` macro
// through our own `../../style` seam). This build mirrors solid-spectrum's
// `vite.config.ts` exactly: a dual pack so the components are consumable.
//
//  - Pack 1 (.js): vite-plugin-solid (generate: "dom") compiles JSX to the Solid
//    runtime — the `import`/`default` conditions, for consumers without a Solid
//    compiler. `s2Macros()` runs the style() macro and extracts its rules into a
//    single `viviana-components.css`.
//  - Pack 2 (.jsx): JSX preserved (macro-expanded) — the `solid` export
//    condition. The consumer's compiler turns it into DOM or SSR per-environment,
//    so no separate SSR bundle is needed. The style() macro still runs here
//    (style() -> class strings), so consumers don't need the macro plugin; the
//    CSS comes from the DOM build above.
//
// Types come from a separate `tsc -p tsconfig.build.json` (see package.json).

const entry = [
  "src/index.ts",
  "src/style.ts",
  "src/style/runtime.ts",
  "src/vite.ts",
  "src/ActionButton.ts",
  "src/ActionMenu.ts",
  "src/Breadcrumbs.ts",
  "src/Button.ts",
  "src/Calendar.ts",
  "src/Card.ts",
  "src/CardView.ts",
  "src/CenterBaseline.ts",
  "src/ColorArea.ts",
  "src/ColorField.ts",
  "src/ColorSlider.ts",
  "src/ColorSwatch.ts",
  "src/ColorSwatchPicker.ts",
  "src/ColorWheel.ts",
  "src/ContrastIcon.ts",
  "src/Disclosure.ts",
  "src/FileTrigger.ts",
  "src/GitHubIcon.ts",
  "src/LightenIcon.ts",
  "src/LinkButton.ts",
  "src/ListView.ts",
  "src/Menu.ts",
  "src/Picker.ts",
  "src/Provider.ts",
  "src/RangeCalendar.ts",
  "src/SearchField.ts",
  "src/SegmentedControl.ts",
  "src/Switch.ts",
  "src/Tabs.ts",
  "src/TextArea.ts",
  "src/TextField.ts",
  "src/TreeView.ts",
  // Relocated viviana product components (Solid .tsx).
  "src/CalendarCard.ts",
  "src/Chip.ts",
  "src/Conversation.ts",
  "src/EventCard.ts",
  "src/Logo.ts",
  "src/PageLayout.ts",
  "src/ProfileCard.ts",
  "src/ProjectCard.ts",
  "src/TimelineItem.ts",
];

// Externalize solid-js and the workspace packages we re-export (and their
// subpaths) so solid-spectrum's `solid` condition propagates to its
// JSX-preserved entries; we only bundle our own product components.
const deps = {
  neverBundle: [
    /^solid-js(\/.*)?$/,
    /^@proyecto-viviana\/solid-spectrum(\/.*)?$/,
    /^@proyecto-viviana\/solidaria-components(\/.*)?$/,
    // The macro preset (src/vite.ts) imports unplugin-parcel-macros; it's a
    // peerDependency that must stay external so dist/vite.js uses the app's
    // installed instance (the macro runs at the app's build, not ours).
    /^unplugin-parcel-macros$/,
  ],
};

// The S2 style() macro rules, bundled into one stylesheet. Emitted under a
// distinct name so the copied `src/styles.css` (which @imports solid-spectrum's)
// isn't clobbered; `scripts/inline-macro-css.mjs` then appends this into
// dist/styles.css and removes it (a relative @import to a macro-emitted file
// isn't reliably followed through the export map — see that script).
const css = {
  fileName: "viviana-components.css",
  splitting: false,
  inject: false,
  minify: true,
};

// Hand-written CSS files copied verbatim (the macro only emits
// viviana-components.css above, later inlined into styles.css).
// theme.css/styles.css/components.css chain the solid-spectrum imports with
// viviana's tokens + atomic rules.
const copiedCssFiles = [
  "components.css",
  "font-faces.css",
  "theme.css",
  "styles.css",
  "viviana-tokens.css",
].map((fileName) => ({
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
      plugins: [vivianaMacros(), solid({ solid: { generate: "dom", hydratable: true } })],
      deps,
      copy: copiedCssFiles,
    },
    {
      // JSX preserved (macro-expanded) -> dist/*.jsx — the `solid` export
      // condition. The consumer's compiler turns this into DOM or SSR
      // per-environment, so no separate pre-built SSR bundle is needed. The
      // style() macro still runs here (style() -> class strings), so consumers
      // don't need the macro plugin; viviana-components.css comes from the DOM
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
      plugins: [vivianaMacros()],
      deps,
    },
  ],
});
