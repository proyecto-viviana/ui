/// <reference types="node" />

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { type DocsPayload, collectDocs } from "../apps/web/src/app/admin/server/data";
import { splitFrontmatter } from "../apps/web/src/app/admin/server/frontmatter";
import {
  TICKET_DIRECTORIES,
  TICKET_STATUSES,
  type TicketStatus,
  type TicketType,
  type WorkTicket,
} from "../apps/web/src/app/admin/server/tickets";

const root = process.cwd();
const boardRoot = path.join(root, ".claude", "tickets");

function ticketFiles(): string[] {
  const files: string[] = [];
  for (const directory of TICKET_DIRECTORIES) {
    const absolute = path.join(boardRoot, directory);
    if (!existsSync(absolute)) continue;
    for (const filename of readdirSync(absolute).sort()) {
      if (filename.endsWith(".md")) files.push(path.join(absolute, filename));
    }
  }
  return files;
}

export interface BoardEntry {
  path: string;
  content: string;
}

/** Sorts object keys recursively, so JSON.stringify is a canonical form. */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(record).sort()) sorted[key] = canonical(record[key]);
    return sorted;
  }
  return value;
}

/**
 * The board stamp the two generated views carry, and the only definition of it:
 * `docs:generate` writes it and `docs:check` recomputes it through this same
 * function. It hashes each ticket's path and its *parsed* frontmatter, not the
 * file's bytes.
 *
 * #588: the pre-commit `staged` hook runs `vp check --fix` over staged ticket
 * markdown after `docs:generate` has stamped the views, so a byte-level stamp
 * is stale at the very commit that wrote it — `503e50a0` reproduced it and
 * `a9ab33ee` had to restamp. Quoting, flow-versus-block mapping, folding and
 * trailing whitespace all parse to the same YAML value, so respelling a ticket
 * leaves this stamp alone while a real board edit moves it.
 *
 * The body is deliberately out of the hash. The views render frontmatter only,
 * and a markdown formatter may rewrap prose at will, so no normalisation of a
 * body survives it. A body-only edit therefore does not move the stamp; the
 * stamp names the board the views were rendered from, not the ticket text.
 */
export function boardRevisionOf(entries: Iterable<BoardEntry>): string {
  const records = [...entries]
    .map((entry) => ({
      path: entry.path,
      frontmatter: canonical(splitFrontmatter(entry.content).data),
    }))
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

  const hash = createHash("sha256");
  for (const record of records) {
    hash.update(JSON.stringify(record));
    hash.update("\0");
  }
  return `sha256:${hash.digest("hex")}`;
}

function boardRevision(): string {
  return boardRevisionOf(
    ticketFiles().map((file) => ({
      path: path.relative(root, file).split(path.sep).join("/"),
      content: readFileSync(file, "utf8"),
    })),
  );
}

function link(ticket: WorkTicket): string {
  const target = `../tickets/${ticket.path.replace(/^\.claude\/tickets\//, "")}`;
  return `[#${ticket.id}](${target})`;
}

function groupCounts(tickets: WorkTicket[]): string {
  return TICKET_STATUSES.map(
    (status) => `${status}: ${tickets.filter((ticket) => ticket.status === status).length}`,
  ).join("; ");
}

function countByTypeAndStatus(
  tickets: WorkTicket[],
  type: TicketType,
  status: TicketStatus,
): number {
  return tickets.filter((ticket) => ticket.type === type && ticket.status === status).length;
}

function renderTable(rows: string[][], alignments: Array<"left" | "right">): string {
  const widths = alignments.map((alignment, index) =>
    Math.max(alignment === "right" ? 4 : 3, ...rows.map((row) => (row[index] ?? "").length)),
  );
  const renderRow = (row: string[]) =>
    `| ${row
      .map((cell, index) =>
        alignments[index] === "right"
          ? cell.padStart(widths[index] ?? cell.length)
          : cell.padEnd(widths[index] ?? cell.length),
      )
      .join(" | ")} |`;
  const separator = widths.map((width, index) =>
    alignments[index] === "right" ? `${"-".repeat(width - 1)}:` : "-".repeat(width),
  );

  return [renderRow(rows[0] ?? []), renderRow(separator), ...rows.slice(1).map(renderRow)].join(
    "\n",
  );
}

