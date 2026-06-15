import type { JSX } from "solid-js";
import { Show } from "solid-js";
import { Avatar } from "@proyecto-viviana/solid-spectrum";

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

const eventMessages: Record<TimelineEventType, (left: string, right: string) => JSX.Element> = {
  follow: (left, right) => (
    <>
      <span class="font-semibold text-accent-200">{left}</span>
      {" ha empezado a seguir a "}
      <span class="font-semibold text-accent-200">{right}</span>
    </>
  ),
  like: (left, right) => (
    <>
      <span class="font-semibold text-accent-200">{left}</span>
      {" le ha dado like a "}
      <span class="font-semibold text-accent-200">{right}</span>
    </>
  ),
  comment: (left, right) => (
    <>
      <span class="font-semibold text-accent-200">{left}</span>
      {" ha comentado en "}
      <span class="font-semibold text-accent-200">{right}</span>
    </>
  ),
  event: (left, right) => (
    <>
      <span class="font-semibold text-accent-200">{left}</span>
      {" asistirá al evento de "}
      <span class="font-semibold text-accent-200">{right}</span>
    </>
  ),
  custom: () => null,
};

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
    <div
      class={`inline-flex w-auto flex-col gap-5 rounded-2xl border border-primary-700 bg-bg-200 p-5 hover:bg-bg-300 transition-colors ${props.class ?? ""}`}
    >
      <div class="flex items-center justify-around gap-3">
        <Show when={props.leftUser}>
          <Avatar src={props.leftUser!.avatar} alt={props.leftUser!.name} />
        </Show>
        <Show when={props.icon}>{renderIcon()}</Show>
        <Show when={props.rightUser}>
          <Avatar src={props.rightUser!.avatar} alt={props.rightUser!.name} />
        </Show>
      </div>
      <div class="flex items-center justify-center gap-3 text-center">
        <span class="font-light text-primary-300">
          <Show when={props.message} fallback={eventMessages[type()](leftName(), rightName())}>
            {renderMessage()}
          </Show>
        </span>
      </div>
    </div>
  );
}
