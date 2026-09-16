/** @vitest-environment jsdom */
import { describe, expect, it } from "vite-plus/test";
import { render, screen, waitFor, within } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { Picker, PickerItem } from "../src/picker";
import { Header, Heading, Text } from "../src";

interface SectionItem {
  href: string;
  label: string;
}

const accordion: SectionItem = { href: "#page-title", label: "Accordion" };

describe("Picker", () => {
  it("updates direct reactive item children in the option and the trigger value", () => {
    // `<PickerItem>{label()}</PickerItem>` compiles to a `children` getter
    // returning the current string. An untracked setup-time read would freeze
    // the first value in both the option row and the mirrored trigger value.
    const [label, setLabel] = createSignal("Accordion");
    const { container } = render(() => (
      <Picker<SectionItem>
        aria-label="Table of contents"
        defaultOpen
        items={[accordion]}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        selectedKey="#page-title"
      >
        {(item) => <PickerItem id={item.href}>{label()}</PickerItem>}
      </Picker>
    ));

    const option = screen.getByRole("option");
    // While the popover is open the trigger is aria-hidden from the AX tree
    // (ariaHideOutside), so locate it by its listbox popup attribute.
    const button = container.querySelector('button[aria-haspopup="listbox"]');
    expect(button).not.toBeNull();
    expect(option.querySelector('[data-rsp-slot="text"]')).toHaveTextContent("Accordion");
    expect(button).toHaveTextContent("Accordion");
    setLabel("Accordion group");
    expect(option.querySelector('[data-rsp-slot="text"]')).toHaveTextContent("Accordion group");
    expect(button).toHaveTextContent("Accordion group");
  });

  it("provides S2 listbox header, heading, and description slot contexts", async () => {
    render(() => (
      <Picker<SectionItem>
        aria-label="Table of contents"
        defaultOpen
        items={[accordion]}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
      >
        {(item) => (
          <PickerItem id={item.href} textValue={item.label}>
            {item.label}
            <Header data-testid="docs-header">
              <Heading level={3}>Docs</Heading>
            </Header>
            <Text slot="description">On this page</Text>
          </PickerItem>
        )}
      </Picker>
    ));

    await waitFor(() => {
      expect(screen.getByTestId("docs-header")).toBeInTheDocument();
    });

    const header = screen.getByTestId("docs-header");
    const heading = header.querySelector("h3");
    const description = screen.getByText("On this page");

    expect(header.className).toContain("-macro-dynamic");
    expect(heading).toHaveAttribute("role", "presentation");
    expect(heading).toHaveTextContent("Docs");
    expect(heading?.className).toContain("-macro-static");
    expect(description).toHaveAttribute("slot", "description");
    expect(description.className).toContain("-macro-dynamic");
  });

  it("provides S2 PickerItem default, label, and description TextContext", async () => {
    render(() => (
      <Picker<SectionItem>
        aria-label="Table of contents"
        defaultOpen
        items={[accordion]}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
      >
        {(item) => (
          <PickerItem id={item.href} textValue={item.label}>
            <Text>{item.label}</Text>
            <Text slot="description">On this page</Text>
          </PickerItem>
        )}
      </Picker>
    ));

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Accordion" })).toBeInTheDocument();
    });

    const accordionOption = screen.getByRole("option", { name: "Accordion" });
    const label = within(accordionOption).getByText("Accordion");
    const description = within(accordionOption).getByText("On this page");
    expect(label.className).toContain("-macro-");
    expect(description).toHaveAttribute("slot", "description");
    expect(description.className).toContain("-macro-dynamic");
  });

  it("does not stamp data-open or aria-hidden on the open trigger chevron", () => {
    // S2 Picker ChevronIcon is size + class only (`Picker.tsx:755-758`). An
    // invented `data-open` keeps the svg in the D13 contract tree (M10).
    const { container } = render(() => (
      <Picker<SectionItem>
        aria-label="Table of contents"
        defaultOpen
        items={[accordion]}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        selectedKey="#page-title"
      >
        {(item) => <PickerItem id={item.href}>{item.label}</PickerItem>}
      </Picker>
    ));

    const button = container.querySelector('button[aria-haspopup="listbox"]');
    expect(button).not.toBeNull();
    const chevron = button!.querySelector("svg:last-of-type");
    expect(chevron).not.toBeNull();
    expect(chevron).not.toHaveAttribute("data-open");
    expect(chevron).not.toHaveAttribute("aria-hidden");
  });
});
