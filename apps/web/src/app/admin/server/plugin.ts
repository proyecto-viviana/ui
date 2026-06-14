import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import {
  collectDocs,
  collectGit,
  collectPackages,
  isWritablePath,
  readDoc,
  today,
  writeDoc,
} from "./data";
import { type TaskState, markReviewed, setRoadmapItemStatus, setTaskState } from "./frontmatter";

// /api/admin is served by this dev-server middleware in the plain Node process,
// NOT a TanStack server route: the ssr environment runs inside the Cloudflare
// workerd emulation, which has no repo filesystem and no child_process. The
// middleware only exists under `vite dev` (apply: 'serve' + configureServer),
// so none of this can ship to production. See .claude/current/admin-dashboard.md
// and the AGENTS.md tooling exemption.

const ROADMAP_PATH = ".claude/current/roadmap.md";
const TASK_STATES: TaskState[] = ["open", "next", "in-progress", "done", "blocked"];

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function badRequest(res: ServerResponse, error: string): void {
  sendJson(res, 400, { error });
}

function notFound(res: ServerResponse): void {
  sendJson(res, 404, { error: "not found" });
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown> | null> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  try {
    const body: unknown = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
    if (typeof body !== "object" || body === null) return null;
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

function rewriteDoc(
  res: ServerResponse,
  path: unknown,
  rewrite: (content: string) => string | null,
): void {
  if (typeof path !== "string" || !isWritablePath(path)) {
    badRequest(res, "not a writable doc path");
    return;
  }
  const content = readDoc(path);
  if (content === null) {
    notFound(res);
    return;
  }
  const rewritten = rewrite(content);
  if (rewritten === null) {
    badRequest(res, "target not found in frontmatter");
    return;
  }
  if (!writeDoc(path, rewritten)) {
    badRequest(res, "write failed");
    return;
  }
  sendJson(res, 200, { ok: true, path });
}

async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  // Mounted at /api/admin, so connect has already stripped that prefix.
  const url = decodeURIComponent((req.url ?? "").split("?")[0]).replace(/^\//, "");

  if (req.method === "GET") {
    if (!url || url === "docs") return sendJson(res, 200, collectDocs());
    if (url === "git") return sendJson(res, 200, collectGit());
    if (url === "packages") return sendJson(res, 200, { packages: collectPackages() });
    if (url.startsWith("doc/")) {
      const path = url.slice("doc/".length);
      const content = readDoc(path);
      if (content === null) return notFound(res);
      return sendJson(res, 200, { path, content, writable: isWritablePath(path) });
    }
    return notFound(res);
  }

  if (req.method === "PUT") {
    if (!url.startsWith("doc/")) return notFound(res);
    const path = url.slice("doc/".length);
    const body = await readJsonBody(req);
    if (!body || typeof body.content !== "string") {
      return badRequest(res, "expected { content: string }");
    }
    if (!writeDoc(path, body.content)) return badRequest(res, "not a writable doc path");
    return sendJson(res, 200, { ok: true, path });
  }

  if (req.method === "POST") {
    const body = await readJsonBody(req);
    if (!body) return badRequest(res, "expected a JSON body");

    if (url === "task-state") {
      const { path, taskId, state } = body;
      if (typeof taskId !== "string" || !TASK_STATES.includes(state as TaskState)) {
        return badRequest(res, "expected { path, taskId, state }");
      }
      return rewriteDoc(res, path, (content) =>
        setTaskState(content, taskId, state as TaskState, today()),
      );
    }

    if (url === "roadmap-status") {
      const { id, status } = body;
      if (typeof id !== "string" || typeof status !== "string") {
        return badRequest(res, "expected { id, status }");
      }
      return rewriteDoc(res, ROADMAP_PATH, (content) => setRoadmapItemStatus(content, id, status));
    }

    if (url === "mark-reviewed") {
      return rewriteDoc(res, body.path, (content) => markReviewed(content, today()));
    }

    return notFound(res);
  }

  return notFound(res);
}

export function adminApiPlugin(): Plugin {
  return {
    name: "viviana:admin-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/admin", (req, res) => {
        handle(req, res).catch((error: unknown) => {
          sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
        });
      });
    },
  };
}
