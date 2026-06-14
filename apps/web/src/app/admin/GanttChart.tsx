import { For, Show, createMemo } from "solid-js";

// Shared gantt for the roadmap (high-level items) and the task tracker
// (low-level tasks): plan lane = authored windows (outlined bar), actual lane =
// dates that really happened (solid bar / diamond at finish).

export interface GanttRow {
  id: string;
  label: string;
  state: string;
  level?: number;
  plan?: { start: string | null; end: string | null } | null;
  actual?: { start: string | null; end: string | null } | null;
  finished?: string | null;
}

const DAY = 24 * 60 * 60 * 1000;

function toMs(date: string | null | undefined): number | null {
  if (!date) return null;
  const ms = Date.parse(`${date}T00:00:00Z`);
  return Number.isNaN(ms) ? null : ms;
}

export function GanttChart(props: { rows: GanttRow[] }) {
  const todayMs = toMs(new Date().toISOString().slice(0, 10))!;

  const domain = createMemo(() => {
    let min = todayMs;
    let max = todayMs;
    for (const row of props.rows) {
      for (const ms of [
        toMs(row.plan?.start),
        toMs(row.plan?.end),
        toMs(row.actual?.start),
        toMs(row.actual?.end),
        toMs(row.finished),
      ]) {
        if (ms === null) continue;
        if (ms < min) min = ms;
        if (ms > max) max = ms;
      }
    }
    return { min: min - 2 * DAY, max: max + 3 * DAY };
  });

  const pct = (ms: number) => ((ms - domain().min) / (domain().max - domain().min)) * 100;

  const ticks = createMemo(() => {
    const { min, max } = domain();
    const spanDays = (max - min) / DAY;
    const step = spanDays > 90 ? "month" : "week";
    const out: { ms: number; label: string }[] = [];
    const cursor = new Date(min);
    cursor.setUTCHours(0, 0, 0, 0);
    if (step === "month") cursor.setUTCDate(1);
    else cursor.setUTCDate(cursor.getUTCDate() + ((8 - cursor.getUTCDay()) % 7));
    while (cursor.getTime() <= max) {
      out.push({ ms: cursor.getTime(), label: cursor.toISOString().slice(5, 10) });
      if (step === "month") cursor.setUTCMonth(cursor.getUTCMonth() + 1);
      else cursor.setUTCDate(cursor.getUTCDate() + 7);
    }
    return out;
  });

  const bar = (start: number | null, end: number | null) => {
    if (start === null && end === null) return null;
    const from = start ?? end!;
    const to = end ?? todayMs;
    return {
      left: `${pct(Math.min(from, to))}%`,
      width: `${Math.max(Math.abs(pct(to) - pct(from)), 0.4)}%`,
    };
  };

  return (
    <div class="gantt">
      <div class="gantt-row gantt-axis">
        <div class="gantt-label" />
        <div class="gantt-track">
          <For each={ticks()}>
            {(tick) => (
              <span class="gantt-tick" style={{ left: `${pct(tick.ms)}%` }}>
                {tick.label}
              </span>
            )}
          </For>
        </div>
      </div>
      <For each={props.rows}>
        {(row) => {
          const plan = bar(toMs(row.plan?.start), toMs(row.plan?.end));
          const actual = bar(toMs(row.actual?.start), toMs(row.actual?.end));
          const finishedMs = toMs(row.finished);
          return (
            <div class="gantt-row" classList={{ "gantt-sub": (row.level ?? 0) > 0 }}>
              <div class="gantt-label" title={row.label}>
                <span class={`state-dot state-${row.state}`} />
                {row.label}
              </div>
              <div class="gantt-track">
                <span class="gantt-today" style={{ left: `${pct(todayMs)}%` }} />
                <Show when={plan}>{(style) => <span class="gantt-plan" style={style()} />}</Show>
                <Show when={actual}>
                  {(style) => <span class={`gantt-actual state-${row.state}`} style={style()} />}
                </Show>
                <Show when={finishedMs !== null}>
                  <span
                    class="gantt-finish"
                    style={{ left: `${pct(finishedMs!)}%` }}
                    title={row.finished!}
                  />
                </Show>
                <Show when={!plan && !actual && finishedMs === null}>
                  <span class="gantt-unscheduled">unscheduled</span>
                </Show>
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
}
