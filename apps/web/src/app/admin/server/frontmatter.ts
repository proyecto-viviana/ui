import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

// Pure frontmatter parse/rewrite for the /admin dashboard. Rewrites preserve
// the document body byte-for-byte. Ticket-specific parsing and updates live in
// tickets.ts.

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

/** Stamps last_reviewed. Docs without frontmatter gain a minimal block. */
export function markReviewed(content: string, date: string): string {
  const { data } = splitFrontmatter(content);
  return replaceFrontmatter(content, { ...data, last_reviewed: date });
}
