/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { TextArea } from "../src/textfield/TextArea";

describe("TextArea (solid-spectrum)", () => {
  describe("basic rendering", () => {
    it("renders a textarea element", () => {
      render(() => <TextArea aria-label="Notes" />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(screen.getByRole("textbox").tagName).toBe("TEXTAREA");
    });

    it("renders with label", () => {
      render(() => <TextArea label="Notes" />);
      expect(screen.getByRole("textbox", { name: "Notes" })).toBeInTheDocument();
      expect(screen.getByText("Notes")).toBeInTheDocument();
    });

    it("renders with description", () => {
      render(() => <TextArea aria-label="Notes" description="Enter your notes" />);
      expect(screen.getByText("Enter your notes")).toBeInTheDocument();
    });

    it("renders with error message when invalid", () => {
      render(() => <TextArea aria-label="Notes" errorMessage="This field is required" isInvalid />);
      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });
  });

  describe("size variants", () => {
    it("renders with sm size", () => {
      render(() => <TextArea aria-label="Notes" size="sm" />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("renders with md size by default", () => {
      render(() => <TextArea aria-label="Notes" />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("renders with lg size", () => {
      render(() => <TextArea aria-label="Notes" size="lg" />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("renders with S2 XL size", () => {
      render(() => <TextArea aria-label="Notes" size="XL" />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });
  });

  describe("variant styles", () => {
    it("renders outline variant by default", () => {
      render(() => <TextArea aria-label="Notes" />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("accepts legacy filled variant", () => {
      render(() => <TextArea aria-label="Notes" variant="filled" />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });
  });

  describe("states", () => {
    it("handles disabled state", () => {
      render(() => <TextArea aria-label="Notes" isDisabled />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeDisabled();
    });

    it("handles read-only state", () => {
      render(() => <TextArea aria-label="Notes" isReadOnly />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.readOnly).toBe(true);
    });

    it("supports controlled value", () => {
      render(() => <TextArea aria-label="Notes" value="Hello world" />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.value).toBe("Hello world");
    });

    it("supports defaultValue", () => {
      render(() => <TextArea aria-label="Notes" defaultValue="Default text" />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.value).toBe("Default text");
    });

    it("calls onChange for browser input events", () => {
      const onChange = vi.fn();
      render(() => <TextArea aria-label="Notes" onChange={onChange} />);
      const textarea = screen.getByRole("textbox");

      fireEvent.input(textarea, { target: { value: "typed notes" } });

      expect(onChange).toHaveBeenCalledWith("typed notes");
    });

    it("sets focus state on the field group", () => {
      const { container } = render(() => <TextArea aria-label="Notes" />);
      const textarea = screen.getByRole("textbox");

      textarea.focus();

      expect(container.querySelector("[data-focused='true']")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("associates label with textarea", () => {
      render(() => <TextArea label="Notes" />);
      const textarea = screen.getByRole("textbox");
      expect(
        textarea.getAttribute("aria-label") || textarea.getAttribute("aria-labelledby"),
      ).toBeTruthy();
    });

    it("applies aria-label", () => {
      render(() => <TextArea aria-label="User notes" />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("marks invalid state with aria-invalid", () => {
      render(() => <TextArea aria-label="Notes" isInvalid errorMessage="Required" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea.getAttribute("aria-invalid")).toBe("true");
    });

    it("sets aria-required when required", () => {
      render(() => <TextArea aria-label="Notes" isRequired />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("aria-required", "true");
    });

    it("shows required indicator when label is present", () => {
      const { container } = render(() => <TextArea label="Notes" isRequired />);
      expect(container.querySelector("label svg")).toBeInTheDocument();
    });

    it("hides description while showing invalid error message", () => {
      render(() => (
        <TextArea
          aria-label="Notes"
          isInvalid
          description="Enter your notes"
          errorMessage="Required"
        />
      ));

      expect(screen.queryByText("Enter your notes")).not.toBeInTheDocument();
      expect(screen.getByText("Required")).toBeInTheDocument();
    });
  });
});
