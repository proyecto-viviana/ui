import { jsx, jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useRef, useState } from "react";
import { useActionGroup } from "react-aria/private/actiongroup/useActionGroup";
import { useActionGroupItem } from "react-aria/private/actiongroup/useActionGroupItem";
import { I18nProvider } from "react-aria";
import { Item as StatelyItem, useListState } from "react-stately";
import {
  actionGroupDemoItems,
  actionGroupDemoPropsFromWindow,
  actionGroupDemoLocaleFromWindow,
  actionGroupKeysFromValue,
  normalizeActionGroupDemoProps,
  serializeActionGroupDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/actiongroup-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

// Hand-wired v3 ActionGroup oracle: one `useActionGroupItem` per collection node
// rendered as a bare native <button>. `onPress` is React Aria's press
// abstraction (not a DOM prop) and the D5/D6 cert never clicks, so it is dropped
// and only the DOM-relevant props (role, tabIndex, aria-checked, onFocus) are
// spread. Native `disabled` is what v3's ActionGroupItem→ActionButton renders
// for a disabled key, reproduced here.
function ReactActionGroupItem({ node, state }) {
  const { buttonProps } = useActionGroupItem({ key: node.key }, state);
  const isDisabled = state.disabledKeys.has(node.key);
  // eslint-disable-next-line no-unused-vars
  const { onPress, ...domButtonProps } = buttonProps;
  return jsx(
    "button",
    { ...domButtonProps, disabled: isDisabled, children: node.rendered },
    node.key,
  );
}

// The hook-calling body. `useActionGroup`/`useListState` run HERE so they sit
// under the `I18nProvider` the outer component wraps us in — that is what lets
// `useActionGroup.useLocale` observe the RTL direction (D10). `renderReactSpectrumReference`
// still adds the S2 `Provider` for styling; the hooks don't read that context.
function ReactActionGroupBody({ demoProps, colorScheme, locale }) {
  const ref = useRef(null);
  const listProps = {
    "aria-label": "Text style",
    selectionMode: demoProps.selectionMode,
    orientation: demoProps.orientation,
    disabledKeys: actionGroupKeysFromValue(demoProps.disabledKeys),
    defaultSelectedKeys: actionGroupKeysFromValue(demoProps.defaultSelectedKeys),
    items: actionGroupDemoItems,
    children: (item) => jsx(StatelyItem, { children: item.label }, item.id),
    suppressTextValueWarning: true,
  };
  const state = useListState(listProps);
  const { actionGroupProps } = useActionGroup(listProps, state, ref);

  return renderReactSpectrumReference(
    jsxs(Fragment, {
      children: [
        jsx("button", { children: "Before" }),
        jsx("div", {
          ...actionGroupProps,
          ref,
          "data-comparison-control-root": "actiongroup",
          "data-comparison-control-props": serializeActionGroupDemoProps(demoProps),
          children: [...state.collection].map((node) =>
            jsx(ReactActionGroupItem, { node, state }, node.key),
          ),
        }),
        jsx("button", { children: "After" }),
      ],
    }),
    colorScheme,
    locale,
  );
}

function ReactActionGroupDemo() {
  const [demoProps, setDemoProps] = useState(actionGroupDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();
  const locale = actionGroupDemoLocaleFromWindow();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "actiongroup") {
        setDemoProps(normalizeActionGroupDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  // Wrap the hook-calling body in react-aria's own I18nProvider so
  // `useActionGroup.useLocale` sees `ar-AE` under the D10 RTL walk.
  return jsx(I18nProvider, {
    locale,
    children: jsx(ReactActionGroupBody, { demoProps, colorScheme, locale }),
  });
}

export default () => jsx(ReactActionGroupDemo, {});
