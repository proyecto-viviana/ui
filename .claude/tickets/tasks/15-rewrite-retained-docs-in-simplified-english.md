---
id: 15
type: task
title: "Rewrite retained documentation in simplified English"
created: 2026-08-20
status: verified
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "opened from the owner request to make the documentation much simpler",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "rewrote the current-doc index and admin reference with simplified technical language",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "completed a first rewrite pass across all retained human-authored current docs and removed copied volatile evidence counts",
    }
  - {
      state: merged,
      at: 2026-08-20,
      note: "rewrote the complete retained set with the agreed language and authority model",
    }
  - {
      state: verified,
      at: 2026-08-20,
      note: "reviewed all retained human-authored current docs with the Simplified English workflow",
    }
---

The retained documentation must be easy to scan without losing technical
meaning. Apply an ASD-STE100 Issue 9-aligned workflow after structural cleanup.
Do not claim formal compliance.

## Terminology controls

- Use `accepted` only for the repository evidence outcome defined by
  `certification.md`.
- Use `inventory` for file, label, or declaration presence reports.
- Use `regression guard` for a command that freezes new gaps.
- Use `acceptance gate` for a command that proves required current evidence.
- Preserve package names, public APIs, commands, identifiers, and requirement
  levels.

## Scope

- Classify each retained block as a procedure, description, requirement, code
  sample, quotation, or data.
- Use active voice and one term for each concept.
- Keep procedure sentences at 20 words or fewer.
- Keep description sentences at 25 words or fewer.
- Put conditions before dependent actions.
- Use one instruction per sentence.
- Remove semicolons and unnecessary narrative transitions.
- Preserve links, code, names, numbers, and normative force.

## Done when

The retained human-authored documentation is STE-aligned, concise, and
technically equivalent to its verified sources.

## Verified evidence

The new index uses a seven-step reading path, direct verbs, short sentences, and
one term for each authority. The admin reference, ticket records, and generated
views use the same terms. Do not claim formal ASD-STE100 compliance.

The first complete retained-set pass is complete. It uses direct instructions,
shorter sentences, and one authority for each concept. Exact work state and test
results no longer live in stable prose. Do not claim formal ASD-STE100
compliance.

Future edits must preserve this language and authority model. Ticket #16 owns
the checks that can enforce the structural parts of the model.

## Relationship

Starts after #13 identifies the retained set. It does not rewrite generated
documentation from #14.
