import { createMemo } from "solid-js";

// Minimal, dependency-free Markdown renderer for the dev-only /admin doc viewer.
// It covers what the .claude/current docs use — headings, paragraphs, fenced and
// inline code, bold/italic, links, blockquotes, horizontal rules, nested ordered
// and unordered lists, and GFM pipe tables. All text is HTML-escaped before it
// reaches innerHTML (the docs are trusted, but the boundary stays safe anyway).

// Strip YAML frontmatter before rendering; the panels show structured
// frontmatter through their own UI, not as a code block.
export function stripFrontmatter(content: string): string {
  const match = /^---\n[\s\S]*?\n---\n/.exec(content);
  return match ? content.slice(match[0].length) : content;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(text: string): string {
  return escapeHtml(text).replace(/"/g, "&quot;");
}

// Inline spans. Code and links are stashed first so later formatting never
// reaches their contents, then re-inserted after bold/italic run. Placeholders
// use NUL delimiters (impossible in markdown source) so literal numbers in the
// text can never be mistaken for a stash index.
function inline(src: string): string {
  const tokens: string[] = [];
  const stash = (html: string): string => {
    tokens.push(html);
    return `\u0000${tokens.length - 1}\u0000`;
  };
  let s = src.replace(/`([^`]+)`/g, (_match, code: string) =>
    stash(`<code>${escapeHtml(code)}</code>`),
  );
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, text: string, href: string) =>
    stash(`<a href="${escapeAttr(href)}">${escapeHtml(text)}</a>`),
  );
  s = escapeHtml(s);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  s = s.replace(/\u0000(\d+)\u0000/g, (_match, index: string) => tokens[Number(index)]);
  return s;
}

const ITEM_RE = /^(\s*)([-*+]|\d+\.)\s+(.*)$/;
const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const FENCE_RE = /^(\s*)(`{3,}|~{3,})(.*)$/;
const HR_RE = /^\s*([-*_])(\s*\1){2,}\s*$/;
const QUOTE_RE = /^\s*>/;

function isTableHeader(line: string, next: string | undefined): boolean {
  return (
    line.includes("|") &&
    next !== undefined &&
    next.includes("-") &&
    /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(next)
  );
}

function isBlockStart(line: string, next: string | undefined): boolean {
  return (
    HEADING_RE.test(line) ||
    FENCE_RE.test(line) ||
    HR_RE.test(line) ||
    QUOTE_RE.test(line) ||
    ITEM_RE.test(line) ||
    isTableHeader(line, next)
  );
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

// Parses one list (and its nested lists) starting at `start`, returning the HTML
// and the index of the first line past it.
function renderList(lines: string[], start: number, baseIndent: number): [string, number] {
  const items: string[] = [];
  let ordered: boolean | null = null;
  let i = start;

  while (i < lines.length) {
    if (lines[i].trim() === "") {
      const after = lines[i + 1];
      const am = after ? ITEM_RE.exec(after) : null;
      if (am && am[1].length === baseIndent) {
        i++;
        continue;
      }
      break;
    }
    const m = ITEM_RE.exec(lines[i]);
    if (!m || m[1].length !== baseIndent) break;
    if (ordered === null) ordered = /^\d+\.$/.test(m[2]);
    let content = inline(m[3]);
    i++;
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === "") break;
      const cm = ITEM_RE.exec(line);
      if (cm) {
        if (cm[1].length > baseIndent) {
          const [nested, next] = renderList(lines, i, cm[1].length);
          content += nested;
          i = next;
          continue;
        }
        break;
      }
      if (/^\s+\S/.test(line)) {
        content += ` ${inline(line.trim())}`;
        i++;
        continue;
      }
      break;
    }
    items.push(`<li>${content}</li>`);
  }

  const tag = ordered ? "ol" : "ul";
  return [`<${tag}>${items.join("")}</${tag}>`, i];
}

function renderBlocks(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    const fence = FENCE_RE.exec(line);
    if (fence) {
      const marker = fence[2][0];
      const close = new RegExp(`^\\s*${marker}{3,}\\s*$`);
      const body: string[] = [];
      i++;
      while (i < lines.length && !close.test(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      i++; // closing fence
      out.push(`<pre><code>${escapeHtml(body.join("\n"))}</code></pre>`);
      continue;
    }

    const heading = HEADING_RE.exec(line);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level}>${inline(heading[2].trim())}</h${level}>`);
      i++;
      continue;
    }

    if (HR_RE.test(line)) {
      out.push("<hr>");
      i++;
      continue;
    }

    if (isTableHeader(line, lines[i + 1])) {
      const header = splitRow(line);
      i += 2; // header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        rows.push(splitRow(lines[i]));
        i++;
      }
      const thead = `<thead><tr>${header.map((cell) => `<th>${inline(cell)}</th>`).join("")}</tr></thead>`;
      const tbody = `<tbody>${rows
        .map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`)
        .join("")}</tbody>`;
      out.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    if (QUOTE_RE.test(line)) {
      const body: string[] = [];
      while (i < lines.length && QUOTE_RE.test(lines[i])) {
        body.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      out.push(`<blockquote>${renderBlocks(body.join("\n"))}</blockquote>`);
      continue;
    }

    if (ITEM_RE.test(line)) {
      const [html, next] = renderList(lines, i, ITEM_RE.exec(line)![1].length);
      out.push(html);
      i = next;
      continue;
    }

    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !isBlockStart(lines[i], lines[i + 1])) {
      para.push(lines[i]);
      i++;
    }
    out.push(`<p>${inline(para.join(" "))}</p>`);
  }

  return out.join("\n");
}

export function Markdown(props: { content: string }) {
  const html = createMemo(() => renderBlocks(stripFrontmatter(props.content)));
  return <div class="admin-markdown" innerHTML={html()} />;
}
