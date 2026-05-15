/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
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
      <BadgeContext.Provider
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
      </BadgeContext.Provider>
    ));

    const badge = container.querySelector('[role="presentation"]') as HTMLElement;
    expect(badge).toHaveClass("context-badge");
    expect(badge).toHaveClass("local-badge");
    expect(badge).toHaveClass("unsafe-badge");
    expect(badge.style.margin).toBe("2px");
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
});
