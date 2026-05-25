import { describe, it, expect } from "vitest";
import { render } from "@solidjs/testing-library";
import { Heading } from "../src/text/Heading";
import { Keyboard } from "../src/text/Keyboard";
import { ToggleButton } from "../src/button/ToggleButton";
import { ActionButton } from "../src/button/ActionButton";
import { ClearButton } from "../src/button/ClearButton";
import { FieldButton } from "../src/button/FieldButton";
import { LogicButton } from "../src/button/LogicButton";
import { ProgressCircle } from "../src/progress/ProgressCircle";
import { Field } from "../src/form/Field";
import { HelpText } from "../src/form/HelpText";
import { Overlay } from "../src/overlays/Overlay";
import { Content, ViewHeader, ViewFooter } from "../src/view/Content";
import { Illustration } from "../src/icon/Illustration";
import { UIIcon } from "../src/icon/UIIcon";
import * as indexExports from "../src/index";

describe("Wave 4 UI Components", () => {
  // 4A: Text Variants
  describe("Heading", () => {
    it("renders with default level", () => {
      const { container } = render(() => <Heading>Title</Heading>);
      const h3 = container.querySelector("h3");
      expect(h3).toBeDefined();
      expect(h3!.textContent).toBe("Title");
    });

    it("renders with custom level", () => {
      const { container } = render(() => <Heading level={1}>Big Title</Heading>);
      expect(container.querySelector("h1")).toBeDefined();
    });

    it("applies unsafe class", () => {
      const { container } = render(() => <Heading UNSAFE_className="custom">Title</Heading>);
      expect(container.querySelector("h3")!.className).toContain("custom");
    });
  });

  describe("Keyboard", () => {
    it("renders keyboard shortcut", () => {
      const { container } = render(() => <Keyboard>Ctrl+C</Keyboard>);
      expect(container.textContent).toContain("Ctrl+C");
    });
  });

  // 4B: Button Variants
  describe("ToggleButton", () => {
    it("renders", () => {
      const { getByRole } = render(() => <ToggleButton>Toggle</ToggleButton>);
      expect(getByRole("button")).toBeDefined();
    });

    it("applies size prop without exposing visual prop markers", () => {
      const { getByRole } = render(() => <ToggleButton size="S">SM</ToggleButton>);
      const button = getByRole("button");
      expect(button.className).not.toBe("");
      expect(button).not.toHaveAttribute("data-size");
    });
  });

  describe("ActionButton", () => {
    it("renders", () => {
      const { getByRole } = render(() => <ActionButton>Action</ActionButton>);
      expect(getByRole("button")).toBeDefined();
    });

    it("accepts quiet mode without exposing visual prop markers", () => {
      const { getByRole } = render(() => <ActionButton isQuiet>Quiet</ActionButton>);
      const button = getByRole("button");
      expect(button.className).not.toBe("");
      expect(button).not.toHaveAttribute("data-quiet");
    });
  });

  describe("ClearButton", () => {
    it("renders with clear aria-label", () => {
      const { getByRole } = render(() => <ClearButton />);
      expect(getByRole("button").getAttribute("aria-label")).toBe("Clear");
    });

    it("renders SVG icon", () => {
      const { container } = render(() => <ClearButton />);
      expect(container.querySelector("svg")).toBeDefined();
    });
  });

  describe("FieldButton", () => {
    it("renders", () => {
      const { getByRole } = render(() => <FieldButton>Open</FieldButton>);
      expect(getByRole("button")).toBeDefined();
    });
  });

  describe("LogicButton", () => {
    it("renders", () => {
      const { getByRole } = render(() => <LogicButton />);
      expect(getByRole("button")).toBeDefined();
    });
  });

  // 4E: ProgressCircle
  describe("ProgressCircle", () => {
    it("renders SVG", () => {
      const { container } = render(() => <ProgressCircle value={50} aria-label="Loading" />);
      expect(container.querySelector("svg")).toBeDefined();
    });

    it("renders with different sizes", () => {
      const { container } = render(() => (
        <ProgressCircle value={50} size="L" aria-label="Loading" />
      ));
      const svg = container.querySelector("svg");
      expect(svg!.getAttribute("width")).toBe("100%");
    });
  });

  // 4G: Form components
  describe("Field", () => {
    it("renders label and children", () => {
      const { container } = render(() => (
        <Field label="Name">
          <input type="text" />
        </Field>
      ));
      expect(container.querySelector("label")!.textContent).toContain("Name");
      expect(container.querySelector("input")).toBeDefined();
    });

    it("shows required indicator", () => {
      const { container } = render(() => (
        <Field label="Email" isRequired>
          input
        </Field>
      ));
      expect(container.textContent).toContain("*");
    });

    it("shows error message", () => {
      const { container } = render(() => (
        <Field label="Email" isInvalid errorMessage="Invalid email">
          input
        </Field>
      ));
      expect(container.textContent).toContain("Invalid email");
    });

    it("shows description", () => {
      const { container } = render(() => (
        <Field label="Name" description="Enter your full name">
          input
        </Field>
      ));
      expect(container.textContent).toContain("Enter your full name");
    });
  });

  describe("HelpText", () => {
    it("renders description", () => {
      const { container } = render(() => <HelpText description="Help text" />);
      expect(container.textContent).toContain("Help text");
    });

    it("renders error message when invalid", () => {
      const { container } = render(() => (
        <HelpText isInvalid errorMessage="Error!" description="Help" />
      ));
      expect(container.textContent).toContain("Error!");
      expect(container.textContent).not.toContain("Help");
    });
  });

  // 4H: Overlay variants
  describe("Overlay", () => {
    it("renders children when open", () => {
      const { container } = render(() => (
        <Overlay isOpen>
          <div data-testid="content">Overlay content</div>
        </Overlay>
      ));
      // Portal renders outside container
      expect(document.body.textContent).toContain("Overlay content");
    });

    it("does not render when closed", () => {
      const { container } = render(() => (
        <Overlay isOpen={false}>
          <div>Hidden</div>
        </Overlay>
      ));
      expect(container.textContent).not.toContain("Hidden");
    });
  });

  // 4I: View Slots
  describe("Content", () => {
    it("renders", () => {
      const { container } = render(() => <Content>Body text</Content>);
      expect(container.textContent).toContain("Body text");
    });
  });

  describe("ViewHeader", () => {
    it("renders header", () => {
      const { container } = render(() => <ViewHeader>Header</ViewHeader>);
      expect(container.querySelector("header")).toBeDefined();
      expect(container.textContent).toContain("Header");
    });
  });

  describe("ViewFooter", () => {
    it("renders footer", () => {
      const { container } = render(() => <ViewFooter>Footer</ViewFooter>);
      expect(container.querySelector("footer")).toBeDefined();
      expect(container.textContent).toContain("Footer");
    });
  });

  // 4J: Icon variants
  describe("Illustration", () => {
    it("renders with presentation role by default", () => {
      const { container } = render(() => <Illustration>SVG</Illustration>);
      expect(container.querySelector('[role="presentation"]')).toBeDefined();
    });

    it("renders with img role when aria-label provided", () => {
      const { container } = render(() => <Illustration aria-label="Diagram">SVG</Illustration>);
      expect(container.querySelector('[role="img"]')).toBeDefined();
    });
  });

  describe("UIIcon", () => {
    it("renders with aria-hidden by default", () => {
      const { container } = render(() => <UIIcon>icon</UIIcon>);
      expect(container.querySelector('[aria-hidden="true"]')).toBeDefined();
    });

    it("applies size class", () => {
      const { container } = render(() => <UIIcon size="lg">icon</UIIcon>);
      expect(container.querySelector("span")!.className).toContain("w-6");
    });
  });
});

describe("S2 public index exports", () => {
  const exportsByName = indexExports as Record<string, unknown>;

  it("exports the S2-facing root surface", () => {
    for (const name of [
      "Provider",
      "Button",
      "ActionButton",
      "ActionButtonGroup",
      "ButtonGroup",
      "Card",
      "CardPreview",
      "CardView",
      "AssetCard",
      "UserCard",
      "ProductCard",
      "ToggleButton",
      "ToggleButtonGroup",
      "ProgressCircle",
      "Switch",
      "ActionMenu",
      "SubmenuTrigger",
      "RangeSlider",
      "SegmentedControl",
      "SelectBoxGroup",
      "TableView",
      "Tabs",
      "Tooltip",
      "ToastQueue",
      "createIcon",
    ]) {
      expect(exportsByName[name]).toBeDefined();
    }
  });

  it("keeps legacy internal helpers out of the root barrel", () => {
    for (const name of [
      "ClearButton",
      "FieldButton",
      "LogicButton",
      "Field",
      "HelpText",
      "Overlay",
      "ViewHeader",
      "ViewFooter",
      "Illustration",
      "UIIcon",
      "StyledModal",
      "Tray",
    ]) {
      expect(exportsByName[name]).toBeUndefined();
    }
  });
});
