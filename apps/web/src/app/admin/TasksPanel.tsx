import { For, Show, createSignal } from "solid-js";
import { type DocsPayload, type TicketStatus, postTicketBlocked, postTicketStatus } from "./api";

const TICKET_STATUSES: TicketStatus[] = ["open", "next", "in-progress", "merged", "verified"];
const GROUP_ORDER: TicketStatus[] = ["in-progress", "next", "open", "merged", "verified"];

export function TasksPanel(props: {
  data: DocsPayload;
  onOpenDoc: (path: string) => void;
  onChanged: () => void;
}) {
  const [busy, setBusy] = createSignal<string | null>(null);

  const grouped = () =>
    GROUP_ORDER.map((status) => ({
      status,
      tasks: props.data.tasks.filter((task) => task.status === status),
    })).filter((group) => group.tasks.length > 0);

  const setStatus = async (path: string, ticketId: number, status: TicketStatus) => {
    setBusy(`status-${ticketId}`);
    try {
      await postTicketStatus(path, ticketId, status);
      props.onChanged();
    } finally {
      setBusy(null);
    }
  };

  const setBlocked = async (path: string, ticketId: number, blocked: boolean) => {
    setBusy(`blocked-${ticketId}`);
    try {
      await postTicketBlocked(path, ticketId, blocked);
      props.onChanged();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div class="panel">
      <For each={grouped()}>
        {(group) => (
          <section class="card">
            <h2>
              <span class={`state-dot state-${group.status}`} /> {group.status} (
              {group.tasks.length})
            </h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Blocked</th>
                  <th>Parent</th>
                  <th>Created</th>
                  <th>File</th>
                </tr>
              </thead>
              <tbody>
                <For each={group.tasks}>
                  {(task) => (
                    <tr>
                      <td>#{task.id}</td>
                      <td>{task.title}</td>
                      <td>
                        <select
                          value={task.status}
                          disabled={busy() === `status-${task.id}`}
                          aria-label={`Set #${task.id} status`}
                          onChange={(event) =>
                            void setStatus(
                              task.path,
                              task.id,
                              event.currentTarget.value as TicketStatus,
                            )
                          }
                        >
                          <For each={TICKET_STATUSES}>
                            {(status) => <option value={status}>{status}</option>}
                          </For>
                        </select>
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={task.blocked}
                          disabled={busy() === `blocked-${task.id}`}
                          aria-label={`Set #${task.id} blocked`}
                          onChange={(event) =>
                            void setBlocked(task.path, task.id, event.currentTarget.checked)
                          }
                        />
                      </td>
                      <td class="muted">{task.parent === null ? "—" : `#${task.parent}`}</td>
                      <td class="muted">{task.created}</td>
                      <td>
                        <button class="link" onClick={() => props.onOpenDoc(task.path)}>
                          {task.path.split("/").pop()}
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
        <p class="muted">No task tickets exist in .claude/tickets/tasks.</p>
      </Show>
    </div>
  );
}
