import { useLayoutEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { createRoot } from "react-dom/client";
import { Menu, MenuItem, Text } from "react-aria-components";

// Installed runtime control, not a claim that these bytes equal the source pin.
export function mountReactMenu(container) {
  const counts = { mounts: 0, cleanups: 0, actions: [], closes: 0, sequence: [] };
  let update;
  function Child() {
    const [value] = useState("retained child state");
    useLayoutEffect(() => {
      counts.mounts++;
      return () => counts.cleanups++;
    }, []);
    return jsx("span", { id: "react-child", children: value });
  }
  function Control() {
    const [label, setLabel] = useState("React original");
    const [latest, setLatest] = useState(false);
    update = () => {
      setLabel("React updated");
      setLatest(true);
    };
    return jsx(Menu, {
      "aria-label": "React identity",
      id: "react-menu",
      onClose: () => counts.closes++,
      children: jsx(MenuItem, {
        id: "react-item",
        textValue: "React item",
        onAction: () => counts.actions.push(latest ? "latest" : "initial"),
        children: (state) =>
          jsxs("div", {
            children: [
              jsx(Text, {
                slot: "label",
                children: jsx("span", { id: "react-label", children: label }),
              }),
              jsx(Text, { slot: "description", children: "React description" }),
              jsx("span", {
                id: "react-live",
                "data-live-pressed": String(state.isPressed),
                "data-live-hovered": String(state.isHovered),
                "data-live-focused": String(state.isFocused),
                children: "Live state",
              }),
              jsx(Child, {}),
            ],
          }),
      }),
    });
  }
  // createRoot registers React's delegated handlers before the caller's observer.
  const root = createRoot(container);
  root.render(jsx(Control, {}));
  return {
    counts,
    update() {
      if (!update) throw new Error("React control not mounted");
      update();
    },
    dispose() {
      root.unmount();
    },
  };
}
