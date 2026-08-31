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

import { type JSX, createContext, mergeProps, splitProps, useContext } from "solid-js";
import { ElementTag } from "@proyecto-viviana/solidaria-components";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import type { StyleString } from "../style";
import { type BaseContentProps, getContentDomProps, mergeUnsafeClassName } from "./shared";
import { typeRoles } from "./type-roles";

export interface HeadingProps extends BaseContentProps<HTMLHeadingElement> {
  level?: number;
}

/* Heading carried NO styles of its own: `className()` below composes context styles and
 * UNSAFE_className only, so a bare <Heading> rendered at whatever type the host page
 * happened to set on h1-h4. Any heading face it appeared to have came from the consuming
 * app's own stylesheet; an installed consumer without one got nothing. This gives the
 * component a real default type role.
 *
 * The FACE comes for free: font() routes `heading` to the `display` family
 * (spectrum-theme.ts, fontFamily ternary), so every rung below resolves to the register's
 * display face instead of whatever was inherited.
 *
 * The SIZE has to vary with `level`, and previously did not. One module-level constant was
 * shared by every level, so the register's three pixel tiers — display, title, headline —
 * arrived as three identical lines and the top of the type ladder collapsed. `level` chose
 * the tag and nothing else.
 *
 * The rungs are now the register's roles VERBATIM: h1 → display, h2 → title, h3 →
 * headline, taken from the typeRoles ladder (./type-roles.ts) so the component and the
 * exported role surface can never drift apart. The roles carry the register's exact
 * metrics — 28/20/15px, the INVERTED weight ladder (500/600/700, lighter as it gets
 * bigger), the +0.01em pixel-face tracking — which the earlier nearest-ramp-rung
 * approximation here could only wave at (28.4/19.9/14, Spectrum weights, no tracking).
 *
 * h4+ deliberately share the h3 rung: the register declares three pixel tiers, not six,
 * and inventing rungs below the floor would extend a ladder the design does not have.
 *
 * The role is passed as the FIRST argument to mergeContextStyles below so it stays the
 * base layer: mergeStyles(a, b) resolves later-wins (style/runtime.ts), so Dialog/
 * Popover/ContextualHelp context styles and any local `styles` prop still override it. */
const headingStyles = {
  1: typeRoles.display,
  2: typeRoles.title,
  3: typeRoles.headline,
} as const;

function headingStyleForLevel(level: number): StyleString {
  return headingStyles[level === 1 ? 1 : level === 2 ? 2 : 3];
}

export const HeadingContext = createContext<SpectrumContextValue<HeadingProps>>(null);

export function Heading(props: HeadingProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(HeadingContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props) as HeadingProps;
  const [local] = splitProps(merged, [
    "children",
    "level",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "isHidden",
    "slot",
    "ref",
  ]);
  const level = () => local.level ?? 3;
  const tag = () => `h${level()}` as keyof JSX.IntrinsicElements;
  const className = () =>
    [
      mergeUnsafeClassName(contextProps?.UNSAFE_className, props.UNSAFE_className),
      mergeContextStyles(
        headingStyleForLevel(level()),
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
    <ElementTag
      tag={tag()}
      {...getContentDomProps(merged)}
      ref={mergeContextRefs(contextProps?.ref, props.ref)}
      class={className()}
      style={unsafeStyle()}
      slot={local.slot || undefined}
    >
      {local.children}
    </ElementTag>
  );
}
