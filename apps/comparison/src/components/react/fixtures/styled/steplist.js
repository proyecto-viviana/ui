import { jsx, jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useId, useRef, useState } from "react";
import { useStepList } from "react-aria/private/steplist/useStepList";
import { useStepListItem } from "react-aria/private/steplist/useStepListItem";
import { useStepListState } from "react-stately/private/steplist/useStepListState";
import { useLocalizedStringFormatter, useNumberFormatter } from "react-aria";
import { Item as StatelyItem } from "react-stately";
import {
  stepListDemoItems,
  stepListDemoPropsFromWindow,
  stepListDemoLocaleFromWindow,
  stepListIntlStrings,
  stepListKeysFromValue,
  normalizeStepListDemoProps,
  serializeStepListDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/steplist-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

// Hand-wired v3 StepList oracle: one `useStepListItem` per collection node,
// rendered as an `<a>`. The hook sets NO accessible name — naming is composed by
// the wrapper exactly as the vendored `@adobe/react-spectrum` StepListItem does:
// `aria-labelledby` referencing a marker (step number), a visually-hidden state
// prefix ("Current: " / "Completed: " / "Not completed: "), and the label. Press
// handlers from `useSelectableItem` are DOM props already, so `stepProps` spreads
// whole; the D5/D6 cert never clicks.
function ReactStepListItem({ node, state }) {
  const ref = useRef(null);
  const { stepProps } = useStepListItem({ key: node.key }, state, ref);
  const stringFormatter = useLocalizedStringFormatter(
    stepListIntlStrings,
    "@react-spectrum/steplist",
  );
  const numberFormatter = useNumberFormatter();
  const markerId = useId();
  const stateId = useId();
  const labelId = useId();
  const isSelected = state.selectedKey === node.key;
  const stateText = isSelected
    ? stringFormatter.format("current")
    : state.isCompleted(node.key)
      ? stringFormatter.format("completed")
      : stringFormatter.format("notCompleted");
  return jsx("li", {
    children: jsxs("a", {
      ...stepProps,
      ref,
      "aria-labelledby": `${markerId} ${stateId} ${labelId}`,
      children: [
        // Marker + label are aria-hidden; the accessible name is composed only
        // through aria-labelledby (which pierces aria-hidden), mirroring the
        // vendored @adobe/react-spectrum StepListItem (aria-hidden marker wrapper
        // + label div, VisuallyHidden state). This keeps the link from also
        // exposing its raw text content in the AX tree.
        jsx("span", {
          id: markerId,
          "aria-hidden": true,
          children: numberFormatter.format((node.index ?? 0) + 1),
        }),
        jsx("span", { id: stateId, children: stateText }),
        jsx("span", { id: labelId, "aria-hidden": true, children: node.rendered }),
      ],
    }),
  });
}

// The hook-calling body. `useStepListState`/`useStepList` run HERE inside
// the SpectrumProvider / I18nProvider so intl string resolution uses `locale`.
function ReactStepListBody({ demoProps }) {
  const ref = useRef(null);
  const ariaLabel =
    demoProps.ariaLabel !== undefined ? demoProps.ariaLabel || undefined : "Checkout steps";
  const listProps = {
    "aria-label": ariaLabel,
    items: stepListDemoItems,
    children: (item) => jsx(StatelyItem, { children: item.label }, item.key),
    defaultSelectedKey: demoProps.defaultSelectedKey || undefined,
    defaultLastCompletedStep: demoProps.defaultLastCompletedStep || undefined,
    disabledKeys: stepListKeysFromValue(demoProps.disabledKeys),
    isDisabled: demoProps.isDisabled,
    isReadOnly: demoProps.isReadOnly,
    suppressTextValueWarning: true,
  };
  const state = useStepListState(listProps);
  const { listProps: stepListProps } = useStepList(listProps, state, ref);

  return jsxs(Fragment, {
    children: [
      jsx("button", { children: "Before" }),
      jsx("ol", {
        ...stepListProps,
        ref,
        "data-comparison-control-root": "steplist",
        "data-comparison-control-props": serializeStepListDemoProps(demoProps),
        children: [...state.collection].map((node) =>
          jsx(ReactStepListItem, { node, state }, node.key),
        ),
      }),
      jsx("button", { children: "After" }),
    ],
  });
}

function ReactStepListDemo() {
  const [demoProps, setDemoProps] = useState(stepListDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();
  const locale = stepListDemoLocaleFromWindow();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "steplist") {
        setDemoProps(normalizeStepListDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(jsx(ReactStepListBody, { demoProps }), colorScheme, locale);
}

export default () => jsx(ReactStepListDemo, {});
