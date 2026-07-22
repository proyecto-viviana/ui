import { type JSX } from "solid-js";
import {
  SubmenuTrigger as HeadlessSubmenuTrigger,
  type SubmenuTriggerProps as HeadlessSubmenuTriggerProps,
} from "@proyecto-viviana/solidaria-components";

export interface SubmenuTriggerProps extends HeadlessSubmenuTriggerProps {}

/**
 * A styled submenu trigger that opens a nested menu.
 */
export function SubmenuTrigger(props: SubmenuTriggerProps): JSX.Element {
  return <HeadlessSubmenuTrigger {...props} />;
}
