import { Show, For } from "solid-js";
import { Chip } from "../chip";

export interface CalendarCardProps {
  title: string;
  image?: string;
  tags?: string[];
  followers?: { name: string }[];
  followerCount?: number;
  class?: string;
}

export function CalendarCard(props: CalendarCardProps) {
  const displayedFollowers = () => props.followers?.slice(0, 2) ?? [];
  const remainingCount = () => {
    const total = props.followerCount ?? props.followers?.length ?? 0;
    const displayed = displayedFollowers().length;
    return total - displayed;
  };

  return (
    <div
      class={`flex h-[100px] w-full max-w-[500px] items-center rounded-xl border border-primary-600 border-b-accent-500 bg-bg-300 p-2 ${props.class ?? ""}`}
    >
      <Show when={props.image}>
        <div class="relative h-[80px] w-[80px] flex-shrink-0 overflow-hidden rounded-xl border-2 border-accent-200">
          <img src={props.image} alt={props.title} class="h-full w-full object-cover" />
        </div>
      </Show>
      <div class="relative h-full flex-1 flex-col pl-3">
        <Show when={props.tags && props.tags.length > 0}>
          <div class="absolute bottom-[-20px] h-[30px] w-full">
            <div class="flex h-full w-full flex-1 justify-end gap-1">
              <For each={props.tags}>{(tag) => <Chip text={tag} variant="primary" />}</For>
            </div>
          </div>
        </Show>
        <div class="flex h-full flex-col items-end justify-center pb-3 pr-5 pt-2">
          <div class="flex flex-1">
            <span class="text-lg font-semibold text-on-color drop-shadow-sm">{props.title}</span>
          </div>
          <Show when={displayedFollowers().length > 0}>
            <div class="flex flex-1">
              <span class="text-base font-normal text-primary-500">
                seguida por{" "}
                <For each={displayedFollowers()}>
                  {(follower, index) => (
                    <>
                      <span class="font-semibold text-accent-200">{follower.name}</span>
                      {index() < displayedFollowers().length - 1 && ", "}
                    </>
                  )}
                </For>
                <Show when={remainingCount() > 0}>
                  {" "}
                  y <span class="font-semibold text-accent-200">{remainingCount()} más</span>
                </Show>
              </span>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}
