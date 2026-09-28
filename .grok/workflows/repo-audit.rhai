let meta = #{
    name: "repo-audit",
    description: "Read-only audit of accessibility, React Aria parity, Solid, TypeScript, architecture, docs, agent setup, release, and security",
    when_to_use: "While the certified browser suite cannot run. One workflow, panels of eight, no edits and no browser.",
    phases: [
        #{ title: "Survey", detail: "eight cross-cutting reviewers" },
        #{ title: "Security", detail: "one reviewer so the live panel stays at eight" },
        #{ title: "Parity", detail: "eight component families across the layers" },
        #{ title: "Verify survey", detail: "skeptics for the survey and security lists" },
        #{ title: "Verify parity", detail: "one skeptic per parity family" },
        #{ title: "Report", detail: "one writer from the verified JSON" },
    ],
};

let finding_schema = #{
    "type": "object",
    "required": ["findings"],
    "properties": #{
        "findings": #{
            "type": "array",
            "maxItems": 6,
            "items": #{
                "type": "object",
                "required": ["file", "line", "severity", "issue", "ticket", "next"],
                "properties": #{
                    "file": #{ "type": "string" },
                    "line": #{ "type": "string" },
                    "severity": #{ "type": "string" },
                    "issue": #{ "type": "string" },
                    "ticket": #{ "type": "string" },
                    "next": #{ "type": "string" },
                },
            },
        },
    },
};

let verdict_schema = #{
    "type": "object",
    "required": ["verdicts"],
    "properties": #{
        "verdicts": #{
            "type": "array",
            "maxItems": 6,
            "items": #{
                "type": "object",
                "required": ["index", "disposition", "reason", "evidence"],
                "properties": #{
                    "index": #{ "type": "number" },
                    "disposition": #{ "type": "string" },
                    "reason": #{ "type": "string" },
                    "evidence": #{ "type": "string" },
                },
            },
        },
    },
};

let report_schema = #{
    "type": "object",
    "required": ["report"],
    "properties": #{
        "report": #{ "type": "string" },
        "confirmed_new": #{ "type": "number" },
        "already_ticketed": #{ "type": "number" },
        "rejected": #{ "type": "number" },
        "unconfirmed": #{ "type": "number" },
    },
};

fn trimmed(value) {
    if type_of(value) == "string" {
        value.trim();
        value
    } else if value == () {
        ""
    } else {
        value.to_string()
    }
}

fn starts_with(text, prefix) {
    if type_of(text) != "string" || type_of(prefix) != "string" {
        return false;
    }
    if prefix.len() > text.len() {
        return false;
    }
    text.sub_string(0, prefix.len()) == prefix
}

fn starts_with_any(text, prefixes) {
    if type_of(prefixes) != "array" {
        return false;
    }
    let i = 0;
    while i < prefixes.len() {
        if starts_with(text, prefixes[i]) {
            return true;
        }
        i += 1;
    }
    false
}

fn base_rules() {
    let p = "You are a read-only auditor of /home/emoporemilio/projects/viviana-hub/ui.\n";
    p += "Use read_file and rg. Do not edit files. Do not run Playwright. Do not start a server. Do not run the certified suite. Do not add a dependency.\n";
    p += "Open the paths named below before you answer. A finding whose file you did not open is invalid.\n";
    p += "Return at most 6 findings. An empty list is valid after you have read the code.\n";
    p += "Each finding: file is a repo-relative path with no line number in it; line is the line number as text; severity is blocker, gap, or hygiene; issue is one sentence; ticket is an existing id like #123 or empty; next is one sentence and not a patch.\n";
    p += "Search tickets with rg --no-ignore -g '*.md' under .claude/tickets. The default search skips .claude.\n";
    p += "Held work stays held. You may cite #115 #125 #96 #109 #1 #90 #245 #246 #56 #220 #240 #537 #194. Do not propose an owner decision, a new public name, or a publish.\n";
    p += "Upstream is only react-spectrum/packages. Do not read react-spectrum/examples, starters, or @spectrum-icons.\n";
    p += "Styled Spectrum 2 source is react-spectrum/packages/@react-spectrum/s2/src. Ignore the thin v3 package index files.\n";
    p += "Do not invent a size, name, or attribute. Skip locale JSON catalogs.\n";
    p
}

