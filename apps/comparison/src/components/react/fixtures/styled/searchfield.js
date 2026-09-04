import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  ContextualHelp as SpectrumContextualHelp,
  Content as SpectrumContent,
  Heading as SpectrumHeading,
  SearchField as SpectrumSearchField,
} from "@react-spectrum/s2";
import {
  normalizeSearchFieldDemoProps,
  searchFieldDemoPropsFromWindow,
  serializeSearchFieldDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/searchfield-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactSearchFieldDemo() {
  const [demoProps, setDemoProps] = useState(searchFieldDemoPropsFromWindow);
  const [value, setValue] = useState(() => searchFieldDemoPropsFromWindow().value);
  const [clearCount, setClearCount] = useState(0);
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "searchfield") {
        const nextProps = normalizeSearchFieldDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const serializedProps = serializeSearchFieldDemoProps({
    ...demoProps,
    value,
  });
  const contextualHelp = demoProps.withContextualHelp
    ? jsxs(SpectrumContextualHelp, {
        children: [
          jsx(SpectrumHeading, { children: "Search syntax" }),
          jsx(SpectrumContent, {
            children: jsx("p", {
              children: "Use project names, owners, or status keywords.",
            }),
          }),
        ],
      })
    : undefined;

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-value": value,
      "data-comparison-clear-count": String(clearCount),
      children: jsx(SpectrumSearchField, {
        "data-comparison-control-root": "searchfield",
        "data-comparison-control-props": serializedProps,
        label: demoProps.label,
        value,
        placeholder: demoProps.placeholder,
        size: demoProps.size,
        labelPosition: demoProps.labelPosition,
        labelAlign: demoProps.labelAlign,
        necessityIndicator: demoProps.necessityIndicator,
        contextualHelp,
        name: demoProps.name,
        form: demoProps.form,
        validationBehavior: demoProps.validationBehavior,
        type: demoProps.type,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
        isDisabled: demoProps.isDisabled,
        isReadOnly: demoProps.isReadOnly,
        isRequired: demoProps.isRequired,
        isInvalid: demoProps.isInvalid,
        onChange: (nextValue) => {
          setValue(nextValue);
          setDemoProps((current) => ({ ...current, value: nextValue }));
        },
        onClear: () => {
          setValue("");
          setDemoProps((current) => ({ ...current, value: "" }));
          setClearCount((count) => count + 1);
        },
      }),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactSearchFieldDemo, {});
