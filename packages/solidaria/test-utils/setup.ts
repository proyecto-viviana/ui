/**
 * Test environment setup utilities
 *
 * Polyfills and setup helpers for testing solidaria components.
 */

/**
 * Install PointerEvent polyfill for jsdom.
 * jsdom doesn't support PointerEvent by default.
 */
export function installPointerEventPolyfill(): void {
  if (typeof window === "undefined") return;

  // Check if PointerEvent is already properly implemented
  if (typeof window.PointerEvent === "function") {
    try {
      // Test if it works
      new window.PointerEvent("pointerdown");
      return;
    } catch {
      // Fall through to install polyfill
    }
  }

  // Create a fake PointerEvent class
  class FakePointerEvent extends MouseEvent {
    readonly pointerId: number;
    readonly width: number;
    readonly height: number;
    readonly pressure: number;
    readonly tangentialPressure: number;
    readonly tiltX: number;
    readonly tiltY: number;
    readonly twist: number;
    readonly pointerType: string;
    readonly isPrimary: boolean;

    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 0;
      this.width = params.width ?? 1;
      this.height = params.height ?? 1;
      this.pressure = params.pressure ?? 0;
      this.tangentialPressure = params.tangentialPressure ?? 0;
      this.tiltX = params.tiltX ?? 0;
      this.tiltY = params.tiltY ?? 0;
      this.twist = params.twist ?? 0;
      this.pointerType = params.pointerType ?? "";
      this.isPrimary = params.isPrimary ?? false;
    }

    getCoalescedEvents(): PointerEvent[] {
      return [];
    }

    getPredictedEvents(): PointerEvent[] {
      return [];
    }
  }

  // @ts-ignore - Replacing global PointerEvent
  window.PointerEvent = FakePointerEvent;
}

/**
 * Install ResizeObserver polyfill for jsdom.
 */
export function installResizeObserverPolyfill(): void {
  if (typeof window === "undefined") return;
  if (typeof window.ResizeObserver === "function") return;

  class FakeResizeObserver {
    private callback: ResizeObserverCallback;
    private observedElements: Set<Element> = new Set();

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    observe(target: Element): void {
      this.observedElements.add(target);
    }

    unobserve(target: Element): void {
      this.observedElements.delete(target);
    }

    disconnect(): void {
      this.observedElements.clear();
    }
  }

  // @ts-ignore jsdom has no ResizeObserver; tests install this stub.
  window.ResizeObserver = FakeResizeObserver;
}

/**
 * Install IntersectionObserver polyfill for jsdom.
 */
export function installIntersectionObserverPolyfill(): void {
  if (typeof window === "undefined") return;
  if (typeof window.IntersectionObserver === "function") return;

  class FakeIntersectionObserver {
    readonly root: Element | Document | null;
    readonly rootMargin: string;
    readonly scrollMargin: string;
    readonly thresholds: ReadonlyArray<number>;
    private callback: IntersectionObserverCallback;
    private observedElements: Set<Element> = new Set();

    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      this.callback = callback;
      this.root = options?.root ?? null;
      this.rootMargin = options?.rootMargin ?? "0px";
      this.scrollMargin = "0px";
      this.thresholds = Array.isArray(options?.threshold)
        ? options.threshold
        : [options?.threshold ?? 0];
    }

    observe(target: Element): void {
      this.observedElements.add(target);
      // Immediately report as intersecting (visible)
      const entry: IntersectionObserverEntry = {
        boundingClientRect: target.getBoundingClientRect(),
        intersectionRatio: 1,
        intersectionRect: target.getBoundingClientRect(),
        isIntersecting: true,
        rootBounds: null,
        target,
        time: Date.now(),
      };
      this.callback([entry], this);
    }

    unobserve(target: Element): void {
      this.observedElements.delete(target);
    }

    disconnect(): void {
      this.observedElements.clear();
    }

    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  // @ts-ignore jsdom has no IntersectionObserver; tests install this stub.
  window.IntersectionObserver = FakeIntersectionObserver;
}

/**
 * Install matchMedia mock for jsdom.
 */
