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

// Ported to SolidJS for Proyecto Viviana; based on packages/@adobe/react-spectrum/src/steplist/StepList.tsx

// Port of @react-spectrum source: https://github.com/adobe/react-spectrum/blob/5ecb3333001313e83898cd07644227897e3bae1f/packages/@adobe/react-spectrum/src/steplist/StepList.tsx.

import { type JSX, splitProps, createContext, useContext, createSignal, Show } from "solid-js";
import {
  StepList as HeadlessStepList,
  Step as HeadlessStep,
  type StepListProps as HeadlessStepListProps,
  type StepListItemRenderProps,
  type StepProps as HeadlessStepProps,
} from "@proyecto-viviana/solidaria-components";
import { createId, type Key } from "@proyecto-viviana/solid-stately";
import { useProviderProps } from "../provider";
import { style, focusRing, lightDark } from "../style" with { type: "macro" };

export type StepListSize = "sm" | "md" | "lg";

interface StepListContextValue {
  size: StepListSize;
  /** Total number of steps, used to hide the trailing connector. */
  count: number;
}

const StepListSizeContext = createContext<StepListContextValue>({ size: "md", count: 0 });

export interface StepListProps<T extends { key: Key; label: string }> extends Omit<
  HeadlessStepListProps<T>,
  "class" | "style" | "children"
> {
  /** The size of the step list. */
  size?: StepListSize;
  /** Additional CSS class name. */
  class?: string;
  /** Render function for step content, or omit to use default rendering. */
  children?: (item: T, state: StepListItemRenderProps) => JSX.Element;
}

export interface StepProps extends Omit<HeadlessStepProps, "class" | "style"> {
  /** Additional CSS class name. */
  class?: string;
}

// All styling flows through the build-time S2 style() macro so the atomic CSS
// ships in the package bundle for installed consumers, rather than relying on
// Tailwind utility strings the package ships no CSS for. Step state
// (selected/completed/disabled) is driven by the collection render props; later
// keys win, so selected beats completed beats disabled.

type StepStyleState = {
  size: StepListSize;
  isSelected?: boolean;
  isCompleted?: boolean;
  isDisabled?: boolean;
  isFocusVisible?: boolean;
};

const listStyles = style({
  display: "flex",
  alignItems: "start",
});

const stepItemStyles = style({
  display: "flex",
  alignItems: "center",
  flexGrow: 1,
  minWidth: 0,
});

// Escape-hatch (bespoke `Step` children) li layout: same flex row as the
// default rendering, plus inline padding so adjacent bespoke steps — which
// have no indicator bubbles or connectors — don't run together.
const bespokeStepItemStyles = style({
  display: "flex",
  alignItems: "center",
  flexGrow: 1,
  minWidth: 0,
  paddingX: 8,
});

const stepLinkStyles = style<StepStyleState>({
  ...focusRing(),
  borderRadius: "row",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: { size: { sm: 4, md: "[6px]", lg: 8 } },
});

/* Glasselated: the register marks progress with a CHANNEL GLYPH, not a numbered
 * bubble — `✓` for a completed step, `>` for the one you are on, `░` for one not
 * reached yet (the same ✓/>/░ vocabulary the register's channel rows use). The
 * step number stays in the accessible name via a visually-hidden span, so the
 * glyph is purely visual. */
const markStyles = style<StepStyleState>({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: "default",
  width: { size: { sm: 16, md: 20, lg: 24 } },
  height: { size: { sm: 16, md: 20, lg: 24 } },
  fontFamily: "code",
  fontWeight: "semi-bold",
  lineHeight: "[1]",
  fontSize: { size: { sm: "[11px]", md: "[13px]", lg: "[15px]" } },
  color: {
    default: "[var(--terminal-dim)]",
    isDisabled: "disabled",
    isCompleted: lightDark("positive-900", "positive-1000"),
    isSelected: "[var(--accent-primary)]",
  },
});

/** Visually-hidden pattern used for the parts of the accessible name that carry
 * no visual weight (the step number and the state prefix). */
const visuallyHidden = {
  border: 0,
  clip: "rect(0 0 0 0)",
  "clip-path": "inset(50%)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: 0,
  position: "absolute" as const,
  width: "1px",
  "white-space": "nowrap" as const,
};

const labelStyles = style<StepStyleState>({
  transition: "default",
  font: { size: { sm: "ui-xs", md: "ui-sm", lg: "ui" } },
  /* Glasselated: step labels are nav text — mono, like every other nav row in
   * the register. `font` above still owns the size ramp. */
  fontFamily: "code",
  fontWeight: { default: "normal", isSelected: "semi-bold" },
  color: {
    default: "[var(--text-tertiary)]",
    isDisabled: "disabled",
    isCompleted: "[var(--text-secondary)]",
    isSelected: "neutral",
  },
});

const connectorStyles = style<StepStyleState>({
  flexGrow: 1,
  flexShrink: 0,
  alignSelf: "center",
  minWidth: 16,
  height: 2,
  transition: "default",
  backgroundColor: { default: "[var(--well-border)]", isCompleted: "positive" },
});

/**
 * StepList displays a sequence of steps with visual indicators and connector lines.
 *
 */
