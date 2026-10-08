let meta = #{
    name: "overnight-board",
    description: "Work the remaining ui board in ticket #87 order: finish #208, review the unpushed commits, then one ticket at a time until a hard stop",
    when_to_use: "Overnight on local main after the quota stop. One writer, no push, no publish, no certified suite.",
    phases: [
        #{ title: "Checkpoint", detail: "finish #208, review twenty commits, diagnose the nightly" },
        #{ title: "Campaign", detail: "remaining #544 children on this seat" },
        #{ title: "Foundation", detail: "#543, #533, and the #194 repair" },
        #{ title: "Census", detail: "hygiene, layer inventory, #136, then D13" },
        #{ title: "Remainder", detail: "every other open task in id order" },
        #{ title: "Release", detail: "local evidence only" },
        #{ title: "Report", detail: "scratch/overnight-board.md" },
    ],
};

let impl_schema = #{
    "type": "object",
    "required": ["outcome", "summary", "tests", "commit_message", "hold_reason", "dirty", "paths", "status_change", "eligibility_ok", "successor"],
    "properties": #{
        "outcome": #{ "type": "string" },
        "summary": #{ "type": "string" },
        "tests": #{ "type": "string" },
        "commit_message": #{ "type": "string" },
        "hold_reason": #{ "type": "string" },
        "dirty": #{ "type": "boolean" },
        "paths": #{ "type": "array", "items": #{ "type": "string" } },
        "status_change": #{ "type": "string" },
        "eligibility_ok": #{ "type": "boolean" },
        "successor": #{ "type": "string" },
    },
};

let skeptic_schema = #{
    "type": "object",
    "required": ["pass", "evidence", "dirty_beyond", "reason"],
    "properties": #{
        "pass": #{ "type": "boolean" },
        "evidence": #{ "type": "string" },
        "dirty_beyond": #{ "type": "boolean" },
        "reason": #{ "type": "string" },
    },
};

let commit_schema = #{
    "type": "object",
    "required": ["committed", "sha", "error", "retryable"],
    "properties": #{
        "committed": #{ "type": "boolean" },
        "sha": #{ "type": "string" },
        "error": #{ "type": "string" },
        "retryable": #{ "type": "boolean" },
    },
};

let review_schema = #{
    "type": "object",
    "required": ["sha", "defects"],
    "properties": #{
        "sha": #{ "type": "string" },
        "defects": #{
            "type": "array",
            "maxItems": 2,
            "items": #{
                "type": "object",
                "required": ["claim", "evidence"],
                "properties": #{
                    "claim": #{ "type": "string" },
                    "evidence": #{ "type": "string" },
                },
            },
        },
    },
};

let defect_schema = #{
    "type": "object",
    "required": ["real", "evidence"],
    "properties": #{
        "real": #{ "type": "boolean" },
        "evidence": #{ "type": "string" },
    },
};

let text_schema = #{
    "type": "object",
    "required": ["summary"],
    "properties": #{
        "summary": #{ "type": "string" },
        "ids": #{ "type": "array", "items": #{ "type": "number" } },
        "failing": #{ "type": "boolean" },
        "dirty": #{ "type": "boolean" },
        "tests": #{ "type": "string" },
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

fn lower(value) {
    let text = trimmed(value);
    text.to_lower()
}

fn cap(value, limit) {
    let text = trimmed(value);
    if text.len() > limit {
        text.sub_string(0, limit)
    } else {
        text
    }
}

fn base_rules() {
    let p = "You are one worker in /home/emoporemilio/projects/viviana-hub/ui on branch main.\n";
    p += "Before any edit, run: cd /home/emoporemilio/projects/viviana-hub && node vivianastack/src/cli.ts eligibility-view --root . --check\n";
    p += "Set eligibility_ok true only when that command says the view matches canonical policy. If it does not, edit nothing.\n";
    p += "Do not push, tag, publish, deploy, or run npm publish, changeset publish, or gh release. Do not run git reset, git clean, git stash, or git checkout -- .\n";
    p += "Do not commit. A later step commits. Do not start a workflow or a subagent.\n";
    p += "Do not add a dependency, run vp install, or mint a public name. If the ticket needs a new public name, hold and name #520.\n";
    p += "Do not add a viviana-native component. #62 and #145 stay closed.\n";
    p += "Do not edit .claude/worktrees. Do not edit README.md, CONTRIBUTING.md, CREDITS.md, packages/*/README.md, or page content under apps/web/src or apps/comparison/src. That is the public-face seat. If this ticket only needs those paths, outcome held and hold_reason public-face seat.\n";
    p += "The only pre-existing dirty product files are packages/solidaria-components/package.json, packages/solidaria-components/src/Dialog.tsx, packages/solidaria-components/src/index.ts, packages/solidaria-components/test/Dialog.ssr.test.tsx, packages/solidaria-components/test/Dialog.test.tsx, and untracked packages/solidaria-components/src/Heading.tsx and packages/solidaria-components/test/Heading.test.tsx. Leave them untouched unless this slice is #208.\n";
    p += "If git status shows any other dirty or untracked file you did not write in this slice, edit nothing further, set dirty true, and set outcome dirty-stop.\n";
    p += "S2 styles live only in solid-spectrum. Do not patch styling in apps/comparison. Match upstream under react-spectrum/packages. Do not read react-spectrum/examples or starters.\n";
    p += "Styled Spectrum 2 source is react-spectrum/packages/@react-spectrum/s2/src. If you edit a solid-spectrum file, open scripts/layer-boundary-baseline.json and apply the same edit to the viviana-ui file at the same relative path when the baseline does not mark that file diverged.\n";
    p += "Search tickets with rg --no-ignore -g '*.md' under .claude/tickets. Read the ticket done-when before editing. Do not hand-edit .claude/current/status.md or roadmap.md.\n";
    p += "Do not run the certified suite, vp run test:run, or a full repo build. Run only the tests this ticket names, one heavy command at a time. If the done-when needs the full certified suite, do not run it: outcome held, hold_reason needs the certified suite.\n";
    p += "Do not start #537. Do not mark #86 or #452 verified. Do not move the Adobe pin on #220. Do not advance the Spectrum token major on #240. #143 stays verified. Do not reclassify merged #423 or its range-cell hover path.\n";
    p += "Do not reopen a verified ticket, including #56, #57, #58, and the tickets named by the twenty product commits.\n";
    p += "Do not read agent transcripts, Claude sessions, or Antigravity transcripts.\n";
    p += "outcome is exactly one of: done, held, blocked, skipped, failed, dirty-stop.\n";
    p += "dirty is true only when this slice left product files changed. eligibility_ok, dirty, and the other booleans are JSON booleans.\n";
    p += "paths lists repo-relative files you changed, including the ticket file when you changed it. commit_message is one owner-voice sentence that includes the ticket id, with no trailer and no attribution.\n";
    p += "status_change is verified only when the ticket done-when is fully met. Otherwise in-progress when a proved slice remains open, or empty when you did not change status.\n";
    p += "When you change status or history, date the history with the output of date +%F. successor is go only when this ticket records an explicit red that unblocks the next ticket. Otherwise successor is empty.\n";
    p += "A hold is for an owner decision, a blocked flag, a parked ticket, a public-face path, a new dependency, a new public name, or a required certified suite. Do not hold a ticket whose done-when you can meet here.\n";
    p
}

