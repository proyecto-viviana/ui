/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vite-plus/test";
import { createRoot, createSignal, createEffect } from "solid-js";
import {
  // Basic utilities
  createIsSSR,
  createId,
  canUseDOM,
  // SSR Provider
  SSRProvider,
  // Hydration state
  createHydrationState,
  useIsSSR,
  // Browser-safe utilities
  createBrowserEffect,
  createBrowserValue,
  // Safe DOM access
  getWindow,
  getDocument,
  getOwnerDocument,
  getOwnerWindow,
  getPortalContainer,
} from "../src/ssr";

// ============================================
// BASIC UTILITIES
// ============================================

describe("createIsSSR", () => {
  it("should return false in jsdom (browser environment)", () => {
    // In jsdom, we're simulating a browser environment
    const isSSR = createIsSSR();
    expect(isSSR).toBe(false);
  });
});

describe("canUseDOM", () => {
  it("should be true in jsdom environment", () => {
    expect(canUseDOM).toBe(true);
  });
});

describe("createId", () => {
  it("should generate unique IDs", () => {
    createRoot((dispose) => {
      const id1 = createId();
      const id2 = createId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^solidaria-/);
      expect(id2).toMatch(/^solidaria-/);

      dispose();
    });
  });

  it("should return provided default ID", () => {
    createRoot((dispose) => {
      const customId = "my-custom-id";
      const id = createId(customId);

      expect(id).toBe(customId);

      dispose();
    });
  });

  it("should generate different IDs on each call", () => {
    createRoot((dispose) => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(createId());
      }

      expect(ids.size).toBe(100);

      dispose();
    });
  });
});

// ============================================
// SSR PROVIDER
// ============================================

describe("SSRProvider", () => {
  it("should provide context to children", () => {
    createRoot((dispose) => {
      let capturedId: string | undefined;

      const el = (
        <SSRProvider>
          {(() => {
            capturedId = createId();
            return null;
          })()}
        </SSRProvider>
      );

      expect(capturedId).toBeTruthy();
      expect(capturedId).toMatch(/^solidaria-/);

      dispose();
    });
  });

  it("should support custom prefix", () => {
    createRoot((dispose) => {
      let capturedId: string | undefined;

      const el = (
        <SSRProvider prefix="widget">
          {(() => {
            capturedId = createId();
            return null;
          })()}
        </SSRProvider>
      );

      expect(capturedId).toBeTruthy();
      expect(capturedId).toMatch(/^solidaria-widget-/);

      dispose();
    });
  });

  it("should support nested providers with combined prefixes", () => {
    createRoot((dispose) => {
      let outerId: string | undefined;
      let innerId: string | undefined;

      const el = (
        <SSRProvider prefix="outer">
          {(() => {
            outerId = createId();
            return (
              <SSRProvider prefix="inner">
                {(() => {
                  innerId = createId();
                  return null;
                })()}
              </SSRProvider>
            );
          })()}
        </SSRProvider>
      );

      expect(outerId).toMatch(/^solidaria-outer-/);
      expect(innerId).toMatch(/^solidaria-outer-inner-/);

      dispose();
    });
  });
});

// ============================================
// HYDRATION STATE
// ============================================

describe("createHydrationState", () => {
  it("should return false after mount in browser", async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const isHydrating = createHydrationState();

        // Initially might be true, but after mount should be false
        // In jsdom, onMount runs synchronously within createRoot
        setTimeout(() => {
          expect(isHydrating()).toBe(false);
          dispose();
          resolve();
        }, 0);
      });
    });
  });
});

describe("useIsSSR", () => {
  it("should return false after hydration in browser", async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const isSSR = useIsSSR();

        setTimeout(() => {
          expect(isSSR()).toBe(false);
          dispose();
          resolve();
        }, 0);
      });
    });
  });
});

// ============================================
// BROWSER-SAFE UTILITIES
// ============================================

