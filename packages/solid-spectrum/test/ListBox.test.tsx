/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { ListBox, ListBoxOption } from "../src/listbox";
import { setupUser, firePointerDown } from "@proyecto-viviana/solid-spectrum-test-utils";

interface AnimalItem {
  id: string;
  label: string;
}

const items: AnimalItem[] = [
  { id: "cat", label: "Cat" },
  { id: "dog", label: "Dog" },
  { id: "fox", label: "Fox" },
];

function renderListBox(props: Partial<Parameters<typeof ListBox<AnimalItem>>[0]> = {}) {
  render(() => (
    <ListBox<AnimalItem>
      items={items}
      getKey={(item) => item.id}
      selectionMode="single"
      label="Animals"
      {...props}
    >
      {(item) => <ListBoxOption id={item.id}>{item.label}</ListBoxOption>}
    </ListBox>
  ));
}

describe("ListBox (solid-spectrum)", () => {
  it("uses visible label wiring via aria-labelledby", () => {
    renderListBox();
    const listbox = screen.getByRole("listbox", { name: "Animals" });
    expect(listbox).toHaveAttribute("aria-labelledby");
  });

  it("wires description text to aria-describedby", () => {
    renderListBox({ description: "Use arrow keys to navigate." });
    const listbox = screen.getByRole("listbox", { name: "Animals" });
    const description = screen.getByText("Use arrow keys to navigate.");
    expect(listbox.getAttribute("aria-describedby")).toContain(description.id);
  });

  it("does not select options when listbox is disabled", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();
    renderListBox({ isDisabled: true, onSelectionChange });

    await user.click(screen.getByText("Cat"));
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("selects on pointer down when shouldSelectOnPressUp is false", () => {
    const onSelectionChange = vi.fn();
    renderListBox({
      shouldSelectOnPressUp: false,
      onSelectionChange,
    });

    firePointerDown(screen.getByText("Cat"));
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });
});
