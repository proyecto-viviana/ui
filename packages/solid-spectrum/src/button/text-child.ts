// Solid helpers may pass one plain text child as ["Label"]; upstream React sees
// the equivalent authoring shape as a string child and wraps it in Text.
export function getSingleTextChild(content: unknown): string | undefined {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content) && content.length === 1 && typeof content[0] === "string") {
    return content[0];
  }

  return undefined;
}
