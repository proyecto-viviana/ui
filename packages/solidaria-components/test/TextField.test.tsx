/**
 * Tests for solidaria-components TextField
 *
 * These tests verify the headless TextField component follows
 * react-aria-components patterns.
 *
 * The Label, Input, and TextArea sub-components automatically wire up to
 * TextField context for proper accessibility and focus tracking.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import {
  TextField,
  TextFieldContext,
  Input,
  Label,
  TextArea,
  type TextFieldRenderProps,
} from "../src/TextField";
import { FieldError } from "../src/FieldError";
import { Text } from "../src/Text";
import {
  setupUser,
  assertNoA11yViolations,
  assertAriaIdIntegrity,
} from "@proyecto-viviana/solidaria-test-utils";

// setupUser is consolidated in solidaria-test-utils.

describe("TextField", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function TestTextField(
    props: Parameters<typeof TextField>[0] & { input?: typeof Input | typeof TextArea } = {},
  ) {
    const Component = props.input ?? Input;
    const { input: _input, ...rest } = props;
    return (
      <TextField defaultValue="test" data-testid="text-field-test" data-foo="bar" {...rest}>
        {() => (
          <>
            <Label>Test</Label>
            <Component />
            <Text slot="description">Description</Text>
            <Text slot="errorMessage">Error</Text>
          </>
        )}
      </TextField>
    );
  }

  describe("rendering", () => {
    it("should render a text field with default class", () => {
      render(() => (
        <TextField aria-label="Name">
          <input />
        </TextField>
      ));
      const wrapper = screen.getByRole("textbox").closest("div");
      expect(wrapper).toHaveClass("solidaria-TextField");
    });

    it("should render a text field with custom class", () => {
      render(() => (
        <TextField aria-label="Name" class="custom-field">
          <input />
        </TextField>
      ));
      const wrapper = screen.getByRole("textbox").closest("div");
      expect(wrapper).toHaveClass("custom-field");
    });

    it("should render children", () => {
      render(() => (
        <TextField aria-label="Name">
          <input placeholder="Enter name" />
        </TextField>
      ));

      expect(screen.getByPlaceholderText("Enter name")).toBeInTheDocument();
    });

    it("provides slots", () => {
      render(() => <TestTextField />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("test");
      expect(input).toHaveAttribute("class", "solidaria-Input");
      expect(input).toHaveAttribute("type", "text");
      expect(input.closest(".solidaria-TextField")).toHaveAttribute("data-foo", "bar");
      expect(screen.getByText("Test")).toHaveAttribute("class", "solidaria-Label");
    });

    it("links aria-describedby to a <Text slot=\"description\"> via TextContext slots", () => {
      // TextField provides descriptionProps as a TextContext slot, so the
      // <Text slot="description"> picks up the id the input's aria-describedby
      // references — the faithful upstream wiring path.
      render(() => (
        <TextField description="Help text">
          {() => (
            <>
              <Label>Test</Label>
              <Input />
              <Text slot="description">Help text</Text>
            </>
          )}
        </TextField>
      ));

      const input = screen.getByRole("textbox");
      const describedById = input.getAttribute("aria-describedby");
      expect(describedById).toBeTruthy();
      const description = document.getElementById(describedById!);
      expect(description).toHaveTextContent("Help text");
      expect(description).toHaveClass("solidaria-Text");
    });

    it("should support slot", () => {
      render(() => (
        <TextFieldContext.Provider value={{ slots: { test: { "aria-label": "test" } } }}>
          <TestTextField slot="test" />
        </TextFieldContext.Provider>
      ));

      const input = screen.getByRole("textbox");
      expect(input.closest(".solidaria-TextField")).toHaveAttribute("slot", "test");
      expect(input).toHaveAttribute("aria-label", "test");
    });

    it("should support custom render function", () => {
      render(() => <TestTextField render={(props) => <div {...props} data-custom="true" />} />);

      const field = screen.getByRole("textbox").closest(".solidaria-TextField");
      expect(field).toHaveAttribute("data-custom", "true");
    });
  });

  describe("focus stability", () => {
    it("keeps the same input node focused after a text input event", async () => {
      render(() => <TestTextField />);
      const input = screen.getByRole("textbox") as HTMLInputElement;

      input.focus();
      fireEvent.input(input, { target: { value: "testx" } });
      await Promise.resolve();

      expect(input.isConnected).toBe(true);
      expect(screen.getByRole("textbox")).toBe(input);
      expect(document.activeElement).toBe(input);
    });

    it("keeps the same textarea node focused after a text input event", async () => {
      render(() => <TestTextField input={TextArea} />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      textarea.focus();
      fireEvent.input(textarea, { target: { value: "testx" } });
      await Promise.resolve();

      expect(textarea.isConnected).toBe(true);
      expect(screen.getByRole("textbox")).toBe(textarea);
      expect(document.activeElement).toBe(textarea);
    });
  });

  describe("render props", () => {
    it("should support render props for children", () => {
      render(() => (
        <TextField aria-label="Name" isDisabled>
          {(props: TextFieldRenderProps) => (
            <div data-testid="content">
              {props.isDisabled ? "Disabled" : "Enabled"}
              <input />
            </div>
          )}
        </TextField>
      ));

      expect(screen.getByText("Disabled")).toBeInTheDocument();
    });

    // Note: Focus render props require the Input component to have context from TextField.
    // In SolidJS, children are evaluated before parent renders, so context isn't available.
    // This is a known SolidJS architectural difference from React. The plain <input> element
    // works for value and other props, but focus state tracking with <Input> requires
    // architectural changes. React Aria doesn't test isFocused on TextField either.

    it("should provide isHovered in render props", async () => {
      render(() => (
        <TextField
          aria-label="Name"
          class={(props: TextFieldRenderProps) => (props.isHovered ? "hovered" : "not-hovered")}
        >
          <input />
        </TextField>
      ));

      const wrapper = screen.getByRole("textbox").closest("div")!;
      expect(wrapper).toHaveClass("not-hovered");

      await user.hover(wrapper);
      expect(wrapper).toHaveClass("hovered");
    });

    it("should support hover state", async () => {
      render(() => <TestTextField class={({ isHovered }) => (isHovered ? "hover" : "")} />);

      const input = screen.getByRole("textbox");
      const wrapper = input.closest("div")!;
      expect(wrapper).not.toHaveAttribute("data-hovered");
      expect(wrapper).not.toHaveClass("hover");

      await user.hover(wrapper);
      expect(wrapper).toHaveAttribute("data-hovered");
      expect(wrapper).toHaveClass("hover");
    });

    it("should support focus visible state", async () => {
      render(() => (
        <TestTextField class={({ isFocusVisible }) => (isFocusVisible ? "focus" : "")} />
      ));

      const input = screen.getByRole("textbox");
      const wrapper = input.closest("div")!;
      expect(wrapper).not.toHaveAttribute("data-focus-visible");
      expect(wrapper).not.toHaveClass("focus");

      await user.tab();
      expect(wrapper).toHaveAttribute("data-focus-visible");
      expect(wrapper).toHaveClass("focus");
    });

    it("should provide isInvalid in render props", () => {
      render(() => (
        <TextField aria-label="Name" isInvalid>
          {(props: TextFieldRenderProps) => (
            <div data-testid="content">
              {props.isInvalid ? "Invalid" : "Valid"}
              <input />
            </div>
          )}
        </TextField>
      ));

      expect(screen.getByText("Invalid")).toBeInTheDocument();
    });

    it("should provide isRequired in render props", () => {
      render(() => (
        <TextField aria-label="Name" isRequired>
          {(props: TextFieldRenderProps) => (
            <div data-testid="content">
              {props.isRequired ? "Required" : "Optional"}
              <input />
            </div>
          )}
        </TextField>
      ));

      expect(screen.getByText("Required")).toBeInTheDocument();
    });

    it("should provide isReadOnly in render props", () => {
      render(() => (
        <TextField aria-label="Name" isReadOnly>
          {(props: TextFieldRenderProps) => (
            <div data-testid="content">
              {props.isReadOnly ? "ReadOnly" : "Editable"}
              <input />
            </div>
          )}
        </TextField>
      ));

      expect(screen.getByText("ReadOnly")).toBeInTheDocument();
    });

    it("should support read-only state", () => {
      render(() => <TestTextField isReadOnly />);
      const input = screen.getByRole("textbox");

      expect(input.closest(".solidaria-TextField")).toHaveAttribute("data-readonly");
    });

    it("should support required state", () => {
      render(() => <TestTextField isRequired />);
      const input = screen.getByRole("textbox");

      expect(input.closest(".solidaria-TextField")).toHaveAttribute("data-required");
      expect(input).toHaveAttribute("required");
      expect(input).not.toHaveAttribute("aria-required");
    });

    it("should support aria validation for required input state", () => {
      render(() => <TestTextField isRequired validationBehavior="aria" />);
      const input = screen.getByRole("textbox");

      expect(input.closest(".solidaria-TextField")).toHaveAttribute("data-required");
      expect(input).not.toHaveAttribute("required");
      expect(input).toHaveAttribute("aria-required", "true");
    });

    it("should support required textarea state", () => {
      render(() => <TestTextField input={TextArea} isRequired />);
      const textarea = screen.getByRole("textbox");

      expect(textarea.closest(".solidaria-TextField")).toHaveAttribute("data-required");
      expect(textarea).toHaveAttribute("required");
      expect(textarea).not.toHaveAttribute("aria-required");
    });

    it("should support aria validation for required textarea state", () => {
      render(() => <TestTextField input={TextArea} isRequired validationBehavior="aria" />);
      const textarea = screen.getByRole("textbox");

      expect(textarea.closest(".solidaria-TextField")).toHaveAttribute("data-required");
      expect(textarea).not.toHaveAttribute("required");
      expect(textarea).toHaveAttribute("aria-required", "true");
    });

    it("supports validation errors", () => {
      render(() => (
        <TextField isInvalid errorMessage="Constraints not satisfied">
          {() => (
            <>
              <Label>Test</Label>
              <Input />
              <FieldError />
            </>
          )}
        </TextField>
      ));

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-describedby");
      expect(document.getElementById(input.getAttribute("aria-describedby")!)).toHaveTextContent(
        "Constraints not satisfied",
      );
      expect(input.closest(".solidaria-TextField")).toHaveAttribute("data-invalid");
    });

    it("should not render the field error div if no error is provided and isInvalid is true", () => {
      render(() => (
        <TextField isRequired isInvalid>
          {() => (
            <>
              <Label>Test</Label>
              <Input />
              <FieldError />
            </>
          )}
        </TextField>
      ));

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid");
      expect(input.closest(".solidaria-TextField")).toHaveAttribute("data-invalid");
      expect(input).not.toHaveAttribute("aria-describedby");
      expect(document.querySelector(".solidaria-FieldError")).not.toBeInTheDocument();
    });

    it("supports customizing validation errors", () => {
      render(() => (
        <TextField isInvalid errorMessage="Default error">
          {() => (
            <>
              <Label>Test</Label>
              <Input />
              <FieldError>
                {({ isInvalid }) => (isInvalid ? "Please enter a name" : null)}
              </FieldError>
            </>
          )}
        </TextField>
      ));

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-describedby");
      expect(document.getElementById(input.getAttribute("aria-describedby")!)).toHaveTextContent(
        "Please enter a name",
      );
    });
  });

  describe("data attributes", () => {
    it("should set data-disabled when disabled", () => {
      render(() => (
        <TextField aria-label="Name" isDisabled>
          <input />
        </TextField>
      ));

      const wrapper = screen.getByRole("textbox").closest("div");
      expect(wrapper).toHaveAttribute("data-disabled");
    });

    it("should set data-invalid when invalid", () => {
      render(() => (
        <TextField aria-label="Name" isInvalid>
          <input />
        </TextField>
      ));

      const wrapper = screen.getByRole("textbox").closest("div");
      expect(wrapper).toHaveAttribute("data-invalid");
    });

    it("should set data-readonly when readonly", () => {
      render(() => (
        <TextField aria-label="Name" isReadOnly>
          <input />
        </TextField>
      ));

      const wrapper = screen.getByRole("textbox").closest("div");
      expect(wrapper).toHaveAttribute("data-readonly");
    });

    it("should set data-required when required", () => {
      render(() => (
        <TextField aria-label="Name" isRequired>
          <input />
        </TextField>
      ));

      const wrapper = screen.getByRole("textbox").closest("div");
      expect(wrapper).toHaveAttribute("data-required");
    });

    it("should set data-hovered when hovered", async () => {
      render(() => (
        <TextField aria-label="Name">
          <input />
        </TextField>
      ));

      const wrapper = screen.getByRole("textbox").closest("div")!;
      expect(wrapper).not.toHaveAttribute("data-hovered");

      await user.hover(wrapper);
      expect(wrapper).toHaveAttribute("data-hovered");
    });

    it("should render data- attributes only on the outer element", () => {
      render(() => <TestTextField />);
      const outerEl = screen.getAllByTestId("text-field-test");
      expect(outerEl).toHaveLength(1);
      expect(outerEl[0]).toHaveClass("solidaria-TextField");
    });

    // Note: data-focused and data-focus-visible require the Input component to track focus
    // and propagate it to the TextField wrapper via context. In SolidJS, children are evaluated
    // before parent renders, so context isn't available. This is a known SolidJS architectural
    // difference from React. React Aria doesn't test these attributes on TextField either.
    // The focus state tracking works with plain <input> elements at the UI layer.
  });

  describe("keyboard interaction", () => {
    it("should focus input with Tab", async () => {
      render(() => (
        <TextField aria-label="Name">
          <input />
        </TextField>
      ));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole("textbox"));
    });

    it("should allow typing", async () => {
      render(() => (
        <TextField aria-label="Name">
          <input />
        </TextField>
      ));

      const input = screen.getByRole("textbox");
      await user.type(input, "Hello World");
      expect(input).toHaveValue("Hello World");
    });
  });

  describe("input types", () => {
    it('should support type="email"', () => {
      render(() => (
        <TextField aria-label="Email">
          <input type="email" />
        </TextField>
      ));

      expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");
    });

    it('should support type="password"', () => {
      render(() => (
        <TextField aria-label="Password">
          <input type="password" />
        </TextField>
      ));

      // Password inputs don't have a textbox role
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it("should support placeholder", () => {
      render(() => (
        <TextField aria-label="Search">
          <input placeholder="Search..." />
        </TextField>
      ));

      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    });

    it("should render the id attribute only on the input element", () => {
      render(() => <TestTextField id="name" />);
      const outerEl = screen.getAllByTestId("text-field-test");
      const input = screen.getByRole("textbox");

      expect(outerEl).toHaveLength(1);
      expect(outerEl[0]).not.toHaveAttribute("id");
      expect(input).toHaveAttribute("id", "name");
    });

    it("should link an id on the input to the label htmlFor", () => {
      render(() => (
        <TextField defaultValue="test" data-testid="text-field-test" data-foo="bar">
          {() => (
            <>
              <Label>Test</Label>
              <Input id="name" />
              <Text slot="description">Description</Text>
              <Text slot="errorMessage">Error</Text>
            </>
          )}
        </TextField>
      ));
      const outerEl = screen.getAllByTestId("text-field-test");
      const input = screen.getByRole("textbox");
      const label = screen.getByText("Test");

      expect(outerEl).toHaveLength(1);
      expect(outerEl[0]).not.toHaveAttribute("id");
      expect(input).toHaveAttribute("id", "name");
      expect(label).toHaveAttribute("for", "name");
    });

    it("should support form prop", () => {
      render(() => <TestTextField form="test" />);
      expect(screen.getByRole("textbox")).toHaveAttribute("form", "test");
    });
  });

  describe("a11y validation", () => {
    // Note: TextField's Label+Input sub-components require render function children
    // {() => ...} so context is available. For axe scans, we use aria-label on Input
    // directly since the Label→Input htmlFor wiring has a known SolidJS context timing
    // issue (see wave-1-results.md for details).

    it("axe: default", async () => {
      const { container } = render(() => (
        <TextField aria-label="Name">{() => <Input />}</TextField>
      ));
      await assertNoA11yViolations(container);
    });

    it("axe: disabled", async () => {
      const { container } = render(() => (
        <TextField aria-label="Name" isDisabled>
          {() => <Input />}
        </TextField>
      ));
      await assertNoA11yViolations(container);
    });

    it("axe: invalid", async () => {
      const { container } = render(() => (
        <TextField aria-label="Name" isInvalid>
          {() => <Input />}
        </TextField>
      ));
      await assertNoA11yViolations(container);
    });

    it("axe: required", async () => {
      const { container } = render(() => (
        <TextField aria-label="Name" isRequired>
          {() => <Input />}
        </TextField>
      ));
      await assertNoA11yViolations(container);
    });

    it("ARIA ID: no dangling refs", () => {
      render(() => <TextField aria-label="Name">{() => <Input />}</TextField>);
      assertAriaIdIntegrity(document.body);
    });

    it("DOM: data-testid forwards", () => {
      render(() => (
        <TextField aria-label="Name" data-testid="name-field">
          <input />
        </TextField>
      ));
      expect(screen.getByTestId("name-field")).toBeInTheDocument();
    });

    it("DOM: aria-label forwards to input", () => {
      render(() => <TextField aria-label="Name">{() => <Input />}</TextField>);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-label", "Name");
    });
  });

  describe("TextArea a11y validation", () => {
    it("axe: default TextArea", async () => {
      const { container } = render(() => (
        <TextField aria-label="Description">{() => <TextArea />}</TextField>
      ));
      await assertNoA11yViolations(container);
    });

    it("renders textarea element", () => {
      render(() => <TextField aria-label="Description">{() => <TextArea />}</TextField>);
      const textarea = document.querySelector("textarea");
      expect(textarea).toBeInTheDocument();
    });

    it("ARIA ID: TextArea no dangling refs", () => {
      render(() => <TextField aria-label="Description">{() => <TextArea />}</TextField>);
      assertAriaIdIntegrity(document.body);
    });
  });
});
