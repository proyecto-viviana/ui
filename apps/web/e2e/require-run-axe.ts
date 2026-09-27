/**
 * playground-axe and contrast used to `test.skip` when `RUN_AXE` was unset.
 * A skip is a pass, so a bare Playwright run of those files exited 0.
 */

const AXE_SPEC = /(?:^|\/)(?:playground-axe|contrast)\.spec\.ts(?::\d+)?$/;

export function argvTargetsAxeSpec(argv: readonly string[]): boolean {
  return argv.some((arg) => AXE_SPEC.test(arg));
}

/** Unfiltered runs omit these files. Naming one without the env fails instead. */
export function axeTestIgnore(env: NodeJS.ProcessEnv): RegExp[] | undefined {
  if (env.RUN_AXE === "1") return undefined;
  return [/[/\\]playground-axe\.spec\.ts$/, /[/\\]contrast\.spec\.ts$/];
}

export function assertAxeRunRequested(argv: readonly string[], env: NodeJS.ProcessEnv): void {
  if (!argvTargetsAxeSpec(argv) || env.RUN_AXE === "1") return;
  throw new Error(
    "RUN_AXE=1 is required to run playground-axe.spec.ts or contrast.spec.ts. These tests must not skip.",
  );
}
