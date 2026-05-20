/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { ComboBox, ComboBoxContext, ComboBoxOption, Form, type ComboBoxProps } from "../src";
import { SearchAutocomplete } from "../src/autocomplete";

const items = [
  { id: "1", name: "Apple" },
  { id: "2", name: "Banana" },
];

type Fruit = (typeof items)[number];

function FruitComboBox(props: Partial<ComboBoxProps<Fruit>>) {
  return (
    <ComboBox<Fruit>
      label="Fruit"
      items={items}
      getKey={(item) => item.id}
      getTextValue={(item) => item.name}
      {...props}
    >
      {(item) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
    </ComboBox>
  );
}

describe("ComboBox (solid-spectrum)", () => {
  it("associates visible label with combobox input", () => {
    render(() => <FruitComboBox />);

    expect(screen.getByRole("combobox", { name: "Fruit" })).toBeInTheDocument();
  });

  it("links description text via aria-describedby", () => {
    render(() => <FruitComboBox description="Pick one item" />);

    const input = screen.getByRole("combobox", { name: "Fruit" });
    const describedBy = input.getAttribute("aria-describedby") ?? "";
    const description = screen.getByText("Pick one item");

    expect(describedBy).toContain(description.id);
  });

  it("links error text and omits hidden description ids when invalid", () => {
    render(() => (
      <FruitComboBox description="Pick one item" errorMessage="Selection is required" isInvalid />
    ));

    const input = screen.getByRole("combobox", { name: "Fruit" });
    const describedBy = input.getAttribute("aria-describedby") ?? "";
    const error = screen.getByText("Selection is required");

    expect(screen.queryByText("Pick one item")).not.toBeInTheDocument();
    expect(describedBy).not.toContain("description");
    expect(describedBy).toContain(error.id);
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("submits selected key by default when name is provided", () => {
    render(() => <FruitComboBox name="fruit" defaultSelectedKey="1" />);

    const input = screen.getByRole("combobox", { name: "Fruit" });
    const hiddenInput = document.querySelector('input[type="hidden"][name="fruit"]');

    expect(input).not.toHaveAttribute("name");
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveValue("1");
  });

  it("uses text submission when allowsCustomValue is enabled", () => {
    render(() => (
      <FruitComboBox
        name="fruit"
        formValue="key"
        allowsCustomValue
        defaultInputValue="Dragonfruit"
      />
    ));

    const input = screen.getByRole("combobox", { name: "Fruit" });
    const hiddenInput = document.querySelector('input[type="hidden"][name="fruit"]');

    expect(input).toHaveAttribute("name", "fruit");
    expect(input).toHaveValue("Dragonfruit");
    expect(hiddenInput).not.toBeInTheDocument();
  });

  it("inherits disabled and required state from Form", () => {
    render(() => (
      <Form isDisabled isRequired>
        <FruitComboBox />
      </Form>
    ));

    const input = screen.getByRole("combobox", { name: "Fruit" });

    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("aria-required", "true");
  });

  it("uses context props and root refs", () => {
    const ref: { current?: HTMLDivElement | null } = { current: null };

    render(() => (
      <ComboBoxContext.Provider
        value={{
          label: "Context fruit",
          isRequired: true,
          ref,
          UNSAFE_className: "from-context",
        }}
      >
        <ComboBox<Fruit>
          items={items}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
        >
          {(item) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
        </ComboBox>
      </ComboBoxContext.Provider>
    ));

    expect(screen.getByRole("combobox", { name: "Context fruit" })).toBeInTheDocument();
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass("from-context");
  });

  it("renders contextual help in the label row", () => {
    render(() => <FruitComboBox contextualHelp={<button type="button">Help</button>} />);

    expect(screen.getByRole("button", { name: "Help" })).toBeInTheDocument();
  });
});

describe("SearchAutocomplete (solid-spectrum)", () => {
  it("uses visible label as combobox accessible name", () => {
    render(() => <SearchAutocomplete label="Search fruit" items={items} />);

    expect(screen.getByRole("combobox", { name: "Search fruit" })).toBeInTheDocument();
  });
});
