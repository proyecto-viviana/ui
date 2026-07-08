/**
 * Tests for solidaria-components SharedElementTransition
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { createSignal, type JSX } from "solid-js";
import {
  SharedElement,
  SharedElementTransition,
  useHasSharedElementTransitionScope,
} from "../src/SharedElementTransition";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SharedElementTransition", () => {
  it("renders shared element inside transition scope", () => {
    render(() => (
      <SharedElementTransition>
        <SharedElement name="card">Card</SharedElement>
      </SharedElementTransition>
    ));

    expect(screen.getByText("Card")).toBeInTheDocument();
  });

  it("throws when SharedElement is outside scope", () => {
    expect(() => render(() => <SharedElement name="card">Card</SharedElement>)).toThrow(
      "<SharedElement> must be rendered inside a <SharedElementTransition>",
    );
  });

  it("does not render when hidden", () => {
    const { container } = render(() => (
      <SharedElementTransition>
        <SharedElement name="card" isVisible={false}>
          Card
        </SharedElement>
      </SharedElementTransition>
    ));

    expect(container).not.toHaveTextContent("Card");
  });

  it("sets entering state when becoming visible", async () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    function TestHarness(): JSX.Element {
      const [visible, setVisible] = createSignal(false);
      return (
        <>
          <button type="button" onClick={() => setVisible(true)}>
            Show
          </button>
          <SharedElementTransition>
            <SharedElement name="card" isVisible={visible()}>
              Card
            </SharedElement>
          </SharedElementTransition>
        </>
      );
    }

    render(() => <TestHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Show" }));
    expect(await screen.findByText("Card")).toBeInTheDocument();
  });

  it("forwards ref to the underlying div", () => {
    let capturedRef: HTMLDivElement | undefined;

    render(() => (
      <SharedElementTransition>
        <SharedElement
          name="card"
          ref={(el) => {
            capturedRef = el;
          }}
        >
          Card
        </SharedElement>
      </SharedElementTransition>
    ));

    expect(capturedRef).toBeInstanceOf(HTMLDivElement);
    expect(capturedRef!.textContent).toBe("Card");
  });

  it("sets data-entering attribute during enter phase", async () => {
    // Don't fire the RAF callback so we stay in "entering" state
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 999);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const [visible, setVisible] = createSignal(false);

    render(() => (
      <>
        <button type="button" onClick={() => setVisible(true)}>
          Show
        </button>
        <SharedElementTransition>
          <SharedElement name="card" isVisible={visible()}>
            Card
          </SharedElement>
        </SharedElementTransition>
      </>
    ));

    fireEvent.click(screen.getByRole("button", { name: "Show" }));
    // A fresh enter (no previous snapshot) defers "entering" to a microtask, as
    // upstream does (`queueMicrotask(() => flushSync(() => setState('entering')))`):
    // the incoming div mounts "visible" first, then flips to "entering".
    await Promise.resolve();
    const el = screen.getByText("Card");
    expect(el).toHaveAttribute("data-entering");
    expect(el).not.toHaveAttribute("data-exiting");
  });

  it("FLIPs an incoming same-name element from the outgoing element's snapshot", async () => {
    // Suppress rAF so the FLIP override / entering promotion does not advance,
    // leaving the post-swap lifecycle state observable.
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 999);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const [which, setWhich] = createSignal<"a" | "b">("a");
    render(() => (
      <SharedElementTransition>
        <SharedElement
          name="ind"
          isVisible={which() === "a"}
          style={{ "transition-property": "translate" }}
        >
          A
        </SharedElement>
        <SharedElement
          name="ind"
          isVisible={which() === "b"}
          style={{ "transition-property": "translate" }}
        >
          B
        </SharedElement>
      </SharedElementTransition>
    ));

    // A is visible, B is hidden.
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.queryByText("B")).not.toBeInTheDocument();

    // Move selection A -> B in one update: A's store-phase captures its snapshot
    // (render phase) and B mounts (mount-in-render) and consumes it in the FLIP
    // branch (read phase). The FLIP branch lands directly on "visible" — it does
    // NOT pass through "entering". The pre-fix code stored no snapshot on the
    // isVisible flip and never mounted B before the read effect, so B could only
    // enter fresh (data-entering). This is the observable two-phase signal.
    setWhich("b");
    await Promise.resolve();

    const b = screen.getByText("B");
    expect(b).toBeInTheDocument();
    expect(b).not.toHaveAttribute("data-entering");
    expect(screen.queryByText("A")).not.toBeInTheDocument();
  });

  it("forwards DOM props (id, data attributes)", () => {
    render(() => (
      <SharedElementTransition>
        <SharedElement name="card" id="my-shared" data-testid="shared">
          Card
        </SharedElement>
      </SharedElementTransition>
    ));

    const el = screen.getByTestId("shared");
    expect(el).toHaveAttribute("id", "my-shared");
  });
});

describe("useHasSharedElementTransitionScope", () => {
  it("returns true inside scope", () => {
    let result = false;
    function Probe() {
      result = useHasSharedElementTransitionScope();
      return null;
    }

    render(() => (
      <SharedElementTransition>
        <Probe />
      </SharedElementTransition>
    ));

    expect(result).toBe(true);
  });

  it("returns false outside scope", () => {
    let result = true;
    function Probe() {
      result = useHasSharedElementTransitionScope();
      return null;
    }

    render(() => <Probe />);
    expect(result).toBe(false);
  });
});
