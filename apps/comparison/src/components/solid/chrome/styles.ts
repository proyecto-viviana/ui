import {
  lightDark,
  style,
  type StyleString,
} from "@proyecto-viviana/solid-spectrum/style" with { type: "macro" };

export function staticClassName(value: unknown): StyleString {
  if (typeof value === "function") {
    return (value as (props: Record<string, unknown>) => StyleString)({});
  }

  return value as StyleString;
}

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
  borderBottomWidth: 1,
  borderStyle: "solid",
  borderColor: lightDark("gray-300", "gray-800"),
  backgroundColor: "base",
  isolation: "isolate",
  "@media (max-width: 860px)": {
    gridTemplateColumns: "[1fr auto]",
    height: "auto",
    paddingX: 18,
    paddingY: 14,
  },
});

export const docsBrandLink = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "[10px]",
  minWidth: 0,
  color: "neutral",
  font: "ui-lg",
  fontWeight: "bold",
  textDecoration: "none",
});

export const docsBrandMark = style({
  display: "inline-grid",
  alignItems: "center",
  justifyItems: "center",
  width: 26,
  height: 26,
  borderRadius: "sm",
  backgroundColor: "neutral",
  color: "auto",
  font: "ui",
  fontWeight: "black",
});

export const docsSearchRoot = style({
  display: "grid",
  gridTemplateColumns: "[minmax(0, 1fr)]",
  alignItems: "center",
  minWidth: 0,
  "@media (max-width: 860px)": {
    display: "none",
  },
});

export const docsSearchButton = style({
  width: "full",
  justifyContent: "space-between",
});

export const docsShellAction = style({
  minWidth: 0,
  minHeight: 32,
  paddingX: 12,
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "transparent",
  borderRadius: "pill",
  backgroundColor: {
    default: "transparent",
    ":hover": "gray-100",
  },
  color: "neutral",
  font: "ui",
  cursor: "pointer",
});

export const docsShellThemeToggle = style({
  font: "ui-sm",
});

export const docsSearchKeyboard = style({
  display: "inline-grid",
  alignItems: "center",
  justifyItems: "center",
  minWidth: 22,
  minHeight: 22,
  paddingX: "[6px]",
  paddingY: "[1px]",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: lightDark("gray-300", "gray-700"),
  borderRadius: "sm",
  backgroundColor: "base",
  color: "neutral-subdued",
  font: "ui-sm",
});

export const docsTopNavRoot = style({
  display: "flex",
  justifyContent: "end",
  gap: "[22px]",
  color: "neutral-subdued",
  font: "ui",
  "@media (max-width: 860px)": {
    display: "none",
  },
});

export const docsTopNavLink = style({
  display: "inline-flex",
  alignItems: "center",
  color: {
    default: "neutral-subdued",
    ":hover": "accent",
  },
});

export const docsLayoutRoot = style({
  "--comparison-docs-layout-macro": {
    type: "opacity",
    value: 1,
  },
  display: "grid",
  gridTemplateColumns: "[220px minmax(0, 1fr) 168px]",
  gap: 32,
  width: "[min(1680px, 100%)]",
  marginX: "auto",
  paddingTop: 36,
  paddingBottom: "[88px]",
  paddingX: 28,
  "@media (max-width: 1320px)": {
    gridTemplateColumns: "[210px minmax(0, 1fr)]",
  },
  "@media (max-width: 860px)": {
    gridTemplateColumns: "[1fr]",
    gap: 24,
    paddingTop: 24,
    paddingBottom: 72,
    paddingX: 18,
  },
});

export const docsSidebarRail = style({
  position: "sticky",
  top: "[88px]",
  maxHeight: "[calc(100vh - 104px)]",
  overflow: "auto",
  "@media (max-width: 860px)": {
    position: "static",
    maxHeight: "none",
  },
});

