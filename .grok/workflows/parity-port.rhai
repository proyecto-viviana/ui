let meta = #{
    name: "parity-port",
    description: "Port the unticketed pin-matching parity gaps in conflict-free slices",
    when_to_use: "After parity-gaps.md. One workflow, panels of eight, worktree edits, no certified suite and no push.",
    phases: [
        #{ title: "Port", detail: "conflict-free slices, eight at a time" },
        #{ title: "Check", detail: "one skeptic per slice" },
        #{ title: "Report", detail: "what each worktree changed" },
    ],
};

let port_schema = #{
    "type": "object",
    "required": ["id", "worktree_path", "changed", "summary", "tests_run", "blocked"],
    "properties": #{
        "id": #{ "type": "string" },
        "worktree_path": #{ "type": "string" },
        "changed": #{ "type": "array", "items": #{ "type": "string" } },
        "summary": #{ "type": "string" },
        "tests_run": #{ "type": "string" },
        "blocked": #{ "type": "string" },
    },
};

let check_schema = #{
    "type": "object",
    "required": ["id", "verdict", "evidence"],
    "properties": #{
        "id": #{ "type": "string" },
        "verdict": #{ "type": "string" },
        "evidence": #{ "type": "string" },
    },
};

let report_schema = #{
    "type": "object",
    "required": ["report"],
    "properties": #{
        "report": #{ "type": "string" },
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

