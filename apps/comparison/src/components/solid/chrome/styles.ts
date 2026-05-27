import {
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
  gridTemplateColumns: "[1fr auto 1fr]",
  alignItems: "center",
  gap: 12,
  width: "[calc(100% - 24px)]",
  maxWidth: "[1416px]",
  minHeight: 48,
  marginX: "auto",
  marginTop: 12,
  paddingX: 0,
  borderBottomWidth: 0,
  backgroundColor: "transparent",
  isolation: "isolate",
  "@media (max-width: 860px)": {
    gridTemplateColumns: "[1fr auto auto]",
    height: "auto",
    minHeight: 56,
    marginTop: 0,
    paddingX: "[18px]",
    paddingY: 8,
  },
});

export const docsBrandLink = style({
  display: "inline-flex",
  alignItems: "center",
  justifySelf: "start",
  gap: "[10px]",
  minHeight: 48,
  minWidth: 0,
  marginStart: "[26px]",
  paddingX: 12,
  borderRadius: "[10px]",
  backgroundColor: {
    default: "transparent",
    ":hover": "gray-100",
  },
  color: "neutral",
  font: "ui-lg",
  fontWeight: "bold",
  textDecoration: "none",
  "@media (max-width: 860px)": {
    marginStart: 0,
  },
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
  justifySelf: "center",
  width: "[min(500px, 36vw)]",
  maxWidth: "[500px]",
  minWidth: "[240px]",
  "@media (max-width: 860px)": {
    display: "none",
  },
});

export const docsSearchButton = style({
  display: "flex",
  alignItems: "center",
  gap: "text-to-visual",
  width: "full",
  height: 40,
  minHeight: 40,
  boxSizing: "border-box",
  paddingStart: "pill",
  paddingEnd: 8,
  borderWidth: 2,
  borderStyle: "solid",
  borderColor: {
    default: "gray-300",
    ":hover": "gray-400",
    ":focus-visible": "gray-900",
  },
  borderRadius: "pill",
  backgroundColor: {
    default: "gray-25",
    ":hover": "gray-50",
  },
  color: "neutral-subdued",
  font: "ui-lg",
  cursor: "text",
  justifyContent: "start",
});

export const docsSearchIcon = style({
  size: 20,
  marginStart: 0,
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
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
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  minWidth: 32,
  paddingX: 0,
  borderRadius: "[10px]",
  font: "ui-sm",
});

export const docsShellIcon = style({
  size: 20,
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

export const docsSearchKeyboard = style({
  display: "inline-grid",
  alignItems: "center",
  justifyItems: "center",
  minWidth: 40,
  minHeight: 24,
  marginStart: "auto",
  paddingX: 8,
  paddingY: 2,
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "gray-300",
  borderRadius: "xl",
  backgroundColor: "layer-1",
  color: "neutral-subdued",
  font: "detail",
  pointerEvents: "none",
});

export const docsTopNavRoot = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "end",
  gap: 4,
  color: "neutral-subdued",
  font: "ui",
  "@media (max-width: 860px)": {
    display: "none",
  },
});

export const docsTopNavLink = style({
  display: "inline-flex",
  alignItems: "center",
  minHeight: 32,
  paddingX: 12,
  borderRadius: "[10px]",
  textDecoration: "none",
  backgroundColor: {
    default: "transparent",
    ":hover": "gray-100",
  },
  color: {
    default: "neutral-subdued",
    ":hover": "neutral",
  },
});

export const docsTopActionsRoot = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "end",
  gap: 4,
  minWidth: 0,
});

export const docsTopDivider = style({
  alignSelf: "center",
  height: 20,
  marginX: 4,
  backgroundColor: "gray-300",
  "@media (max-width: 860px)": {
    display: "none",
  },
});

export const docsSearchOverlay = style({
  position: "fixed",
  inset: 0,
  zIndex: 120,
  display: "grid",
  justifyItems: "center",
  alignItems: "start",
  paddingX: 16,
  paddingTop: "[96px]",
  backgroundColor: "transparent-overlay-500",
  "@media (max-width: 860px)": {
    paddingX: 12,
    paddingTop: 72,
  },
});

export const docsSearchDialog = style({
  display: "grid",
  gap: 12,
  width: "[min(640px, calc(100vw - 32px))]",
  maxHeight: "[calc(100dvh - 128px)]",
  padding: 12,
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "gray-200",
  borderRadius: "xl",
  backgroundColor: "layer-1",
  boxShadow: "emphasized",
  color: "neutral",
  overflow: "hidden",
  "@media (max-width: 860px)": {
    width: "[calc(100vw - 24px)]",
    maxHeight: "[calc(100dvh - 96px)]",
  },
});

export const docsSearchDialogHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  paddingX: 4,
});

export const docsSearchDialogTitle = style({
  margin: 0,
  color: "neutral",
  font: "title",
});

export const docsSearchDialogField = style({
  width: "full",
});

export const docsSearchResults = style({
  display: "grid",
  gap: 4,
  maxHeight: "[min(52vh, 420px)]",
  overflow: "auto",
  paddingTop: 4,
  paddingBottom: 4,
});

export const docsSearchResultLink = style({
  display: "grid",
  gap: 2,
  paddingX: 12,
  paddingY: "[10px]",
  borderRadius: "lg",
  backgroundColor: {
    default: "transparent",
    ":hover": "gray-100",
    ":focus-visible": "gray-100",
  },
  color: "neutral",
  textDecoration: "none",
  outlineOffset: 2,
});

export const docsSearchResultTitle = style({
  color: "neutral",
  font: "ui",
  fontWeight: "bold",
});

export const docsSearchResultMeta = style({
  color: "neutral-subdued",
  font: "detail",
});

