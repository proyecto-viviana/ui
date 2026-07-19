// Make dist/styles.css a single self-contained sheet.
//
// The `vp pack` build copies `src/styles.css` to `dist` verbatim. That source is
// just a bare `@import "@proyecto-viviana/solid-spectrum/styles.css"` (the atomic
// umbrella base) plus, when the migrated custom components emit macro CSS, an
// appended block of viviana's own atomic rules.
//
// A *nested* bare `@import` inside a package's exported CSS is not reliably
// followed by every consumer's bundler: a plain `import "…/ui/styles.css"` in an
// app's CSS graph resolves it, but loading the sheet as a URL asset (Vite `?url`,
// a `<link rel=stylesheet>`) does NOT descend into the second-level bare import,
// so solid-spectrum's 68 KB atomic base silently never ships and every component
// renders unstyled. So we INLINE that base — replace the `@import` line with the
// file's literal contents — mirroring how we inline viviana's own macro CSS.
//
// Result: dist/styles.css = solid-spectrum's atomic base + viviana's own atomic
// rules, one self-contained file with zero nested imports for a consumer's CSS
// chain to drop. Both inputs are pure `@layer`/atomic CSS (no `@import`,
// no `@charset`), so concatenation stays valid regardless of order.

import { readFile, writeFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const stylesPath = join(dist, "styles.css");
const macroPath = join(dist, "viviana-components.css");

// Match the bare solid-spectrum base import (either quote style, optional
// trailing semicolon) so we can swap it for the resolved file's contents.
const BASE_IMPORT_RE = /@import\s+["']@proyecto-viviana\/solid-spectrum\/styles\.css["']\s*;?/;

let styles = await readFile(stylesPath, "utf8");

// Inline solid-spectrum's atomic base in place of the bare @import. Resolve it
// with import.meta.resolve so the `import` export condition applies — the same
// condition a consumer's CSS bundler uses when following the bare @import, which
// maps `./styles.css` to the built dist atomic base (the `default`/require path
// is the src placeholder). So we ship byte-for-byte what the delegation intended.
// `pack:local-chain` builds solid-spectrum before viviana-ui, so dist is present.
if (BASE_IMPORT_RE.test(styles)) {
  const basePath = fileURLToPath(import.meta.resolve("@proyecto-viviana/solid-spectrum/styles.css"));
  const base = await readFile(basePath, "utf8");
  const banner =
    "/* solid-spectrum atomic base — inlined so the exported sheet is self-contained\n" +
    "   (a nested bare @import is dropped when this CSS is loaded as a URL asset). */\n";
  styles = styles.replace(BASE_IMPORT_RE, `${banner}${base.trimEnd()}`);
} else if (!styles.includes("--s2-container-bg")) {
  // No import line to inline AND the atomic base isn't already present: the build
  // shape changed out from under us and the exported sheet would ship unstyled.
  // Fail loud rather than emit a silently broken stylesheet.
  throw new Error(
    "inline-macro-css: dist/styles.css has neither the solid-spectrum @import nor its " +
      "inlined atomic base — refusing to emit an unstyled stylesheet.",
  );
}

// The macro file only exists when a built entry actually calls style(). The
// current surface is solid-spectrum re-export barrels only — the custom product
// components were archived out (see vite.config.ts) — so the macro extracts no
// rules and vite emits no viviana-components.css. Treat an absent file as "no
// custom rules to inline"; when Phase 2 re-adds macro-styled custom components
// the file reappears and is inlined again.
let macro = "";
try {
  macro = await readFile(macroPath, "utf8");
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}

if (macro.trim()) {
  const banner = "\n/* viviana custom components — extracted S2 macro CSS (inlined) */\n";
  styles = `${styles.trimEnd()}\n${banner}${macro}`;
}

await writeFile(stylesPath, styles, "utf8");

// The macro CSS now lives inside styles.css; drop the redundant standalone file.
await rm(macroPath, { force: true });

// vp pack also emits a per-entry CSS sidecar for the `style` entry
// (`dist/style.css`) holding the bundled product components' atomic rules — the
// same rules just inlined into styles.css. Nothing imports it (it isn't in the
// export map; solid-spectrum ships the identical unexported sidecar), so it's
// redundant cruft. Drop it so the built CSS inventory matches what's exported.
await rm(join(dist, "style.css"), { force: true });

// Fail loud if the self-contained sheet didn't actually end up self-contained:
// the atomic base must be present and no unresolved bare @proyecto-viviana import
// may remain for a consumer's bundler to drop.
const finalStyles = await readFile(stylesPath, "utf8");
if (!finalStyles.includes("--s2-container-bg")) {
  throw new Error("inline-macro-css: dist/styles.css is missing the inlined atomic base.");
}
if (/@import\s+["']@proyecto-viviana\//.test(finalStyles)) {
  throw new Error(
    "inline-macro-css: dist/styles.css still contains a nested bare @proyecto-viviana @import.",
  );
}

console.log(
  `inline-macro-css: inlined solid-spectrum atomic base` +
    (macro.trim() ? " + viviana-components.css" : "") +
    ` into dist/styles.css (${finalStyles.length} bytes); dropped style.css sidecar`,
);
