import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Avatar as SpectrumAvatar } from "@react-spectrum/s2";
import {
  avatarDemoPropsFromWindow,
  normalizeAvatarDemoProps,
  serializeAvatarDemoProps,
} from "@comparison/data/avatar-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactAvatarDemo() {
  const [demoProps, setDemoProps] = useState(avatarDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "avatar") {
        setDemoProps(normalizeAvatarDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-avatar-row",
      "data-comparison-avatar-over-background": demoProps.isOverBackground ? "true" : "false",
      "data-comparison-control-root": "avatar",
      "data-comparison-control-props": serializeAvatarDemoProps(demoProps),
      children: jsx(SpectrumAvatar, {
        alt: demoProps.alt,
        src: demoProps.src || undefined,
        size: Number(demoProps.size),
        isOverBackground: demoProps.isOverBackground,
      }),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactAvatarDemo, {});
