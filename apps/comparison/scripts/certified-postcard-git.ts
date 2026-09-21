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
  };
}
