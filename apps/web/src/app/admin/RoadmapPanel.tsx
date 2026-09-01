import { For, Show, createSignal } from "solid-js";
import { type DocsPayload, type TicketStatus, postTicketBlocked, postTicketStatus } from "./api";

const TICKET_STATUSES: TicketStatus[] = ["open", "next", "in-progress", "merged", "verified"];

export function RoadmapPanel(props: {
  data: DocsPayload;
  onOpenDoc: (path: string) => void;
  onChanged: () => void;
}) {
  const [busy, setBusy] = createSignal<string | null>(null);

  const items = () =>
    [...props.data.roadmap].sort(
      (a, b) => Number(b.type === "milestone") - Number(a.type === "milestone") || a.id - b.id,
    );
  const childrenFor = (id: number) => [
    ...props.data.roadmap.filter((item) => item.parent === id),
    ...props.data.tasks.filter((task) => task.parent === id),
  ];

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
      <section class="card">
        <h2>Roadmap tickets</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Type</th>
              <th>Title</th>
              <th>Status</th>
              <th>Blocked</th>
              <th>Parent</th>
              <th>Children</th>
              <th>File</th>
            </tr>
          </thead>
          <tbody>
            <For each={items()}>
              {(item) => (
                <tr>
                  <td>#{item.id}</td>
                  <td>{item.type}</td>
                  <td>
                    <span class={`state-dot state-${item.status}`} />
                    {item.title}
                  </td>
                  <td>
                    <select
                      value={item.status}
                      disabled={busy() === `status-${item.id}`}
                      aria-label={`Set #${item.id} status`}
                      onChange={(event) =>
                        void setStatus(
                          item.path,
                          item.id,
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
                      checked={item.blocked}
                      disabled={busy() === `blocked-${item.id}`}
                      aria-label={`Set #${item.id} blocked`}
                      onChange={(event) =>
                        void setBlocked(item.path, item.id, event.currentTarget.checked)
                      }
                    />
                  </td>
                  <td class="muted">{item.parent === null ? "—" : `#${item.parent}`}</td>
                  <td class="muted">{childrenFor(item.id).length}</td>
                  <td>
                    <button class="link" onClick={() => props.onOpenDoc(item.path)}>
                      {item.path.split("/").pop()}
                    </button>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
        <Show when={items().length === 0}>
          <p class="muted">
            No initiative or milestone tickets exist. The task board remains available.
          </p>
        </Show>
      </section>
    </div>
  );
}
