import h from "solid-js/h";
import { createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { createComponent } from "solid-js/web";
import { hc, renderProp } from "../../solid-h";
import { Provider as SolidSpectrumProvider } from "@proyecto-viviana/solid-spectrum";
import {
  ListBox as SolidHeadlessListBox,
  ListBoxOption as SolidHeadlessListBoxOption,
  useDragAndDrop as useSolidDragAndDrop,
  createListData as createSolidListData,
} from "@proyecto-viviana/solidaria-components";
import {
  dndListBoxDemoItems,
  dndListBoxDemoPropsFromWindow,
  normalizeDndListBoxDemoProps,
  serializeDndListBoxDemoProps,
  serializeDndListBoxOrder,
  type DndListBoxDemoItem,
  type DndListBoxDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/dnd-listbox-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

// Keyboard-DnD port: the Solid `useDragAndDrop`/`createListData` pair driving the
// headless ListBox, mirroring the RAC reorderable-ListBox oracle field for field
// (getItems + onReorder branching on dropPosition → moveBefore/moveAfter). The
// live item order is published on the listbox root as `data-comparison-order` so
// the reorder cert pair-diffs the keyboard-drag result against RAC.
function SolidSpectrumDndListBoxDemo() {
  const [demoProps, setDemoProps] = createSignal<DndListBoxDemoProps>(
    dndListBoxDemoPropsFromWindow(),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const list = createSolidListData<DndListBoxDemoItem>({ initialItems: dndListBoxDemoItems });

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "dnd-listbox") {
        setDemoProps(normalizeDndListBoxDemoProps(event.detail.props ?? {}));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const { dragAndDropHooks } = useSolidDragAndDrop<DndListBoxDemoItem>({
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

  const renderedListBox = createMemo(() =>
    hc(
      SolidHeadlessListBox,
      {
        "aria-label": "Permissions",
        get selectionMode() {
          return demoProps().selectionMode;
        },
        get items() {
          return list.items;
        },
        dragAndDropHooks,
        getKey: (item: DndListBoxDemoItem) => item.id,
        getTextValue: (item: DndListBoxDemoItem) => item.label,
        "data-comparison-control-root": "dnd-listbox",
        get "data-comparison-control-props"() {
          return serializeDndListBoxDemoProps(demoProps());
        },
        // Publish the live reorder result on the listbox root via a ref effect
        // rather than a spread-delivered `data-*` prop. The React oracle re-renders
        // the whole tree on each store change so a spread attribute stays live for
        // it; Solid renders the root once and binds spread attributes statically, so
        // a reactive test-only attribute routed through the DOM-prop spread would
        // freeze at first paint. An explicit ref effect (the same reactive path the
        // component's own `data-focused`/`data-orientation` attributes use) keeps the
        // published order in lockstep with `list.items` after each keyboard drop.
        ref: (el: HTMLElement) => {
          createEffect(() => {
            el.setAttribute("data-comparison-order", serializeDndListBoxOrder(list.items));
          });
        },
      },
      renderProp((item: DndListBoxDemoItem) =>
        // `hc` returns a one-shot thunk. Drop-indicator `Show` shares the
        // collection insert; a second thunk call remounts the option and
        // Chromium maps focus to `listbox:Permissions`. Instantiate like
        // compiled JSX (`createComponent`) so the node stays mounted.
        createComponent(SolidHeadlessListBoxOption, {
          id: item.id,
          textValue: item.label,
          get children() {
            return item.label;
          },
        }),
      ),
    ),
  );

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          class: "comparison-listbox-row",
        },
        [h("button", {}, "Before"), renderedListBox, h("button", {}, "After")],
      ),
    ],
  );
}

export default () => h(SolidSpectrumDndListBoxDemo, {});
