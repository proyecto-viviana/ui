// The supported Vite macro preset for apps that author their own `style()` calls
// against `@proyecto-viviana/ui/style`.
//
// Consuming the *pre-built* components needs no macro plugin — their style()
// calls are already expanded in the published build. But an app that writes its
// own macro calls must run the S2 style() macro at its own build. The bare
// `unplugin-parcel-macros` plugin isn't enough under rolldown-vite: the macro
// emits `import "macro-<hash>.css"` statements plus matching virtual CSS modules,
// and rolldown doesn't honor the plugin's resolveId/load for those virtual ids
// ("failed to resolve import macro-….css"). So we wrap it: cache each macro CSS
// body as it's transformed, resolve/serve those ids ourselves (with a `.css`
// extension so Vite's CSS pipeline bundles them), then strip the now-redundant JS
// import. This is the single source of truth for that wrapper — apps import it
// instead of copying it into their config.
//
// `unplugin-parcel-macros` is a peerDependency: every app that authors style()
// already installs it, and it must be the app's instance (it runs at the app's
// build), so we never bundle it.
//
// Usage (a dual-target app build, e.g. TanStack Start / solid-start):
//
//   import { defineConfig } from "vite";
//   import solid from "vite-plugin-solid";
//   import { vivianaMacros } from "@proyecto-viviana/ui/vite";
//
//   export default defineConfig({
//     plugins: [vivianaMacros(), solid({ ssr: true })],
//     // Keep our Solid packages out of the optimizer and bundle them into SSR:
//     optimizeDeps: { exclude: ["@proyecto-viviana/ui", "@proyecto-viviana/solid-spectrum"] },
//     ssr: { noExternal: ["@proyecto-viviana/ui", "@proyecto-viviana/solid-spectrum"] },
//   });
//
// Plugin order: place `vivianaMacros()` before `vite-plugin-solid` (the macro
// must expand style() before Solid compiles JSX), and before framework plugins
// (TanStack Start / Cloudflare) that wrap the build. The macro plugin only
// touches macro CSS resolution/loading and import stripping; the
// `optimizeDeps.exclude` / `ssr.noExternal` of our Solid packages stays
// app-owned (it depends on whether the app links sources or pre-built dists).
import macros from "unplugin-parcel-macros";

// A minimal structural view of the rolldown plugin that
// `unplugin-parcel-macros` returns — only the hooks we wrap. Kept local (and
// self-contained, with no rolldown/vite type imports) so the emitted
// `dist/vite.d.ts` is portable: consumers don't need rolldown's types resolvable
// to use the helper, and tsc can name the return type. `macros.rolldown()` is
// typed `Plugin | Plugin[]`; we always get the single-plugin form.
interface MacroPlugin {
  name?: string;
  transform?: (this: unknown, code: string, id: string) => unknown;
  resolveId?: (this: unknown, id: string, importer?: string, options?: object) => unknown;
  loadInclude?: (id: string) => boolean | void;
  load?: (this: unknown, id: string) => unknown;
  [key: string]: unknown;
}

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

/**
 * Returns the S2 style() macro plugin wrapped so its emitted CSS resolves and
 * loads correctly under rolldown-vite. Place it before `vite-plugin-solid`.
 */
export function vivianaMacros(): MacroPlugin {
  const plugin = macros.rolldown() as unknown as MacroPlugin;
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
