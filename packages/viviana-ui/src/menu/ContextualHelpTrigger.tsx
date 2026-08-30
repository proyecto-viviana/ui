/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/@adobe/react-spectrum/src/menu/ContextualHelpTrigger.tsx

// Port of @react-spectrum source: https://github.com/adobe/react-spectrum/blob/5ecb3333001313e83898cd07644227897e3bae1f/packages/@adobe/react-spectrum/src/menu/ContextualHelpTrigger.tsx.
import { type JSX, splitProps } from "solid-js";
import {
  ContextualHelpTrigger as HeadlessContextualHelpTrigger,
  type ContextualHelpTriggerProps as HeadlessContextualHelpTriggerProps,
} from "@proyecto-viviana/solidaria-components";
import { css } from "../style" with { type: "macro" };

// The headless trigger hardcodes the class names on its internal button and
// popover (`-trigger`/`-content`) and exposes no per-part class hook, so styling
// must target them as descendants — including data-attribute and :hover/
// :focus-visible states the single-element style() macro can't express. Styling
// therefore flows through the css() macro escape hatch, which ships real CSS in
// the package bundle (same asset pipeline as style()) and supports this nesting.
// Values mirror the S2 neutral palette (fixed light-dark pairs, scheme-aware via
// the Provider's color-scheme).
const triggerStyles = css(`
  & .solidaria-ContextualHelpTrigger-trigger {
    display: flex;
    align-items: center;
    padding-block: 8px;
    padding-inline: 16px;
    cursor: pointer;
    background: transparent;
    border: 0;
    color: light-dark(#222, #e6e6e6);
    border-radius: 8px;
    outline: none;
  }
  & .solidaria-ContextualHelpTrigger-trigger:hover {
    background: light-dark(#0000000d, #ffffff12);
  }
  & .solidaria-ContextualHelpTrigger-trigger:focus-visible {
    outline: 2px solid light-dark(#4b75ff, #4069fd);
    outline-offset: -2px;
  }
  & .solidaria-ContextualHelpTrigger-trigger[data-unavailable] {
    color: light-dark(#8f8f8f, #7c7c7c);
  }
  & .solidaria-ContextualHelpTrigger-trigger[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
  & .solidaria-ContextualHelpTrigger-content {
    margin-top: 4px;
    padding: 16px;
    min-width: 200px;
    background: light-dark(#fff, #222);
    border: 1px solid light-dark(#d5d5d5, #3d3d3d);
    border-radius: 8px;
    box-shadow: 0 4px 12px light-dark(#00000014, #0000003d), 0 2px 6px light-dark(#0000000f, #00000030);
    color: light-dark(#222, #e6e6e6);
    outline: none;
  }
`);

export interface ContextualHelpTriggerProps extends Omit<
  HeadlessContextualHelpTriggerProps,
  "class" | "children"
> {
  /** Additional CSS class name. */
  class?: string;
  /** Convenience: title rendered as the trigger button label. */
  title?: string;
  /** Convenience: text content shown inside the popover. */
  content?: string;
  /** Visual variant for the trigger icon. */
  variant?: "help" | "info";
  /** Raw children tuple [trigger, content] — overrides title/content props. */
  children?: [JSX.Element, JSX.Element];
}

const helpIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
    <text x="8" y="12" text-anchor="middle" fill="currentColor" font-size="10" font-weight="bold">
      ?
    </text>
  </svg>
);

const infoIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
    <text x="8" y="12" text-anchor="middle" fill="currentColor" font-size="10" font-weight="bold">
      i
    </text>
  </svg>
);

/**
 * A button that opens contextual help in a popover.
 *
 * @example
 * ```tsx
 * // Convenience API
 * <ContextualHelpTrigger title="What is this?" content="Help text here" />
 *
 * // Children API
 * <ContextualHelpTrigger>
 *   {[<span>Trigger</span>, <div>Content</div>]}
 * </ContextualHelpTrigger>
 * ```
 */
export function ContextualHelpTrigger(props: ContextualHelpTriggerProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, [
    "class",
    "title",
    "content",
    "variant",
    "children",
    "aria-label",
  ]);

  const children = (): [JSX.Element, JSX.Element] => {
    if (local.children) return local.children;
    const icon = local.variant === "info" ? infoIcon : helpIcon;
    const trigger = (
      <span style={{ display: "inline-flex", "align-items": "center", gap: "4px" }}>
        {icon}
        {local.title && <span>{local.title}</span>}
      </span>
    );
    const content = (
      <div>
        {local.title && (
          <div style={{ "font-weight": "600", "margin-bottom": "4px" }}>{local.title}</div>
        )}
        {local.content && <p style={{ margin: "0" }}>{local.content}</p>}
      </div>
    );
    return [trigger, content];
  };

  return (
    <HeadlessContextualHelpTrigger
      {...headlessProps}
      aria-label={local["aria-label"] ?? local.title ?? "Contextual help"}
      class={[triggerStyles, local.class].filter(Boolean).join(" ")}
    >
      {children()}
    </HeadlessContextualHelpTrigger>
  );
}
