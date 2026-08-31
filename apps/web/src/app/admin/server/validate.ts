import type { Problem } from "./tickets";

// Stable documents keep descriptive metadata. Work state belongs only to the
// ticket board. This validator can reject task state that returns to the stable
// document surface after the migration removes the legacy records.

export interface StableDoc {
  path: string;
  tier: string;
  frontmatter: Record<string, unknown> | null;
}

export function validateStableDocs(docs: StableDoc[], rejectLegacyTracking: boolean): Problem[] {
  const problems: Problem[] = [];
  for (const doc of docs) {
    if (doc.tier !== "current") continue;
    const data = doc.frontmatter;
    if (!data || typeof data.kind !== "string" || typeof data.status !== "string") {
      problems.push({ doc: doc.path, message: "missing baseline frontmatter (kind + status)" });
      continue;
    }
    if (rejectLegacyTracking && (Object.hasOwn(data, "tasks") || Object.hasOwn(data, "items"))) {
      problems.push({
        doc: doc.path,
        message: "work state must live in .claude/tickets, not current-document frontmatter",
      });
    }
  }
  return problems;
}

export type { Problem };
