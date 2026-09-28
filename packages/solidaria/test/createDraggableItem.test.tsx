import { describe, it, expect, afterEach } from "vite-plus/test";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { createDraggableCollectionState } from "@proyecto-viviana/solid-stately";
import { I18nProvider } from "../src/i18n";
import { createDraggableItem } from "../src/dnd/createDraggableItem";

function DragButtonProbe(props: {
  itemText?: string;
  hasDragButton?: boolean;
  selectionMode?: "none" | "single" | "multiple";
  selectedKeys?: Array<string | number>;
}) {
  const selected = new Set(props.selectedKeys ?? []);
  const state = createDraggableCollectionState(() => ({
    getItems: () => [],
    collection: {
      getItem: (key) => ({ textValue: props.itemText ?? String(key) }),
      getTextValue: () => props.itemText ?? "",
    },
    selectedKeys: selected,
    isSelected: (key) => selected.has(key),
  }));
  const item = createDraggableItem(
    () => ({
      key: "games",
      hasDragButton: props.hasDragButton,
      selectionMode: props.selectionMode,
    }),
    state,
  );

  return <button {...item.dragButtonProps} />;
}

describe("createDraggableItem", () => {
  afterEach(() => {
    cleanup();
  });

  it("names the drag button from the drag catalog", () => {
    render(() => (
      <I18nProvider locale="es-ES">
        <DragButtonProbe itemText="Games" hasDragButton />
      </I18nProvider>
    ));

    expect(screen.getByRole("button")).toHaveAttribute("aria-label", "Arrastrar Games");
  });

  it("names a multi-selection drag button from the drag catalog", () => {
    render(() => (
      <I18nProvider locale="es-ES">
        <DragButtonProbe hasDragButton selectedKeys={["games", "docs"]} />
      </I18nProvider>
    ));

    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Arrastrar 2 elementos seleccionados",
    );
  });

  it("leaves the drag button unnamed when selection replaces the button", () => {
    render(() => <DragButtonProbe selectionMode="multiple" />);

    expect(screen.getByRole("button")).not.toHaveAttribute("aria-label");
  });
});
