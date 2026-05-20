import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { Checkbox, CheckboxContext, CheckboxGroup, Form } from "../src";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { hc } from "../../../apps/comparison/src/components/solid/solid-h";

// setupUser is consolidated in solid-spectrum-test-utils.

describe("Checkbox", () => {
  let onChangeSpy = vi.fn();
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
  });

  afterEach(() => {
    onChangeSpy.mockClear();
  });

  describe("basic functionality", () => {
    it('renders with role="checkbox"', () => {
      render(() => <Checkbox aria-label="Test checkbox" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    it("handles defaults (unchecked)", () => {
      render(() => <Checkbox aria-label="Test checkbox" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });

    it("toggles on click", async () => {
      render(() => <Checkbox aria-label="Test checkbox" onChange={onChangeSpy} />);
      const checkbox = screen.getByRole("checkbox");

      await user.click(checkbox);
      await Promise.resolve();

      expect(checkbox).toBeChecked();
      expect(onChangeSpy).toHaveBeenCalledWith(true);

      await user.click(checkbox);
      await Promise.resolve();

      expect(checkbox).not.toBeChecked();
      expect(onChangeSpy).toHaveBeenCalledWith(false);
    });

    it("supports defaultSelected", () => {
      render(() => <Checkbox aria-label="Test checkbox" defaultSelected />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });
  });

  describe("controlled mode", () => {
    it("reflects controlled isSelected value", () => {
      render(() => <Checkbox aria-label="Test checkbox" isSelected={true} />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("calls onChange in controlled mode", async () => {
      render(() => (
        <Checkbox aria-label="Test checkbox" isSelected={false} onChange={onChangeSpy} />
      ));
      const checkbox = screen.getByRole("checkbox");

      await user.click(checkbox);
      expect(onChangeSpy).toHaveBeenCalledWith(true);
    });

    it("keeps the controlled hidden input stable while toggling", async () => {
      function Demo() {
        const [isSelected, setIsSelected] = createSignal(false);
        return (
          <Checkbox isSelected={isSelected()} onChange={setIsSelected}>
            Enable alerts
          </Checkbox>
        );
      }

      render(() => <Demo />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(screen.getByText("Enable alerts"));
      await waitFor(() => expect(checkbox).toBeChecked());
      expect(screen.getByRole("checkbox")).toBe(checkbox);

      await user.click(screen.getByText("Enable alerts"));
      await waitFor(() => expect(checkbox).not.toBeChecked());
      expect(screen.getByRole("checkbox")).toBe(checkbox);
    });

    it("keeps CheckboxGroup controlled values reactive through comparison h composition", async () => {
      function Demo() {
        const [value, setValue] = createSignal<string[]>(["email"]);

        return hc(
          "div",
          {
            get "data-value"() {
              return value().join(",");
            },
          },
          [
            hc(
              CheckboxGroup,
              {
                "aria-label": "Notifications",
                get value() {
                  return value();
                },
                onChange(nextValue: string[]) {
                  setValue(nextValue);
                },
              },
              [
                hc(Checkbox, { value: "email" }, ["Email"]),
                hc(Checkbox, { value: "sms" }, ["SMS"]),
                hc(Checkbox, { value: "push" }, ["Push"]),
              ],
            ),
          ],
        );
      }

      render(() => hc(Demo, {}));

      const root = screen.getByRole("group").closest("[data-value]")!;
      const checkboxes = screen.getAllByRole("checkbox");

      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();

      await user.click(screen.getByText("SMS"));
      await waitFor(() => expect(checkboxes[1]).toBeChecked());
      expect(checkboxes[0]).toBeChecked();
      expect(root).toHaveAttribute("data-value", "email,sms");
      expect(screen.getAllByRole("checkbox")[1]).toBe(checkboxes[1]);

      await user.click(screen.getByText("Email"));
      await waitFor(() => expect(checkboxes[0]).not.toBeChecked());
      expect(checkboxes[1]).toBeChecked();
      expect(root).toHaveAttribute("data-value", "sms");
      expect(screen.getAllByRole("checkbox")[0]).toBe(checkboxes[0]);
    });
  });

  describe("disabled state", () => {
    it("does not toggle when disabled", async () => {
      render(() => <Checkbox aria-label="Test checkbox" isDisabled onChange={onChangeSpy} />);
      const checkbox = screen.getByRole("checkbox");

      expect(checkbox).toBeDisabled();
      await user.click(checkbox);
      expect(onChangeSpy).not.toHaveBeenCalled();
    });

    it("inherits disabled state from Form", () => {
      render(() => (
        <Form isDisabled>
          <Checkbox aria-label="Test checkbox" />
        </Form>
      ));

      expect(screen.getByRole("checkbox")).toBeDisabled();
    });
  });

  describe("indeterminate state", () => {
    it("renders with indeterminate state", () => {
      render(() => <Checkbox aria-label="Test checkbox" isIndeterminate />);
      const checkbox = screen.getByRole("checkbox");
      // Indeterminate is a visual state, the checkbox itself won't have a specific attribute
      // but the component should render without errors
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe("keyboard interaction", () => {
    it("toggles on Space key", async () => {
      render(() => <Checkbox aria-label="Test checkbox" onChange={onChangeSpy} />);
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;

      // Focus and type space - use type() which simulates full keyboard interaction
      await user.click(checkbox);
      expect(document.activeElement).toBe(checkbox);

      // Clear the spy from the click, then test space key
      onChangeSpy.mockClear();
      await user.type(checkbox, " ");
      expect(onChangeSpy).toHaveBeenCalled();
    });
  });

  describe("sizes", () => {
    it("renders with default md size", () => {
      render(() => <Checkbox aria-label="Test checkbox" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    it("renders with sm size", () => {
      render(() => <Checkbox aria-label="Test checkbox" size="sm" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    it("renders with lg size", () => {
      render(() => <Checkbox aria-label="Test checkbox" size="lg" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe("label", () => {
    it("renders with label text", () => {
      render(() => <Checkbox>Accept terms</Checkbox>);
      expect(screen.getByText("Accept terms")).toBeInTheDocument();
    });

    it("clicking checkbox toggles it", async () => {
      render(() => <Checkbox onChange={onChangeSpy}>Accept terms</Checkbox>);
      const checkbox = screen.getByRole("checkbox");

      await user.click(checkbox);
      expect(onChangeSpy).toHaveBeenCalledWith(true);
    });

    it("keeps the hidden input checked state in sync when the label is clicked", async () => {
      render(() => <Checkbox>Accept terms</Checkbox>);
      const checkbox = screen.getByRole("checkbox");
      const label = checkbox.closest("label");

      expect(label).toBeInTheDocument();
      await user.click(label!);

      expect(checkbox).toBeChecked();
    });
  });

  describe("touch interaction", () => {
    it("handles touch press", async () => {
      render(() => <Checkbox aria-label="Test checkbox" onChange={onChangeSpy} />);
      const checkbox = screen.getByRole("checkbox");

      await user.pointer([
        { keys: "[TouchA>]", target: checkbox },
        { keys: "[/TouchA]", target: checkbox },
      ]);

      expect(onChangeSpy).toHaveBeenCalled();
    });
  });

  describe("aria attributes", () => {
    it("supports aria-label", () => {
      render(() => <Checkbox aria-label="Custom label" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-label", "Custom label");
    });

    it("supports aria-describedby", () => {
      render(() => (
        <>
          <span id="desc">Description text</span>
          <Checkbox aria-label="Test" aria-describedby="desc" />
        </>
      ));
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-describedby", "desc");
    });

    it("supports aria-labelledby", () => {
      render(() => (
        <>
          <span id="label">Label text</span>
          <Checkbox aria-labelledby="label" />
        </>
      ));
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-labelledby", "label");
    });
  });

  describe("invalid state", () => {
    it("sets aria-invalid when isInvalid is true", () => {
      render(() => <Checkbox aria-label="Test checkbox" isInvalid />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-invalid", "true");
    });

    it("does not set aria-invalid when isInvalid is false", () => {
      render(() => <Checkbox aria-label="Test checkbox" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toHaveAttribute("aria-invalid");
    });
  });

  describe("readonly state", () => {
    it("does not toggle when readonly", async () => {
      render(() => <Checkbox aria-label="Test checkbox" isReadOnly onChange={onChangeSpy} />);
      const checkbox = screen.getByRole("checkbox");

      await user.click(checkbox);
      expect(onChangeSpy).not.toHaveBeenCalled();
    });

    it("sets aria-readonly when isReadOnly is true", () => {
      render(() => <Checkbox aria-label="Test checkbox" isReadOnly />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-readonly", "true");
    });
  });

  describe("excludeFromTabOrder", () => {
    it("removes checkbox from tab order when excludeFromTabOrder is true", () => {
      render(() => <Checkbox aria-label="Test checkbox" excludeFromTabOrder />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("tabindex", "-1");
    });
  });

  describe("custom props", () => {
    it("passes form input props through the hidden checkbox input", () => {
      render(() => (
        <Checkbox
          aria-label="Test checkbox"
          name="terms"
          value="agree"
          form="signupForm"
          isRequired
          validationBehavior="aria"
        />
      ));
      const checkbox = screen.getByRole("checkbox");

      expect(checkbox).toHaveAttribute("name", "terms");
      expect(checkbox).toHaveAttribute("value", "agree");
      expect(checkbox).toHaveAttribute("form", "signupForm");
      expect(checkbox).toHaveAttribute("aria-required", "true");
    });

    it("merges CheckboxContext props, styles, unsafe style, and refs", () => {
      const ref = vi.fn();
      const inputRef = vi.fn();

      render(() => (
        <CheckboxContext.Provider
          value={{
            "aria-label": "Context checkbox",
            defaultSelected: true,
            UNSAFE_className: "context-checkbox",
            UNSAFE_style: { margin: "1px" },
            ref,
            inputRef,
          }}
        >
          <Checkbox />
        </CheckboxContext.Provider>
      ));

      const checkbox = screen.getByRole("checkbox", {
        name: "Context checkbox",
      }) as HTMLInputElement;
      const root = checkbox.closest(".context-checkbox") as HTMLElement;

      expect(checkbox).toBeChecked();
      expect(root).toHaveClass("context-checkbox");
      expect(root).toHaveStyle({ margin: "1px" });
      expect(ref).toHaveBeenCalledWith(root);
      expect(inputRef).toHaveBeenCalledWith(checkbox);
    });

    it("allows custom data attributes to be passed through", () => {
      render(() => <Checkbox aria-label="Test checkbox" data-testid="custom-checkbox" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox.closest("label")).toHaveAttribute("data-testid", "custom-checkbox");
    });

    it("allows custom data-foo attribute", () => {
      render(() => <Checkbox aria-label="Test checkbox" data-foo="bar" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox.closest("label")).toHaveAttribute("data-foo", "bar");
    });
  });
});
