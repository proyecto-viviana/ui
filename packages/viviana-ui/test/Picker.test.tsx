/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vite-plus/test";
import { render, screen, waitFor, within } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { createSignal, flush } from "solid-js";
import { Picker, PickerItem, PickerSection } from "../src/picker";
import { Header, Heading, Text } from "../src";

interface SectionItem {
  href: string;
  label: string;
}

const accordion: SectionItem = { href: "#page-title", label: "Accordion" };

describe("Picker", () => {
  // #652: the list mounts only while open, and a Picker opens only on a
  // non-empty collection, so static items must be registered while closed.
  it("opens from closed with static PickerItem children and reports the choice once", async () => {
    const user = setupUser();
    const onOpenChange = vi.fn();
    const onSelectionChange = vi.fn();
    render(() => (
      <Picker
        aria-label="Blend mode"
        defaultSelectedKey="normal"
        onOpenChange={onOpenChange}
        onSelectionChange={onSelectionChange}
      >
        <PickerItem id="normal">Normal</PickerItem>
        <PickerItem id="multiply">Multiply</PickerItem>
      </Picker>
    ));
    const trigger = screen.getByRole("button", { name: /Blend mode/ });
    await waitFor(() => expect(trigger).toHaveTextContent("Normal"));
    expect(document.querySelectorAll("select option[value]:not([value=''])")).toHaveLength(2);

    await user.click(trigger);
    const listbox = await screen.findByRole("listbox");
    expect(onOpenChange.mock.calls).toEqual([[true]]);
    expect(within(listbox).getAllByRole("option")).toHaveLength(2);

    await user.click(within(listbox).getByRole("option", { name: "Multiply" }));
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(onSelectionChange.mock.calls).toEqual([["multiply"]]);
    expect(trigger).toHaveTextContent("Multiply");

    trigger.focus();
    await user.keyboard("{Enter}");
    expect(within(await screen.findByRole("listbox")).getAllByRole("option")).toHaveLength(2);
  });

  it("opens from closed with static PickerSection children", async () => {
    const user = setupUser();
    render(() => (
      <Picker aria-label="Plan">
        <PickerSection>
          <Header>Personal</Header>
          <PickerItem id="free">Free</PickerItem>
          <PickerItem id="pro">Pro</PickerItem>
        </PickerSection>
        <PickerSection>
          <Header>Organization</Header>
          <PickerItem id="team">Team</PickerItem>
        </PickerSection>
      </Picker>
    ));

    await user.click(screen.getByRole("button", { name: /Plan/ }));
    const listbox = await screen.findByRole("listbox");
    expect(within(listbox).getAllByRole("group")).toHaveLength(2);
    expect(within(listbox).getAllByRole("option")).toHaveLength(3);
  });

  // D26: the Picker tells its parent when its options open and close (#641).
  it("reports each open and close once to onOpenChange", async () => {
    const user = setupUser();
    const onOpenChange = vi.fn();
    const modes = [
      { id: "normal", label: "Normal" },
      { id: "multiply", label: "Multiply" },
    ];
    render(() => (
      <Picker aria-label="Blend mode" items={modes} onOpenChange={onOpenChange}>
        {(mode) => <PickerItem id={mode.id}>{mode.label}</PickerItem>}
      </Picker>
    ));
    const trigger = screen.getByRole("button", { name: /Blend mode/ });

    await user.click(trigger);
    const listbox = await screen.findByRole("listbox");
    expect(onOpenChange.mock.calls).toEqual([[true]]);

    await user.keyboard("{Escape}");
    await waitFor(() => expect(listbox).not.toBeInTheDocument());
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);

    await user.click(trigger);
    await user.click(
      within(await screen.findByRole("listbox")).getByRole("option", { name: "Multiply" }),
    );
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(onOpenChange.mock.calls).toEqual([[true], [false], [true], [false]]);
  });

  it("reports one listbox choice", async () => {
    const user = setupUser();
    const onChange = vi.fn();
    const onSelectionChange = vi.fn();
    render(() => (
      <Picker<SectionItem>
        aria-label="Table of contents"
        defaultOpen
        items={[accordion, { href: "#api", label: "API" }]}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        defaultSelectedKey="#page-title"
        onChange={onChange}
        onSelectionChange={onSelectionChange}
      >
        {(item) => <PickerItem id={item.href}>{item.label}</PickerItem>}
      </Picker>
    ));

    await user.click(screen.getByRole("option", { name: "API" }));
    await new Promise<void>((resolve) => {
      queueMicrotask(() => resolve());
    });
    flush();
    expect(onChange.mock.calls).toEqual([["#api"]]);
    expect(onSelectionChange.mock.calls).toEqual([["#api"]]);
  });

  it("reports one controlled listbox choice while the value stays refused", async () => {
    const user = setupUser();
    const onChange = vi.fn();
    const onSelectionChange = vi.fn();
    const { container } = render(() => (
      <Picker<SectionItem>
        aria-label="Table of contents"
        defaultOpen
        items={[accordion, { href: "#api", label: "API" }]}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        selectedKey="#page-title"
        onChange={onChange}
        onSelectionChange={onSelectionChange}
      >
        {(item) => <PickerItem id={item.href}>{item.label}</PickerItem>}
      </Picker>
    ));

    await user.click(screen.getByRole("option", { name: "Accordion" }));
    expect(onChange).not.toHaveBeenCalled();
    expect(onSelectionChange).not.toHaveBeenCalled();

    const trigger = container.querySelector('button[aria-haspopup="listbox"]');
    expect(trigger).not.toBeNull();
    await user.click(trigger as HTMLElement);
    await user.click(screen.getByRole("option", { name: "API" }));
    await new Promise<void>((resolve) => {
      queueMicrotask(() => resolve());
    });
    flush();
    expect(onChange.mock.calls).toEqual([["#api"]]);
    expect(onSelectionChange.mock.calls).toEqual([["#api"]]);
  });

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
    flush();
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

describe("Picker popup focus", () => {
  it.each(["", "#page-title"])(
    "restores the original trigger after pointer-open Escape with selectedKey=%s",
    async (selectedKey) => {
      const user = setupUser();
      const onChange = vi.fn();
      const onSelectionChange = vi.fn();
      const items: SectionItem[] = [
        { href: "", label: "Default" },
        accordion,
        { href: "#api", label: "API" },
      ];
      const { container } = render(() => (
        <Picker<SectionItem>
          aria-label="Table of contents"
          items={items}
          getKey={(item) => item.href}
          getTextValue={(item) => item.label}
          selectedKey={selectedKey}
          onChange={onChange}
          onSelectionChange={onSelectionChange}
        >
          {(item) => <PickerItem id={item.href}>{item.label}</PickerItem>}
        </Picker>
      ));
      const trigger = container.querySelector<HTMLButtonElement>('button[aria-haspopup="listbox"]');
      expect(trigger).not.toBeNull();
      const originalTrigger = trigger!;

      await user.click(originalTrigger);
      await waitFor(() => {
        expect(
          screen.getByRole("option", {
            name: selectedKey === "" ? "Default" : "Accordion",
          }),
        ).toBe(document.activeElement);
      });
      let currentDialog = screen.getByRole("dialog");
      const selectedOption = screen.getByRole("option", {
        name: selectedKey === "" ? "Default" : "Accordion",
      });
      expect(selectedOption).toHaveAttribute("data-focused");
      expect(selectedOption).toHaveAttribute("tabindex", "0");
      expect(selectedOption).toBe(document.activeElement);
      expect(selectedOption).toHaveAttribute("aria-selected", "true");
      expect(
        screen.getAllByRole("option").filter((option) => option.getAttribute("tabindex") === "0"),
      ).toEqual([selectedOption]);

      for (let attempt = 0; attempt < 2; attempt++) {
        await user.keyboard("{Escape}");
        await waitFor(() => {
          expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
          expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
          expect(currentDialog.isConnected).toBe(false);
          expect(originalTrigger).toBe(document.activeElement);
        });
        expect(originalTrigger.isConnected).toBe(true);
        expect(container.querySelector('button[aria-haspopup="listbox"]')).toBe(originalTrigger);
        expect(originalTrigger).toHaveTextContent(selectedKey === "" ? "Default" : "Accordion");
        expect(onChange).not.toHaveBeenCalled();
        expect(onSelectionChange).not.toHaveBeenCalled();

        if (attempt === 0) {
          await user.click(originalTrigger);
          await waitFor(() => {
            expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true);
          });
          currentDialog = screen.getByRole("dialog");
        }
      }
    },
  );
});
