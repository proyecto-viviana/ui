/**
 * createFormValidationState for solid-stately
 *
 * Manages form validation state including realtime and displayed validation results.
 * Supports both ARIA (live) and native (on submit) validation behaviors.
 *
 * Port of react-stately's useFormValidationState.
 */

import {
  type Accessor,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  useContext,
} from "solid-js";

/** Standard HTML ValidityState interface. */
export interface ValidityState {
  badInput: boolean;
  customError: boolean;
  patternMismatch: boolean;
  rangeOverflow: boolean;
  rangeUnderflow: boolean;
  stepMismatch: boolean;
  tooLong: boolean;
  tooShort: boolean;
  typeMismatch: boolean;
  valueMissing: boolean;
  valid: boolean;
}

/** Result of validation. */
export interface ValidationResult {
  /** Whether the value is invalid. */
  isInvalid: boolean;
  /** Details about which validation constraints failed. */
  validationDetails: ValidityState;
  /** Error messages to display. */
  validationErrors: string[];
}

/** Map of field names to their validation errors. */
export type ValidationErrors = Record<string, string | string[]>;

/** Validation function that returns error messages or true/false. */
export type ValidationFunction<T> = (value: T) => boolean | string | string[] | null | undefined;

/** Validation behavior mode. */
export type ValidationBehavior = "aria" | "native";

export interface FormValidationProps<T> {
  /** Whether the value is invalid (controlled). */
  isInvalid?: boolean;
  /** @deprecated Use isInvalid instead. */
  validationState?: "valid" | "invalid";
  /** Custom validation function. */
  validate?: ValidationFunction<T>;
  /** Validation behavior: 'aria' for realtime, 'native' for on submit. */
  validationBehavior?: ValidationBehavior;
  /** Built-in validation result from native input. */
  builtinValidation?: ValidationResult;
  /** Field name(s) for server error lookup. */
  name?: string | string[];
  /** Current field value. */
  value: T | null;
}

export interface FormValidationState {
  /** Realtime validation results, updated as the user edits the value. */
  realtimeValidation: Accessor<ValidationResult>;
  /** Currently displayed validation results, updated when the user commits their changes. */
  displayValidation: Accessor<ValidationResult>;
  /** Updates the current validation result. Not displayed to the user until `commitValidation` is called. */
  updateValidation(result: ValidationResult): void;
  /** Resets the displayed validation state to valid when the user resets the form. */
  resetValidation(): void;
  /** Commits the realtime validation so it is displayed to the user. */
  commitValidation(): void;
}

/** A valid validity state. */
export const VALID_VALIDITY_STATE: ValidityState = {
  badInput: false,
  customError: false,
  patternMismatch: false,
  rangeOverflow: false,
  rangeUnderflow: false,
  stepMismatch: false,
  tooLong: false,
  tooShort: false,
  typeMismatch: false,
  valueMissing: false,
  valid: true,
};

/** A custom error validity state. */
const CUSTOM_VALIDITY_STATE: ValidityState = {
  ...VALID_VALIDITY_STATE,
  customError: true,
  valid: false,
};

/** Default validation result (valid). */
export const DEFAULT_VALIDATION_RESULT: ValidationResult = {
  isInvalid: false,
  validationDetails: VALID_VALIDITY_STATE,
  validationErrors: [],
};

/** Context for server-side validation errors. */
export const FormValidationContext = createContext<ValidationErrors>({});

/** Private prop key for passing validation state to children. */
export const privateValidationStateProp = "__formValidationState" + Date.now();

function asArray<T>(v: T | T[] | undefined): T[] {
  if (!v) {
    return [];
  }
  return Array.isArray(v) ? v : [v];
}

function runValidate<T>(validate: ValidationFunction<T>, value: T): string[] {
  if (typeof validate === "function") {
    const e = validate(value);
    if (e && typeof e !== "boolean") {
      return asArray(e);
    }
  }
  return [];
}

function getValidationResult(errors: string[]): ValidationResult | null {
  return errors.length
    ? {
        isInvalid: true,
        validationErrors: errors,
        validationDetails: CUSTOM_VALIDITY_STATE,
      }
    : null;
}

function isEqualValidation(a: ValidationResult | null, b: ValidationResult | null): boolean {
  if (a === b) {
    return true;
  }
  return (
    !!a &&
    !!b &&
    a.isInvalid === b.isInvalid &&
    a.validationErrors.length === b.validationErrors.length &&
    a.validationErrors.every((ae, i) => ae === b.validationErrors[i]) &&
    Object.entries(a.validationDetails).every(
      ([k, v]) => b.validationDetails[k as keyof ValidityState] === v,
    )
  );
}

/**
 * Creates form validation state for a field.
 *
 * @example
 * ```tsx
 * const validationState = createFormValidationState({
 *   value: inputValue(),
 *   validate: (value) => {
 *     if (!value) return 'This field is required';
 *     if (value.length < 3) return 'Must be at least 3 characters';
 *     return null;
 *   },
 *   validationBehavior: 'aria',
 * });
 *
 * // Access validation state
 * const isInvalid = () => validationState.displayValidation().isInvalid;
 * const errors = () => validationState.displayValidation().validationErrors;
 * ```
 */
