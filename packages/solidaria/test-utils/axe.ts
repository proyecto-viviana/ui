/**
 * axe-core integration for vitest (INFRA-1)
 *
 * Wraps axe-core directly (no vitest-axe/jest-axe dependency) for consistent
 * versions between unit tests and Playwright e2e scans.
 */

import axe, { type RunOptions, type AxeResults, type Result } from "axe-core";

// Upstream React Aria emits role="meter progressbar" fallback tokens.
// axe-core does not split multi-token fallback roles in aria-allowed-attr without configuration.
axe.configure({
  rules: [
    {
      id: "aria-allowed-attr",
      selector: '*:not([role="meter progressbar"])',
    },
  ],
});

export interface CheckA11yOptions {
  /** WCAG tags to test against. Default: ['wcag2a', 'wcag2aa'] */
  tags?: string[];
  /** Rule IDs to disable (in addition to jsdom-incompatible defaults) */
  disableRules?: string[];
  /** Raw axe-core RunOptions override (merged after tags/disableRules) */
  axeOptions?: RunOptions;
}

export interface CheckA11yResult {
  violations: Result[];
  passes: Result[];
  incomplete: Result[];
}

/**
 * Rules that don't work reliably in jsdom (no layout engine).
 * These are disabled by default — callers can override via `disableRules: []`.
 */
const JSDOM_INCOMPATIBLE_RULES = ["color-contrast", "scrollable-region-focusable"];

function buildRunOptions(options: CheckA11yOptions = {}): RunOptions {
  const {
    tags = ["wcag2a", "wcag2aa"],
    disableRules = JSDOM_INCOMPATIBLE_RULES,
    axeOptions,
  } = options;

  const rules: Record<string, { enabled: boolean }> = {};
  for (const id of disableRules) {
    rules[id] = { enabled: false };
  }

  return {
    runOnly: { type: "tag", values: tags },
    rules,
    ...axeOptions,
  };
}

function formatViolations(violations: Result[]): string {
  if (violations.length === 0) return "";

  const lines: string[] = [`${violations.length} accessibility violation(s):\n`];
  for (const v of violations) {
    lines.push(`  [${v.impact}] ${v.id}: ${v.help}`);
    lines.push(`    ${v.helpUrl}`);
    for (const node of v.nodes) {
      const target = node.target?.join(" > ") ?? "<unknown>";
      lines.push(`    → ${target}`);
      if (node.failureSummary) {
        lines.push(`      ${node.failureSummary.replace(/\n+/g, " ")}`);
      }
    }
  }
  return lines.join("\n");
}

/**
 * Run axe-core on a container and return raw results.
 *
 * @example
 * ```ts
 * const { violations } = await checkA11y(container);
 * expect(violations).toHaveLength(0);
 * ```
 */
export async function checkA11y(
  container: Element = document.body,
  options?: CheckA11yOptions,
): Promise<CheckA11yResult> {
  const runOptions = buildRunOptions(options);
  const results: AxeResults = await axe.run(container as HTMLElement, runOptions);
  return {
    violations: results.violations,
    passes: results.passes,
    incomplete: results.incomplete,
  };
}

/**
 * Assert zero axe-core violations. Throws a formatted error on failure.
 *
 * @example
 * ```ts
 * await assertNoA11yViolations(container);
 * ```
 */
export async function assertNoA11yViolations(
  container: Element = document.body,
  options?: CheckA11yOptions,
): Promise<void> {
  const { violations } = await checkA11y(container, options);
  if (violations.length > 0) {
    throw new Error(formatViolations(violations));
  }
}
