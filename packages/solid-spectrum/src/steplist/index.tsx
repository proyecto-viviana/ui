import { type JSX, splitProps, createContext, useContext } from "solid-js";
import {
  StepList as HeadlessStepList,
  Step as HeadlessStep,
  type StepListProps as HeadlessStepListProps,
  type StepListItemRenderProps,
  type StepProps as HeadlessStepProps,
} from "@proyecto-viviana/solidaria-components";
import { createId, type Key } from "@proyecto-viviana/solid-stately";
import { useProviderProps } from "../provider";

export type StepListSize = "sm" | "md" | "lg";

interface StepListContextValue {
  size: StepListSize;
}

const StepListSizeContext = createContext<StepListContextValue>({ size: "md" });

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

const sizeStyles = {
  sm: {
    indicator: "h-6 w-6 text-xs",
    text: "text-xs",
    connector: "h-0.5",
    gap: "gap-1",
    listGap: "gap-0",
  },
  md: {
    indicator: "h-8 w-8 text-sm",
    text: "text-sm",
    connector: "h-0.5",
    gap: "gap-1.5",
    listGap: "gap-0",
  },
  lg: {
    indicator: "h-10 w-10 text-base",
    text: "text-base",
    connector: "h-0.5",
    gap: "gap-2",
    listGap: "gap-0",
  },
};

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
      }}
    >
      <HeadlessStepList
        {...headlessProps}
        class={`flex items-start ${sizeStyles[size()].listGap} ${customClass()}`}
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
  const styles = () => sizeStyles[ctx.size];

  // Accessible name composed from marker + visually-hidden state + label,
  // matching the vendored `@adobe/react-spectrum` StepListItem
  // (`aria-labelledby={markerId stateId labelId}`). The hook itself sets no
  // name — the styled wrapper owns naming.
  const markerId = createId();
  const stateId = createId();
  const labelId = createId();

  const indicatorClasses = (): string => {
    const base = `${styles().indicator} flex items-center justify-center rounded-full font-medium shrink-0 transition-colors duration-150`;

    if (props.renderProps.isSelected) {
      return `${base} bg-accent-300 text-on-color`;
    }
    if (props.renderProps.isCompleted) {
      return `${base} bg-success-300 text-on-color`;
    }
    if (!props.renderProps.isSelectable) {
      return `${base} bg-bg-300 text-primary-600`;
    }
    return `${base} bg-bg-200 text-primary-300 border border-primary-500`;
  };

  const labelClasses = (): string => {
    const base = `${styles().text} transition-colors duration-150`;

    if (props.renderProps.isSelected) {
      return `${base} text-primary-100 font-medium`;
    }
    if (props.renderProps.isCompleted) {
      return `${base} text-primary-300`;
    }
    if (!props.renderProps.isSelectable) {
      return `${base} text-primary-600`;
    }
    return `${base} text-primary-400`;
  };

  const connectorClasses = (): string => {
    const base = `${styles().connector} flex-1 min-w-4 transition-colors duration-150`;
    if (props.renderProps.isCompleted) {
      return `${base} bg-success-300`;
    }
    return `${base} bg-bg-300`;
  };

  const cursorClass = (): string => {
    if (props.renderProps.isSelectable) return "cursor-pointer";
    return "cursor-default";
  };

  return (
    <li
      class="flex items-center flex-1 min-w-0"
      data-selected={props.renderProps.isSelected || undefined}
      data-completed={props.renderProps.isCompleted || undefined}
      data-disabled={!props.renderProps.isSelectable || undefined}
    >
      <a
        role="link"
        aria-current={props.renderProps.isSelected ? "step" : undefined}
        aria-disabled={!props.renderProps.isSelectable ? true : undefined}
        aria-labelledby={`${markerId} ${stateId} ${labelId}`}
        tabIndex={props.renderProps.isSelectable ? 0 : undefined}
        class={`flex flex-col items-center ${styles().gap} ${cursorClass()} outline-none focus-visible:ring-2 focus-visible:ring-accent-300 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-400 rounded`}
        onClick={(e) => {
          e.preventDefault();
        }}
      >
        {/* Marker ALWAYS carries the step number as text — it is referenced by
            aria-labelledby, so the accessible name stays "N State: Label" in
            every state (mirrors the vendored @adobe/react-spectrum StepListItem,
            whose marker is `numberFormatter.format(index + 1)` regardless of
            completion; completion is a color change, not an icon swap). The
            marker and label are aria-hidden — the accessible name is composed
            solely through aria-labelledby (which pierces aria-hidden), exactly
            as the vendored StepListItem hides its marker wrapper + label div. */}
        <span id={markerId} aria-hidden="true" class={indicatorClasses()}>
          {props.stepNumber}
        </span>
        {/* Visually-hidden state prefix, referenced by aria-labelledby only. */}
        <span
          id={stateId}
          style={{
            border: 0,
            clip: "rect(0 0 0 0)",
            "clip-path": "inset(50%)",
            height: "1px",
            margin: "-1px",
            overflow: "hidden",
            padding: 0,
            position: "absolute",
            width: "1px",
            "white-space": "nowrap",
          }}
        >
          {stepStateLabel(props.renderProps)}
        </span>
        <span id={labelId} aria-hidden="true" class={labelClasses()}>
          {props.item.label}
        </span>
      </a>
      {/* Connector line — hidden on the last step */}
      <div
        class={`${connectorClasses()} self-center mt-0 [li:last-child>&]:hidden`}
        aria-hidden="true"
      />
    </li>
  );
}

/**
 * Step represents an individual styled step within a StepList.
 * Use this when providing custom step rendering via StepList children.
 */
export function Step(props: StepProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class"]);
  return <HeadlessStep {...headlessProps} class={local.class} />;
}

StepList.Step = Step;

export const Item = Step;
