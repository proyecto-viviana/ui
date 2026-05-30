# Vendored S2 prop tables

Each `<Export>.mdx` holds the exact `Name | Type | Default | Description` API
table that `react-spectrum.adobe.com` renders for that export. (They use the
`.mdx` extension — like the sibling `../pages/*.mdx` — so the repo formatter,
which mangles `|` inside code spans in markdown tables, leaves them untouched.)

Provenance: the upstream tables are generated from TypeScript by the
react-spectrum docs tooling (`docs:@react-spectrum/s2`), which is not a static
file in the `react-spectrum/` checkout. These tables are therefore captured from
the published S2 docs via the React Spectrum S2 docs MCP
(`get_s2_page <Component> --section API`) and pasted verbatim. To refresh, re-run
that query and replace the table body.

Read at build time by `src/components/PropTable.astro` via
`src/data/prop-tables.ts`. Do not hand-edit the rows; copy upstream.