export const docsTocRail = style({
  position: "sticky",
  top: "[88px]",
  display: "grid",
  alignContent: "start",
  gap: 8,
  maxHeight: "[calc(100vh - 104px)]",
  overflow: "auto",
  color: "neutral-subdued",
  font: "ui-sm",
  "@media (max-width: 1320px)": {
    display: "none",
  },
});

export const docsMainContent = style({
  display: "grid",
  gap: "[34px]",
});

export const docsChromeMount = style({
  minWidth: 0,
});

export const docsSidebarRoot = style({
  "--comparison-docs-sidebar-macro": {
    type: "opacity",
    value: 1,
  },
  minWidth: 0,
});

export const docsNavRoot = style({
  display: "grid",
  gap: 2,
  paddingEnd: 12,
  font: "ui",
  "@media (max-width: 860px)": {
    gridAutoFlow: "row",
    gridAutoColumns: "auto",
    maxHeight: 280,
    overflow: "auto",
  },
});

export const docsNavHeading = style({
  marginTop: {
    default: "[22px]",
    ":first-child": 0,
  },
  marginBottom: 8,
  color: "neutral",
  font: "detail",
});

export const docsNavLink = style({
  display: "inline-flex",
  alignItems: "center",
  minHeight: 28,
  color: {
    default: "neutral-subdued",
    ":hover": "accent",
  },
  textDecoration: "none",
});

export const docsNavLinkCurrent = style({
  color: "accent",
});

export const docsNavGroup = style({
  display: "grid",
  gap: "[1px]",
  marginY: 2,
});

export const docsNavGroupHeader = style({
  minWidth: 0,
  gap: 8,
});

export const docsNavGroupTitle = style({
  minWidth: 0,
});

export const docsNavGroupLabel = style({
  minWidth: 0,
  truncate: true,
});

export const docsNavCount = style({
  justifySelf: "end",
});

export const docsNavGroupPanel = style({
  borderStartWidth: 1,
  borderStyle: "solid",
  borderColor: lightDark("gray-300", "gray-800"),
});

export const docsNavGroupLinks = style({
  display: "grid",
  gap: "[1px]",
});

export const docsNavGroupLink = style({
  paddingStart: 8,
});

export const docsNavGroupSummary = style({
  display: "grid",
  gridTemplateColumns: "[minmax(0, 1fr) auto 12px]",
  alignItems: "center",
  gap: 8,
  minHeight: 30,
  paddingY: 4,
  color: "neutral",
  font: "detail",
  cursor: "pointer",
  listStyleType: "none",
});

export const docsNavGroupFallbackLinks = style({
  display: "grid",
  gap: "[1px]",
  paddingStart: "[10px]",
  paddingBottom: 8,
  borderStartWidth: 1,
  borderStyle: "solid",
  borderColor: lightDark("gray-300", "gray-800"),
});

export const docsNavCountFallback = style({
  minWidth: 24,
  paddingX: "[6px]",
  paddingY: "[1px]",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: lightDark("gray-300", "gray-800"),
  borderRadius: "full",
  color: "neutral-subdued",
  font: "ui-sm",
  fontWeight: "bold",
  textAlign: "center",
});

export const docsTocRoot = style({
  "--comparison-docs-toc-macro": {
    type: "opacity",
    value: 1,
  },
  minWidth: 0,
});

export const docsTocNav = style({
  display: "grid",
  alignContent: "start",
  gap: 8,
  color: "neutral-subdued",
  font: "ui-sm",
});

export const docsTocHeading = style({
  marginTop: 0,
  marginBottom: 8,
  color: "neutral",
  font: "detail",
});

export const docsTocLink = style({
  display: "inline-flex",
  alignItems: "center",
  minHeight: 28,
  color: {
    default: "neutral-subdued",
    ":hover": "accent",
  },
  textDecoration: "none",
});

export const docsTocActions = style({
  display: "grid",
  gap: 8,
  marginTop: 20,
  paddingTop: 16,
  borderTopWidth: 1,
  borderStyle: "solid",
  borderColor: lightDark("gray-300", "gray-800"),
});
