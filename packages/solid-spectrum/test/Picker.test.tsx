/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { describe, expect, it, vi } from "vitest";
import { Picker, PickerItem } from "../src/picker";

interface SectionItem {
  href: string;
  label: string;
}

const sections: SectionItem[] = [
  { href: "#page-title", label: "Accordion" },
  { href: "#api", label: "API" },
];

describe("Picker (solid-spectrum)", () => {
  it("uses getKey for generated options from object-backed items", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();

    render(() => (
      <Picker<SectionItem>
        aria-label="Table of contents"
        defaultOpen
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        selectedKey="#page-title"
        onSelectionChange={onSelectionChange}
      />
    ));

    await user.click(screen.getByRole("option", { name: "API" }));

    expect(onSelectionChange).toHaveBeenCalledWith("#api");
  });

  it("supports the S2 value/defaultValue/onChange selection props", async () => {
    const user = setupUser();
    const onChange = vi.fn();
    const { unmount } = render(() => (
      <Picker<SectionItem>
        aria-label="Table of contents"
        defaultOpen
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        value="#page-title"
        onChange={onChange}
      />
    ));

    await user.click(screen.getByRole("option", { name: "API" }));
    expect(onChange).toHaveBeenCalledWith("#api");

    unmount();

    render(() => (
      <Picker<SectionItem>
        aria-label="Table of contents"
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        defaultValue="#api"
      />
    ));

    expect(screen.getByRole("button")).toHaveTextContent("API");
  });

  it("renders label help, contextual help, and custom selected value content", () => {
    render(() => (
      <Picker<SectionItem>
        label="Docs section"
        description="Pick a docs anchor"
        contextualHelp={<button type="button">Section help</button>}
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        selectedKey="#api"
        renderValue={(items) => <span data-testid="picker-value">{items[0]?.label} section</span>}
      />
    ));

    const button = screen.getByRole("button", { name: "API Docs section" });
    const description = screen.getByText("Pick a docs anchor");
    const contextualHelp = document.querySelector('[data-slot="contextualHelp"]');

    expect(button).toHaveTextContent("API section");
    expect(button.getAttribute("aria-describedby")?.split(" ")).toContain(description.id);
    expect(contextualHelp).toContainElement(screen.getByRole("button", { name: "Section help" }));
  });

  it("submits selected keys through named hidden inputs and external forms", () => {
    render(() => (
      <Picker<SectionItem>
        aria-label="Docs section"
        name="section"
        form="docs-form"
        defaultSelectedKey="#api"
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
      />
    ));

    const select = document.querySelector("select") as HTMLSelectElement;
    const hiddenInput = document.querySelector(
      'input[type="hidden"][name="section"]',
    ) as HTMLInputElement;

    expect(select).toHaveAttribute("form", "docs-form");
    expect(hiddenInput).toHaveAttribute("form", "docs-form");
    expect(hiddenInput).toHaveValue("#api");
  });

  it("uses native required validation only for native validationBehavior", () => {
    const { unmount } = render(() => (
      <Picker<SectionItem>
        label="Docs section"
        name="section"
        isRequired
        validationBehavior="aria"
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
      />
    ));

    expect(document.querySelector('select[name="section"]')).not.toBeRequired();
    unmount();

    render(() => (
      <Picker<SectionItem>
        label="Docs section"
        name="section"
        isRequired
        validationBehavior="native"
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
      />
    ));

    expect(document.querySelector('select[name="section"]')).toBeRequired();
  });

  it("renders trigger and load-more progress states", () => {
    render(() => (
      <Picker<SectionItem>
        aria-label="Docs section"
        defaultOpen
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        selectedKey="#page-title"
        loadingState="loadingMore"
        onLoadMore={vi.fn()}
      />
    ));

    expect(screen.getByRole("progressbar", { name: "Loading more" })).toBeInTheDocument();
  });

  it("keeps the load-more sentinel active without showing loading UI while idle", () => {
    const onLoadMore = vi.fn();

    render(() => (
      <Picker<SectionItem>
        aria-label="Docs section"
        defaultOpen
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        selectedKey="#page-title"
        loadingState="idle"
        onLoadMore={onLoadMore}
      >
        {(item) => <PickerItem id={item.href}>{item.label}</PickerItem>}
      </Picker>
    ));

    expect(screen.queryByRole("progressbar", { name: "Loading" })).not.toBeInTheDocument();
    const loadMoreOption = screen.getAllByRole("option").at(-1);
    expect(loadMoreOption).toHaveAttribute("aria-disabled", "true");

    fireEvent.focus(loadMoreOption!);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});
