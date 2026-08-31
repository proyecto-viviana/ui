import { replaceFrontmatter, splitFrontmatter } from "./frontmatter";

export const TICKET_STATUSES = ["open", "next", "in-progress", "merged", "verified"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_TYPES = ["task", "initiative", "milestone"] as const;
export type TicketType = (typeof TICKET_TYPES)[number];

export const TICKET_DIRECTORIES = ["tasks", "initiatives", "milestones"] as const;
export type TicketDirectory = (typeof TICKET_DIRECTORIES)[number];

export interface TicketHistoryEntry {
  state: TicketStatus;
  at: string;
  note: string | null;
}

export interface WorkTicket {
  id: number;
  type: TicketType;
  title: string;
  subtitle: string | null;
  created: string;
  parent: number | null;
  app: string | null;
  status: TicketStatus;
  blocked: boolean;
  history: TicketHistoryEntry[];
  path: string;
}

export interface Problem {
  doc: string;
  message: string;
}

export interface ParsedTicket {
  ticket: WorkTicket | null;
  problems: Problem[];
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TICKET_PATH_RE =
  /^\.claude\/tickets\/(tasks|initiatives|milestones)\/(\d+)-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

function recordValue(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function integerValue(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function normalizeStatus(value: unknown): TicketStatus | null {
  if (value === "done") return "merged";
  return TICKET_STATUSES.includes(value as TicketStatus) ? (value as TicketStatus) : null;
}

function typeForDirectory(directory: TicketDirectory): TicketType {
  if (directory === "tasks") return "task";
  if (directory === "initiatives") return "initiative";
  return "milestone";
}

export function isTicketPath(path: string): boolean {
  return TICKET_PATH_RE.test(path);
}

export function parseTicket(content: string, path: string): ParsedTicket {
  const problems: Problem[] = [];
  const match = TICKET_PATH_RE.exec(path);
  if (!match) {
    return { ticket: null, problems: [{ doc: path, message: "invalid ticket path" }] };
  }

  const directory = match[1] as TicketDirectory;
  const filenameId = Number(match[2]);
  const { data } = splitFrontmatter(content);
  if (!data) {
    return { ticket: null, problems: [{ doc: path, message: "missing valid YAML frontmatter" }] };
  }

  const id = integerValue(data.id);
  const type = stringValue(data.type);
  const title = stringValue(data.title);
  const created = stringValue(data.created);
  const status = normalizeStatus(data.status);
  const expectedType = typeForDirectory(directory);

  if (id === null) problems.push({ doc: path, message: "id must be an integer" });
  else if (id !== filenameId) {
    problems.push({ doc: path, message: `id ${id} does not match filename id ${filenameId}` });
  }
  if (type !== expectedType) {
    problems.push({ doc: path, message: `type must be ${expectedType} in ${directory}/` });
  }
  if (!title) problems.push({ doc: path, message: "title must be a non-empty string" });
  if (!created || !DATE_RE.test(created)) {
    problems.push({ doc: path, message: "created must use YYYY-MM-DD" });
  }
  if (!status) {
    problems.push({
      doc: path,
      message: `status must be ${TICKET_STATUSES.join("|")} (legacy done is accepted as merged)`,
    });
  }
  if (data.blocked !== undefined && data.blocked !== true) {
    problems.push({ doc: path, message: "blocked must be omitted or true" });
  }

  const parent = data.parent === undefined ? null : integerValue(data.parent);
  if (data.parent !== undefined && parent === null) {
    problems.push({ doc: path, message: "parent must be an integer" });
  }

  const history: TicketHistoryEntry[] = [];
  if (!Array.isArray(data.history) || data.history.length === 0) {
    problems.push({ doc: path, message: "history must contain at least one transition" });
  } else {
    data.history.forEach((entry, index) => {
      const record = recordValue(entry);
      if (!record) {
        problems.push({ doc: path, message: `history[${index}] must be a map` });
        return;
      }
      const state = normalizeStatus(record.state);
      const at = stringValue(record.at);
      if (!state) {
        problems.push({ doc: path, message: `history[${index}] has an invalid state` });
      }
      if (!at || !DATE_RE.test(at)) {
        problems.push({ doc: path, message: `history[${index}] at must use YYYY-MM-DD` });
      }
      if (state && at) {
        history.push({ state, at, note: stringValue(record.note) });
      }
    });
  }

  if (status && history.length > 0 && history[history.length - 1].state !== status) {
    problems.push({ doc: path, message: "status must equal the last history state" });
  }

  if (id === null || type !== expectedType || !title || !created || !status) {
    return { ticket: null, problems };
  }

  return {
    ticket: {
      id,
      type: expectedType,
      title,
      subtitle: stringValue(data.subtitle),
      created,
      parent,
      app: stringValue(data.app),
      status,
      blocked: data.blocked === true,
      history,
      path,
    },
    problems,
  };
}

export function validateTicketBoard(
  tickets: WorkTicket[],
  initialProblems: Problem[],
  presentDirectories: ReadonlySet<string>,
): Problem[] {
  const problems = [...initialProblems];
  for (const directory of TICKET_DIRECTORIES) {
    if (!presentDirectories.has(directory)) {
      problems.push({
        doc: `.claude/tickets/${directory}`,
        message: "required ticket directory is missing",
      });
    }
  }

  const byId = new Map<number, WorkTicket>();
  for (const ticket of tickets) {
    const first = byId.get(ticket.id);
    if (first) {
      problems.push({
        doc: ticket.path,
        message: `duplicate ticket id ${ticket.id} (also in ${first.path})`,
      });
    } else {
      byId.set(ticket.id, ticket);
    }
  }

  for (const ticket of tickets) {
    if (ticket.parent === null) continue;
    const parent = byId.get(ticket.parent);
    if (!parent) {
      problems.push({ doc: ticket.path, message: `parent #${ticket.parent} does not exist` });
      continue;
    }
    if (ticket.type === "milestone") {
      problems.push({ doc: ticket.path, message: "a milestone cannot have a parent" });
    } else if (ticket.type === "initiative" && parent.type !== "milestone") {
      problems.push({ doc: ticket.path, message: "an initiative parent must be a milestone" });
    } else if (ticket.type === "task" && parent.type === "task") {
      problems.push({
        doc: ticket.path,
        message: "a task parent must be an initiative or milestone",
      });
    }
  }

  return problems;
}

function normalizeLegacyHistory(history: unknown): unknown {
  if (!Array.isArray(history)) return history;
  return history.map((entry) => {
    const record = recordValue(entry);
    return record?.state === "done" ? { ...record, state: "merged" } : entry;
  });
}

/** Updates one ticket status and appends a transition when the status changes. */
export function setTicketStatus(
  content: string,
  ticketId: number,
  status: TicketStatus,
  today: string,
): string | null {
  const { data } = splitFrontmatter(content);
  if (!data || integerValue(data.id) !== ticketId) return null;

  data.history = normalizeLegacyHistory(data.history);
  const current = normalizeStatus(data.status);
  data.status = status;
  if (current !== status) {
    const history = Array.isArray(data.history) ? data.history : [];
    history.push({ state: status, at: today });
    data.history = history;
  }
  return replaceFrontmatter(content, data);
}

/** Updates the orthogonal blocked flag. False is represented by omission. */
export function setTicketBlocked(
  content: string,
  ticketId: number,
  blocked: boolean,
): string | null {
  const { data } = splitFrontmatter(content);
  if (!data || integerValue(data.id) !== ticketId) return null;
  if (blocked) data.blocked = true;
  else delete data.blocked;
  return replaceFrontmatter(content, data);
}
