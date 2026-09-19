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

import { describe, it, expect, afterEach } from "vite-plus/test";
import { render, cleanup } from "@solidjs/testing-library";
import { type Context, createContext, createSignal, flush, useContext } from "solid-js";
import h from "@solidjs/h";
import { Text, TextContext } from "../src/Text";
import { ElementTag } from "../src/ElementTag";
import { HydrationGateFixture, type RenderControls } from "./fixtures/utils";
import {
  Provider,
  useSlottedContext,
  useContextProps,
  useSlot,
  createSlottedContext,
  mergeRefs,
  assignRef,
  useRenderProps,
  OptionContent,
} from "../src/utils";

describe("utils — context/slot machinery", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders client-only content immediately in CSR and on later remounts", () => {
    let controls!: RenderControls;
    const states: boolean[] = [];
    const constructions: string[] = [];
    const disposals: string[] = [];
    const { container } = render(() => (
      <HydrationGateFixture
        controls={(value) => {
          controls = value;
        }}
        state={(hydrated) => states.push(hydrated)}
        constructed={(kind) => constructions.push(kind)}
        disposed={(kind) => disposals.push(kind)}
      />
    ));
    expect(states).toEqual([true]);
    expect(constructions).toEqual([
      "component-child",
      "empty-child",
      "hook-following",
      "hook-child",
      "following",
    ]);
    const children = [...container.querySelectorAll('[data-gate$="child"]')];
    const following = container.querySelector('[data-gate="following"]');
    controls.update();
    flush();
    children.forEach((node) => {
      expect(container.contains(node)).toBe(true);
      expect(node).toHaveTextContent("gate-context:second");
    });
    controls.reveal(false);
    flush();
    expect(disposals.sort()).toEqual([
      "component-child",
      "empty-child",
      "hook-child",
      "hook-following",
    ]);
    controls.reveal(true);
    flush();
    expect(states).toEqual([true, true]);
    expect(constructions.filter((kind) => kind.endsWith("fallback"))).toEqual([]);
    expect(constructions).toHaveLength(9);
    expect(container.querySelector('[data-gate="following"]')).toBe(following);
    expect(container.querySelectorAll('[data-gate$="child"]')).toHaveLength(3);
    cleanup();
    expect([...disposals].sort()).toEqual([...constructions].sort());
  });

  describe("ElementTag", () => {
    it.each([
      "span",
      "a",
      "p",
      "label",
      "strong",
      "em",
      "small",
      "div",
      "hr",
      "li",
      "ul",
      "ol",
      "figure",
      "blockquote",
      "address",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "main",
      "nav",
      "header",
      "footer",
      "aside",
      "section",
      "article",
      "form",
      "search",
      "button",
      "output",
      "mark",
    ])("renders %s and forwards props without consuming a component attribute", (tag) => {
      const refs: HTMLElement[] = [];
      let clicks = 0;
      const { container } = render(() => (
        <ElementTag
          tag={tag}
          component="forwarded"
          title="Title"
          data-purpose="tag"
          ref={(element: HTMLElement) => refs.push(element)}
          onClick={() => clicks++}
        />
      ));
      const element = container.firstElementChild as HTMLElement;
      expect(container.children).toHaveLength(1);
      expect(element.localName).toBe(tag);
      expect(element).toHaveAttribute("component", "forwarded");
      expect(element).toHaveAttribute("title", "Title");
      expect(element).toHaveAttribute("data-purpose", "tag");
      expect(element).not.toHaveAttribute("tag");
      expect(refs).toHaveLength(1);
      expect(refs[0]).toBe(element);
      element.click();
      expect(clicks).toBe(1);
    });

    it("isolates tag selection from reactive spread updates and replaces only on a tag change", () => {
      const [tag, setTag] = createSignal("button");
      const [label, setLabel] = createSignal("first");
      const { container } = render(() => (
        <ElementTag {...{ tag: tag(), title: label(), class: label() }} tabIndex={0}>
          {label()}
        </ElementTag>
      ));
      const initial = container.firstElementChild as HTMLElement;
      initial.focus();
      setLabel("second");
      flush();
      expect(container.firstElementChild).toBe(initial);
      expect(document.activeElement).toBe(initial);
      expect(initial).toHaveTextContent("second");
      expect(initial).toHaveAttribute("title", "second");
      expect(initial).toHaveClass("second");
      setTag("a");
      flush();
      expect(container.firstElementChild).not.toBe(initial);
      expect(container.firstElementChild?.localName).toBe("a");
      expect(container.firstElementChild).toHaveTextContent("second");
      expect(container.contains(initial)).toBe(false);
    });
  });

  describe("stable option children", () => {
    it("keeps render-prop nodes and updates their reactive state without rereading children", () => {
      const [selected, setSelected] = createSignal(false);
      const [hovered, setHovered] = createSignal(false);
      let reads = 0;
      let renders = 0;
      function Option() {
        const props = useRenderProps(
          {
            get children() {
              reads++;
              return (state: { selected: boolean; hovered: boolean }) => {
                renders++;
                return (
                  <span data-selected={String(state.selected)}>
                    {state.hovered ? "hovered" : "idle"}
                  </span>
                );
              };
            },
          },
          () => ({ selected: selected(), hovered: hovered() }),
        );
        return <OptionContent render={props.renderChildrenStable} labelProps={{ id: "label" }} />;
      }
      const { container } = render(() => <Option />);
      const node = container.firstElementChild;
      expect(node).toHaveAttribute("data-selected", "false");
      expect(node).toHaveTextContent("idle");
      setSelected(true);
      setHovered(true);
      flush();
      expect(container.firstElementChild).toBe(node);
      expect(node).toHaveAttribute("data-selected", "true");
      expect(node).toHaveTextContent("hovered");
      setSelected(false);
      setHovered(false);
      flush();
      expect(container.firstElementChild).toBe(node);
      expect(node).toHaveAttribute("data-selected", "false");
      expect(node).toHaveTextContent("idle");
      expect(reads).toBe(1);
      expect(renders).toBe(1);
    });

    it("returns zero-argument accessors untouched and keeps their text reactive", () => {
      const [label, setLabel] = createSignal("first");
      let calls = 0;
      const child = () => {
        calls++;
        return label();
      };
      function Option() {
        const props = useRenderProps({ children: child }, () => ({}));
        expect(props.renderChildrenStable()).toBe(child);
        expect(calls).toBe(0);
        return <OptionContent render={props.renderChildrenStable} labelProps={{ id: "unused" }} />;
      }
      const { container } = render(() => <Option />);
      expect(container.textContent).toBe("first");
      setLabel("second");
      flush();
      expect(container.textContent).toBe("second");
      setLabel("third");
      flush();
      expect(container.textContent).toBe("third");
      expect(container.querySelector("span")).toBeNull();
    });

    it("preserves an h thunk node and its bindings across unrelated render-state updates", () => {
      const [label, setLabel] = createSignal("first");
      const [selected, setSelected] = createSignal(false);
      function Option() {
        const props = useRenderProps({ children: h("span", () => label()) }, () => ({
          selected: selected(),
        }));
        return <OptionContent render={props.renderChildrenStable} labelProps={{ id: "unused" }} />;
      }
      const { container } = render(() => <Option />);
      const node = container.firstElementChild;
      expect(node).toHaveTextContent("first");
      setLabel("second");
      flush();
      expect(node).toHaveTextContent("second");
      setSelected(true);
      flush();
      expect(container.firstElementChild).toBe(node);
      setLabel("third");
      flush();
      expect(container.firstElementChild).toBe(node);
      expect(node).toHaveTextContent("third");
    });

    it.each(["label", 0])("wraps primitive %s with its full label props", (child) => {
      function Option() {
        const props = useRenderProps({ children: child }, () => ({}));
        return (
          <OptionContent
            render={props.renderChildrenStable}
            labelProps={{ id: "option-label", "aria-hidden": "true" }}
          />
        );
      }
      const { container } = render(() => <Option />);
      expect(container.children).toHaveLength(1);
      expect(container.firstElementChild?.tagName).toBe("SPAN");
      expect(container.firstElementChild).toHaveAttribute("id", "option-label");
      expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
      expect(container.textContent).toBe(String(child));
    });

    it("constructs slotted Text once inside the owning option context", () => {
      let reads = 0;
      function Option() {
        const props = useRenderProps(
          {
            get children() {
              reads++;
              return (
                <>
                  <Text slot="label">Label</Text>
                  <Text slot="description">Description</Text>
                </>
              );
            },
          },
          () => ({}),
        );
        return (
          <TextContext
            value={{
              slots: { label: { id: "inner-label" }, description: { id: "inner-description" } },
            }}
          >
            <OptionContent render={props.renderChildrenStable} labelProps={{ id: "unused" }} />
          </TextContext>
        );
      }
      const { container } = render(() => (
        <TextContext
          value={{
            slots: { label: { id: "outer-label" }, description: { id: "outer-description" } },
          }}
        >
          <Option />
        </TextContext>
      ));
      expect(reads).toBe(1);
      expect(container.children).toHaveLength(2);
      expect(container.querySelector("#inner-label")).toHaveTextContent("Label");
      expect(container.querySelector("#inner-description")).toHaveTextContent("Description");
      expect(container.querySelector("#outer-label, #outer-description, #unused")).toBeNull();
    });
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
            [[Ctx, { slots: { default: { name: "def" }, label: { name: "lbl" } } }]] as Array<
              [Context<unknown>, unknown]
            >
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
            [[Ctx, { slots: { default: { name: "def" }, label: { name: "lbl" } } }]] as Array<
              [Context<unknown>, unknown]
            >
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
          values={[[Ctx, { id: "ctxId", "data-src": "ctx" }]] as Array<[Context<unknown>, unknown]>}
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
          values={
            [[Ctx, { onClick: () => calls.push("ctx") }]] as Array<[Context<unknown>, unknown]>
          }
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
