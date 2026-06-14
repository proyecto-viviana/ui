import type { DateWindow, DocTask, RoadmapItem, TaskState } from "./frontmatter";

// Tracking-integrity validator for the work model: tasks in doc frontmatter must
// link to real roadmap items, states must be honest (done <=> finished), and
// in-progress roadmap items must have tasks. Pure module — runs both in the
// docs:check gate (fails it) and in the /admin API payload (renders as the Home
// problems strip). See .claude/current/admin-dashboard.md "Tracking contract".

export interface Problem {
  doc: string;
  message: string;
}

export interface TrackingInput {
  docs: { path: string; tier: string; frontmatter: Record<string, unknown> | null }[];
  tasks: (DocTask & { doc: string })[];
  roadmap: RoadmapItem[];
}

const ROADMAP_DOC = ".claude/current/roadmap.md";
const TASK_STATES: TaskState[] = ["open", "next", "in-progress", "done", "blocked"];
const ITEM_STATUSES = ["open", "in-progress", "blocked", "done"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function checkWindow(
  doc: string,
  label: string,
  window: DateWindow | null,
  problems: Problem[],
): void {
  if (!window) return;
  for (const [field, value] of [
    ["start", window.start],
    ["target", window.target],
  ] as const) {
    if (value !== null && !DATE_RE.test(value)) {
      problems.push({ doc, message: `${label} ${field} "${value}" is not YYYY-MM-DD` });
    }
  }
  if (
    window.start !== null &&
    window.target !== null &&
    DATE_RE.test(window.start) &&
    DATE_RE.test(window.target) &&
    window.start > window.target
  ) {
    problems.push({
      doc,
      message: `${label} start ${window.start} is after target ${window.target}`,
    });
  }
}

/** Catches what extractTasks silently coerces: entries without an id, state typos. */
function checkRawTasks(
  doc: string,
  frontmatter: Record<string, unknown> | null,
  problems: Problem[],
): void {
  if (!frontmatter || !Array.isArray(frontmatter.tasks)) return;
  frontmatter.tasks.forEach((entry, index) => {
    if (typeof entry !== "object" || entry === null) {
      problems.push({ doc, message: `tasks[${index}] is not a map` });
      return;
    }
    const record = entry as Record<string, unknown>;
    const id = typeof record.id === "string" ? record.id : null;
    if (!id) {
      problems.push({ doc, message: `tasks[${index}] has no id` });
    }
    if (typeof record.state !== "string" || !TASK_STATES.includes(record.state as TaskState)) {
      problems.push({
        doc,
        message: `task "${id ?? `tasks[${index}]`}" has invalid state ${JSON.stringify(
          record.state ?? null,
        )} (expected ${TASK_STATES.join("|")})`,
      });
    }
  });
}

export function validateTracking(input: TrackingInput): Problem[] {
  const problems: Problem[] = [];
  const docPaths = new Set(input.docs.map((doc) => doc.path));
  const itemIds = new Set(input.roadmap.map((item) => item.id));
  const taskIds = new Set(input.tasks.map((task) => task.id));

  for (const doc of input.docs) {
    if (doc.tier !== "current") continue;
    const fm = doc.frontmatter;
    if (!fm || typeof fm.kind !== "string" || typeof fm.status !== "string") {
      problems.push({ doc: doc.path, message: "missing baseline frontmatter (kind + status)" });
    }
    checkRawTasks(doc.path, fm, problems);
  }

  const seenTaskIds = new Map<string, string>();
  for (const task of input.tasks) {
    const firstDoc = seenTaskIds.get(task.id);
    if (firstDoc) {
      problems.push({
        doc: task.doc,
        message: `duplicate task id "${task.id}" (also in ${firstDoc})`,
      });
    } else {
      seenTaskIds.set(task.id, task.doc);
    }

    if (!task.roadmap) {
      problems.push({ doc: task.doc, message: `task "${task.id}" has no roadmap item ref` });
    } else if (!itemIds.has(task.roadmap)) {
      problems.push({
        doc: task.doc,
        message: `task "${task.id}" references unknown roadmap item "${task.roadmap}"`,
      });
    }

    for (const dep of task.depends) {
      if (!taskIds.has(dep)) {
        problems.push({
          doc: task.doc,
          message: `task "${task.id}" depends on unknown task "${dep}"`,
        });
      }
    }

    if (task.state === "done" && !task.finished) {
      problems.push({
        doc: task.doc,
        message: `task "${task.id}" is done but has no finished date`,
      });
    }
    if (task.state !== "done" && task.finished) {
      problems.push({
        doc: task.doc,
        message: `task "${task.id}" has a finished date but state "${task.state}"`,
      });
    }
    if (task.finished !== null && !DATE_RE.test(task.finished)) {
      problems.push({
        doc: task.doc,
        message: `task "${task.id}" finished "${task.finished}" is not YYYY-MM-DD`,
      });
    }
    checkWindow(task.doc, `task "${task.id}" planned`, task.planned, problems);
  }

  if (input.roadmap.length === 0) {
    problems.push({
      doc: ROADMAP_DOC,
      message: "roadmap has no items (frontmatter missing or empty)",
    });
  }

  const seenItemIds = new Set<string>();
  for (const item of input.roadmap) {
    if (seenItemIds.has(item.id)) {
      problems.push({ doc: ROADMAP_DOC, message: `duplicate roadmap item id "${item.id}"` });
    }
    seenItemIds.add(item.id);

    if (!ITEM_STATUSES.includes(item.status)) {
      problems.push({
        doc: ROADMAP_DOC,
        message: `roadmap item "${item.id}" has invalid status "${item.status}" (expected ${ITEM_STATUSES.join("|")})`,
      });
    }

    for (const ref of item.docs) {
      if (!docPaths.has(`.claude/current/${ref}`)) {
        problems.push({
          doc: ROADMAP_DOC,
          message: `roadmap item "${item.id}" references missing doc "${ref}"`,
        });
      }
    }

    const itemTasks = input.tasks.filter((task) => task.roadmap === item.id);
    if (item.status === "in-progress" && itemTasks.length === 0) {
      problems.push({
        doc: ROADMAP_DOC,
        message: `roadmap item "${item.id}" is in-progress but no task references it`,
      });
    }
    if (item.status === "done") {
      for (const task of itemTasks) {
        if (task.state !== "done") {
          problems.push({
            doc: ROADMAP_DOC,
            message: `roadmap item "${item.id}" is done but task "${task.id}" is ${task.state}`,
          });
        }
      }
    }

    checkWindow(ROADMAP_DOC, `roadmap item "${item.id}" window`, item.window, problems);
  }

  return problems;
}