fn survey_prompt(read_these, bar) {
    let p = base_rules();
    p += "\nRead these paths:\n";
    p += read_these;
    p += "\nA finding is:\n";
    p += bar;
    p += "\n";
    p
}

fn parity_prompt(family, read_these) {
    let p = base_rules();
    p += "\nThis pass is React Aria / Spectrum S2 parity for one family, at every layer.\n";
    p += "Layers: packages/solid-stately against react-spectrum/packages/@react-stately and react-stately; packages/solidaria against @react-aria and react-aria; packages/solidaria-components against react-aria-components/src; packages/solid-spectrum against @react-spectrum/s2/src.\n";
    p += "Open viviana-ui only when a file there differs from the solid-spectrum file of the same path. Do not review viviana-ui as a second Adobe port.\n";
    p += "Family: ";
    p += family;
    p += "\nRead these paths, and the matching upstream file for each behavior you check:\n";
    p += read_these;
    p += "\nA finding is a behavior, name, or attribute the upstream file shows and the Solid file does not, or a user-visible extra the Solid file adds. Put an existing ticket id in ticket and leave next as the ticket id when the gap is already tracked.\n";
    p
}

fn skeptic_prompt(label, findings_json, prefixes_json) {
    let p = "You are a skeptic for a read-only audit of /home/emoporemilio/projects/viviana-hub/ui.\n";
    p += "Use read_file. Do not edit. Do not run Playwright.\n";
    p += "Open every cited file and line yourself. Do not add findings.\n";
    p += "Agent: ";
    p += label;
    p += "\nAllowed path prefixes. A file outside them is reject:\n";
    p += prefixes_json;
    p += "\nFindings JSON:\n";
    p += findings_json;
    p += "\nReturn one verdict per finding index, using that index.\n";
    p += "disposition real: the opened lines say what the issue says.\n";
    p += "disposition already-ticketed: the lines are real and the ticket file exists under .claude/tickets.\n";
    p += "disposition reject: the quote is missing, the path is outside the prefixes, or the upstream file does not say that.\n";
    p += "evidence is a short quote you read, with the path. Empty evidence is invalid.\n";
    p
}

fn writer_prompt(payload) {
    let p = "Write a markdown audit report from this JSON only. Do not add findings that are not in the JSON.\n";
    p += "Repo: /home/emoporemilio/projects/viviana-hub/ui. The certified browser suite was not run.\n";
    p += "Sections, in order: counts (confirmed new, already ticketed, rejected, unconfirmed, failed agents); confirmed new findings grouped by category with severity, file:line, evidence, and next; already ticketed; doc and agent-setup cuts; not reviewed (pixel diffs, hydration, keyboard timing, and anything that needs a browser).\n";
    p += "The report field is that markdown. Set confirmed_new, already_ticketed, rejected, and unconfirmed to the counts in the JSON.\n\n";
    p += payload;
    p
}

fn finder_jobs(items, schema) {
    let jobs = [];
    for item in items {
        jobs.push(#{
            prompt: item.prompt,
            label: item.kind + ":" + item.label,
            capability_mode: "read-only",
            output_schema: schema,
        });
    }
    jobs
}

fn collect(item, result) {
    let kept = [];
    let dropped = 0;
    let ok = false;
    if result != () && result.success {
        ok = true;
    }
    if ok && result.output != () && result.output.findings != () {
        for f in result.output.findings {
            let file = trimmed(f.file);
            if starts_with_any(file, item.prefixes) {
                kept.push(#{
                    file: file,
                    line: trimmed(f.line),
                    severity: trimmed(f.severity),
                    issue: trimmed(f.issue),
                    ticket: trimmed(f.ticket),
                    next: trimmed(f.next),
                    category: item.category,
                    agent: item.label,
                });
            } else {
                dropped += 1;
                log("dropped out-of-scope " + item.label + " " + file);
            }
        }
    }
    if !ok {
        log("finder failed " + item.label);
    }
    #{
        label: item.label,
        category: item.category,
        kind: item.kind,
        prefixes: item.prefixes,
        findings: kept,
        dropped: dropped,
        ok: ok,
    }
}

fn zip_collect(items, results) {
    let bundles = [];
    let i = 0;
    for item in items {
        let result = ();
        if i < results.len() {
            result = results[i];
        }
        bundles.push(collect(item, result));
        i += 1;
    }
    bundles
}