export function createFormValidationState<T>(props: FormValidationProps<T>): FormValidationState {
  const validationBehavior = () => props.validationBehavior ?? "aria";

  // Backward compatibility
  const isInvalidProp = createMemo(
    () => props.isInvalid ?? (props.validationState === "invalid" ? true : undefined),
  );

  // Controlled error from isInvalid prop
  const controlledError = createMemo<ValidationResult | null>(() =>
    isInvalidProp() !== undefined
      ? {
          isInvalid: isInvalidProp()!,
          validationErrors: [],
          validationDetails: CUSTOM_VALIDITY_STATE,
        }
      : null,
  );

  // Client-side validation
  const clientError = createMemo<ValidationResult | null>(() => {
    const validate = props.validate;
    if (!validate || props.value == null) {
      return null;
    }
    const validateErrors = runValidate(validate, props.value);
    return getValidationResult(validateErrors);
  });

  // Built-in validation (skip if valid)
  const builtinValidation = createMemo<ValidationResult | undefined>(() => {
    const builtinValidationProp = props.builtinValidation;
    if (builtinValidationProp?.validationDetails.valid) {
      return undefined;
    }
    return builtinValidationProp;
  });

  // Server errors from context
  const serverErrors = useContext(FormValidationContext);
  const serverErrorMessages = createMemo(() => {
    const name = props.name;
    if (name) {
      return Array.isArray(name)
        ? name.flatMap((n) => asArray(serverErrors[n]))
        : asArray(serverErrors[name]);
    }
    return [];
  });

  // Track server errors clearing
  const [lastServerErrors, setLastServerErrors] = createSignal(serverErrors);
  const [isServerErrorCleared, setServerErrorCleared] = createSignal(false);

  createEffect(() => {
    if (serverErrors !== lastServerErrors()) {
      setLastServerErrors(serverErrors);
      setServerErrorCleared(false);
    }
  });

  const serverError = createMemo<ValidationResult | null>(() =>
    getValidationResult(isServerErrorCleared() ? [] : serverErrorMessages()),
  );

  // Track validation state
  const [currentValidity, setCurrentValidity] = createSignal(DEFAULT_VALIDATION_RESULT);
  const [commitQueued, setCommitQueued] = createSignal(false);

  let nextValidation = DEFAULT_VALIDATION_RESULT;
  let lastError = DEFAULT_VALIDATION_RESULT;

  // Commit validation effect
  createEffect(() => {
    if (!commitQueued()) {
      return;
    }
    setCommitQueued(false);
    const error = clientError() || builtinValidation() || nextValidation;
    if (!isEqualValidation(error, lastError)) {
      lastError = error;
      setCurrentValidity(error);
    }
  });

  // Realtime validation (for native input state)
  const realtimeValidation = createMemo<ValidationResult>(
    () =>
      controlledError() ||
      serverError() ||
      clientError() ||
      builtinValidation() ||
      DEFAULT_VALIDATION_RESULT,
  );

  // Display validation (what the user sees)
  const displayValidation = createMemo<ValidationResult>(() => {
    if (validationBehavior() === "native") {
      return controlledError() || serverError() || currentValidity();
    }
    return (
      controlledError() ||
      serverError() ||
      clientError() ||
      builtinValidation() ||
      currentValidity()
    );
  });

  return {
    realtimeValidation,
    displayValidation,
    updateValidation(value: ValidationResult) {
      // If validationBehavior is 'aria', update in realtime. Otherwise, store until commit.
      if (validationBehavior() === "aria" && !isEqualValidation(currentValidity(), value)) {
        setCurrentValidity(value);
      } else {
        nextValidation = value;
      }
    },
    resetValidation() {
      // Update the currently displayed validation state to valid on form reset.
      const error = DEFAULT_VALIDATION_RESULT;
      if (!isEqualValidation(error, lastError)) {
        lastError = error;
        setCurrentValidity(error);
      }
      // Do not commit validation after the next render for native behavior.
      if (validationBehavior() === "native") {
        setCommitQueued(false);
      }
      setServerErrorCleared(true);
    },
    commitValidation() {
      // Commit validation state so the user sees it on blur/change/submit.
      if (validationBehavior() === "native") {
        const error = clientError() || builtinValidation() || nextValidation;
        if (!isEqualValidation(error, lastError)) {
          lastError = error;
          setCurrentValidity(error);
        }
        setCommitQueued(false);
      }
      setServerErrorCleared(true);
    },
  };
}

/**
 * Merges multiple validation results into one.
 */
export function mergeValidation(...results: ValidationResult[]): ValidationResult {
  const errors = new Set<string>();
  let isInvalid = false;
  const validationDetails: ValidityState = { ...VALID_VALIDITY_STATE };

  for (const v of results) {
    for (const e of v.validationErrors) {
      errors.add(e);
    }
    isInvalid = isInvalid || v.isInvalid;
    for (const key in validationDetails) {
      const k = key as keyof ValidityState;
      (validationDetails as unknown as Record<string, boolean>)[k] =
        (validationDetails as unknown as Record<string, boolean>)[k] ||
        (v.validationDetails as unknown as Record<string, boolean>)[k];
    }
  }

  validationDetails.valid = !isInvalid;
  return {
    isInvalid,
    validationErrors: [...errors],
    validationDetails,
  };
}