export const docsSearchEmpty = style({
  margin: 0,
  paddingX: 12,
  paddingY: "[18px]",
  color: "neutral-subdued",
  font: "ui",
});

export const docsMobileNavButton = style({
  display: "none",
  "@media (max-width: 860px)": {
    display: "inline-flex",
  },
});

export const docsMobileNavOverlay = style({
  position: "fixed",
  inset: 0,
  zIndex: 100,
});

export const docsMobileNavPanel = style({
  position: "fixed",
  top: 0,
  insetEnd: 0,
  width: "[min(340px, calc(100vw - 24px))]",
  height: "[100dvh]",
  paddingX: "[18px]",
  paddingBottom: "[18px]",
  overflow: "auto",
  backgroundColor: "layer-1",
  boxShadow: "emphasized",
});

export const docsMobileNavHeader = style({
  position: "sticky",
  top: 0,
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 56,
  backgroundColor: "layer-1",
});

export const docsMobileNavTitle = style({
  color: "neutral",
  font: "title",
});

export const docsLayoutRoot = style({
  "--comparison-docs-layout-macro": {
    type: "opacity",
    value: 1,
  },
  display: "flex",
  alignItems: "stretch",
  gap: 0,
  width: "[min(1440px, 100%)]",
  marginX: "auto",
  marginTop: 12,
  paddingX: 12,
  paddingBottom: 0,
  "@media (max-width: 860px)": {
    display: "grid",
    gridTemplateColumns: "[1fr]",
    gap: 12,
    marginTop: 0,
    paddingX: 0,
    paddingBottom: 0,
  },
});

export const docsSidebarRail = style({
  flexShrink: 0,
  width: "[224px]",
  position: "sticky",
  top: 40,
  alignSelf: "start",
  maxHeight: "[calc(100vh - 72px)]",
  paddingX: 12,
  boxSizing: "border-box",
  overflow: "auto",
  "@media (max-width: 860px)": {
    position: "static",
    width: "auto",
    maxHeight: "none",
    paddingX: "[18px]",
    paddingY: 12,
  },
});

export const docsTocRail = style({
  flexShrink: 0,
  width: "[180px]",
  position: "sticky",
  top: 0,
  display: "flex",
  flexDirection: "column",
  alignContent: "start",
  gap: 8,
  maxHeight: "[calc(100vh - 72px)]",
  marginBottom: "[-40px]",
  paddingTop: 32,
  overflow: "auto",
  color: "neutral-subdued",
  font: "ui-sm",
  "@media (max-width: 1180px)": {
    display: "none",
  },
});

export const docsMainContent = style({
  display: "flex",
  justifyContent: "space-between",
  columnGap: 40,
  flexGrow: 1,
  minWidth: 0,
  height: "[calc(100vh - 72px)]",
  padding: 40,
  position: "relative",
  overflow: "auto",
  backgroundColor: "base",
  borderRadius: "xl",
  borderBottomRadius: "none",
  boxShadow: "emphasized",
  scrollPaddingTop: 32,
  "@media (max-width: 860px)": {
    display: "grid",
    height: "auto",
    minHeight: "[calc(100vh - 56px)]",
    padding: 18,
    borderRadius: "none",
    boxShadow: "none",
  },
});

export const docsArticleColumn = style({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  minWidth: 0,
  width: "full",
});

export const docsArticleContent = style({
  "--text-width": {
    type: "length",
    value: "768px",
  },
  display: "grid",
  gap: "[34px]",
  flexGrow: 1,
  width: "full",
  maxWidth: "[768px]",
  marginX: "auto",
});

export const docsFooterRoot = style({
  display: "grid",
  gap: 16,
  width: "full",
  maxWidth: "[768px]",
  marginX: "auto",
  marginTop: 32,
  paddingY: 12,
  color: "neutral-subdued",
  font: "ui-sm",
});

export const docsFooterList = style({
  display: "flex",
  justifyContent: "end",
  flexWrap: "wrap",
  gap: 12,
  paddingX: 12,
  margin: 0,
  listStyleType: "none",
});

export const docsFooterLink = style({
  color: {
    default: "neutral-subdued",
    ":hover": "accent",
  },
  textDecoration: "none",
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
  gap: 0,
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
    default: 24,
    ":first-child": 0,
  },
  marginBottom: 8,
  color: "neutral",
  font: "title",
});

export const docsNavLink = style({
  display: "inline-flex",
  alignItems: "center",
  minHeight: 32,
  paddingX: 4,
  color: {
    default: "neutral",
    ":hover": "neutral",
  },
  textDecoration: "none",
});

export const docsNavLinkCurrent = style({
  color: "neutral",
  fontWeight: "bold",
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
  borderColor: "gray-300",
});

export const docsNavGroupLinks = style({
  display: "grid",
  gap: "[1px]",
});

export const docsNavGroupLink = style({
  paddingStart: 4,
});

export const docsNavGroupSummary = style({
  display: "grid",
  gridTemplateColumns: "[minmax(0, 1fr) auto 12px]",
  alignItems: "center",
  gap: 8,
  minHeight: 32,
  paddingY: 4,
  paddingX: 4,
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
  borderColor: "gray-300",
});

export const docsNavCountFallback = style({
  minWidth: 24,
  paddingX: "[6px]",
  paddingY: "[1px]",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "gray-300",
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
  marginBottom: 0,
  minHeight: 32,
  paddingX: 12,
  color: "neutral",
  font: "title",
});

export const docsTocLink = style({
  display: "inline-flex",
  alignItems: "center",
  minHeight: 32,
  paddingX: 4,
  color: {
    default: "neutral-subdued",
    ":hover": "accent",
  },
  textDecoration: "none",
});

export const docsTocActions = style({
  display: "grid",
  gap: 8,
  marginTop: 12,
});
