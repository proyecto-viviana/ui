---
"@proyecto-viviana/solidaria-components": patch
---

Release Input and TextArea input-id registrations outside the disposing owner, and skip writes after the TextField owner is disposed. Removing only the control also clears its registration without a disposing-owner write.
