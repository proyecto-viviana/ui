import { Show, For } from "solid-js";
import { Chip } from "../chip";
// Styled via the S2 style() macro through viviana's own seam (../../style →
// src/style.ts). A horizontal "followed calendar" card: square thumbnail +
// title + followers line + tag chips, on the S2 ramps in Silapse colors.
import { style } from "../../style" with { type: "macro" };

export interface CalendarCardProps {
  title: string;
  image?: string;
  tags?: string[];
  followers?: { name: string }[];
  followerCount?: number;
  class?: string;
}

const card = style({
  display: "flex",
  alignItems: "center",
  gap: 12,
  width: "full",
  maxWidth: 500,
  padding: 12,
  borderRadius: "xl",
  borderWidth: 2,
  borderStyle: "solid",
  borderColor: "[var(--color-primary-600)]",
  backgroundColor: "[var(--color-bg-300)]",
  boxShadow: "elevated",
});

const thumb = style({
  width: 80,
  height: 80,
  flexShrink: 0,
  objectFit: "cover",
  borderRadius: "lg",
  borderWidth: 2,
  borderStyle: "solid",
  borderColor: "[var(--color-accent)]",
});

const body = style({
  display: "flex",
  flexDirection: "column",
  gap: 8,
  flexGrow: 1,
  minWidth: 0,
});

const title = style({
  font: "heading-sm",
  color: "[var(--color-primary-100)]",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const followers = style({
  font: "ui-sm",
  color: "[var(--color-text-secondary)]",
});

const followerName = style({
  fontWeight: "bold",
  color: "[var(--color-accent)]",
});

const tags = style({
  display: "flex",
  flexWrap: "wrap",
  gap: 4,
});

export function CalendarCard(props: CalendarCardProps) {
  const displayedFollowers = () => props.followers?.slice(0, 2) ?? [];
  const remainingCount = () => {
    const total = props.followerCount ?? props.followers?.length ?? 0;
    const displayed = displayedFollowers().length;
    return total - displayed;
  };

  return (
    <div class={`${card} ${props.class ?? ""}`}>
      <Show when={props.image}>
        <img class={thumb} src={props.image} alt={props.title} />
      </Show>
      <div class={body}>
        <span class={title}>{props.title}</span>
        <Show when={displayedFollowers().length > 0}>
          <span class={followers}>
            seguida por{" "}
            <For each={displayedFollowers()}>
              {(follower, index) => (
                <>
                  <span class={followerName}>{follower.name}</span>
                  {index() < displayedFollowers().length - 1 && ", "}
                </>
              )}
            </For>
            <Show when={remainingCount() > 0}>
              {" "}
              y <span class={followerName}>{remainingCount()} más</span>
            </Show>
          </span>
        </Show>
        <Show when={props.tags && props.tags.length > 0}>
          <div class={tags}>
            <For each={props.tags}>{(tag) => <Chip text={tag} variant="primary" />}</For>
          </div>
        </Show>
      </div>
    </div>
  );
}
