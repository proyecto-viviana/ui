/**
 * FocusScope ownerDocument tests - Port of @react-aria/focus FocusScopeOwnerDocument.test.js
 *
 * These validate FocusScope behavior when rendered inside an iframe/document
 * different from the main window.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach } from "vite-plus/test";
import { fireEvent, render, waitFor, cleanup } from "@solidjs/testing-library";
import { FocusScope } from "../src/focus/FocusScope";
import { Portal } from "solid-js/web";
import userEvent from "@testing-library/user-event";
import { pointerMap } from "@proyecto-viviana/solidaria-test-utils";
import { createSignal, Show } from "solid-js";

describe("FocusScope (ownerDocument)", () => {
  let iframe: HTMLIFrameElement;
  let iframeRoot: HTMLDivElement;

  const IframeExample = (props: { children: any }) => {
    return <Portal mount={iframeRoot}>{props.children}</Portal>;
  };

  beforeEach(() => {
    iframe = document.createElement("iframe");
    window.document.body.appendChild(iframe);
    const iframeDocument = iframe.contentWindow!.document;
    iframeRoot = iframeDocument.createElement("div");
    iframeDocument.body.appendChild(iframeRoot);
  });

  afterEach(() => {
    cleanup();
    iframe.remove();
  });

  describe("focus containment", () => {
    it("should contain focus within the scope", async () => {
      render(() => (
        <IframeExample>
          <FocusScope contain>
            <input data-testid="input1" />
            <input data-testid="input2" />
            <input data-testid="input3" />
          </FocusScope>
        </IframeExample>
      ));

      await waitFor(() => {
        expect(
          document
            .querySelector("iframe")!
            .contentWindow!.document.body.querySelector('input[data-testid="input1"]'),
        ).toBeTruthy();
      });

      const iframeDocument = iframe.contentWindow!.document;
      const user = userEvent.setup({
        delay: null,
        pointerMap: pointerMap as any,
        document: iframeDocument,
      });
      const input1 = iframeDocument.querySelector(
        'input[data-testid="input1"]',
      ) as HTMLInputElement;
      const input2 = iframeDocument.querySelector(
        'input[data-testid="input2"]',
      ) as HTMLInputElement;
      const input3 = iframeDocument.querySelector(
        'input[data-testid="input3"]',
      ) as HTMLInputElement;

      input1.focus();
      expect(iframeDocument.activeElement).toBe(input1);

      await user.tab();
      expect(iframeDocument.activeElement).toBe(input2);

      await user.tab();
      expect(iframeDocument.activeElement).toBe(input3);

      await user.tab();
      expect(iframeDocument.activeElement).toBe(input1);

      await user.tab({ shift: true });
      expect(iframeDocument.activeElement).toBe(input3);
    });

    it("focus properly moves into child iframe on click", async () => {
      render(() => (
        <IframeExample>
          <FocusScope contain>
            <input data-testid="input1" />
            <input data-testid="input2" />
          </FocusScope>
        </IframeExample>
      ));

      await waitFor(() => {
        expect(
          document
            .querySelector("iframe")!
            .contentWindow!.document.body.querySelector('input[data-testid="input1"]'),
        ).toBeTruthy();
      });

      const iframeDocument = iframe.contentWindow!.document;
      const input1 = iframeDocument.querySelector(
        'input[data-testid="input1"]',
      ) as HTMLInputElement;
      const input2 = iframeDocument.querySelector(
        'input[data-testid="input2"]',
      ) as HTMLInputElement;

      input1.focus();
      fireEvent.focusIn(input1);
      expect(iframeDocument.activeElement).toBe(input1);

      input2.focus();
      fireEvent.blur(input1, { relatedTarget: null });
      expect(iframeDocument.activeElement).toBe(input2);
    });
  });

  describe("focus restoration", () => {
    it("should restore focus to the previously focused node on unmount", async () => {
      const [show, setShow] = createSignal(false);

      const Test = () => (
        <div>
          <input data-testid="outside" />
          <IframeExample>
            <Show when={show()}>
              <FocusScope restoreFocus autoFocus>
                <input data-testid="input1" />
                <input data-testid="input2" />
                <input data-testid="input3" />
              </FocusScope>
            </Show>
          </IframeExample>
        </div>
      );

      const { getByTestId } = render(() => <Test />);
      const outside = getByTestId("outside") as HTMLInputElement;
      outside.focus();

      setShow(true);

      await waitFor(() => {
        expect(
          document
            .querySelector("iframe")!
            .contentWindow!.document.body.querySelector('input[data-testid="input1"]'),
        ).toBeTruthy();
      });

      // AutoFocus should move focus into the iframe scope
      const iframeDocument = iframe.contentWindow!.document;
      const input1 = iframeDocument.querySelector(
        'input[data-testid="input1"]',
      ) as HTMLInputElement;
      await waitFor(() => {
        expect(iframeDocument.activeElement).toBe(input1);
      });

      setShow(false);
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
      expect(document.activeElement).toBe(outside);
    });
  });
});