fn heading_rules() {
    let p = "Slice #208. Finish the dirty Heading and Dialog split. Do not discard those bytes and start over.\n";
    p += "Heading.tsx owns Heading and HeadingContext. The default level is 3. Dialog consumes that context. An unslotted Heading inside a dialog stays level 3. Only slot=\"title\" is level 2.\n";
    p += "Public HeadingContext is the RAC heading context, not a collection context.\n";
    p += "Do not export DialogHeading. RAC does not. Remove that alias from Heading.tsx, Dialog.tsx, index.ts, and the tests if it is present. Do not add it if it is absent.\n";
    p += "packages/solid-spectrum/src/dialog/Dialog.tsx and packages/viviana-ui/src/dialog/Dialog.tsx must render the legacy title through slot=\"title\". AlertDialog already does. Keep that.\n";
    p += "Confirm the 2026-09-28 DialogTrigger root menu-trigger state still holds, including a Menu inside a Dialog. Restore it only if the code lost it.\n";
    p += "Tests must fail on the old level-2 default. Run the solidaria-components Heading and Dialog tests, plus the styled dialog tests that cover the title.\n";
    p += "Read the upstream RAC Heading and Dialog sources before you decide the split is wrong.\n";
    p += "Set status_change to verified only when that done-when is met. Update the #208 ticket history.\n";
    p
}

fn mode_rules(mode) {
    let p = "";
    if mode == "repair" {
        p += "This is #194. Do the repair the ticket names. Leave status in-progress. status_change must not be verified. There is no certified record for HEAD, so do not verify it and do not run the certified suite. Do not enlarge a baseline to obtain a pass. Do not start #537.\n";
    } else if mode == "gate" {
        p += "Read the owner gate in the ticket. Implement specified upstream matching. If an owner choice is still unanswered, edit nothing, outcome held, and put that choice in hold_reason.\n";
    } else if mode == "bounded" {
        p += "This is an existing Kumo or Geist experiment. Stay inside the component the ticket already has. Do not publish, add a component, or add a dependency. If the remaining work is a publish or a new component, outcome held.\n";
    } else if mode == "defect" {
        p += "Fix this proved defect forward on main. Do not amend, rebase, or rewrite the named commit. Do not edit a verified ticket and do not change ticket status. status_change must be empty. Leave the Heading WIP untouched.\n";
    } else if mode == "nightly" {
        p += "The local repro of picker.certified.spec.ts and combobox.certified.spec.ts failed on HEAD. Fix that failure in one slice. Do not run the rest of the certified suite. Do not push. Do not open a new ticket. Update an existing open ticket only if it already owns this failure. Otherwise leave tickets unchanged.\n";
    } else if mode == "heading" {
        p += heading_rules();
    } else {
        p += "Implement only this ticket. Do not start the next id.\n";
    }
    p
}

fn impl_prompt(label, mode, extra) {
    let p = base_rules();
    p += "Slice id: ";
    p += label;
    p += "\n";
    p += mode_rules(mode);
    if extra != "" {
        p += "Context:\n";
        p += extra;
        p += "\n";
    }
    p += "Use read_file, grep, and the terminal. Read the ticket and the upstream file before you edit. Return the schema fields. summary is two sentences. tests is the exact command and the pass or fail count, or not run.\n";
    p
}

fn skeptic_prompt(label, mode, row) {
    let p = "You are the skeptic for /home/emoporemilio/projects/viviana-hub/ui. Run git and the named tests. Do not edit, commit, or push.\n";
    p += "Use git diff and git status --porcelain. Open the ticket with rg --no-ignore -g '*.md' under .claude/tickets. A missing file read is pass false.\n";
    p += "Run the commands in Tests and quote each command with its result. pass is true only when the diff does this slice, the named tests were run, and you saw the result. The worker summary is not evidence. evidence quotes a path and a command result.\n";
    p += "dirty_beyond is true when git status shows a product change that is not in the worker paths and is not one of the seven pre-existing Heading or Dialog paths. Those seven paths count as dirty_beyond only when the slice is not 208.\n";
    p += "Slice: ";
    p += label;
    p += "\nMode: ";
    p += mode;
    p += "\nWorker summary: ";
    p += trimmed(row.summary);
    p += "\nTests: ";
    p += trimmed(row.tests);
    p += "\nStatus change: ";
    p += trimmed(row.status_change);
    p += "\nPaths: ";
    p += json_encode(row.paths);
    p += "\n";
    if mode == "heading" {
        p += "Fail if DialogHeading is still exported, if an unslotted dialog heading is level 2, or if either styled dialog still renders the legacy title without slot=\"title\".\n";
    }
    if mode == "repair" {
        p += "Fail if #194 is marked verified or if the certified suite was run.\n";
    }
    if mode == "defect" {
        p += "Fail if a verified ticket changed status, or if the Heading WIP was edited.\n";
    }
    p += "If the tests were not run and the slice changed behavior, pass is false.\n";
    p
}

fn commit_prompt(label, mode, row, prior_error) {
    let p = "Commit one verified slice in /home/emoporemilio/projects/viviana-hub/ui. Do not push, tag, or publish. Do not use --no-verify, --amend, reset, clean, or stash.\n";
    p += "Run git status --porcelain first. Stage only the paths listed below. Never git add -A.\n";
    p += "Unless the slice is 208, do not stage packages/solidaria-components/package.json, packages/solidaria-components/src/Dialog.tsx, packages/solidaria-components/src/index.ts, packages/solidaria-components/test/Dialog.ssr.test.tsx, packages/solidaria-components/test/Dialog.test.tsx, packages/solidaria-components/src/Heading.tsx, or packages/solidaria-components/test/Heading.test.tsx.\n";
    p += "Do not stage README.md, CONTRIBUTING.md, CREDITS.md, packages/*/README.md, apps/web/src, apps/comparison/src, or anything under .claude/worktrees.\n";
    p += "If an unexpected dirty path remains outside that preserved Heading set and outside the list, commit nothing. Set committed false, retryable false, and put the path in error.\n";
    p += "If status_change is verified or in-progress, run vp run docs:generate and vp run docs:check. Stage only the generated files those commands change, plus the listed paths. Do not hand-edit status.md or roadmap.md.\n";
    p += "Write the message to /tmp/overnight-commit-";
    p += label;
    p += ".txt and run git commit -F that file. Then delete the temp file. The message is one sentence, owner voice, no trailer, no attribution.\n";
    p += "The pre-commit hook is vp staged. If it fails, do not retry yourself. Set committed false and retryable true, and put the hook error in error.\n";
    p += "If the commit succeeds, set committed true, sha from git rev-parse --short HEAD, error empty, retryable false.\n";
    p += "Slice: ";
    p += label;
    p += "\nMode: ";
    p += mode;
    p += "\nStatus change: ";
    p += trimmed(row.status_change);
    p += "\nMessage: ";
    p += trimmed(row.commit_message);
    p += "\nPaths: ";
    p += json_encode(row.paths);
    p += "\n";
    if prior_error != "" {
        p += "The previous commit attempt failed. Do not amend. Commit the same slice once more only if the tree still has just this slice.\nPrevious error:\n";
        p += prior_error;
        p += "\n";
    }
    p
}

