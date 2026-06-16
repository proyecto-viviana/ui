import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import viteSolid from "vite-plugin-solid";
import macros from "unplugin-parcel-macros";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { adminApiPlugin } from "./src/app/admin/server/plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Workspace packages are linked sources, not pre-built dists: keep them out of
// the dep optimizer (both client and SSR) and bundle them into the SSR graph so
// they share the one solid-js instance. Mirrors apps in the visualmode repo.
const workspacePackages = [
  "@proyecto-viviana/solid-spectrum",
  "@proyecto-viviana/solidaria",
  "@proyecto-viviana/solidaria-components",
  "@proyecto-viviana/solid-stately",
];

// The S2 style() macro emits `import "macro-<hash>.css"` statements plus the
// matching virtual CSS modules. Under rolldown-vite the bare unplugin plugin's
// resolveId/load for those virtual ids isn't honored (rolldown reports "failed
// to resolve import macro-….css"), so we wrap it: cache each macro CSS body as
// it's transformed, resolve/serve those ids ourselves (with the .css extension
// so Vite's CSS pipeline bundles them), then strip the now-redundant JS import.
// This mirrors the identical wrapper in solid-spectrum/viviana-ui's vite.config.
const macroCssIdPattern = /^macro-[a-f0-9]+\.css$/;
const macroCssImportPattern = /import\s+["']macro-[a-f0-9]+\.css["'];\n?/g;

function getMacroCssFileName(id: string) {
  const fileName = id.split("/").pop();
  return fileName && macroCssIdPattern.test(fileName) ? fileName : null;
}

function removeMacroCssImports(code: string) {
  return code.replace(macroCssImportPattern, "");
}

function getMacroCssContent(content: unknown) {
  if (typeof content === "string") {
    return content;
  }

  if (content && typeof content === "object" && "code" in content) {
    const code = (content as { code: unknown }).code;
    return typeof code === "string" ? code : null;
  }

  return null;
}

function s2Macros() {
  const plugin = macros.rolldown();
  const macroCssCache = new Map<string, string>();

  const cacheMacroCss = (id: string, content: unknown) => {
    const fileName = getMacroCssFileName(id);
    const css = getMacroCssContent(content);
    if (fileName && css != null) {
      macroCssCache.set(fileName, css);
    }
    return css;
  };

  return {
    ...plugin,
    async transform(this: unknown, code: string, id: string) {
      const result = await plugin.transform?.call(this, code, id);
      const transformedCode =
        typeof result === "string"
          ? result
          : result && typeof result === "object" && "code" in result
            ? String(result.code)
            : "";

      for (const match of transformedCode.matchAll(/import\s+["'](macro-[a-f0-9]+\.css)["'];/g)) {
        const content = await plugin.load?.call(this, match[1]);
        cacheMacroCss(match[1], content);
      }

      return result;
    },
    async resolveId(this: unknown, id: string, importer?: string, options?: object) {
      const resolved = await plugin.resolveId?.call(this, id, importer, options);
      if (resolved) {
        return resolved;
      }
      const fileName = getMacroCssFileName(id);
      if (fileName && macroCssCache.has(fileName)) {
        return fileName;
      }
      return resolved;
    },
    loadInclude(id: string) {
      const fileName = getMacroCssFileName(id);
      return (
        (fileName != null && macroCssCache.has(fileName)) || (plugin.loadInclude?.(id) ?? false)
      );
    },
    async load(this: unknown, id: string) {
      if (plugin.loadInclude?.(id)) {
        const content = await plugin.load?.call(this, id);
        const css = cacheMacroCss(id, content);
        if (css != null) {
          return css;
        }
        return content;
      }
      const fileName = getMacroCssFileName(id);
      if (fileName) {
        return macroCssCache.get(fileName);
      }
      return null;
    },
    renderChunk(code: string) {
      return removeMacroCssImports(code);
    },
  };
}

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "~": path.resolve(__dirname, "./src"),
    },
    dedupe: ["solid-js", "@tanstack/solid-router", "@tanstack/router-core"],
  },
  ssr: {
    noExternal: [/@proyecto-viviana\/.*/],
    optimizeDeps: {
      // solid-js/solid-js/web are excluded so the SSR env never pre-bundles a
      // second copy: HydrationScript (solid-js/web) and the renderer (solid-js)
      // must share one sharedConfig, or SSR throws "Cannot destructure 'nonce'".
      exclude: [...workspacePackages, "solid-js", "solid-js/web"],
    },
  },
  optimizeDeps: {
    // The vite-plus dep scanner can't parse Solid TSX (it falls back to the
    // React JSX runtime), so skip discovery and optimize on demand instead.
    noDiscovery: true,
    exclude: workspacePackages,
  },
  plugins: [
    // The S2 style() macro. We resolve the workspace packages to their *source*
    // (root tsconfig `paths` + resolve.tsconfigPaths), so the `style()`/`iconStyle()`
    // calls that solid-spectrum imports `with { type: "macro" }` are NOT the
    // macro-expanded dist — they must be expanded here. Without this pass the
    // import attribute is ignored, `style` falls back to its runtime form, and the
    // dynamic-style path calls `new Function`, which workerd SSR forbids
    // ("Code generation from strings disallowed") — the Provider's container style
    // then throws on every SSR render. Mirrors solid-spectrum/viviana-ui's build.
    // Must run ahead of viteSolid so it sees the original `with`-tagged imports.
    s2Macros(),
    // Dev-only /api/admin middleware (apply:"serve"); runs in the Node process,
    // not the workerd SSR env (which has no repo filesystem). Ordered first so it
    // wins for /api/admin before the cloudflare SSR env. See admin-dashboard.md.
    adminApiPlugin(),
    // cloudflare provides the workerd SSR environment used in dev and prod alike.
    // Must stay ahead of tanstackStart so the SSR env is set up before routing.
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart(),
    viteSolid({ ssr: true }),
  ],
});
