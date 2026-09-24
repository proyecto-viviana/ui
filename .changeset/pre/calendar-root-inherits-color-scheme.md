---
"@proyecto-viviana/solid-spectrum": patch
---

Calendar and RangeCalendar: the root no longer sets its own `color-scheme` from the provider variable. Upstream's `calendarStyles` inherit the scheme from the surrounding tree, as every non-overlay S2 component does; ours reset it to `var(--s2-color-scheme)`, so a calendar outside its Provider's subtree (a copied or detached node) resolved light ink on a dark ground.