function renderStatus(data: DocsPayload, revision: string): string {
  const tasks = [...data.tasks].sort((a, b) => a.id - b.id);
  const next = tasks.filter((ticket) => ticket.status === "next");
  const inProgress = tasks.filter((ticket) => ticket.status === "in-progress");
  const blocked = tasks.filter((ticket) => ticket.blocked);

  const ticketList = (tickets: WorkTicket[], empty: string) =>
    tickets.length > 0
      ? tickets
          .map(
            (ticket) =>
              `- ${link(ticket)} ${ticket.title}${ticket.parent === null ? "" : ` (parent #${ticket.parent})`}`,
          )
          .join("\n")
      : `- ${empty}`;
  const summary = renderTable(
    [
      ["Type", ...TICKET_STATUSES],
      [
        "Tasks",
        ...TICKET_STATUSES.map((status) => String(countByTypeAndStatus(tasks, "task", status))),
      ],
      [
        "Initiatives",
        ...TICKET_STATUSES.map((status) =>
          String(countByTypeAndStatus(data.roadmap, "initiative", status)),
        ),
      ],
      [
        "Milestones",
        ...TICKET_STATUSES.map((status) =>
          String(countByTypeAndStatus(data.roadmap, "milestone", status)),
        ),
      ],
    ],
    ["left", "right", "right", "right", "right", "right", "right", "right"],
  );

  return `---
kind: generated
status: current
source: .claude/tickets
source-revision: "${revision}"
---

# Status

Status: generated ticket-board view.
Update when: run \`vp run docs:generate\` after a ticket changes.

Do not edit this file. Edit the ticket board through \`/admin\` or edit the
owning ticket. Then regenerate this view.

Board revision: \`${revision}\`

## Summary

${summary}

Blocked tasks: ${blocked.length}. Board problems: ${data.problems.length}.

## Next

${ticketList(next, "No task has status `next`.")}

## In progress

${ticketList(inProgress, "No task has status `in-progress`.")}

## Blocked

${ticketList(blocked, "No task has the blocked flag.")}

## Evidence boundary

This view reports ticket state only. Test reports and acceptance evidence stay
with their owning scripts, reports, and tickets.
`;
}

function renderRoadmap(data: DocsPayload, revision: string): string {
  const roadmap = [...data.roadmap].sort(
    (a, b) => Number(b.type === "milestone") - Number(a.type === "milestone") || a.id - b.id,
  );
  const allTickets = [...data.tasks, ...data.roadmap];
  const rows = roadmap.map((ticket) => {
    const children = allTickets.filter((candidate) => candidate.parent === ticket.id);
    const active = children.filter((candidate) =>
      ["open", "next", "in-progress"].includes(candidate.status),
    ).length;
    return [
      link(ticket),
      ticket.type,
      ticket.title,
      ticket.status,
      ticket.blocked ? "yes" : "no",
      `${active}/${children.length}`,
    ];
  });
  const table = renderTable(
    [
      ["Ticket", "Type", "Title", "Status", "Blocked", "Active/all children"],
      ...(rows.length > 0 ? rows : [["—", "—", "No roadmap tickets exist.", "—", "—", "0/0"]]),
    ],
    ["left", "left", "left", "left", "left", "right"],
  );

  return `---
kind: generated
status: current
source: .claude/tickets
source-revision: "${revision}"
---

# Roadmap

Status: generated initiative and milestone view.
Update when: run \`vp run docs:generate\` after a roadmap ticket changes.

Do not edit this file. Initiative definitions and exit criteria live in the
linked tickets.

Board revision: \`${revision}\`

${table}

## Board summary

${groupCounts(roadmap)}.
`;
}

export function generatedWorkViews(): Record<string, string> {
  const data = collectDocs();
  if (data.problems.length > 0) {
    const detail = data.problems.map((problem) => `${problem.doc}: ${problem.message}`).join("\n");
    throw new Error(`Cannot generate work views from an invalid board:\n${detail}`);
  }
  const revision = boardRevision();
  return {
    ".claude/current/roadmap.md": renderRoadmap(data, revision),
    ".claude/current/status.md": renderStatus(data, revision),
  };
}

export function checkGeneratedWorkViews(): string[] {
  const failures: string[] = [];
  for (const [relative, expected] of Object.entries(generatedWorkViews())) {
    const absolute = path.join(root, relative);
    const actual = existsSync(absolute) ? readFileSync(absolute, "utf8") : null;
    if (actual !== expected) failures.push(`${relative} is stale; run vp run docs:generate`);
  }
  return failures;
}

function main(): void {
  const write = process.argv.includes("--write");
  if (write) {
    for (const [relative, contents] of Object.entries(generatedWorkViews())) {
      writeFileSync(path.join(root, relative), contents);
      console.log(`generated ${relative}`);
    }
    return;
  }

  const failures = checkGeneratedWorkViews();
  if (failures.length > 0) {
    for (const failure of failures) console.error(failure);
    process.exit(1);
  }
  console.log("generated work views are current");
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) main();
