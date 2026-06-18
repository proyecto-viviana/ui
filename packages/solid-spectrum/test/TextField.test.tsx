import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { TextField } from "../src/textfield";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";

// setupUser is consolidated in solid-spectrum-test-utils.

describe("TextField", () => {
  let onChangeSpy = vi.fn();
  let onFocusSpy = vi.fn();
  let onBlurSpy = vi.fn();
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
  });

  afterEach(() => {
    onChangeSpy.mockClear();
    onFocusSpy.mockClear();
    onBlurSpy.mockClear();
  });

  describe("basic functionality", () => {
    it('renders with role="textbox"', () => {
      render(() => <TextField aria-label="Test input" />);
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("renders with default empty value", () => {
      render(() => <TextField aria-label="Test input" />);
      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("");
    });

    it("accepts text input", async () => {
      render(() => <TextField aria-label="Test input" onChange={onChangeSpy} />);
      const input = screen.getByRole("textbox");

      // Use fireEvent.change to simulate input change
      fireEvent.change(input, { target: { value: "hello" } });

      expect(onChangeSpy).toHaveBeenCalledWith("hello");
      expect((input as HTMLInputElement).value).toBe("hello");
    });

    it("calls onChange for browser input events", () => {
      render(() => <TextField aria-label="Test input" onChange={onChangeSpy} />);
      const input = screen.getByRole("textbox");

      fireEvent.input(input, { target: { value: "typed" } });

      expect(onChangeSpy).toHaveBeenCalledWith("typed");
    });

    it("supports defaultValue", () => {
      render(() => <TextField aria-label="Test input" defaultValue="initial" />);
      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("initial");
    });
  });

  describe("controlled mode", () => {
    it("reflects controlled value", () => {
      render(() => <TextField aria-label="Test input" value="controlled" />);
      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("controlled");
    });

    it("calls onChange in controlled mode", async () => {
      render(() => <TextField aria-label="Test input" value="" onChange={onChangeSpy} />);
      const input = screen.getByRole("textbox");

      fireEvent.change(input, { target: { value: "new value" } });
      expect(onChangeSpy).toHaveBeenCalledWith("new value");
    });
  });

  describe("disabled state", () => {
    it("does not accept input when disabled", async () => {
      render(() => <TextField aria-label="Test input" isDisabled />);
      const input = screen.getByRole("textbox");

      expect(input).toBeDisabled();
    });
  });

  describe("readonly state", () => {
    it("sets readonly attribute when isReadOnly is true", () => {
      render(() => <TextField aria-label="Test input" isReadOnly />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("readonly");
    });

    it("can focus readonly input", async () => {
      const { container } = render(() => <TextField aria-label="Test input" isReadOnly />);
      const input = screen.getByRole("textbox");
      const field = container.firstElementChild as HTMLElement;

      input.focus();
      expect(field).toHaveAttribute("data-focused", "true");
    });
  });

  describe("required state", () => {
    it("uses native required validation by default", () => {
      render(() => <TextField aria-label="Test input" isRequired />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("required");
      expect(input).not.toHaveAttribute("aria-required");
    });

    it("sets aria-required when validationBehavior is aria", () => {
      render(() => <TextField aria-label="Test input" isRequired validationBehavior="aria" />);
      const input = screen.getByRole("textbox");
      expect(input).not.toHaveAttribute("required");
      expect(input).toHaveAttribute("aria-required", "true");
    });

    it("shows required indicator when label is present", () => {
      const { container } = render(() => <TextField label="Name" isRequired />);
      expect(container.querySelector("label svg")).toBeInTheDocument();
    });
  });

  describe("invalid state", () => {
    it("sets aria-invalid when isInvalid is true", () => {
      render(() => <TextField aria-label="Test input" isInvalid />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("shows error message when invalid and errorMessage is provided", () => {
      render(() => (
        <TextField aria-label="Test input" isInvalid errorMessage="This field is required" />
      ));
      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("hides description when invalid", () => {
      render(() => (
        <TextField
          aria-label="Test input"
          isInvalid
          description="Enter your name"
          errorMessage="This field is required"
        />
      ));
      expect(screen.queryByText("Enter your name")).not.toBeInTheDocument();
      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });
  });

  describe("label and description", () => {
    it("renders with label", () => {
      render(() => <TextField label="Email" />);
      expect(screen.getByText("Email")).toBeInTheDocument();
    });

    it("renders with description", () => {
      render(() => <TextField aria-label="Test input" description="Enter your email address" />);
      expect(screen.getByText("Enter your email address")).toBeInTheDocument();
    });

    // Note: The label association is done via aria-labelledby in the input props.
    // The explicit `for` attribute requires passing label ref to createTextField.
    // This test verifies the input has an id for potential label association.
    it("input has accessible id for label association", () => {
      render(() => <TextField label="Email" />);
      const input = screen.getByRole("textbox");
      // Input has id for accessibility
      expect(input).toHaveAttribute("id");
    });
  });

  describe("sizes", () => {
    it("renders with default md size", () => {
      render(() => <TextField aria-label="Test input" />);
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("renders with sm size", () => {
      render(() => <TextField aria-label="Test input" size="sm" />);
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("renders with lg size", () => {
      render(() => <TextField aria-label="Test input" size="lg" />);
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });
  });

  describe("variants", () => {
    it("renders with default outline variant", () => {
      render(() => <TextField aria-label="Test input" />);
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("renders with filled variant", () => {
      render(() => <TextField aria-label="Test input" variant="filled" />);
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });
  });

  describe("focus events", () => {
    // Focus state tracking works by using userEvent.click which properly triggers
    // focus handlers, unlike fireEvent.focus which doesn't fully simulate browser behavior.
    it("sets data-focused when input is focused", async () => {
      const { container } = render(() => <TextField aria-label="Test input" />);
      const input = screen.getByRole("textbox");
      const field = container.firstElementChild as HTMLElement;

      input.focus();
      expect(field).toHaveAttribute("data-focused", "true");
    });

    it("removes data-focused when input loses focus", async () => {
      const { container } = render(() => (
        <>
          <TextField aria-label="Test input" />
          <button>Other</button>
        </>
      ));
      const input = screen.getByRole("textbox");
      const otherButton = screen.getByRole("button");
      const field = container.firstElementChild as HTMLElement;

      input.focus();
      expect(field).toHaveAttribute("data-focused", "true");

      fireEvent.blur(input);
      expect(field).not.toHaveAttribute("data-focused");
    });
  });

  describe("aria attributes", () => {
    it("supports aria-label", () => {
      render(() => <TextField aria-label="Custom label" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-label", "Custom label");
    });

    it("supports aria-labelledby", () => {
      render(() => (
        <>
          <span id="label">Label text</span>
          <TextField aria-labelledby="label" />
        </>
      ));
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-labelledby", "label");
    });

    it("supports aria-describedby", () => {
      render(() => (
        <>
          <span id="desc">Description text</span>
          <TextField aria-label="Test" aria-describedby="desc" />
        </>
      ));
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-describedby", "desc");
    });
  });

  describe("input types", () => {
    it('defaults to type="text"', () => {
      render(() => <TextField aria-label="Test input" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "text");
    });

    it('supports type="email"', () => {
      render(() => <TextField aria-label="Email" type="email" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "email");
    });

    it('supports type="password"', () => {
      render(() => <TextField aria-label="Password" type="password" />);
      // Password fields are not accessible via getByRole('textbox')
      const input = document.querySelector('input[type="password"]');
      expect(input).toHaveAttribute("type", "password");
    });

    it('supports type="tel"', () => {
      render(() => <TextField aria-label="Phone" type="tel" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "tel");
    });

    it('supports type="url"', () => {
      render(() => <TextField aria-label="Website" type="url" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "url");
    });
  });

  describe("input attributes", () => {
    it("supports placeholder", () => {
      render(() => <TextField aria-label="Test input" placeholder="Enter text..." />);
      const input = screen.getByPlaceholderText("Enter text...");
      expect(input).toBeInTheDocument();
    });

    it("supports maxLength", () => {
      render(() => <TextField aria-label="Test input" maxLength={10} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("maxLength", "10");
    });

    it("supports minLength", () => {
      render(() => <TextField aria-label="Test input" minLength={5} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("minLength", "5");
    });

    it("supports pattern", () => {
      render(() => <TextField aria-label="Test input" pattern="[A-Za-z]+" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("pattern", "[A-Za-z]+");
    });

    it("supports name attribute", () => {
      render(() => <TextField aria-label="Test input" name="username" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("name", "username");
    });
  });

  describe("custom props", () => {
    it("allows custom data attributes to be passed through", () => {
      render(() => <TextField aria-label="Test input" data-testid="custom-textfield" />);
      const elements = screen.getAllByTestId("custom-textfield");
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe("prefix", () => {
    it("renders the prefix before the input and labels the input with it", () => {
      render(() => <TextField label="Amount" prefix={<span>$</span>} />);
      const input = screen.getByRole("textbox");
      const label = screen.getByText("Amount");
      const prefix = screen.getByText("$");
      // The prefix's container carries an id that the input references, in
      // addition to the label, mirroring upstream's FieldGroup prefix.
      const prefixContainer = prefix.closest("[id]") as HTMLElement;
      expect(prefixContainer).toBeTruthy();
      const labelledBy = (input.getAttribute("aria-labelledby") ?? "").split(" ");
      expect(labelledBy).toContain(label.id);
      expect(labelledBy).toContain(prefixContainer.id);
      // The prefix renders before the input in the DOM.
      expect(
        prefixContainer.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it("does not alter aria-labelledby when no prefix is provided", () => {
      render(() => <TextField label="Amount" />);
      const input = screen.getByRole("textbox");
      const label = screen.getByText("Amount");
      expect(input.getAttribute("aria-labelledby")).toBe(label.id);
    });
  });
});
