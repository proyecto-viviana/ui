/** @vitest-environment jsdom */
import { describe, expect, it } from "vite-plus/test";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { ComboBox, ComboBoxOption } from "../src/combobox";

interface Fruit {
  id: string;
  name: string;
}

const apple: Fruit = { id: "1", name: "Apple" };

describe("ComboBox", () => {
  it("updates direct reactive option children while open", () => {
    // `<ComboBoxOption>{label()}</ComboBoxOption>` compiles to a `children`
    // getter returning the current string. An untracked setup-time read would
    // freeze the first value in the option label and its text slot.
    const [label, setLabel] = createSignal("Apple");
    render(() => (
      <ComboBox<Fruit>
        label="Fruit"
        defaultOpen
        items={[apple]}
        getKey={(item) => item.id}
        getTextValue={(item) => item.name}
      >
        {(item) => <ComboBoxOption id={item.id}>{label()}</ComboBoxOption>}
      </ComboBox>
    ));

    const option = screen.getByRole("option");
    expect(option.querySelector('[data-rsp-slot="text"]')).toHaveTextContent("Apple");
    setLabel("Apricot");
    expect(option.querySelector('[data-rsp-slot="text"]')).toHaveTextContent("Apricot");
  });

  it("renders no-results empty state inside the listbox when items are empty", async () => {
    render(() => (
      <ComboBox<Fruit>
        label="Fruit"
        defaultOpen
        items={[]}
        getKey={(item) => item.id}
        getTextValue={(item) => item.name}
      >
        {(item) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
      </ComboBox>
    ));

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toHaveAttribute("data-empty");
    });
    expect(screen.getByRole("option")).toHaveTextContent("No results");
  });
});
