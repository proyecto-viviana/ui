/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vite-plus/test";
import { render, screen, waitFor, within } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";
import { ComboBox, ComboBoxItem, ComboBoxOption, ComboBoxSection } from "../src/combobox";
import { Header, Heading, Text } from "../src";

interface Fruit {
  id: string;
  name: string;
}

const apple: Fruit = { id: "1", name: "Apple" };

describe("ComboBox", () => {
  // #656: static children never reached the collection; the one option the
  // open list held was the "No results" row.
  it("lists static ComboBoxItem children, filters them and reports a choice once", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();
    render(() => (
      <ComboBox aria-label="Fruit" onSelectionChange={onSelectionChange}>
        <ComboBoxItem id="apple">Apple</ComboBoxItem>
        <ComboBoxItem id="banana">Banana</ComboBoxItem>
      </ComboBox>
    ));
    const input = screen.getByRole("combobox");

    await user.click(screen.getByRole("button"));
    await waitFor(() =>
      expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
        "Apple",
        "Banana",
      ]),
    );

    await user.click(screen.getByRole("option", { name: "Banana" }));
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(onSelectionChange.mock.calls).toEqual([["banana"]]);
    expect(input).toHaveValue("Banana");

    await user.clear(input);
    await user.type(input, "ap");
    await waitFor(() =>
      expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["Apple"]),
    );
    await user.keyboard("{ArrowDown}{Enter}");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(onSelectionChange.mock.calls.at(-1)).toEqual(["apple"]);
    expect(input).toHaveValue("Apple");
  });

  it("shows a default selection from static children while closed, and lists static sections", async () => {
    const user = setupUser();
    render(() => (
      <ComboBox aria-label="Plan" defaultSelectedKey="pro">
        <ComboBoxSection>
          <Header>Personal</Header>
          <ComboBoxItem id="free">Free</ComboBoxItem>
          <ComboBoxItem id="pro">Pro</ComboBoxItem>
        </ComboBoxSection>
        <ComboBoxSection>
          <Header>Organization</Header>
          <ComboBoxItem id="team">Team</ComboBoxItem>
        </ComboBoxSection>
      </ComboBox>
    ));
    const input = screen.getByRole("combobox");
    await waitFor(() => expect(input).toHaveValue("Pro"));
    expect(screen.queryByText("Personal")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(3));
    // Match pinned ComboBoxTester.getSections(): query groups within its listbox.
    expect(within(screen.getByRole("listbox")).queryAllByRole("group")).toHaveLength(2);

    await user.clear(input);
    await user.type(input, "tea");
    await waitFor(() =>
      expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["Team"]),
    );
    expect(within(screen.getByRole("listbox")).queryAllByRole("group")).toHaveLength(1);
    expect(screen.queryByText("Personal")).not.toBeInTheDocument();
  });

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
    flush();
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

  it("provides S2 ComboBoxItem label and description TextContext", async () => {
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
            <Text slot="label">{item.name}</Text>
            <Text slot="description">Seasonal</Text>
          </ComboBoxOption>
        )}
      </ComboBox>
    ));

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
    });

    const label = screen.getByText("Apple");
    const description = screen.getByText("Seasonal");
    expect(label).toHaveAttribute("slot", "label");
    expect(label.className).toContain("-macro-");
    expect(description).toHaveAttribute("slot", "description");
    expect(description.className).toContain("-macro-dynamic");
  });
});