fn read_impl(label, result) {
    let row = #{
        label: label,
        outcome: "agent-failed",
        summary: "",
        tests: "",
        commit_message: "",
        hold_reason: "",
        dirty: true,
        paths: [],
        status_change: "",
        eligibility_ok: false,
        successor: "",
        sha: "",
    };
    if result == () || type_of(result) != "map" || result.success != true {
        row.hold_reason = "implementer failed";
        return row;
    }
    if result.output == () || type_of(result.output) != "map" {
        row.hold_reason = "implementer returned no schema";
        return row;
    }
    let out = result.output;
    row.outcome = lower(out.outcome);
    if row.outcome == "" {
        row.outcome = "agent-failed";
    }
    row.summary = cap(out.summary, 500);
    row.tests = cap(out.tests, 300);
    row.commit_message = trimmed(out.commit_message);
    row.hold_reason = cap(out.hold_reason, 300);
    row.status_change = lower(out.status_change);
    row.successor = lower(out.successor);
    if out.dirty == true {
        row.dirty = true;
    } else {
        row.dirty = false;
    }
    if out.eligibility_ok == true {
        row.eligibility_ok = true;
    }
    if out.paths != () && type_of(out.paths) == "array" {
        row.paths = out.paths;
    }
    row
}

fn review_agent(opts) {
    opts.model = "grok-4.7";
    opts.effort = "xhigh";
    opts
}

fn grunt_agent(opts) {
    opts.model = "grok-4.7";
    opts.effort = "medium";
    opts
}

fn commit_once(label, mode, row, schema, prior_error) {
    let suffix = "0";
    if prior_error != "" {
        suffix = "1";
    }
    let result = agent(commit_prompt(label, mode, row, prior_error), grunt_agent(#{
        label: "commit-" + label + "-" + suffix,
        capability_mode: "execute",
        output_schema: schema,
    }));
    let out = #{
        committed: false,
        sha: "",
        error: "commit agent failed",
        retryable: false,
    };
    if result != () && type_of(result) == "map" && result.success == true && result.output != () && type_of(result.output) == "map" {
        if result.output.committed == true {
            out.committed = true;
        }
        out.sha = trimmed(result.output.sha);
        out.error = cap(result.output.error, 400);
        if result.output.retryable == true {
            out.retryable = true;
        }
    }
    out
}

fn read_skeptic(sk) {
    let out = #{
        pass: false,
        dirty: false,
        reason: "",
    };
    if sk != () && type_of(sk) == "map" && sk.success == true && sk.output != () && type_of(sk.output) == "map" {
        let evidence = trimmed(sk.output.evidence);
        if sk.output.pass == true && evidence != "" {
            out.pass = true;
        }
        if sk.output.dirty_beyond == true {
            out.dirty = true;
        }
        out.reason = cap(sk.output.reason, 300);
    }
    out
}

fn run_slice(label, mode, extra, impl_schema_value, skeptic_schema_value, commit_schema_value) {
    let impl = agent(impl_prompt(label, mode, extra), grunt_agent(#{
        label: "impl-" + label,
        capability_mode: "execute",
        output_schema: impl_schema_value,
    }));
    let row = read_impl(label, impl);
    if row.eligibility_ok != true {
        row.outcome = "dirty-stop";
        if trimmed(row.hold_reason) == "" {
            row.hold_reason = "eligibility not confirmed";
        }
        return row;
    }
    if row.outcome != "done" {
        if row.dirty == true {
            row.outcome = "dirty-stop";
            if trimmed(row.hold_reason) == "" {
                row.hold_reason = "unproved dirty tree";
            }
        }
        return row;
    }
    if row.paths == () || type_of(row.paths) != "array" || row.paths.len() == 0 {
        row.outcome = "failed";
        row.hold_reason = "done without paths";
        if row.dirty == true {
            row.outcome = "dirty-stop";
        }
        return row;
    }
    let sk = agent(skeptic_prompt(label, mode, row), review_agent(#{
        label: "skeptic-" + label,
        capability_mode: "execute",
        output_schema: skeptic_schema_value,
    }));
    let verdict = read_skeptic(sk);
    let sk_pass = verdict.pass;
    let sk_dirty = verdict.dirty;
    let sk_reason = verdict.reason;
    if sk_pass != true && sk_dirty != true {
        log("skeptic retry " + label);
        let sk_retry = agent(skeptic_prompt(label, mode, row), review_agent(#{
            label: "skeptic-" + label + "-retry",
            capability_mode: "execute",
            output_schema: skeptic_schema_value,
        }));
        verdict = read_skeptic(sk_retry);
        sk_pass = verdict.pass;
        sk_dirty = verdict.dirty;
        if verdict.reason != "" {
            sk_reason = verdict.reason;
        }
    }
    if mode == "repair" && trimmed(row.status_change) == "verified" {
        sk_pass = false;
        sk_dirty = true;
        sk_reason = "#194 must stay in-progress";
    }
    if mode == "defect" && trimmed(row.status_change) != "" {
        sk_pass = false;
        sk_reason = "defect fix must not change ticket status";
        if row.dirty == true {
            sk_dirty = true;
        }
    }
    if sk_pass != true {
        row.outcome = "failed";
        row.hold_reason = sk_reason;
        if row.hold_reason == "" {
            row.hold_reason = "skeptic failed closed";
        }
        if row.dirty == true || sk_dirty == true {
            row.outcome = "dirty-stop";
        }
        return row;
    }
    let committed = commit_once(label, mode, row, commit_schema_value, "");
    if committed.committed != true && committed.retryable == true {
        let prior = trimmed(committed.error);
        committed = commit_once(label, mode, row, commit_schema_value, prior);
    }
    if committed.committed == true {
        row.outcome = "done";
        row.sha = trimmed(committed.sha);
        row.dirty = false;
        return row;
    }
    row.outcome = "dirty-stop";
    row.hold_reason = trimmed(committed.error);
    if row.hold_reason == "" {
        row.hold_reason = "commit failed";
    }
    row
}

fn mode_for(id) {
    if id == 194 {
        return "repair";
    }
    if id == 251 || id == 252 || id == 256 || id == 257 {
        return "gate";
    }
    if id == 37 || id == 41 {
        return "bounded";
    }
    "ticket"
}

