/**
 * Headless TokenField coverage for API, ARIA, focus, forms, and clipboard validation.
 * Arrow-key Selection.modify branches stay on the browser suite.
 */
import { createSignal, flush } from "solid-js";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { Label } from "../src/Label";
import { Text } from "../src/Text";
import {
  Token,
  TokenField,
  TokenFieldContext,
  TokenFieldValue,
  TokenInput,
  setTokenFieldSelection,
} from "../src/TokenField";
import { TokenFieldValue as BarrelTokenFieldValue } from "../src";

const MIME = "application/vnd.react-aria.tokens+json";

function installSelectionPolyfill() {
  if (typeof Selection === "undefined") {
    return;
  }
  if (!Selection.prototype.containsNode) {
    Selection.prototype.containsNode = function containsNode(node: Node) {
      if (this.rangeCount === 0) {
        return false;
      }
      return this.getRangeAt(0).intersectsNode(node);
    };
  }
  Selection.prototype.setBaseAndExtent = function setBaseAndExtent(
    anchorNode: Node,
    anchorOffset: number,
    _focusNode: Node,
    _focusOffset: number,
  ) {
    const range = document.createRange();
    range.setStart(anchorNode, anchorOffset);
    range.collapse(true);
    this.removeAllRanges();
    this.addRange(range);
  };
}

function installStyleSheets() {
  if (typeof CSSStyleSheet !== "function") {
    class FakeCSSStyleSheet {
      css = "";
      replaceSync(css: string) {
        this.css = css;
      }
    }
    (globalThis as { CSSStyleSheet?: typeof CSSStyleSheet }).CSSStyleSheet =
      FakeCSSStyleSheet as unknown as typeof CSSStyleSheet;
  }
  const sheets: CSSStyleSheet[] = [];
  Object.defineProperty(document, "adoptedStyleSheets", {
    configurable: true,
    writable: true,
    value: sheets,
  });
}

function helloValue() {
  return new TokenFieldValue([{ type: "text", text: "hello" }]);
}

function tokenValue() {
  return new TokenFieldValue([
    { type: "text", text: "hi " },
    { type: "token", text: "Ada" },
  ]);
}

function Field(
  props: {
    value?: TokenFieldValue;
    defaultValue?: TokenFieldValue;
    onChange?: (value: TokenFieldValue) => void;
    onSubmit?: () => void;
    label?: string;
    description?: string;
    isDisabled?: boolean;
    isReadOnly?: boolean;
    "aria-label"?: string;
  } = {},
) {
  return (
    <TokenField
      aria-label={props["aria-label"]}
      defaultValue={props.defaultValue}
      isDisabled={props.isDisabled}
      isReadOnly={props.isReadOnly}
      value={props.value}
      onChange={props.onChange}
      onSubmit={props.onSubmit}
    >
      {props.label ? <Label>{props.label}</Label> : null}
      <TokenInput>{(segment) => <Token>{segment.text}</Token>}</TokenInput>
      {props.description ? <Text slot="description">{props.description}</Text> : null}
    </TokenField>
  );
}