fn slices() {
    let items = [];
    items.push(#{
        id: "combobox-selection",
        files: "packages/solid-stately/src/combobox/createComboBoxState.ts",
        hold: "The public value shape owned by #115. Do not add setValue, onChange, or a readonly Key array value.",
        task: "Single selection must disallow an empty selection and must emit the same key again, so choosing the already selected option resets the input and closes the menu. The same-key branch is already in onSelectionChange and a click never reaches it. Match react-stately/src/combobox/useComboBoxState.ts.",
    });
    items.push(#{
        id: "datepicker-halves",
        files: "packages/solid-stately/src/calendar/createDatePickerState.ts, packages/solidaria-components/src/DatePicker.tsx, packages/solid-spectrum/src/calendar/DatePicker.tsx",
        hold: "Styled Calendar size, owned by #207. Do not add or remove a size prop.",
        task: "dateValue and timeValue must expose the in-progress half the way react-stately/src/datepicker/useDatePickerState.ts exposes selectedDate and selectedTime. The styled popover TimeField must also pass placeholderValue, minValue, maxValue, and hideTimeZone the way @react-spectrum/s2/src/DatePicker.tsx does. Leave shouldForceLeadingZeros only when that S2 popover TimeField passes it.",
    });
    items.push(#{
        id: "slider-rtl",
        files: "packages/solidaria/src/slider/createSlider.ts",
        hold: "The thumb role and the range input tabIndex, owned by #74. Do not swap which element is the focus target.",
        task: "Mirror a horizontal pointer percent and the thumb offset when locale direction is rtl, the way react-aria/src/slider/useSlider.ts and useSliderThumb.ts do. Vertical already uses the bottom edge.",
    });
    items.push(#{
        id: "breadcrumbs",
        files: "packages/solidaria/src/breadcrumbs/createBreadcrumbs.ts, packages/solidaria-components/src/Breadcrumbs.tsx",
        hold: "Do not change createLink itself. The standalone Link already calls handleLinkClick.",
        task: "Name an unlabeled breadcrumbs nav from the breadcrumbs catalog string, matching react-aria/src/breadcrumbs/useBreadcrumbs.ts. On the breadcrumb item click, call handleLinkClick the way react-aria/src/link/useLink.ts does, so RouterProvider can client-navigate.",
    });
    items.push(#{
        id: "combobox-keys",
        files: "packages/solidaria/src/combobox/createComboBox.ts",
        hold: "Do not edit createComboBoxState.ts. That file is another slice.",
        task: "While the menu is open, PageUp and PageDown move the highlighted option. ArrowLeft and ArrowRight clear the focused key and leave the caret default. Match react-aria/src/combobox/useComboBox.ts and the page keys in useSelectableCollection.ts.",
    });
    items.push(#{
        id: "actiongroup-rtl",
        files: "packages/solidaria/src/actiongroup/createActionGroup.ts",
        hold: "No other keyboard shortcut.",
        task: "Flip ArrowLeft and ArrowRight whenever locale direction is rtl, including a vertical group. Match react-aria/src/actiongroup/useActionGroup.ts.",
    });
    items.push(#{
        id: "button-handlers",
        files: "packages/solidaria/src/button/createButton.ts",
        hold: "Do not add a ref argument. The function takes props only.",
        task: "Forward onFocus, onBlur, onFocusChange, onKeyDown, and onKeyUp into createFocusable, the way react-aria/src/button/useButton.ts passes props to useFocusable.",
    });
    items.push(#{
        id: "numberfield",
        files: "packages/solidaria/src/numberfield/createNumberField.ts, packages/solidaria-components/src/NumberField.tsx",
        hold: "Do not change formatting rules other than inputMode, the submitted value, and isWheelDisabled.",
        task: "Choose inputMode from platform, sign, and fraction digits, matching react-aria/src/numberfield/useNumberField.ts. Pass isWheelDisabled through. Submit the parsed number from a hidden input and keep name off the formatted field, matching react-aria-components/src/NumberField.tsx.",
    });
    items.push(#{
        id: "checkbox-group",
        files: "packages/solidaria/src/checkbox/createCheckboxGroupItem.ts, packages/solid-stately/src/checkbox/createCheckboxGroupState.ts",
        hold: "Do not redesign the group value.",
        task: "Add setInvalid on the group state and roll each item validity into it, matching react-stately/src/checkbox/useCheckboxGroupState.ts and react-aria/src/checkbox/useCheckboxGroupItem.ts.",
    });
    items.push(#{
        id: "grid-announce",
        files: "packages/solidaria/src/gridlist/createGridList.ts, packages/solidaria/src/grid/createGrid.ts, packages/solidaria/src/tree/createTree.ts",
        hold: "Do not add drag-and-drop behavior. #84 owns that.",
        task: "Speak selection changes and the touch highlight hint on grid, grid list, and tree, using the existing grid catalog strings. useGridList.ts calls useHighlightSelectionDescription and useGridSelectionAnnouncement. useGrid.ts calls both. useTree.ts gets them by calling useGridList.",
    });
    items.push(#{
        id: "tooltip-key",
        files: "packages/solidaria/src/tooltip/createTooltipTrigger.ts",
        hold: "Keep the shouldCloseOnPress gate.",
        task: "Close the tooltip on any trigger keydown, matching react-aria/src/tooltip/useTooltipTrigger.ts.",
    });
    items.push(#{
        id: "autocomplete-blur",
        files: "packages/solidaria/src/autocomplete/createAutocomplete.ts",
        hold: "Do not replace the later active-descendant path. Fill the empty focus and blur handlers.",
        task: "Dispatch virtual blur when the input blurs and restore virtual focus on focus, matching react-aria/src/autocomplete/useAutocomplete.ts, so the option ring leaves the field.",
    });
    items.push(#{
        id: "range-press",
        files: "packages/solidaria/src/calendar/createRangeCalendarCell.ts",
        hold: "Do not change the painted day number. #424 owns formatToParts. Do not remove the hover drag path #423 added.",
        task: "Pressing an existing range start or end resizes that endpoint. A touch press waits 200ms before dragging. Match the press start branch in react-aria/src/calendar/useCalendarCell.ts.",
    });
    items.push(#{
        id: "calendar-era",
        files: "packages/solidaria/src/calendar/createCalendarCell.ts",
        hold: "Do not edit the range cell. It already includes the era.",
        task: "Include the BC era in the single cell accessible name, matching getEraFormat in react-aria/src/calendar/useCalendarCell.ts.",
    });
    items.push(#{
        id: "channel-locale",
        files: "packages/solidaria/src/color/createColorField.ts",
        hold: "Do not change channel editing.",
        task: "Resolve an unlabeled channel name with the active locale, matching react-aria/src/color/useColorChannelField.ts. Remove the hardcoded en-US.",
    });
    items.push(#{
        id: "toast-label",
        files: "packages/solidaria/src/toast/createToastRegion.ts",
        hold: "Do not change toast timing.",
        task: "Name the region with the notifications catalog string and the visible toast count, matching react-aria/src/toast/useToastRegion.ts.",
    });
    items.push(#{
        id: "progress-locale",
        files: "packages/solidaria/src/progress/createProgressBar.ts",
        hold: "Meter must keep going through this hook. Do not fork a second formatter there.",
        task: "Format aria-valuetext with the provider locale, matching useNumberFormatter in react-aria/src/progress/useProgressBar.ts. Replace Intl.NumberFormat(undefined).",
    });
    items.push(#{
        id: "menu-label-section",
        files: "packages/solidaria-components/src/Menu.tsx",
        hold: "Closed submenu aria-expanded and first-item focus, owned by #51. Do not change those.",
        task: "Keep aria-labelledby on a MenuItem whose children are elements, matching useMenuItem.ts and react-aria-components/src/Menu.tsx. Dynamic sections must label the group from a presentation heading, matching react-aria/src/menu/useMenuSection.ts.",
    });
    items.push(#{
        id: "color-live",
        files: "packages/solidaria-components/src/Color.tsx",
        hold: "Do not redesign the color editor.",
        task: "Store the swatch color behind a getter so ColorSwatch follows later color updates. Uncontrolled ColorPicker and ColorSwatchPicker fall back to #000000, matching react-stately/src/color/useColorPickerState.ts.",
    });
    items.push(#{
        id: "tree-context",
        files: "packages/solidaria-components/src/Tree.tsx",
        hold: "The drag button slot, owned by #84. Do not add hasDragButton.",
        task: "Give TreeItemContentContext the renderValues accessor so selection, focus, hover, press, and expansion stay current. React passes a new context value on each render.",
    });
    items.push(#{
        id: "virtualizer",
        files: "packages/solidaria-components/src/Virtualizer.tsx",
        hold: "Do not change layout math.",
        task: "Pass VirtualizerContext and CollectionRendererContext as accessors so orientation and layoutDelegate stay current. Put the LayoutDelegate methods the file already calls on the exported VirtualizerLayout type, matching ILayout extends Layout in react-aria-components/src/Virtualizer.tsx. Remove the as-any calls those methods required.",
    });
    items.push(#{
        id: "searchfield",
        files: "packages/solidaria-components/src/SearchField.tsx",
        hold: "The label id already wired through labelProps stays.",
        task: "Forward validate and the caller id into createSearchField, matching the props spread in react-aria/src/searchfield/useSearchField.ts.",
    });
    items.push(#{
        id: "form-errors",
        files: "packages/solidaria-components/src/Form.tsx",
        hold: "Do not spread the props object into context. The file documents the hydration bug that causes.",
        task: "Provide validationErrors through a live getter so a later server error map reaches the fields, matching react-aria-components/src/Form.tsx.",
    });
    items.push(#{
        id: "popover-submenu",
        files: "packages/solidaria-components/src/Popover.tsx",
        hold: "PreviewTrigger focus behavior stays as it is.",
        task: "Treat a SubmenuTrigger popover as non-modal, matching isNonModal on useSubmenuTrigger.ts. Move focus into a keyboard-opened submenu, and skip that move only when the modality is pointer, matching react-aria-components/src/Popover.tsx.",
    });
    items.push(#{
        id: "modal-dismiss",
        files: "packages/solidaria-components/src/Modal.tsx",
        hold: "Keep the 1px sentinel box.",
        task: "Localize the dismiss button from the overlays catalog string dismiss, matching react-aria/src/overlays/DismissButton.tsx. Remove the hardcoded English Dismiss.",
    });
    items.push(#{
        id: "button-style",
        files: "packages/solid-spectrum/src/button/Button.tsx",
        hold: "Do not change the shared 1lh progress circle used by other components. #240 owns that generic size.",
        task: "Pass isFocusVisible into the premium and genai gradient state, matching @react-spectrum/s2/src/Button.tsx. Size the pending circle at the button call site to 14, 18, 20, or 24 by button size. Do not edit the shared 1lh helper.",
    });
    items.push(#{
        id: "clear-button",
        files: "packages/solid-spectrum/src/button/ClearButton.tsx",
        hold: "Do not invent a sm/md/lg alias. Our other buttons already use S, M, L, and XL.",
        task: "Match @react-spectrum/s2/src/ClearButton.tsx: sizes S, M, L, and XL, transparent control at the control width, and no label of its own. Update call sites in solid-spectrum and viviana-ui that still pass sm, md, or lg. The caller supplies the accessible name.",
    });
    items.push(#{
        id: "option-color",
        files: "packages/solid-spectrum/src/listbox/index.tsx, packages/solid-spectrum/src/select/index.tsx",
        hold: "Do not invent a new accent pair.",
        task: "Match the selected treatment in @react-spectrum/s2/src/Menu.tsx. Selected text stays neutral. Selection is the accent checkmark. accent-subtle is not the option fill.",
    });
    items.push(#{
        id: "focus-rings",
        files: "packages/solid-spectrum/src/table/index.tsx, packages/solid-spectrum/src/gridlist/index.tsx, packages/solid-spectrum/src/tree/index.tsx",
        hold: "ListView windowing is #66. Table drag chrome is #84. Do not virtualize or add drag chrome.",
        task: "On the table, list, and tree container that spreads focusRing, stop forcing outlineStyle none. Match @react-spectrum/s2/src/TableView.tsx, ListView.tsx, and TreeView.tsx, where that container keeps the ring and outlineStyle none stays on rows, cells, and columns.",
    });
    items.push(#{
        id: "provider-router",
        files: "packages/solid-spectrum/src/provider/index.tsx",
        hold: "Do not add a routing library. RouterProvider already exists in this repo.",
        task: "Accept the router prop and wrap children in RouterProvider when it is set, matching @react-spectrum/s2/src/Provider.tsx.",
    });
    items.push(#{
        id: "docs",
        files: "packages/solidaria/README.md, packages/solidaria-components/README.md, .claude/reference/patterns.md, .claude/current/glasselated-port.md, .claude/current/README.md, .claude/skills/playwright-cli/SKILL.md, AGENTS.md",
        hold: "Do not edit certification.md, release.yml, or the parity-gaps index row. Do not delete the live-docs start list.",
        task: "Make the false sentences true. createButton takes props only. Button render props are booleans, not accessors. glasselated-port.md must match viviana-tokens.css, the Geist data-theme attribute, and motion.ts. Cut the full-board step and the #136 handoff from the current index so a cold agent reads status.md and opens one ticket. Point the Playwright skill at the installed playwright binary. Make AGENTS.md name vp run test:run, matching tooling.md and commands.md.",
    });
    items
}

