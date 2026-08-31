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

function escapeText(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttribute(text: string): string {
  return escapeText(text).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function safeLinkTarget(href: string): string | null {
  const trimmed = href.trim();
  if (
    [...trimmed].some((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint <= 0x20 || codePoint === 0x7f;
    }) ||
    /%(?:0[0-9a-f]|1[0-9a-f]|20|7f)/i.test(trimmed) ||
    /["'<>]/.test(trimmed)
  ) {
    return null;
  }
  if (trimmed.startsWith("#")) {
    return trimmed;
  }
  if (trimmed.startsWith("/") && trimmed[1] !== "/" && trimmed[1] !== "\\") {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" ? trimmed : null;
  } catch {
    return null;
  }
}

function renderTextMarkup(text: string): string {
  const code: string[] = [];
  const withCodePlaceholders = text.replace(/`([^`]+)`/g, (_match, value) => {
    code.push(`<code>${escapeText(value)}</code>`);
    return `\uE000${code.length - 1}\uE000`;
  });

  return escapeText(withCodePlaceholders)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\uE000(\d+)\uE000/g, (_match, index) => code[Number(index)] ?? "");
}

// Render the inline markdown found in a description cell (`code`, [links](url),
// **bold**) to HTML. The source is vendored build-time data, but vendoring is a
// supply-chain boundary rather than a reason to trust markup. Escape both text
// and attributes. Permit explicit HTTP(S) URLs, fragments, and local paths with
// exactly one leading slash. Reject characters that can change URL or attribute
// parsing, including their percent-encoded control forms.
export function renderPropDescription(text: string): string {
  const links: string[] = [];
  const withLinkPlaceholders = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, href) => {
    const target = safeLinkTarget(href);
    if (target == null) {
      return match;
    }

    links.push(
      `<a href="${escapeAttribute(target)}" target="_blank" rel="noreferrer">${renderTextMarkup(label)}</a>`,
    );
    return `\uE001${links.length - 1}\uE001`;
  });

  return renderTextMarkup(withLinkPlaceholders).replace(
    /\uE001(\d+)\uE001/g,
    (_match, index) => links[Number(index)] ?? "",
  );
}
