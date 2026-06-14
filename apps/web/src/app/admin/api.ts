import type { DocTask, RoadmapItem, TaskState } from "./server/frontmatter";
import type { Problem } from "./server/validate";

// Client-side fetch helpers for the dev-only /admin API. Types are shared with
// the server module via type-only imports (no Node code reaches the client).

export type { DocTask, Problem, RoadmapItem, TaskState };

export interface DocEntry {
  path: string;
  tier: "current" | "research" | "archive" | "repo";
  writable: boolean;
  title: string;
  frontmatter: Record<string, unknown> | null;
}

export interface DocsPayload {
  docs: DocEntry[];
  tasks: (DocTask & { doc: string })[];
  roadmap: RoadmapItem[];
  problems: Problem[];
}

export interface GitPayload {
  recent: { hash: string; date: string; subject: string }[];
  docDates: Record<string, string>;
}

export interface PackageInfo {
  name: string;
  description: string | null;
  manifestDir: string;
  deps: string[];
}

export interface DocContent {
  path: string;
  content: string;
  writable: boolean;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return (await response.json()) as T;
}

async function sendJson<T>(url: string, method: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return (await response.json()) as T;
}

export const fetchDocs = () => getJson<DocsPayload>("/api/admin/docs");
export const fetchGit = () => getJson<GitPayload>("/api/admin/git");
export const fetchPackages = () => getJson<{ packages: PackageInfo[] }>("/api/admin/packages");
export const fetchDoc = (path: string) => getJson<DocContent>(`/api/admin/doc/${path}`);

export const saveDoc = (path: string, content: string) =>
  sendJson<{ ok: boolean }>(`/api/admin/doc/${path}`, "PUT", { content });

export const postTaskState = (path: string, taskId: string, state: TaskState) =>
  sendJson<{ ok: boolean }>("/api/admin/task-state", "POST", { path, taskId, state });

export const postRoadmapStatus = (id: string, status: string) =>
  sendJson<{ ok: boolean }>("/api/admin/roadmap-status", "POST", { id, status });

export const postMarkReviewed = (path: string) =>
  sendJson<{ ok: boolean }>("/api/admin/mark-reviewed", "POST", { path });

// --- Review queue derivation ---

export type ReviewState = "never" | "stale" | "ok";

export interface ReviewEntry {
  path: string;
  title: string;
  state: ReviewState;
  lastReviewed: string | null;
  lastModified: string | null;
}

export function reviewQueue(docs: DocEntry[], docDates: Record<string, string>): ReviewEntry[] {
  const entries: ReviewEntry[] = [];
  for (const doc of docs) {
    if (doc.tier !== "current") continue;
    const lastReviewed =
      typeof doc.frontmatter?.last_reviewed === "string" ? doc.frontmatter.last_reviewed : null;
    const lastModified = docDates[doc.path] ?? null;
    let state: ReviewState = "ok";
    if (!lastReviewed) state = "never";
    else if (lastModified && lastModified > lastReviewed) state = "stale";
    entries.push({ path: doc.path, title: doc.title, state, lastReviewed, lastModified });
  }
  const rank: Record<ReviewState, number> = { never: 0, stale: 1, ok: 2 };
  return entries.sort(
    (a, b) =>
      rank[a.state] - rank[b.state] || (a.lastReviewed ?? "").localeCompare(b.lastReviewed ?? ""),
  );
}
