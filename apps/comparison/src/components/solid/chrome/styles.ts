import {
  focusRing,
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
  gridTemplateColumns: {
    default: "[1fr auto 1fr]",
    "@media (max-width: 860px)": "[1fr auto auto]",
  },
  alignItems: "center",
  gap: 12,
  width: {
    default: "[calc(100% - 24px)]",
    "@media (max-width: 860px)": "full",
  },
  maxWidth: "[1416px]",
  height: {
    "@media (max-width: 860px)": "auto",
  },
  minHeight: {
    default: 48,
    "@media (max-width: 860px)": 56,
  },
  marginX: "auto",
  marginTop: {
    default: 12,
    "@media (max-width: 860px)": 0,
  },
  paddingX: 0,
  padding: {
    "@media (max-width: 860px)": 12,
  },
  borderBottomWidth: 0,
  backgroundColor: "transparent",
  isolation: "isolate",
});

export const docsBrandLink = style({
  display: "inline-flex",
  alignItems: "center",
  justifySelf: "start",
  gap: "[10px]",
  minHeight: 48,
  minWidth: 0,
  marginStart: {
    default: "[26px]",
    "@media (max-width: 860px)": 0,
  },
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

export const docsBrandText = style({
  display: {
    default: "inline",
    "@media (max-width: 860px)": "none",
  },
});

export const docsSearchRoot = style({
  display: {
    default: "grid",
    "@media (max-width: 860px)": "none",
  },
  gridTemplateColumns: "[minmax(0, 1fr)]",
  alignItems: "center",
  justifySelf: "center",
  width: "[min(500px, 36vw)]",
  maxWidth: "[500px]",
  minWidth: "[240px]",
});

export const docsSearchButton = style({
  display: {
    default: "flex",
    "@media (max-width: 860px)": "none",
  },
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
  display: {
    "@media (max-width: 860px)": "none",
  },
});

export const docsSearchOverlay = style({
  position: "fixed",
  inset: 0,
  zIndex: 120,
  display: "grid",
  justifyItems: "center",
  alignItems: "start",
  paddingX: {
    default: 16,
    "@media (max-width: 860px)": 12,
  },
  paddingTop: {
    default: "[96px]",
    "@media (max-width: 860px)": "[72px]",
  },
  backgroundColor: "transparent-overlay-500",
});

export const docsSearchDialog = style({
  display: "grid",
  gap: 12,
  width: {
    default: "[min(640px, calc(100vw - 32px))]",
    "@media (max-width: 860px)": "[calc(100vw - 24px)]",
  },
  maxHeight: {
    default: "[calc(100dvh - 128px)]",
    "@media (max-width: 860px)": "[calc(100dvh - 96px)]",
  },
  padding: 12,
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "gray-200",
  borderRadius: "xl",
  backgroundColor: "layer-1",
  boxShadow: "emphasized",
  color: "neutral",
  overflow: "hidden",
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
  display: {
    default: "none",
    "@media (max-width: 860px)": "inline-flex",
  },
});

export const docsMobileTocRoot = style({
  "--comparison-docs-mobile-toc-macro": {
    type: "opacity",
    value: 1,
  },
  position: {
    "@media (max-width: 860px)": "absolute",
  },
  left: {
    "@media (max-width: 860px)": "[50%]",
  },
  zIndex: {
    "@media (max-width: 860px)": 1,
  },
  display: {
    default: "none",
    "@media (max-width: 860px)": "block",
  },
  width: {
    "@media (max-width: 860px)": "[min(210px, calc(100vw - 176px))]",
  },
  minWidth: {
    "@media (max-width: 860px)": 0,
  },
  transform: {
    "@media (max-width: 860px)": "translateX(-50%)",
  },
});

export const docsMobileTocPicker = style({
  width: "full",
  minWidth: 0,
});

export const docsMobileNavOverlay = style({
  position: "fixed",
  inset: 0,
  zIndex: 100,
  backgroundColor: "transparent-overlay-500",
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
  display: {
    default: "flex",
    "@media (max-width: 860px)": "grid",
  },
  alignItems: "stretch",
  gridTemplateColumns: {
    "@media (max-width: 860px)": "[1fr]",
  },
  gap: {
    default: 0,
    "@media (max-width: 860px)": 12,
  },
  width: "[min(1440px, 100%)]",
  marginX: "auto",
  marginTop: {
    default: 12,
    "@media (max-width: 860px)": 0,
  },
  paddingX: {
    default: 12,
    "@media (max-width: 860px)": 0,
  },
  paddingBottom: 0,
});

export const docsSidebarRail = style({
  display: {
    default: "block",
    "@media (max-width: 860px)": "none",
  },
  flexShrink: 0,
  width: {
    default: "[224px]",
    "@media (max-width: 860px)": "auto",
  },
  position: {
    default: "sticky",
    "@media (max-width: 860px)": "static",
  },
  top: 40,
  alignSelf: "start",
  maxHeight: {
    default: "[calc(100vh - 72px)]",
    "@media (max-width: 860px)": "none",
  },
  paddingX: {
    default: 12,
    "@media (max-width: 860px)": "[18px]",
  },
  paddingY: {
    "@media (max-width: 860px)": 12,
  },
  boxSizing: "border-box",
  overflow: "auto",
});

export const docsTocRail = style({
  "--comparison-docs-toc-rail-macro": {
    type: "opacity",
    value: 1,
  },
  flexShrink: 0,
  width: "[180px]",
  position: "sticky",
  top: 0,
  display: {
    default: "flex",
    "@media (max-width: 1180px)": "none",
  },
  flexDirection: "column",
  boxSizing: "border-box",
  alignContent: "start",
  maxHeight: "[calc(100vh - 72px)]",
  marginBottom: "[-40px]",
  paddingTop: 32,
  overflow: "hidden",
  color: "neutral-subdued",
});

export const docsMainContent = style({
  "--comparison-docs-main-macro": {
    type: "opacity",
    value: 1,
  },
  display: {
    default: "flex",
    "@media (max-width: 860px)": "grid",
  },
  justifyContent: "space-between",
  columnGap: 40,
  flexGrow: 1,
  minWidth: 0,
  height: {
    default: "[calc(100vh - 72px)]",
    "@media (max-width: 860px)": "auto",
  },
  minHeight: {
    "@media (max-width: 860px)": "[calc(100vh - 56px)]",
  },
  padding: {
    default: 40,
    "@media (max-width: 860px)": 12,
  },
  position: "relative",
  overflow: "auto",
  backgroundColor: "base",
  borderRadius: {
    default: "xl",
    "@media (max-width: 860px)": "none",
  },
  borderBottomRadius: "none",
  boxShadow: {
    default: "emphasized",
    "@media (max-width: 860px)": "none",
  },
  scrollPaddingTop: 32,
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
  font: "body-2xs",
});

export const docsFooterDivider = style({
  width: "full",
  height: 1,
  margin: 0,
  borderWidth: 0,
  borderRadius: "full",
  backgroundColor: "gray-300",
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

export const docsTocMount = style({
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  maxHeight: "full",
  height: "full",
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
  minWidth: 0,
  gridAutoFlow: {
    "@media (max-width: 860px)": "row",
  },
  gridAutoColumns: {
    "@media (max-width: 860px)": "auto",
  },
  maxHeight: {
    "@media (max-width: 860px)": 280,
  },
  overflow: {
    "@media (max-width: 860px)": "auto",
  },
});

export const docsNavSection = style({
  display: "grid",
  minWidth: "[185px]",
});

export const docsNavSectionSummary = style({
  display: "flex",
  alignItems: "center",
  minHeight: 32,
  paddingX: 4,
  color: "neutral",
  font: "ui",
  fontWeight: "bold",
  cursor: "pointer",
  listStyleType: "none",
});

export const docsNavSectionPanel = style({
  minWidth: 0,
});

export const docsNavSectionPanelInner = style({
  paddingStart: "[18px]",
});

export const docsNavList = style({
  listStyleType: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  width: "full",
  boxSizing: "border-box",
});

export const docsNavItem = style({
  minWidth: 0,
});

export const docsNavLink = style({
  ...focusRing(),
  display: "flex",
  alignItems: "center",
  gap: "[6px]",
  width: "full",
  boxSizing: "border-box",
  minHeight: 32,
  paddingX: 4,
  borderRadius: "default",
  color: {
    default: "neutral",
    ":hover": "neutral",
  },
  font: "ui",
  fontWeight: "normal",
  textDecoration: "none",
  transition: "default",
});

export const docsNavLinkCurrent = style({
  color: "neutral",
  fontWeight: "bold",
});

export const docsNavLinkText = style({
  minWidth: 0,
  truncate: true,
});

export const docsNavIndicator = style({
  width: 2,
  height: "[1lh]",
  flexShrink: 0,
  borderRadius: "full",
  backgroundColor: "transparent",
  transition: "default",
});

export const docsNavIndicatorCurrent = style({
  backgroundColor: "gray-800",
});

export const docsTocRoot = style({
  "--comparison-docs-toc-macro": {
    type: "opacity",
    value: 1,
  },
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  minHeight: 0,
  maxHeight: "full",
});

export const docsTocNav = style({
  minWidth: 0,
});

export const docsTocScroller = style({
  minHeight: 0,
  maxHeight: "full",
  overflowY: "auto",
  flexShrink: 1,
});

export const docsTocList = style({
  display: "flex",
  flexDirection: "column",
  gap: 8,
  width: "full",
  boxSizing: "border-box",
  padding: 0,
  margin: 0,
  listStyleType: "none",
});

export const docsTocListItem = style({
  minWidth: 0,
});

export const docsTocHeading = style({
  display: "flex",
  alignItems: "center",
  flexShrink: 0,
  minHeight: 32,
  paddingX: 12,
  marginBottom: 4,
  color: "neutral",
  font: "title",
});

export const docsTocLink = style({
  display: "flex",
  alignItems: "center",
  gap: "[6px]",
  width: "full",
  boxSizing: "border-box",
  minHeight: 32,
  paddingX: 4,
  borderRadius: "default",
  color: {
    default: "neutral-subdued",
    ":hover": "neutral",
  },
  font: "ui",
  textDecoration: "none",
  scrollMarginTop: 64,
});

export const docsTocLinkCurrent = style({
  color: "neutral",
  fontWeight: "bold",
});

export const docsTocLinkText = style({
  minWidth: 0,
  overflowWrap: "break-word",
  wordBreak: "break-word",
});

export const docsTocIndicator = style({
  width: 2,
  height: "[1lh]",
  flexShrink: 0,
  borderRadius: "full",
  backgroundColor: "transparent",
});

export const docsTocIndicatorCurrent = style({
  backgroundColor: "gray-800",
});

export const docsTocActions = style({
  display: "grid",
  gap: 0,
  flexShrink: 0,
});

export const docsTocDivider = style({
  marginY: 12,
});
