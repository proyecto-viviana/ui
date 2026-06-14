import { For, Show, createEffect, createMemo, createResource, createSignal, on } from "solid-js";
import { Markdown } from "./Markdown";
import {
  type DocEntry,
  type DocsPayload,
  type GitPayload,
  fetchDoc,
  postMarkReviewed,
  reviewQueue,
  saveDoc,
} from "./api";

const TIER_ORDER: DocEntry["tier"][] = ["current", "repo", "research", "archive"];
const TIER_LABEL: Record<DocEntry["tier"], string> = {
  current: "Current docs",
  repo: "Repo root",
  research: "Research (read-only)",
  archive: "Archive (read-only)",
};

export function DocsPanel(props: {
  data: DocsPayload;
  git: GitPayload | undefined;
  openPath: string | null;
  onOpenDoc: (path: string) => void;
  onChanged: () => void;
}) {
  const [filter, setFilter] = createSignal("");
  const [editing, setEditing] = createSignal(false);
  const [draft, setDraft] = createSignal("");
  const [saving, setSaving] = createSignal(false);
  const [collapsed, setCollapsed] = createSignal<Set<string>>(new Set(["research", "archive"]));

  const [doc, { refetch: refetchDoc }] = createResource(
    () => props.openPath,
    (path) => fetchDoc(path),
  );

  // Switching docs discards any in-flight draft.
  createEffect(
    on(
      () => props.openPath,
      () => setEditing(false),
    ),
  );

  const reviews = createMemo(() =>
    props.git
      ? new Map(
          reviewQueue(props.data.docs, props.git.docDates).map((entry) => [entry.path, entry]),
        )
      : null,
  );

  const tiers = createMemo(() => {
    const needle = filter().toLowerCase();
    return TIER_ORDER.map((tier) => ({
      tier,
      docs: props.data.docs.filter(
        (doc) => doc.tier === tier && (!needle || doc.path.toLowerCase().includes(needle)),
      ),
    })).filter((group) => group.docs.length > 0);
  });

  const toggleTier = (tier: string) => {
    const next = new Set(collapsed());
    if (next.has(tier)) next.delete(tier);
    else next.add(tier);
    setCollapsed(next);
  };

  const startEdit = () => {
    setDraft(doc()?.content ?? "");
    setEditing(true);
  };

  const save = async () => {
    if (!props.openPath) return;
    setSaving(true);
    try {
      await saveDoc(props.openPath, draft());
      setEditing(false);
      await refetchDoc();
      props.onChanged();
    } finally {
      setSaving(false);
    }
  };

  const markReviewed = async () => {
    if (!props.openPath) return;
    setSaving(true);
    try {
      await postMarkReviewed(props.openPath);
      await refetchDoc();
      props.onChanged();
    } finally {
      setSaving(false);
    }
  };

  const review = () => (props.openPath ? reviews()?.get(props.openPath) : undefined);

  return (
    <div class="panel docs-panel">
      <aside class="doc-tree">
        <input
          class="doc-filter"
          placeholder="filter docs…"
          value={filter()}
          onInput={(event) => setFilter(event.currentTarget.value)}
        />
        <For each={tiers()}>
          {(group) => (
            <div class="doc-tier">
              <button class="doc-tier-head" onClick={() => toggleTier(group.tier)}>
                {collapsed().has(group.tier) && !filter() ? "▸" : "▾"} {TIER_LABEL[group.tier]} (
                {group.docs.length})
              </button>
              <Show when={!collapsed().has(group.tier) || filter()}>
                <ul class="plain-list">
                  <For each={group.docs}>
                    {(entry) => {
                      const reviewState = () => reviews()?.get(entry.path)?.state;
                      return (
                        <li>
                          <button
                            class="doc-link"
                            classList={{ active: props.openPath === entry.path }}
                            title={entry.path}
                            onClick={() => props.onOpenDoc(entry.path)}
                          >
                            {entry.path.replace(/^\.claude\/(current|research|archive)\//, "")}
                            <Show when={reviewState() && reviewState() !== "ok"}>
                              <span class={`chip review-${reviewState()}`}>{reviewState()}</span>
                            </Show>
                          </button>
                        </li>
                      );
                    }}
                  </For>
                </ul>
              </Show>
            </div>
          )}
        </For>
      </aside>

      <div class="doc-view">
        <Show when={props.openPath} fallback={<p class="muted">Select a doc.</p>}>
          <div class="doc-toolbar">
            <code class="doc-path">{props.openPath}</code>
            <Show when={review()}>
              {(entry) => (
                <span class={`chip review-${entry().state}`}>
                  {entry().state === "ok"
                    ? `reviewed ${entry().lastReviewed}`
                    : entry().state === "stale"
                      ? `modified ${entry().lastModified} > reviewed ${entry().lastReviewed}`
                      : "never reviewed"}
                </span>
              )}
            </Show>
            <span class="spacer" />
            <Show when={doc()?.writable}>
              <button disabled={saving()} onClick={() => void markReviewed()}>
                Mark reviewed
              </button>
              <Show when={editing()} fallback={<button onClick={startEdit}>Edit</button>}>
                <button disabled={saving()} onClick={() => void save()}>
                  Save
                </button>
                <button disabled={saving()} onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </Show>
            </Show>
          </div>

          <Show when={doc()} fallback={<p class="muted">Loading…</p>}>
            {(loaded) => (
              <Show when={editing()} fallback={<Markdown content={loaded().content} />}>
                <div class="doc-editor">
                  <textarea
                    value={draft()}
                    onInput={(event) => setDraft(event.currentTarget.value)}
                    spellcheck={false}
                  />
                  <div class="doc-preview">
                    <Markdown content={draft()} />
                  </div>
                </div>
              </Show>
            )}
          </Show>
        </Show>
      </div>
    </div>
  );
}
