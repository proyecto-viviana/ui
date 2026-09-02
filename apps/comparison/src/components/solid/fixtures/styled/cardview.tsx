import h from "solid-js/h";
import { createEffect, createMemo, createSignal, onCleanup, onMount, Show } from "solid-js";
import { hc, renderProp } from "../../solid-h";
import {
  ActionBar as SolidSpectrumActionBar,
  ActionButton as SolidSpectrumActionButton,
  Card as SolidSpectrumCard,
  CardView as SolidSpectrumCardView,
  Content as SolidSpectrumContent,
  Provider as SolidSpectrumProvider,
  Text as SolidSpectrumText,
} from "@proyecto-viviana/solid-spectrum";
import {
  cardViewDemoPropsFromWindow,
  cardViewItems,
  cardViewKeysFromValue,
  initialCardViewSelectedKeys,
  normalizeCardViewDemoProps,
  serializeCardViewDemoProps,
  serializeCardViewKeys,
  type CardViewDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/cardview-demo";
import { createComparisonResolvedThemeSignal, providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumCardViewDemo() {
  const [demoProps, setDemoProps] = createSignal<CardViewDemoProps>(cardViewDemoPropsFromWindow());
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    initialCardViewSelectedKeys(demoProps()),
  );
  const colorScheme = createComparisonResolvedThemeSignal();
  const selectedKeyText = createMemo(() => serializeCardViewKeys(selectedKeys()));
  let cardViewRoot: HTMLElement | undefined;

  createEffect(() => {
    cardViewRoot?.setAttribute(
      "data-comparison-control-props",
      serializeCardViewDemoProps(demoProps()),
    );
  });

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "cardview") {
        setDemoProps((current) => {
          const nextProps = normalizeCardViewDemoProps({
            ...current,
            ...(event.detail.props ?? {}),
          });
          setSelectedKeys(initialCardViewSelectedKeys(nextProps));
          return nextProps;
        });
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
  });

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
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-selected-keys"() {
            return selectedKeyText();
          },
        },
        [
          hc(
            SolidSpectrumCardView,
            {
              get "aria-label"() {
                return demoProps().ariaLabel;
              },
              "data-comparison-control-root": "cardview",
              ref: (element: HTMLElement) => {
                cardViewRoot = element;
              },
              get "data-comparison-control-props"() {
                return serializeCardViewDemoProps(demoProps());
              },
              items: cardViewItems,
              getKey: (item: (typeof cardViewItems)[number]) => item.id,
              getTextValue: (item: (typeof cardViewItems)[number]) => item.title,
              get layout() {
                return demoProps().layout;
              },
              get size() {
                return demoProps().size;
              },
              get density() {
                return demoProps().density;
              },
              get variant() {
                return demoProps().variant;
              },
              get selectionMode() {
                return demoProps().selectionMode;
              },
              get selectionStyle() {
                return demoProps().selectionStyle;
              },
              get disabledKeys() {
                return cardViewKeysFromValue(demoProps().disabledKeys, [], "multiple");
              },
              UNSAFE_style: cardViewDemoStyle,
              get selectedKeys() {
                return demoProps().selectionSource === "selectedKeys" ? selectedKeys() : undefined;
              },
              get defaultSelectedKeys() {
                return demoProps().selectionSource === "defaultSelectedKeys"
                  ? cardViewKeysFromValue(
                      demoProps().defaultSelectedKeys,
                      ["apollo"],
                      demoProps().selectionMode,
                    )
                  : undefined;
              },
              get renderActionBar() {
                return demoProps().showActionBar
                  ? (keys: "all" | Set<string | number>) =>
                      hc(
                        SolidSpectrumActionBar,
                        {
                          selectedItemCount: keys === "all" ? cardViewItems.length : keys.size,
                          "data-comparison-cardview-actionbar": "true",
                          onClearSelection: () => setSelectedKeys(new Set<string>()),
                        },
                        [
                          hc(SolidSpectrumActionButton, {}, [
                            hc(SolidSpectrumText, {}, ["Archive"]),
                          ]),
                        ],
                      )
                  : undefined;
              },
              onSelectionChange: (keys: "all" | Set<string | number>) =>
                setSelectedKeys(
                  keys === "all"
                    ? new Set(cardViewItems.map((item) => item.id))
                    : new Set<string>(Array.from(keys, String)),
                ),
            },
            renderProp((item: (typeof cardViewItems)[number]) =>
              hc(
                SolidSpectrumCard,
                {
                  id: item.id,
                  textValue: `${item.title} ${item.status}`,
                  get isDisabled() {
                    return demoProps().disabledItem === item.id;
                  },
                },
                [
                  hc(SolidSpectrumContent, {}, [
                    hc(SolidSpectrumText, { slot: "title" }, [item.title]),
                    hc(
                      Show,
                      {
                        get when() {
                          return demoProps().showDescriptions;
                        },
                      },
                      [hc(SolidSpectrumText, { slot: "description" }, [item.status])],
                    ),
                  ]),
                ],
              ),
            ),
          ),
        ],
      ),
    ],
  );
}

const cardViewDemoStyle = {
  width: "360px",
  height: "180px",
};

export default () => h(SolidSpectrumCardViewDemo, {});
