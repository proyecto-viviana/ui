import { type JSX, splitProps } from "solid-js";
import {
  FileTrigger as HeadlessFileTrigger,
  type FileTriggerProps as HeadlessFileTriggerProps,
} from "@proyecto-viviana/solidaria-components";

export interface FileTriggerProps extends HeadlessFileTriggerProps {
  /** Additional CSS class for the trigger wrapper. */
  class?: string;
}

export function FileTrigger(props: FileTriggerProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class", "children"]);
  const hasClass = () => !!local.class && local.class.trim().length > 0;

  return (
    <HeadlessFileTrigger {...headlessProps}>
      {hasClass() ? <span class={local.class}>{local.children}</span> : local.children}
    </HeadlessFileTrigger>
  );
}
