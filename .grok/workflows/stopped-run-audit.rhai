let meta = #{
    name: "stopped-run-audit",
    description: "Read-only audit of the 2026-10-06 Antigravity stop: uncommitted Heading split, twenty unpushed commits, ticket truth, and integration risk",
    when_to_use: "After an agent stops on quota with a dirty ui tree. One small read-only fleet. No edits, no push, no certified suite.",
    phases: [
        #{ title: "Audit", detail: "four read-only lanes" },
        #{ title: "Report", detail: "one synthesizer" },
    ],
};

let lane_schema = #{
    "type": "object",
    "required": ["summary", "safe_next", "findings"],
    "properties": #{
        "summary": #{ "type": "string" },
        "safe_next": #{ "type": "string" },
        "findings": #{
            "type": "array",
            "maxItems": 6,
            "items": #{
                "type": "object",
                "required": ["severity", "claim", "evidence"],
                "properties": #{
                    "severity": #{ "type": "string" },
                    "claim": #{ "type": "string" },
                    "evidence": #{ "type": "string" },
                },
            },
        },
    },
};

let report_schema = #{
    "type": "object",
    "required": ["report", "safe_next", "blockers"],
    "properties": #{
        "report": #{ "type": "string" },
        "safe_next": #{ "type": "string" },
        "blockers": #{ "type": "number" },
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

fn lane_text(r, name) {
    if r == () || type_of(r) != "map" {
        return name + ": no result";
    }
    if r.success != true {
        return name + ": agent failed";
    }
    if r.output == () || type_of(r.output) != "map" {
        return name + ": no structured output";
    }
    let s = name + "\n";
    s += trimmed(r.output.summary) + "\n";
    s += "next: " + trimmed(r.output.safe_next) + "\n";
    if r.output.findings != () && type_of(r.output.findings) == "array" {
        for f in r.output.findings {
            if f != () && type_of(f) == "map" {
                s += "- " + trimmed(f.severity) + ": " + trimmed(f.claim) + " | " + trimmed(f.evidence) + "\n";
            }
        }
    }
    s
}

fn rules() {
    let p = "You are a read-only auditor of /home/emoporemilio/projects/viviana-hub/ui on branch main.\n";
    p += "Use read_file, grep, and git. Do not edit files. Do not commit. Do not push. Do not run Playwright, a dev server, the certified suite, or vp run test:run.\n";
    p += "Do not read agent transcripts. Verify the tree. A claim needs a path you opened or a git command you ran.\n";
    p += "Search tickets with rg --no-ignore -g '*.md' under .claude/tickets. Default search skips .claude.\n";
    p += "Upstream behavior lives in react-spectrum/packages. Do not read react-spectrum/examples or starters.\n";
    p += "Styled Spectrum 2 source is react-spectrum/packages/@react-spectrum/s2/src.\n";
    p += "Return at most 6 findings. severity is blocker, gap, or hygiene. claim is one sentence. evidence names the path or command. safe_next is one sentence and not a patch.\n";
    p += "Do not propose a new public name, a dependency, or a publish. The public-face worktree is another writer's seat. Leave it alone.\n";
    p
}

phase("Audit");

let wip = rules();
wip += "Lane: uncommitted Heading and Dialog split.\n";
wip += "Known dirty paths as of the handoff, which you must re-check with git status and git diff:\n";
wip += "packages/solidaria-components/src/Dialog.tsx\n";
wip += "packages/solidaria-components/src/Heading.tsx\n";
wip += "packages/solidaria-components/src/index.ts\n";
wip += "packages/solidaria-components/package.json\n";
wip += "packages/solidaria-components/test/Dialog.test.tsx\n";
wip += "packages/solidaria-components/test/Dialog.ssr.test.tsx\n";
wip += "packages/solidaria-components/test/Heading.test.tsx\n";
wip += "Open each path that still exists. Read the diff. Find the upstream React Aria Components Dialog and Heading sources and say whether this split matches that file boundary.\n";
wip += "Judge completeness: exports, package exports, SSR test, and whether tests assert behavior or only that a function exists.\n";
wip += "Say if the work is safe to finish on this tree, or if it is a partial edit that should not be committed as-is.\n";

