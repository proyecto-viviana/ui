import { For, Show, createSignal } from "solid-js";
import { GanttChart, type GanttRow } from "./GanttChart";
import { type DocsPayload, type TaskState, postTaskState } from "./api";

const TASK_STATES: TaskState[] = ["open", "next", "in-progress", "done", "blocked"];
const GROUP_ORDER: TaskState[] = ["in-progress", "next", "blocked", "open", "done"];

// Low-level axis: every `tasks:` entry across the current docs, grouped by
// state, with the same gantt component the roadmap uses.
export function TasksPanel(props: {
  data: DocsPayload;
  onOpenDoc: (path: string) => void;
  onChanged: () => void;
}) {
  const [busy, setBusy] = createSignal<string | null>(null);

  const rows = (): GanttRow[] =>
    props.data.tasks
      .filter((task) => task.planned || task.finished || task.state === "in-progress")
      .map((task) => ({
        id: task.id,
        label: task.title,
        state: task.state,
        plan: task.planned ? { start: task.planned.start, end: task.planned.target } : null,
        finished: task.finished,
      }));

  const grouped = () =>
    GROUP_ORDER.map((state) => ({
      state,
      tasks: props.data.tasks.filter((task) => task.state === state),
    })).filter((group) => group.tasks.length > 0);

  const setState = async (doc: string, taskId: string, state: TaskState) => {
    setBusy(taskId);
    try {
      await postTaskState(doc, taskId, state);
      props.onChanged();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div class="panel">
      <section class="card">
        <h2>Task timeline</h2>
        <GanttChart rows={rows()} />
      </section>

      <For each={grouped()}>
        {(group) => (
          <section class="card">
            <h2>
              <span class={`state-dot state-${group.state}`} /> {group.state} ({group.tasks.length})
            </h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>State</th>
                  <th>Initiative</th>
                  <th>Depends</th>
                  <th>Planned</th>
                  <th>Finished</th>
                  <th>Doc</th>
                </tr>
              </thead>
              <tbody>
                <For each={group.tasks}>
                  {(task) => (
                    <tr>
                      <td>{task.title}</td>
                      <td>
                        <select
                          value={task.state}
                          disabled={busy() === task.id}
                          onChange={(event) =>
                            void setState(task.doc, task.id, event.currentTarget.value as TaskState)
                          }
                        >
                          <For each={TASK_STATES}>
                            {(state) => <option value={state}>{state}</option>}
                          </For>
                        </select>
                      </td>
                      <td>
                        <Show when={task.roadmap} fallback={<span class="muted">—</span>}>
                          <span class="chip">{task.roadmap}</span>
                        </Show>
                      </td>
                      <td class="muted">{task.depends.join(", ") || "—"}</td>
                      <td class="muted">
                        {task.planned
                          ? `${task.planned.start ?? "—"} → ${task.planned.target ?? "—"}`
                          : "—"}
                      </td>
                      <td class="muted">{task.finished ?? "—"}</td>
                      <td>
                        <button class="link" onClick={() => props.onOpenDoc(task.doc)}>
                          {task.doc.split("/").pop()}
                        </button>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </section>
        )}
      </For>

      <Show when={props.data.tasks.length === 0}>
        <p class="muted">No tasks: add `tasks:` frontmatter to a current-tier doc.</p>
      </Show>
    </div>
  );
}
