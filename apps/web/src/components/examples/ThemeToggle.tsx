/* The one control on the examples that reaches outside the library.
 *
 * `data-color-scheme` has a single owner on this site — `@/utils/theme` — and
 * the examples must flip the same switch as the rest of the app rather than
 * grow a second theme mechanism. That import is the examples' narrowest
 * exception, so it lives here, in one small file that both the app chrome
 * (`AppShell`) and the landing nav use, instead of being repeated per screen.
 *
 * The button itself is the library's: a quiet `ActionButton` carrying
 * `ContrastIcon`, which is the same affordance the site header renders. */
import type { JSX } from "solid-js";
import { ActionButton, ContrastIcon } from "@proyecto-viviana/ui";
import { useTheme } from "@/utils/theme";

export function ThemeToggle(): JSX.Element {
  const { toggleTheme } = useTheme();

  return (
    <ActionButton isQuiet aria-label="Toggle color scheme" onPress={toggleTheme}>
      <ContrastIcon />
    </ActionButton>
  );
}
