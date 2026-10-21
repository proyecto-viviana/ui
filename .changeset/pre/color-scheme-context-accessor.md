---
"@proyecto-viviana/solid-spectrum": minor
"@proyecto-viviana/ui": minor
---

`ColorSchemeContext` now carries an accessor, not the scheme string: its type is `Context<Accessor<ColorScheme> | null>` where it was `Context<ColorScheme | null>`. The string was the scheme the `Provider` mounted with, so a consumer never saw a later change, and Solid's dev build reported the read as `STRICT_READ_UNTRACKED`.

A consumer that reads the context must call the value, inside a tracking scope:

```tsx
// before
const scheme = useContext(ColorSchemeContext); // "light" | "dark" | "light dark" | null
<div data-scheme={scheme ?? "light dark"} />;

// after
const scheme = useContext(ColorSchemeContext); // Accessor<ColorScheme> | null
<div data-scheme={scheme?.() ?? "light dark"} />;
```

A caller that provides the context itself must pass an accessor: `<ColorSchemeContext value={() => "dark"}>`. `Provider` and `useTheme` are unchanged; `useTheme().colorScheme` was already live.
