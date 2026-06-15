import type { JSX } from "solid-js";
import { Show } from "solid-js";
import { Avatar } from "@proyecto-viviana/solid-spectrum";
// Styled via the S2 style() macro through viviana's own seam (../../style →
// src/style.ts). Mirrors S2's UserCard shape (avatar + title/description +
// footer actions) on the S2 spacing/radius/elevation ramps, in Silapse colors.
import { style } from "../../style" with { type: "macro" };

export interface ProfileCardProps {
  username: string;
  avatar?: string;
  bio?: string;
  followers?: number;
  following?: number;
  /**
   * Actions to display below the profile.
   * Use a function returning JSX for SSR compatibility: `actions={() => <Button>...</Button>}`
   */
  actions?: JSX.Element | (() => JSX.Element);
  class?: string;
}

const card = style({
  display: "flex",
  flexDirection: "column",
  gap: 16,
  padding: 16,
  borderRadius: "lg",
  backgroundColor: "[var(--color-bg-200)]",
  boxShadow: "elevated",
});

const head = style({
  display: "flex",
  alignItems: "start",
  gap: 16,
});

const info = style({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  flexGrow: 1,
  minWidth: 0,
});

const name = style({
  font: "heading-sm",
  color: "[var(--color-primary-100)]",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const bio = style({
  font: "ui-sm",
  color: "[var(--color-text-secondary)]",
});

const stats = style({
  display: "flex",
  gap: 16,
  font: "ui-sm",
  color: "[var(--color-text-secondary)]",
});

const statValue = style({
  fontWeight: "bold",
  color: "[var(--color-primary-100)]",
});

const actionRow = style({
  display: "flex",
  gap: 8,
});

export function ProfileCard(props: ProfileCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div class={`${card} ${props.class ?? ""}`}>
      <div class={head}>
        <Avatar src={props.avatar} alt={props.username} size="lg" />
        <div class={info}>
          <h3 class={name}>{props.username}</h3>
          <Show when={props.bio}>
            <p class={bio}>{props.bio}</p>
          </Show>
          <div class={stats}>
            <Show when={props.followers !== undefined}>
              <span>
                <span class={statValue}>{formatNumber(props.followers!)}</span> seguidores
              </span>
            </Show>
            <Show when={props.following !== undefined}>
              <span>
                <span class={statValue}>{formatNumber(props.following!)}</span> siguiendo
              </span>
            </Show>
          </div>
        </div>
      </div>
      <Show when={props.actions}>
        <div class={actionRow}>
          {typeof props.actions === "function" ? props.actions() : props.actions}
        </div>
      </Show>
    </div>
  );
}
