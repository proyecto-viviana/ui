export { mergeProps } from "./mergeProps";
export { splitProps } from "./splitProps";
export { assignRef, followRef, type RefLike } from "./refs";
export { useContextOptional, onOwnedCleanup } from "./owner";
export { filterDOMProps, type FilterDOMPropsOptions } from "./filterDOMProps";
export { attachCaptureListeners, bindCapture, captureRef, type CaptureListeners } from "./capture";

export { access, isAccessor, type MaybeAccessor, type MaybeAccessorValue } from "./reactivity";
export {
  ariaTrueFalse,
  attrTrue,
  attrString,
  isAriaTrue,
  coerceDomBoolean,
  coerceDomRecord,
  canonicalAttrKey,
} from "./domAttrs";

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
  isTabbable,
  isElementVisible,
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
  getActiveElement,
  getFocusableTreeWalker,
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
export { isCtrlKeyPressed } from "./keyboard";

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

export { createEnterAnimation, createExitAnimation, type ElementAccessor } from "./animation";
