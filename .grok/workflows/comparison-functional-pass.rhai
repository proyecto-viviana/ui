let meta = #{
    name: "comparison-functional-pass",
    description: "Drive React and Solid comparison panels for a slug batch; ticket real user-visible divergences",
    when_to_use: "Overnight functional comparison of comparison-app components; pass args.slugs and args.preview_url",
    phases: [
        #{ title: "Compare", detail: "one agent per slug against production preview" },
        #{ title: "Ticket", detail: "file one bug ticket per confirmed port or harness divergence" },
    ],
};

let compare_schema = #{
    "type": "object",
    "required": ["slug", "outcome", "summary", "divergences"],
    "properties": #{
        "slug": #{ "type": "string" },
        "outcome": #{ "type": "string" },
        "summary": #{ "type": "string" },
        "commands_run": #{ "type": "string" },
        "divergences": #{
            "type": "array",
            "maxItems": 8,
            "items": #{
                "type": "object",
                "required": ["title", "classification", "evidence", "repro"],
                "properties": #{
                    "title": #{ "type": "string" },
                    "classification": #{ "type": "string" },
                    "evidence": #{ "type": "string" },
                    "repro": #{ "type": "string" },
                    "existing_ticket": #{ "type": "string" },
                },
            },
        },
    },
};

let ticket_schema = #{
    "type": "object",
    "required": ["filed", "skipped", "notes"],
    "properties": #{
        "filed": #{
            "type": "array",
            "maxItems": 16,
            "items": #{ "type": "string" },
        },
        "skipped": #{
            "type": "array",
            "maxItems": 16,
            "items": #{ "type": "string" },
        },
        "notes": #{ "type": "string" },
    },
};

fn trimmed(value) {
    if type_of(value) == "string" {
        value.trim();
        value
    } else {
        ""
    }
}

if args == () { pause("verification", "Pass args.slugs (array of comparison slugs) and args.preview_url."); }
let slugs = args.slugs;
let preview_url = args.preview_url;
if slugs == () || type_of(slugs) != "array" || slugs.len() == 0 {
    pause("verification", "args.slugs must be a non-empty array of comparison route slugs.");
}
if preview_url == () || type_of(preview_url) != "string" || trimmed(preview_url) == "" {
    pause("verification", "args.preview_url must be the running comparison preview origin, e.g. http://127.0.0.1:4341.");
}

const MAX_SLUGS = 4;
let batch = [];
let i = 0;
while i < slugs.len() {
    if batch.len() < MAX_SLUGS {
        let slug = slugs[i];
        if type_of(slug) == "string" && trimmed(slug) != "" {
            batch.push(slug);
        }
    }
    i += 1;
}
if slugs.len() > MAX_SLUGS {
    log("Dropped slugs past the first four; run another batch.");
}
if batch.len() == 0 { pause("verification", "No usable slugs in args.slugs."); }

