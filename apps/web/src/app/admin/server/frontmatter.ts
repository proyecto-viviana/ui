import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

// Pure frontmatter parse/rewrite for the /admin dashboard (dev tooling — see
// the AGENTS.md tooling exemption). Rewrites must preserve the document body
// byte-for-byte; only the frontmatter block between the `---` fences changes.

export type TaskState = "open" | "next" | "in-progress" | "done" | "blocked";

export interface DateWindow {
  start: string | null;
  target: string | null;
}

export interface DocTask {
  id: string;
  title: string;
  state: TaskState;
  depends: string[];
  roadmap: string | null;
  planned: DateWindow | null;
  finished: string | null;
}

export interface RoadmapItem {
  id: string;
  title: string;
  status: string;
  window: DateWindow | null;
  docs: string[];
}

export interface SplitDoc {
  data: Record<string, unknown> | null;
  body: string;
}

const FM_FENCE = /^---\n([\s\S]*?)\n---\n/;

export function splitFrontmatter(content: string): SplitDoc {
  const match = FM_FENCE.exec(content);
  if (!match) return { data: null, body: content };
  let data: unknown;
  try {
    data = parseYaml(match[1]);
  } catch {
    return { data: null, body: content };
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return { data: null, body: content };
  }
  return { data: data as Record<string, unknown>, body: content.slice(match[0].length) };
}

export function replaceFrontmatter(content: string, data: Record<string, unknown>): string {
  const { body } = splitFrontmatter(content);
  return `---\n${stringifyYaml(data)}---\n${body}`;
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asWindow(value: unknown): DateWindow | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  return { start: asString(record.start), target: asString(record.target) };
}

const TASK_STATES: TaskState[] = ["open", "next", "in-progress", "done", "blocked"];

export function extractTasks(data: Record<string, unknown> | null): DocTask[] {
  if (!data || !Array.isArray(data.tasks)) return [];
  const tasks: DocTask[] = [];
  for (const entry of data.tasks) {
    if (typeof entry !== "object" || entry === null) continue;
    const record = entry as Record<string, unknown>;
    const id = asString(record.id);
    if (!id) continue;
    const state = asString(record.state);
    tasks.push({
      id,
      title: asString(record.title) ?? id,
      state: TASK_STATES.includes(state as TaskState) ? (state as TaskState) : "open",
      depends: Array.isArray(record.depends)
        ? record.depends.filter((d) => typeof d === "string")
        : [],
      roadmap: asString(record.roadmap),
      planned: asWindow(record.planned),
      finished: asString(record.finished),
    });
  }
  return tasks;
}

export function extractRoadmapItems(data: Record<string, unknown> | null): RoadmapItem[] {
  if (!data || !Array.isArray(data.items)) return [];
  const items: RoadmapItem[] = [];
  for (const entry of data.items) {
    if (typeof entry !== "object" || entry === null) continue;
    const record = entry as Record<string, unknown>;
    const id = asString(record.id);
    if (!id) continue;
    items.push({
      id,
      title: asString(record.title) ?? id,
      status: asString(record.status) ?? "open",
      window: asWindow(record.window),
      docs: Array.isArray(record.docs) ? record.docs.filter((d) => typeof d === "string") : [],
    });
  }
  return items;
}

/** Returns the rewritten document, or null when the task id is absent. */
export function setTaskState(
  content: string,
  taskId: string,
  state: TaskState,
  today: string,
): string | null {
  const { data } = splitFrontmatter(content);
  if (!data || !Array.isArray(data.tasks)) return null;
  const task = data.tasks.find(
    (entry): entry is Record<string, unknown> =>
      typeof entry === "object" &&
      entry !== null &&
      (entry as Record<string, unknown>).id === taskId,
  );
  if (!task) return null;
  task.state = state;
  if (state === "done") task.finished = today;
  else delete task.finished;
  return replaceFrontmatter(content, data);
}

/** Returns the rewritten document, or null when the item id is absent. */
export function setRoadmapItemStatus(
  content: string,
  itemId: string,
  status: string,
): string | null {
  const { data } = splitFrontmatter(content);
  if (!data || !Array.isArray(data.items)) return null;
  const item = data.items.find(
    (entry): entry is Record<string, unknown> =>
      typeof entry === "object" &&
      entry !== null &&
      (entry as Record<string, unknown>).id === itemId,
  );
  if (!item) return null;
  item.status = status;
  return replaceFrontmatter(content, data);
}

/** Stamps last_reviewed. Docs without frontmatter gain a minimal block. */
export function markReviewed(content: string, date: string): string {
  const { data } = splitFrontmatter(content);
  return replaceFrontmatter(content, { ...data, last_reviewed: date });
}
