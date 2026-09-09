/* The chrome every /examples app screen shares: the command bar across the
 * top, the icon rail down the left, and the screen's own content in the main
 * region. Composed from library components only — the `ex-*` classes carry box
 * metrics (grid placement, fixed rail width, padding) and nothing else.
 *
 * Landing is the one screen that does NOT use this: it has no app chrome.
 *
 * The rail's five slots are real navigation between the example routes, so the
 * four inactive ones are `LinkButton`s. The active slot is not a link — there
 * is nowhere to go — so it is the library's shipped selected affordance, a
 * `ToggleButton` held selected, which is also what gives it the register's
 * active surface without any app CSS. */
import { For, type JSX } from "solid-js";
import { Link } from "@tanstack/solid-router";
import {
  ActionButton,
  Avatar,
  Button,
  Card,
  Flex,
  Grid,
  LinkButton,
  Text,
  ContrastIcon,
  PixelHomeIcon,
  PixelMapIcon,
  PixelPlayIcon,
  PixelUserIcon,
  PixelZapIcon,
  ToggleButton,
  Well,
  typeRoles,
} from "@proyecto-viviana/ui";
import { useTheme } from "@/utils/theme";

/** The rail, in the handoff's order: home, explore, lesson, live, profile. */
const RAIL = [
  { slug: "home", label: "Home", icon: PixelHomeIcon },
  { slug: "explore", label: "Explore", icon: PixelMapIcon },
  { slug: "lesson", label: "Lesson", icon: PixelPlayIcon },
  { slug: "live", label: "Live", icon: PixelZapIcon },
  { slug: "profile", label: "Profile", icon: PixelUserIcon },
] as const;

export interface AppShellProps {
  /** The command bar's working directory, e.g. `~/rendering/04`. */
  readonly cwd: string;
  /** The command bar's command, e.g. `lesson --theater`. */
  readonly cmd: string;
  /** Screen-specific controls between the counters and the theme toggle. */
  readonly right?: JSX.Element;
  /** The rail slot to mark as the current screen. */
  readonly active: string;
  /**
   * Whether this screen's `+ Create` carries the filled fuchsia ask. Exactly
   * one filled fuchsia control is allowed per screen, so a screen whose own
   * content spends it (home's review CTA, live's LIVE badge) passes `false`
   * and the command-bar ask falls back to the outline fill.
   */
  readonly askFilled: boolean;
}

export function AppShell(props: AppShellProps & { readonly children: JSX.Element }): JSX.Element {
  const { toggleTheme } = useTheme();

  return (
    <Grid class="ex-shell" rows="40px minmax(0,1fr)" columns="52px minmax(0,1fr)" gap="12px">
      <Well class="ex-cmdbar" tone="deep" size="S">
        <Flex alignItems="center" gap="14px">
          <Text styles={typeRoles.terminal}>{props.cwd}</Text>
          <Text styles={typeRoles.terminal}>$ {props.cmd}</Text>
          <div class="ex-cmdbar-spacer" />
          <Link to={"/examples/home" as "/examples"} class="ex-cmdbar-count">
            4 due
          </Link>
          <Link to={"/examples/live" as "/examples"} class="ex-cmdbar-count">
            ● 1 live
          </Link>
          {props.right}
          <Button variant="create" fillStyle={props.askFilled ? "fill" : "outline"} size="S">
            + Create
          </Button>
          <ActionButton isQuiet aria-label="Toggle color scheme" onPress={toggleTheme}>
            <ContrastIcon />
          </ActionButton>
        </Flex>
      </Well>

      <Card id="examples-rail" class="ex-rail" variant="secondary" size="S">
        <Flex direction="column" alignItems="center" gap="8px">
          <For each={RAIL}>
            {(slot) => (
              <>
                {slot.slug === props.active ? (
                  <ToggleButton isSelected isQuiet aria-label={`${slot.label} (current screen)`}>
                    <slot.icon />
                  </ToggleButton>
                ) : (
                  /* LinkButton has no `isQuiet` (only ActionButton and Link do),
                     so the rail reads as outlined slots against the filled
                     selected one rather than five quiet glyphs. */
                  <LinkButton
                    href={`/examples/${slot.slug}`}
                    aria-label={slot.label}
                    variant="secondary"
                    fillStyle="outline"
                  >
                    <slot.icon />
                  </LinkButton>
                )}
              </>
            )}
          </For>
          <div class="ex-rail-spacer" />
          <Avatar src="/examples/avatar-nova.png" alt="Nova" size={30} />
        </Flex>
      </Card>

      <div class="ex-main">{props.children}</div>
    </Grid>
  );
}