fn take_row(bucket, row) {
    let outcome = trimmed(row.outcome);
    if outcome == "done" {
        bucket.closed_rows.push(row);
        return #{ bucket: bucket, stopped: false };
    }
    if outcome == "blocked" {
        bucket.blocked_rows.push(row);
        return #{ bucket: bucket, stopped: false };
    }
    if outcome == "dirty-stop" || outcome == "agent-failed" {
        bucket.failed_rows.push(row);
        return #{ bucket: bucket, stopped: true };
    }
    if outcome == "failed" {
        bucket.failed_rows.push(row);
        return #{ bucket: bucket, stopped: false };
    }
    let reason = lower(row.hold_reason);
    if reason.contains("public-face") || reason.contains("other seat") {
        bucket.seat_rows.push(row);
        return #{ bucket: bucket, stopped: false };
    }
    bucket.held_rows.push(row);
    #{ bucket: bucket, stopped: false }
}

fn walk(ids, extra, impl_schema_value, skeptic_schema_value, commit_schema_value) {
    let bucket = #{
        closed_rows: [],
        held_rows: [],
        blocked_rows: [],
        failed_rows: [],
        seat_rows: [],
    };
    let stopped = false;
    let next_label = "";
    for id in ids {
        let label = id.to_string();
        next_label = label;
        log("slice " + label);
        let row = run_slice(label, mode_for(id), extra, impl_schema_value, skeptic_schema_value, commit_schema_value);
        log("slice " + label + " " + trimmed(row.outcome));
        let placed = take_row(bucket, row);
        bucket = placed.bucket;
        stopped = placed.stopped;
        if stopped {
            return #{
                stopped: true,
                next_label: next_label,
                closed_rows: bucket.closed_rows,
                held_rows: bucket.held_rows,
                blocked_rows: bucket.blocked_rows,
                failed_rows: bucket.failed_rows,
                seat_rows: bucket.seat_rows,
            };
        }
    }
    #{
        stopped: false,
        next_label: "",
        closed_rows: bucket.closed_rows,
        held_rows: bucket.held_rows,
        blocked_rows: bucket.blocked_rows,
        failed_rows: bucket.failed_rows,
        seat_rows: bucket.seat_rows,
    }
}

fn merge_part(into, part) {
    for row in part.closed_rows { into.closed_rows.push(row); }
    for row in part.held_rows { into.held_rows.push(row); }
    for row in part.blocked_rows { into.blocked_rows.push(row); }
    for row in part.failed_rows { into.failed_rows.push(row); }
    for row in part.seat_rows { into.seat_rows.push(row); }
    into
}

fn seed_done(bucket, label, sha, summary) {
    bucket.closed_rows.push(#{
        label: label,
        outcome: "done",
        hold_reason: "already committed",
        summary: summary,
        tests: "",
        sha: sha,
        status_change: "",
    });
    bucket
}

fn seed_held(bucket, label, reason, summary) {
    bucket.held_rows.push(#{
        label: label,
        outcome: "held",
        hold_reason: reason,
        summary: summary,
        tests: "",
        sha: "",
        status_change: "",
    });
    bucket
}

fn seed_seat(bucket, label, reason, summary) {
    bucket.seat_rows.push(#{
        label: label,
        outcome: "held",
        hold_reason: reason,
        summary: summary,
        tests: "not run",
        sha: "",
        status_change: "",
    });
    bucket
}

fn from_id(ids, start) {
    let out = [];
    let keep = false;
    let target = trimmed(start);
    for id in ids {
        if keep == false && id.to_string() == target {
            keep = true;
        }
        if keep {
            out.push(id);
        }
    }
    out
}

fn bullet(row) {
    let line = "- #" + trimmed(row.label) + " " + trimmed(row.outcome);
    let reason = trimmed(row.hold_reason);
    if reason != "" {
        line += ": " + reason;
    }
    let tests = trimmed(row.tests);
    if tests != "" {
        line += " | tests: " + tests;
    }
    let sha = trimmed(row.sha);
    if sha != "" {
        line += " | " + sha;
    }
    let status_change = trimmed(row.status_change);
    if status_change != "" {
        line += " | status " + status_change;
    }
    let summary = trimmed(row.summary);
    if summary != "" {
        line += " | " + summary;
    }
    line
}

fn section(title, rows) {
    let text = "## " + title + "\n";
    if rows.len() == 0 {
        text += "- none\n";
        return text;
    }
    for row in rows {
        text += bullet(row) + "\n";
    }
    text
}

fn review_prompt(sha, ticket) {
    let p = "Read-only review of one commit in /home/emoporemilio/projects/viviana-hub/ui. Do not edit, commit, or push.\n";
    p += "Run git show --stat --format='%h %s' ";
    p += sha;
    p += " and git show ";
    p += sha;
    p += ". Ignore uncommitted Heading and Dialog files. Do not flag style.\n";
    p += "A defect is a behavior the commit message claims that the diff does not do, or a truncated change. Quote the diff in evidence. An empty defects array is valid after you have read the diff.\n";
    p += "Return at most 2 defects. sha is ";
    p += sha;
    p += ". Ticket context: #";
    p += ticket;
    p += ". Do not reopen a verified ticket.\n";
    p
}

fn defect_check_prompt(sha, claim, evidence) {
    let p = "Read-only. Prove or reject one defect in /home/emoporemilio/projects/viviana-hub/ui. Do not edit.\n";
    p += "Run git show ";
    p += sha;
    p += ". real is true only if you can quote a line from that diff that proves the claim. Otherwise real is false.\n";
    p += "Ignore the uncommitted Heading tree.\nClaim: ";
    p += claim;
    p += "\nReviewer evidence: ";
    p += evidence;
    p += "\n";
    p
}

fn holds_text() {
    let p = "## Recorded without a worker\n";
    p += "- #1 owner-held: solid-spectrum to viviana-ui derivative boundary\n";
    p += "- #4 parked: do not reactivate\n";
    p += "- #6 parked: do not reactivate\n";
    p += "- #40 deploy hold\n";
    p += "- #42 owner decides whether the Kumo experiment continues\n";
    p += "- #47 parked: do not reactivate\n";
    p += "- #86 blocked: autocomplete stays blocked\n";
    p += "- #87 program ticket, not dispatched from itself\n";
    p += "- #88 parked: do not reactivate\n";
    p += "- #143 verified: do not reopen; do not advance the token major\n";
    p += "- #150 publish hold\n";
    p += "- #195 parked: do not reactivate\n";
    p += "- #196 parked: do not reactivate\n";
    p += "- #204 parked: do not reactivate\n";
    p += "- #220 do not move the Adobe pin\n";
    p += "- #240 do not advance the Spectrum token major\n";
    p += "- #249 waits for its D13 predecessor\n";
    p += "- #254 owner decides RAC context composition; not started\n";
    p += "- #423 merged: leave the range-cell hover path\n";
    p += "- #448 publish hold\n";
    p += "- #452 blocked: do not verify optimizeDeps\n";
    p += "- #520 owner decides minted names\n";
    p += "- #530 owner decides whether the Geist experiment continues\n";
    p += "- #537 not started until #194 has a certified record\n";
    p += "- #550 public-face seat\n";
    p
}