fn port_prompt(slice) {
    let p = "Port one confirmed parity gap in /home/emoporemilio/projects/viviana-hub/ui.\n";
    p += "Edit only inside your worktree. Run pwd. If pwd is exactly /home/emoporemilio/projects/viviana-hub/ui, change nothing and set blocked to not isolated.\n";
    p += "The pinned oracle is the absolute directory /home/emoporemilio/projects/viviana-hub/ui/react-spectrum/packages. It is read-only. Do not edit it, and do not read examples, starters, or @spectrum-icons.\n";
    p += "Styled Spectrum 2 source is @react-spectrum/s2/src. The pin commit is f56660b234bd588751c9f35b85d6fe6e17e45ccf.\n";
    p += "Read .claude/current/parity-gaps.md for the row, then open the pinned file and the Solid file before editing.\n";
    p += "If you edit a solid-spectrum file, open scripts/layer-boundary-baseline.json. Apply the same edit to the viviana-ui file at the same relative path when the baseline does not mark that file diverged. Leave a diverged file alone.\n";
    p += "Do not add a dependency, a public export, or a public name. Do not commit, push, stash, or clean. Do not run Playwright, the certified suite, or vp install.\n";
    p += "Run a narrow existing unit test only when node_modules is already present. Otherwise set tests_run to not run.\n";
    p += "Slice id: ";
    p += slice.id;
    p += "\nFiles you may edit: ";
    p += slice.files;
    p += "\nDo not touch: ";
    p += slice.hold;
    p += "\nTask: ";
    p += slice.task;
    p += "\nReturn id as the slice id, worktree_path from pwd, changed as repo-relative files you edited, summary as the behavior change, tests_run as the command or not run, and blocked as empty when you edited. If the pin cannot be matched without a new dependency or a public name, edit nothing and put the reason in blocked.\n";
    p
}

