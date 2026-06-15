import type { JSX } from "solid-js";
import { Show, For } from "solid-js";
import { Avatar } from "@proyecto-viviana/solid-spectrum";
import { Button as HeadlessButton } from "@proyecto-viviana/solidaria-components";
// Styled via the S2 style() macro through viviana's own seam (../../style →
// src/style.ts). An event summary card (S2 Card shape: preview + content +
// footer) plus a compact list-item variant, on the S2 ramps in Silapse colors.
import { style } from "../../style" with { type: "macro" };

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
  color: "[var(--color-accent)]",
});

const meta = style({
  display: "flex",
  alignItems: "center",
  gap: 16,
  font: "ui-sm",
  color: "[var(--color-text-secondary)]",
});

const metaItem = style({
  display: "flex",
  alignItems: "center",
  gap: 4,
});

const metaIcon = style({
  color: "[var(--color-accent)]",
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
  color: "[var(--color-text-secondary)]",
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
