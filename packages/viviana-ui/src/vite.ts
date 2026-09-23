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
//   import solid from "@solidjs/vite-plugin";
//   import { vivianaMacros } from "@proyecto-viviana/ui/vite";
//
//   export default defineConfig({
//     plugins: [vivianaMacros(), solid({ ssr: true })],
//     optimizeDeps: {
//       exclude: ["@proyecto-viviana/ui"],
//     },
//     ssr: {
//       noExternal: ["@proyecto-viviana/ui"],
//     },
//   });
//
// Plugin order: place `vivianaMacros()` before `@solidjs/vite-plugin` (the macro
// must expand style() before Solid compiles JSX), and before framework plugins
// (TanStack Start / Cloudflare) that wrap the build. The macro plugin only
// touches macro CSS resolution/loading and import stripping; the
// `optimizeDeps.exclude` / `ssr.noExternal` of our Solid packages stays
// app-owned (it depends on whether the app links sources or pre-built dists).
import macros from "unplugin-parcel-macros";

// Structural Vite plugin. `vite` is not a peerDependency, so this file does not
// import Vite's `Plugin` and `dist/vite.d.ts` still has no vite or rolldown
// types. The hook signatures are what Vite 8's `Plugin` accepts under
// strictFunctionTypes: `name` is required, each result is a subset of that
// hook's Vite result (`unknown` is not assignable to it), `this` stays
// `unknown` because Vite's plugin context is assignable to `unknown`, and
// `options?: object` accepts the options object Vite passes. There is no
// string index signature — `[key: string]: unknown` types every hook as
// `unknown`, which Vite rejects inside `plugins`. `macros.rolldown()` is typed
// `Plugin | Plugin[]`; we always get the single-plugin form.
type MacroCssResult = string | null | undefined | void | { code?: string };
type MacroResolvedId = string | false | null | undefined | void | { id: string };
type MacroLoaded = string | null | undefined | void | { code: string };

interface MacroPlugin {
  name: string;
  transformInclude?: (id: string) => boolean | null | undefined | void;
  transform?: (
    this: unknown,
    code: string,
    id: string,
    options?: object,
  ) => MacroCssResult | Promise<MacroCssResult>;
  resolveId?: (
    this: unknown,
    id: string,
    importer?: string,
    options?: object,
  ) => MacroResolvedId | Promise<MacroResolvedId>;
  loadInclude?: (id: string) => boolean | null | undefined | void;
  load?: (this: unknown, id: string, options?: object) => MacroLoaded | Promise<MacroLoaded>;
  renderChunk?: (
    this: unknown,
    code: string,
    chunk?: object,
    outputOptions?: object,
    meta?: object,
  ) => string | null | undefined | void;
}

const macroCssIdPattern = /^macro-[a-f0-9]+\.css$/;
const macroCssImportPattern = /import\s+["']macro-[a-f0-9]+\.css["'];\n?/g;

function getMacroSourceFilePath(id: string) {
  const queryIndex = id.indexOf("?");
  if (queryIndex === -1 || !/^\?tsr-split=[^&#]+(?:#.*)?$/.test(id.slice(queryIndex))) {
    return id;
  }
  return id.slice(0, queryIndex);
}

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
 * loads correctly under rolldown-vite. Place it before `@solidjs/vite-plugin`.
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
    transformInclude(id: string) {
      return plugin.transformInclude?.(getMacroSourceFilePath(id)) ?? false;
    },
    async transform(this: unknown, code: string, id: string) {
      const result = await plugin.transform?.call(this, code, getMacroSourceFilePath(id));
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
