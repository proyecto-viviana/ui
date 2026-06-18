export { mergeProps } from "./mergeProps";
export { filterDOMProps, type FilterDOMPropsOptions } from "./filterDOMProps";

export { access, isAccessor, type MaybeAccessor, type MaybeAccessorValue } from "./reactivity";

export {
  isMac,
  isIPhone,
  isIPad,
  isIOS,
  isAppleDevice,
  isWebKit,
  isChrome,
  isAndroid,
  isFirefox,
} from "./platform";

export {
  getOwnerDocument,
  getOwnerWindow,
  nodeContains,
  getEventTarget,
  isFocusable,
  isValidKeyboardEvent,
  isValidInputKey,
  isHTMLAnchorLink,
  shouldPreventDefaultKeyboard,
  shouldPreventDefaultUp,
  openLink,
  isScrollable,
  getScrollParent,
  getScrollParents,
  willOpenKeyboard,
} from "./dom";

export { scrollIntoView, scrollIntoViewport } from "./scrollIntoView";

export {
  areRectanglesOverlapping,
  getPointClientRect,
  isPointOverTarget,
  getTouchFromEvent,
  getTouchById,
  type Rect,
  type EventPoint,
} from "./geometry";

export {
  isVirtualClick,
  isVirtualPointerEvent,
  createMouseEvent,
  chain,
  setEventTarget,
} from "./events";

export { disableTextSelection, restoreTextSelection } from "./textSelection";

export { focusWithoutScrolling, focusSafely, preventFocus } from "./focus";

export {
  createGlobalListeners,
  addGlobalListenerOnce,
  type GlobalListenerOptions,
} from "./globalListeners";

export { isTestEnv, isDevEnv, isProdEnv } from "./env";

export {
  createDescription,
  type DescriptionProps,
  getDescriptionNodeCount,
  clearDescriptionNodes,
} from "./createDescription";
