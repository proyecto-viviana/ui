import { For, Show, createSignal } from "solid-js";
import { GanttChart, type GanttRow } from "./GanttChart";
import { type DocsPayload, postRoadmapStatus } from "./api";

const ITEM_STATUSES = ["open", "in-progress", "blocked", "done"];

// High-level axis: roadmap items from roadmap.md, each expandable to the tasks
// that reference it (the two-level model — items are parents, tasks children).
export function RoadmapPanel(props: {
  data: DocsPayload;
  onOpenDoc: (path: string) => void;
  onChanged: () => void;
}) {
  const [expanded, setExpanded] = createSignal<Set<string>>(new Set());
  const [busy, setBusy] = createSignal<string | null>(null);

  const tasksFor = (itemId: string) => props.data.tasks.filter((task) => task.roadmap === itemId);

  const actualFor = (itemId: string) => {
    const finished = tasksFor(itemId)
      .map((task) => task.finished)
      .filter((date): date is string => !!date)
      .sort();
    const ongoing = tasksFor(itemId).some((task) => task.state === "in-progress");
    if (finished.length === 0 && !ongoing) return null;
    return {
      start: finished[0] ?? null,
      end: ongoing ? null : (finished[finished.length - 1] ?? null),
    };
  };

  const rows = (): GanttRow[] => {
    const out: GanttRow[] = [];
    for (const item of props.data.roadmap) {
      out.push({
        id: item.id,
        label: item.title,
        state: item.status,
        plan: item.window ? { start: item.window.start, end: item.window.target } : null,
        actual: actualFor(item.id),
      });
      if (expanded().has(item.id)) {
        for (const task of tasksFor(item.id)) {
          out.push({
            id: task.id,
            label: task.title,
            state: task.state,
            level: 1,
            plan: task.planned ? { start: task.planned.start, end: task.planned.target } : null,
            finished: task.finished,
          });
        }
      }
    }
    return out;
  };

  const toggle = (id: string) => {
    const next = new Set(expanded());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  const setStatus = async (id: string, status: string) => {
    setBusy(id);
    try {
      await postRoadmapStatus(id, status);
      props.onChanged();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div class="panel">
      <section class="card">
        <h2>Initiative timeline</h2>
        <GanttChart rows={rows()} />
      </section>

      <section class="card">
        <h2>Items</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th />
              <th>Initiative</th>
              <th>Status</th>
              <th>Window</th>
              <th>Tasks</th>
              <th>Docs</th>
            </tr>
          </thead>
          <tbody>
            <For each={props.data.roadmap}>
              {(item) => (
                <tr>
                  <td>
                    <button class="link" onClick={() => toggle(item.id)}>
                      {expanded().has(item.id) ? "▾" : "▸"}
                    </button>
                  </td>
                  <td>
                    <span class={`state-dot state-${item.status}`} />
                    {item.title}
                  </td>
                  <td>
                    <select
                      value={item.status}
                      disabled={busy() === item.id}
                      onChange={(event) => void setStatus(item.id, event.currentTarget.value)}
                    >
                      <For each={ITEM_STATUSES}>
                        {(status) => <option value={status}>{status}</option>}
                      </For>
                    </select>
                  </td>
                  <td class="muted">
                    {item.window?.start ?? "—"} → {item.window?.target ?? "—"}
                  </td>
                  <td>
                    {tasksFor(item.id).filter((task) => task.state === "done").length}/
                    {tasksFor(item.id).length}
                  </td>
                  <td>
                    <For each={item.docs}>
                      {(doc) => (
                        <button
                          class="link"
                          onClick={() => props.onOpenDoc(`.claude/current/${doc}`)}
                        >
                          {doc}
                        </button>
                      )}
                    </For>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
        <Show when={props.data.roadmap.length === 0}>
          <p class="muted">No items in .claude/current/roadmap.md frontmatter.</p>
        </Show>
        <p class="muted">
          The initiative axis (roadmap.md): high-level items, each expandable to the tasks that
          reference it.
        </p>
      </section>
    </div>
  );
}
