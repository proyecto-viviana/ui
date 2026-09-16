/** @vitest-environment jsdom */
import { describe, expect, it } from "vite-plus/test";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { ComboBox, ComboBoxOption } from "../src/combobox";
import { Header, Heading, Text } from "../src";

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

  it("renders table.loading empty text when loadingState is loading", async () => {
    render(() => (
      <ComboBox<Fruit>
        label="Fruit"
        defaultOpen
        items={[]}
        loadingState="loading"
        getKey={(item) => item.id}
        getTextValue={(item) => item.name}
      >
        {(item) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
      </ComboBox>
    ));

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toHaveAttribute("data-empty");
    });
    expect(screen.getByRole("option")).toHaveTextContent("Loading…");
  });

  it("renders load-more progress when loadingState is loadingMore", async () => {
    render(() => (
      <ComboBox<Fruit>
        label="Fruit"
        defaultOpen
        items={[apple]}
        loadingState="loadingMore"
        onLoadMore={() => undefined}
        getKey={(item) => item.id}
        getTextValue={(item) => item.name}
      >
        {(item) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
      </ComboBox>
    ));

    await waitFor(() => {
      expect(screen.getByRole("progressbar", { name: "Loading more…" })).toBeInTheDocument();
    });
  });

  it("provides S2 listbox header, heading, and description slot contexts", async () => {
    render(() => (
      <ComboBox<Fruit>
        label="Fruit"
        defaultOpen
        items={[apple]}
        getKey={(item) => item.id}
        getTextValue={(item) => item.name}
      >
        {(item) => (
          <ComboBoxOption id={item.id} textValue={item.name}>
            {item.name}
            <Header data-testid="fruits-header">
              <Heading level={3}>Fruits</Heading>
            </Header>
            <Text slot="description">Seasonal</Text>
          </ComboBoxOption>
        )}
      </ComboBox>
    ));

    await waitFor(() => {
      expect(screen.getByTestId("fruits-header")).toBeInTheDocument();
    });

    const header = screen.getByTestId("fruits-header");
    const heading = header.querySelector("h3");
    const description = screen.getByText("Seasonal");

    expect(header.className).toContain("-macro-dynamic");
    expect(heading).toHaveAttribute("role", "presentation");
    expect(heading).toHaveTextContent("Fruits");
    expect(heading?.className).toContain("-macro-static");
    expect(description).toHaveAttribute("slot", "description");
    expect(description.className).toContain("-macro-dynamic");
  });
});
