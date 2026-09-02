/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@solidjs/testing-library";
import { ColorField } from "../src/ColorField";

afterEach(() => cleanup());

describe("ColorField", () => {
  it("renders the S2 field structure with label, help text, and native form value", async () => {
    const { container } = render(() => (
      <ColorField
        label="Color"
        description="Enter a hex color"
        defaultValue="#336699"
        placeholder="#000000"
        name="color"
      />
    ));

    const input = screen.getByRole("textbox", { name: "Color" });
    const label = screen.getByText("Color");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-labelledby", label.id);
    expect(input).not.toHaveAttribute("aria-label");
    expect(input).toHaveAttribute("name", "color");
    expect(input).toHaveAttribute("placeholder", "#000000");
    expect(input).toHaveValue("#336699");
    expect(screen.getByText("Enter a hex color")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("data-channel", "hex");

    await waitFor(() => {
      const describedBy = (input.getAttribute("aria-describedby") ?? "")
        .split(/\s+/)
        .filter(Boolean);
      expect(describedBy).toHaveLength(1);
      expect(document.getElementById(describedBy[0])).toHaveTextContent("Enter a hex color");
    });
  });

  it("renders channel mode as a textbox with a hidden form input", () => {
    const { container } = render(() => (
      <ColorField
        aria-label="Red"
        defaultValue="rgb(128, 64, 32)"
        channel="red"
        name="red"
        form="color-form"
      />
    ));

    const input = screen.getByRole("textbox", { name: "Red" });
    expect(input).not.toHaveAttribute("role");
    expect(input).not.toHaveAttribute("aria-valuenow");
    expect(input).not.toHaveAttribute("aria-valuemin");
    expect(input).not.toHaveAttribute("aria-valuemax");
    expect(container.firstElementChild).toHaveAttribute("data-channel", "red");
    expect(input).not.toHaveAttribute("name");
    expect(input).not.toHaveAttribute("form");

    const hiddenInput = container.querySelector('input[type="hidden"][name="red"]');
    expect(hiddenInput).toHaveAttribute("form", "color-form");
    expect(hiddenInput).toHaveValue("128");
    expect(container.firstElementChild?.querySelector('input[type="hidden"]')).toBeNull();
  });

  it("shows error text and invalid state when invalid", async () => {
    const { container } = render(() => (
      <ColorField label="Color" isInvalid errorMessage="Enter a valid color" value="#336699" />
    ));

    const input = screen.getByRole("textbox", { name: "Color" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Enter a valid color")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("data-invalid", "true");

    await waitFor(() => {
      const describedBy = (input.getAttribute("aria-describedby") ?? "")
        .split(/\s+/)
        .filter(Boolean);
      expect(describedBy).toHaveLength(1);
      expect(document.getElementById(describedBy[0])).toHaveTextContent("Enter a valid color");
    });
  });

  it("renders a prefix before the input and labels the input with it", () => {
    render(() => <ColorField label="Color" defaultValue="#336699" prefix={<span>#</span>} />);

    const input = screen.getByRole("textbox");
    const label = screen.getByText("Color");
    const prefix = screen.getByText("#");
    const prefixContainer = prefix.closest("[id]") as HTMLElement;
    const labelledBy = (input.getAttribute("aria-labelledby") ?? "").split(" ");

    expect(labelledBy).toContain(label.id);
    expect(labelledBy).toContain(prefixContainer.id);
    expect(
      prefixContainer.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
