/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
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
});