fn apply_verdicts(bundle, result) {
    let confirmed = [];
    let rejected = [];
    let unconfirmed = [];
    let findings = bundle.findings;
    if findings.len() == 0 {
        return #{ confirmed: confirmed, rejected: rejected, unconfirmed: unconfirmed };
    }
    let usable = false;
    if result != () && result.success && result.output != () && result.output.verdicts != () {
        usable = true;
    }
    if !usable {
        log("skeptic missing " + bundle.label);
        for f in findings {
            unconfirmed.push(f);
        }
        return #{ confirmed: confirmed, rejected: rejected, unconfirmed: unconfirmed };
    }
    let i = 0;
    while i < findings.len() {
        let verdict = ();
        for v in result.output.verdicts {
            if v.index != () && v.index == i {
                verdict = v;
            }
        }
        if verdict == () {
            unconfirmed.push(findings[i]);
        } else {
            let evidence = trimmed(verdict.evidence);
            let disposition = trimmed(verdict.disposition);
            if (disposition == "real" || disposition == "already-ticketed") && evidence != "" {
                confirmed.push(#{
                    file: findings[i].file,
                    line: findings[i].line,
                    severity: findings[i].severity,
                    issue: findings[i].issue,
                    ticket: findings[i].ticket,
                    next: findings[i].next,
                    category: findings[i].category,
                    agent: findings[i].agent,
                    disposition: disposition,
                    evidence: evidence,
                });
            } else if disposition == "reject" {
                rejected.push(#{
                    file: findings[i].file,
                    issue: findings[i].issue,
                    agent: findings[i].agent,
                    reason: trimmed(verdict.reason),
                });
            } else {
                unconfirmed.push(findings[i]);
            }
        }
        i += 1;
    }
    #{ confirmed: confirmed, rejected: rejected, unconfirmed: unconfirmed }
}

fn run_skeptics(bundles, schema) {
    let jobs = [];
    let active = [];
    for b in bundles {
        if b.findings.len() > 0 {
            jobs.push(#{
                prompt: skeptic_prompt(b.label, json_encode(b.findings), json_encode(b.prefixes)),
                label: "verify:" + b.label,
                capability_mode: "read-only",
                output_schema: schema,
            });
            active.push(b);
        }
    }
    let results = [];
    let start = 0;
    while start < jobs.len() {
        let panel = [];
        let i = start;
        while i < jobs.len() && panel.len() < 8 {
            panel.push(jobs[i]);
            i += 1;
        }
        if panel.len() > 0 {
            let part = parallel(panel);
            for r in part {
                results.push(r);
            }
        }
        start = i;
    }
    let confirmed = [];
    let rejected = [];
    let unconfirmed = [];
    let j = 0;
    for b in active {
        let result = ();
        if j < results.len() {
            result = results[j];
        }
        let applied = apply_verdicts(b, result);
        for row in applied.confirmed {
            confirmed.push(row);
        }
        for row in applied.rejected {
            rejected.push(row);
        }
        for row in applied.unconfirmed {
            unconfirmed.push(row);
        }
        j += 1;
    }
    #{ confirmed: confirmed, rejected: rejected, unconfirmed: unconfirmed }
}

let parity_prefixes = [
    "packages/solid-stately/",
    "packages/solidaria/",
    "packages/solidaria-components/",
    "packages/solid-spectrum/",
    "packages/viviana-ui/",
    "react-spectrum/packages/@react-stately/",
    "react-spectrum/packages/react-stately/",
    "react-spectrum/packages/@react-aria/",
    "react-spectrum/packages/react-aria/",
    "react-spectrum/packages/react-aria-components/",
    "react-spectrum/packages/@react-spectrum/s2/src/",
    "react-spectrum/packages/@react-types/",
];