fn port_jobs(panel, schema) {
    let jobs = [];
    for slice in panel {
        jobs.push(#{
            prompt: port_prompt(slice),
            label: "port:" + slice.id,
            capability_mode: "execute",
            isolation_worktree: true,
            output_schema: schema,
        });
    }
    jobs
}

fn check_prompt(slice, result) {
    let path = "";
    let summary = "";
    let blocked = "";
    let changed = "";
    if result != () && result.success && result.output != () {
        path = trimmed(result.output.worktree_path);
        summary = trimmed(result.output.summary);
        blocked = trimmed(result.output.blocked);
        if result.output.changed != () {
            changed = json_encode(result.output.changed);
        }
    }
    let p = "Check one parity port. Read-only. Do not edit.\n";
    p += "Pinned oracle: /home/emoporemilio/projects/viviana-hub/ui/react-spectrum/packages. Pin commit f56660b234bd588751c9f35b85d6fe6e17e45ccf.\n";
    p += "Open the pinned file and the edited file. Quote both in evidence.\n";
    p += "Slice: ";
    p += slice.id;
    p += "\nTask: ";
    p += slice.task;
    p += "\nHeld back: ";
    p += slice.hold;
    p += "\nWorktree: ";
    p += path;
    p += "\nPorter summary: ";
    p += summary;
    p += "\nPorter blocked: ";
    p += blocked;
    p += "\nPorter changed: ";
    p += changed;
    p += "\nverdict match: the edit does what the pinned file does, and it leaves the held behavior alone.\n";
    p += "verdict miss: the edit is absent, wrong, or it changes held behavior.\n";
    p += "verdict blocked: the porter blocked, or the worktree path is empty.\n";
    p += "id is the slice id. evidence quotes the pinned line and the edited line, or says what is missing.\n";
    p
}

