import { Errored } from "solid-js";
import type { Accessor } from "solid-js";
import type { JSX } from "@solidjs/web";
import { style } from "../style" with { type: "macro" };

export interface StoryErrorBoundaryProps {
  /** The content to render. */
  children?: JSX.Element;
  /** Custom fallback component. */
  fallback?: (err: Error, reset: () => void) => JSX.Element;
}

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}

// Story/dev error boundary. The invented `red-*` utility palette is replaced with
// S2 negative tokens routed through the `style()` macro: a `-subtle` fill inside a
// `negative-400` outline, negative-toned heading and message text, and a solid
// negative retry button that darkens on `:hover`.
const errorContainer = style({
  borderRadius: "lg",
  borderWidth: 2,
  borderStyle: "solid",
  borderColor: "negative-400",
  backgroundColor: "negative-subtle",
  padding: 16,
});

const errorHeading = style({
  color: "negative",
  fontWeight: "bold",
  marginBottom: 8,
});

const errorMessage = style({
  fontSize: "ui-sm",
  color: "negative",
  whiteSpace: "pre-wrap",
  marginBottom: 12,
});

const errorRetry = style({
  paddingX: 12,
  paddingY: 4,
  fontSize: "ui-sm",
  borderRadius: "default",
  borderStyle: "none",
  color: "white",
  backgroundColor: { default: "negative-400", ":hover": "negative-500" },
  cursor: "pointer",
  transition: "default",
});

/**
 * A styled error boundary that catches and displays errors in stories.
 */
export function StoryErrorBoundary(props: StoryErrorBoundaryProps): JSX.Element {
  return (
    <Errored
      fallback={(err: Accessor<unknown>, reset: () => void) => {
        const error = toError(err());
        return props.fallback ? (
          props.fallback(error, reset)
        ) : (
          <div class={errorContainer}>
            <h3 class={errorHeading}>Error</h3>
            <pre class={errorMessage}>{error.message}</pre>
            <button class={errorRetry} onClick={reset}>
              Retry
            </button>
          </div>
        );
      }}
    >
      {props.children}
    </Errored>
  );
}
