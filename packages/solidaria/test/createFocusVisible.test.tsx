/**
 * createFocusVisible tests - Port of React Aria's useFocusVisible.test.js
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vite-plus/test";
import { render, screen, cleanup, fireEvent, waitFor } from "@solidjs/testing-library";
import { createFocusRing } from "../src/interactions/createFocusRing";
import {
  addWindowFocusTracking,
  createFocusVisible,
  createFocusVisibleListener,
  hasSetupGlobalListeners,
} from "../src/interactions/createInteractionModality";
import { createButton } from "../src/button";
import { mergeProps } from "../src/utils/mergeProps";
import type { Component } from "solid-js";
import userEvent from "@testing-library/user-event";
import { pointerMap } from "@proyecto-viviana/solidaria-test-utils";

const Example: Component<{ id?: string; "data-testid"?: string }> = (props) => {
  const { isFocusVisible } = createFocusVisible();
  return (
    <div tabIndex={0} {...props}>
      example{isFocusVisible() && "-focusVisible"}
    </div>
  );
};

const ButtonExample: Component<{ id?: string }> = (props) => {
  let ref: HTMLButtonElement | undefined;
  const { buttonProps } = createButton({}, () => ref);
  const { focusProps, isFocusVisible } = createFocusRing();

  return (
    <button ref={ref} {...mergeProps(buttonProps, focusProps)} id={props.id}>
      example{isFocusVisible() && "-focusVisible"}
    </button>
  );
};

function toggleBrowserTabs(win: Window = window) {
  const lastActiveElement = win.document.activeElement;
  if (lastActiveElement) {
    fireEvent(lastActiveElement, new Event("blur"));
  }
  fireEvent(win, new Event("blur"));
  Object.defineProperty(win.document, "visibilityState", {
    value: "hidden",
    writable: true,
  });
  Object.defineProperty(win.document, "hidden", { value: true, writable: true });
  fireEvent(win.document, new Event("visibilitychange"));
  Object.defineProperty(win.document, "visibilityState", {
    value: "visible",
    writable: true,
  });
  Object.defineProperty(win.document, "hidden", { value: false, writable: true });
  fireEvent(win.document, new Event("visibilitychange"));
  fireEvent(win, new Event("focus", { target: win }));
  if (lastActiveElement) {
    fireEvent(lastActiveElement, new Event("focus"));
  }
}

function toggleBrowserWindow(win: Window = window) {
  fireEvent(win, new Event("blur", { target: win }));
  fireEvent(win, new Event("focus", { target: win }));
}

// Focus the element the way the browser restores focus. createFocusVisible ignores untrusted
// focus events and jsdom only marks its own as trusted, so go through jsdom's focus() rather
// than fireEvent, using the unpatched copy saved by setupGlobalFocusEvents so it isn't recorded
// as a programmatic focus. jsdom won't dispatch focus again for the element that already has it,
// hence the blur first — createFocusVisible doesn't observe element blur.
function restoreFocus(element: Element, win: Window = window) {
  const nativeFocus = hasSetupGlobalListeners.get(win)!.focus;
  (element as HTMLElement).blur();
  nativeFocus.call(element);
}

function toggleBrowserTabsSafari(win: Window = window) {
  // Safari fires the window/element focus pair twice when returning to a tab or app, and
  // visibilitychange fires after all of the focus events.
  const lastActiveElement = win.document.activeElement;
  fireEvent(lastActiveElement!, new Event("blur"));
  fireEvent(win, new Event("blur"));
  Object.defineProperty(win.document, "visibilityState", {
    value: "hidden",
    writable: true,
  });
  Object.defineProperty(win.document, "hidden", { value: true, writable: true });
  fireEvent(win.document, new Event("visibilitychange"));
  fireEvent(win, new Event("focus", { target: win }));
  restoreFocus(lastActiveElement!, win);
  fireEvent(win, new Event("focus", { target: win }));
  restoreFocus(lastActiveElement!, win);
  Object.defineProperty(win.document, "visibilityState", {
    value: "visible",
    writable: true,
  });
  Object.defineProperty(win.document, "hidden", { value: false, writable: true });
  fireEvent(win.document, new Event("visibilitychange"));
}

describe("createFocusVisible", () => {
  beforeEach(() => {
    fireEvent.focus(document.body);
  });

  afterEach(() => {
    cleanup();
  });

  it("returns positive isFocusVisible after toggling browser tabs after keyboard navigation", async () => {
    const user = userEvent.setup({ delay: null, pointerMap: pointerMap as any });
    render(() => <Example />);

    await user.tab();
    const el = screen.getByText("example-focusVisible");

    toggleBrowserTabs();
    expect(el.textContent).toBe("example-focusVisible");
  });

  it("returns negative isFocusVisible after toggling browser tabs without prior keyboard navigation", async () => {
    const user = userEvent.setup({ delay: null, pointerMap: pointerMap as any });
    render(() => <Example />);

    await user.tab();
    const el = screen.getByText("example-focusVisible");

    await user.click(el);
    toggleBrowserTabs();
    expect(el.textContent).toBe("example");
  });

  it("returns positive isFocusVisible after toggling browser tabs in Safari after keyboard navigation", async () => {
    const user = userEvent.setup({ delay: null, pointerMap: pointerMap as any });
    render(() => <Example />);

    await user.tab();
    const el = screen.getByText("example-focusVisible");

    toggleBrowserTabsSafari();
    expect(el.textContent).toBe("example-focusVisible");
  });

  it("returns negative isFocusVisible after toggling browser tabs in Safari without prior keyboard navigation", async () => {
    const user = userEvent.setup({ delay: null, pointerMap: pointerMap as any });
    render(() => <Example />);

    await user.tab();
    const el = screen.getByText("example-focusVisible");

    await user.click(el);
    toggleBrowserTabsSafari();
    expect(el.textContent).toBe("example");
  });

  it("returns positive isFocusVisible after toggling browser window after keyboard navigation", async () => {
    const user = userEvent.setup({ delay: null, pointerMap: pointerMap as any });
    render(() => <Example />);

    await user.tab();
    const el = screen.getByText("example-focusVisible");

    toggleBrowserWindow();
    expect(el.textContent).toBe("example-focusVisible");
  });

  it("returns negative isFocusVisible after toggling browser window without prior keyboard navigation", async () => {
    const user = userEvent.setup({ delay: null, pointerMap: pointerMap as any });
    render(() => <Example />);

    await user.tab();
    const el = screen.getByText("example-focusVisible");

    await user.click(el);
    toggleBrowserWindow();
    expect(el.textContent).toBe("example");
  });

  describe("window tracking with iframes", () => {
    let iframe: HTMLIFrameElement;
    let iframeRoot: HTMLDivElement;

    beforeEach(() => {
      iframe = document.createElement("iframe");
      window.document.body.appendChild(iframe);
      const iframeDocument = iframe.contentWindow!.document;
      iframeRoot = iframeDocument.createElement("div");
      iframeDocument.body.appendChild(iframeRoot);
    });

    afterEach(() => {
      fireEvent(iframe.contentWindow!, new Event("beforeunload"));
      iframe.remove();
    });

    it("sets up focus listener in a different window", async () => {
      const user = userEvent.setup({ delay: null, pointerMap: pointerMap as any });
      render(() => <Example id="iframe-example" />, { container: iframeRoot });

      await waitFor(() => {
        expect(
          iframe.contentWindow!.document.body.querySelector('div[id="iframe-example"]'),
        ).toBeTruthy();
      });
      const el = iframe.contentWindow!.document.body.querySelector(
        'div[id="iframe-example"]',
      ) as HTMLElement;

      await user.click(document.body);
      await user.click(el);
      expect(el.textContent).toBe("example");

      addWindowFocusTracking(iframeRoot);
      expect(el.textContent).toBe("example");

      await user.keyboard("{Enter}");
      expect(el.textContent).toBe("example-focusVisible");
    });

    it("removes event listeners on beforeunload", async () => {
      const user = userEvent.setup({
        delay: null,
        pointerMap: pointerMap as any,
        document: iframe.contentWindow!.document,
      });
      render(() => <Example data-testid="iframe-example" />, { container: iframeRoot });

      await waitFor(() => {
        expect(
          iframe.contentWindow!.document.body.querySelector('div[data-testid="iframe-example"]'),
        ).toBeTruthy();
      });
      const el = iframe.contentWindow!.document.body.querySelector(
        'div[data-testid="iframe-example"]',
      ) as HTMLElement;
      addWindowFocusTracking(iframeRoot);

      await user.tab();
      await user.keyboard("a");
      expect(el.textContent).toBe("example-focusVisible");

      await user.click(el);
      expect(el.textContent).toBe("example");

      fireEvent(iframe.contentWindow!, new Event("beforeunload"));
      await user.keyboard("{Enter}");
      expect(el.textContent).toBe("example");
    });

    it("removes event listeners using teardown function", async () => {
      const user = userEvent.setup({
        delay: null,
        pointerMap: pointerMap as any,
        document: iframe.contentWindow!.document,
      });
      render(() => <Example data-testid="iframe-example" />, { container: iframeRoot });
      const tearDown = addWindowFocusTracking(iframeRoot);

      await waitFor(() => {
        expect(
          iframe.contentWindow!.document.body.querySelector('div[data-testid="iframe-example"]'),
        ).toBeTruthy();
      });
      const el = iframe.contentWindow!.document.body.querySelector(
        'div[data-testid="iframe-example"]',
      ) as HTMLElement;

      await user.tab();
      await user.keyboard("a");
      expect(el.textContent).toBe("example-focusVisible");

      await user.click(el);
      expect(el.textContent).toBe("example");

      tearDown();
      await user.keyboard("{Enter}");
      expect(el.textContent).toBe("example");
    });

    it("removes the window object from hasSetupGlobalListeners on beforeunload", () => {
      render(() => <Example id="iframe-example" />, { container: iframeRoot });
      expect(hasSetupGlobalListeners.size).toBe(1);
      expect(hasSetupGlobalListeners.get(window)).toBeTruthy();
      expect(hasSetupGlobalListeners.get(iframe.contentWindow!)).toBeFalsy();

      addWindowFocusTracking(iframeRoot);
      expect(hasSetupGlobalListeners.size).toBe(2);
      expect(hasSetupGlobalListeners.get(window)).toBeTruthy();
      expect(hasSetupGlobalListeners.get(iframe.contentWindow!)).toBeTruthy();

      fireEvent(iframe.contentWindow!, new Event("beforeunload"));
      expect(hasSetupGlobalListeners.size).toBe(1);
      expect(hasSetupGlobalListeners.get(window)).toBeTruthy();
      expect(hasSetupGlobalListeners.get(iframe.contentWindow!)).toBeFalsy();
    });

    it("removes the window object from hasSetupGlobalListeners when torn down", () => {
      render(() => <Example id="iframe-example" />, { container: iframeRoot });
      expect(hasSetupGlobalListeners.size).toBe(1);

      const tearDown = addWindowFocusTracking(iframeRoot);
      expect(hasSetupGlobalListeners.size).toBe(2);

      tearDown();
      expect(hasSetupGlobalListeners.size).toBe(1);
    });

    it("keeps focus visible across tab toggles in iframe after keyboard navigation", async () => {
      const user = userEvent.setup({
        delay: null,
        pointerMap: pointerMap as any,
        document: iframe.contentWindow!.document,
      });
      render(() => <Example id="iframe-example" />, { container: iframeRoot });
      addWindowFocusTracking(iframeRoot);

      await waitFor(() => {
        expect(
          iframe.contentWindow!.document.body.querySelector('div[id="iframe-example"]'),
        ).toBeTruthy();
      });

      await user.tab();
      const el = iframe.contentWindow!.document.body.querySelector(
        'div[id="iframe-example"]',
      ) as HTMLElement;
      expect(el.textContent).toBe("example-focusVisible");

      toggleBrowserTabs(iframe.contentWindow!);
      expect(el.textContent).toBe("example-focusVisible");
    });

    it("keeps focus visible across window toggles in iframe after keyboard navigation", async () => {
      const user = userEvent.setup({
        delay: null,
        pointerMap: pointerMap as any,
        document: iframe.contentWindow!.document,
      });
      render(() => <Example id="iframe-example" />, { container: iframeRoot });
      addWindowFocusTracking(iframeRoot);

      await waitFor(() => {
        expect(
          iframe.contentWindow!.document.body.querySelector('div[id="iframe-example"]'),
        ).toBeTruthy();
      });

      await user.tab();
      const el = iframe.contentWindow!.document.body.querySelector(
        'div[id="iframe-example"]',
      ) as HTMLElement;
      expect(el.textContent).toBe("example-focusVisible");

      toggleBrowserWindow(iframe.contentWindow!);
      expect(el.textContent).toBe("example-focusVisible");
    });

    it("correctly shifts focus to the iframe when focused", async () => {
      const user = userEvent.setup({
        delay: null,
        pointerMap: pointerMap as any,
        document: iframe.contentWindow!.document,
      });
      render(() => <ButtonExample id="iframe-example" />, { container: iframeRoot });
      addWindowFocusTracking(iframeRoot);

      await waitFor(() => {
        expect(
          iframe.contentWindow!.document.body.querySelector('button[id="iframe-example"]'),
        ).toBeTruthy();
      });
      const el = iframe.contentWindow!.document.body.querySelector(
        'button[id="iframe-example"]',
      ) as HTMLButtonElement;

      await user.pointer({ target: el, keys: "[MouseLeft]" });
      await user.keyboard("{Escape}");

      expect(el.textContent).toBe("example-focusVisible");
    });
  });
});

describe("createFocusVisibleListener", () => {
  afterEach(() => {
    cleanup();
  });

  it("emits on modality change (non-text input)", () => {
    const fnMock = vi.fn();
    const cleanupListener = createFocusVisibleListener(fnMock);
    expect(fnMock).toHaveBeenCalledTimes(0);

    fireEvent.keyDown(document.body, { key: "a" });
    fireEvent.keyUp(document.body, { key: "a" });
    fireEvent.keyDown(document.body, { key: "Escape" });
    fireEvent.keyUp(document.body, { key: "Escape" });
    fireEvent.pointerDown(document.body, { pointerType: "mouse" });
    fireEvent.pointerUp(document.body, { pointerType: "mouse" });

    expect(fnMock).toHaveBeenCalledTimes(5);
    expect(fnMock.mock.calls).toEqual([[true], [true], [true], [true], [false]]);

    cleanupListener();
  });

  it("emits on modality change (text input)", () => {
    const fnMock = vi.fn();
    const cleanupListener = createFocusVisibleListener(fnMock, { isTextInput: true });
    expect(fnMock).toHaveBeenCalledTimes(0);

    fireEvent.keyDown(document.body, { key: "a" });
    fireEvent.keyUp(document.body, { key: "a" });
    fireEvent.keyDown(document.body, { key: "Escape" });
    fireEvent.keyUp(document.body, { key: "Escape" });
    fireEvent.pointerDown(document.body, { pointerType: "mouse" });
    fireEvent.pointerUp(document.body, { pointerType: "mouse" });

    expect(fnMock).toHaveBeenCalledTimes(3);
    expect(fnMock.mock.calls).toEqual([[true], [true], [false]]);

    cleanupListener();
  });

  it("does not emit when enabled is false", () => {
    const fnMock = vi.fn();
    const cleanupListener = createFocusVisibleListener(fnMock, { enabled: false });

    fireEvent.keyDown(document.body, { key: "Tab" });
    fireEvent.pointerDown(document.body, { pointerType: "mouse" });

    expect(fnMock).toHaveBeenCalledTimes(0);
    cleanupListener();
  });
});
