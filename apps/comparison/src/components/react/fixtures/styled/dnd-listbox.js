import { jsx, jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useState } from "react";
import {
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  useDragAndDrop as useAriaDragAndDrop,
} from "react-aria-components";
import { useListData as useAriaListData } from "react-stately";
import {
  dndListBoxDemoItems,
  dndListBoxDemoPropsFromWindow,
  normalizeDndListBoxDemoProps,
  serializeDndListBoxDemoProps,
  serializeDndListBoxOrder,
  comparisonControlsEvent,
} from "@comparison/data/dnd-listbox-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

// Keyboard-DnD oracle: RAC's own reorderable ListBox — `useDragAndDrop`
// (getItems + onReorder) wired to a `useListData` list, exactly as the vendored
// `ListBoxDnd` story does. The live item order is published on the listbox root
// as `data-comparison-order` so the reorder cert can pair-diff the result of a
// keyboard drag against the Solid port. Before/After boundary buttons let the
// D5-style walk cross the tab boundary to enter the collection by keyboard.
function ReactDndListBoxDemo() {
  const [demoProps, setDemoProps] = useState(dndListBoxDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();
  const list = useAriaListData({ initialItems: dndListBoxDemoItems });

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "dnd-listbox") {
        setDemoProps(normalizeDndListBoxDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const { dragAndDropHooks } = useAriaDragAndDrop({
    getItems: (keys) =>
      [...keys].map((key) => {
        const item = list.getItem(key);
        return { "text/plain": item?.label ?? String(key) };
      }),
    onReorder(e) {
      if (e.target.dropPosition === "before") {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === "after") {
        list.moveAfter(e.target.key, e.keys);
      }
    },
  });

  return renderReactSpectrumReference(
    jsxs(Fragment, {
      children: [
        jsx("button", { children: "Before" }),
        jsx(AriaListBox, {
          "aria-label": "Permissions",
          selectionMode: demoProps.selectionMode,
          items: list.items,
          dragAndDropHooks,
          "data-comparison-control-root": "dnd-listbox",
          "data-comparison-control-props": serializeDndListBoxDemoProps(demoProps),
          "data-comparison-order": serializeDndListBoxOrder(list.items),
          children: (item) => jsx(AriaListBoxItem, { id: item.id, children: item.label }, item.id),
        }),
        jsx("button", { children: "After" }),
      ],
    }),
    colorScheme,
  );
}

export default () => jsx(ReactDndListBoxDemo, {});
