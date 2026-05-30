# vendor/s2-docs

Read-only MDX sources copied verbatim from
`react-spectrum/packages/dev/s2-docs/pages/s2/` (Apache 2.0).

These files are inputs to `apps/comparison/scripts/import-s2-docs-mdx.ts`, which
transforms them into `apps/comparison/src/pages/components/<slug>.mdx`. Do not
hand-edit the files in this directory — edits belong on the transformed output
side, after the import script writes the file.

## Refresh

The upstream source is the local `react-spectrum/` checkout at the repo root
(gitignored, maintained by the developer):

```sh
vp run --filter @proyecto-viviana/comparison sync:vendor \
  -- --pages=Button,ComboBox,DatePicker
```

Omit `--pages=` to sync every `*.mdx` page from upstream.

The script reads from `react-spectrum/packages/dev/s2-docs/pages/s2/` and writes
the requested files into `pages/` here, then rewrites `NOTICE` with the upstream
package version (from `react-spectrum/package.json`) and the sync timestamp.

## License

See `../LICENSE-react-spectrum`. Upstream:
<https://github.com/adobe/react-spectrum>.
