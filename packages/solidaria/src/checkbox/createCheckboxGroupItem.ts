/**
 * Checkbox group item hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a checkbox component
 * contained within a checkbox group.
 *
 * This is a 1:1 port of @react-aria/checkbox's useCheckboxGroupItem hook.
 */

import { JSX } from "solid-js";
import { createCheckbox, type AriaCheckboxProps, type CheckboxAria } from "./createCheckbox";
import { type ToggleState, type CheckboxGroupState } from "@proyecto-viviana/solid-stately";
import { checkboxGroupData } from "./createCheckboxGroup";
import { type MaybeAccessor, access } from "../utils/reactivity";

export interface AriaCheckboxGroupItemProps extends Omit<
  AriaCheckboxProps,
  "isSelected" | "defaultSelected"
> {
  /** The value of the checkbox. */
  value: string;
}

/**
 * Provides the behavior and accessibility implementation for a checkbox component
 * contained within a checkbox group.
 *
 * @param props - Props for the checkbox.
 * @param state - State for the checkbox group, as returned by `createCheckboxGroupState`.
 * @param inputRef - A ref accessor for the HTML input element.
 */
export function createCheckboxGroupItem(
  props: MaybeAccessor<AriaCheckboxGroupItemProps>,
  state: CheckboxGroupState,
  inputRef: () => HTMLInputElement | null,
): CheckboxAria {
  const getProps = () => access(props);

  // Create toggle state that syncs with the group state
  const toggleState: ToggleState = {
    isSelected: () => state.isSelected(getProps().value),
    defaultSelected: state.defaultValue.includes(getProps().value),
    setSelected(isSelected: boolean) {
      const value = getProps().value;
      if (isSelected) {
        state.addValue(value);
      } else {
        state.removeValue(value);
      }
      getProps().onChange?.(isSelected);
    },
    toggle() {
      state.toggleValue(getProps().value);
    },
  };

  const getGroupData = () => checkboxGroupData.get(state);

  const checkboxProps = (): AriaCheckboxProps => {
    const p = getProps();
    const groupData = getGroupData();

    return {
      ...p,
      isReadOnly: p.isReadOnly ?? state.isReadOnly,
      isDisabled: p.isDisabled ?? state.isDisabled,
      isInvalid: p.isInvalid ?? state.isInvalid,
      name: p.name ?? groupData?.name,
      form: p.form ?? groupData?.form,
      isRequired: p.isRequired ?? state.isRequired(),
      validationBehavior: p.validationBehavior ?? groupData?.validationBehavior ?? "native",
    };
  };

  const result = createCheckbox(checkboxProps, toggleState, inputRef);

  return {
    ...result,
    get inputProps() {
      const baseInputProps = result.inputProps;
      const groupData = getGroupData();

      // Mirror upstream useCheckboxGroupItem: keep the checkbox's own
      // aria-describedby (its description/error slot ids from createCheckbox/
      // createToggle, which already fold in the user's aria-describedby) and append
      // the group's shared description/error ids.
      const ariaDescribedBy =
        [
          baseInputProps["aria-describedby"],
          state.isInvalid && groupData?.errorMessageId ? groupData.errorMessageId : null,
          groupData?.descriptionId,
        ]
          .filter(Boolean)
          .join(" ") || undefined;

      return {
        ...baseInputProps,
        "aria-describedby": ariaDescribedBy,
      } as JSX.InputHTMLAttributes<HTMLInputElement>;
    },
  };
}
