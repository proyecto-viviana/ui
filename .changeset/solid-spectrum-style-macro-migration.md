---
"@proyecto-viviana/solid-spectrum": patch
---

Route component styling off invented Tailwind-style utility classes and through the S2 `style()`/`css()` macro so it ships as emitted atomic CSS to consumers. Field primitives, `Well`, `Separator`/`FieldError`/`Popover` chrome, `ClearButton`/`FieldButton`/`LogicButton`, `Modal`/`Tray`/`UIIcon`/`ListBox`/`Select`, the menu wrappers, `Flex`/`Grid` layout primitives, `ColorPicker`/`StepList`/`TabSwitch`, `ColorEditor`/`ContextualHelpTrigger`, landmark styling, and the story error boundary now emit their rules through the macro rather than relying on utilities that never shipped. No public export or API changes; the emitted CSS grows because previously-invented utilities are now real atomic rules.
