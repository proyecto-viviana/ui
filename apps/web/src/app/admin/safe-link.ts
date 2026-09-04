/** Allow http(s), a single-slash root path, or a fragment. Reject javascript: and //. */
export function safeAdminLinkTarget(href: string): string | null {
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
