import { For, Show, createMemo, createResource } from "solid-js";
import { Markdown } from "./Markdown";
import { type DocsPayload, fetchDoc } from "./api";

interface GlossaryExtra {
  term: string;
  def: string;
  doc: string;
}

// glossary.md is the vocabulary source of truth; per-doc frontmatter
// `glossary:` entries aggregate underneath it.
export function GlossaryPanel(props: { data: DocsPayload; onOpenDoc: (path: string) => void }) {
  const [glossary] = createResource(() => fetchDoc(".claude/current/glossary.md"));

  const extras = createMemo(() => {
    const out: GlossaryExtra[] = [];
    for (const doc of props.data.docs) {
      const entries = doc.frontmatter?.glossary;
      if (!Array.isArray(entries)) continue;
      for (const entry of entries) {
        if (typeof entry !== "object" || entry === null) continue;
        const record = entry as Record<string, unknown>;
        if (typeof record.term === "string" && typeof record.def === "string") {
          out.push({ term: record.term, def: record.def, doc: doc.path });
        }
      }
    }
    return out.sort((a, b) => a.term.localeCompare(b.term));
  });

  return (
    <div class="panel">
      <Show when={extras().length > 0}>
        <section class="card">
          <h2>Frontmatter terms</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Term</th>
                <th>Definition</th>
                <th>Doc</th>
              </tr>
            </thead>
            <tbody>
              <For each={extras()}>
                {(entry) => (
                  <tr>
                    <td>{entry.term}</td>
                    <td>{entry.def}</td>
                    <td>
                      <button class="link" onClick={() => props.onOpenDoc(entry.doc)}>
                        {entry.doc.split("/").pop()}
                      </button>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </section>
      </Show>

      <section class="card">
        <h2>
          Glossary{" "}
          <button class="link" onClick={() => props.onOpenDoc(".claude/current/glossary.md")}>
            (open in Docs)
          </button>
        </h2>
        <Show when={glossary()} fallback={<p class="muted">Loading glossary.md…</p>}>
          <Markdown content={glossary()!.content} />
        </Show>
      </section>
    </div>
  );
}