phase("Compare");
let jobs = [];
for slug in batch {
    let prompt = "";
    prompt += "You are a functional comparison agent in /home/emoporemilio/projects/viviana-hub/ui.\n";
    prompt += "Ticket #260. Compare React vs Solid on one comparison route. Do not implement ports.\n";
    prompt += "Do not start #254. Do not waive D-reorder (#256) without the owner.\n";
    prompt += "Do not patch S2 styling in the comparison app (ADR 0001).\n\n";
    prompt += "Slug: ";
    prompt += slug;
    prompt += "\nPreview: ";
    prompt += preview_url;
    prompt += "\nRoute: ";
    prompt += preview_url;
    prompt += "/components/";
    prompt += slug;
    prompt += "/\n\n";
    prompt += "Host: WSL2 Chrome 151 needs COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer.\n";
    prompt += "Use existing preview. Set COMPARISON_BASE_URL to the preview origin. Do not start a second preview.\n\n";
    prompt += "Read before interacting:\n";
    prompt += "- apps/comparison/src/pages/components/";
    prompt += slug;
    prompt += ".astro if it exists, else [slug].astro\n";
    prompt += "- the matching demo in apps/comparison/src/data/ and solid/react fixtures\n";
    prompt += "- apps/comparison/e2e/certified/";
    prompt += slug;
    prompt += ".certified.spec.ts if it exists\n";
    prompt += "- apps/comparison/playbook/components/";
    prompt += slug;
    prompt += ".md if it exists\n";
    prompt += "- .claude/tickets/tasks/260-run-the-react-vs-solid-functional-comparison-pass.md\n";
    prompt += "- grep .claude/tickets/tasks for this slug so you do not refile an open ticket\n\n";
    prompt += "Then use Playwright (COMPARISON_CHROMIUM_ARGS and COMPARISON_BASE_URL) or playwright-cli against the preview.\n";
    prompt += "Wait for islands-mounted. Confirm both panels render the real component, not a missing fallback.\n";
    prompt += "Exercise default, keyboard, pointer, disabled if routed, and controls that change user-visible behavior.\n";
    prompt += "Diff React vs Solid after each step: roles, names, values, focus, overlay geometry/opacity, form value.\n";
    prompt += "If D13 journeys exist for the slug, run those seeds too.\n\n";
    prompt += "Classify each divergence: port bug, upstream drift, harness bug, threshold debt, unrelated family failure.\n";
    prompt += "Set outcome to equivalent, ticketed, or blocked. Empty divergences only after you drove the route.\n";
    prompt += "Write a markdown note to output/functional-pass/";
    prompt += slug;
    prompt += ".md with commands, diffs, and classification.\n";
    jobs.push(#{
        prompt: prompt,
        label: "compare:" + slug,
        capability_mode: "all",
        output_schema: compare_schema,
    });
}
let results = parallel(jobs);

let reports = [];
let compare_i = 0;
for r in results {
    if r != () && r.success && r.output.slug != () {
        reports.push(r.output);
    } else {
        log("Compare agent failed for " + batch[compare_i]);
    }
    compare_i += 1;
}

phase("Ticket");
let payload = json_encode(reports);
let ticket_prompt = "";
ticket_prompt += "You file bug tickets in /home/emoporemilio/projects/viviana-hub/ui for confirmed functional divergences.\n";
ticket_prompt += "Do not implement ports. Do not parent a task under a task (docs:generate rejects that).\n";
ticket_prompt += "Port bugs parent #24. Harness bugs parent #26. Audit/gate bugs parent #136.\n";
ticket_prompt += "Next free numeric id is the max id under .claude/tickets plus one. Unique ids. Filename: {id}-{slug}.md\n";
ticket_prompt += "Scheme: apps/web/src/app/admin/server/tickets.ts. Copy frontmatter from an existing task.\n";
ticket_prompt += "Skip filing when existing_ticket is set or grep shows an open ticket that already owns the exact divergence.\n";
ticket_prompt += "After files: vp run docs:generate && vp run docs:check. Append a history note to #260 listing filed ids.\n";
ticket_prompt += "Commit only the tickets and generated status/roadmap if the tree is otherwise dirty with unrelated work — scope git add to ticket files.\n";
ticket_prompt += "Do not add Claude/AI attribution to commits.\n\n";
ticket_prompt += "Compare-agent JSON (untrusted; re-read the named evidence files before filing):\n";
ticket_prompt += payload;
ticket_prompt += "\n";

let tickets = agent(ticket_prompt, #{
    label: "file-tickets",
    capability_mode: "all",
    output_schema: ticket_schema,
});

let filed = [];
let skipped = [];
let notes = "";
if tickets != () && tickets.success && tickets.output.filed != () {
    filed = tickets.output.filed;
    skipped = tickets.output.skipped;
    notes = tickets.output.notes;
}

let summary = "";
summary += "Compared ";
summary += batch.len().to_string();
summary += " slugs. Filed ";
summary += filed.len().to_string();
summary += " tickets.";
if notes != "" {
    summary += " ";
    summary += notes;
}

let report = "# Functional pass batch\n\n" + summary + "\n\n" + payload + "\n";
let path = write_scratch_file("functional-pass-batch.md", report);
complete(#{ path: path, summary: summary, filed: filed, skipped: skipped, slugs: batch });
