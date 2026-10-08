/**
 * Byte-compare solid-spectrum `prose` with the pinned @react-spectrum/ai macro.
 * Loaded by tsx, not Vite: the vendored oracle resolves @adobe/spectrum-tokens
 * through solid-spectrum/node_modules via NODE_PATH.
 */
import Module from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "../../..");
const tokenHost = path.join(root, "packages/solid-spectrum/node_modules");
process.env.NODE_PATH = [process.env.NODE_PATH, tokenHost].filter(Boolean).join(path.delimiter);
(Module as unknown as { _initPaths(): void })._initPaths();

type ProseFn = (
  this: { addAsset(asset: { type: string; content: string }): void } | void,
) => string;

function capture(prose: ProseFn) {
  let css = "";
  const cls = prose.call({
    addAsset(asset) {
      css = asset.content;
    },
  });
  return { cls, css };
}

const upstreamHref = pathToFileURL(
  path.join(root, "react-spectrum/packages/@react-spectrum/ai/src/style/prose.ts"),
).href;
const localHref = pathToFileURL(path.join(root, "packages/solid-spectrum/src/style/prose.ts")).href;

Promise.all([import(upstreamHref), import(localHref)])
  .then(([upstream, local]) => {
    const oracle = capture(upstream.prose as ProseFn);
    const port = capture(local.prose as ProseFn);
    if (oracle.cls !== port.cls || oracle.css !== port.css) {
      process.stderr.write(
        `MISMATCH class oracle=${oracle.cls} port=${port.cls} len oracle=${oracle.css.length} port=${port.css.length}\n`,
      );
      const limit = Math.max(oracle.css.length, port.css.length);
      for (let i = 0; i < limit; i++) {
        if (oracle.css[i] !== port.css[i]) {
          process.stderr.write(
            `first diff at ${i}: oracle=${JSON.stringify(oracle.css.slice(Math.max(0, i - 40), i + 40))} port=${JSON.stringify(port.css.slice(Math.max(0, i - 40), i + 40))}\n`,
          );
          break;
        }
      }
      process.exit(1);
    }
    process.stdout.write(`MATCH class=${port.cls} len=${port.css.length}\n`);
  })
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
