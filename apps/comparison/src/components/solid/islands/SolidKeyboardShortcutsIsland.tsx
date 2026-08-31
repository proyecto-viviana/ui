/** @jsxImportSource solid-js */
import { createSignal, onMount } from "solid-js";
import { createKeyboard } from "@proyecto-viviana/solidaria/interactions";

export default function SolidKeyboardShortcutsIsland() {
  const [hydrated, setHydrated] = createSignal(false);
  const [saveCount, setSaveCount] = createSignal(0);
  const [submitCount, setSubmitCount] = createSignal(0);
  const [bubbleCount, setBubbleCount] = createSignal(0);
  const [repeatIgnoredCount, setRepeatIgnoredCount] = createSignal(0);
  const [repeatAllowedCount, setRepeatAllowedCount] = createSignal(0);
  const [compositionIgnoredCount, setCompositionIgnoredCount] = createSignal(0);
  const [compositionAllowedCount, setCompositionAllowedCount] = createSignal(0);
  const [disabledCount, setDisabledCount] = createSignal(0);

  const formKeyboard = createKeyboard({
    shortcuts: {
      "Mod+s": () => {
        setSaveCount((count) => count + 1);
      },
      Enter: () => false,
    },
  });
  const repeatIgnoredKeyboard = createKeyboard({
    shortcuts: {
      a: () => {
        setRepeatIgnoredCount((count) => count + 1);
      },
    },
  });
  const repeatAllowedKeyboard = createKeyboard({
    shortcuts: {
      a: () => {
        setRepeatAllowedCount((count) => count + 1);
      },
    },
    allowRepeats: true,
  });
  const compositionIgnoredKeyboard = createKeyboard({
    shortcuts: {
      a: () => {
        setCompositionIgnoredCount((count) => count + 1);
      },
    },
  });
  const compositionAllowedKeyboard = createKeyboard({
    shortcuts: {
      a: () => {
        setCompositionAllowedCount((count) => count + 1);
      },
    },
    allowComposing: true,
  });
  const disabledKeyboard = createKeyboard({
    isDisabled: true,
    shortcuts: {
      a: () => {
        setDisabledCount((count) => count + 1);
      },
    },
  });

  onMount(() => setHydrated(true));

  return (
    <main
      data-comparison-hydrated={hydrated() ? "true" : undefined}
      data-shortcut-bubble-count={String(bubbleCount())}
      onKeyDown={() => setBubbleCount((count) => count + 1)}
    >
      <form
        data-shortcut-save-count={String(saveCount())}
        data-shortcut-submit-count={String(submitCount())}
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitCount((count) => count + 1);
        }}
      >
        <label for="shortcut-form-input">Shortcut form input</label>
        <input id="shortcut-form-input" {...formKeyboard.keyboardProps} />
        <button type="submit">Submit</button>
      </form>

      <button
        type="button"
        data-shortcut-case="repeat-ignored"
        data-shortcut-count={String(repeatIgnoredCount())}
        {...repeatIgnoredKeyboard.keyboardProps}
      >
        Repeat ignored
      </button>
      <button
        type="button"
        data-shortcut-case="repeat-allowed"
        data-shortcut-count={String(repeatAllowedCount())}
        {...repeatAllowedKeyboard.keyboardProps}
      >
        Repeat allowed
      </button>
      <button
        type="button"
        data-shortcut-case="composition-ignored"
        data-shortcut-count={String(compositionIgnoredCount())}
        {...compositionIgnoredKeyboard.keyboardProps}
      >
        Composition ignored
      </button>
      <button
        type="button"
        data-shortcut-case="composition-allowed"
        data-shortcut-count={String(compositionAllowedCount())}
        {...compositionAllowedKeyboard.keyboardProps}
      >
        Composition allowed
      </button>
      <button
        type="button"
        data-shortcut-case="disabled"
        data-shortcut-count={String(disabledCount())}
        {...disabledKeyboard.keyboardProps}
      >
        Disabled hook
      </button>
    </main>
  );
}
