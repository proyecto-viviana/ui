/**
 * Outbound identifiers for the site.
 *
 * These used to be typed out at each call site, which is how six links ended up
 * pointing at `github.com/proyecto-viviana/proyecto-viviana` — a repo that does
 * not exist. Every GitHub URL on the site now derives from `REPO_URL`, so the
 * name can only be wrong in one place.
 */

/** The canonical repository. Matches `origin` and every package's `repository.url`. */
export const REPO_URL = "https://github.com/proyecto-viviana/ui";

/** The npm organization the packages publish under. */
export const NPM_ORG_URL = "https://www.npmjs.com/org/proyecto-viviana";

/** A package's source directory on the default branch. */
export function repoPackageUrl(dir: string): string {
  return `${REPO_URL}/tree/main/packages/${dir}`;
}

/** A path inside the repo on the default branch, e.g. `blob/main/LICENSE`. */
export function repoUrl(path: string): string {
  return `${REPO_URL}/${path.replace(/^\/+/, "")}`;
}
