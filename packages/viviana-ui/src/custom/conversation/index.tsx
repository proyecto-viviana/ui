import { Show, For } from "solid-js";
import { Avatar } from "@proyecto-viviana/solid-spectrum";
import { Button as HeadlessButton } from "@proyecto-viviana/solidaria-components";
// Styled via the S2 style() macro through viviana's own seam (../../style →
// src/style.ts). A conversation preview row, message bubbles, and a thread
// list, on the S2 spacing/radius ramps in Silapse colors.
import { style } from "../../style" with { type: "macro" };

export interface Message {
  id: string;
  content: string;
  sender: "user" | "other";
  timestamp?: string;
}

export interface ConversationPreviewProps {
  user: {
    name: string;
    avatar?: string;
    online?: boolean;
  };
  lastMessage?: string;
  unreadCount?: number;
  timestamp?: string;
  onClick?: () => void;
  class?: string;
}

const preview = style({
  display: "flex",
  alignItems: "center",
  gap: 12,
  width: "full",
  padding: 12,
  borderRadius: "lg",
  textAlign: "start",
  cursor: "pointer",
  backgroundColor: "transparent",
  borderStyle: "none",
});

const previewBody = style({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  flexGrow: 1,
  minWidth: 0,
});

const previewTop = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
});

const previewName = style({
  font: "ui",
  fontWeight: "bold",
  color: "[var(--color-primary-100)]",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const previewTime = style({
  font: "detail-sm",
  color: "[var(--color-text-muted)]",
  flexShrink: 0,
});

const previewMessage = style({
  font: "ui-sm",
  color: "[var(--color-text-secondary)]",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const unread = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  width: 20,
  height: 20,
  borderRadius: "full",
  font: "detail-sm",
  fontWeight: "bold",
  backgroundColor: "[var(--color-accent)]",
  color: "[var(--color-bg-400)]",
});

export function ConversationPreview(props: ConversationPreviewProps) {
  return (
    <HeadlessButton
      type="button"
      class={`${preview} ${props.class ?? ""}`}
      onPress={() => props.onClick?.()}
    >
      <Avatar src={props.user.avatar} alt={props.user.name} online={props.user.online} size="md" />
      <div class={previewBody}>
        <div class={previewTop}>
          <span class={previewName}>{props.user.name}</span>
          <Show when={props.timestamp}>
            <span class={previewTime}>{props.timestamp}</span>
          </Show>
        </div>
        <Show when={props.lastMessage}>
          <p class={previewMessage}>{props.lastMessage}</p>
        </Show>
      </div>
      <Show when={props.unreadCount && props.unreadCount > 0}>
        <span class={unread}>{props.unreadCount}</span>
      </Show>
    </HeadlessButton>
  );
}

export interface ConversationBubbleProps {
  content: string;
  sender: "user" | "other";
  timestamp?: string;
  class?: string;
}

const bubbleRow = style<{ user: boolean }>({
  display: "flex",
  justifyContent: { default: "start", user: "end" },
});

const bubble = style<{ user: boolean }>({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  maxWidth: "[70%]",
  paddingX: 16,
  paddingY: 8,
  borderRadius: "lg",
  backgroundColor: {
    default: "[var(--color-bg-300)]",
    user: "[var(--color-accent)]",
  },
  color: {
    default: "[var(--color-primary-100)]",
    user: "[var(--color-bg-400)]",
  },
});

const bubbleTime = style<{ user: boolean }>({
  font: "detail-sm",
  color: {
    default: "[var(--color-text-muted)]",
    user: "[var(--color-bg-300)]",
  },
});

export function ConversationBubble(props: ConversationBubbleProps) {
  const isUser = () => props.sender === "user";

  return (
    <div class={`${bubbleRow({ user: isUser() })} ${props.class ?? ""}`}>
      <div class={bubble({ user: isUser() })}>
        <p>{props.content}</p>
        <Show when={props.timestamp}>
          <span class={bubbleTime({ user: isUser() })}>{props.timestamp}</span>
        </Show>
      </div>
    </div>
  );
}

export interface ConversationProps {
  messages: Message[];
  class?: string;
}

const thread = style({
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: 16,
});

export function Conversation(props: ConversationProps) {
  return (
    <div class={`${thread} ${props.class ?? ""}`}>
      <For each={props.messages}>
        {(message) => (
          <ConversationBubble
            content={message.content}
            sender={message.sender}
            timestamp={message.timestamp}
          />
        )}
      </For>
    </div>
  );
}
