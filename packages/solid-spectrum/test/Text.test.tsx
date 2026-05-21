/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import {
  Content,
  ContentContext,
  Footer,
  FooterContext,
  Header,
  HeaderContext,
  Heading,
  HeadingContext,
  Keyboard,
  KeyboardContext,
  Text,
  TextContext,
  type TextProps,
} from "../src";

describe("Text content primitives (solid-spectrum)", () => {
  it("renders Text as the S2 unstyled text slot primitive", () => {
    render(() => (
      <Text id="label" itemProp="name" data-testid="text">
        Label
      </Text>
    ));

    const text = screen.getByTestId("text");
    expect(text.tagName).toBe("SPAN");
    expect(text).toHaveAttribute("data-rsp-slot", "text");
    expect(text).toHaveAttribute("id", "label");
    expect(text).toHaveAttribute("itemprop", "name");
    expect(text.className).toBe("");
  });

  it("merges context props, unsafe escape hatches, style, and refs", () => {
    let contextRef: HTMLSpanElement | undefined;
    let localRef: HTMLSpanElement | undefined;

    render(() => (
      <TextContext.Provider
        value={{
          UNSAFE_className: "context-text",
          UNSAFE_style: { color: "red", margin: "1px" },
          ref: (element) => (contextRef = element),
        }}
      >
        <Text
          data-testid="context-text"
          UNSAFE_className="local-text"
          UNSAFE_style={{ margin: "2px" }}
          ref={(element) => (localRef = element)}
        >
          Context
        </Text>
      </TextContext.Provider>
    ));

    const text = screen.getByTestId("context-text") as HTMLSpanElement;
    expect(text).toHaveClass("context-text");
    expect(text).toHaveClass("local-text");
    expect(text.style.color).toBe("red");
    expect(text.style.margin).toBe("2px");
    expect(contextRef).toBe(text);
    expect(localRef).toBe(text);
  });

  it("filters legacy Text aliases and arbitrary DOM event props", () => {
    const onClick = vi.fn();
    const legacyProps = {
      variant: "danger",
      size: "lg",
      class: "legacy-class",
      style: { color: "red" },
      onClick,
      "data-rsp-slot": "custom",
      "data-testid": "legacy-text",
    } as unknown as TextProps;

    render(() => <Text {...legacyProps}>Filtered</Text>);

    const text = screen.getByTestId("legacy-text");
    fireEvent.click(text);

    expect(text).toHaveAttribute("data-rsp-slot", "text");
    expect(text).not.toHaveClass("legacy-class");
    expect(text.style.color).toBe("");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders Heading, Header, Content, Footer, and Keyboard with S2 DOM shapes", () => {
    const { container } = render(() => (
      <>
        <Heading level={1} data-testid="heading" slot="title">
          Title
        </Heading>
        <Header data-testid="header">Header</Header>
        <Content data-testid="content">Content</Content>
        <Footer data-testid="footer">Footer</Footer>
        <Keyboard data-testid="keyboard">Ctrl+C</Keyboard>
      </>
    ));

    expect(screen.getByTestId("heading").tagName).toBe("H1");
    expect(screen.getByTestId("heading")).toHaveAttribute("slot", "title");
    expect(screen.getByTestId("header").tagName).toBe("HEADER");
    expect(screen.getByTestId("content").tagName).toBe("DIV");
    expect(screen.getByTestId("footer").tagName).toBe("FOOTER");
    expect(screen.getByTestId("keyboard").tagName).toBe("KBD");
    expect(screen.getByTestId("keyboard")).toHaveAttribute("dir", "ltr");
    expect(container.querySelectorAll(".text-primary-100")).toHaveLength(0);
  });

  it("supports context slots for content primitives", () => {
    render(() => (
      <HeadingContext.Provider
        value={{
          slots: {
            title: { level: 2, UNSAFE_className: "slot-heading" },
          },
        }}
      >
        <HeaderContext.Provider value={{ UNSAFE_className: "slot-header" }}>
          <ContentContext.Provider value={{ UNSAFE_className: "slot-content" }}>
            <FooterContext.Provider value={{ UNSAFE_className: "slot-footer" }}>
              <KeyboardContext.Provider value={{ UNSAFE_className: "slot-keyboard" }}>
                <Heading slot="title" data-testid="slot-heading">
                  Slot title
                </Heading>
                <Header data-testid="slot-header">Header</Header>
                <Content data-testid="slot-content">Content</Content>
                <Footer data-testid="slot-footer">Footer</Footer>
                <Keyboard data-testid="slot-keyboard">K</Keyboard>
              </KeyboardContext.Provider>
            </FooterContext.Provider>
          </ContentContext.Provider>
        </HeaderContext.Provider>
      </HeadingContext.Provider>
    ));

    expect(screen.getByTestId("slot-heading").tagName).toBe("H2");
    expect(screen.getByTestId("slot-heading")).toHaveClass("slot-heading");
    expect(screen.getByTestId("slot-header")).toHaveClass("slot-header");
    expect(screen.getByTestId("slot-content")).toHaveClass("slot-content");
    expect(screen.getByTestId("slot-footer")).toHaveClass("slot-footer");
    expect(screen.getByTestId("slot-keyboard")).toHaveClass("slot-keyboard");
  });

  it("omits all content primitives when isHidden is true", () => {
    render(() => (
      <>
        <Text isHidden data-testid="hidden-text">
          Text
        </Text>
        <Heading isHidden data-testid="hidden-heading">
          Heading
        </Heading>
        <Header isHidden data-testid="hidden-header">
          Header
        </Header>
        <Content isHidden data-testid="hidden-content">
          Content
        </Content>
        <Footer isHidden data-testid="hidden-footer">
          Footer
        </Footer>
        <Keyboard isHidden data-testid="hidden-keyboard">
          K
        </Keyboard>
      </>
    ));

    expect(screen.queryByTestId("hidden-text")).not.toBeInTheDocument();
    expect(screen.queryByTestId("hidden-heading")).not.toBeInTheDocument();
    expect(screen.queryByTestId("hidden-header")).not.toBeInTheDocument();
    expect(screen.queryByTestId("hidden-content")).not.toBeInTheDocument();
    expect(screen.queryByTestId("hidden-footer")).not.toBeInTheDocument();
    expect(screen.queryByTestId("hidden-keyboard")).not.toBeInTheDocument();
  });
});
