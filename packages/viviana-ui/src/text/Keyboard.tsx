/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Content.tsx

// Port of packages/@react-spectrum/s2/src/Content.tsx.

import { type JSX, createContext, splitProps, useContext } from "solid-js";
import { mergeProps } from "@proyecto-viviana/solidaria";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { style } from "../style" with { type: "macro" };
import { type BaseContentProps, getContentDomProps, mergeUnsafeClassName } from "./shared";

/* Viviana UI v2 (Glasselated): a standalone `<kbd>` is drawn as a KEY CHIP, not as
 * a run of terminal text.
 *
 * The register shows key hints in two places — the `⌘K` parked at the end of the
 * search well and the `↵` in the tutor prompt (TerminalGlassLab.tsx:157, :165) — both
 * mono, both one step under the terminal band at 10px, both in `--terminal-dim`. What
 * the flat markup cannot say is that these are KEYS: the prototype draws them as bare
 * spans inside a well, where the well's own border already frames them. Standing alone
 * (a shortcut list, a menu row's hint, a docs paragraph) the same text reads as prose,
 * which is exactly the failure this chip fixes — a hair border on the register's
 * `--border-subtle` and the 4px `radius-xs` the handoff reserves for tags and badges
 * (tokens/surfaces.css:12) give the glyph a key silhouette without a fill, so it stays
 * legible on a well, a card, and a page ground alike.
 *
 * Transparent on purpose: a filled chip inside a matte well would read as a second,
 * nested well. The border is the whole affordance. */
const keyboardChip = style({
  font: "code-xs",
  fontSize: "[10px]",
  lineHeight: "[1.4]",
  color: "[var(--terminal-dim)]",
  backgroundColor: "transparent",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "border-subtle",
  borderRadius: "sm",
  paddingX: 4,
  paddingY: 2,
  display: "inline-block",
  whiteSpace: "nowrap",
});

export interface KeyboardProps extends BaseContentProps<HTMLElement> {}

export const KeyboardContext = createContext<SpectrumContextValue<KeyboardProps>>(null);

export function Keyboard(props: KeyboardProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(KeyboardContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props) as KeyboardProps;
  const [local] = splitProps(merged, [
    "children",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "isHidden",
    "slot",
    "ref",
  ]);
  const className = () =>
    [
      mergeUnsafeClassName(contextProps?.UNSAFE_className, props.UNSAFE_className),
      /* Standalone default: the register's key chip (see `keyboardChip`).
       * Skipped whenever a slotted context claims this <kbd> — MenuItem and other
       * hosts style their key hints through KeyboardContext, usually relying on
       * inheritance the baked role would break. See text/index.tsx for the full
       * rationale. */
      mergeContextStyles(
        contextProps == null ? keyboardChip : undefined,
        mergeContextStyles(contextProps?.styles, props.styles),
      ),
    ]
      .filter(Boolean)
      .join(" ");
  const unsafeStyle = () => mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);

  if (local.isHidden) {
    return null as unknown as JSX.Element;
  }

  return (
    <kbd
      {...getContentDomProps(merged)}
      ref={mergeContextRefs(contextProps?.ref, props.ref)}
      class={className()}
      style={unsafeStyle()}
      slot={local.slot || undefined}
      dir="ltr"
    >
      {local.children}
    </kbd>
  );
}
