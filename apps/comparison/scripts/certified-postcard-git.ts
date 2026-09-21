import { execFileSync } from "node:child_process";
import {
  certifiedSuiteCoveredPathspecs,
  type PostcardGitProbe,
} from "../src/data/certified-suite-evidence";

/** Answers `certifiedSuitePostcardCurrency`'s questions from the checkout at `cwd`. */
export function gitPostcardProbe(cwd: string): PostcardGitProbe {
  const git = (args: string[]) =>
    execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const succeeds = (args: string[]) => {
    try {
      git(args);
      return true;
    } catch {
      return false;
    }
  };

  return {
    hasCommit: (revision) => succeeds(["cat-file", "-e", `${revision}^{commit}`]),
    isAncestor: (revision, head) => succeeds(["merge-base", "--is-ancestor", revision, head]),
    changedCoveredPaths: (revision, head) =>
      git(["diff", "--name-only", revision, head, "--", ...certifiedSuiteCoveredPathspecs])
        .split("\n")
        .filter(Boolean),
    // `-uall` names each untracked file rather than collapsing a new directory
    // to `dir/`, so the pathspecs decide it and the reason names the file. A
    // porcelain line is `XY <path>`, and a rename carries `old -> new`.
    dirtyCoveredPaths: () =>
      git(["status", "--porcelain", "-uall", "--", ...certifiedSuiteCoveredPathspecs])
        .split("\n")
        .filter(Boolean)
        .map((line) => line.slice(3).split(" -> ").at(-1) ?? "")
        .filter(Boolean),
  };
}
