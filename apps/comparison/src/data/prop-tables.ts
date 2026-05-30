// Parser for the vendored upstream S2 prop tables under
// `vendor/s2-docs/props/<Export>.mdx`. Those files hold the exact
// `Name | Type | Default | Description` markdown table rendered by the S2 docs
// (see that dir's README for provenance). The type column contains unescaped
// `|` (e.g. `string | undefined`), so rows are parsed backtick-aware rather
// than by naive cell splitting.

export interface PropRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

// `| `name` | `type` | default | description |`
// name and type are each a single backtick-delimited token with no nested
// backticks; the type may contain `|`. default never contains `|`; description
// is the remainder.
const ROW_RE = /^\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*(.*)$/;

export function parsePropTable(markdown: string): PropRow[] {
  const rows: PropRow[] = [];
  for (const line of markdown.split("\n")) {
    const match = ROW_RE.exec(line.trim());
    if (!match) {
      // Header (`| Name |`) and separator (`|---|`) rows have no backtick name,
      // so they fall through here.
      continue;
    }
    const [, name, type, restRaw] = match;
    const rest = restRaw.replace(/\|\s*$/, "").trim();
    const pipe = rest.indexOf("|");
    const defaultValue = (pipe === -1 ? rest : rest.slice(0, pipe)).trim() || "—";
    const description = pipe === -1 ? "" : rest.slice(pipe + 1).trim();
    rows.push({ name, type, default: defaultValue, description });
  }
  return rows;
}

// Render the inline markdown found in a description cell (`code`, [links](url),
// **bold**) to HTML. Input is trusted, vendored, build-time data, but HTML
// metacharacters are still escaped before the allowed inline forms are applied.
export function renderPropDescription(text: string): string {
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_match, label, href) => `<a href="${href}" target="_blank" rel="noreferrer">${label}</a>`,
    )
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
