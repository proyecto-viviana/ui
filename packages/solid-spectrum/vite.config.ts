import { defineConfig } from "vite-plus";
import solid from "vite-plugin-solid";
import macros from "unplugin-parcel-macros";

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
  "src/s2-style/index.ts",
  "src/s2-style/runtime.ts",
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
      plugins: [macros.rolldown(), solid({ solid: { generate: "dom", hydratable: true } })],
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
      plugins: [macros.rolldown(), solid({ solid: { generate: "ssr" } })],
      deps,
    },
  ],
});
