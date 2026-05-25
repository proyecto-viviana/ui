/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { Select, SelectTrigger, SelectValue, SelectListBox, SelectOption } from "../src/select";

interface AnimalItem {
  id: string;
  label: string;
}

const items: AnimalItem[] = [
  { id: "cat", label: "Cat" },
  { id: "dog", label: "Dog" },
  { id: "fox", label: "Fox" },
];

function renderSelect(props: Partial<Parameters<typeof Select<AnimalItem>>[0]> = {}) {
  render(() => (
    <Select<AnimalItem>
      items={items}
      getKey={(item) => item.id}
      getTextValue={(item) => item.label}
      label="Animals"
      {...props}
    >
      <SelectTrigger>
        <SelectValue placeholder="Choose an animal" />
      </SelectTrigger>
      <SelectListBox>
        {(item) => <SelectOption id={item.id}>{item.label}</SelectOption>}
      </SelectListBox>
    </Select>
  ));
}

describe("Select (solid-spectrum)", () => {
  it("wires visible label to trigger button via aria-labelledby", () => {
    renderSelect();
    const trigger = screen.getByRole("button", { name: "Animals" });
    expect(trigger).toHaveAttribute("aria-labelledby");
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
  });

  it("wires description text to trigger button aria-describedby", () => {
    renderSelect({ description: "Pick one option." });

    const trigger = screen.getByRole("button", { name: "Animals" });
    const description = screen.getByText("Pick one option.");
    expect(trigger.getAttribute("aria-describedby")).toContain(description.id);
  });

  it("wires error text to trigger button aria-describedby when invalid", () => {
    renderSelect({
      description: "Pick one option.",
      isInvalid: true,
      errorMessage: "Selection is required.",
    });

    const trigger = screen.getByRole("button", { name: "Animals" });
    const error = screen.getByText("Selection is required.");
    expect(trigger.getAttribute("aria-describedby")).toContain(error.id);
    expect(screen.queryByText("Pick one option.")).not.toBeInTheDocument();
  });

  it("does not select options when select is disabled", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();
    renderSelect({
      isDisabled: true,
      defaultOpen: true,
      onSelectionChange,
    });

    await user.click(screen.getByRole("option", { name: "Cat" }));
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("does not emit dangling aria-describedby on simple options", () => {
    renderSelect({ defaultOpen: true });

    const options = screen.getAllByRole("option");
    expect(options[0]).not.toHaveAttribute("aria-describedby");
  });
});