describe("createBrowserEffect", () => {
  it("should run effect in browser", async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        let effectRan = false;

        createBrowserEffect(() => {
          effectRan = true;
        });

        setTimeout(() => {
          expect(effectRan).toBe(true);
          dispose();
          resolve();
        }, 0);
      });
    });
  });

  it("should support cleanup function", async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        let cleanupRan = false;

        createBrowserEffect(() => {
          return () => {
            cleanupRan = true;
          };
        });

        // Cleanup runs on dispose
        setTimeout(() => {
          dispose();
          expect(cleanupRan).toBe(true);
          resolve();
        }, 0);
      });
    });
  });
});

describe("createBrowserValue", () => {
  it("should compute value in browser after mount", async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const value = createBrowserValue(() => 42, 0);

        // Initially returns fallback
        expect(value()).toBe(0);

        // After mount, returns computed value
        setTimeout(() => {
          expect(value()).toBe(42);
          dispose();
          resolve();
        }, 0);
      });
    });
  });

  it("should return fallback value initially", () => {
    createRoot((dispose) => {
      const value = createBrowserValue(() => "computed", "fallback");

      // Before mount
      expect(value()).toBe("fallback");

      dispose();
    });
  });

  it("should work with window properties", async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const width = createBrowserValue(() => window.innerWidth, 0);

        setTimeout(() => {
          expect(typeof width()).toBe("number");
          expect(width()).toBeGreaterThan(0);
          dispose();
          resolve();
        }, 0);
      });
    });
  });
});

// ============================================
// SAFE DOM ACCESS
// ============================================

describe("getWindow", () => {
  it("should return window in browser", () => {
    const win = getWindow();
    expect(win).toBe(window);
  });
});

describe("getDocument", () => {
  it("should return document in browser", () => {
    const doc = getDocument();
    expect(doc).toBe(document);
  });
});

describe("getOwnerDocument", () => {
  it("should return document for element", () => {
    const element = document.createElement("div");
    document.body.appendChild(element);

    const doc = getOwnerDocument(element);
    expect(doc).toBe(document);

    element.remove();
  });

  it("should return document for null element", () => {
    const doc = getOwnerDocument(null);
    expect(doc).toBe(document);
  });

  it("should return document for undefined element", () => {
    const doc = getOwnerDocument(undefined);
    expect(doc).toBe(document);
  });
});

describe("getOwnerWindow", () => {
  it("should return window for element", () => {
    const element = document.createElement("div");
    document.body.appendChild(element);

    const win = getOwnerWindow(element);
    expect(win).toBe(window);

    element.remove();
  });

  it("should return window for null element", () => {
    const win = getOwnerWindow(null);
    expect(win).toBe(window);
  });
});

describe("getPortalContainer", () => {
  it("should return custom container if provided", () => {
    const container = document.createElement("div");
    const result = getPortalContainer(container);

    expect(result).toBe(container);
  });

  it("should return document.body if no container provided", () => {
    const result = getPortalContainer();
    expect(result).toBe(document.body);
  });
});

// ============================================
// INTEGRATION TESTS
// ============================================

describe("SSR Integration", () => {
  it("should work with SolidJS components", () => {
    createRoot((dispose) => {
      let labelId: string | undefined;
      let inputId: string | undefined;

      function TextField() {
        labelId = createId();
        inputId = createId();
        return null;
      }

      const el = (
        <SSRProvider>
          <TextField />
        </SSRProvider>
      );

      expect(labelId).toBeTruthy();
      expect(inputId).toBeTruthy();
      expect(labelId).not.toBe(inputId);

      dispose();
    });
  });

  it("should handle multiple SSR providers in parallel", () => {
    createRoot((dispose) => {
      let widget1Id: string | undefined;
      let widget2Id: string | undefined;

      const el = (
        <>
          <SSRProvider prefix="widget1">
            {(() => {
              widget1Id = createId();
              return null;
            })()}
          </SSRProvider>
          <SSRProvider prefix="widget2">
            {(() => {
              widget2Id = createId();
              return null;
            })()}
          </SSRProvider>
        </>
      );

      expect(widget1Id).toMatch(/widget1/);
      expect(widget2Id).toMatch(/widget2/);
      expect(widget1Id).not.toBe(widget2Id);

      dispose();
    });
  });
});
