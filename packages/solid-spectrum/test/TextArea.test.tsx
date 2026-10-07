/**
 * @vitest-environment jsdom
 */
import { createSignal, flush } from "solid-js";
import { describe, it, expect, vi } from "vite-plus/test";
import { fireEvent, render, screen } from "@solidjs/testing-library";
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

    it("uses native required validation by default", () => {
      render(() => <TextArea aria-label="Notes" isRequired />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("required");
      expect(textarea).not.toHaveAttribute("aria-required");
    });

    it("sets aria-required when validationBehavior is aria", () => {
      render(() => <TextArea aria-label="Notes" isRequired validationBehavior="aria" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).not.toHaveAttribute("required");
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

    it("swaps HelpText when isInvalid changes after mount", () => {
      const [isInvalid, setIsInvalid] = createSignal(false);
      render(() => (
        <TextArea
          aria-label="Notes"
          isInvalid={isInvalid()}
          description="Use a short multiline project note."
          errorMessage="Notes are required."
        />
      ));

      expect(screen.getByText("Use a short multiline project note.")).toBeInTheDocument();
      expect(screen.queryByText("Notes are required.")).not.toBeInTheDocument();

      setIsInvalid(true);
      flush();
      expect(screen.queryByText("Use a short multiline project note.")).not.toBeInTheDocument();
      expect(screen.getByText("Notes are required.")).toBeInTheDocument();

      setIsInvalid(false);
      flush();
      expect(screen.getByText("Use a short multiline project note.")).toBeInTheDocument();
      expect(screen.queryByText("Notes are required.")).not.toBeInTheDocument();
    });
  });

  describe("Chrome baseline top-padding workaround", () => {
    // Dev macro ids follow the runtime condition. The Chrome rule adds a behavior class beside them.
    function behaviorClassTokens(className: string): Set<string> {
      return new Set(
        className.split(/\s+/).filter((token) => token.length > 0 && !token.startsWith("-macro-")),
      );
    }

    function renderFieldClassNames(userAgent: string): { group: string; textarea: string } {
      const originalUserAgent = navigator.userAgent;
      Object.defineProperty(navigator, "userAgent", {
        value: userAgent,
        configurable: true,
      });
      try {
        const { container, unmount } = render(() => <TextArea aria-label="Notes" />);
        const group = container.querySelector('[role="presentation"]');
        const textarea = container.querySelector("textarea");
        if (!(group instanceof HTMLElement) || !(textarea instanceof HTMLTextAreaElement)) {
          throw new Error("TextArea field group or textarea missing");
        }
        const classNames = { group: group.className, textarea: textarea.className };
        unmount();
        return classNames;
      } finally {
        Object.defineProperty(navigator, "userAgent", {
          value: originalUserAgent,
          configurable: true,
        });
      }
    }

    function expectChromeAddsBehaviorClass(sharedClassName: string, chromeClassName: string): void {
      const shared = behaviorClassTokens(sharedClassName);
      const chrome = behaviorClassTokens(chromeClassName);
      expect(shared.size).toBeGreaterThan(0);
      for (const token of shared) {
        expect(chrome.has(token)).toBe(true);
      }
      expect([...chrome].some((token) => !shared.has(token))).toBe(true);
    }

    it("adds Chrome baseline classes on top of the shared field classes", () => {
      const shared = renderFieldClassNames(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
      );
      const chrome = renderFieldClassNames(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      );

      expectChromeAddsBehaviorClass(shared.group, chrome.group);
      expectChromeAddsBehaviorClass(shared.textarea, chrome.textarea);
    });
  });
});
