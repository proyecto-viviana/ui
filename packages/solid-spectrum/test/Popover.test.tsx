/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { Button } from "../src/button";
import { Popover, PopoverTrigger } from "../src/popover";
import { style } from "../src/style";

function mockGetAnimations(impl: () => Animation[]): () => void {
  const previousCssTransition = (globalThis as { CSSTransition?: unknown }).CSSTransition;
  if (typeof CSSTransition === "undefined") {
    (globalThis as { CSSTransition?: unknown }).CSSTransition = class CSSTransition {};
  }
  const previous = Object.getOwnPropertyDescriptor(Element.prototype, "getAnimations");
  Object.defineProperty(Element.prototype, "getAnimations", {
    configurable: true,
    writable: true,
    value: impl,
  });
  return () => {
    if (previous) {
      Object.defineProperty(Element.prototype, "getAnimations", previous);
    } else {
      delete (Element.prototype as { getAnimations?: unknown }).getAnimations;
    }
    if (previousCssTransition === undefined) {
      delete (globalThis as { CSSTransition?: unknown }).CSSTransition;
    }
  };
}

afterEach(() => cleanup());

const popoverMotion = style<{
  isEntering?: boolean;
  isExiting?: boolean;
  placement?: "top" | "bottom" | "left" | "right";
}>({
  opacity: {
    isEntering: 0,
    isExiting: 0,
  },
  translateY: {
    placement: {
      top: {
        isEntering: 4,
        isExiting: 4,
      },
      bottom: {
        isEntering: -4,
        isExiting: -4,
      },
    },
  },
  translateX: {
    placement: {
      left: {
        isEntering: 4,
        isExiting: 4,
      },
      right: {
        isEntering: -4,
        isExiting: -4,
      },
    },
  },
  transition: "[opacity, translate]",
  transitionDuration: 200,
  transitionTimingFunction: {
    isExiting: "in",
  },
  pointerEvents: {
    isExiting: "none",
  },
});

function classTokens(className: string): string[] {
  return className.split(/\s+/).filter(Boolean);
}

describe("Popover (solid-spectrum)", () => {
  it("generates distinct entering, settled, and exiting classes from the S2 motion tokens", async () => {
    let resolveCurrent!: () => void;
    let currentFinished = new Promise<void>((resolve) => {
      resolveCurrent = resolve;
    });
    const restore = mockGetAnimations(
      () => [{ finished: currentFinished }] as unknown as Animation[],
    );

    try {
      const user = setupUser();
      render(() => (
        <PopoverTrigger>
          <Button>Open</Button>
          <Popover hideArrow>
            <p>Popover content</p>
          </Popover>
        </PopoverTrigger>
      ));

      await user.click(screen.getByRole("button", { name: "Open" }));
      const popover = screen.getByRole("dialog");
      expect(popover).toHaveAttribute("data-entering");
      await waitFor(() => expect(popover.getAttribute("data-placement")).toBeTruthy());

      const enteringClass = popover.className;
      const enteringMotion = popoverMotion({
        isEntering: true,
        isExiting: false,
        placement: "bottom",
      });
      const settledMotion = popoverMotion({
        isEntering: false,
        isExiting: false,
        placement: "bottom",
      });
      const exitingMotion = popoverMotion({
        isEntering: false,
        isExiting: true,
        placement: "bottom",
      });
      expect(enteringMotion).not.toBe(settledMotion);
      expect(exitingMotion).not.toBe(settledMotion);
      expect(classTokens(enteringMotion).length).toBeGreaterThan(0);

      const finishEnter = resolveCurrent;
      currentFinished = new Promise<void>((resolve) => {
        resolveCurrent = resolve;
      });
      finishEnter();
      await waitFor(() => expect(popover).not.toHaveAttribute("data-entering"));

      const settledClass = popover.className;
      expect(settledClass).not.toBe(enteringClass);

      await user.keyboard("{Escape}");
      expect(popover).toHaveAttribute("data-exiting");

      const exitingClass = popover.className;
      expect(exitingClass).not.toBe(settledClass);
      expect(exitingClass).not.toBe(enteringClass);
    } finally {
      restore();
    }
  });
});
