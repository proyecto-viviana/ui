import type { JSX } from "solid-js";
import { Show, For } from "solid-js";
import { Avatar } from "@proyecto-viviana/solid-spectrum";
import { Button as HeadlessButton } from "@proyecto-viviana/solidaria-components";
// Styled via the S2 style() macro through viviana's own seam (../../style →
// src/style.ts). An event summary card (S2 Card shape: preview + content +
// footer) plus a compact list-item variant, on the S2 ramps in Silapse colors.
import { style } from "../../../src/style" with { type: "macro" };

export interface EventCardProps {
  title: string;
  image?: string;
  date?: string;
  author?: string;
  authorAvatar?: string;
  attendees?: { avatar?: string; name: string }[];
  attendeeCount?: number;
  decorationImage?: string;
  /**
   * Actions to display below the event.
   * Use a function returning JSX for SSR compatibility: `actions={() => <Button>...</Button>}`
   */
  actions?: JSX.Element | (() => JSX.Element);
  class?: string;
}

const card = style({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  borderRadius: "xl",
  backgroundColor: "[var(--color-bg-200)]",
  boxShadow: "elevated",
});

const decoration = style({
  position: "absolute",
  top: 8,
  insetEnd: 8,
  width: 32,
  height: 32,
  objectFit: "contain",
});

const preview = style({
  width: "full",
  aspectRatio: "16/9",
  objectFit: "cover",
});

const body = style({
  display: "flex",
  flexDirection: "column",
  gap: 12,
  padding: 16,
});

const title = style({
  font: "heading",
  // WCAG AA fix: the title sits on the `--color-bg-200` card. `--color-accent`
  // (#df5c9a) is a fixed pink in BOTH themes, so it does not flip against a card
  // that is dark-grey in dark mode and light-blue in light mode — it read 4.48:1
  // dark / 1.89:1 light. `font: heading` renders 22px / weight 800, which is WCAG
  // large text via the BOLD path (≥18.66px && ≥700), NOT because it is ≥24px — so
  // the 3:1 large-text floor applies. `--color-accent-500` is the smallest ramp
  // step that flips with the theme (bright pink dark / deep magenta light) AND
  // clears 3:1 both ways (3.87:1 dark / 4.91:1 light), keeping the brand accent.
  color: "[var(--color-accent-500)]",
});

const meta = style({
  display: "flex",
  alignItems: "center",
  gap: 16,
  font: "ui-sm",
  // WCAG AA fix: the meta text is small (`ui-sm`), so the 4.5:1 normal-text
  // floor applies. `--color-text-secondary` read only 3.84:1 on the light
  // `--color-bg-200` card; `--color-text` flips and clears 4.5:1 both ways
  // (15.33:1 dark / 7.53:1 light). Secondary de-emphasis rides on the smaller
  // `ui-sm` size rather than a sub-AA color.
  color: "[var(--color-text)]",
});

const metaItem = style({
  display: "flex",
  alignItems: "center",
  gap: 4,
});

const metaIcon = style({
  // WCAG AA fix: the meta glyphs (@ / ⏱) are small (inherit `ui-sm`), so the
  // 4.5:1 floor applies. `--color-accent` fails on the card (4.48:1 dark /
  // 1.89:1 light) and no pink ramp step clears 4.5:1 on both the dark-grey and
  // light-blue card, so the glyphs take the flipping `--color-text` like the
  // meta text they prefix.
  color: "[var(--color-text)]",
});

const attendeesRow = style({
  display: "flex",
  alignItems: "center",
  gap: 8,
});

const avatars = style({
  display: "flex",
  alignItems: "center",
  gap: 4,
});

const more = style({
  font: "ui-sm",
  // WCAG AA fix: the "+N más" overflow count is small text on the same
  // `--color-bg-200` card as the meta, so it shares the same 3.84:1-light
  // failure and the same `--color-text` fix.
  color: "[var(--color-text)]",
});

const actionRow = style({
  display: "flex",
  gap: 8,
});

export function EventCard(props: EventCardProps) {
  const displayedAttendees = () => props.attendees?.slice(0, 3) ?? [];
  const remainingCount = () => {
    const total = props.attendeeCount ?? props.attendees?.length ?? 0;
    const displayed = displayedAttendees().length;
    return total - displayed;
  };

  return (
    <div class={`${card} ${props.class ?? ""}`}>
      <Show when={props.decorationImage}>
        <img class={decoration} src={props.decorationImage} alt="" />
      </Show>

      <Show when={props.image}>
        <img class={preview} src={props.image} alt={props.title} />
      </Show>

      <div class={body}>
        <h3 class={title}>{props.title}</h3>

        <Show when={props.date || props.author}>
          <div class={meta}>
            <Show when={props.author}>
              <div class={metaItem}>
                <span class={metaIcon}>@</span>
                <span>{props.author}</span>
              </div>
            </Show>
            <Show when={props.date}>
              <div class={metaItem}>
                <span class={metaIcon}>⏱</span>
                <span>{props.date}</span>
              </div>
            </Show>
          </div>
        </Show>

        <Show when={displayedAttendees().length > 0}>
          <div class={attendeesRow}>
            <div class={avatars}>
              <For each={displayedAttendees()}>
                {(attendee) => <Avatar src={attendee.avatar} alt={attendee.name} size="sm" />}
              </For>
            </div>
            <Show when={remainingCount() > 0}>
              <span class={more}>+{remainingCount()} más</span>
            </Show>
          </div>
        </Show>

        <Show when={props.actions}>
          <div class={actionRow}>
            {typeof props.actions === "function" ? props.actions() : props.actions}
          </div>
        </Show>
      </div>
    </div>
  );
}

export interface EventListItemProps {
  title: string;
  image?: string;
  subtitle?: string;
  onClick?: () => void;
  class?: string;
}

const listItem = style({
  display: "flex",
  alignItems: "center",
  gap: 12,
  width: "full",
  padding: 8,
  borderRadius: "lg",
  textAlign: "start",
  cursor: "pointer",
  backgroundColor: "transparent",
  borderStyle: "none",
});

const thumb = style({
  width: 48,
  height: 48,
  flexShrink: 0,
  borderRadius: "default",
  objectFit: "cover",
});

const listBody = style({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  minWidth: 0,
});

const listTitle = style({
  font: "ui",
  fontWeight: "medium",
  color: "[var(--color-primary-100)]",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const listSubtitle = style({
  font: "ui-sm",
  color: "[var(--color-text-secondary)]",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export function EventListItem(props: EventListItemProps) {
  return (
    <HeadlessButton class={`${listItem} ${props.class ?? ""}`} onPress={() => props.onClick?.()}>
      <Show when={props.image}>
        <img class={thumb} src={props.image} alt={props.title} />
      </Show>
      <div class={listBody}>
        <h4 class={listTitle}>{props.title}</h4>
        <Show when={props.subtitle}>
          <p class={listSubtitle}>{props.subtitle}</p>
        </Show>
      </div>
    </HeadlessButton>
  );
}
