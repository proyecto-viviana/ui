/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { Tabs, TabList, Tab, TabPanel, TabPanels, Text, TabsContext } from "../src/tabs";

const tabItems = [
  { id: "tab1", label: "First", content: "Content 1" },
  { id: "tab2", label: "Second", content: "Content 2" },
  { id: "tab3", label: "Third", content: "Content 3" },
];

function TestTabs(props: {
  density?: "compact" | "regular";
  labelBehavior?: "show" | "hide";
  orientation?: "horizontal" | "vertical";
  disabledKeys?: string[];
  keyboardActivation?: "automatic" | "manual";
}) {
  return (
    <Tabs
      aria-label="Project sections"
      defaultSelectedKey="tab1"
      density={props.density}
      labelBehavior={props.labelBehavior}
      orientation={props.orientation}
      disabledKeys={props.disabledKeys}
      keyboardActivation={props.keyboardActivation}
    >
      <TabList>
        <Tab id="tab1">First</Tab>
        <Tab id="tab2">Second</Tab>
        <Tab id="tab3">Third</Tab>
      </TabList>
      <TabPanel id="tab1">Content 1</TabPanel>
      <TabPanel id="tab2">Content 2</TabPanel>
      <TabPanel id="tab3">Content 3</TabPanel>
    </Tabs>
  );
}

