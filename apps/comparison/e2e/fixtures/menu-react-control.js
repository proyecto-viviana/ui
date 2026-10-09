import { useLayoutEffect, useState, useRef } from "react";
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

// #642 internal native S2 comparison. The existing Menu helper above is intact.
// Dynamic imports keep S2 page CSS out of the source/default implementation.
export async function mountReactPickers(container, fixture) {
  const [{ Picker, PickerItem, PickerContext, Text: S2Text }, { Provider }] = await Promise.all([
    import("@react-spectrum/s2/Picker"),
    import("@react-spectrum/s2/Provider"),
    import("@react-spectrum/s2/page.css"),
  ]);
  function Choice({ config }) {
    const [value, setValue] = useState(config.initial);
    // A ref survives React updates without altering natural batching.
    const reported = useRef(undefined);
    useLayoutEffect(() => {
      fixture.accepted[config.field] = config.initial;
      fixture.lifetime(`committed-field:${config.field}`, "mounts");
      return () => fixture.lifetime(`committed-field:${config.field}`, "cleanups");
    }, [config]);
    return jsx(Picker, {
      size: "S",
      styles: fixture.classes.choice,
      label: jsx(S2Text, { slot: "label", styles: fixture.classes.label, children: config.label }),
      "data-canvas-entry-field": config.field,
      items: config.options,
      selectedKey: value,
      onSelectionChange(key) {
        fixture.record({
          type: "callback",
          field: config.field,
          key,
          deduped: typeof key !== "string" || key === reported.current,
        });
        if (typeof key !== "string" || key === reported.current) return;
        reported.current = key;
        queueMicrotask(() => {
          reported.current = undefined;
        });
        fixture.accepted[config.field] = key;
        setValue(key);
        fixture.record({ type: "accepted", field: config.field, key });
      },
      // Installed S2 uses PickerItem id/textValue, never unsupported getKey.
      children: (option) =>
        jsx(PickerItem, { id: option.id, textValue: option.label, children: option.label }),
    });
  }
  const input = (label, field, type = "text") =>
    jsxs("label", {
      style: { display: "grid", gap: 4, minWidth: 0 },
      children: [
        jsx(S2Text, { children: label }),
        jsx("input", {
          className: fixture.classes.input,
          "data-canvas-entry-field": field,
          type,
          defaultValue: type === "number" ? "16" : "Hello",
          ...(type === "number" ? { min: 1, step: 1 } : {}),
        }),
      ],
    });
  function Owner() {
    useLayoutEffect(() => {
      fixture.lifetime("owner", "mounts");
      fixture.retainRefs();
      return () => fixture.lifetime("owner", "cleanups");
    }, []);
    return jsx(Provider, {
      locale: "en-US",
      colorScheme: fixture.theme,
      UNSAFE_style: { display: "contents" },
      children: jsx("div", {
        "data-editor-route-frame": "true",
        children: jsx("div", {
          "data-canvas-entry-surface": "true",
          tabIndex: 0,
          style: {
            position: "relative",
            isolation: "isolate",
            width: "100%",
            height: 900,
            overflow: "hidden",
          },
          children: jsx("aside", {
            "data-canvas-entry-properties-dock": "true",
            style: { position: "absolute", right: 0, top: 64, width: fixture.width },
            children: jsx("div", {
              "data-canvas-entry-properties-pane": "true",
              style: { overflow: "auto", minWidth: 0, minHeight: 0 },
              children: jsx("div", {
                id: "canvas-entry-world-properties-panel",
                "data-canvas-entry-world-properties-panel": "true",
                role: "region",
                "aria-label": "Properties",
                style: { width: "100%", minWidth: 0, boxSizing: "border-box" },
                children: jsx("div", {
                  style: { display: "flex", flexDirection: "column", padding: 8, gap: 4 },
                  children: jsxs("section", {
                    "data-canvas-entry-world-text-section": "true",
                    className: fixture.classes.section,
                    children: [
                      jsx(S2Text, { children: "Text" }),
                      input("Content", "text-content"),
                      jsx(PickerContext.Provider, {
                        value: { menuWidth: 280 },
                        children: jsx(Choice, { config: fixture.fields[0] }),
                      }),
                      input("Size", "text-font-size", "number"),
                      jsx(Choice, { config: fixture.fields[1] }),
                      jsx(Choice, { config: fixture.fields[2] }),
                    ],
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    });
  }
  const root = createRoot(container);
  root.render(jsx(Owner, {}));
  return { dispose: () => root.unmount() };
}
