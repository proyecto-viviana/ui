import { style } from "@proyecto-viviana/solid-spectrum/style" with { type: "macro" };

export const docsTopBarRoot = style({
  "--comparison-docs-topbar-macro": {
    type: "opacity",
    value: 1,
  },
  position: "sticky",
  top: 0,
  zIndex: 50,
  display: "grid",
  gridTemplateColumns: "[240px minmax(180px, 420px) 1fr auto]",
  alignItems: "center",
  gap: 24,
  height: 64,
  paddingX: 32,
  isolation: "isolate",
});
