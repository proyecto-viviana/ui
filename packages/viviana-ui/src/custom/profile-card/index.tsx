import type { JSX } from "solid-js";
import { Show } from "solid-js";
import { Avatar } from "@proyecto-viviana/solid-spectrum";

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

export function ProfileCard(props: ProfileCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div class={`bg-bg-200 rounded-xl p-4 ${props.class ?? ""}`}>
      <div class="flex items-start gap-4">
        <Avatar src={props.avatar} alt={props.username} size="lg" />
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-primary-100 text-lg truncate">{props.username}</h3>
          <Show when={props.bio}>
            <p class="text-primary-300 text-sm mt-1 line-clamp-2">{props.bio}</p>
          </Show>
          <div class="flex gap-4 mt-2 text-sm">
            <Show when={props.followers !== undefined}>
              <span class="text-primary-300">
                <span class="font-semibold text-primary-100">{formatNumber(props.followers!)}</span>{" "}
                seguidores
              </span>
            </Show>
            <Show when={props.following !== undefined}>
              <span class="text-primary-300">
                <span class="font-semibold text-primary-100">{formatNumber(props.following!)}</span>{" "}
                siguiendo
              </span>
            </Show>
          </div>
        </div>
      </div>
      <Show when={props.actions}>
        <div class="mt-4 flex gap-2">
          {typeof props.actions === "function" ? props.actions() : props.actions}
        </div>
      </Show>
    </div>
  );
}
