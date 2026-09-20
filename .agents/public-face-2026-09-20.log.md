# Public Face Landing Log — 2026-09-20

## Files Landed
- `README.md`
- `CONTRIBUTING.md`
- `packages/geist/README.md`
- `packages/kumo/README.md`
- `packages/solid-spectrum/README.md`
- `packages/solid-stately/README.md`
- `packages/solidaria-components/README.md`
- `packages/solidaria/README.md`
- `packages/viviana-ui/README.md`

## Corrections Applied or Skipped
- **Entry 1 (Adobe section names no pinned version)**: Applied. Inserted pinned upstream bullet under the existing `Source:` bullet in `CREDITS.md`.
- **Entry 2 (Kumo version pair is unlinked)**: Applied. Inserted current source reference bullet directly after `Initial source version` bullet in `CREDITS.md`.
- **Entry 3 (Bare URL in Geist section)**: Applied. Wrapped `https://vercel.com/geist/button` with angle brackets `<https://vercel.com/geist/button>` in `CREDITS.md`.
- **Skipped**: None. All three entries were unambiguous.

## Grep Output
`grep -rn '@next' README.md CONTRIBUTING.md packages/*/README.md`:
```
README.md:50:npm install @proyecto-viviana/ui@rc solid-js@next @solidjs/web@next
packages/solid-spectrum/README.md:16:npm install @proyecto-viviana/solid-spectrum@rc solid-js@next @solidjs/web@next
packages/solid-stately/README.md:16:npm install @proyecto-viviana/solid-stately@rc solid-js@next @solidjs/web@next
packages/solidaria-components/README.md:16:npm install @proyecto-viviana/solidaria-components@rc solid-js@next @solidjs/web@next
packages/solidaria/README.md:16:npm install @proyecto-viviana/solidaria@rc solid-js@next @solidjs/web@next
packages/viviana-ui/README.md:16:npm install @proyecto-viviana/ui@rc solid-js@next @solidjs/web@next
```

## Commit SHA
- Commit SHA: `a6a9e71702d58949d7dff6ad77f5aac715cf2162` (`a6a9e717`)
- Commit message: `#548: land the package READMEs, the front door and CONTRIBUTING`
