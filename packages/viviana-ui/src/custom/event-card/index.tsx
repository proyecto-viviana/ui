import type { JSX } from "solid-js";
import { Show, For } from "solid-js";
import { Avatar } from "@proyecto-viviana/solid-spectrum";
import { Button as HeadlessButton } from "@proyecto-viviana/solidaria-components";

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

export function EventCard(props: EventCardProps) {
  const displayedAttendees = () => props.attendees?.slice(0, 3) ?? [];
  const remainingCount = () => {
    const total = props.attendeeCount ?? props.attendees?.length ?? 0;
    const displayed = displayedAttendees().length;
    return total - displayed;
  };

  return (
    <div class={`relative bg-bg-200 rounded-3xl overflow-hidden ${props.class ?? ""}`}>
      <Show when={props.decorationImage}>
        <div class="absolute -top-2 -right-2 z-10 flex flex-col gap-1">
          <img src={props.decorationImage} alt="" class="w-8 h-8 object-contain" />
          <img src={props.decorationImage} alt="" class="w-6 h-6 object-contain ml-2" />
          <img src={props.decorationImage} alt="" class="w-5 h-5 object-contain" />
        </div>
      </Show>

      <Show when={props.image}>
        <div class="relative h-32 w-full">
          <img src={props.image} alt={props.title} class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-bg-200 via-transparent to-transparent" />
        </div>
      </Show>

      <div class="p-4 pt-2">
        <h3 class="font-bold text-xl leading-tight bg-gradient-to-r from-accent to-accent-300 bg-clip-text text-transparent">
          {props.title}
        </h3>

        <Show when={props.date || props.author}>
          <div class="flex items-center gap-4 mt-3 text-sm text-primary-300">
            <Show when={props.author}>
              <div class="flex items-center gap-1.5">
                <span class="text-accent">@</span>
                <span>{props.author}</span>
              </div>
            </Show>
            <Show when={props.date}>
              <div class="flex items-center gap-1.5">
                <span class="text-accent">⏱</span>
                <span>{props.date}</span>
              </div>
            </Show>
          </div>
        </Show>

        <Show when={displayedAttendees().length > 0}>
          <div class="flex items-center mt-3">
            <div class="flex -space-x-2">
              <For each={displayedAttendees()}>
                {(attendee) => <Avatar src={attendee.avatar} alt={attendee.name} size="sm" />}
              </For>
            </div>
            <Show when={remainingCount() > 0}>
              <span class="ml-2 text-sm text-primary-300">+{remainingCount()} más</span>
            </Show>
          </div>
        </Show>

        <Show when={props.actions}>
          <div class="mt-4 flex gap-2">
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

export function EventListItem(props: EventListItemProps) {
  return (
    <HeadlessButton
      class={`flex items-center gap-3 w-full p-2 rounded-lg hover:bg-bg-300 transition-colors text-left ${props.class ?? ""}`}
      onPress={() => props.onClick?.()}
    >
      <Show when={props.image}>
        <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          <img src={props.image} alt={props.title} class="w-full h-full object-cover" />
        </div>
      </Show>
      <div class="flex-1 min-w-0">
        <h4 class="font-medium text-primary-100 truncate">{props.title}</h4>
        <Show when={props.subtitle}>
          <p class="text-sm text-primary-300 truncate">{props.subtitle}</p>
        </Show>
      </div>
    </HeadlessButton>
  );
}
