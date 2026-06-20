// Inline the S2 macro CSS into dist/styles.css.
//
// The `vp pack` build emits the migrated custom components' extracted atomic CSS
// to `dist/viviana-components.css` (the macro `css.fileName`), and copies
// `src/styles.css` (which @imports solid-spectrum's full CSS) to `dist`.
//
// A relative `@import "./viviana-components.css"` from the copied styles.css is
// NOT reliably followed by Vite when this package is consumed through its export
// map (the macro-emitted file is dropped, while bare-specifier and copied-file
// @imports resolve fine). So we inline the macro CSS straight into styles.css —
// mirroring solid-spectrum, whose dist/styles.css *is* its emitted macro CSS.
//
// Result: dist/styles.css = `@import solid-spectrum/styles.css` + viviana's own
// atomic rules, a single self-contained file the consumer's CSS chain includes
// in full.

import { readFile, writeFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const stylesPath = join(dist, "styles.css");
const macroPath = join(dist, "viviana-components.css");

const [styles, macro] = await Promise.all([
  readFile(stylesPath, "utf8"),
  readFile(macroPath, "utf8"),
]);

const banner = "\n/* viviana custom components — extracted S2 macro CSS (inlined) */\n";
await writeFile(stylesPath, `${styles.trimEnd()}\n${banner}${macro}`, "utf8");

// The macro CSS now lives inside styles.css; drop the redundant standalone file.
await rm(macroPath, { force: true });

// vp pack also emits a per-entry CSS sidecar for the `style` entry
// (`dist/style.css`) holding the bundled product components' atomic rules — the
// same rules just inlined into styles.css. Nothing imports it (it isn't in the
// export map; solid-spectrum ships the identical unexported sidecar), so it's
// redundant cruft. Drop it so the built CSS inventory matches what's exported.
await rm(join(dist, "style.css"), { force: true });

console.log(
  "inline-macro-css: appended viviana-components.css into dist/styles.css; dropped style.css sidecar",
);