let survey = [];
survey.push(#{
    label: "a11y-headless",
    category: "accessibility-headless",
    kind: "survey",
    prefixes: [
        "packages/solidaria/",
        "packages/solidaria-components/",
        "apps/comparison/e2e/",
        "react-spectrum/packages/@react-aria/",
        "react-spectrum/packages/react-aria/",
        "react-spectrum/packages/react-aria-components/",
    ],
    prompt: survey_prompt(
        "packages/solidaria/src, packages/solidaria-components/src, apps/comparison/e2e/drivers/ax.ts, apps/comparison/e2e/drivers/focus.ts, apps/comparison/e2e/drivers/rtl.ts.",
        "A role, accessible name, keyboard, or RTL contract that disagrees with the pinned React Aria source or with the certified driver that would have checked it.",
    ),
});
survey.push(#{
    label: "a11y-styled",
    category: "accessibility-styled",
    kind: "survey",
    prefixes: [
        "packages/solid-spectrum/",
        "packages/viviana-ui/",
        ".claude/current/",
        "apps/comparison/e2e/",
        "react-spectrum/packages/@react-spectrum/s2/",
    ],
    prompt: survey_prompt(
        "packages/solid-spectrum/src focus and color styles, .claude/current/wcag-258-target-size.md, apps/comparison/e2e/drivers/contrast.ts, apps/comparison/e2e/drivers/target-size.ts.",
        "A focus, contrast, or target-size rule the styled layer contradicts. Report a contrast ratio only when you computed it from tokens you opened.",
    ),
});
survey.push(#{
    label: "solid",
    category: "solidjs",
    kind: "survey",
    prefixes: [
        "packages/solid-stately/",
        "packages/solidaria/",
        "packages/solidaria-components/",
        "node_modules/solid-js/",
        "node_modules/@solidjs/diagnostics/",
    ],
    prompt: survey_prompt(
        "node_modules/solid-js/skills/reactivity-diagnostics/SKILL.md and node_modules/@solidjs/diagnostics/skills/agent-loops/SKILL.md as the rubric, then packages/solid-stately/src, packages/solidaria/src, packages/solidaria-components/src.",
        "A Solid 2 footgun: a one-argument createEffect, onCleanup nested inside onSettled, a reactive write in an owned scope, children() called outside the owner that must see updates, a context value that cannot update, or a server createEffect used as a browser listener. Cite #531, #543, or #533 when that ticket already owns it.",
    ),
});
survey.push(#{
    label: "typescript",
    category: "typescript",
    kind: "survey",
    prefixes: [
        "packages/",
        "tsconfig.typecheck.json",
        "scripts/",
    ],
    prompt: survey_prompt(
        "tsconfig.typecheck.json, then @ts-nocheck and as any under packages/*/src.",
        "A public type hole. #3 and #153 already own the nocheck burn-down. Count those files and sample only a hole those tickets do not already name.",
    ),
});
survey.push(#{
    label: "architecture",
    category: "architecture",
    kind: "survey",
    prefixes: [
        "packages/",
        "scripts/",
        ".claude/current/",
        "docs/",
    ],
    prompt: survey_prompt(
        ".claude/current/architecture.md, docs/adr/0001-s2-styling-source-of-truth.md, scripts/check-layer-boundary.ts, scripts/layer-boundary-baseline.json, scripts/check-entry-import-budget.ts, scripts/entry-import-budget.json, packages/kumo/src, packages/geist/src.",
        "Behavior implemented above the layer that owns it, a solid-spectrum / viviana-ui pair the guard says must match and does not, or a root-barrel import that fights the shrink-only ceiling. Kumo and Geist are button-only experiments: at most one finding if they do more than theme and compose.",
    ),
});
survey.push(#{
    label: "docs",
    category: "documentation",
    kind: "survey",
    prefixes: [
        "AGENTS.md",
        "CLAUDE.md",
        ".claude/current/",
        "docs/",
        "packages/",
    ],
    prompt: survey_prompt(
        "AGENTS.md, CLAUDE.md, .claude/current, docs/adr, and the README.md files in packages/solid-stately, solidaria, solidaria-components, solid-spectrum, viviana-ui, kumo, and geist.",
        "A sentence that is false against the code, the same fact in two docs that can drift, or a current doc that points at a deleted path. Say where the fact should live. Do not rewrite the docs.",
    ),
});
survey.push(#{
    label: "agent-setup",
    category: "agent-setup",
    kind: "survey",
    prefixes: [
        "AGENTS.md",
        "CLAUDE.md",
        ".claude/",
        ".grok/",
    ],
    prompt: survey_prompt(
        "AGENTS.md, CLAUDE.md, .claude/current/README.md, .claude/current/tooling.md, .claude/skills, and the size of .claude/tickets.",
        "A cold agent loads too much, two instructions contradict, or a skill names a command that does not exist. Each next step names the file a cut or a split would change.",
    ),
});
survey.push(#{
    label: "release",
    category: "release",
    kind: "survey",
    prefixes: [
        ".claude/current/",
        "packages/",
        ".changeset/",
        ".github/",
        "pnpm-workspace.yaml",
        "package.json",
    ],
    prompt: survey_prompt(
        ".claude/current/release-policy.md, each publishable package.json (name, exports, peers, files), .changeset, .github/workflows/certification-gates.yml, and the release workflow.",
        "A package that publishes something the policy does not name, a peer that does not match the catalog, or a gate that does not cover the package it claims to. Do not bump a version.",
    ),
});

