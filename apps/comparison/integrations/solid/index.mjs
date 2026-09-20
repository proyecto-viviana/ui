import { fileURLToPath } from "node:url";
import solid from "@solidjs/vite-plugin";

// Private adapter for the pinned Solid 2 runtime. Astro's installed Solid
// integration still compiles and renders with Solid 1 APIs. The renderer name
// is Astro's existing identity (including client:only="solid-js"), not a package.
export default function comparisonSolid(options = {}) {
  const serverEntrypoint = fileURLToPath(new URL("./server.mjs", import.meta.url));
  const clientEntrypoint = fileURLToPath(new URL("./client.mjs", import.meta.url));
  return {
    name: "@astrojs/solid-js",
    hooks: {
      "astro:config:setup": ({ addRenderer, updateConfig }) => {
        addRenderer({ name: "@astrojs/solid-js", serverEntrypoint, clientEntrypoint });
        updateConfig({
          vite: {
            plugins: solid({ ...options, ssr: true }),
            resolve: { dedupe: ["solid-js", "@solidjs/web"] },
          },
        });
      },
    },
  };
}
