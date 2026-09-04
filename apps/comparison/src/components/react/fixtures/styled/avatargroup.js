import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Avatar as SpectrumAvatar, AvatarGroup as SpectrumAvatarGroup } from "@react-spectrum/s2";
import {
  avatarGroupDemoPropsFromWindow,
  avatarGroupItems,
  normalizeAvatarGroupDemoProps,
  serializeAvatarGroupDemoProps,
} from "@comparison/data/avatar-group-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactAvatarGroupDemo() {
  const [demoProps, setDemoProps] = useState(avatarGroupDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "avatargroup") {
        setDemoProps(normalizeAvatarGroupDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-avatar-group-row",
      "data-comparison-control-root": "avatargroup",
      "data-comparison-control-props": serializeAvatarGroupDemoProps(demoProps),
      children: [
        jsx(
          "span",
          {
            id: "avatargroup-route-description",
            hidden: true,
            children: "Avatar group route description",
          },
          "description",
        ),
        jsx(
          "div",
          {
            id: "avatargroup-route-details",
            hidden: true,
            children: "Avatar group route details",
          },
          "details",
        ),
        jsx(
          SpectrumAvatarGroup,
          {
            label: demoProps.label || undefined,
            "aria-label": demoProps.ariaLabel,
            "aria-describedby": "avatargroup-route-description",
            "aria-details": "avatargroup-route-details",
            size: Number(demoProps.size),
            children: avatarGroupItems.slice(0, Number(demoProps.count)).map((item) =>
              jsx(
                SpectrumAvatar,
                {
                  alt: item.alt,
                  src: item.src,
                },
                item.id,
              ),
            ),
          },
          "group",
        ),
      ],
    }),
    colorScheme,
  );
}

export default () => jsx(ReactAvatarGroupDemo, {});
