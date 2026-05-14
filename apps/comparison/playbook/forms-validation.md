# Forms And Validation

Form parity covers native submission, hidden inputs, reset behavior, required
state, validation state, and field help text.

## Checks

- `name`, `form`, `isRequired`, `isInvalid`, `validationState`, descriptions,
  and error messages are forwarded to the correct layer.
- Native form semantics are used where upstream uses native controls; ARIA-only
  replacements require an explicit upstream match or documented deviation.
- Hidden inputs exist only when upstream submits a non-native value.
- Hidden input value format matches upstream for keys, dates, ranges, colors,
  numbers, and custom text values.
- `formValue`-style modes are honored when upstream supports them.
- Native form reset restores default values.
- Constraint validation and builtin validation contribute to invalid state.
- User submit, reset, invalid, change, and blur handlers fire in upstream order.
- Error text uses `role="alert"` or upstream equivalent where applicable.
- Description and error IDs are chained into `aria-describedby` correctly.

## Tests

Submit a real form and inspect `FormData`. Test reset, disabled fields,
required fields, invalid fields, and custom value modes.
