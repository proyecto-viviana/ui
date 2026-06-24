import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@solidjs/testing-library";
import { ListView, ListViewContext, ListViewItem, Text, type ListViewSelectionStyle } from "../src";
import * as listViewSubpath from "../src/ListView";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";

interface DocumentItem {
  id: string;
  name: string;
  description: string;
}

const documents: DocumentItem[] = [
  { id: "project-brief", name: "Project brief", description: "Planning notes" },
  { id: "quarterly-report", name: "Quarterly report", description: "Finance packet" },
  { id: "budget", name: "Budget", description: "Forecast sheet" },
];

function normalizeKeys(keys: "all" | Set<unknown>) {
  return keys === "all"
    ? new Set(documents.map((item) => item.id))
    : new Set(Array.from(keys, String));
}

describe("ListView (solid-spectrum)", () => {
  it("exports the public ListView subpath surface", () => {
    expect(listViewSubpath.ListView).toBe(ListView);
    expect(listViewSubpath.ListViewItem).toBe(ListViewItem);
    expect(listViewSubpath.Item).toBe(ListViewItem);
    expect(listViewSubpath.ListViewContext).toBe(ListViewContext);
    expect(listViewSubpath.ListViewSelectionCheckbox).toBeDefined();
  });

  it("renders dynamic items with grid semantics, slots, and S2 data attributes", () => {
    render(() => (
      <ListView
        aria-label="Documents"
        items={documents}
        getKey={(item) => item.id}
        getTextValue={(item) => item.name}
        selectionMode="multiple"
        defaultSelectedKeys={["project-brief"]}
      >
        {(item) => (
          <ListViewItem id={item.id} textValue={item.name}>
            <Text slot="label">{item.name}</Text>
            <Text slot="description">{item.description}</Text>
          </ListViewItem>
        )}
      </ListView>
    ));

    const grid = screen.getByRole("grid", { name: "Documents" });
    expect(grid).toHaveAttribute("data-list-view");
    expect(grid).toHaveAttribute("data-selection-style", "checkbox");
    expect(grid).toHaveAttribute("data-overflow-mode", "truncate");
    expect(grid.getAttribute("class")).not.toContain("gap-2");

    const projectBrief = screen.getByRole("row", { name: /Project brief/ });
    expect(projectBrief).toHaveAttribute("data-selected", "true");
    expect(within(projectBrief).getByRole("checkbox", { name: "Select" })).toBeChecked();
    expect(screen.getByText("Project brief")).toHaveAttribute("data-rsp-slot", "label");
    expect(screen.getByText("Planning notes")).toHaveAttribute("data-rsp-slot", "description");
    expect(screen.getByRole("row", { name: /Quarterly report/ })).toBeInTheDocument();
  });

  it("supports controlled highlight selection with replace behavior", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();

    function Demo() {
      const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(new Set(["project-brief"]));
      return (
        <ListView
          aria-label="Documents"
          items={documents}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
          selectionMode="single"
          selectionStyle="highlight"
          selectedKeys={selectedKeys()}
          onSelectionChange={(keys) => {
            const nextKeys = normalizeKeys(keys);
            setSelectedKeys(new Set(Array.from(nextKeys, String)));
            onSelectionChange(keys);
          }}
        >
          {(item) => <ListViewItem id={item.id}>{item.name}</ListViewItem>}
        </ListView>
      );
    }

    render(() => <Demo />);

    const grid = screen.getByRole("grid", { name: "Documents" });
    expect(grid).toHaveAttribute("data-selection-style", "highlight");

    const projectBrief = screen.getByRole("row", { name: /Project brief/ });
    const quarterlyReport = screen.getByRole("row", { name: /Quarterly report/ });
    expect(projectBrief).toHaveAttribute("data-selected", "true");
    expect(within(projectBrief).queryByRole("checkbox", { name: "Select" })).toBeNull();

    await user.click(quarterlyReport);

    expect(projectBrief).not.toHaveAttribute("data-selected");
    expect(quarterlyReport).toHaveAttribute("data-selected", "true");
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["quarterly-report"]));
  });

  it("supports checkbox selection with toggle behavior", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();

    function Demo(props: { selectionStyle: ListViewSelectionStyle }) {
      const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(new Set(["project-brief"]));
      return (
        <ListView
          aria-label="Documents"
          items={documents}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
          selectionMode="multiple"
          selectionStyle={props.selectionStyle}
          selectedKeys={selectedKeys()}
          onSelectionChange={(keys) => {
            const nextKeys = normalizeKeys(keys);
            setSelectedKeys(new Set(Array.from(nextKeys, String)));
            onSelectionChange(keys);
          }}
        >
          {(item) => <ListViewItem id={item.id}>{item.name}</ListViewItem>}
        </ListView>
      );
    }

    render(() => <Demo selectionStyle="checkbox" />);

    const projectBrief = screen.getByRole("row", { name: /Project brief/ });
    const quarterlyReport = screen.getByRole("row", { name: /Quarterly report/ });
    expect(projectBrief).toHaveAttribute("data-selected", "true");
    expect(within(projectBrief).getByRole("checkbox", { name: "Select" })).toBeChecked();

    await user.click(quarterlyReport);

    expect(projectBrief).toHaveAttribute("data-selected", "true");
    expect(quarterlyReport).toHaveAttribute("data-selected", "true");
    expect(onSelectionChange).toHaveBeenLastCalledWith(
      new Set(["project-brief", "quarterly-report"]),
    );

    await user.click(projectBrief);

    expect(projectBrief).not.toHaveAttribute("data-selected");
    expect(quarterlyReport).toHaveAttribute("data-selected", "true");
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["quarterly-report"]));
  });

  it("supports disabledKeys without calling onSelectionChange", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();

    render(() => (
      <ListView
        aria-label="Documents"
        items={documents}
        getKey={(item) => item.id}
        getTextValue={(item) => item.name}
        selectionMode="multiple"
        selectedKeys={["project-brief"]}
        disabledKeys={["quarterly-report"]}
        onSelectionChange={onSelectionChange}
      >
        {(item) => <ListViewItem id={item.id}>{item.name}</ListViewItem>}
      </ListView>
    ));

    const quarterlyReport = screen.getByRole("row", { name: /Quarterly report/ });
    expect(quarterlyReport).toHaveAttribute("aria-disabled", "true");

    await user.click(quarterlyReport);

    expect(quarterlyReport).not.toHaveAttribute("data-selected");
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("supports item isDisabled without calling onSelectionChange", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();

    render(() => (
      <ListView
        aria-label="Documents"
        items={documents}
        getKey={(item) => item.id}
        getTextValue={(item) => item.name}
        selectionMode="multiple"
        selectedKeys={["project-brief"]}
        onSelectionChange={onSelectionChange}
      >
        {(item) => (
          <ListViewItem id={item.id} isDisabled={item.id === "quarterly-report"}>
            {item.name}
          </ListViewItem>
        )}
      </ListView>
    ));

    const quarterlyReport = screen.getByRole("row", { name: "Quarterly report" });
    expect(quarterlyReport).toHaveAttribute("aria-disabled", "true");

    await user.click(quarterlyReport);

    expect(quarterlyReport).not.toHaveAttribute("data-selected");
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("supports static ListViewItem children", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();

    render(() => (
      <ListView
        aria-label="Documents"
        selectionMode="single"
        defaultSelectedKeys={["project-brief"]}
        onSelectionChange={onSelectionChange}
      >
        <ListViewItem id="project-brief" textValue="Project brief">
          <Text slot="label">Project brief</Text>
          <Text slot="description">Planning notes</Text>
        </ListViewItem>
        <ListViewItem id="quarterly-report" textValue="Quarterly report">
          <Text slot="label">Quarterly report</Text>
          <Text slot="description">Finance packet</Text>
        </ListViewItem>
      </ListView>
    ));

    const projectBrief = await screen.findByRole("row", { name: /Project brief/ });
    const quarterlyReport = await screen.findByRole("row", { name: /Quarterly report/ });
    expect(projectBrief).toHaveAttribute("data-selected", "true");

    await user.click(quarterlyReport);

    expect(projectBrief).not.toHaveAttribute("data-selected");
    expect(quarterlyReport).toHaveAttribute("data-selected", "true");
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["quarterly-report"]));
  });

  it("merges ListViewContext props", () => {
    const ref = vi.fn();

    render(() => (
      <ListViewContext.Provider
        value={{
          "aria-label": "Context documents",
          isQuiet: true,
          selectionStyle: "highlight",
          overflowMode: "wrap",
          defaultSelectedKeys: ["quarterly-report"],
          UNSAFE_className: "context-list-view",
          UNSAFE_style: { margin: "1px" },
          ref,
        }}
      >
        <ListView items={documents} getKey={(item) => item.id} getTextValue={(item) => item.name}>
          {(item) => <ListViewItem id={item.id}>{item.name}</ListViewItem>}
        </ListView>
      </ListViewContext.Provider>
    ));

    const grid = screen.getByRole("grid", { name: "Context documents" });
    expect(grid).toHaveAttribute("data-quiet", "true");
    expect(grid).toHaveAttribute("data-selection-style", "highlight");
    expect(grid).toHaveAttribute("data-overflow-mode", "wrap");
    expect(grid).toHaveClass("context-list-view");
    expect(grid).toHaveStyle({ margin: "1px" });
    expect(screen.getByRole("row", { name: "Quarterly report" })).toHaveAttribute(
      "data-selected",
      "true",
    );
    expect(ref).toHaveBeenCalledWith(grid);
  });

  it("keeps renderActionBar selection in sync for uncontrolled ListView selection", async () => {
    const user = setupUser();

    render(() => (
      <ListView
        aria-label="Documents"
        items={documents}
        getKey={(item) => item.id}
        getTextValue={(item) => item.name}
        selectionMode="multiple"
        selectionStyle="checkbox"
        defaultSelectedKeys={["project-brief"]}
        renderActionBar={(keys) => (
          <output data-testid="selection">
            {keys === "all" ? "all" : Array.from(keys).sort().join(",")}
          </output>
        )}
      >
        {(item) => <ListViewItem id={item.id}>{item.name}</ListViewItem>}
      </ListView>
    ));

    expect(screen.getByTestId("selection")).toHaveTextContent("project-brief");

    await user.click(screen.getByRole("row", { name: /Quarterly report/ }));

    expect(screen.getByTestId("selection")).toHaveTextContent("project-brief,quarterly-report");
  });

  it('forwards keyboardNavigationBehavior="tab" so child controls do not select or act', () => {
    const onAction = vi.fn();
    const onSelectionChange = vi.fn();

    render(() => (
      <ListView
        aria-label="Editable documents"
        items={documents}
        getKey={(item) => item.id}
        getTextValue={(item) => item.name}
        selectionMode="multiple"
        keyboardNavigationBehavior="tab"
        onAction={onAction}
        onSelectionChange={onSelectionChange}
      >
        {(item) => (
          <ListViewItem id={item.id} textValue={item.name}>
            <Text slot="label">{item.name}</Text>
            <span slot="actions">
              <input aria-label={`Edit ${item.name}`} />
            </span>
          </ListViewItem>
        )}
      </ListView>
    ));

    const row = screen.getByRole("row", { name: /Project brief/ });
    const input = screen.getByLabelText("Edit Project brief");
    input.focus();

    fireEvent.keyDown(input, { key: " " });
    fireEvent.keyUp(input, { key: " " });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.keyUp(input, { key: "Enter" });

    expect(row).toHaveAttribute("aria-selected", "false");
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(onAction).not.toHaveBeenCalled();
  });

  it("renders link-out and child-item trailing metadata", () => {
    render(() => (
      <ListView aria-label="Documents" selectionMode="none">
        <ListViewItem
          id="project-brief"
          textValue="Project brief"
          href="https://example.com/project"
          target="_blank"
        >
          Project brief
        </ListViewItem>
        <ListViewItem id="quarterly-report" textValue="Quarterly report" hasChildItems>
          Quarterly report
        </ListViewItem>
      </ListView>
    ));

    const projectBrief = screen.getByRole("row", { name: "Project brief" });
    const quarterlyReport = screen.getByRole("row", { name: "Quarterly report" });
    expect(projectBrief).toHaveAttribute("data-href", "https://example.com/project");
    expect(projectBrief).toHaveAttribute("data-target", "_blank");
    expect(projectBrief).toHaveAttribute("data-has-trailing-icon", "true");
    expect(quarterlyReport).toHaveAttribute("data-has-child-items", "true");
    expect(quarterlyReport).toHaveAttribute("data-has-trailing-icon", "true");
  });
});
