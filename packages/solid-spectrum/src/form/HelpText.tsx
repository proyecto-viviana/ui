import { type JSX, splitProps, Show } from "solid-js";
import { style } from "../style" with { type: "macro" };

export interface HelpTextProps {
  /** The description text. */
  description?: string;
  /** The error message text. */
  errorMessage?: string;
  /** Whether the field is in an error state. */
  isInvalid?: boolean;
  /** Whether the help text is disabled (dimmed). */
  isDisabled?: boolean;
  /** Additional CSS class name. */
  class?: string;
}

// Mirrors S2's `helpTextStyles` (Field.tsx): the small UI font with a
// `neutral-subdued` description color that flips to `negative` for errors and
// `disabled` when the field is disabled. Emitted via the `style()` macro so the
// CSS ships in the package bundle for installed consumers.
const helpTextStyles = style<{ isInvalid?: boolean; isDisabled?: boolean }>({
  font: "ui-sm",
  color: {
    default: "neutral-subdued",
    isInvalid: "negative",
    isDisabled: "disabled",
  },
});

/**
 * Displays description or error text below a form field.
 */
export function HelpText(props: HelpTextProps): JSX.Element {
  const [local] = splitProps(props, [
    "description",
    "errorMessage",
    "isInvalid",
    "isDisabled",
    "class",
  ]);

  const showError = () => local.isInvalid && local.errorMessage;

  return (
    <div class={local.class}>
      <Show when={showError()}>
        <p class={helpTextStyles({ isInvalid: true })} role="alert">
          {local.errorMessage}
        </p>
      </Show>
      <Show when={!showError() && local.description}>
        <p class={helpTextStyles({ isDisabled: local.isDisabled })}>{local.description}</p>
      </Show>
    </div>
  );
}
