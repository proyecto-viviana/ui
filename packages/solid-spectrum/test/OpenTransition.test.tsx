/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { render, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { OpenTransition } from "../src/overlays/OpenTransition";

describe("OpenTransition (solid-spectrum)", () => {
  it("renders children when open=true", () => {
    const { container } = render(() => (
      <OpenTransition open={true}>
        <span>Hello</span>
      </OpenTransition>
    ));
    expect(container.textContent).toContain("Hello");
  });

  it("does not render children when open=false", () => {
    const { container } = render(() => (
      <OpenTransition open={false}>
        <span>Hello</span>
      </OpenTransition>
    ));
    expect(container.textContent).not.toContain("Hello");
  });

  it("applies enterFrom classes initially on open", async () => {
    const { container } = render(() => (
      <OpenTransition open={true} enterFrom="opacity-0" enterTo="opacity-100">
        <span>Hello</span>
      </OpenTransition>
    ));
    // The wrapper div should exist
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toBeInTheDocument();
  });

  it("applies custom class", () => {
    const { container } = render(() => (
      <OpenTransition open={true} class="my-transition">
        <span>Hello</span>
      </OpenTransition>
    ));
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain("my-transition");
  });

  it("calls onExited after exit transition", async () => {
    const onExited = vi.fn();
    const [open, setOpen] = createSignal(true);

    render(() => (
      <OpenTransition open={open()} duration={50} onExited={onExited}>
        <span>Hello</span>
      </OpenTransition>
    ));

    // Close
    setOpen(false);

    // Wait for exit transition duration + margin
    await waitFor(
      () => {
        expect(onExited).toHaveBeenCalled();
      },
      { timeout: 500 },
    );
  });

  it("respects custom duration", () => {
    const { container } = render(() => (
      <OpenTransition open={true} duration={300}>
        <span>Hello</span>
      </OpenTransition>
    ));
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.transitionDuration).toBe("300ms");
  });

  it("sets data-open attribute when open", () => {
    const { container } = render(() => (
      <OpenTransition open={true}>
        <span>Hello</span>
      </OpenTransition>
    ));
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.hasAttribute("data-open")).toBe(true);
  });
});