describe("Tabs (solid-spectrum S2)", () => {
  it("requires an accessible label on Tabs", () => {
    expect(() =>
      render(() => (
        <Tabs>
          <TabList>
            <Tab id="tab1">First</Tab>
          </TabList>
          <TabPanel id="tab1">Content 1</TabPanel>
        </Tabs>
      )),
    ).toThrow("Tabs requires either an aria-label or aria-labelledby prop.");
  });

  it("renders the S2 static composition with roles and forwarded tablist label", async () => {
    render(() => <TestTabs />);

    const tablist = await screen.findByRole("tablist", { name: "Project sections" });
    expect(tablist).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 1");
  });

  it("supports collection items on TabList without Tabs items", async () => {
    render(() => (
      <Tabs aria-label="Dynamic sections" defaultSelectedKey="tab3">
        <TabList items={tabItems}>{(item) => <Tab id={item.id}>{item.label}</Tab>}</TabList>
        {tabItems.map((item) => (
          <TabPanel id={item.id}>{item.content}</TabPanel>
        ))}
      </Tabs>
    ));

    await waitFor(() => {
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 3");
    });
    expect(screen.getByRole("tablist", { name: "Dynamic sections" })).toBeInTheDocument();
  });

  it("supports controlled selection and selection change", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();
    const [selectedKey, setSelectedKey] = createSignal("tab1");
    render(() => (
      <Tabs
        aria-label="Controlled sections"
        selectedKey={selectedKey()}
        onSelectionChange={(key) => {
          onSelectionChange(key);
          setSelectedKey(String(key));
        }}
      >
        <TabList>
          <Tab id="tab1">First</Tab>
          <Tab id="tab2">Second</Tab>
        </TabList>
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
      </Tabs>
    ));

    await user.click(screen.getByRole("tab", { name: "Second" }));
    expect(onSelectionChange).toHaveBeenCalledWith("tab2");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 2");
  });

  it("maps density and labelBehavior onto stable DOM state", () => {
    const { container } = render(() => <TestTabs density="compact" labelBehavior="hide" />);
    const root = container.querySelector(".solidaria-Tabs") as HTMLElement;
    const firstTab = screen.getByRole("tab", { name: "First" });
    const firstText = firstTab.querySelector("[data-rsp-slot='text']") as HTMLElement;

    expect(root).toHaveAttribute("data-density", "compact");
    expect(root).toHaveAttribute("data-label-behavior", "hide");
    expect(firstText).toHaveAttribute("id");
    expect(firstText.className).toContain("-macro-");
    expect(firstTab).toHaveAttribute("aria-labelledby", firstText.id);
  });

  it("uses vertical orientation for root layout and tablist semantics", () => {
    const { container } = render(() => <TestTabs orientation="vertical" />);
    const root = container.querySelector(".solidaria-Tabs") as HTMLElement;
    const tablist = screen.getByRole("tablist");

    expect(root).toHaveAttribute("data-orientation", "vertical");
    expect(tablist).toHaveAttribute("aria-orientation", "vertical");
  });

  it("supports disabledKeys and prevents disabled selection", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();
    render(() => (
      <Tabs
        aria-label="Disabled sections"
        defaultSelectedKey="tab1"
        disabledKeys={["tab2"]}
        onSelectionChange={onSelectionChange}
      >
        <TabList>
          <Tab id="tab1">First</Tab>
          <Tab id="tab2">Second</Tab>
        </TabList>
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
      </Tabs>
    ));

    const disabled = screen.getByRole("tab", { name: "Second" });
    expect(disabled).toHaveAttribute("aria-disabled", "true");
    await user.click(disabled);
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 1");
  });

  it("keeps manual keyboard activation focused until Enter", async () => {
    const user = setupUser();
    render(() => <TestTabs keyboardActivation="manual" />);

    const tabs = screen.getAllByRole("tab");
    tabs[0].focus();
    await user.keyboard("{ArrowRight}");

    expect(document.activeElement).toBe(tabs[1]);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{Enter}");
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
  });

  it("provides Text slot styling for composed tab labels", () => {
    render(() => (
      <Tabs aria-label="Text sections" defaultSelectedKey="tab1" labelBehavior="hide">
        <TabList>
          <Tab id="tab1">
            <Text>First</Text>
          </Tab>
          <Tab id="tab2">
            <Text>Second</Text>
          </Tab>
        </TabList>
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
      </Tabs>
    ));

    const tab = screen.getByRole("tab", { name: "First" });
    const label = tab.querySelector("[data-rsp-slot='text']") as HTMLElement;

    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("id");
    expect(label.className).toContain("-macro-");
    expect(tab).toHaveAttribute("aria-labelledby", label.id);
  });

  it("supports TabPanels wrapper and force-mounted panels", () => {
    render(() => (
      <Tabs aria-label="Wrapped sections" defaultSelectedKey="tab1">
        <TabList>
          <Tab id="tab1">First</Tab>
          <Tab id="tab2">Second</Tab>
        </TabList>
        <TabPanels>
          <TabPanel id="tab1" shouldForceMount>
            Content 1
          </TabPanel>
          <TabPanel id="tab2" shouldForceMount>
            Content 2
          </TabPanel>
        </TabPanels>
      </Tabs>
    ));

    const panels = Array.from(document.querySelectorAll(".solidaria-TabPanel"));

    expect(panels).toHaveLength(2);
    expect(screen.getAllByRole("tabpanel", { hidden: true })).toHaveLength(1);
    expect(panels[0]).toHaveAttribute("role", "tabpanel");
    expect(panels[1]).not.toHaveAttribute("role");
    expect(panels[1]).toHaveAttribute("data-inert", "true");
    expect(document.querySelector(".solidaria-TabPanels")).toBeInTheDocument();
  });

  it("merges slot context props from TabsContext", () => {
    render(() => (
      <TabsContext.Provider
        value={{
          slots: {
            default: {
              "aria-label": "Context sections",
              density: "compact",
              UNSAFE_className: "context-tabs",
            },
          },
        }}
      >
        <Tabs>
          <TabList>
            <Tab id="tab1">First</Tab>
          </TabList>
          <TabPanel id="tab1">Content 1</TabPanel>
        </Tabs>
      </TabsContext.Provider>
    ));

    expect(screen.getByRole("tablist", { name: "Context sections" })).toBeInTheDocument();
    expect(document.querySelector(".context-tabs")).toHaveAttribute("data-density", "compact");
  });
});
