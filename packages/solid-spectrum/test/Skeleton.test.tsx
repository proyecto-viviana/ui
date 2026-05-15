/**
 * @vitest-environment jsdom
 */
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { createIcon } from "../src/icon";
import { Skeleton, SkeletonCollection, useIsSkeleton } from "../src/skeleton";
import { Text } from "../src/text";

const TestIcon = createIcon((props) => (
  <svg {...props}>
    <path d="M0 0h10v10H0z" />
  </svg>
));

function Probe() {
  const isSkeleton = useIsSkeleton();
  return <span data-testid="probe" data-skeleton={String(isSkeleton())} />;
}

describe("Skeleton (solid-spectrum)", () => {
  it("provides loading context without replacing children", () => {
    render(() => (
      <Skeleton isLoading>
        <Probe />
      </Skeleton>
    ));

    expect(screen.getByTestId("probe")).toHaveAttribute("data-skeleton", "true");
  });

  it("provides false context when loading is disabled", () => {
    render(() => (
      <Skeleton isLoading={false}>
        <Probe />
      </Skeleton>
    ));

    expect(screen.getByTestId("probe")).toHaveAttribute("data-skeleton", "false");
  });

  it("returns a reactive skeleton accessor", () => {
    const [isLoading, setIsLoading] = createSignal(true);
    render(() => (
      <Skeleton isLoading={isLoading()}>
        <Probe />
      </Skeleton>
    ));

    expect(screen.getByTestId("probe")).toHaveAttribute("data-skeleton", "true");

    setIsLoading(false);

    expect(screen.getByTestId("probe")).toHaveAttribute("data-skeleton", "false");
  });

  it("updates skeleton text when isLoading changes", () => {
    const [isLoading, setIsLoading] = createSignal(true);
    const { container } = render(() => (
      <Skeleton isLoading={isLoading()}>
        <Text>Placeholder title</Text>
      </Skeleton>
    ));

    const text = container.querySelector('[data-rsp-slot="text"]');
    expect(text).toHaveAttribute("inert");
    expect(container.querySelector("span[inert] span[inert]")).toBeInTheDocument();

    setIsLoading(false);

    expect(text).not.toHaveAttribute("inert");
    expect(container.querySelector("span[inert] span[inert]")).not.toBeInTheDocument();
  });

  it("does not add standalone status or aria-busy placeholders", () => {
    render(() => (
      <Skeleton isLoading>
        <Text>Placeholder title</Text>
      </Skeleton>
    ));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("preserves child refs while applying skeleton attributes", () => {
    let textRef: HTMLSpanElement | undefined;
    let iconRef: SVGSVGElement | undefined;
    const { container } = render(() => (
      <Skeleton isLoading>
        <Text ref={(element) => (textRef = element)}>Placeholder title</Text>
        <TestIcon ref={(element) => (iconRef = element)} aria-label="Add" />
      </Skeleton>
    ));

    expect(textRef).toBe(container.querySelector('[data-rsp-slot="text"]'));
    expect(textRef).toHaveAttribute("inert");
    expect(iconRef).toBe(container.querySelector("svg"));
    expect(iconRef).toHaveAttribute("inert");
  });
});

describe("SkeletonCollection (solid-spectrum)", () => {
  it("renders cached children inside a loading Skeleton", () => {
    let renderCount = 0;
    const { container } = render(() => (
      <SkeletonCollection>
        {() => {
          renderCount += 1;
          return <Text>Placeholder row</Text>;
        }}
      </SkeletonCollection>
    ));

    expect(renderCount).toBe(1);
    expect(container.querySelector('[data-rsp-slot="text"]')).toHaveAttribute("inert");
  });
});
