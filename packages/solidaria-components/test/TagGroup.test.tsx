/**
 * TagGroup tests - Port of React Aria's TagGroup.test.tsx
 *
 * Tests for TagGroup component functionality including:
 * - Rendering
 * - Selection
 * - Keyboard navigation
 * - Removal
 * - ARIA attributes
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vite-plus/test";
import { render, screen, cleanup, waitFor, fireEvent } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { TagGroup, TagList, Tag, TagRemoveButton } from "../src/TagGroup";
import { SelectionIndicator } from "../src/SelectionIndicator";
import { I18nProvider } from "@proyecto-viviana/solidaria";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

// User event instance - created per test
let user: ReturnType<typeof setupUser>;

// Sample items for testing
const sampleItems = [
  { id: "1", name: "News" },
  { id: "2", name: "Travel" },
  { id: "3", name: "Gaming" },
  { id: "4", name: "Shopping" },
];

// Helper component for testing TagGroup
function TestTagGroup(props: {
  items?: typeof sampleItems;
  tagListProps?: Partial<Parameters<typeof TagList>[0]>;
}) {
  const items = props.items ?? sampleItems;
  return (
    <TagGroup>
      <TagList items={items} aria-label="Test Tags" {...props.tagListProps}>
        {(item) => <Tag id={item.id}>{item.name}</Tag>}
      </TagList>
    </TagGroup>
  );
}

describe("TagGroup", () => {
  beforeEach(() => {
    user = setupUser();
  });

  afterEach(() => {
    cleanup();
  });

  // ============================================
  // RENDERING
  // ============================================

  describe("rendering", () => {
    it("should render with default class", () => {
      render(() => <TestTagGroup />);

      const tagGroup = document.querySelector(".solidaria-TagGroup");
      expect(tagGroup).toBeInTheDocument();
    });

    it("should render tag list", () => {
      render(() => <TestTagGroup />);

      const tagList = document.querySelector(".solidaria-TagList");
      expect(tagList).toBeInTheDocument();
    });

    it("should render all tags", () => {
      render(() => <TestTagGroup />);

      const tags = document.querySelectorAll(".solidaria-Tag");
      expect(tags.length).toBe(4);
    });

    it("should render tag content", () => {
      render(() => <TestTagGroup />);

      expect(screen.getByText("News")).toBeInTheDocument();
      expect(screen.getByText("Travel")).toBeInTheDocument();
      expect(screen.getByText("Gaming")).toBeInTheDocument();
      expect(screen.getByText("Shopping")).toBeInTheDocument();
    });

    it("should render with custom class", () => {
      render(() => (
        <TagGroup>
          <TagList items={sampleItems} aria-label="Test" class="my-tag-list">
            {(item) => <Tag id={item.id}>{item.name}</Tag>}
          </TagList>
        </TagGroup>
      ));

      const tagList = document.querySelector(".my-tag-list");
      expect(tagList).toBeInTheDocument();
    });

    it("should render empty state when no items", () => {
      render(() => (
        <TagGroup>
          <TagList items={[]} aria-label="Test" renderEmptyState={() => <span>No tags</span>}>
            {(item: { id: string; name: string }) => <Tag id={item.id}>{item.name}</Tag>}
          </TagList>
        </TagGroup>
      ));

      expect(screen.getByText("No tags")).toBeInTheDocument();
      // An empty TagGroup exposes role="group" (not "grid"); mirrors upstream
      // TagGroup.test.js `getByRole('group')` and createTagGroup's
      // `role: hasItems ? "grid" : "group"`.
      expect(screen.getByRole("group")).toBeInTheDocument();
    });
  });

  // ============================================
  // SELECTION
  // ============================================

  describe("selection", () => {
    it("should support single selection", async () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestTagGroup
          tagListProps={{
            selectionMode: "single",
            onSelectionChange,
          }}
        />
      ));

      const newsTag = screen.getByText("News").closest(".solidaria-Tag");
      await user.click(newsTag!);

      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalled();
      });
    });

    it("should support multiple selection", async () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestTagGroup
          tagListProps={{
            selectionMode: "multiple",
            onSelectionChange,
          }}
        />
      ));

      const newsTag = screen.getByText("News").closest(".solidaria-Tag");
      const travelTag = screen.getByText("Travel").closest(".solidaria-Tag");

      await user.click(newsTag!);
      await user.click(travelTag!);

      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalled();
      });
    });

    it("should show controlled selection", () => {
      render(() => (
        <TestTagGroup
          tagListProps={{
            selectionMode: "multiple",
            selectedKeys: ["1", "2"],
          }}
        />
      ));

      const selectedTags = document.querySelectorAll("[data-selected]");
      expect(selectedTags.length).toBe(2);
    });

    it("should show default selection", () => {
      render(() => (
        <TestTagGroup
          tagListProps={{
            selectionMode: "single",
            defaultSelectedKeys: ["1"],
          }}
        />
      ));

      const selectedTags = document.querySelectorAll("[data-selected]");
      expect(selectedTags.length).toBe(1);
    });

    it("should render SelectionIndicator only for selected tags", async () => {
      render(() => (
        <TagGroup>
          <TagList
            items={sampleItems}
            aria-label="Test Tags"
            selectionMode="single"
            defaultSelectedKeys={["1"]}
          >
            {(item) => (
              <Tag id={item.id}>
                {() => (
                  <>
                    {item.name}
                    <SelectionIndicator>Selected</SelectionIndicator>
                  </>
                )}
              </Tag>
            )}
          </TagList>
        </TagGroup>
      ));

      expect(screen.getAllByText("Selected")).toHaveLength(1);

      const travelTag = screen.getByText("Travel").closest(".solidaria-Tag");
      await user.click(travelTag!);

      expect(screen.getAllByText("Selected")).toHaveLength(1);
      expect(travelTag?.textContent).toContain("Selected");
    });
  });

  // ============================================
  // DISABLED STATE
  // ============================================

  describe("disabled state", () => {
    it("should support isDisabled on TagList", () => {
      render(() => <TestTagGroup tagListProps={{ isDisabled: true }} />);

      const tagList = document.querySelector(".solidaria-TagList");
      expect(tagList).toHaveAttribute("aria-disabled", "true");
    });

    it("should support disabled keys", () => {
      render(() => <TestTagGroup tagListProps={{ disabledKeys: ["2"] }} />);

      const disabledTag = document.querySelector("[data-disabled]");
      expect(disabledTag).toBeInTheDocument();
    });

    it("should support isDisabled on individual Tag", () => {
      render(() => (
        <TagGroup>
          <TagList items={sampleItems} aria-label="Test">
            {(item) => (
              <Tag id={item.id} isDisabled={item.id === "1"}>
                {item.name}
              </Tag>
            )}
          </TagList>
        </TagGroup>
      ));

      const disabledTag = document.querySelector("[data-disabled]");
      expect(disabledTag).toBeInTheDocument();
    });

    it("disables all tag interactions when TagList is disabled", async () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestTagGroup
          tagListProps={{
            isDisabled: true,
            selectionMode: "multiple",
            onSelectionChange,
          }}
        />
      ));

      const tags = screen.getAllByRole("row");
      for (const tag of tags) {
        expect(tag).toHaveAttribute("aria-disabled", "true");
      }

      await user.click(tags[0]);
      expect(onSelectionChange).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // REMOVAL
  // ============================================

  describe("removal", () => {
    it("should render remove button", () => {
      render(() => (
        <TagGroup>
          <TagList items={sampleItems} aria-label="Test" onRemove={vi.fn()}>
            {(item) => (
              <Tag id={item.id}>
                {item.name}
                <TagRemoveButton />
              </Tag>
            )}
          </TagList>
        </TagGroup>
      ));

      const removeButtons = document.querySelectorAll(".solidaria-TagRemoveButton");
      expect(removeButtons.length).toBe(4);
    });

    it("should have aria-label on remove button", () => {
      render(() => (
        <TagGroup>
          <TagList items={sampleItems} aria-label="Test" onRemove={vi.fn()}>
            {(item) => (
              <Tag id={item.id}>
                {item.name}
                <TagRemoveButton />
              </Tag>
            )}
          </TagList>
        </TagGroup>
      ));

      const removeButton = document.querySelector(".solidaria-TagRemoveButton");
      expect(removeButton).toHaveAttribute("aria-label", "Remove");
    });

    it("labels the remove button from I18nProvider, not the English literal", () => {
      render(() => (
        <I18nProvider locale="de-DE">
          <TagGroup>
            <TagList items={sampleItems} aria-label="Test" onRemove={vi.fn()}>
              {(item) => (
                <Tag id={item.id}>
                  {item.name}
                  <TagRemoveButton />
                </Tag>
              )}
            </TagList>
          </TagGroup>
        </I18nProvider>
      ));
      const removeButton = document.querySelector(".solidaria-TagRemoveButton");
      expect(removeButton).toHaveAttribute("aria-label", "Entfernen");
    });

    it("should render custom remove button content", () => {
      render(() => (
        <TagGroup>
          <TagList items={sampleItems} aria-label="Test" onRemove={vi.fn()}>
            {(item) => (
              <Tag id={item.id}>
                {item.name}
                <TagRemoveButton>Delete</TagRemoveButton>
              </Tag>
            )}
          </TagList>
        </TagGroup>
      ));

      expect(screen.getAllByText("Delete").length).toBe(4);
    });

    it("should call onRemove when remove button is pressed", async () => {
      const onRemove = vi.fn();
      render(() => (
        <TagGroup>
          <TagList items={sampleItems} aria-label="Test" onRemove={onRemove}>
            {(item) => (
              <Tag id={item.id}>
                {(renderProps) => (
                  <>
                    {item.name}
                    <TagRemoveButton buttonProps={renderProps.removeButtonProps} />
                  </>
                )}
              </Tag>
            )}
          </TagList>
        </TagGroup>
      ));

      const removeButtons = document.querySelectorAll(".solidaria-TagRemoveButton");
      fireEvent.click(removeButtons[0] as HTMLElement);

      await waitFor(() => {
        expect(onRemove).toHaveBeenCalledWith(new Set(["1"]));
      });
    });
  });

  // ============================================
  // ARIA ATTRIBUTES
  // ============================================

  describe("aria attributes", () => {
    it("should have aria-label on tag list", () => {
      render(() => <TestTagGroup />);

      const tagList = document.querySelector(".solidaria-TagList");
      expect(tagList).toHaveAttribute("aria-label", "Test Tags");
    });

    it("should apply fallback aria-label when no explicit label is provided", () => {
      render(() => (
        <TagGroup>
          <TagList items={sampleItems}>{(item) => <Tag id={item.id}>{item.name}</Tag>}</TagList>
        </TagGroup>
      ));

      const grid = screen.getByRole("grid");
      expect(grid).toHaveAttribute("aria-label", "Tag list");
    });

    it("treats label prop as accessible name when no aria-label is provided", () => {
      render(() => (
        <TagGroup>
          <TagList items={sampleItems} label="Topics">
            {(item) => <Tag id={item.id}>{item.name}</Tag>}
          </TagList>
        </TagGroup>
      ));

      const grid = screen.getByRole("grid");
      expect(grid).toHaveAttribute("aria-label", "Topics");
    });

    it("should have grid role", () => {
      render(() => <TestTagGroup />);

      const grid = screen.getByRole("grid");
      expect(grid).toBeInTheDocument();
    });

    it("should have row role on tags", () => {
      render(() => <TestTagGroup />);

      const rows = screen.getAllByRole("row");
      expect(rows.length).toBe(4);
    });
  });

  // ============================================
  // DATA ATTRIBUTES
  // ============================================

  describe("data attributes", () => {
    it("should have data-empty when no items", () => {
      render(() => (
        <TagGroup>
          <TagList items={[]} aria-label="Test">
            {(item: { id: string; name: string }) => <Tag id={item.id}>{item.name}</Tag>}
          </TagList>
        </TagGroup>
      ));

      const tagList = document.querySelector(".solidaria-TagList");
      expect(tagList).toHaveAttribute("data-empty");
    });

    it("should have data-selected on selected tags", () => {
      render(() => (
        <TestTagGroup
          tagListProps={{
            selectionMode: "single",
            selectedKeys: ["1"],
          }}
        />
      ));

      const selectedTag = document.querySelector("[data-selected]");
      expect(selectedTag).toBeInTheDocument();
    });

    it("should have data-disabled on disabled tags", () => {
      render(() => <TestTagGroup tagListProps={{ disabledKeys: ["1"] }} />);

      const disabledTag = document.querySelector("[data-disabled]");
      expect(disabledTag).toBeInTheDocument();
    });

    it("should render tags when onRemove is provided", () => {
      render(() => (
        <TagGroup>
          <TagList items={sampleItems} aria-label="Test" onRemove={vi.fn()}>
            {(item) => <Tag id={item.id}>{item.name}</Tag>}
          </TagList>
        </TagGroup>
      ));

      const tags = document.querySelectorAll(".solidaria-Tag");
      expect(tags.length).toBe(4);
    });
  });

  // ============================================
  // FOCUS
  // ============================================

  describe("focus", () => {
    it("should be focusable", async () => {
      render(() => <TestTagGroup />);

      const tagList = document.querySelector(".solidaria-TagList") as HTMLElement;

      // Tag list should exist and have proper structure for focus
      expect(tagList).toBeInTheDocument();

      // Focus the first tag instead (tags have tabIndex)
      const firstTag = document.querySelector(".solidaria-Tag") as HTMLElement;
      expect(firstTag).toHaveAttribute("tabindex");
    });

    it("makes every enabled tag a tab stop when no tag is focused", () => {
      // Faithful to useTag (useTag.ts:100-104): with nothing focused, every
      // non-disabled row is a tab stop (tabindex 0); only the disabled row is -1.
      render(() => <TestTagGroup tagListProps={{ disabledKeys: ["1"] }} />);

      const newsTag = screen.getByRole("row", { name: "News" });
      const travelTag = screen.getByRole("row", { name: "Travel" });
      const gamingTag = screen.getByRole("row", { name: "Gaming" });

      expect(newsTag).toHaveAttribute("tabindex", "-1");
      expect(travelTag).toHaveAttribute("tabindex", "0");
      expect(gamingTag).toHaveAttribute("tabindex", "0");
    });

    it("supports Arrow/Home/End keyboard navigation between tags", async () => {
      render(() => <TestTagGroup tagListProps={{ disabledKeys: ["2"] }} />);

      const newsTag = screen.getByRole("row", { name: "News" });
      const gamingTag = screen.getByRole("row", { name: "Gaming" });

      newsTag.focus();
      await user.keyboard("{ArrowRight}");
      expect(gamingTag).toHaveFocus();

      await user.keyboard("{Home}");
      expect(newsTag).toHaveFocus();

      await user.keyboard("{End}");
      expect(screen.getByRole("row", { name: "Shopping" })).toHaveFocus();
    });

    it("keeps roving focus on the next tag after Delete", async () => {
      const [items, setItems] = createSignal([...sampleItems]);
      render(() => (
        <TagGroup>
          <TagList
            items={items()}
            aria-label="Test"
            onRemove={(keys) => setItems(items().filter((item) => !keys.has(item.id)))}
          >
            {(item) => (
              <Tag id={item.id}>
                {(renderProps) => (
                  <>
                    {item.name}
                    {renderProps.allowsRemoving ? (
                      <TagRemoveButton buttonProps={renderProps.removeButtonProps} />
                    ) : null}
                  </>
                )}
              </Tag>
            )}
          </TagList>
        </TagGroup>
      ));

      const news = screen.getByRole("row", { name: /News/ });
      news.focus();
      fireEvent.keyDown(news, { key: "Delete" });

      await waitFor(() => {
        expect(screen.queryByRole("row", { name: /News/ })).not.toBeInTheDocument();
        expect(screen.getByRole("row", { name: /Travel/ })).toHaveFocus();
      });
      expect(screen.getByRole("row", { name: /Travel/ })).toHaveAttribute("tabindex", "0");
    });

    it("tabs the focused tag then its Remove then exits", async () => {
      render(() => (
        <>
          <button type="button">Before</button>
          <TagGroup>
            <TagList items={sampleItems} aria-label="Test" onRemove={vi.fn()}>
              {(item) => (
                <Tag id={item.id}>
                  {item.name}
                  <TagRemoveButton />
                </Tag>
              )}
            </TagList>
          </TagGroup>
          <button type="button">After</button>
        </>
      ));

      await user.tab();
      expect(screen.getByRole("button", { name: "Before" })).toHaveFocus();
      await user.tab();
      expect(screen.getByRole("row", { name: /News/ })).toHaveFocus();
      await user.tab();
      expect(document.activeElement).toHaveClass("solidaria-TagRemoveButton");
      await user.tab();
      expect(screen.getByRole("button", { name: "After" })).toHaveFocus();

      await user.keyboard("{Shift>}{Tab}{/Shift}");
      expect(screen.getByRole("row", { name: /News/ })).toHaveFocus();
    });

    it("sets data-focus-visible on keyboard focus", async () => {
      render(() => <TestTagGroup />);
      await user.tab();
      const news = screen.getByRole("row", { name: "News" });
      expect(news).toHaveFocus();
      expect(news).toHaveAttribute("data-focus-visible");
    });
  });

  describe("selectionBehavior", () => {
    it("replace-selects on pointer press and arrow selectOnFocus", async () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TagGroup>
          <TagList
            items={sampleItems}
            aria-label="Test"
            selectionMode="multiple"
            selectionBehavior="replace"
            defaultSelectedKeys={new Set(["1"])}
            onSelectionChange={onSelectionChange}
          >
            {(item) => <Tag id={item.id}>{item.name}</Tag>}
          </TagList>
        </TagGroup>
      ));

      await user.click(screen.getByRole("row", { name: "Travel" }));
      expect(onSelectionChange).toHaveBeenCalled();
      const next = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string>;
      expect([...next]).toEqual(["2"]);

      await user.keyboard("{ArrowRight}");
      const afterArrow = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string>;
      expect([...afterArrow]).toEqual(["3"]);
    });
  });

  describe("onAction", () => {
    it("does not fire onAction on a selection press", async () => {
      const onAction = vi.fn();
      const onSelectionChange = vi.fn();
      render(() => (
        <TagGroup>
          <TagList
            items={sampleItems}
            aria-label="Test"
            selectionMode="multiple"
            defaultSelectedKeys={new Set(["1"])}
            onSelectionChange={onSelectionChange}
          >
            {(item) => (
              <Tag id={item.id} onAction={onAction}>
                {item.name}
              </Tag>
            )}
          </TagList>
        </TagGroup>
      ));

      await user.click(screen.getByRole("row", { name: "Travel" }));
      expect(onAction).not.toHaveBeenCalled();
      expect(onSelectionChange).toHaveBeenCalled();
    });

    it("fires onAction on Enter when selectionMode is none", async () => {
      const onAction = vi.fn();
      render(() => (
        <TagGroup>
          <TagList items={sampleItems} aria-label="Test" selectionMode="none">
            {(item) => (
              <Tag id={item.id} onAction={onAction}>
                {item.name}
              </Tag>
            )}
          </TagList>
        </TagGroup>
      ));

      screen.getByRole("row", { name: "Travel" }).focus();
      await user.keyboard("{Enter}");
      expect(onAction).toHaveBeenCalledTimes(1);
    });
  });

  describe("collection keys", () => {
    it("clears selection on Escape", async () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TagGroup>
          <TagList
            items={sampleItems}
            aria-label="Test"
            selectionMode="multiple"
            defaultSelectedKeys={new Set(["1", "2"])}
            onSelectionChange={onSelectionChange}
          >
            {(item) => <Tag id={item.id}>{item.name}</Tag>}
          </TagList>
        </TagGroup>
      ));

      screen.getByRole("row", { name: "Travel" }).focus();
      await user.keyboard("{Escape}");
      const next = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string>;
      expect(next?.size ?? 0).toBe(0);
    });

    it("selects all tags with Ctrl+A", async () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TagGroup>
          <TagList
            items={sampleItems}
            aria-label="Test"
            selectionMode="multiple"
            defaultSelectedKeys={new Set(["1"])}
            onSelectionChange={onSelectionChange}
          >
            {(item) => <Tag id={item.id}>{item.name}</Tag>}
          </TagList>
        </TagGroup>
      ));

      screen.getByRole("row", { name: "News" }).focus();
      await user.keyboard("{Control>}a{/Control}");
      const next = onSelectionChange.mock.calls.at(-1)?.[0];
      expect(next === "all" || (next instanceof Set && next.size === 4)).toBe(true);
    });

    it("drops Remove buttons when onRemove is cleared live", async () => {
      const [onRemove, setOnRemove] = createSignal<((keys: Set<string>) => void) | undefined>(
        vi.fn(),
      );
      render(() => (
        <TagGroup>
          <TagList items={sampleItems} aria-label="Test" onRemove={onRemove()}>
            {(item) => (
              <Tag id={item.id}>
                {(renderProps) => (
                  <>
                    {item.name}
                    {renderProps.allowsRemoving ? <TagRemoveButton /> : null}
                  </>
                )}
              </Tag>
            )}
          </TagList>
        </TagGroup>
      ));

      expect(document.querySelectorAll(".solidaria-TagRemoveButton").length).toBe(4);
      setOnRemove(undefined);
      await waitFor(() => {
        expect(document.querySelectorAll(".solidaria-TagRemoveButton").length).toBe(0);
      });
    });
  });
});
