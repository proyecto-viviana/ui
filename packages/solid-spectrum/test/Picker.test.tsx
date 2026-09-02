/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { describe, expect, it, vi } from "vite-plus/test";
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

  it("mirrors the selected option's full content (icon + label) in the trigger", () => {
    render(() => (
      <Picker<SectionItem>
        aria-label="Table of contents"
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        selectedKey="#api"
      >
        {(item) => (
          <PickerItem id={item.href} item={item} textValue={item.label}>
            <svg slot="icon" data-testid={`icon-${item.href}`} aria-hidden="true" />
            <span slot="label">{item.label}</span>
          </PickerItem>
        )}
      </Picker>
    ));

    const button = screen.getByRole("button");
    // The trigger shows the label text of the selected option...
    expect(button).toHaveTextContent("API");
    // ...and, faithfully to upstream S2 `SelectValue`, the option's icon slot —
    // the whole rendered node is mirrored, not just its text.
    const triggerIcon = button.querySelector('[slot="icon"]');
    expect(triggerIcon).not.toBeNull();
    expect(triggerIcon).toHaveAttribute("data-testid", "icon-#api");
    // Only the selected option's icon is mirrored (no stray duplicate).
    expect(button.querySelectorAll('[slot="icon"]').length).toBe(1);
  });

  it("supports multiple selection with selectedKeys/defaultSelectedKeys/onSelectionChangeKeys", async () => {
    const user = setupUser();
    const onSelectionChangeKeys = vi.fn();
    const { unmount } = render(() => (
      <Picker<SectionItem>
        aria-label="Table of contents"
        selectionMode="multiple"
        defaultOpen
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        selectedKeys={["#page-title"]}
        onSelectionChangeKeys={onSelectionChangeKeys}
      />
    ));

    expect(screen.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");

    await user.click(screen.getByRole("option", { name: "API" }));

    expect(onSelectionChangeKeys).toHaveBeenLastCalledWith(new Set(["#page-title", "#api"]));

    unmount();

    render(() => (
      <Picker<SectionItem>
        aria-label="Table of contents"
        selectionMode="multiple"
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        defaultSelectedKeys={["#page-title", "#api"]}
        renderValue={(items) => <span>{items.map((item) => item.label).join(" + ")}</span>}
      />
    ));

    expect(screen.getByRole("button")).toHaveTextContent("Accordion + API");
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

    // Upstream `useSelect` folds the selected value ahead of the field label in the
    // trigger name (`aria-labelledby=[valueId, labelId]`). Here the custom renderValue
    // is "API section" and the label is "Docs section", so the accessible name is the
    // concatenation "API section Docs section".
    const button = screen.getByRole("button", { name: "API section Docs section" });
    const description = screen.getByText("Pick a docs anchor");
    const contextualHelp = document.querySelector('[data-slot="contextualHelp"]');

    expect(button).toHaveTextContent("API section");
    expect(button.getAttribute("aria-describedby")?.split(" ")).toContain(description.id);
    expect(contextualHelp).toContainElement(screen.getByRole("button", { name: "Section help" }));
  });

  // RAC HiddenSelect (≤300 items) submits through the hidden <select> itself so
  // browser autofill works; there is no parallel <input type="hidden">
  // (react-aria/src/select/HiddenSelect.tsx; RAC Select.test.js "should support
  // form prop" queries `[name=select]`).
  it("submits the selected key through the named hidden select and external forms", () => {
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

    const named = document.querySelectorAll('[name="section"]');
    expect(named).toHaveLength(1);
    const select = named[0] as HTMLSelectElement;
    expect(select.tagName).toBe("SELECT");
    expect(select).toHaveAttribute("form", "docs-form");
    expect(select).toHaveValue("#api");
  });

  it("submits multiple selected values as FormData entries of the hidden select", () => {
    render(() => (
      <form data-testid="form">
        <Picker<SectionItem>
          aria-label="Docs section"
          selectionMode="multiple"
          name="section"
          defaultSelectedKeys={["#page-title", "#api"]}
          items={sections}
          getKey={(item) => item.href}
          getTextValue={(item) => item.label}
        />
      </form>
    ));

    const select = document.querySelector('select[name="section"]') as HTMLSelectElement;
    expect(select).toHaveAttribute("multiple");
    expect(new FormData(screen.getByTestId("form") as HTMLFormElement).getAll("section")).toEqual([
      "#page-title",
      "#api",
    ]);
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

    expect(screen.getByRole("progressbar", { name: "Loading more…" })).toBeInTheDocument();
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

    expect(screen.queryByRole("progressbar", { name: "Loading…" })).not.toBeInTheDocument();
    const loadMoreOption = screen.getAllByRole("option").at(-1);
    expect(loadMoreOption).toHaveAttribute("aria-disabled", "true");

    fireEvent.focus(loadMoreOption!);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});
