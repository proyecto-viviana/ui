---
"@proyecto-viviana/ui": minor
---

Semantic status trio (negative / warning / success) across every status surface.

- New cohesive `green` ramp backs `positive`/`success` and by-name `green`, so
  success stops aliasing blue and reads as a real state next to accent. Every
  stop is contrast-matched to its amber sibling, so red/amber/green sit at one
  weight wherever the three appear together. `warning` stays on amber, distinct
  from the create-yellow wash.
- `Button`/`LinkButton` drop the inherited `premium` and `genai` variants and
  gain `warning` and `success` — negative's semantic counterparts, saturated
  fill with white ink on the amber and green channels. (Removing `premium`/
  `genai` is a breaking change for consumers that referenced them.)
- `StatusLight`, `InlineAlert`, and `Meter` accept a public `success`/`warning`
  variant that folds onto the canonical `positive`/`notice` channels.
- `Toast` gains the `notice` channel (its warning slot) with the diamond icon
  and a `ToastQueue.notice` method; `success` rides `positive`.
- Fixes a latent bug: portaled toasts inherited no color-scheme, so
  lightningcss's downlevelled `light-dark()` left the bold fills transparent on
  every variant. The region now carries the scheme atoms via `setColorScheme()`,
  restoring the solid fills (negative red, positive green, notice amber, info
  blue) with white ink.