export function StepList<T extends { key: Key; label: string }>(
  props: StepListProps<T>,
): JSX.Element {
  const mergedProps = useProviderProps(props);
  const [local, headlessProps] = splitProps(mergedProps, ["size", "class", "children"]);

  const size = () => local.size ?? "md";
  const customClass = () => local.class ?? "";

  const renderStep = (item: T, renderProps: StepListItemRenderProps): JSX.Element => {
    if (local.children) {
      return local.children(item, renderProps);
    }

    return (
      <DefaultStep item={item} stepNumber={renderProps.stepNumber} renderProps={renderProps} />
    );
  };

  return (
    <StepListSizeContext.Provider
      value={{
        get size() {
          return size();
        },
        get count() {
          return mergedProps.items?.length ?? 0;
        },
      }}
    >
      <HeadlessStepList
        {...headlessProps}
        class={[listStyles, customClass()].filter(Boolean).join(" ")}
        children={renderStep}
      />
    </StepListSizeContext.Provider>
  );
}

/**
 * State prefix included in the step's accessible name, mirroring
 * `@react-spectrum/steplist`'s `en-US.json` (`"current"`/`"completed"`/
 * `"notCompleted"`). These are referenced through `aria-labelledby` so a screen
 * reader announces e.g. "1 Current: Details".
 */
/**
 * Glasselated channel mark for a step: `✓` done, `>` current, `░` not reached.
 * Decorative — the step number and state prefix are announced from the
 * visually-hidden spans the row's `aria-labelledby` points at.
 */
function stepMark(renderProps: StepListItemRenderProps): string {
  if (renderProps.isSelected) return ">";
  if (renderProps.isCompleted) return "\u2713";
  return "\u2591";
}

function stepStateLabel(renderProps: StepListItemRenderProps): string {
  if (renderProps.isSelected) return "Current: ";
  if (renderProps.isCompleted) return "Completed: ";
  return "Not completed: ";
}

function DefaultStep<T extends { key: Key; label: string }>(props: {
  item: T;
  stepNumber: number;
  renderProps: StepListItemRenderProps;
}): JSX.Element {
  const ctx = useContext(StepListSizeContext);
  const [isFocusVisible, setIsFocusVisible] = createSignal(false);

  // Accessible name composed from marker + visually-hidden state + label,
  // matching the vendored `@adobe/react-spectrum` StepListItem
  // (`aria-labelledby={markerId stateId labelId}`). The hook itself sets no
  // name — the styled wrapper owns naming.
  const markerId = createId();
  const numberId = createId();
  const stateId = createId();
  const labelId = createId();

  const state = (): StepStyleState => ({
    size: ctx.size,
    isSelected: props.renderProps.isSelected,
    isCompleted: props.renderProps.isCompleted,
    isDisabled: !props.renderProps.isSelectable,
  });

  return (
    <li
      class={stepItemStyles}
      data-selected={props.renderProps.isSelected || undefined}
      data-completed={props.renderProps.isCompleted || undefined}
      data-disabled={!props.renderProps.isSelectable || undefined}
    >
      <a
        role="link"
        aria-current={props.renderProps.isSelected ? "step" : undefined}
        aria-disabled={!props.renderProps.isSelectable ? true : undefined}
        aria-labelledby={`${numberId} ${stateId} ${labelId}`}
        tabIndex={props.renderProps.isSelectable ? 0 : undefined}
        class={stepLinkStyles({ ...state(), isFocusVisible: isFocusVisible() })}
        style={{ cursor: props.renderProps.isSelectable ? "pointer" : "default" }}
        onClick={(e) => {
          e.preventDefault();
        }}
        onFocus={(e) => setIsFocusVisible(e.currentTarget.matches(":focus-visible"))}
        onBlur={() => setIsFocusVisible(false)}
      >
        {/* Glasselated: the VISIBLE marker is the channel glyph. The step number
            it replaces has not left the accessible name — it moved to the
            visually-hidden `numberId` span below, so `aria-labelledby` still
            composes "N State: Label" exactly as the vendored
            @adobe/react-spectrum StepListItem does. */}
        <span id={markerId} aria-hidden="true" class={markStyles(state())}>
          {stepMark(props.renderProps)}
        </span>
        {/* Visually-hidden step number, referenced by aria-labelledby only. */}
        <span id={numberId} style={visuallyHidden}>
          {props.stepNumber}
        </span>
        {/* Visually-hidden state prefix, referenced by aria-labelledby only. */}
        <span id={stateId} style={visuallyHidden}>
          {stepStateLabel(props.renderProps)}
        </span>
        <span id={labelId} aria-hidden="true" class={labelStyles(state())}>
          {props.item.label}
        </span>
      </a>
      {/* Connector line — omitted on the last step. */}
      <Show when={props.stepNumber < ctx.count}>
        <div class={connectorStyles(state())} aria-hidden="true" />
      </Show>
    </li>
  );
}

/**
 * Step represents an individual styled step within a StepList.
 * Use this when providing custom step rendering via StepList children.
 */
export function Step(props: StepProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class"]);
  // The li must keep the flex row layout of the default rendering: the styled
  // StepList root is a flex <ol>, and a plain list-item li would regenerate
  // ordered-list ::markers outside its box, colliding with neighboring steps.
  return (
    <HeadlessStep
      {...headlessProps}
      class={[bespokeStepItemStyles, local.class].filter(Boolean).join(" ")}
    />
  );
}

StepList.Step = Step;

export const Item = Step;