let smoke_flag = ();
let skip_208 = false;
let skip_checkpoint = false;
let skip_landed = false;
let resume_106 = false;
let resume_115 = false;
let resume_118 = false;
let resume_visualmode = false;
let landed_118 = "";
if args != () {
    try {
        smoke_flag = args.smoke;
    } catch (miss) {
        smoke_flag = ();
    }
    try {
        if args.skip_208 == true {
            skip_208 = true;
        }
    } catch (miss) {
        skip_208 = false;
    }
    try {
        if args.skip_checkpoint == true {
            skip_checkpoint = true;
        }
    } catch (miss) {
        skip_checkpoint = false;
    }
    try {
        if args.skip_landed == true {
            skip_landed = true;
            skip_checkpoint = true;
        }
    } catch (miss) {
        skip_landed = false;
    }
    try {
        if args.resume_106 == true {
            resume_106 = true;
            skip_landed = true;
            skip_checkpoint = true;
        }
    } catch (miss) {
        resume_106 = false;
    }
    try {
        if args.resume_115 == true {
            resume_115 = true;
            resume_106 = true;
            skip_landed = true;
            skip_checkpoint = true;
        }
    } catch (miss) {
        resume_115 = false;
    }
    try {
        if args.resume_118 == true {
            resume_118 = true;
            resume_115 = true;
            resume_106 = true;
            skip_landed = true;
            skip_checkpoint = true;
        }
    } catch (miss) {
        resume_118 = false;
    }
    try {
        if args.resume_visualmode == true {
            resume_visualmode = true;
            resume_118 = true;
            resume_115 = true;
            resume_106 = true;
            skip_landed = true;
            skip_checkpoint = true;
        }
    } catch (miss) {
        resume_visualmode = false;
    }
    try {
        landed_118 = trimmed(args.landed_118);
    } catch (miss) {
        landed_118 = "";
    }
}
if smoke_flag == true {
    phase("Checkpoint");
    let smoke_agent = agent(
        "Read-only smoke check. Run git status --porcelain in /home/emoporemilio/projects/viviana-hub/ui. Reply with one sentence. Do not edit.",
        grunt_agent(#{ label: "smoke", capability_mode: "read-only" }),
    );
    let note = "smoke agent failed";
    if smoke_agent != () && type_of(smoke_agent) == "map" && smoke_agent.success == true {
        note = cap(smoke_agent.output, 300);
    }
    let smoke_path = write_scratch_file("overnight-board.md", "smoke\n" + note + "\n");
    complete(#{ path: smoke_path, report: "smoke", smoke: true });
}

let book = #{
    closed_rows: [],
    held_rows: [],
    blocked_rows: [],
    failed_rows: [],
    seat_rows: [],
};
let stopped = false;
let next_label = "208";
let review_note = "not run";
let nightly_note = "not run";
let release_note = "not run";
let layer_note = "not run";

phase("Checkpoint");
if skip_checkpoint == true {
    log("checkpoint already recorded");
    next_label = "583";
    book.closed_rows.push(#{
        label: "208",
        outcome: "done",
        hold_reason: "already committed as cd3b1a2c",
        summary: "",
        tests: "",
        sha: "cd3b1a2c",
        status_change: "verified",
    });
    book.closed_rows.push(#{
        label: "fix-0f7b7d6b",
        outcome: "done",
        hold_reason: "already committed as 47dc259d",
        summary: "TextField tutor fill lives inside matteWell, before forcedColors",
        tests: "vp exec tsx -e matteWell/control backgroundColor key-order assertions — 7 passed, 0 failed",
        sha: "47dc259d",
        status_change: "",
    });
    review_note = "1 confirmed, 0 dropped, 0 reviewer failures";
    nightly_note = "Recorded on the prior run and not re-run. Reproduced on 47dc259d, seed 20261006, budget 180000ms, maxSteps 16, both specs 3/3. Picker minimized to touchDown trigger (1 step). ComboBox minimized to focus input then type mc (2 steps). Generated minimized JSON was removed. D13 stays in census order.";
} else if skip_208 == true {
    log("slice 208 already committed");
    book.closed_rows.push(#{
        label: "208",
        outcome: "done",
        hold_reason: "already committed as cd3b1a2c",
        summary: "",
        tests: "",
        sha: "cd3b1a2c",
        status_change: "verified",
    });
} else {
    log("slice 208");
    let heading = run_slice("208", "heading", "", impl_schema, skeptic_schema, commit_schema);
    log("slice 208 " + trimmed(heading.outcome));
    let placed = take_row(book, heading);
    book = placed.bucket;
    if placed.stopped == true {
        stopped = true;
        next_label = "208";
    }
}

