/**
 * Radio group state for Solid Stately
 *
 * Provides state management for a radio group component.
 * Provides a name for the group, and manages selection and focus state.
 *
 * This is a 1:1 port of @react-stately/radio's useRadioGroupState.
 */

import { createMemo, createSignal, Accessor, untrack } from "solid-js";
import { type MaybeAccessor, access } from "../utils";
import { createId } from "../ssr";
import {
  createFormValidationState,
  type FormValidationState,
  type ValidationFunction,
  type ValidationResult,
} from "../form";

export interface RadioGroupProps {
  /** The current selected value (controlled). */
  value?: string | null;
  /** The default selected value (uncontrolled). */
  defaultValue?: string | null;
  /** Handler that is called when the value changes. */
  onChange?: (value: string) => void;
  /** Whether the radio group is disabled. */
  isDisabled?: boolean;
  /** Whether the radio group is read only. */
  isReadOnly?: boolean;
  /** Whether the radio group is required. */
  isRequired?: boolean;
  /** Whether the radio group is invalid. */
  isInvalid?: boolean;
  /** The name of the radio group, used when submitting an HTML form. */
  name?: string;
  /** The form to associate the radio group with. */
  form?: string;
  /** The label for the radio group. */
  label?: string;
  /** Orientation of the radio group. */
  orientation?: "horizontal" | "vertical";
  /** Handler that is called when the radio group receives focus. */
  onFocus?: (e: FocusEvent) => void;
  /** Handler that is called when the radio group loses focus. */
  onBlur?: (e: FocusEvent) => void;
  /** Handler that is called when the radio group's focus status changes. */
  onFocusChange?: (isFocused: boolean) => void;
  /** Backward-compatible controlled validation state. */
  validationState?: "valid" | "invalid";
  /** Custom validation function. */
  validate?: ValidationFunction<string | null>;
  /** Validation behavior for the radio group. */
  validationBehavior?: "aria" | "native";
}

export interface RadioGroupState extends Pick<
  FormValidationState,
  | "realtimeValidation"
  | "displayValidation"
  | "updateValidation"
  | "resetValidation"
  | "commitValidation"
> {
  /** The name for the group, used for native form submission. */
  readonly name: string;

  /** Whether the radio group is disabled. */
  readonly isDisabled: boolean;

  /** Whether the radio group is read only. */
  readonly isReadOnly: boolean;

  /** Whether the radio group is required. */
  readonly isRequired: boolean;

  /** Whether the radio group is invalid. */
  readonly isInvalid: boolean;

  /** The currently selected value. */
  readonly selectedValue: Accessor<string | null>;

  /** The default selected value. */
  readonly defaultSelectedValue: string | null;

  /** Sets the selected value. */
  setSelectedValue(value: string | null): void;

  /** The value of the last focused radio. */
  readonly lastFocusedValue: Accessor<string | null>;

  /** Sets the last focused value. */
  setLastFocusedValue(value: string | null): void;

  /** Current display validation result for the group. */
  readonly displayValidation: Accessor<ValidationResult>;
}

/**
 * Internal WeakMap to store sync version accessors for each radio group state.
 * This is used by createRadio to trigger DOM sync when native radio behavior
 * causes the DOM checked state to desync from our reactive state.
 *
 * This is kept separate from RadioGroupState to maintain API parity with React-Stately.
 * @internal
 */
export const radioGroupSyncVersion: WeakMap<RadioGroupState, Accessor<number>> = new WeakMap();

/**
 * Provides state management for a radio group component.
 * Provides a name for the group, and manages selection and focus state.
 */
export function createRadioGroupState(props: MaybeAccessor<RadioGroupProps> = {}): RadioGroupState {
  const getProps = () => access(props);

  // Get initial props using untrack to avoid setting up dependencies
  // This ensures we capture the initial defaultValue without reactivity issues
  const initialProps = untrack(() => getProps());

  // Generate name - preserved for backward compatibility
  // React Aria now generates the name instead of stately
  const name = initialProps.name || `radio-group-${createId()}`;

  // Create internal signal for uncontrolled mode
  // Initialize with defaultValue only (not value, which is for controlled mode)
  const [internalValue, setInternalValue] = createSignal<string | null>(
    initialProps.defaultValue ?? null,
  );
  const [lastFocusedValue, setLastFocusedValueInternal] = createSignal<string | null>(null);

  // SolidJS-specific: Version counter for triggering DOM sync across all radios
  // This handles the case where native radio behavior causes DOM state to desync
  // from our reactive state (e.g., clicking a radio unchecks siblings in the DOM)
  const [syncVersion, setSyncVersion] = createSignal(0);

  const controlledValue = createMemo<string | null | undefined>(() => {
    const value = getProps().value;
    return value === undefined ? undefined : (value ?? null);
  });

  // Determine if controlled - must be reactive to handle dynamic props
  const isControlled = () => controlledValue() !== undefined;

  // Get current value - reactive for both controlled and uncontrolled modes
  const selectedValue: Accessor<string | null> = () => {
    // In controlled mode, always read from props.value reactively
    // In uncontrolled mode, read from internal signal
    const value = controlledValue();
    if (value !== undefined) {
      return value;
    }
    return internalValue();
  };

  const validation = createFormValidationState<string | null>({
    get value() {
      return selectedValue();
    },
    get isInvalid() {
      return getProps().isInvalid;
    },
    get validationState() {
      return getProps().validationState;
    },
    get validate() {
      return getProps().validate;
    },
    get validationBehavior() {
      return getProps().validationBehavior ?? "native";
    },
    get name() {
      return getProps().name;
    },
  });

  // Set value
  function setSelectedValue(value: string | null): void {
    const p = getProps();
    if (p.isReadOnly || p.isDisabled) {
      return;
    }

    // Always increment syncVersion to trigger DOM sync across all radios
    // This is crucial for SolidJS because:
    // 1. Native radio behavior unchecks siblings when one is checked
    // 2. In controlled mode, isSelected() may not change even though DOM changed
    // 3. We need ALL radios to re-sync their checked state after any click
    setSyncVersion((v) => v + 1);

    if (!isControlled()) {
      setInternalValue(value);
    }

    if (value != null) {
      p.onChange?.(value);
    }

    validation.commitValidation();
  }

  // Set last focused value
  function setLastFocusedValue(value: string | null): void {
    setLastFocusedValueInternal(value);
  }

  const state: RadioGroupState = {
    name,
    selectedValue,
    defaultSelectedValue: initialProps.defaultValue ?? null,
    setSelectedValue,
    lastFocusedValue,
    setLastFocusedValue,
    realtimeValidation: validation.realtimeValidation,
    displayValidation: validation.displayValidation,
    updateValidation: validation.updateValidation,
    resetValidation: validation.resetValidation,
    commitValidation: validation.commitValidation,
    get isDisabled() {
      return getProps().isDisabled ?? false;
    },
    get isReadOnly() {
      return getProps().isReadOnly ?? false;
    },
    get isRequired() {
      return getProps().isRequired ?? false;
    },
    get isInvalid() {
      return validation.displayValidation().isInvalid;
    },
  };

  // Store syncVersion in internal WeakMap (not part of public API)
  // This maintains API parity with React-Stately while supporting SolidJS's reactivity needs
  radioGroupSyncVersion.set(state, syncVersion);

  return state;
}
