/* Panel — pickers. Choose-one-from-many: Picker, the composed low-level Select
   assembly, ComboBox, and the Autocomplete headless provider. The Solid surface
   is items-driven: collections come from `items`/`defaultItems` plus a render
   function — static option JSX isn't part of the API (children evaluate before
   the collection context exists), and the flat collection has no sections
   (PickerSection/ComboBoxSection are composed-listbox primitives only). */
import { createFileRoute } from "@tanstack/solid-router";
import {
  Picker,
  PickerItem,
  Select,
  SelectTrigger,
  SelectValue,
  SelectListBox,
  SelectOption,
  ComboBox,
  ComboBoxItem,
  Autocomplete,
} from "@proyecto-viviana/ui";
import { Demo, Panel, Row } from "@/components/showcase/chrome";
import { panelBySlug, panelSeo } from "@/components/showcase/registry";

export const Route = createFileRoute("/showcase/pickers")({
  head: () => panelSeo("pickers"),
  component: Page,
});

interface Option {
  id: string;
  label: string;
}

const plans: Option[] = [
  { id: "starter", label: "Starter" },
  { id: "pro", label: "Pro" },
  { id: "enterprise", label: "Enterprise" },
];

const team: Option[] = [
  { id: "rivas", label: "Rivas" },
  { id: "onwuka", label: "Onwuka" },
  { id: "salas", label: "Salas" },
  { id: "haas", label: "Haas" },
];

const fruit: Option[] = [
  { id: "apple", label: "Apple" },
  { id: "banana", label: "Banana" },
  { id: "cherry", label: "Cherry" },
];

const animals: Option[] = [
  { id: "cat", label: "Cat" },
  { id: "dog", label: "Dog" },
  { id: "fox", label: "Fox" },
];

const planOption = (item: Option) => (
  <PickerItem id={item.id} item={item} textValue={item.label}>
    {item.label}
  </PickerItem>
);

const fruitOption = (item: Option) => (
  <ComboBoxItem id={item.id} textValue={item.label}>
    {item.label}
  </ComboBoxItem>
);

function Page() {
  const def = panelBySlug("pickers")!;

  return (
    <Panel def={def}>
      <Demo label="Picker · basic — items-driven collection, defaultSelectedKey">
        <Row>
          <Picker items={plans} aria-label="Plan" defaultSelectedKey="pro">
            {planOption}
          </Picker>
          <Picker items={plans} aria-label="Plan (disabled option)" defaultSelectedKey="starter">
            {(item: Option) => (
              <PickerItem
                id={item.id}
                item={item}
                textValue={item.label}
                isDisabled={item.id === "pro"}
              >
                {item.label}
              </PickerItem>
            )}
          </Picker>
          <Picker items={plans} aria-label="Plan (small)" size="S" defaultSelectedKey="pro">
            {planOption}
          </Picker>
          <Picker items={plans} aria-label="Plan (disabled)" isDisabled defaultSelectedKey="pro">
            {planOption}
          </Picker>
        </Row>
      </Demo>

      <Demo label="Picker · labeled — label + description; the flat collection has no sections">
        <Row>
          <Picker
            items={team}
            label="Assignee"
            description="Tasks route to the assignee's queue."
            defaultSelectedKey="rivas"
          >
            {planOption}
          </Picker>
        </Row>
      </Demo>

      <Demo label="Select · composed — SelectTrigger/SelectValue + SelectListBox/SelectOption">
        <Row>
          <Select<Option>
            aria-label="Animals"
            items={animals}
            getKey={(item) => item.id}
            getTextValue={(item) => item.label}
            defaultSelectedKey="dog"
          >
            <SelectTrigger>
              <SelectValue<Option> placeholder="Choose an animal" />
            </SelectTrigger>
            <SelectListBox<Option>>
              {(item) => <SelectOption id={item.id}>{item.label}</SelectOption>}
            </SelectListBox>
          </Select>
        </Row>
      </Demo>

      <Demo label="ComboBox · basic — filterable input, defaultSelectedKey">
        <Row>
          <ComboBox aria-label="Fruit" defaultItems={fruit} defaultSelectedKey="apple">
            {fruitOption}
          </ComboBox>
          <ComboBox aria-label="Fruit (disabled option)" defaultItems={fruit}>
            {(item: Option) => (
              <ComboBoxItem id={item.id} textValue={item.label} isDisabled={item.id === "banana"}>
                {item.label}
              </ComboBoxItem>
            )}
          </ComboBox>
          <ComboBox
            aria-label="Fruit (disabled)"
            defaultItems={fruit}
            isDisabled
            defaultInputValue="Apple"
          >
            {fruitOption}
          </ComboBox>
        </Row>
      </Demo>

      <Demo label="ComboBox · sizes — S / M / L on the same collection">
        <Row>
          <ComboBox aria-label="Fruit (small)" defaultItems={fruit} size="S">
            {fruitOption}
          </ComboBox>
          <ComboBox aria-label="Fruit (medium)" defaultItems={fruit} size="M">
            {fruitOption}
          </ComboBox>
          <ComboBox aria-label="Fruit (large)" defaultItems={fruit} size="L">
            {fruitOption}
          </ComboBox>
        </Row>
      </Demo>

      <Demo label="Autocomplete — headless filter provider (no styled consumer on the barrel; wraps a ComboBox)">
        <Row>
          <Autocomplete>
            <ComboBox aria-label="Fruit" defaultItems={fruit}>
              {fruitOption}
            </ComboBox>
          </Autocomplete>
        </Row>
      </Demo>
    </Panel>
  );
}
