/** @vitest-environment jsdom */
import h from "@solidjs/h";
import { createMemo, createSignal, flush } from "solid-js";
import type { JSX } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { Badge } from "../src/badge";
import { Text } from "../src/text";
import { createIcon } from "../src/icon/spectrum-icon";

const TestIcon = createIcon((props) => (
  <svg {...props}>
    <path d="M0 0h10v10H0z" />
  </svg>
));

describe("Badge accessor children (viviana-ui)", () => {
  it("preserves literal, explicit Text and direct mixed child structure", () => {
    render(() => (
      <>
        <Badge data-testid="literal-badge">Literal release</Badge>
        <Badge data-testid="explicit-badge">
          <Text>Explicit release</Text>
        </Badge>
        <Badge data-testid="direct-badge">
          <TestIcon />
          <Text>Direct release</Text>
        </Badge>
      </>
    ));
    for (const [id, label] of [
      ["literal-badge", "Literal release"],
      ["explicit-badge", "Explicit release"],
      ["direct-badge", "Direct release"],
    ] as const) {
      const root = screen.getByTestId(id);
      const text = screen.getByText(label);
      expect(text).toHaveAttribute("data-rsp-slot", "text");
      expect(text.parentElement).toBe(root);
      expect(root.querySelectorAll('[data-rsp-slot="text"]')).toHaveLength(1);
      expect(root.children).toHaveLength(id === "direct-badge" ? 2 : 1);
    }
    const root = screen.getByTestId("direct-badge");
    const icon = root.querySelector("svg");
    expect(icon).toHaveAttribute("data-slot", "icon");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon?.parentElement).toHaveAttribute("slot", "icon");
    expect(icon?.parentElement?.parentElement).toBe(root);
  });

  it("keeps memo Icon and Text children as reactive original root siblings", () => {
    let setLabel!: (value: string) => void;
    render(() => {
      const [label, updateLabel] = createSignal("Memo release");
      setLabel = updateLabel;
      const props = {
        "data-testid": "memo-badge",
        // Instantiate these children lazily inside Badge's slot contexts.
        get children(): JSX.Element {
          return createMemo(() => [<TestIcon />, <Text>{label()}</Text>]) as unknown as JSX.Element;
        },
      };
      return <Badge {...props} />;
    });
    const root = screen.getByTestId("memo-badge");
    const icon = root.querySelector("svg");
    const baseline = icon?.parentElement;
    const text = screen.getByText("Memo release");
    expect(root).toHaveAttribute("role", "presentation");
    expect(icon).toHaveAttribute("data-slot", "icon");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(baseline).toHaveAttribute("slot", "icon");
    expect(baseline?.parentElement).toBe(root);
    expect(text).toHaveAttribute("data-rsp-slot", "text");
    expect(text.parentElement).toBe(root);
    expect(root.children).toHaveLength(2);
    expect(root.querySelectorAll('[data-rsp-slot="text"]')).toHaveLength(1);

    setLabel("Updated memo release");
    flush();
    expect(screen.getByTestId("memo-badge")).toBe(root);
    expect(root.querySelector("svg")).toBe(icon);
    expect(icon?.parentElement).toBe(baseline);
    expect(baseline?.parentElement).toBe(root);
    expect(screen.getByText("Updated memo release")).toBe(text);
    expect(text.parentElement).toBe(root);
    expect(root.children).toHaveLength(2);
    expect(root.querySelectorAll('[data-rsp-slot="text"]')).toHaveLength(1);
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("preserves actual getter-array closure hyperscript Icon/Text root siblings", () => {
    render(() => {
      const [demoProps] = createSignal({ children: "Snapshot release" });
      const props = {
        "data-testid": "hyperscript-badge",
        get children(): JSX.Element {
          // Match the comparison getter's captured props object, not a live Text getter.
          const snapshot = demoProps();
          return [
            () => [h(TestIcon, { "aria-hidden": "true" }), h(Text, {}, snapshot.children)],
          ] as unknown as JSX.Element;
        },
      };
      return <Badge {...props} />;
    });
    const root = screen.getByTestId("hyperscript-badge");
    const icon = root.querySelector("svg");
    const baseline = icon?.parentElement;
    const text = screen.getByText("Snapshot release");
    expect(root).toHaveAttribute("role", "presentation");
    expect(icon).toHaveAttribute("data-slot", "icon");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(baseline).toHaveAttribute("slot", "icon");
    expect(baseline?.parentElement).toBe(root);
    expect(text).toHaveAttribute("data-rsp-slot", "text");
    expect(text.parentElement).toBe(root);
    expect(root.children).toHaveLength(2);
    expect(root.querySelectorAll('[data-rsp-slot="text"]')).toHaveLength(1);
  });
});
