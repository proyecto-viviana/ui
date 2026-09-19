import { defineConfig } from "vite-plus";
import solidPlugin from "@solidjs/vite-plugin";

const entry = {
  index: "src/index.ts",
  "components/button": "src/components/button.tsx",
};

const neverBundle = [
  "solid-js",
  "@solidjs/web",
  /^@proyecto-viviana\/solidaria-components(\/.*)?$/,
];

export default defineConfig({
  pack: [
    {
      entry,
      format: ["esm"],
      platform: "neutral",
      outDir: "dist",
      sourcemap: true,
      clean: false,
      dts: false,
      deps: { neverBundle },
      inputOptions(options) {
        options.transform = { ...(options.transform || {}), jsx: "preserve" };
        return options;
      },
      outputOptions: { entryFileNames: "[name].jsx", chunkFileNames: "[name].jsx" },
    },
    {
      entry,
      format: ["esm"],
      platform: "browser",
      outDir: "dist",
      sourcemap: true,
      clean: false,
      dts: false,
      deps: { neverBundle },
      outputOptions: { entryFileNames: "[name].js", chunkFileNames: "[name].js" },
      plugins: [...solidPlugin({ ssr: true, refresh: { disabled: true } })],
    },
  ],
});
