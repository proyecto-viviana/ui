export function comments(content) {
  return content.match(/\/\*[\s\S]*?\*\/|\/\/(?:[^\n]*)/g) ?? [];
}

export function normalizedComment(comment) {
  return comment
    .replace(/^\/\*+|\*+\/$/g, "")
    .replace(/^\s*\*\s?/gm, "")
    .replace(/^\/\/\s?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function sourceMarkers(content) {
  return comments(content)
    .map(normalizedComment)
    .filter((comment) =>
      /(?:Port(?:ed)?\s+(?:of|from)|Based on)\b[^.!?]{0,160}(?:@react-(?:aria|spectrum|stately|types)|@internationalized\/|react[- ]aria|react[- ]stately)/i.test(
        comment,
      ),
    );
}
