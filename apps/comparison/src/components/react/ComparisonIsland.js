import { jsx, jsxs } from "react/jsx-runtime";
// Keep this module JSX-free. Vite dev import-analysis currently sees this
// client-script dependency before Astro's React JSX transform runs.
import { useMemo, useRef, useState } from "react";
import {
  Button as RACButton,
  Dialog as RACDialog,
  DialogTrigger as RACDialogTrigger,
  Heading as RACHeading,
  Popover as RACPopover,
  Tab as RACTab,
  TabList as RACTabList,
  TabPanel as RACTabPanel,
  Tabs as RACTabs,
} from "react-aria-components";
import { UNSAFE_PortalProvider, useButton } from "react-aria";
import {
  comparisonReferenceDataset,
  comparisonTabItems as tabItems,
  getComparisonReferenceKind,
} from "@comparison/data/comparison-contract";
import { reactStyledFixtures } from "./fixtures/styled.js";
function ComparisonIsland(props) {
  const overlayRootRef = useRef(null);
  return /* @__PURE__ */ jsxs("div", {
    className: "comparison-island",
    children: [
      /* @__PURE__ */ jsx(UNSAFE_PortalProvider, {
        getContainer: () => document.body,
        children: renderLayer(props),
      }),
      /* @__PURE__ */ jsx("div", { ref: overlayRootRef, className: "comparison-overlay-root" }),
    ],
  });
}
function renderLayer({ componentSlug, layer }) {
  let rendered;
  if (layer === "styled") {
    rendered = renderStyled(componentSlug);
  } else if (layer === "components") {
    rendered = renderComponents(componentSlug);
  } else if (layer === "headless") {
    rendered = renderHeadless(componentSlug);
  } else {
    rendered = /* @__PURE__ */ jsx("div", {
      className: "comparison-empty-state",
      children: "This layer is tracked in the manifest but not rendered yet.",
    });
  }

  return /* @__PURE__ */ jsx(ComparisonReferenceFrame, {
    componentSlug,
    layer,
    children: rendered,
  });
}
function ComparisonReferenceFrame({ componentSlug, layer, children }) {
  const reference = getComparisonReferenceKind("react", layer, componentSlug);
  return /* @__PURE__ */ jsx("div", {
    className: "comparison-reference-frame",
    ...comparisonReferenceDataset({
      componentSlug,
      framework: "react",
      layer,
      reference,
    }),
    children: /* @__PURE__ */ jsx("div", { className: "comparison-reference-canvas", children }),
  });
}
function renderStyled(componentSlug) {
  return (
    reactStyledFixtures[componentSlug]?.() ??
    /* @__PURE__ */ jsx("div", {
      className: "comparison-empty-state",
      children: "No styled React Spectrum demo is wired for this component yet.",
    })
  );
}
function renderComponents(componentSlug) {
  switch (componentSlug) {
    case "button":
      return /* @__PURE__ */ jsxs("div", {
        className: "comparison-stack",
        children: [
          /* @__PURE__ */ jsx(RACButton, {
            className: "comparison-rac-button",
            children: "Component Button",
          }),
          /* @__PURE__ */ jsx(RACButton, {
            isDisabled: true,
            className: "comparison-rac-button comparison-rac-button--muted",
            children: "Disabled by props",
          }),
        ],
      });
    case "popover":
      return /* @__PURE__ */ jsx("div", {
        className: "comparison-stack",
        children: /* @__PURE__ */ jsxs(RACDialogTrigger, {
          children: [
            /* @__PURE__ */ jsx(RACButton, {
              className: "comparison-rac-button",
              children: "Open Popover",
            }),
            /* @__PURE__ */ jsx(RACPopover, {
              className: "comparison-popover",
              children: /* @__PURE__ */ jsxs(RACDialog, {
                "aria-label": "Quick audit note",
                className: "comparison-popover-dialog",
                children: [
                  /* @__PURE__ */ jsx(RACHeading, {
                    slot: "title",
                    className: "comparison-popover-title",
                    children: "Confirm Action",
                  }),
                  /* @__PURE__ */ jsx("p", {
                    children:
                      "Outside press and escape should dismiss this overlay without escaping its local comparison root.",
                  }),
                ],
              }),
            }),
          ],
        }),
      });
    case "tabs":
      return /* @__PURE__ */ jsxs(RACTabs, {
        className: "comparison-rac-tabs",
        "aria-label": "React Aria tabs",
        children: [
          /* @__PURE__ */ jsx(RACTabList, {
            className: "comparison-rac-tab-list",
            children: tabItems.map((item) =>
              /* @__PURE__ */ jsx(
                RACTab,
                {
                  id: item.id,
                  className: "comparison-rac-tab",
                  children: item.label,
                },
                item.id,
              ),
            ),
          }),
          tabItems.map((item) =>
            /* @__PURE__ */ jsx(
              RACTabPanel,
              {
                id: item.id,
                className: "comparison-tabs-panel",
                children: item.content,
              },
              item.id,
            ),
          ),
        ],
      });
    default:
      return /* @__PURE__ */ jsx("div", {
        className: "comparison-empty-state",
        children: "No component-layer React demo is wired for this component yet.",
      });
  }
}
function renderHeadless(componentSlug) {
  switch (componentSlug) {
    case "button":
      return /* @__PURE__ */ jsx(ReactHeadlessButtonDemo, {});
    default:
      return /* @__PURE__ */ jsx("div", {
        className: "comparison-empty-state",
        children: "No headless React demo is wired for this component yet.",
      });
  }
}
function ReactHeadlessButtonDemo() {
  const ref = useRef(null);
  const [pressCount, setPressCount] = useState(0);
  const { buttonProps, isPressed } = useButton(
    {
      onPress: () => setPressCount((count) => count + 1),
      "aria-label": "Headless action",
    },
    ref,
  );
  const label = useMemo(() => {
    if (isPressed) {
      return "Pressed";
    }
    return `Pressed ${pressCount} times`;
  }, [isPressed, pressCount]);
  return /* @__PURE__ */ jsxs("div", {
    className: "comparison-headless-stack",
    children: [
      /* @__PURE__ */ jsx("button", {
        ...buttonProps,
        ref,
        type: "button",
        className: "comparison-headless-button",
        children: label,
      }),
      /* @__PURE__ */ jsx("p", {
        className: "comparison-helper-copy",
        children: "This uses the raw `useButton` hook rather than a pre-wired component.",
      }),
    ],
  });
}
export { ComparisonIsland as default };
