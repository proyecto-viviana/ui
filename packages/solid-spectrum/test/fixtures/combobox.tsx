/**
 * Shared fixture for the ComboBox SSR/hydrate twin (#545 class 3).
 *
 * `description` and `errorMessage` render through `Text` → `ElementTag` →
 * Solid's `dynamic`, whose hydration claim has no fallback: they are the first
 * nodes in the subtree that turn a shifted hydration key into a thrown
 * `Hydration Mismatch` instead of a silent client re-render. Both are what
 * `/solid-spectrum/docs/components/combobox` puts on the page.
 */
import type { JSX } from "@solidjs/web";
import { ComboBox, ComboBoxOption } from "../../src/combobox";

export interface FoodItem {
  id: string;
  name: string;
}

export const foods: FoodItem[] = [
  { id: "apple", name: "Apple" },
  { id: "banana", name: "Banana" },
];

export function ComboBoxHelpTextFixture(): JSX.Element {
  return (
    <ComboBox<FoodItem>
      items={foods}
      getKey={(item) => item.id}
      getTextValue={(item) => item.name}
      label="Favorite food"
      description="Choose your favorite food"
      isInvalid
      errorMessage="Please select a valid food item"
    >
      {(item: FoodItem) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
    </ComboBox>
  );
}
