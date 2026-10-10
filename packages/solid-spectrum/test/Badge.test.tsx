/**
 * @vitest-environment jsdom
 */
import h from "@solidjs/h";
import { createMemo, createSignal, flush } from "solid-js";
import type { JSX } from "@solidjs/web";
import { describe, expect, it, vi } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { Badge, BadgeContext, Text, createIcon } from "../src";
import { Skeleton } from "../src/skeleton";

const TestIcon = createIcon((props) => (
  <svg {...props}>
    <path d="M0 0h10v10H0z" />
  </svg>
));

describe("Badge (solid-spectrum)", () => {
  it("renders S2 text-only badge content", () => {
    const { container } = render(() => <Badge>Beta</Badge>);

    const badge = container.querySelector('[role="presentation"]');
    expect(badge).toBeInTheDocument();
    expect(badge?.tagName).toBe("SPAN");
    expect(badge?.className).not.toBe("");
    expect(screen.getByText("Beta")).toHaveAttribute("data-rsp-slot", "text");
  });

  it("supports S2 variants, fill styles, sizes, and overflow mode", () => {
    render(() => (
      <>
        <Badge>Default</Badge>
        <Badge variant="positive" fillStyle="subtle" size="XL" overflowMode="truncate">
          Positive
        </Badge>
        <Badge variant="negative" fillStyle="outline" size="M">
          Negative
        </Badge>
      </>
    ));

    const defaultBadge = screen.getByText("Default").closest('[role="presentation"]');
    const positiveBadge = screen.getByText("Positive").closest('[role="presentation"]');
    const negativeBadge = screen.getByText("Negative").closest('[role="presentation"]');

    expect(positiveBadge?.className).not.toBe(defaultBadge?.className);
    expect(negativeBadge?.className).not.toBe(defaultBadge?.className);
    expect(screen.getByText("Positive").className).not.toBe(screen.getByText("Default").className);
  });

  it("keeps legacy count and variant aliases mapped to S2 styles", () => {
    render(() => (
      <>
        <Badge count={42} variant="primary" />
        <Badge count={7} variant="accent" />
        <Badge count={3} variant="success" />
        <Badge count={5} variant="positive" />
      </>
    ));

    expect(screen.getByText("42")).toHaveAttribute("data-rsp-slot", "text");
    expect(screen.getByText("42").closest('[role="presentation"]')?.className).toBe(
      screen.getByText("7").closest('[role="presentation"]')?.className,
    );
    expect(screen.getByText("3").closest('[role="presentation"]')?.className).toBe(
      screen.getByText("5").closest('[role="presentation"]')?.className,
    );
  });

  it("provides icon and text slot context", () => {
    const { container } = render(() => (
      <Badge>
        <TestIcon />
        <Text>Published</Text>
      </Badge>
    ));

    const icon = container.querySelector("svg");
    expect(icon).toHaveAttribute("data-slot", "icon");
    expect(icon?.parentElement?.className).not.toBe("");
    expect(screen.getByText("Published")).toHaveAttribute("data-rsp-slot", "text");
  });

  it("supports context props and unsafe escape hatches", () => {
    const { container } = render(() => (
      <BadgeContext
        value={{
          variant: "negative",
          fillStyle: "outline",
          UNSAFE_className: "context-badge",
          UNSAFE_style: { margin: "2px" },
        }}
      >
        <Badge class="local-badge" UNSAFE_className="unsafe-badge">
          Context
        </Badge>
      </BadgeContext>
    ));

    const badge = container.querySelector('[role="presentation"]') as HTMLElement;
    expect(badge).toHaveClass("context-badge");
    expect(badge).toHaveClass("local-badge");
    expect(badge).toHaveClass("unsafe-badge");
    expect(badge.style.margin).toBe("2px");
  });

  it("matches S2 DOM prop filtering on the root", () => {
    const onClick = vi.fn();

    const { container } = render(() => (
      <Badge
        id="release-state"
        data-testid="badge"
        aria-label="Release state"
        aria-labelledby="release-label"
        aria-describedby="release-description"
        aria-details="release-details"
        hidden
        onClick={onClick}
      >
        Published
      </Badge>
    ));

    const badge = container.querySelector('[data-testid="badge"]') as HTMLElement;
    badge.click();

    expect(badge).toHaveAttribute("id", "release-state");
    expect(badge).toHaveAttribute("data-testid", "badge");
    expect(badge).not.toHaveAttribute("aria-label");
    expect(badge).not.toHaveAttribute("aria-labelledby");
    expect(badge).not.toHaveAttribute("aria-describedby");
    expect(badge).not.toHaveAttribute("aria-details");
    expect(badge).not.toHaveAttribute("hidden");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("uses the shared Skeleton wrapper", () => {
    const { container } = render(() => (
      <Skeleton isLoading>
        <Badge>Loading</Badge>
      </Skeleton>
    ));

    expect(container.firstElementChild).toHaveAttribute("inert", "true");
    expect(container.querySelector('[role="presentation"]')).toBeInTheDocument();
  });

  it("updates mixed text children reactively without recreating the badge", () => {
    let setCount!: (value: number) => void;
    const { container } = render(() => {
      const [count, updateCount] = createSignal(0);
      setCount = updateCount;
      return <Badge>count: {count()}</Badge>;
    });

    const badge = container.querySelector('[role="presentation"]');
    expect(badge).toHaveTextContent("count: 0");
    setCount(1);
    flush();
    expect(container.querySelector('[role="presentation"]')).toBe(badge);
    expect(badge).toHaveTextContent("count: 1");
  });

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
