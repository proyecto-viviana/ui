export interface ParityReportOptions {
  strict: boolean;
  strictFull: boolean;
  slugFilter: string | undefined;
}

export function parseParityReportOptions(args: readonly string[]): ParityReportOptions {
  const strictFull = args.includes("--strict-full");
  const slugArg = args.find((value) => value.startsWith("--slug="));

  return {
    strict: strictFull || args.includes("--strict"),
    strictFull,
    slugFilter: slugArg ? slugArg.slice("--slug=".length).trim().toLowerCase() : undefined,
  };
}