let security = #{
    label: "security",
    category: "security",
    kind: "security",
    prefixes: [
        ".github/",
        "pnpm-workspace.yaml",
        "pnpm-lock.yaml",
        "package.json",
        "packages/",
        "apps/",
        "scripts/",
    ],
    prompt: survey_prompt(
        ".github/workflows permissions, pnpm-workspace.yaml overrides, install scripts, and innerHTML, dangerouslySetInnerHTML, and eval under packages and apps. Dependabot advisory 70 is already known.",
        "A concrete sink or a workflow permission wider than the job. Name the impact and the file. Do not write exploit steps.",
    ),
};

let parity = [];
parity.push(#{
    label: "buttons",
    category: "parity-buttons",
    kind: "parity",
    prefixes: parity_prefixes,
    prompt: parity_prompt(
        "Buttons and actions",
        "packages/solidaria/src/button, packages/solidaria/src/interactions, packages/solidaria/src/focus, packages/solidaria-components/src/Button.tsx, packages/solidaria-components/src/ToggleButton.tsx, packages/solidaria-components/src/ActionGroup.tsx, packages/solidaria-components/src/ActionBar.tsx, packages/solidaria-components/src/FileTrigger.tsx, and the matching solid-spectrum and s2/src files.",
    ),
});
parity.push(#{
    label: "forms",
    category: "parity-forms",
    kind: "parity",
    prefixes: parity_prefixes,
    prompt: parity_prompt(
        "Forms and fields",
        "packages/solidaria/src/textfield, numberfield, searchfield, checkbox, radio, switch, form, label, packages/solidaria-components/src/TextField.tsx, Checkbox.tsx, RadioGroup.tsx, Switch.tsx, Form.tsx, NumberField.tsx, SearchField.tsx, and the matching s2/src files.",
    ),
});
parity.push(#{
    label: "collections",
    category: "parity-collections",
    kind: "parity",
    prefixes: parity_prefixes,
    prompt: parity_prompt(
        "Collections, including collection drag-and-drop",
        "packages/solid-stately/src/collections, selection, list, grid, table, tree; packages/solidaria/src/collections, selection, listbox, gridlist, table, tree, tag, dnd; packages/solidaria-components/src/ListBox.tsx, GridList.tsx, Table.tsx, Tree.tsx, TagGroup.tsx, DragAndDrop.tsx. Overlay focus belongs to the menus family. Do not review it here.",
    ),
});
parity.push(#{
    label: "overlays",
    category: "parity-overlays",
    kind: "parity",
    prefixes: parity_prefixes,
    prompt: parity_prompt(
        "Menus and overlays",
        "packages/solidaria/src/menu, overlays, popover, dialog, tooltip; packages/solidaria-components/src/Menu.tsx, Popover.tsx, Dialog.tsx, Tooltip.tsx, Modal.tsx. Collection drag-and-drop belongs to the collections family. Do not review it here.",
    ),
});
parity.push(#{
    label: "pickers",
    category: "parity-pickers",
    kind: "parity",
    prefixes: parity_prefixes,
    prompt: parity_prompt(
        "Pickers",
        "packages/solidaria/src/select, combobox, autocomplete; packages/solidaria-components/src/Select.tsx, ComboBox.tsx, Autocomplete.tsx, and the matching s2/src Picker, ComboBox, and Autocomplete files. #115 and #125 stay held: cite them, do not propose an API decision.",
    ),
});
parity.push(#{
    label: "dates",
    category: "parity-dates",
    kind: "parity",
    prefixes: parity_prefixes,
    prompt: parity_prompt(
        "Dates",
        "packages/solidaria/src/calendar, datepicker; packages/solidaria-components/src/Calendar.tsx, RangeCalendar.tsx, DateField.tsx, DatePicker.tsx, TimeField.tsx, and the matching s2/src files.",
    ),
});
parity.push(#{
    label: "color",
    category: "parity-color",
    kind: "parity",
    prefixes: parity_prefixes,
    prompt: parity_prompt(
        "Color and sliders",
        "packages/solidaria/src/color, slider; packages/solidaria-components/src/Color.tsx, ColorEditor.tsx, Slider.tsx, and the matching s2/src color and slider files. #74 and #76 own RangeSlider structure: cite them, do not redesign it.",
    ),
});
parity.push(#{
    label: "navigation",
    category: "parity-navigation",
    kind: "parity",
    prefixes: parity_prefixes,
    prompt: parity_prompt(
        "Navigation, feedback, and the small leftovers",
        "Tabs, Breadcrumbs, Accordion, Disclosure, Toast, Meter, Progress, StepList, Toolbar, Link, Badge, Avatar, Divider, StatusLight, Skeleton, IllustratedMessage, InlineAlert, LabeledValue, Card, Provider, Virtualizer, DropZone, ContextualHelp, in solidaria, solidaria-components, and s2/src. Provider and Virtualizer live here. Collection drag-and-drop belongs to collections. Overlay focus belongs to menus and overlays.",
    ),
});

