import { Show, For } from "solid-js";
import { Avatar } from "@proyecto-viviana/solid-spectrum";
import { Button as HeadlessButton } from "@proyecto-viviana/solidaria-components";

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

export function ConversationPreview(props: ConversationPreviewProps) {
  return (
    <HeadlessButton
      type="button"
      class={`flex w-full items-center gap-3 rounded-xl p-3 hover:bg-bg-300 transition-colors text-left ${props.class ?? ""}`}
      onPress={() => props.onClick?.()}
    >
      <Avatar src={props.user.avatar} alt={props.user.name} online={props.user.online} size="md" />
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <span class="font-semibold text-primary-100 truncate">{props.user.name}</span>
          <Show when={props.timestamp}>
            <span class="text-xs text-primary-500">{props.timestamp}</span>
          </Show>
        </div>
        <Show when={props.lastMessage}>
          <p class="text-sm text-primary-400 truncate">{props.lastMessage}</p>
        </Show>
      </div>
      <Show when={props.unreadCount && props.unreadCount > 0}>
        <span class="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-on-color">
          {props.unreadCount}
        </span>
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

export function ConversationBubble(props: ConversationBubbleProps) {
  const isUser = () => props.sender === "user";

  return (
    <div class={`flex ${isUser() ? "justify-end" : "justify-start"} ${props.class ?? ""}`}>
      <div
        class={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isUser()
            ? "bg-accent text-bg-400 rounded-br-sm"
            : "bg-bg-300 text-primary-100 rounded-bl-sm"
        }`}
      >
        <p>{props.content}</p>
        <Show when={props.timestamp}>
          <span class={`text-xs ${isUser() ? "text-bg-300" : "text-primary-500"}`}>
            {props.timestamp}
          </span>
        </Show>
      </div>
    </div>
  );
}

export interface ConversationProps {
  messages: Message[];
  class?: string;
}

export function Conversation(props: ConversationProps) {
  return (
    <div class={`flex flex-col gap-2 p-4 ${props.class ?? ""}`}>
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
