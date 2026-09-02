/**
 * @proyecto-viviana/solidaria test utilities
 *
 * Utilities for testing accessible SolidJS components built with solidaria.
 * Provides helpers for simulating user interactions, querying ARIA attributes,
 * and asserting accessibility patterns.
 */

export {
  // Pointer event utilities
  pointerMap,
  createPointerEvent,
  pointerEvent,
  firePointerDown,
  firePointerUp,
  firePointerClick,
  type PointerMapEntry,
  type PointerEventOptions,
} from "./pointer";

export {
  // User interaction utilities
  setupUser,
  press,
  longPress,
  hover,
  type UserEventInstance,
  type PressOptions,
  type LongPressOptions,
  type HoverOptions,
} from "./interactions";

export {
  // ARIA testing utilities
  getAriaRole,
  hasAriaLabel,
  getAriaLabel,
  getAriaDescribedBy,
  getAriaLabelledBy,
  isAriaDisabled,
  isAriaExpanded,
  isAriaPressed,
  isAriaChecked,
  isAriaSelected,
  isAriaRequired,
  isAriaInvalid,
  isAriaHidden,
  isAriaBusy,
  getAriaControls,
  getAriaOwns,
  getAriaActiveDescendant,
  getAriaValueNow,
  getAriaValueMin,
  getAriaValueMax,
  getAriaValueText,
  getAriaLevel,
  getAriaSetSize,
  getAriaPosInSet,
  type AriaState,
} from "./aria";

export {
  // Focus testing utilities
  getFocusedElement,
  isFocused,
  isFocusWithin,
  getFocusableElements,
  getTabbableElements,
  simulateFocusVisible,
  waitForFocus,
  type FocusableSelector,
} from "./focus";

export {
  // Test setup utilities
  installPointerEventPolyfill,
  installResizeObserverPolyfill,
  installIntersectionObserverPolyfill,
  setupTestEnvironment,
  cleanupTestEnvironment,
} from "./setup";

export { hydrateOverSsr } from "./hydrate";

export {
  // axe-core a11y testing (INFRA-1)
  checkA11y,
  assertNoA11yViolations,
  type CheckA11yOptions,
  type CheckA11yResult,
} from "./axe";

export {
  // ARIA ID integrity checker (INFRA-3)
  checkAriaIdIntegrity,
  assertAriaIdIntegrity,
  type DanglingRef,
  type AriaIdIntegrityResult,
} from "./aria-id-integrity";

export {
  // Live region monitor (INFRA-4)
  createLiveRegionMonitor,
  expectAnnouncement,
  type Announcement,
  type LiveRegionMonitor,
} from "./live-region-monitor";

export {
  // Focus flow recorder (INFRA-5)
  createFocusFlowRecorder,
  expectFocusOrder,
  expectFocusRestore,
  type FocusRecord,
  type FocusFlowRecorder,
} from "./focus-flow";