function selectContents(input: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(input);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

class FakeDataTransfer {
  #store = new Map<string, string>();

  get types(): string[] {
    return [...this.#store.keys()];
  }

  setData(type: string, value: string) {
    this.#store.set(type, value);
  }

  getData(type: string) {
    return this.#store.get(type) ?? "";
  }
}

function dispatchInput(input: HTMLElement, type: string, init: Record<string, unknown> = {}) {
  const event = new InputEvent("beforeinput", {
    bubbles: true,
    cancelable: true,
    inputType: type,
    data: typeof init.data === "string" ? init.data : null,
  });
  if (init.dataTransfer) {
    Object.defineProperty(event, "dataTransfer", { value: init.dataTransfer });
  }
  input.dispatchEvent(event);
}

describe("TokenField", () => {
  beforeEach(() => {
    installSelectionPolyfill();
    installStyleSheets();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("re-exports TokenFieldValue from the component module and the barrel", () => {
    expect(BarrelTokenFieldValue).toBe(TokenFieldValue);
    expect(TokenFieldContext).toBeTruthy();
    expect(Token).toBeTypeOf("function");
    expect(TokenInput).toBeTypeOf("function");
    expect(TokenField).toBeTypeOf("function");
  });

  it("links the textbox to the label and description", () => {
    render(() => <Field defaultValue={helloValue()} description="Description" label="Test" />);
    const input = screen.getByRole("textbox");
    expect(input.closest(".solidaria-TokenField")).toBeTruthy();
    expect(input).toHaveClass("solidaria-TokenInput");
    const labelledBy = input.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    const label = document.getElementById(labelledBy!);
    expect(label).toHaveClass("solidaria-Label");
    expect(label).toHaveTextContent("Test");
    expect(label?.tagName).toBe("SPAN");
    flush();
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(
      describedBy!
        .split(" ")
        .filter(Boolean)
        .map((id) => document.getElementById(id)?.textContent ?? "")
        .filter(Boolean)
        .join(" "),
    ).toBe("Description");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("supports aria-label without aria-labelledby", () => {
    render(() => <Field aria-label="Message" defaultValue={helloValue()} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-label", "Message");
    expect(input).not.toHaveAttribute("aria-labelledby");
  });

  it("marks disabled and read-only fields", () => {
    const { unmount } = render(() => (
      <Field aria-label="Message" defaultValue={helloValue()} isDisabled />
    ));
    const disabled = screen.getByRole("textbox");
    expect(disabled).toHaveAttribute("aria-disabled", "true");
    expect(disabled).toHaveAttribute("contenteditable", "false");
    expect(disabled.closest(".solidaria-TokenField")).toHaveAttribute("data-disabled", "true");
    unmount();

    render(() => <Field aria-label="Message" defaultValue={helloValue()} isReadOnly />);
    const readOnly = screen.getByRole("textbox");
    expect(readOnly).toHaveAttribute("aria-readonly", "true");
    expect(readOnly).toHaveAttribute("contenteditable", "false");
    expect(readOnly.closest(".solidaria-TokenField")).toHaveAttribute("data-readonly", "true");
  });

  it("focuses the textbox from the label and does not steal focus while blurred", () => {
    const [value, setValue] = createSignal(helloValue());
    render(() => <Field label="Test" value={value()} onChange={setValue} />);
    const input = screen.getByRole("textbox");
    const spy = vi.spyOn(Selection.prototype, "setBaseAndExtent");
    setValue(
      value().withSelectedRange(
        new TokenFieldValue.SelectedRange({ index: 0, offset: 5 }, { index: 0, offset: 1 }),
      ),
    );
    flush();
    expect(document.activeElement).not.toBe(input);
    expect(spy).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Test"));
    expect(document.activeElement).toBe(input);

    spy.mockClear();
    setValue(
      value().withSelectedRange(
        new TokenFieldValue.SelectedRange({ index: 0, offset: 5 }, { index: 0, offset: 0 }),
      ),
    );
    flush();
    expect(spy).toHaveBeenCalled();
    const call = spy.mock.calls.at(-1)!;
    expect(call[1]).toBeGreaterThan(call[3] as number);
  });

  it("wraps tokens and adopts the firefox selection stylesheet", async () => {
    const view = render(() => <Field aria-label="Message" defaultValue={tokenValue()} />);
    // The ref installs the sheet on a microtask after the node connects.
    await Promise.resolve();
    const wrapper = document.querySelector("[data-react-aria-token]");
    expect(wrapper).toBeTruthy();
    expect(wrapper?.textContent).toContain("Ada");
    expect(wrapper?.querySelector(".solidaria-Token")).toHaveTextContent("Ada");
    const sym = Symbol.for("react-aria-token-style");
    const sheet = document.adoptedStyleSheets.find(
      (item) => (item as CSSStyleSheet & Record<symbol, boolean>)[sym],
    );
    expect(sheet).toBeTruthy();
    const css =
      "css" in (sheet as object)
        ? (sheet as { css: string }).css
        : [...sheet!.cssRules].map((rule) => rule.cssText).join("");
    expect(css).toContain("data-react-aria-token");
    // jsdom serializes #ffffff01 as a nearly transparent rgb() color.
    expect(css.includes("#ffffff01") || css.includes("rgba(255, 255, 255, 0.004)")).toBe(true);
    view.unmount();
    expect(
      document.adoptedStyleSheets.some(
        (item) => (item as CSSStyleSheet & Record<symbol, boolean>)[sym],
      ),
    ).toBe(false);
  });

  it("keeps the selected range when blur is untrusted", () => {
    const initial = helloValue().withSelectedRange(
      new TokenFieldValue.SelectedRange({ index: 0, offset: 1 }, { index: 0, offset: 4 }),
    );
    const [value, setValue] = createSignal(initial);
    let latest = initial;
    render(() => (
      <Field
        aria-label="Message"
        value={value()}
        onChange={(next) => {
          latest = next;
          setValue(next);
        }}
      />
    ));
    const input = screen.getByRole("textbox");
    input.focus();
    selectContents(input);
    const remove = vi.spyOn(Selection.prototype, "removeAllRanges");
    fireEvent.blur(input);
    expect(remove).not.toHaveBeenCalled();
    expect(latest.selectedRange.isCollapsed).toBe(false);
  });

  it("submits on insertParagraph instead of inserting a newline", () => {
    const onSubmit = vi.fn();
    render(() => <Field aria-label="Message" defaultValue={helloValue()} onSubmit={onSubmit} />);
    const input = screen.getByRole("textbox");
    selectContents(input);
    dispatchInput(input, "insertParagraph");
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(input.textContent).toBe("hello");
    expect(input.textContent).not.toContain("\n");
  });

  it("rejects invalid clipboard JSON and inserts a valid token payload", () => {
    let latest = helloValue();
    render(() => (
      <Field
        aria-label="Message"
        defaultValue={helloValue()}
        onChange={(next) => {
          latest = next;
        }}
      />
    ));
    const input = screen.getByRole("textbox");
    selectContents(input);
    const invalid = new FakeDataTransfer();
    invalid.setData(MIME, "{not-json");
    invalid.setData("text/plain", "plain");
    dispatchInput(input, "insertFromPaste", { dataTransfer: invalid, data: "ignored" });
    expect(latest.toString()).toBe("plain");
    expect(input.querySelector("[data-react-aria-token]")).toBeNull();

    selectContents(input);
    const valid = new FakeDataTransfer();
    valid.setData(MIME, JSON.stringify([{ type: "token", text: "chip" }]));
    valid.setData("text/plain", "chip");
    const paste = new Event("paste", { bubbles: true });
    Object.defineProperty(paste, "clipboardData", { value: valid });
    input.dispatchEvent(paste);
    dispatchInput(input, "insertFromPaste", { data: "chip" });
    expect(
      latest.segments.some((segment) => segment.type === "token" && segment.text === "chip"),
    ).toBe(true);
    expect(input.textContent).toContain("chip");
  });

  it("selects a token wrapper on a virtual click and moves Home without Selection.modify", () => {
    render(() => <Field aria-label="Message" defaultValue={tokenValue()} />);
    const input = screen.getByRole("textbox");
    const token = input.querySelector(".solidaria-Token") as HTMLElement;
    const wrapper = token.parentElement!;
    fireEvent.click(token, { detail: 1 });
    const afterNormal = window.getSelection();
    const normalSelectsWrapper =
      !!afterNormal &&
      afterNormal.rangeCount > 0 &&
      !afterNormal.getRangeAt(0).collapsed &&
      afterNormal.getRangeAt(0).intersectsNode(wrapper);
    expect(normalSelectsWrapper).toBe(false);
    fireEvent.click(token, { detail: 0 });
    const selected = window.getSelection()?.getRangeAt(0);
    expect(selected?.collapsed).toBe(false);
    expect(selected?.intersectsNode(wrapper)).toBe(true);

    input.focus();
    setTokenFieldSelection(input, new TokenFieldValue.SelectedRange({ index: 0, offset: 3 }));
    const spy = vi.spyOn(Selection.prototype, "setBaseAndExtent");
    fireEvent.keyDown(input, { key: "Home" });
    expect(spy).toHaveBeenCalled();
    const call = spy.mock.calls.at(-1)!;
    expect(call[1]).toBe(0);
    expect(call[3]).toBe(0);
  });
});
