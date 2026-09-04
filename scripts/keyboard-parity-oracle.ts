/**
 * Extract keyboard-walk contracts from pinned react-spectrum sources so the
 * DnD / virtualizer guards can DIFF against local ports instead of grepping
 * hard-coded identifier lists (ticket #205).
 */

const DELEGATE_METHOD =
  /(?:keyboardDelegate\.)?(getKey(?:Below|Above|LeftOf|RightOf|PageBelow|PageAbove|FirstKey|LastKey)|getFirstKey|getLastKey|getNextTarget|getPreviousTarget)\b/g;

const DROP_POSITION_ASSIGN = /dropPosition:\s*['"](before|on|after)['"]/g;
const CASE_KEY = /case\s+['"](\w+)['"]/g;

export function sliceBracedFrom(source: string, startRe: RegExp): string | null {
  const flags = startRe.flags.includes("g") ? startRe.flags : `${startRe.flags}g`;
  const re = new RegExp(startRe.source, flags);
  const match = re.exec(source);
  if (!match) return null;
  const brace = source.indexOf("{", match.index + match[0].length - 1);
  if (brace < 0) return null;
  let depth = 0;
  for (let i = brace; i < source.length; i++) {
    const ch = source[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return source.slice(brace, i + 1);
    }
  }
  return null;
}

export function extractOnKeyDownCases(source: string): Array<{
  key: string;
  methods: string[];
}> {
  const body = sliceBracedFrom(source, /onKeyDown\s*\(\s*e\s*,\s*drag\s*\)/);
  if (!body) return [];
  const cases: Array<{ key: string; methods: string[] }> = [];
  const caseStarts = [...body.matchAll(/case\s+['"](\w+)['"]\s*:/g)];
  for (let i = 0; i < caseStarts.length; i++) {
    const start = caseStarts[i];
    const end = caseStarts[i + 1]?.index ?? body.length;
    const chunk = body.slice(start.index, end);
    const methods: string[] = [];
    DELEGATE_METHOD.lastIndex = 0;
    let methodMatch: RegExpExecArray | null;
    while ((methodMatch = DELEGATE_METHOD.exec(chunk)) !== null) {
      methods.push(methodMatch[1]);
    }
    cases.push({ key: start[1], methods });
  }
  return cases;
}

export function extractHostOnKeyDownAfterSwitch(source: string): boolean {
  const body = sliceBracedFrom(source, /onKeyDown\s*\(\s*e\s*,\s*drag\s*\)/);
  if (!body) return false;
  const switchIdx = body.search(/switch\s*\(\s*e\.key\s*\)/);
  if (switchIdx < 0) return false;
  const afterSwitch = body.slice(switchIdx);
  const switchBody = sliceBracedFrom(afterSwitch, /switch\s*\(\s*e\.key\s*\)/);
  if (!switchBody) return false;
  const after = afterSwitch.slice(afterSwitch.indexOf(switchBody) + switchBody.length);
  return /onKeyDown\?\.\(\s*e\s*\)/.test(after);
}

export function extractNavigateDirectionWalk(source: string): string[] {
  const body = sliceBracedFrom(source, /export function navigate\b/);
  if (!body) return [];
  const walk: string[] = [];
  const caseStarts = [...body.matchAll(/case\s+['"](left|right|up|down)['"]\s*:/g)];
  for (let i = 0; i < caseStarts.length; i++) {
    const start = caseStarts[i];
    const end = caseStarts[i + 1]?.index ?? body.length;
    const chunk = body.slice(start.index, end).replace(/\s+/g, " ");
    const direction = start[1];
    if (direction === "left" || direction === "right") {
      const rtlNext = /rtl\s*\?\s*nextDropTarget/.test(chunk);
      const rtlPrev = /rtl\s*\?\s*previousDropTarget/.test(chunk);
      if (rtlNext) walk.push(`${direction}:rtl=next,ltr=previous`);
      else if (rtlPrev) walk.push(`${direction}:rtl=previous,ltr=next`);
      else walk.push(`${direction}:unmapped`);
    } else if (/previousDropTarget/.test(chunk)) {
      walk.push(`${direction}=previous`);
    } else if (/nextDropTarget/.test(chunk)) {
      walk.push(`${direction}=next`);
    } else {
      walk.push(`${direction}:unmapped`);
    }
  }
  return walk;
}

export function extractDropPositionAssignments(fnBody: string): string[] {
  const positions: string[] = [];
  DROP_POSITION_ASSIGN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = DROP_POSITION_ASSIGN.exec(fnBody)) !== null) {
    positions.push(match[1]);
  }
  return positions;
}

export function extractNamedFunctionBody(source: string, name: string): string | null {
  return (
    sliceBracedFrom(source, new RegExp(`(?:export\\s+)?function\\s+${name}\\b`)) ??
    sliceBracedFrom(source, new RegExp(`(?:export\\s+)?(?:async\\s+)?function\\s+${name}\\s*<`)) ??
    sliceBracedFrom(source, new RegExp(`const\\s+${name}\\s*=\\s*(?:async\\s*)?\\(`)) ??
    sliceBracedFrom(
      source,
      new RegExp(`(?:private|public|protected)\\s+(?:async\\s+)?${name}\\s*\\(`),
    ) ??
    sliceBracedFrom(source, new RegExp(`(?:^|\\n)\\s+${name}\\s*\\(`))
  );
}

export function extractDelegateMethodOrder(fnBody: string): string[] {
  const methods: string[] = [];
  DELEGATE_METHOD.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = DELEGATE_METHOD.exec(fnBody)) !== null) {
    methods.push(match[1]);
  }
  return methods;
}

export function extractIncludeDisabledCalls(fnBody: string): string[] {
  const calls: string[] = [];
  const re =
    /keyboardDelegate\.(getKey(?:Below|Above|LeftOf|RightOf))\??\(\s*[^,]+,\s*\{\s*includeDisabled:\s*true\s*\}/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(fnBody)) !== null) {
    calls.push(match[1]);
  }
  return calls;
}

export type OppositeFallback = "primary-then-opposite" | "same-direction" | "missing";

/**
 * PageDown/PageUp (oracle) and virtualizer page/keyboard scans encode the same
 * contract: try the walk in the requested direction, then the opposite.
 */
export function extractPageKeyFallback(
  source: string,
  key: "PageDown" | "PageUp",
): OppositeFallback {
  const body = sliceBracedFrom(source, /onKeyDown\s*\(\s*e\s*,\s*drag\s*\)/);
  if (!body) return "missing";
  const caseStarts = [...body.matchAll(/case\s+['"](\w+)['"]\s*:/g)];
  const start = caseStarts.find((entry) => entry[1] === key);
  if (!start || start.index == null) return "missing";
  const startAt = caseStarts.indexOf(start);
  const end = caseStarts[startAt + 1]?.index ?? body.length;
  const chunk = body.slice(start.index, end);
  const nextIdx = chunk.search(/getNextTarget\b/);
  const prevIdx = chunk.search(/getPreviousTarget\b/);
  if (nextIdx < 0 || prevIdx < 0) return "missing";
  if (key === "PageDown") {
    return nextIdx < prevIdx ? "primary-then-opposite" : "same-direction";
  }
  return prevIdx < nextIdx ? "primary-then-opposite" : "same-direction";
}

/**
 * Virtualizer keyboard/page scans: the oracle PageDown contract is "try the
 * requested direction, then the opposite". Local encodes that as
 * `scanFromIndex(clampedStart, delta, …)` then
 * `scanFromIndex(clampedStart - delta, -delta, …)`. Keeping the identifiers
 * but walking the same sign twice fails this extract.
 */
export function extractClampedScanFallback(fnBody: string): OppositeFallback {
  const primaryRe = /scanFromIndex\s*\(\s*clampedStart\s*,\s*delta/;
  const oppositeRe = /scanFromIndex\s*\(\s*clampedStart\s*-\s*delta\s*,\s*-delta/;
  const primaryAt = fnBody.search(primaryRe);
  const oppositeAt = fnBody.search(oppositeRe);
  if (primaryAt < 0 && oppositeAt < 0) return "missing";
  if (primaryAt >= 0 && oppositeAt >= 0) {
    return primaryAt < oppositeAt ? "primary-then-opposite" : "same-direction";
  }
  return "same-direction";
}

export function extractDropPositionCases(fnBody: string): string[] {
  const cases: string[] = [];
  CASE_KEY.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = CASE_KEY.exec(fnBody)) !== null) {
    if (match[1] === "before" || match[1] === "on" || match[1] === "after") {
      cases.push(match[1]);
    }
  }
  return cases;
}

export function jsonEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function stringifyContract(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
