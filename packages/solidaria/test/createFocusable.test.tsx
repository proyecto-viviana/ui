/** @vitest-environment jsdom */
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import {
  createFocusable,
  FocusableContext,
  type CreateFocusableProps,
} from "../src/interactions/createFocusable";
import { mergeProps } from "../src/utils/mergeProps";

afterEach(cleanup);

function Target(
  props: CreateFocusableProps & {
    elementRef?: (el: HTMLElement) => void;
    inspect?: (props: Record<string, unknown>) => void;
  },
) {
  const { focusableProps } = createFocusable(props, props.elementRef);
  // Consumers also merge at setup; event transport must survive that boundary.
  const domProps = mergeProps(focusableProps, { "data-testid": "target" });
  props.inspect?.(domProps);
  return <div {...domProps}>Target</div>;
}

describe("createFocusable live context", () => {
  it("preserves contextual-only native click receiver, currentTarget and callable return", () => {
    const calls: { receiver: unknown; currentTarget: EventTarget | null; event: MouseEvent }[] = [];
    const handler = function (this: unknown, event: MouseEvent) {
      calls.push({ receiver: this, currentTarget: event.currentTarget, event });
      return false;
    };
    let click: ((this: HTMLElement, event: MouseEvent) => unknown) | undefined;
    render(() => (
      <FocusableContext value={{ onClick: handler }}>
        <Target
          inspect={(props) => {
            click = props.onClick as typeof click;
          }}
        />
      </FocusableContext>
    ));
    const node = screen.getByTestId("target");
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    // DOM dispatch does not expose a listener's return or cancel on false.
    expect(fireEvent(node, event)).toBe(true);
    expect(event.defaultPrevented).toBe(false);
    expect(calls).toEqual([{ receiver: node, currentTarget: node, event }]);
    // The returned prop remains a callable; its return is observable here.
    expect(click!.call(node, event)).toBe(false);
    expect(calls[1].receiver).toBe(node);
  });

  it("preserves chained bare-call receivers and discarded returns", () => {
    const receivers: unknown[] = [];
    const own = vi.fn();
    const context = {
      onKeyDown: function (this: unknown) {
        receivers.push(this);
        return false;
      },
    };
    let key: ((this: HTMLElement, event: KeyboardEvent) => unknown) | undefined;
    render(() => (
      <FocusableContext value={context}>
        <Target
          onKeyDown={own}
          inspect={(props) => {
            key = props.onKeyDown as typeof key;
          }}
        />
      </FocusableContext>
    ));
    const node = screen.getByTestId("target");
    fireEvent.keyDown(node, { key: "x" });
    expect(receivers).toEqual([undefined]);
    expect(own).toHaveBeenCalledTimes(1);
    expect(key!.call(node, new KeyboardEvent("keydown"))).toBeUndefined();
    expect(receivers).toEqual([undefined, undefined]);
    expect(own).toHaveBeenCalledTimes(2);
  });

  for (const initiallyDisabled of [false, true]) {
    for (const excluded of [false, true]) {
      it(`keeps node/ref and live attributes through cycles (disabled=${initiallyDisabled}, excluded=${excluded})`, () => {
        const [disabled, setDisabled] = createSignal(initiallyDisabled);
        const [index, setIndex] = createSignal<number | undefined>(-1);
        const [label, setLabel] = createSignal("first");
        const ownRef = vi.fn();
        const contextRef = vi.fn();
        const context = {
          ref: contextRef,
          get tabIndex() {
            return index();
          },
          get "data-context"() {
            return label();
          },
          get "aria-label"() {
            return label();
          },
        };
        render(() => (
          <FocusableContext value={context}>
            <Target isDisabled={disabled} excludeFromTabOrder={excluded} elementRef={ownRef} />
          </FocusableContext>
        ));
        const node = screen.getByTestId("target");
        const check = (off: boolean, value: number | undefined, text: string) => {
          expect(screen.getByTestId("target")).toBe(node);
          expect(ownRef).toHaveBeenCalledExactlyOnceWith(node);
          expect(contextRef).toHaveBeenCalledExactlyOnceWith(node);
          if (off) {
            expect(node).not.toHaveAttribute("tabindex");
            expect(node).not.toHaveAttribute("data-context");
            expect(node).not.toHaveAttribute("aria-label");
          } else {
            expect(node).toHaveAttribute("tabindex", String(value ?? (excluded ? -1 : 0)));
            expect(node).toHaveAttribute("data-context", text);
            expect(node).toHaveAttribute("aria-label", text);
          }
        };
        check(initiallyDisabled, -1, "first");
        for (const off of [false, true, false, true, false]) {
          setDisabled(off);
          for (const value of [0, -1, undefined]) {
            setIndex(value);
            const text = `${off}-${value}`;
            setLabel(text);
            flush();
            check(off, value, text);
          }
        }
      });
    }
    it(`keeps own/context event order, arguments and replacements (disabled=${initiallyDisabled})`, () => {
      const [disabled, setDisabled] = createSignal(initiallyDisabled);
      const calls: string[] = [];
      const own = vi.fn((e: KeyboardEvent) => {
        calls.push("own");
        expect(e.key).toBe("x");
      });
      const a = vi.fn(() => {
        calls.push("A");
      });
      const b = vi.fn(() => {
        calls.push("B");
      });
      const [callback, setCallback] = createSignal<((e: KeyboardEvent) => void) | undefined>(
        () => a,
      );
      const context = {
        get onKeyDown() {
          return callback();
        },
      };
      render(() => (
        <FocusableContext value={context}>
          <Target isDisabled={disabled} onKeyDown={own} />
        </FocusableContext>
      ));
      const node = screen.getByTestId("target");
      const send = (off: boolean, cb: typeof a | undefined, name?: string) => {
        calls.length = 0;
        own.mockClear();
        a.mockClear();
        b.mockClear();
        const event = new KeyboardEvent("keydown", { key: "x", bubbles: true });
        fireEvent(node, event);
        expect(calls).toEqual(off ? [] : ["own", ...(name ? [name] : [])]);
        expect(own).toHaveBeenCalledTimes(off ? 0 : 1);
        if (!off) expect(own).toHaveBeenCalledWith(event);
        if (cb) {
          expect(cb).toHaveBeenCalledTimes(off ? 0 : 1);
          if (!off) expect(cb).toHaveBeenCalledWith(event);
        }
      };
      send(initiallyDisabled, a, "A");
      for (const off of [false, true, false]) {
        setDisabled(off);
        for (const [cb, name] of [
          [a, "A"],
          [b, "B"],
          [undefined, undefined],
          [b, "B"],
        ] as const) {
          setCallback(() => cb);
          flush();
          send(off, cb, name);
        }
      }
    });
    it(`activates an initially absent contextual event (disabled=${initiallyDisabled})`, () => {
      const [disabled, setDisabled] = createSignal(initiallyDisabled);
      const cb = vi.fn();
      const [callback, setCallback] = createSignal<(() => void) | undefined>(undefined);
      const context = {
        get onClick() {
          return callback();
        },
      };
      render(() => (
        <FocusableContext value={context}>
          <Target isDisabled={disabled} />
        </FocusableContext>
      ));
      const node = screen.getByTestId("target");
      fireEvent.click(node);
      expect(cb).not.toHaveBeenCalled();
      setCallback(() => cb);
      setDisabled(false);
      flush();
      fireEvent.click(node);
      expect(cb).toHaveBeenCalledTimes(1);
      setDisabled(true);
      flush();
      fireEvent.click(node);
      expect(cb).toHaveBeenCalledTimes(1);
    });
  }
  for (const excluded of [false, true]) {
    it(`preserves no-provider defaults and own focus/key events (excluded=${excluded})`, () => {
      const [disabled, setDisabled] = createSignal(true);
      const key = vi.fn();
      const focus = vi.fn();
      const blur = vi.fn();
      render(() => (
        <Target
          isDisabled={disabled}
          excludeFromTabOrder={excluded}
          onKeyDown={key}
          onFocus={focus}
          onBlur={blur}
        />
      ));
      const node = screen.getByTestId("target");
      expect(node).not.toHaveAttribute("tabindex");
      for (let cycle = 1; cycle <= 2; cycle++) {
        setDisabled(false);
        flush();
        expect(node).toHaveAttribute("tabindex", excluded ? "-1" : "0");
        node.focus();
        fireEvent.keyDown(node, { key: "x" });
        node.blur();
        expect(focus).toHaveBeenCalledTimes(cycle);
        expect(blur).toHaveBeenCalledTimes(cycle);
        expect(key).toHaveBeenCalledTimes(cycle);
        setDisabled(true);
        flush();
        expect(node).not.toHaveAttribute("tabindex");
        fireEvent.keyDown(node, { key: "x" });
        expect(key).toHaveBeenCalledTimes(cycle);
      }
    });
  }
});
