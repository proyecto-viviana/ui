import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { clearS2CssAssets, getS2CssAssets } from "../packages/solid-spectrum/src/s2-style";
import { generatePageStyles } from "../packages/solid-spectrum/src/s2-internal/page.macro";

process.env.NODE_ENV = "production";

clearS2CssAssets();
generatePageStyles();
await import("../packages/solid-spectrum/src/provider");
await import("../packages/solid-spectrum/src/badge");
await import("../packages/solid-spectrum/src/divider");
await import("../packages/solid-spectrum/src/icon/center-baseline");
await import("../packages/solid-spectrum/src/statuslight");
await import("../packages/solid-spectrum/src/meter");
await import("../packages/solid-spectrum/src/form");
await import("../packages/solid-spectrum/src/button/s2-progress-circle-animation");
await import("../packages/solid-spectrum/src/button/s2-button-styles");
await import("../packages/solid-spectrum/src/button/s2-action-button-styles");
await import("../packages/solid-spectrum/src/searchfield/s2-searchfield-styles");
await import("../packages/solid-spectrum/src/textfield/s2-textarea-styles");
await import("../packages/solid-spectrum/src/actionbar");
await import("../packages/solid-spectrum/src/menu/s2-menu-styles");
await import("../packages/solid-spectrum/src/picker");
await import("../packages/solid-spectrum/src/combobox");
await import("../packages/solid-spectrum/src/link");

const css = [
  "/* Generated from vendored Adobe Spectrum 2 style declarations. Do not edit by hand. */",
  ...getS2CssAssets(),
  "",
]
  .join("\n\n")
  .replace(/[ \t]+$/gm, "")
  .replace(/\n+$/g, "\n");

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

writeFileSync(resolve(repoRoot, "packages/solid-spectrum/src/s2-generated.css"), css);
