/**
 * @vitest-environment jsdom
 */
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { CollectionBuilder } from "@proyecto-viviana/solidaria-components";
import { createIcon } from "../src/icon";
import {
  Skeleton,
  SkeletonCollection,
  SkeletonWrapper,
  type SkeletonCollectionProps,
  useIsSkeleton,
  useLoadingAnimation,
} from "../src/skeleton";
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

  it("does not add a wrapper around SkeletonWrapper children when loading is disabled", () => {
    const { container } = render(() => (
      <Skeleton isLoading={false}>
        <SkeletonWrapper>
          <span data-testid="wrapped">Loaded child</span>
        </SkeletonWrapper>
      </Skeleton>
    ));

    const wrapped = screen.getByTestId("wrapped");
    expect(container.firstElementChild).toBe(wrapped);
    expect(wrapped.parentElement).toBe(container);
  });

  it("starts, stops, and cleans up loading animations", () => {
    const previousAnimate = Element.prototype.animate;
    const cancel = vi.fn();
    const animation = { cancel, startTime: null as number | null };
    const animate = vi.fn(() => animation as unknown as Animation);
    let setIsAnimating: (value: boolean) => void = () => {};

    Element.prototype.animate = animate;

    try {
      const { unmount } = render(() => {
        const [isAnimating, setAnimating] = createSignal(true);
        setIsAnimating = setAnimating;
        const animationRef = useLoadingAnimation(isAnimating);

        return <span ref={animationRef} data-testid="animated" />;
      });

      expect(screen.getByTestId("animated")).toBeInTheDocument();
      expect(animate).toHaveBeenCalledTimes(1);
      expect(animation.startTime).toBe(0);

      setIsAnimating(false);
      expect(cancel).toHaveBeenCalledTimes(1);

      setIsAnimating(true);
      expect(animate).toHaveBeenCalledTimes(2);

      unmount();
      expect(cancel).toHaveBeenCalledTimes(2);
    } finally {
      Element.prototype.animate = previousAnimate;
    }
  });

  it("does not animate when reduced motion is requested", () => {
    const previousMatchMedia = window.matchMedia;
    const previousAnimate = Element.prototype.animate;
    const animate = vi.fn();

    window.matchMedia = vi.fn(
      () =>
        ({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );
    Element.prototype.animate = animate;

    try {
      render(() => {
        const animationRef = useLoadingAnimation(true);
        return <span ref={animationRef} data-testid="animated" />;
      });

      expect(screen.getByTestId("animated")).toBeInTheDocument();
      expect(animate).not.toHaveBeenCalled();
    } finally {
      window.matchMedia = previousMatchMedia;
      Element.prototype.animate = previousAnimate;
    }
  });
});

describe("SkeletonCollection (solid-spectrum)", () => {
  it("renders cached children inside a loading Skeleton", () => {
    let renderCount = 0;
    const collection = CollectionBuilder({
      items: [{ id: "row" }],
      addIdAndValue: true,
      children: () =>
        ({
          children: () => {
            renderCount += 1;
            return <Text>Placeholder row</Text>;
          },
        }) satisfies SkeletonCollectionProps,
    }) as Array<SkeletonCollectionProps>;

    const { container } = render(() => <>{collection.map((item) => SkeletonCollection(item))}</>);

    expect(renderCount).toBe(1);
    expect(container.querySelector('[data-rsp-slot="text"]')).toHaveAttribute("inert");
  });
});
