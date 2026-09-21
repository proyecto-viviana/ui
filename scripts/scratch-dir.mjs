// The directories the pack scripts `rmSync` come from the environment, so an
// override is checked rather than trusted: it must sit strictly under the OS
// temp directory and must neither hold nor sit inside the repository.
import { existsSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

// Resolve symlinks on the part of the path that exists, so a link under the
// temp directory cannot point the delete somewhere else.
function realPath(path) {
  let head = resolve(path);
  const tail = [];
  while (!existsSync(head)) {
    tail.unshift(basename(head));
    head = dirname(head);
  }
  return join(realpathSync(head), ...tail);
}

function isInside(child, parent) {
  const rel = relative(parent, child);
  return rel !== "" && rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
}

/**
 * Returns `env[variable]`, or `join(tmpdir(), fallbackName)` when unset, after
 * refusing any path a recursive delete must not reach.
 */
export function scratchDir(variable, fallbackName, { repoRoot, env = process.env }) {
  const requested = env[variable];
  const path = realPath(requested ?? join(tmpdir(), fallbackName));
  const tmpRoot = realPath(tmpdir());
  const repo = realPath(repoRoot);
  const refuse = (why) => {
    throw new Error(`${variable}=${requested ?? path} refused: ${why}. Nothing was deleted.`);
  };

  if (!isInside(path, tmpRoot)) refuse(`not inside the temp directory ${tmpRoot}`);
  if (path === repo || isInside(repo, path)) refuse(`it contains the repository ${repo}`);
  if (isInside(path, repo)) refuse(`it is inside the repository ${repo}`);
  return path;
}