phase("Survey");
let survey_results = parallel(finder_jobs(survey, finding_schema));
let survey_bundles = zip_collect(survey, survey_results);
log("survey finders " + survey.len().to_string());

phase("Security");
let security_items = [];
security_items.push(security);
let security_results = parallel(finder_jobs(security_items, finding_schema));
let security_bundles = zip_collect(security_items, security_results);
for b in security_bundles {
    survey_bundles.push(b);
}

phase("Parity");
let parity_results = parallel(finder_jobs(parity, finding_schema));
let parity_bundles = zip_collect(parity, parity_results);
log("parity finders " + parity.len().to_string());

phase("Verify survey");
let survey_checked = run_skeptics(survey_bundles, verdict_schema);

phase("Verify parity");
let parity_checked = run_skeptics(parity_bundles, verdict_schema);

let confirmed = [];
let rejected = [];
let unconfirmed = [];
for row in survey_checked.confirmed {
    confirmed.push(row);
}
for row in parity_checked.confirmed {
    confirmed.push(row);
}
for row in survey_checked.rejected {
    rejected.push(row);
}
for row in parity_checked.rejected {
    rejected.push(row);
}
for row in survey_checked.unconfirmed {
    unconfirmed.push(row);
}
for row in parity_checked.unconfirmed {
    unconfirmed.push(row);
}

let failed_agents = [];
for b in survey_bundles {
    if !b.ok {
        failed_agents.push(b.label);
    }
}
for b in parity_bundles {
    if !b.ok {
        failed_agents.push(b.label);
    }
}

let confirmed_new = [];
let already = [];
for row in confirmed {
    if row.disposition == "already-ticketed" || row.ticket != "" {
        already.push(row);
    } else {
        confirmed_new.push(row);
    }
}

let payload = #{
    confirmed_new_count: confirmed_new.len(),
    already_ticketed_count: already.len(),
    rejected_count: rejected.len(),
    unconfirmed_count: unconfirmed.len(),
    failed_agents: failed_agents,
    confirmed_new: confirmed_new,
    already_ticketed: already,
    rejected: rejected,
    unconfirmed: unconfirmed,
};

phase("Report");
let writer = agent(
    writer_prompt(json_encode(payload)),
    #{
        label: "report",
        capability_mode: "read-only",
        output_schema: report_schema,
    },
);

let report = "";
if writer != () && writer.success && writer.output != () && writer.output.report != () {
    report = trimmed(writer.output.report);
} else {
    log("writer failed, saving the verified JSON");
    report = json_encode(payload);
}

let path = write_scratch_file("audit-report.md", report);
log(
    confirmed_new.len().to_string()
    + " confirmed new, "
    + already.len().to_string()
    + " already ticketed, "
    + rejected.len().to_string()
    + " rejected, "
    + unconfirmed.len().to_string()
    + " unconfirmed"
);
complete(#{
    path: path,
    report: report,
    confirmed_new: confirmed_new.len(),
    already_ticketed: already.len(),
    rejected: rejected.len(),
    unconfirmed: unconfirmed.len(),
    failed_agents: failed_agents,
});