fn check_jobs(rows, schema) {
    let jobs = [];
    for row in rows {
        jobs.push(#{
            prompt: check_prompt(row.slice, row.result),
            label: "check:" + row.slice.id,
            capability_mode: "read-only",
            output_schema: schema,
        });
    }
    jobs
}

fn chunk(items, start) {
    let out = [];
    let index = 0;
    for item in items {
        if index >= start && out.len() < 8 {
            out.push(item);
        }
        index += 1;
    }
    out
}

fn writer_prompt(payload) {
    let p = "Write a markdown report from this JSON only. Do not add slices.\n";
    p += "Group rows by verdict: match, miss, blocked, unchecked.\n";
    p += "Each row: id, worktree path, changed files, summary, evidence.\n";
    p += "Say that main was not edited by this run and that a match still needs a conductor commit.\n";
    p += "The certified suite was not run.\n\n";
    p += payload;
    p
}

let all = slices();
let ports = [];
let starts = [0, 8, 16, 24];

phase("Port");
for start in starts {
    let panel = chunk(all, start);
    if panel.len() > 0 {
        log("port panel " + panel.len().to_string());
        let results = parallel(port_jobs(panel, port_schema));
        let index = 0;
        for result in results {
            ports.push(#{
                slice: panel[index],
                result: result,
            });
            index += 1;
        }
    }
}

phase("Check");
let checks = [];
for start in starts {
    let panel = chunk(ports, start);
    if panel.len() > 0 {
        log("check panel " + panel.len().to_string());
        let results = parallel(check_jobs(panel, check_schema));
        let index = 0;
        for result in results {
            checks.push(#{
                slice: panel[index].slice,
                port: panel[index].result,
                check: result,
            });
            index += 1;
        }
    }
}

let rows = [];
for row in checks {
    let verdict = "unchecked";
    let evidence = "";
    let path = "";
    let summary = "";
    let blocked = "";
    let changed = [];
    if row.check != () && row.check.success && row.check.output != () {
        verdict = trimmed(row.check.output.verdict);
        evidence = trimmed(row.check.output.evidence);
    }
    if verdict == "" {
        verdict = "unchecked";
    }
    if row.port != () && row.port.success && row.port.output != () {
        path = trimmed(row.port.output.worktree_path);
        summary = trimmed(row.port.output.summary);
        blocked = trimmed(row.port.output.blocked);
        if row.port.output.changed != () {
            changed = row.port.output.changed;
        }
    }
    rows.push(#{
        id: row.slice.id,
        verdict: verdict,
        evidence: evidence,
        worktree_path: path,
        summary: summary,
        blocked: blocked,
        changed: changed,
    });
}

phase("Report");
let payload = json_encode(rows);
let writer = agent(
    writer_prompt(payload),
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
    log("writer failed, saving the JSON");
    report = payload;
}

let path = write_scratch_file("parity-port.md", report);
log(rows.len().to_string() + " slices");
complete(#{
    path: path,
    report: report,
    slices: rows.len(),
});