if skip_checkpoint == false && stopped == false {
    next_label = "review 9c92f721";
    let waves = [
        [ #{ sha: "9c92f721", ticket: "175" }, #{ sha: "9ddc120a", ticket: "171" }, #{ sha: "a6bf3825", ticket: "441" }, #{ sha: "08979ee8", ticket: "164" } ],
        [ #{ sha: "3c84eae8", ticket: "169" }, #{ sha: "f5397dcb", ticket: "258" }, #{ sha: "a18a0b66", ticket: "168" }, #{ sha: "0f7b7d6b", ticket: "173" } ],
        [ #{ sha: "836bfdbe", ticket: "170" }, #{ sha: "30123faa", ticket: "619" }, #{ sha: "02130c8e", ticket: "147" }, #{ sha: "a7f9ebb6", ticket: "153" } ],
        [ #{ sha: "a65d6b19", ticket: "138" }, #{ sha: "8a94026b", ticket: "149" }, #{ sha: "44aa1e4e", ticket: "613" }, #{ sha: "629f3eca", ticket: "58,56" } ],
        [ #{ sha: "21d84b05", ticket: "57" }, #{ sha: "103339b1", ticket: "209" }, #{ sha: "61a7b711", ticket: "43" }, #{ sha: "e357d5ef", ticket: "584" } ],
    ];
    let candidates = [];
    let dropped = 0;
    let review_failures = 0;
    for wave in waves {
        let jobs = [];
        for item in wave {
            jobs.push(review_agent(#{
                prompt: review_prompt(item.sha, item.ticket),
                label: "review-" + item.sha,
                capability_mode: "read-only",
                output_schema: review_schema,
            }));
        }
        let results = parallel(jobs);
        let index = 0;
        for item in wave {
            let result = ();
            if type_of(results) == "array" && index < results.len() {
                result = results[index];
            }
            if result == () || type_of(result) != "map" || result.success != true || result.output == () {
                review_failures += 1;
            } else if result.output.defects != () && type_of(result.output.defects) == "array" {
                for defect in result.output.defects {
                    if defect != () && type_of(defect) == "map" {
                        if candidates.len() < 8 {
                            candidates.push(#{
                                sha: item.sha,
                                claim: cap(defect.claim, 300),
                                evidence: cap(defect.evidence, 300),
                            });
                        } else {
                            dropped += 1;
                        }
                    }
                }
            }
            index += 1;
        }
    }
    if dropped > 0 {
        log("dropped " + dropped.to_string() + " review defects over the cap of 8");
    }
    let confirmed = [];
    if candidates.len() > 0 {
        let jobs = [];
        for defect in candidates {
            jobs.push(review_agent(#{
                prompt: defect_check_prompt(defect.sha, defect.claim, defect.evidence),
                label: "defect-" + defect.sha,
                capability_mode: "read-only",
                output_schema: defect_schema,
            }));
        }
        let results = parallel(jobs);
        let index = 0;
        for defect in candidates {
            let result = ();
            if type_of(results) == "array" && index < results.len() {
                result = results[index];
            }
            if result != () && type_of(result) == "map" && result.success == true && result.output != () && result.output.real == true && trimmed(result.output.evidence) != "" {
                confirmed.push(#{
                    sha: defect.sha,
                    claim: defect.claim,
                    evidence: cap(result.output.evidence, 300),
                });
            }
            index += 1;
        }
    }
    review_note = confirmed.len().to_string() + " confirmed, " + dropped.to_string() + " dropped, " + review_failures.to_string() + " reviewer failures";
    log(review_note);
    for defect in confirmed {
        if stopped == false {
            next_label = "fix " + defect.sha;
            let extra = "Commit " + defect.sha + "\nDefect: " + defect.claim + "\nEvidence: " + defect.evidence;
            log("slice fix-" + defect.sha);
            let row = run_slice("fix-" + defect.sha, "defect", extra, impl_schema, skeptic_schema, commit_schema);
            log("slice fix-" + defect.sha + " " + trimmed(row.outcome));
            let placed = take_row(book, row);
            book = placed.bucket;
            if placed.stopped == true {
                stopped = true;
            }
        }
    }
}

if skip_checkpoint == false && stopped == false {
    next_label = "nightly 37469399093";
    let diagnose = agent(
        "Read-only. In /home/emoporemilio/projects/viviana-hub/ui, inspect GitHub Actions run 37469399093 on origin/main 9a477baa. Failed jobs are journey-fuzz for e2e/certified/picker.certified.spec.ts and e2e/certified/combobox.certified.spec.ts. Use gh run view. Do not rerun, push, or edit. summary is the failing assertion in under 800 characters. If gh is not authenticated, say so in summary.",
        review_agent(#{ label: "nightly-diagnose", capability_mode: "read-only", output_schema: text_schema }),
    );
    let diagnosed = "diagnose failed";
    if diagnose != () && type_of(diagnose) == "map" && diagnose.success == true && diagnose.output != () {
        diagnosed = cap(diagnose.output.summary, 800);
    }
    let repro = agent(
        "In /home/emoporemilio/projects/viviana-hub/ui, reproduce Journey Fuzz run 37469399093 on HEAD. Read apps/comparison/COMPONENT_PLAYBOOK.md and run only e2e/certified/picker.certified.spec.ts and e2e/certified/combobox.certified.spec.ts. Do not run the rest of the certified suite. Do not edit, commit, or push. Set failing true only if a spec fails. Set dirty true if you changed any file. tests is the exact command. summary is the result in under 500 characters.",
        grunt_agent(#{ label: "nightly-repro", capability_mode: "execute", output_schema: text_schema }),
    );
    let failing = false;
    let repro_dirty = true;
    let repro_summary = "repro agent failed";
    let repro_tests = "";
    if repro != () && type_of(repro) == "map" && repro.success == true && repro.output != () && type_of(repro.output) == "map" {
        if repro.output.failing == true {
            failing = true;
        }
        if repro.output.dirty == true {
            repro_dirty = true;
        } else {
            repro_dirty = false;
        }
        repro_summary = cap(repro.output.summary, 500);
        repro_tests = cap(repro.output.tests, 300);
    }
    nightly_note = diagnosed + " | " + repro_summary;
    if repro_dirty == true {
        stopped = true;
        next_label = "nightly 37469399093";
        book.failed_rows.push(#{
            label: "nightly",
            outcome: "dirty-stop",
            hold_reason: "nightly repro left the tree dirty or did not prove it clean",
            summary: nightly_note,
            tests: repro_tests,
            sha: "",
            status_change: "",
        });
    } else if failing == true {
        log("slice nightly");
        let row = run_slice("nightly", "nightly", nightly_note, impl_schema, skeptic_schema, commit_schema);
        log("slice nightly " + trimmed(row.outcome));
        let placed = take_row(book, row);
        book = placed.bucket;
        if placed.stopped == true {
            stopped = true;
            next_label = "nightly";
        }
    } else {
        book.held_rows.push(#{
            label: "nightly",
            outcome: "held",
            hold_reason: "does not reproduce on HEAD",
            summary: nightly_note,
            tests: repro_tests,
            sha: "",
            status_change: "",
        });
    }
}

if skip_landed == true {
    if resume_visualmode == true {
        log("landed slices already recorded, visualmode queue is next");
        next_label = "624";
    } else if resume_118 == true {
        log("landed slices already recorded, census resumes at 118");
        next_label = "118";
    } else if resume_115 == true {
        log("landed slices already recorded, census resumes at 115");
        next_label = "115";
    } else if resume_106 == true {
        log("landed slices already recorded, census resumes at 106");
        next_label = "106";
    } else {
        log("landed slices already recorded, census resumes at 3");
        next_label = "3";
    }
    book = seed_done(book, "583", "dba3c32b", "Recorded the per-stack reduced-motion contract");
    book = seed_done(book, "609", "7f839994", "Tabs regression reads the roving tabindex during focusout and focusin");
    book = seed_done(book, "552", "dfde9b13", "Fresh clone reinstalls the Vite+ pre-commit dispatcher");
    book = seed_done(book, "551", "d0a05c53", "CI fails when a workflow leaves GitHub-hosted runners or names Blacksmith");
    book = seed_done(book, "554", "3d01bd8e", "Nine createTrackedEffect sites moved to createEffect or onSettled");
    book = seed_done(book, "562", "01bbe7ab", "Recorded why vmThreads stays load-bearing and the SSR pool is forks");
    book = seed_done(book, "575", "e699fc83", "Theme commit keeps the light-scheme Create fill on the CTA colour");
    book = seed_done(book, "577", "27e15f8c", "Source ratchets name a stale record and refuse an unexplained re-bless");
    book = seed_done(book, "579", "ba25ae46", "Upstream-test-parity follows the component a test renders");
    book = seed_held(book, "580", "Owner must approve the seam before the two toast modules can collapse. No new package, dependency, or public name.", "Toast modules stay two copies.");
    book = seed_done(book, "597", "33efaf3b", "Classified the sixteen unexamined parity facts");
    book = seed_done(book, "601", "ffca19c8", "ButtonGroup overflow is measured when a child changes size in place");
    book = seed_done(book, "604", "654e2698", "A commit that changes a rendered ticket field cannot leave the generated board stale");
    book = seed_done(book, "615", "0d4f997b", "Reference pages list children inherited from solid-js");
    book = seed_done(book, "616", "067775b3", "Gate-coverage guard sees scripts, advisory steps, and the publish summary");
    book = seed_done(book, "543", "e2056cf5", "D12 Solid button island goes through the private Solid adapter. Ticket stays in-progress.");
    book = seed_done(book, "533", "0f7186f6", "Collection props resolve once. Ticket stays in-progress.");
    book = seed_done(book, "194", "f2a2288f", "Repair only. Ticket stays in-progress. No certified suite and no #537.");
    book = seed_done(book, "90", "d84a33fc", "Tested response-security headers are stamped. Ticket stays in-progress.");
    if resume_106 == true {
        book = seed_done(book, "3", "73c33c4e", "CardView and two internal modules typecheck without ts-nocheck. Ticket stays in-progress.");
        book = seed_done(book, "91", "31fd831a", "TimeField and Table skips replaced.");
        book = seed_done(book, "92", "52c7c742", "Checkbox and Switch press cleanup matches upstream.");
        book = seed_done(book, "94", "0d99f9c4", "Dependency ceilings stay at jest-dom 6.9.1, jsdom 29.1.1, and typescript 6.0.3.");
        book = seed_done(book, "95", "56e45076", "Vite Plus cold scan reads only declared test inputs.");
        book = seed_done(book, "96", "b1dd4eaa", "TextArea Chrome baseline follows field structure and computed padding.");
        book = seed_done(book, "97", "74f0de70", "Selectable-item link model stays the approved boundary.");
        book = seed_done(book, "102", "600edb91", "ListView and Tree slot classes are in the server markup and the first painted grid.");
        book = seed_done(book, "105", "f98ad825", "D3 clones share one device-pixel phase. ContextualHelp and Toast glyph waivers are gone.");
        book = seed_seat(book, "103", "public-face seat; remaining API choices still need an owner ruling before any new public name", "Ticket #103 cannot close here: the parity mirror and route that must drop the stale gap notes live under apps/web/src.");
        if resume_115 == true {
            book = seed_done(book, "106", "07eb928b", "Menu and ActionMenu shared Popover surface certified for sizes, placements, and enter motion.");
            book = seed_done(book, "107", "1c3e7efc", "Menu selection indicators match upstream and the outline-color exclusion is gone.");
            book = seed_done(book, "109", "c1dd66db", "FileTrigger click isolation and DropZone native focus proved in the browser.");
            book = seed_held(book, "114", "Owner-gated by #243: do not mark verified. Scroll and relayout comparison evidence is still required.", "Virtualizer item-size observation already matches RAC useVirtualizerItem. D-scroll is not relayout evidence, so the ticket stays in progress.");
        }
        if resume_118 == true {
            book = seed_done(book, "115", "6f5a4213", "ComboBox single and multiple selection follows the upstream value contract. Ticket stays in progress because the public-face site JSON still lists selectedKeys.");
            book = seed_seat(book, "117", "public-face seat", "Ticket #117 remaining proof is comparison page content under apps/comparison/src, which the public-face seat owns while #550 is open.");
            if resume_visualmode == true {
                book = seed_held(book, "629", "Owner decides whether Stop, snap, key, and easing icons belong in this package. Do not add glyphs.", "G16 stays an owner question.");
                if landed_118 != "" {
                    book = seed_done(book, "118", landed_118, "TokenField slice committed before the visualmode queue.");
                }
            }
        }
    }
}

if stopped == false && skip_landed == false {
    phase("Campaign");
    next_label = "583";
    let part = walk([583, 609, 552, 551, 554, 562, 575, 577, 579, 580, 597, 601, 604, 615, 616], "", impl_schema, skeptic_schema, commit_schema);
    book = merge_part(book, part);
    if part.stopped == true {
        stopped = true;
        next_label = part.next_label;
    }
}

if stopped == false && skip_landed == false {
    phase("Foundation");
    next_label = "543";
    let part = walk([543, 533, 194], "", impl_schema, skeptic_schema, commit_schema);
    book = merge_part(book, part);
    if part.stopped == true {
        stopped = true;
        next_label = part.next_label;
    }
}

if stopped == false {
    phase("Census");
    let hygiene_ids = [90, 3, 91, 92, 94, 95, 96, 97, 102, 103, 105, 106, 107, 109, 114, 115, 117, 118, 125, 126, 127];
    if resume_118 == true {
        log("slice 118");
        hygiene_ids = from_id(hygiene_ids, "118");
    } else if resume_115 == true {
        log("slice 115");
        hygiene_ids = from_id(hygiene_ids, "115");
    } else if resume_106 == true {
        log("slice 106");
        let extra106 = "Slice 106 already has uncommitted work from the previous worker of this same slice. These paths belong to this slice. Finish them. Do not discard them. Do not treat them as foreign dirt.\n";
        extra106 += "apps/comparison/e2e/certified/menu.certified.spec.ts\n";
        extra106 += "apps/comparison/e2e/certified/actionmenu.certified.spec.ts\n";
        extra106 += "apps/comparison/e2e/certified-case-floor.json\n";
        extra106 += ".claude/tickets/tasks/106-compose-menu-with-the-shared-popover-surface.md\n";
        extra106 += "The previous attempt was rejected because the diff adds certified dialog comparisons and the named tests were not run. Run only the menu and actionmenu certified specs this slice changed. Do not run the rest of the certified suite. Do not claim done while tests is not run.\n";
        let row106 = run_slice("106", "ticket", extra106, impl_schema, skeptic_schema, commit_schema);
        log("slice 106 " + trimmed(row106.outcome));
        let placed106 = take_row(book, row106);
        book = placed106.bucket;
        if placed106.stopped == true {
            stopped = true;
            next_label = "106";
        } else {
            hygiene_ids = from_id(hygiene_ids, "107");
        }
    } else if skip_landed == true {
        hygiene_ids = from_id(hygiene_ids, "3");
    }
    if resume_visualmode == true && landed_118 != "" {
        hygiene_ids = [125, 126, 127];
    }
    if stopped == false && resume_visualmode == true {
        log("visualmode queue");
        next_label = "624";
        let vm_extra = "Visualmode queue. It runs before the remaining hygiene tickets.\n";
        vm_extra += "Order: #624 TreeView 24px rows, #329 ActionMenu from a TreeView item, #84 drag and drop, #623 TextField and TextArea unmount write, #625 in-place label edit, #626 second expand control, #627 nested static TreeViewItem children, #628 DragHandle packaging.\n";
        vm_extra += "#629 is already held. Do not add Stop, snap, key, or easing glyphs.\n";
        vm_extra += "Do not mint a public name. If #624, #625, or #626 needs a name the ticket does not already approve, outcome held and put #520 in hold_reason.\n";
        vm_extra += "#625 waits on the #623 unmount fix. If that fix is not committed on main, hold #625.\n";
        let vm = walk([624, 329, 84, 623, 625, 626, 627, 628], vm_extra, impl_schema, skeptic_schema, commit_schema);
        book = merge_part(book, vm);
        if vm.stopped == true {
            stopped = true;
            next_label = vm.next_label;
        }
    }
    if stopped == false && hygiene_ids.len() == 0 {
        stopped = true;
        next_label = "107";
        log("census resume missed the next hygiene id");
    } else if stopped == false {
        next_label = hygiene_ids[0].to_string();
        let hygiene = walk(hygiene_ids, "", impl_schema, skeptic_schema, commit_schema);
        book = merge_part(book, hygiene);
        if hygiene.stopped == true {
            stopped = true;
            next_label = hygiene.next_label;
        }
    }
}

if stopped == false {
    next_label = "layer-imports";
    let layer = agent(
        "Read-only. In /home/emoporemilio/projects/viviana-hub/ui run vp run report:layer-imports. Do not edit. The report is an inventory, not a verdict. summary is under 800 characters and names the lowest-layer open work inside tickets 50, 51, 52, 53, 54, 55, 60, 61, 64, 65, 66, 67, 68, 69, 70, 74, 75, 76, 84, and 85. ids lists only those ticket numbers the report actually mentions. #86 stays blocked and must not appear.",
        review_agent(#{ label: "layer-imports", capability_mode: "read-only", output_schema: text_schema }),
    );
    if layer != () && type_of(layer) == "map" && layer.success == true && layer.output != () {
        layer_note = cap(layer.output.summary, 800);
    } else {
        layer_note = "layer report failed; the open ids in this band are still in the queue";
    }
    log(layer_note);
    let extra = "Layer-import inventory, context only, not a skip list:\n" + layer_note;
    let layer_ids = [50, 51, 52, 53, 54, 55, 60, 61, 64, 65, 66, 67, 68, 69, 70, 74, 75, 76, 84, 85];
    if resume_visualmode == true {
        layer_ids = [50, 51, 52, 53, 54, 55, 60, 61, 64, 65, 66, 67, 68, 69, 70, 74, 75, 76, 85];
    }
    let part = walk(layer_ids, extra, impl_schema, skeptic_schema, commit_schema);
    book = merge_part(book, part);
    if part.stopped == true {
        stopped = true;
        next_label = part.next_label;
    }
}

if stopped == false {
    next_label = "206";
    let part = walk([206, 256, 154, 251, 257, 252, 229, 270, 190, 144, 155, 161, 163, 176, 178, 179, 180, 181, 197, 202, 207, 210, 211, 212, 225, 226, 255, 511, 137], "", impl_schema, skeptic_schema, commit_schema);
    book = merge_part(book, part);
    if part.stopped == true {
        stopped = true;
        next_label = part.next_label;
    }
}

if stopped == false {
    next_label = "244";
    let d13 = walk([244, 248, 245], "", impl_schema, skeptic_schema, commit_schema);
    book = merge_part(book, d13);
    if d13.stopped == true {
        stopped = true;
        next_label = d13.next_label;
    } else {
        let ready = false;
        for row in book.closed_rows {
            if trimmed(row.label) == "245" {
                ready = true;
            }
        }
        for row in book.held_rows {
            if trimmed(row.label) == "245" && trimmed(row.successor) == "go" {
                ready = true;
            }
        }
        if ready == true {
            next_label = "246";
            let follower = walk([246], "", impl_schema, skeptic_schema, commit_schema);
            book = merge_part(book, follower);
            if follower.stopped == true {
                stopped = true;
                next_label = follower.next_label;
            }
        } else {
            book.held_rows.push(#{
                label: "246",
                outcome: "held",
                hold_reason: "waits until #245 is done or explicitly ticketed red",
                summary: "",
                tests: "",
                sha: "",
                status_change: "",
            });
        }
    }
}

if stopped == false {
    phase("Remainder");
    next_label = "5";
    let rest_ids = [5, 37, 41, 44, 45, 49, 77, 79, 80, 83, 133, 146, 162, 221, 223, 227, 228, 263, 329, 333, 336, 379, 380, 387, 419, 420, 424, 429, 487, 488, 490, 515, 516, 517, 518, 519, 521, 620];
    if resume_visualmode == true {
        let filtered = [];
        for id in rest_ids {
            if id != 329 {
                filtered.push(id);
            }
        }
        rest_ids = filtered;
    }
    let part = walk(rest_ids, "", impl_schema, skeptic_schema, commit_schema);
    book = merge_part(book, part);
    if part.stopped == true {
        stopped = true;
        next_label = part.next_label;
    } else {
        let ready = false;
        for row in book.closed_rows {
            if trimmed(row.label) == "490" {
                ready = true;
            }
        }
        if ready == true {
            next_label = "509";
            let follower = walk([509], "Follow #490. This is not a silent API deletion ahead of the ticket.", impl_schema, skeptic_schema, commit_schema);
            book = merge_part(book, follower);
            if follower.stopped == true {
                stopped = true;
                next_label = follower.next_label;
            }
        } else {
            book.held_rows.push(#{
                label: "509",
                outcome: "held",
                hold_reason: "waits until #490 is done; not a silent API deletion",
                summary: "",
                tests: "",
                sha: "",
                status_change: "",
            });
        }
    }
}