export function installMatchMediaMock(): void {
  if (typeof window === "undefined") return;
  if (typeof window.matchMedia === "function") {
    try {
      window.matchMedia("(min-width: 0px)");
      return;
    } catch {
      // Fall through to install mock
    }
  }

  window.matchMedia = (query: string): MediaQueryList => {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    };
  };
}

/**
 * Install scrollIntoView mock for jsdom.
 */
export function installScrollIntoViewMock(): void {
  if (typeof window === "undefined") return;
  if (typeof Element.prototype.scrollIntoView === "function") return;

  Element.prototype.scrollIntoView = function () {
    // No-op in tests
  };
}

/**
 * Install scroll methods mock for jsdom.
 */
export function installScrollMock(): void {
  if (typeof window === "undefined") return;

  if (typeof window.scrollTo !== "function") {
    window.scrollTo = () => {};
  }

  if (typeof Element.prototype.scroll !== "function") {
    Element.prototype.scroll = function () {};
  }

  if (typeof Element.prototype.scrollTo !== "function") {
    Element.prototype.scrollTo = function () {};
  }
}

/**
 * Install all recommended polyfills and mocks for testing.
 *
 * @example
 * ```ts
 * // In vitest.setup.ts
 * import { setupTestEnvironment } from '@proyecto-viviana/solidaria/test-utils';
 *
 * setupTestEnvironment();
 * ```
 */
export function setupTestEnvironment(): void {
  installPointerEventPolyfill();
  installResizeObserverPolyfill();
  installIntersectionObserverPolyfill();
  installMatchMediaMock();
  installScrollIntoViewMock();
  installScrollMock();
}

/**
 * Cleanup function to reset any global state after tests.
 */
export function cleanupTestEnvironment(): void {
  // Reset any focus
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  // Clear any lingering timeouts/intervals might be needed
  // This is a placeholder for any cleanup needed
}

/**
 * Create a mock for window.getComputedStyle that returns
 * controllable values.
 */
export function createComputedStyleMock(
  styles: Partial<CSSStyleDeclaration> = {},
): typeof window.getComputedStyle {
  const originalGetComputedStyle = window.getComputedStyle;

  return (element: Element, pseudoElt?: string | null) => {
    const original = originalGetComputedStyle(element, pseudoElt);
    return new Proxy(original, {
      get(target, prop) {
        if (prop in styles) {
          return styles[prop as keyof CSSStyleDeclaration];
        }
        return target[prop as keyof CSSStyleDeclaration];
      },
    });
  };
}

/**
 * Utility to mock prefers-reduced-motion media query.
 */
export function mockPrefersReducedMotion(prefers: boolean): () => void {
  const originalMatchMedia = window.matchMedia;

  window.matchMedia = (query: string): MediaQueryList => {
    if (query === "(prefers-reduced-motion: reduce)") {
      return {
        matches: prefers,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      };
    }
    return originalMatchMedia(query);
  };

  return () => {
    window.matchMedia = originalMatchMedia;
  };
}

/**
 * Utility to mock prefers-color-scheme media query.
 */
export function mockPrefersColorScheme(scheme: "light" | "dark"): () => void {
  const originalMatchMedia = window.matchMedia;

  window.matchMedia = (query: string): MediaQueryList => {
    const isDark = query === "(prefers-color-scheme: dark)";
    const isLight = query === "(prefers-color-scheme: light)";

    if (isDark || isLight) {
      return {
        matches: scheme === "dark" ? isDark : isLight,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      };
    }
    return originalMatchMedia(query);
  };

  return () => {
    window.matchMedia = originalMatchMedia;
  };
}

/**
 * Wait for a condition to be true.
 */
export function waitFor(
  condition: () => boolean,
  options: { timeout?: number; interval?: number } = {},
): Promise<void> {
  const { timeout = 1000, interval = 50 } = options;

  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      if (condition()) {
        resolve();
        return;
      }

      if (Date.now() - startTime >= timeout) {
        reject(new Error("Timeout waiting for condition"));
        return;
      }

      setTimeout(check, interval);
    };

    check();
  });
}

/**
 * Wait for the next animation frame.
 */
export function waitForAnimationFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

/**
 * Wait for a specified number of milliseconds.
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
