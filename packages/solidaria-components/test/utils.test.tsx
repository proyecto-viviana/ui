/**
 * Tests for the context/slot machinery ported from react-aria-components'
 * `utils.tsx` (headless-spine-port keystone 3, `port-context-slots`):
 * - `Provider` nests multiple context values around a child;
 * - `useSlottedContext` resolves the right slot, throws on an invalid one, and
 *   honors an explicit `null` slot;
 * - `useContextProps` merges context props/refs with the component's own (props
 *   win, handlers chain, refs fan out);
 * - `mergeRefs` / `assignRef` forward to callback and object refs;
 * - `useSlot` reports whether slotted content was rendered.
 */

import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@solidjs/testing-library";
import { type Context, createContext, useContext } from "solid-js";
import {
  Provider,
  useSlottedContext,
  useContextProps,
  useSlot,
  createSlottedContext,
  mergeRefs,
  assignRef,
} from "../src/utils";

describe("utils — context/slot machinery", () => {
  afterEach(() => {
    cleanup();
  });

  describe("Provider", () => {
    it("delivers multiple context values to a descendant", () => {
      const A = createContext<string>();
      const B = createContext<string>();

      function Consumer() {
        return (
          <span>
            {useContext(A)}-{useContext(B)}
          </span>
        );
      }

      const { container } = render(() => (
        <Provider
          values={
            [
              [A, "valA"],
              [B, "valB"],
            ] as Array<[Context<unknown>, unknown]>
          }
        >
          <Consumer />
        </Provider>
      ));

      expect(container.textContent).toBe("valA-valB");
    });

    it("nests so the last pair is outermost (descendant reads the innermost, first pair)", () => {
      const Ctx = createContext<string>("none");

      function Consumer() {
        return <span>{useContext(Ctx)}</span>;
      }

      const { container } = render(() => (
        <Provider
          values={
            [
              [Ctx, "inner"],
              [Ctx, "outer"],
            ] as Array<[Context<unknown>, unknown]>
          }
        >
          <Consumer />
        </Provider>
      ));

      // The child sits inside the first pair's provider (innermost), per upstream.
      expect(container.textContent).toBe("inner");
    });
  });

  describe("useSlottedContext", () => {
    it("returns a bare (non-slotted) context value as-is", () => {
      const Ctx = createSlottedContext<{ name: string }>();
      let seen: { name: string } | null | undefined;

      function Consumer() {
        seen = useSlottedContext(Ctx);
        return null;
      }

      render(() => (
        <Provider values={[[Ctx, { name: "bare" }]] as Array<[Context<unknown>, unknown]>}>
          <Consumer />
        </Provider>
      ));

      expect(seen).toEqual({ name: "bare" });
    });

    it("resolves the DEFAULT_SLOT when no slot name is given", () => {
      const Ctx = createSlottedContext<{ name: string }>();
      let seen: { name: string } | null | undefined;

      function Consumer() {
        seen = useSlottedContext(Ctx);
        return null;
      }

      render(() => (
        <Provider
          values={
            [
              [Ctx, { slots: { default: { name: "def" }, label: { name: "lbl" } } }],
            ] as Array<[Context<unknown>, unknown]>
          }
        >
          <Consumer />
        </Provider>
      ));

      expect(seen).toEqual({ name: "def" });
    });

    it("resolves a named slot", () => {
      const Ctx = createSlottedContext<{ name: string }>();
      let seen: { name: string } | null | undefined;

      function Consumer() {
        seen = useSlottedContext(Ctx, "label");
        return null;
      }

      render(() => (
        <Provider
          values={
            [
              [Ctx, { slots: { default: { name: "def" }, label: { name: "lbl" } } }],
            ] as Array<[Context<unknown>, unknown]>
          }
        >
          <Consumer />
        </Provider>
      ));

      expect(seen).toEqual({ name: "lbl" });
    });

    it("throws on an unknown slot name", () => {
      const Ctx = createSlottedContext<{ name: string }>();

      function Consumer() {
        useSlottedContext(Ctx, "bogus");
        return null;
      }

      expect(() =>
        render(() => (
          <Provider
            values={
              [[Ctx, { slots: { default: { name: "def" } } }]] as Array<[Context<unknown>, unknown]>
            }
          >
            <Consumer />
          </Provider>
        )),
      ).toThrow(/Invalid slot "bogus"/);
    });

    it("ignores the context entirely when slot is null", () => {
      const Ctx = createSlottedContext<{ name: string }>();
      let seen: { name: string } | null | undefined = { name: "unset" };

      function Consumer() {
        seen = useSlottedContext(Ctx, null);
        return null;
      }

      render(() => (
        <Provider
          values={
            [[Ctx, { slots: { default: { name: "def" } } }]] as Array<[Context<unknown>, unknown]>
          }
        >
          <Consumer />
        </Provider>
      ));

      expect(seen).toBeNull();
    });
  });

  describe("useContextProps", () => {
    it("merges context props under the component's own (props win)", () => {
      const Ctx = createSlottedContext<{ id?: string; "data-src"?: string }>();
      let merged: Record<string, unknown> = {};

      function Consumer(props: { id?: string; slot?: string }) {
        const [m] = useContextProps(props, undefined, Ctx);
        merged = { id: m.id, src: (m as Record<string, unknown>)["data-src"] };
        return null;
      }

      render(() => (
        <Provider
          values={
            [[Ctx, { id: "ctxId", "data-src": "ctx" }]] as Array<[Context<unknown>, unknown]>
          }
        >
          <Consumer id="propId" />
        </Provider>
      ));

      expect(merged.id).toBe("propId"); // props win
      expect(merged.src).toBe("ctx"); // context fills the gap
    });

    it("chains event handlers (context handler first, then prop handler)", () => {
      const Ctx = createSlottedContext<{ onClick?: () => void }>();
      const calls: string[] = [];
      let click: (() => void) | undefined;

      function Consumer(props: { onClick?: () => void; slot?: string }) {
        const [m] = useContextProps(props, undefined, Ctx);
        click = (m as { onClick?: () => void }).onClick;
        return null;
      }

      render(() => (
        <Provider
          values={[[Ctx, { onClick: () => calls.push("ctx") }]] as Array<[Context<unknown>, unknown]>}
        >
          <Consumer onClick={() => calls.push("prop")} />
        </Provider>
      ));

      click?.();
      expect(calls).toEqual(["ctx", "prop"]);
    });

    it("merges the component ref and the context ref", () => {
      const Ctx = createSlottedContext<object>();
      const propRef: { current: unknown } = { current: null };
      let ctxRefEl: unknown;
      const ctxRef = (el: unknown) => {
        ctxRefEl = el;
      };

      function Consumer(props: { slot?: string }) {
        const [, mergedRef] = useContextProps(props, propRef, Ctx);
        mergedRef("EL" as unknown as object);
        return null;
      }

      render(() => (
        <Provider values={[[Ctx, { ref: ctxRef }]] as Array<[Context<unknown>, unknown]>}>
          <Consumer />
        </Provider>
      ));

      expect(propRef.current).toBe("EL");
      expect(ctxRefEl).toBe("EL");
    });
  });

  describe("mergeRefs / assignRef", () => {
    it("forwards an element to both callback and object refs, once each", () => {
      const objRef: { current: unknown } = { current: null };
      let cbEl: unknown;
      const cbRef = (el: unknown) => {
        cbEl = el;
      };

      const merged = mergeRefs<unknown>(objRef, cbRef, undefined);
      merged("X");

      expect(objRef.current).toBe("X");
      expect(cbEl).toBe("X");
    });

    it("assignRef writes to an object ref's current", () => {
      const objRef: { current: unknown } = { current: null };
      assignRef(objRef, 42);
      expect(objRef.current).toBe(42);
    });
  });

  describe("useSlot", () => {
    it("reports a slot present when the ref is attached to rendered content", () => {
      let hasSlot: (() => boolean) | undefined;

      function C() {
        const [ref, has] = useSlot();
        hasSlot = has;
        return <span ref={ref}>content</span>;
      }

      render(() => <C />);
      expect(hasSlot?.()).toBe(true);
    });

    it("reports no slot when the ref never attaches (no slotted content)", () => {
      let hasSlot: (() => boolean) | undefined;

      function C() {
        const [, has] = useSlot();
        hasSlot = has;
        return null;
      }

      render(() => <C />);
      expect(hasSlot?.()).toBe(false);
    });
  });
});
