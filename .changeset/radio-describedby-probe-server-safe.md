---
"@proyecto-viviana/solidaria": patch
---

`createRadio` no longer reads `document` during server rendering. Its `aria-describedby` probe for the group's description and error-message slot ids (`document.getElementById`) is client-only; on the server the slot ids are emitted as is, as `useSlotId` yields them before its layout effect, and the client probe drops the ids whose elements do not exist after hydration. A `RadioGroup` rendered through `renderToString` threw "ReferenceError: document is not defined" and the route's error boundary rendered instead of the group.
