import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { TagGroup } from "@proyecto-viviana/solid-spectrum";
import type { Key } from "@proyecto-viviana/solid-stately";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

type TagItem = {
  id: string;
  name: string;
};

const initialTags: TagItem[] = [
  { id: "react", name: "React" },
  { id: "solid", name: "SolidJS" },
  { id: "vue", name: "Vue" },
  { id: "svelte", name: "Svelte" },
  { id: "angular", name: "Angular" },
];

const categoryTags: TagItem[] = [
  { id: "frontend", name: "Frontend" },
  { id: "backend", name: "Backend" },
  { id: "devops", name: "DevOps" },
  { id: "design", name: "Design" },
  { id: "mobile", name: "Mobile" },
  { id: "data", name: "Data Science" },
];

const statusTags: TagItem[] = [
  { id: "active", name: "Active" },
  { id: "pending", name: "Pending" },
  { id: "archived", name: "Archived" },
  { id: "draft", name: "Draft" },
];

export const Route = createFileRoute("/solid-spectrum/docs/components/taggroup")({
  component: TagGroupPage,
});

function TagGroupPage() {
  const [removableTags, setRemovableTags] = createSignal<TagItem[]>(initialTags);
  const [selectedKeys, setSelectedKeys] = createSignal<Set<Key>>(new Set(["frontend"]));
  const [multiSelected, setMultiSelected] = createSignal<Set<Key>>(new Set(["active", "pending"]));

  function handleRemove(keys: Set<Key>) {
    setRemovableTags((prev) => prev.filter((tag) => !keys.has(tag.id)));
  }

  function resetTags() {
    setRemovableTags(initialTags);
  }

  return (
    <DocPage
      title="TagGroup"
      description="TagGroup displays a collection of tags that can be removable or selectable. Use tags to categorize content, filter results, or represent user selections."
      importCode={`import { TagGroup } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Removable Tags"
        description="Tags with a remove button. Click the remove icon on any tag to remove it from the list."
        code={`const [tags, setTags] = createSignal(initialTags);

<TagGroup
  label="Frameworks"
  items={tags()}
  onRemove={(keys) => {
    setTags(prev => prev.filter(t => !keys.has(t.id)));
  }}
>
  {(item) => item.name}
</TagGroup>`}
      >
        <div class="max-w-md space-y-3">
          <TagGroup label="Frameworks" items={removableTags()} onRemove={handleRemove}>
            {(item) => item.name}
          </TagGroup>
          {removableTags().length === 0 && (
            <p class="text-sm text-bg-400 italic">All tags removed</p>
          )}
          <div class="flex items-center gap-2">
            <p class="text-sm text-bg-500">
              {removableTags().length} tag{removableTags().length !== 1 ? "s" : ""} remaining
            </p>
            {removableTags().length < initialTags.length && (
              <button
                class="text-xs px-2 py-1 rounded bg-bg-100 text-bg-600 hover:bg-bg-200"
                onClick={resetTags}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </Example>

      <Example
        title="Selectable Tags"
        description="Tags that can be selected to filter or categorize content. Single selection mode allows picking one category."
        code={`<TagGroup
  label="Category"
  items={categories}
  selectionMode="single"
  selectedKeys={selectedKeys()}
  onSelectionChange={setSelectedKeys}
>
  {(item) => item.name}
</TagGroup>`}
      >
        <div class="max-w-md">
          <TagGroup
            label="Category"
            items={categoryTags}
            selectionMode="single"
            selectedKeys={selectedKeys()}
            onSelectionChange={(keys) => {
              if (keys === "all") {
                setSelectedKeys(new Set(categoryTags.map((t) => t.id)));
              } else {
                setSelectedKeys(new Set(keys));
              }
            }}
          >
            {(item) => item.name}
          </TagGroup>
          <p class="mt-2 text-sm text-bg-500">
            Selected: {selectedKeys().size > 0 ? [...selectedKeys()].join(", ") : "None"}
          </p>
        </div>
      </Example>

      <Example
        title="Multi-Select Tags"
        description="Multiple tags can be selected simultaneously for filtering by multiple criteria."
        code={`<TagGroup
  label="Status Filter"
  items={statuses}
  selectionMode="multiple"
  selectedKeys={multiSelected()}
  onSelectionChange={setMultiSelected}
>
  {(item) => item.name}
</TagGroup>`}
      >
        <div class="max-w-md">
          <TagGroup
            label="Status Filter"
            items={statusTags}
            selectionMode="multiple"
            selectedKeys={multiSelected()}
            onSelectionChange={(keys) => {
              if (keys === "all") {
                setMultiSelected(new Set(statusTags.map((t) => t.id)));
              } else {
                setMultiSelected(new Set(keys));
              }
            }}
          >
            {(item) => item.name}
          </TagGroup>
          <p class="mt-2 text-sm text-bg-500">
            Filtering by: {multiSelected().size > 0 ? [...multiSelected()].join(", ") : "All"}
          </p>
        </div>
      </Example>

      <Example
        title="Variants"
        description="Tags support different visual styles."
        code={`<TagGroup label="Default" items={tags} variant="default">{(item) => item.name}</TagGroup>
<TagGroup label="Outline" items={tags} variant="outline">{(item) => item.name}</TagGroup>
<TagGroup label="Solid" items={tags} variant="solid">{(item) => item.name}</TagGroup>`}
      >
        <div class="space-y-4 max-w-md">
          <TagGroup label="Default" items={statusTags.slice(0, 3)} variant="default">
            {(item) => item.name}
          </TagGroup>
          <TagGroup label="Outline" items={statusTags.slice(0, 3)} variant="outline">
            {(item) => item.name}
          </TagGroup>
          <TagGroup label="Solid" items={statusTags.slice(0, 3)} variant="solid">
            {(item) => item.name}
          </TagGroup>
        </div>
      </Example>

      <Example
        title="Sizes"
        description="Tags are available in different sizes."
        code={`<TagGroup label="Small" items={tags} size="sm">{(item) => item.name}</TagGroup>
<TagGroup label="Medium" items={tags} size="md">{(item) => item.name}</TagGroup>
<TagGroup label="Large" items={tags} size="lg">{(item) => item.name}</TagGroup>`}
      >
        <div class="space-y-4 max-w-md">
          <TagGroup label="Small" items={categoryTags.slice(0, 4)} size="sm">
            {(item) => item.name}
          </TagGroup>
          <TagGroup label="Medium (default)" items={categoryTags.slice(0, 4)} size="md">
            {(item) => item.name}
          </TagGroup>
          <TagGroup label="Large" items={categoryTags.slice(0, 4)} size="lg">
            {(item) => item.name}
          </TagGroup>
        </div>
      </Example>

      <PropsTable
        props={[
          {
            name: "items",
            type: "T[]",
            description: "Collection of tag items to display",
          },
          {
            name: "label",
            type: "string",
            description: "Visible label for the tag group",
          },
          {
            name: "onRemove",
            type: "(keys: Set<Key>) => void",
            description: "Handler called when tags are removed. Enables remove buttons on tags.",
          },
          {
            name: "selectionMode",
            type: "'none' | 'single' | 'multiple'",
            default: "'none'",
            description: "How tags can be selected",
          },
          {
            name: "selectedKeys",
            type: "Set<Key> | 'all'",
            description: "Currently selected tag keys (controlled)",
          },
          {
            name: "defaultSelectedKeys",
            type: "Iterable<Key>",
            description: "Default selected tag keys (uncontrolled)",
          },
          {
            name: "onSelectionChange",
            type: "(keys: Set<Key> | 'all') => void",
            description: "Handler called when selection changes",
          },
          {
            name: "variant",
            type: "'default' | 'outline' | 'solid'",
            default: "'default'",
            description: "Visual style of the tags",
          },
          {
            name: "size",
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: "Size of the tags",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether all tags are disabled",
          },
          {
            name: "disabledKeys",
            type: "Iterable<Key>",
            description: "Keys of disabled tags",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Uses <code>role="listbox"</code> with <code>role="option"</code> for each tag
          </li>
          <li>Arrow keys navigate between tags</li>
          <li>Delete or Backspace removes focused tag when removable</li>
          <li>Space or Enter toggles selection on focused tag</li>
          <li>Remove buttons have accessible labels like "Remove [tag name]"</li>
          <li>
            Group label is linked via <code>aria-labelledby</code>
          </li>
          <li>Selection state is announced to screen readers</li>
          <li>Focus moves to the next tag after removal</li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
