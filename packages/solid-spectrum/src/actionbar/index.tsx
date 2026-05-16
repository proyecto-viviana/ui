import { type JSX, splitProps } from "solid-js";
import {
  ActionBar as HeadlessActionBar,
  ActionBarContainer as HeadlessActionBarContainer,
  ActionBarSelectionCount as HeadlessSelectionCount,
  ActionBarClearButton as HeadlessClearButton,
  type ActionBarRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { Key } from "@proyecto-viviana/solid-stately";

export interface ActionBarProps {
  /** The number of selected items. ActionBar is hidden when 0. */
  selectedItemCount: number | "all";
  /** Whether the ActionBar should be displayed with an emphasized style. */
  isEmphasized?: boolean;
  /** Callback when the clear button is pressed. */
  onClearSelection: () => void;
  /** Callback when an action is triggered. */
  onAction?: (key: Key) => void;
  /** The action buttons to display. */
  children?: JSX.Element;
  /** Additional CSS class name. */
  class?: string;
  /** Accessible label for the action bar. @default 'Actions' */
  "aria-label"?: string;
  /** Identifies the element (or elements) that labels the action bar. */
  "aria-labelledby"?: string;
  /** Optional keydown handler for the action bar root. */
  onKeyDown?: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent>;
}

export interface ActionBarContainerProps {
  children?: JSX.Element;
  class?: string;
}

function getBarClassName(
  renderProps: ActionBarRenderProps,
  extraClass?: string,
  isEmphasized?: boolean,
): string {
  return [
    "vui-action-bar flex items-center gap-2 rounded-lg border border-primary-600 bg-bg-300 p-2",
    isEmphasized ? "vui-action-bar--emphasized" : "",
    extraClass ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function ActionBar(props: ActionBarProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class", "children", "isEmphasized"]);

  return (
    <HeadlessActionBar
      {...headlessProps}
      class={(rp: ActionBarRenderProps) => getBarClassName(rp, local.class, local.isEmphasized)}
    >
      <HeadlessClearButton class="inline-flex items-center justify-center rounded p-1 text-primary-200 hover:bg-bg-400 transition-colors" />
      <HeadlessSelectionCount class="text-sm text-primary-200 whitespace-nowrap" />
      <div class="flex-1" />
      <div class="flex items-center gap-1">{local.children}</div>
    </HeadlessActionBar>
  );
}

export function ActionBarContainer(props: ActionBarContainerProps): JSX.Element {
  return (
    <HeadlessActionBarContainer
      class={["vui-action-bar-container", props.class].filter(Boolean).join(" ")}
    >
      {props.children}
    </HeadlessActionBarContainer>
  );
}
