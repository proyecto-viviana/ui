function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isSafeRelativePath(value: string): boolean {
  return value.startsWith("/") && !value.startsWith("//");
}

/**
 * Query-string demo href/src values land on a public origin. Keep http(s),
 * same-origin paths, and in-page hashes; drop javascript:/data:/protocol-relative.
 */
export function sanitizeDemoHref(
  value: string | null | undefined,
  fallback: string,
): string {
  if (value == null) {
    return fallback;
  }

  const trimmed = value.trim();
  if (trimmed === "") {
    return fallback;
  }

  if (isSafeRelativePath(trimmed) || trimmed.startsWith("#")) {
    return trimmed;
  }

  if (isSafeHttpUrl(trimmed)) {
    return trimmed;
  }

  return fallback;
}

export function sanitizeDemoSrc(
  value: string | null | undefined,
  fallback: string,
): string {
  return sanitizeDemoHref(value, fallback);
}
