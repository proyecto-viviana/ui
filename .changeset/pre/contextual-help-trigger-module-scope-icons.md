---
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

ContextualHelpTrigger builds its help and info icons inside components instead of binding them to module-scope `const`s. A module-scope JSX value is built when the module is evaluated: on a server that has already rendered a page, it reaches `ssrHydrationKey()` with no owner and throws `getNextContextId cannot be used under non-hydrating context`, so the whole menu module fails to evaluate and every route that imports anything from it serves an empty document with HTTP 200 — twenty of the docs app's 174 routes. In the browser the same binding is one DOM node shared by every trigger on the page, so a second trigger takes the first one's icon. Upstream renders its icon inside `UnavailableIconWrapper` for the same reason.
