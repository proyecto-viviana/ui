import type { JSX } from "solid-js";
import { Show } from "solid-js";
import { Avatar } from "@proyecto-viviana/solid-spectrum";
// Styled via the S2 style() macro through viviana's own seam (../../style →
// src/style.ts). A social timeline event card (two avatars + icon + message)
// on the S2 spacing/radius ramps in Silapse colors.
import { style } from "../../style" with { type: "macro" };

export type TimelineEventType = "follow" | "like" | "comment" | "event" | "custom";

export interface TimelineItemProps {
  type?: TimelineEventType;
  /**
   * Icon to display between the two avatars.
   * Use a function returning JSX for SSR compatibility: `icon={() => <MyIcon />}`
   * Or pass a simple string for text-based icons: `icon="👋"`
   */
  icon?: string | (() => JSX.Element);
  leftUser?: {
    name: string;
    avatar?: string;
  };
  rightUser?: {
    name: string;
    avatar?: string;
  };
  /**
   * Custom message content.
   * Use a function returning JSX for SSR compatibility: `message={() => <span>...</span>}`
   * Or pass a simple string.
   */
  message?: string | (() => JSX.Element);
  class?: string;
}

const nameEmph = style({
  fontWeight: "bold",
  color: "[var(--color-accent)]",
});

const eventMessages: Record<TimelineEventType, (left: string, right: string) => JSX.Element> = {
  follow: (left, right) => (
    <>
      <span class={nameEmph}>{left}</span>
      {" ha empezado a seguir a "}
      <span class={nameEmph}>{right}</span>
    </>
  ),
  like: (left, right) => (
    <>
      <span class={nameEmph}>{left}</span>
      {" le ha dado like a "}
      <span class={nameEmph}>{right}</span>
    </>
  ),
  comment: (left, right) => (
    <>
      <span class={nameEmph}>{left}</span>
      {" ha comentado en "}
      <span class={nameEmph}>{right}</span>
    </>
  ),
  event: (left, right) => (
    <>
      <span class={nameEmph}>{left}</span>
      {" asistirá al evento de "}
      <span class={nameEmph}>{right}</span>
    </>
  ),
  custom: () => null,
};

const card = style({
  display: "inline-flex",
  flexDirection: "column",
  gap: 20,
  padding: 20,
  borderRadius: "xl",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "[var(--color-primary-700)]",
  backgroundColor: "[var(--color-bg-200)]",
});

const avatarsRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
});

const messageRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  font: "ui",
  color: "[var(--color-text-secondary)]",
});

export function TimelineItem(props: TimelineItemProps) {
  const type = () => props.type ?? "follow";
  const leftName = () => props.leftUser?.name ?? "";
  const rightName = () => props.rightUser?.name ?? "";

  const renderIcon = () => {
    const icon = props.icon;
    if (!icon) return null;
    if (typeof icon === "string") return icon;
    return icon();
  };

  const renderMessage = () => {
    const message = props.message;
    if (!message) return null;
    if (typeof message === "string") return message;
    return message();
  };

  return (
    <div class={`${card} ${props.class ?? ""}`}>
      <div class={avatarsRow}>
        <Show when={props.leftUser}>
          <Avatar src={props.leftUser!.avatar} alt={props.leftUser!.name} />
        </Show>
        <Show when={props.icon}>{renderIcon()}</Show>
        <Show when={props.rightUser}>
          <Avatar src={props.rightUser!.avatar} alt={props.rightUser!.name} />
        </Show>
      </div>
      <div class={messageRow}>
        <span>
          <Show when={props.message} fallback={eventMessages[type()](leftName(), rightName())}>
            {renderMessage()}
          </Show>
        </span>
      </div>
    </div>
  );
}
