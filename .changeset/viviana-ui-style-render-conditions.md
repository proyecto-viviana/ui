---
"@proyecto-viviana/ui": patch
---

Fix custom components that passed boolean render conditions to the S2 `style()`
macro without the `is`/`allows` prefix it requires. The macro only treats
`default`, CSS conditions, and `is*`/`allows*` keys as runtime conditions, so
`withHeader`, `user`, `inactive`, `active`, and `transparent` were silently
dropped — and where a boolean was the only runtime condition (`PageLayout`,
`ConversationBubble`) the style collapsed to a static class string that threw
`"<name> is not a function"` when called. Renamed the internal conditions to the
`is`-prefixed form (`isWithHeader`, `isUser`, `isInactive`, `isActive`,
`isTransparent`) with the public props unchanged, so `PageLayout`,
`Conversation`, `ProjectCard`, and `LateralNav` render and apply their
conditional styling correctly.