let commits = rules();
commits += "Lane: the twenty commits on main that are not on origin/main.\n";
commits += "Run git rev-parse HEAD and git rev-parse origin/main. Run git log --format='%h %s' origin/main..HEAD.\n";
commits += "The handoff list, which you must re-check, was:\n";
commits += "9c92f721 #175 Color.tsx split; 9ddc120a #171 press timing; a6bf3825 #441 children helper; 08979ee8 #164 disclosure SSR; 3c84eae8 #169 selectboxgroup; f5397dcb #258 RadioGroup slots; a18a0b66 #168 styled hydration; 0f7b7d6b #173 matte field chrome; 836bfdbe #170 breadcrumbs; 30123faa #619 collection registration; 02130c8e #147 packaging; a7f9ebb6 #153 ts-nocheck; a65d6b19 #138 npm pin; 8a94026b #149 publish drift; 44aa1e4e #613 hydration markers; 629f3eca #58 and #56 help text; 21d84b05 #57 group help text; 103339b1 #209 render-prop fields; 61a7b711 #43 static picker children; e357d5ef #584 picker trigger.\n";
commits += "For each commit run git show --stat --format='%h %s'. Flag a commit only when the stat does not match the message, the commit touches the dirty Heading or Dialog paths, or the change looks truncated.\n";
commits += "summary is the count you actually saw and whether the handoff list still matches.\n";

let tickets = rules();
tickets += "Lane: ticket truth for the commits above.\n";
tickets += "Open .claude/current/status.md. It is generated. Do not edit it.\n";
tickets += "For ticket ids 175, 171, 441, 164, 169, 258, 168, 173, 170, 619, 147, 153, 138, 149, 613, 58, 56, 57, 209, 43, and 584, find the ticket file and read its status and the latest history entry.\n";
tickets += "A finding is a commit that claims work the ticket still leaves open, or a ticket marked verified while the named behavior is absent from the commit's files. Read the ticket before you say that.\n";
tickets += "Do not reclassify held tickets. #56 stays in progress until #57 and #58 are complete only if the ticket still says so. Check the current text.\n";

let risk = rules();
risk += "Lane: integration risk.\n";
risk += "Confirm the checkout is /home/emoporemilio/projects/viviana-hub/ui, branch main, and list git worktree list.\n";
risk += "The handoff said public-face is at .claude/worktrees/public-face on branch public-face, and measure and ssr-545 are detached. Re-check.\n";
risk += "Confirm whether origin/main is an ancestor of HEAD and how many commits ahead. Do not fetch and do not push.\n";
risk += "Run gh run list --branch main --limit 4. If gh is not authenticated, say so and do not invent CI status.\n";
risk += "Say whether a later worker can keep editing the Heading split on this checkout without colliding with the public-face worktree.\n";

let results = parallel([
    #{ prompt: wip, label: "audit:heading-dialog", capability_mode: "read-only", output_schema: lane_schema },
    #{ prompt: commits, label: "audit:unpushed", capability_mode: "read-only", output_schema: lane_schema },
    #{ prompt: tickets, label: "audit:tickets", capability_mode: "read-only", output_schema: lane_schema },
    #{ prompt: risk, label: "audit:integration", capability_mode: "read-only", output_schema: lane_schema },
]);

let body = "";
if type_of(results) == "array" {
    let names = ["Heading/Dialog", "Unpushed commits", "Ticket truth", "Integration"];
    let i = 0;
    while i < results.len() && i < names.len() {
        body += lane_text(results[i], names[i]) + "\n";
        i += 1;
    }
} else {
    body = "Audit panel returned no array.";
}

phase("Report");
log("Audit panel finished. Writing the report.");

let synth = "You are the synthesizer for a read-only audit of /home/emoporemilio/projects/viviana-hub/ui.\n";
synth += "Do not edit the repository. Do not run tests. Use only the lane text below. Do not invent a lane that is missing.\n";
synth += "Write a short report: what stopped, what you could verify, blockers, and one safe next action for a later worker.\n";
synth += "blockers is the count of findings whose severity is blocker. safe_next is one sentence.\n";
synth += "Lane text follows.\n";
synth += body;

let report = agent(synth, #{
    label: "report",
    capability_mode: "read-only",
    output_schema: report_schema,
});

if report == () || type_of(report) != "map" || report.success != true || report.output == () || type_of(report.output) != "map" {
    complete(#{
        summary: "Audit lanes finished but the report agent failed.",
        lanes: body,
    });
}

let text = trimmed(report.output.report);
let path = write_scratch_file("stopped-run-audit.md", text);
complete(#{
    path: path,
    report: text,
    safe_next: trimmed(report.output.safe_next),
    blockers: report.output.blockers,
});
