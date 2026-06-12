import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { Tabs, TabList, Tab, TabPanel } from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

type TabItem = {
  id: string;
  label: string;
};

const settingsTabs: TabItem[] = [
  { id: "account", label: "Account" },
  { id: "password", label: "Password" },
  { id: "notifications", label: "Notifications" },
];

const controlledTabs: TabItem[] = [
  { id: "tab1", label: "Tab 1" },
  { id: "tab2", label: "Tab 2" },
  { id: "tab3", label: "Tab 3" },
];

const featureTabs: TabItem[] = [
  { id: "free", label: "Free Features" },
  { id: "pro", label: "Pro Features" },
  { id: "enterprise", label: "Enterprise (Contact Sales)" },
];

const verticalTabs: TabItem[] = [
  { id: "general", label: "General" },
  { id: "security", label: "Security" },
  { id: "privacy", label: "Privacy" },
  { id: "advanced", label: "Advanced" },
];

export const Route = createFileRoute("/solid-spectrum/docs/components/tabs")({
  component: TabsPage,
});

function TabsPage() {
  const [selectedKey, setSelectedKey] = createSignal("account");

  return (
    <DocPage
      title="Tabs"
      description="Tabs organize content into separate views where only one view is visible at a time. Users can switch between views by selecting the corresponding tab."
      importCode={`import { Tabs, TabList, Tab, TabPanel } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic Usage"
        description="A simple tab interface with multiple panels."
        code={`<Tabs items={tabs} aria-label="Settings">
  <TabList>
    {(item) => <Tab id={item.id}>{item.label}</Tab>}
  </TabList>
  <TabPanel id="account">...</TabPanel>
  <TabPanel id="password">...</TabPanel>
  <TabPanel id="notifications">...</TabPanel>
</Tabs>`}
      >
        <Tabs
          items={settingsTabs}
          getKey={(item) => item.id}
          getTextValue={(item) => item.label}
          aria-label="Settings"
        >
          <TabList<TabItem>>{(item) => <Tab id={item.id}>{item.label}</Tab>}</TabList>
          <TabPanel id="account">
            <div class="p-4 text-bg-600">
              Manage your account settings, profile information, and preferences.
            </div>
          </TabPanel>
          <TabPanel id="password">
            <div class="p-4 text-bg-600">
              Change your password and configure two-factor authentication.
            </div>
          </TabPanel>
          <TabPanel id="notifications">
            <div class="p-4 text-bg-600">
              Choose which notifications you want to receive and how.
            </div>
          </TabPanel>
        </Tabs>
      </Example>

      <Example
        title="Controlled Tabs"
        description="Control which tab is selected programmatically."
        code={`<Tabs items={tabs} selectedKey={selectedKey()} onSelectionChange={setSelectedKey} aria-label="Controlled tabs">...</Tabs>`}
      >
        <div>
          <div class="mb-4 flex gap-2">
            <button
              class="text-sm px-2 py-1 rounded bg-primary-100 text-primary-600"
              onClick={() => setSelectedKey("tab1")}
            >
              Select Tab 1
            </button>
            <button
              class="text-sm px-2 py-1 rounded bg-primary-100 text-primary-600"
              onClick={() => setSelectedKey("tab2")}
            >
              Select Tab 2
            </button>
          </div>
          <Tabs
            items={controlledTabs}
            getKey={(item) => item.id}
            getTextValue={(item) => item.label}
            selectedKey={selectedKey()}
            onSelectionChange={(key) => setSelectedKey(String(key))}
            aria-label="Controlled tabs"
          >
            <TabList<TabItem>>{(item) => <Tab id={item.id}>{item.label}</Tab>}</TabList>
            <TabPanel id="tab1">
              <div class="p-4 text-bg-600">Content for Tab 1</div>
            </TabPanel>
            <TabPanel id="tab2">
              <div class="p-4 text-bg-600">Content for Tab 2</div>
            </TabPanel>
            <TabPanel id="tab3">
              <div class="p-4 text-bg-600">Content for Tab 3</div>
            </TabPanel>
          </Tabs>
        </div>
      </Example>

      <Example
        title="Disabled Tabs"
        description="Individual tabs can be disabled."
        code={`<Tabs items={tabs} disabledKeys={["enterprise"]} aria-label="Feature tiers">...</Tabs>`}
      >
        <Tabs
          items={featureTabs}
          getKey={(item) => item.id}
          getTextValue={(item) => item.label}
          disabledKeys={["enterprise"]}
          aria-label="Feature tiers"
        >
          <TabList<TabItem>>{(item) => <Tab id={item.id}>{item.label}</Tab>}</TabList>
          <TabPanel id="free">
            <div class="p-4 text-bg-600">Free tier features available to all users.</div>
          </TabPanel>
          <TabPanel id="pro">
            <div class="p-4 text-bg-600">Premium features for Pro subscribers.</div>
          </TabPanel>
          <TabPanel id="enterprise">
            <div class="p-4 text-bg-600">Enterprise features.</div>
          </TabPanel>
        </Tabs>
      </Example>

      <Example
        title="Vertical Orientation"
        description="Tabs can be displayed vertically."
        code={`<Tabs items={tabs} orientation="vertical" aria-label="Vertical navigation">...</Tabs>`}
      >
        <Tabs
          items={verticalTabs}
          getKey={(item) => item.id}
          getTextValue={(item) => item.label}
          orientation="vertical"
          aria-label="Vertical navigation"
        >
          <TabList<TabItem>>{(item) => <Tab id={item.id}>{item.label}</Tab>}</TabList>
          <TabPanel id="general">
            <div class="p-4 text-bg-600">General settings and preferences.</div>
          </TabPanel>
          <TabPanel id="security">
            <div class="p-4 text-bg-600">Security and authentication settings.</div>
          </TabPanel>
          <TabPanel id="privacy">
            <div class="p-4 text-bg-600">Privacy and data sharing options.</div>
          </TabPanel>
          <TabPanel id="advanced">
            <div class="p-4 text-bg-600">Advanced configuration options.</div>
          </TabPanel>
        </Tabs>
      </Example>

      <h2>Tabs Props</h2>
      <PropsTable
        props={[
          {
            name: "items",
            type: "T[]",
            description: "Collection of tab items",
          },
          {
            name: "selectedKey",
            type: "string",
            description: "Currently selected tab key (controlled)",
          },
          {
            name: "defaultSelectedKey",
            type: "string",
            description: "Default selected tab (uncontrolled)",
          },
          {
            name: "onSelectionChange",
            type: "(key: string) => void",
            description: "Handler called when selection changes",
          },
          {
            name: "orientation",
            type: "'horizontal' | 'vertical'",
            default: "'horizontal'",
            description: "Tab layout orientation",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether all tabs are disabled",
          },
          {
            name: "disabledKeys",
            type: "Iterable<string>",
            description: "Keys of disabled tabs",
          },
        ]}
      />

      <h2>Tab Props</h2>
      <PropsTable
        props={[
          {
            name: "id",
            type: "string",
            description: "Unique identifier for the tab",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether the tab is disabled",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "Tab label content",
          },
        ]}
      />

      <h2>TabPanel Props</h2>
      <PropsTable
        props={[
          {
            name: "id",
            type: "string",
            description: "Must match the corresponding Tab id",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "Panel content",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Uses <code>tablist</code>, <code>tab</code>, and <code>tabpanel</code> ARIA roles
          </li>
          <li>Arrow keys navigate between tabs</li>
          <li>Home/End keys jump to first/last tab</li>
          <li>
            Tab panels are linked via <code>aria-controls</code> and <code>aria-labelledby</code>
          </li>
          <li>Focus indicator clearly shows which tab is focused</li>
          <li>Automatic activation on focus (follows ARIA best practices)</li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
