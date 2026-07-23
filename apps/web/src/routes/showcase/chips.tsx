/* Panel 06 — Chips & Badges. Compact identity: badges, tags, chip rows.
   Chips are wells, not gray steps — see badge/tag-group source comments for
   the register's rationale. Green now lives here for one reason only: the
   semantic success channel, shown as the negative/warning/success trio. */
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, For } from "solid-js";
import { Badge, Tag, TagGroup } from "@proyecto-viviana/ui";
import { Demo, Panel, Row } from "@/components/showcase/chrome";
import { panelBySlug } from "@/components/showcase/registry";

export const Route = createFileRoute("/showcase/chips")({
  component: Page,
});

// The by-name colour swatches only. The semantic success/positive green rides
// its own trio demo above; the by-name green-adjacent tones (green, chartreuse,
// celery, seafoam, turquoise) stay out of this swatch row so green reads as the
// success channel, not one more decorative hue.
const BADGE_VARIANTS = [
  "accent",
  "informative",
  "neutral",
  "notice",
  "negative",
  "live",
  "metric",
  "gray",
  "red",
  "orange",
  "yellow",
  "blue",
  "purple",
  "magenta",
] as const;

const BADGE_SIZES = ["S", "M", "L", "XL"] as const;

interface ChipItem {
  id: string;
  name: string;
}

const CATEGORY_ITEMS: ChipItem[] = [
  { id: "landscape", name: "Landscape" },
  { id: "portrait", name: "Portrait" },
  { id: "travel", name: "Travel" },
  { id: "night", name: "Night" },
];

function Page() {
  const def = panelBySlug("chips")!;
  const [removableItems, setRemovableItems] = createSignal<ChipItem[]>([
    { id: "beta", name: "Beta" },
    { id: "draft", name: "Draft" },
    { id: "archived", name: "Archived" },
  ]);

  return (
    <Panel def={def}>
      <Demo label="Badge · the register's status run — LIVE pulses; NEW/DUE/DEGRADED are one-channel outlines; the streak chip is same-channel subtle">
        <Row>
          <Badge variant="live">● LIVE</Badge>
          <Badge variant="metric" fillStyle="outline">
            NEW
          </Badge>
          <Badge variant="notice" fillStyle="outline">
            DUE
          </Badge>
          <Badge variant="negative" fillStyle="outline">
            0x3F DEGRADED
          </Badge>
          <Badge variant="notice" fillStyle="subtle">
            12-day streak
          </Badge>
        </Row>
      </Demo>

      <Demo label="Badge · semantic trio — negative / warning / success, success is the cohesive green">
        <Row>
          <Badge variant="negative">Negative</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="success">Success</Badge>
        </Row>
      </Demo>

      <Demo label="Badge · variants — bold fill, by-name colours (green-adjacent tones skipped)">
        <Row>
          <For each={BADGE_VARIANTS}>
            {(variant) => (
              <Badge variant={variant}>{variant.charAt(0).toUpperCase() + variant.slice(1)}</Badge>
            )}
          </For>
        </Row>
      </Demo>

      <Demo label="Badge · fill styles">
        <Row>
          <Badge variant="accent" fillStyle="bold">
            Bold
          </Badge>
          <Badge variant="accent" fillStyle="subtle">
            Subtle
          </Badge>
          <Badge variant="accent" fillStyle="outline">
            Outline
          </Badge>
        </Row>
      </Demo>

      <Demo label="Badge · sizes">
        <Row>
          <For each={BADGE_SIZES}>{(size) => <Badge size={size}>{size}</Badge>}</For>
        </Row>
      </Demo>

      <Demo label="Badge · count">
        <Row>
          <Badge variant="informative" count={3} />
          <Badge variant="negative" count={42} />
        </Row>
      </Demo>

      <Demo label="TagGroup · basic — arrow-key grid navigation">
        <TagGroup<ChipItem> items={CATEGORY_ITEMS} label="Categories" defaultSelectedKeys={["landscape"]}>
          {(item) => item.name}
        </TagGroup>
      </Demo>

      <Demo label="TagGroup · removable — onRemove drops the tag from state">
        <TagGroup<ChipItem>
          items={removableItems()}
          label="Labels"
          onRemove={(keys) => setRemovableItems((prev) => prev.filter((item) => !keys.has(item.id)))}
        >
          {(item) => item.name}
        </TagGroup>
      </Demo>

      <Demo label="TagGroup · disabled tags">
        <TagGroup<ChipItem> items={CATEGORY_ITEMS} label="Some disabled" disabledKeys={["travel", "night"]}>
          {(item) => item.name}
        </TagGroup>
      </Demo>

      <Demo label="TagGroup · sizes">
        <Row>
          <TagGroup<ChipItem> items={CATEGORY_ITEMS.slice(0, 2)} label="Small" size="S">
            {(item) => item.name}
          </TagGroup>
          <TagGroup<ChipItem> items={CATEGORY_ITEMS.slice(0, 2)} label="Medium" size="M">
            {(item) => item.name}
          </TagGroup>
          <TagGroup<ChipItem> items={CATEGORY_ITEMS.slice(0, 2)} label="Large" size="L">
            {(item) => item.name}
          </TagGroup>
        </Row>
      </Demo>

      <Demo label="Tag · explicit composition">
        <TagGroup<ChipItem> items={CATEGORY_ITEMS.slice(0, 3)} label="Explicit tags" selectionMode="none">
          {(item) => <Tag id={item.id}>{item.name}</Tag>}
        </TagGroup>
      </Demo>
    </Panel>
  );
}
