import macros from "unplugin-parcel-macros";

const macroCssIdPattern = /^macro-[a-f0-9]+\.css$/;
const macroCssImportPattern = /import\s+["']macro-[a-f0-9]+\.css["'];\n?/g;

function getMacroCssFileName(id) {
  const fileName = id.split("/").pop();
  return fileName && macroCssIdPattern.test(fileName) ? fileName : null;
}

function removeMacroCssImports(code) {
  return code.replace(macroCssImportPattern, "");
}

function getMacroCssContent(content) {
  if (typeof content === "string") {
    return content;
  }

  if (content && typeof content === "object" && "code" in content) {
    return typeof content.code === "string" ? content.code : null;
  }

  return null;
}

/**
 * Run the S2 macro transform for a published styled package.
 *
 * The JSX-preserve build removes only the virtual CSS imports that the macro
 * appends after the transformed program. Retain the macro's source map because
 * no generated position in the retained program moves when those lines go.
 */
export function packageMacros(options = {}) {
  const plugin = macros.rolldown();
  const macroCssCache = new Map();
  const stripCssImports = options.stripCssImports ?? false;

  const cacheMacroCss = (id, content) => {
    const fileName = getMacroCssFileName(id);
    const css = getMacroCssContent(content);
    if (fileName && css != null) {
      macroCssCache.set(fileName, css);
    }
    return css;
  };

  return {
    ...plugin,
    async transform(code, id) {
      const result = await plugin.transform?.call(this, code, id);
      const transformedCode =
        typeof result === "string"
          ? result
          : result && typeof result === "object" && "code" in result
            ? String(result.code)
            : "";

      if (
        result != null &&
        transformedCode !== code &&
        (typeof result === "string" || !("map" in result) || result.map == null)
      ) {
        throw new Error(`Macro transform changed ${id} without a source map.`);
      }

      for (const match of transformedCode.matchAll(/import\s+["'](macro-[a-f0-9]+\.css)["'];/g)) {
        try {
          const content = await plugin.load?.call(this, match[1]);
          cacheMacroCss(match[1], content);
        } catch {
          // A competing build pass can evict the asset after this pass caches it.
        }
      }

      if (stripCssImports && result != null) {
        if (typeof result === "string") {
          return removeMacroCssImports(result);
        }
        if (typeof result === "object" && "code" in result && typeof result.code === "string") {
          return { ...result, code: removeMacroCssImports(result.code) };
        }
      }

      return result;
    },
    async resolveId(id, importer, options) {
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
    loadInclude(id) {
      const fileName = getMacroCssFileName(id);
      return (
        (fileName != null && macroCssCache.has(fileName)) || (plugin.loadInclude?.(id) ?? false)
      );
    },
    async load(id) {
      const fileName = getMacroCssFileName(id);
      if (fileName && macroCssCache.has(fileName)) {
        return macroCssCache.get(fileName);
      }
      if (plugin.loadInclude?.(id)) {
        try {
          const content = await plugin.load?.call(this, id);
          const css = cacheMacroCss(id, content);
          return css ?? content;
        } catch {
          // A competing build pass can evict the asset after this pass caches it.
        }
      }
      return fileName ? (macroCssCache.get(fileName) ?? null) : null;
    },
    renderChunk(code) {
      const stripped = removeMacroCssImports(code);
      if (stripped === code) {
        return null;
      }
      throw new Error(
        "A macro CSS import reached renderChunk. Remove it during transform so the source map stays accurate.",
      );
    },
  };
}

export function rejectBrokenSourceMap(level, log) {
  if (level === "warn" && log?.code === "SOURCEMAP_BROKEN") {
    const details = Object.fromEntries(
      Object.entries(log).filter(([key]) => key !== "message" && key !== "code"),
    );
    throw new Error(
      `Published package build rejected ${log.code}: ${log.message}\n${JSON.stringify(details)}`,
    );
  }
}

/** Fail a package build if any transform starts publishing an unreliable map. */
export function sourceMapWarningGuard() {
  return {
    name: "published-sourcemap-warning-guard",
    onLog(level, log) {
      rejectBrokenSourceMap(level, log);
    },
  };
}
