import "@testing-library/jest-dom/vitest";
import { vi, afterEach } from "vite-plus/test";

// ============================================
// POLYFILLS
// These must be defined before any test imports
// to ensure proper handler registration
// ============================================

/**
 * PointerEvent polyfill for JSDOM
 *
 * JSDOM doesn't implement PointerEvent, but our code checks
 * `typeof PointerEvent !== 'undefined'` to decide whether to
 * register pointer handlers or mouse handlers.
 *
 * Without this polyfill:
 * - PointerEvent is undefined at module load time
 * - We register mouse handlers instead of pointer handlers
 * - user.pointer() fires pointer events (testing-library implements them)
 * - Pointer events have no handlers → fall through to click → 'virtual'
 *
 * This matches React-Spectrum's test setup approach.
 */
class FakePointerEvent extends MouseEvent {
  private _init: PointerEventInit & { pageX?: number; pageY?: number };

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this._init = init;
  }

  get pointerType(): string {
    return this._init.pointerType ?? "mouse";
  }

  get pointerId(): number {
    return this._init.pointerId ?? 0;
  }

  get pageX(): number {
    return this._init.pageX ?? 0;
  }

  get pageY(): number {
    return this._init.pageY ?? 0;
  }

  get width(): number {
    return this._init.width ?? 1;
  }

  get height(): number {
    return this._init.height ?? 1;
  }

  get detail(): number {
    return this._init.detail ?? 1;
  }

  get pressure(): number {
    if (this._init.pressure !== undefined) {
      return this._init.pressure;
    }
    return this.pointerType === "mouse" ? 0.5 : 0;
  }

  get tiltX(): number {
    return this._init.tiltX ?? 0;
  }

  get tiltY(): number {
    return this._init.tiltY ?? 0;
  }

  get twist(): number {
    return this._init.twist ?? 0;
  }

  get isPrimary(): boolean {
    return this._init.isPrimary ?? true;
  }
}

// @ts-expect-error - Extending global with PointerEvent
globalThis.PointerEvent = FakePointerEvent;

/**
 * ResizeObserver polyfill for JSDOM
 *
 * Required for components that observe element size changes
 * (virtualizers, responsive components, etc.)
 */
class FakeResizeObserver implements ResizeObserver {
  private callback: ResizeObserverCallback;
  private static instances: FakeResizeObserver[] = [];

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    FakeResizeObserver.instances.push(this);
  }

  observe(_target: Element, _options?: ResizeObserverOptions): void {
    // No-op in tests - use trigger() to simulate resize
  }

  unobserve(_target: Element): void {
    // No-op
  }

  disconnect(): void {
    const index = FakeResizeObserver.instances.indexOf(this);
    if (index > -1) {
      FakeResizeObserver.instances.splice(index, 1);
    }
  }

  /**
   * Test helper: Trigger resize callback with custom entries
   */
  trigger(entries: ResizeObserverEntry[]): void {
    this.callback(entries, this);
  }

  /**
   * Test helper: Get all active ResizeObserver instances
   */
  static getInstances(): FakeResizeObserver[] {
    return FakeResizeObserver.instances;
  }

  /**
   * Test helper: Clear all instances
   */
  static clearInstances(): void {
    FakeResizeObserver.instances = [];
  }
}

globalThis.ResizeObserver = FakeResizeObserver;

/**
 * IntersectionObserver polyfill for JSDOM
 *
 * Required for components that use intersection observation
 * (lazy loading, virtualization, visibility tracking)
 */
class FakeIntersectionObserver implements IntersectionObserver {
  private callback: IntersectionObserverCallback;
  private static instances: FakeIntersectionObserver[] = [];

  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "0px";
  readonly thresholds: ReadonlyArray<number> = [0];

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    if (options?.root) this.root = options.root;
    if (options?.rootMargin) this.rootMargin = options.rootMargin;
    if (options?.threshold) {
      this.thresholds = Array.isArray(options.threshold) ? options.threshold : [options.threshold];
    }
    FakeIntersectionObserver.instances.push(this);
  }

  observe(_target: Element): void {
    // No-op in tests - use trigger() to simulate intersection
  }

  unobserve(_target: Element): void {
    // No-op
  }

  disconnect(): void {
    const index = FakeIntersectionObserver.instances.indexOf(this);
    if (index > -1) {
      FakeIntersectionObserver.instances.splice(index, 1);
    }
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  /**
   * Test helper: Trigger intersection callback with custom entries
   */
  trigger(entries: IntersectionObserverEntry[]): void {
    this.callback(entries, this);
  }

  /**
   * Test helper: Get all active IntersectionObserver instances
   */
  static getInstances(): FakeIntersectionObserver[] {
    return FakeIntersectionObserver.instances;
  }

  /**
   * Test helper: Clear all instances
   */
  static clearInstances(): void {
    FakeIntersectionObserver.instances = [];
  }
}

globalThis.IntersectionObserver = FakeIntersectionObserver;

// ============================================
// GLOBAL MOCKS
// ============================================

/**
 * matchMedia mock for responsive/theme tests
 */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated but still used
    removeListener: vi.fn(), // Deprecated but still used
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

/**
 * scrollIntoView mock
 */
Element.prototype.scrollIntoView = vi.fn();

/**
 * scrollTo mock
 */
window.scrollTo = vi.fn();

// ============================================
// CLEANUP
// ============================================

afterEach(() => {
  vi.clearAllMocks();
  FakeResizeObserver.clearInstances();
  FakeIntersectionObserver.clearInstances();
});
