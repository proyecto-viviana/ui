import { For, Show } from "solid-js";
import { type DocsPayload, type GitPayload, reviewQueue } from "./api";

const STATE_ORDER = ["in-progress", "next", "blocked", "open", "done"] as const;

export function HomePanel(props: {
  data: DocsPayload;
  git: GitPayload | undefined;
  onOpenDoc: (path: string) => void;
}) {
  const counts = () => {
    const out: Record<string, number> = {};
    for (const task of props.data.tasks) out[task.state] = (out[task.state] ?? 0) + 1;
    return out;
  };
  const queue = () => (props.git ? reviewQueue(props.data.docs, props.git.docDates) : []);
  const pendingReviews = () => queue().filter((entry) => entry.state !== "ok");
  const activeTasks = () =>
    props.data.tasks.filter((task) => task.state === "in-progress" || task.state === "next");

  return (
    <div class="panel home-panel">
      <Show
        when={props.data.problems.length > 0}
        fallback={<div class="tracking-ok">tracking consistent — docs:check green</div>}
      >
        <section class="card problems-strip">
          <h2>Tracking problems ({props.data.problems.length})</h2>
          <ul class="plain-list">
            <For each={props.data.problems}>
              {(problem) => (
                <li>
                  <button class="link" onClick={() => props.onOpenDoc(problem.doc)}>
                    {problem.doc.replace(".claude/current/", "")}
                  </button>{" "}
                  — {problem.message}
                </li>
              )}
            </For>
          </ul>
        </section>
      </Show>
      <section class="cards">
        <For each={STATE_ORDER}>
          {(state) => (
            <div class={`card stat state-bg-${state}`}>
              <div class="stat-num">{counts()[state] ?? 0}</div>
              <div class="stat-label">{state}</div>
            </div>
          )}
        </For>
        <div class="card stat">
          <div class="stat-num">{pendingReviews().length}</div>
          <div class="stat-label">docs to review</div>
        </div>
      </section>

      <div class="columns">
        <section class="card">
          <h2>In flight / next</h2>
          <ul class="plain-list">
            <For each={activeTasks()}>
              {(task) => (
                <li>
                  <span class={`state-dot state-${task.state}`} />
                  <button class="link" onClick={() => props.onOpenDoc(task.doc)}>
                    {task.title}
                  </button>
                  <Show when={task.roadmap}>
                    <span class="chip">{task.roadmap}</span>
                  </Show>
                </li>
              )}
            </For>
            <Show when={activeTasks().length === 0}>
              <li class="muted">nothing marked in-progress or next</li>
            </Show>
          </ul>
        </section>

        <section class="card">
          <h2>Review queue</h2>
          <ul class="plain-list">
            <For each={pendingReviews().slice(0, 10)}>
              {(entry) => (
                <li>
                  <span class={`chip review-${entry.state}`}>{entry.state}</span>
                  <button class="link" onClick={() => props.onOpenDoc(entry.path)}>
                    {entry.title}
                  </button>
                </li>
              )}
            </For>
            <Show when={pendingReviews().length === 0}>
              <li class="muted">all current docs reviewed</li>
            </Show>
          </ul>
        </section>

        <section class="card">
          <h2>Recent commits</h2>
          <ul class="plain-list commits">
            <For each={props.git?.recent.slice(0, 15) ?? []}>
              {(commit) => (
                <li>
                  <code>{commit.hash}</code> <span class="muted">{commit.date}</span>{" "}
                  {commit.subject}
                </li>
              )}
            </For>
          </ul>
        </section>
      </div>
    </div>
  );
}