if stopped == false {
    phase("Release");
    next_label = "release evidence";
    let release = agent(
        "Read-only release evidence for /home/emoporemilio/projects/viviana-hub/ui. Read .claude/current/release-policy.md and the changesets. Do not push, tag, publish, deploy, or edit. Do not run npm publish. summary names which releasable packages already have local pack or export proof and which next step would be a push or a publish. Stop before that step. Under 800 characters.",
        review_agent(#{ label: "release-evidence", capability_mode: "read-only", output_schema: text_schema }),
    );
    if release != () && type_of(release) == "map" && release.success == true && release.output != () {
        release_note = cap(release.output.summary, 800);
    } else {
        release_note = "release review failed";
    }
    next_label = "none";
}

phase("Report");
if stopped == false {
    next_label = "none";
}
let report = "# Overnight board\n\n";
report += "Next: " + next_label + "\n";
if stopped {
    report += "Stopped: yes\n\n";
} else {
    report += "Stopped: no\n\n";
}
report += holds_text() + "\n";
report += section("Committed", book.closed_rows) + "\n";
report += section("Held", book.held_rows) + "\n";
report += section("Blocked", book.blocked_rows) + "\n";
report += section("Failed", book.failed_rows) + "\n";
report += section("Other seat", book.seat_rows) + "\n";
report += "## Reviews\n" + review_note + "\n\n";
report += "## Nightly 37469399093\n" + nightly_note + "\n\n";
report += "## Layer imports\n" + layer_note + "\n\n";
report += "## Release\n" + release_note + "\n";
let path = write_scratch_file("overnight-board.md", report);
log("next " + next_label);
complete(#{
    path: path,
    report: report,
    next: next_label,
    stopped: stopped,
});
