/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vite-plus/test";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { type Context } from "solid-js";
import { Heading, HeadingContext } from "../src/Heading";
import { Provider } from "../src/utils";

describe("Heading", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders an h3 by default with the solidaria-Heading class", () => {
    render(() => <Heading>Heading text</Heading>);

    const heading = screen.getByRole("heading", { level: 3, name: "Heading text" });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass("solidaria-Heading");
    expect(heading.tagName.toLowerCase()).toBe("h3");
  });

  it("supports explicit heading levels 1 through 6", () => {
    const { unmount: u1 } = render(() => <Heading level={1}>Level 1</Heading>);
    expect(screen.getByRole("heading", { level: 1, name: "Level 1" }).tagName.toLowerCase()).toBe(
      "h1",
    );
    u1();

    const { unmount: u2 } = render(() => <Heading level={2}>Level 2</Heading>);
    expect(screen.getByRole("heading", { level: 2, name: "Level 2" }).tagName.toLowerCase()).toBe(
      "h2",
    );
    u2();

    const { unmount: u4 } = render(() => <Heading level={4}>Level 4</Heading>);
    expect(screen.getByRole("heading", { level: 4, name: "Level 4" }).tagName.toLowerCase()).toBe(
      "h4",
    );
    u4();

    const { unmount: u5 } = render(() => <Heading level={5}>Level 5</Heading>);
    expect(screen.getByRole("heading", { level: 5, name: "Level 5" }).tagName.toLowerCase()).toBe(
      "h5",
    );
    u5();

    const { unmount: u6 } = render(() => <Heading level={6}>Level 6</Heading>);
    expect(screen.getByRole("heading", { level: 6, name: "Level 6" }).tagName.toLowerCase()).toBe(
      "h6",
    );
    u6();
  });

  it("supports custom className", () => {
    render(() => <Heading class="custom-heading">Custom</Heading>);

    const heading = screen.getByRole("heading", { name: "Custom" });
    expect(heading).toHaveClass("custom-heading");
  });

  it("forwards ref to the heading element", () => {
    let headingRef: HTMLHeadingElement | undefined;
    render(() => <Heading ref={(el) => (headingRef = el)}>With Ref</Heading>);

    expect(headingRef).toBeInstanceOf(HTMLHeadingElement);
    expect(headingRef?.tagName.toLowerCase()).toBe("h3");
  });

  it("forwards DOM props such as id and data attributes", () => {
    render(() => (
      <Heading id="custom-id" data-testid="heading-test">
        Props
      </Heading>
    ));

    const heading = screen.getByTestId("heading-test");
    expect(heading).toHaveAttribute("id", "custom-id");
  });

  it("consumes HeadingContext to override level and props", () => {
    render(() => (
      <HeadingContext value={{ level: 1, class: "context-heading" }}>
        <Heading>Context Title</Heading>
      </HeadingContext>
    ));

    const heading = screen.getByRole("heading", { level: 1, name: "Context Title" });
    expect(heading.tagName.toLowerCase()).toBe("h1");
    expect(heading).toHaveClass("context-heading");
  });

  it("supports slotted HeadingContext via Provider", () => {
    render(() => (
      <Provider
        values={
          [
            [
              HeadingContext,
              {
                slots: {
                  title: { level: 2, id: "slotted-title" },
                  subtitle: { level: 4, id: "slotted-sub" },
                },
              },
            ],
          ] as Array<[Context<unknown>, unknown]>
        }
      >
        <Heading slot="title">Main Title</Heading>
        <Heading slot="subtitle">Sub Title</Heading>
      </Provider>
    ));

    const title = screen.getByRole("heading", { level: 2, name: "Main Title" });
    expect(title.tagName.toLowerCase()).toBe("h2");
    expect(title).toHaveAttribute("id", "slotted-title");

    const sub = screen.getByRole("heading", { level: 4, name: "Sub Title" });
    expect(sub.tagName.toLowerCase()).toBe("h4");
    expect(sub).toHaveAttribute("id", "slotted-sub");
  });
});
