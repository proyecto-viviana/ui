/**
 * @vitest-environment jsdom
 */
import { createSignal, flush } from "solid-js";
import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { I18nProvider } from "@proyecto-viviana/solidaria";
import { Tag, TagGroup } from "../src/tag-group";

interface TagItem {
  id: string;
  name: string;
}

const items: TagItem[] = [
  { id: "1", name: "News" },
  { id: "2", name: "Travel" },
  { id: "3", name: "Gaming" },
];

function renderTagGroup(props: Partial<Parameters<typeof TagGroup<TagItem>>[0]> = {}) {
  render(() => (
    <TagGroup<TagItem> items={items} label="Topics" selectionMode="single" {...props}>
      {(item) => item.name}
    </TagGroup>
  ));
}

describe("TagGroup (solid-spectrum)", () => {
  it("wires visible label via aria-labelledby", () => {
    renderTagGroup();

    const label = screen.getByText("Topics");
    const grid = screen.getByRole("grid", { name: "Topics" });
    expect(label.id).toBeTruthy();
    expect(grid.getAttribute("aria-labelledby")).toContain(label.id);
  });

  it("supports defaultSelectedKeys passthrough", () => {
    renderTagGroup({ defaultSelectedKeys: ["2"] });

    expect(screen.getByRole("row", { name: "Travel" })).toHaveAttribute("data-selected");
    expect(screen.getByRole("row", { name: "News" })).not.toHaveAttribute("data-selected");
  });

  it("does not allow selection when TagGroup is disabled", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();
    renderTagGroup({
      selectionMode: "multiple",
      isDisabled: true,
      onSelectionChange,
    });

    const rows = screen.getAllByRole("row");
    for (const row of rows) {
      expect(row).toHaveAttribute("aria-disabled", "true");
    }

    await user.click(rows[0]);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("supports arrow-key focus navigation", async () => {
    const user = setupUser();
    renderTagGroup();

    const news = screen.getByRole("row", { name: "News" });
    const travel = screen.getByRole("row", { name: "Travel" });

    news.focus();
    await user.keyboard("{ArrowRight}");

    expect(travel).toHaveFocus();
  });

  it("supports explicit Tag composition", () => {
    render(() => (
      <TagGroup<TagItem> items={items} label="Topics" selectionMode="multiple">
        {(item) => <Tag id={item.id}>{item.name}</Tag>}
      </TagGroup>
    ));

    expect(screen.getByRole("row", { name: "News" })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: "Travel" })).toBeInTheDocument();
  });

  it("wires description and invalid error text to the grid description", () => {
    const { unmount } = render(() => (
      <TagGroup<TagItem>
        items={items}
        label="Topics"
        selectionMode="multiple"
        description="Choose one or more topics."
      >
        {(item) => item.name}
      </TagGroup>
    ));

    expect(screen.getByRole("grid", { name: "Topics" })).toHaveAccessibleDescription(
      "Choose one or more topics.",
    );

    unmount();

    render(() => (
      <TagGroup<TagItem>
        items={items}
        label="Topics"
        selectionMode="multiple"
        isInvalid
        errorMessage="Choose at least one topic."
      >
        {(item) => item.name}
      </TagGroup>
    ));

    expect(screen.getByRole("grid", { name: "Topics" })).toHaveAccessibleDescription(
      "Choose at least one topic.",
    );
  });

  it("forwards disabledKeys to implicit tags", () => {
    renderTagGroup({ disabledKeys: ["2"] });

    expect(screen.getByRole("row", { name: "Travel" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("row", { name: "News" })).not.toHaveAttribute("aria-disabled");
  });

  it("calls onRemove from the tag remove button", async () => {
    const user = setupUser();
    const onRemove = vi.fn();
    renderTagGroup({ onRemove });

    await user.click(screen.getByRole("button", { name: "Remove News" }));

    expect(onRemove).toHaveBeenCalledWith(new Set(["1"]));
  });

  it("calls onAction when a tag is activated", async () => {
    const user = setupUser();
    const onAction = vi.fn();
    renderTagGroup({ onAction });

    await user.click(screen.getByRole("row", { name: "News" }));

    expect(onAction).toHaveBeenCalledWith("1");
  });

  it("renders and calls the group action", async () => {
    const user = setupUser();
    const onGroupAction = vi.fn();
    renderTagGroup({ groupActionLabel: "Add tag", onGroupAction });

    await user.click(screen.getByRole("button", { name: "Add tag" }));

    expect(onGroupAction).toHaveBeenCalledTimes(1);
  });

  it("names the group action from the tag catalog", () => {
    renderTagGroup({ groupActionLabel: "Add tag", onGroupAction: () => {} });

    // Visible `label` names the grid. S2 prefixes the action group only from `aria-label`.
    expect(screen.getByRole("group", { name: "Actions" })).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Topics Actions" })).not.toBeInTheDocument();
  });

  it("prefixes the group action name with the tag group's aria-label", () => {
    render(() => (
      <TagGroup<TagItem>
        items={items}
        aria-label="Topics"
        groupActionLabel="Add tag"
        onGroupAction={() => {}}
      >
        {(item) => item.name}
      </TagGroup>
    ));

    expect(screen.getByRole("group", { name: "Topics Actions" })).toBeInTheDocument();
  });

  it("names the group action from the es-ES catalog", () => {
    render(() => (
      <I18nProvider locale="es-ES">
        <TagGroup<TagItem> items={items} groupActionLabel="Añadir" onGroupAction={() => {}}>
          {(item) => item.name}
        </TagGroup>
      </I18nProvider>
    ));

    expect(screen.getByRole("group", { name: "Acciones" })).toBeInTheDocument();
  });

  describe("remove button press scale (#63)", () => {
    it("applies will-change at rest and press-scale transform on pointer down", () => {
      const onRemove = vi.fn();
      renderTagGroup({ onRemove });

      const removeBtn = screen.getByRole("button", { name: "Remove News" });
      const tagRow = screen.getByRole("row", { name: "News" });

      vi.spyOn(removeBtn, "getBoundingClientRect").mockReturnValue({
        x: 0,
        y: 0,
        width: 32,
        height: 32,
        top: 0,
        right: 32,
        bottom: 32,
        left: 0,
        toJSON: () => {},
      });

      // Resting state: will-change: transform, no transform applied
      expect((removeBtn.style as Record<string, string | undefined>)["will-change"]).toContain(
        "transform",
      );
      expect(removeBtn.style.transform).toBe("");

      // Pointer down: triggers press state and perspective press-scale
      fireEvent.pointerDown(removeBtn, { pointerType: "mouse", button: 0, pointerId: 1 });
      expect((removeBtn.style as Record<string, string | undefined>)["will-change"]).toContain(
        "transform",
      );
      expect(removeBtn.style.transform).toContain("perspective(32px) translate3d(0, 0, -2px)");
      expect(removeBtn).toHaveAttribute("data-pressed", "true");
      // Row must not receive press
      expect(tagRow).not.toHaveAttribute("data-pressed");

      // Click: press state released, transform clears
      fireEvent.click(removeBtn);
      expect(removeBtn.style.transform).toBe("");
      expect(removeBtn).not.toHaveAttribute("data-pressed");
    });

    it("applies press-scale transform on keyboard press (Space and Enter)", () => {
      const onRemove = vi.fn();
      renderTagGroup({ onRemove });

      const removeBtn = screen.getByRole("button", { name: "Remove News" });
      const tagRow = screen.getByRole("row", { name: "News" });

      vi.spyOn(removeBtn, "getBoundingClientRect").mockReturnValue({
        x: 0,
        y: 0,
        width: 32,
        height: 32,
        top: 0,
        right: 32,
        bottom: 32,
        left: 0,
        toJSON: () => {},
      });

      removeBtn.focus();
      expect(document.activeElement).toBe(removeBtn);

      // KeyDown Space
      fireEvent.keyDown(removeBtn, { key: " " });
      expect(removeBtn.style.transform).toContain("perspective(32px) translate3d(0, 0, -2px)");
      expect(removeBtn).toHaveAttribute("data-pressed", "true");
      expect(tagRow).not.toHaveAttribute("data-pressed");

      // KeyUp Space
      fireEvent.keyUp(removeBtn, { key: " " });
      expect(removeBtn.style.transform).toBe("");

      // KeyDown Enter
      fireEvent.keyDown(removeBtn, { key: "Enter" });
      expect(removeBtn.style.transform).toContain("perspective(32px) translate3d(0, 0, -2px)");
      expect(removeBtn).toHaveAttribute("data-pressed", "true");
      expect(tagRow).not.toHaveAttribute("data-pressed");

      // KeyUp Enter
      fireEvent.keyUp(removeBtn, { key: "Enter" });
      expect(removeBtn.style.transform).toBe("");
    });
  });

  it("updates mixed text children reactively without recreating the tag", () => {
    let setCount!: (value: number) => void;
    render(() => {
      const [count, updateCount] = createSignal(0);
      setCount = updateCount;
      return (
        <TagGroup aria-label="Tags" items={[{ id: "1", name: "Tag" }]}>
          {(item) => <Tag id={item.id}>count: {count()}</Tag>}
        </TagGroup>
      );
    });

    const row = screen.getByRole("row");
    expect(row).toHaveTextContent("count: 0");
    setCount(1);
    flush();
    expect(screen.getByRole("row")).toBe(row);
    expect(row).toHaveTextContent("count: 1");
  });
});
