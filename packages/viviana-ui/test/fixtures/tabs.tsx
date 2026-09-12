import { For, type JSX } from "solid-js";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "../../src/Tabs";

export const TAB_KEYS = ["lesson", "code", "notes", "tutor"];
export const LESSON_TABS = ["01 LESSON", "02 CODE", "03 NOTES", "04 TUTOR"];
export const TAB_READOUTS: Record<string, string> = {
  lesson: "rendering / 04 · 74% · 12-day streak",
  code: "estimator.glsl · ● modified",
  notes: "checkpoint open · +30 XP",
  tutor: "tutor online · 2 replies",
};

export function TabsFixture(): JSX.Element {
  return (
    <Tabs aria-label="Lesson panes" variant="terminal" defaultSelectedKey="lesson">
      <TabList
        trailing={
          <TabPanels>
            <For each={TAB_KEYS}>{(key) => <TabPanel id={key}>{TAB_READOUTS[key]}</TabPanel>}</For>
          </TabPanels>
        }
      >
        <For each={TAB_KEYS}>{(key, index) => <Tab id={key}>{LESSON_TABS[index()]}</Tab>}</For>
      </TabList>
    </Tabs>
  );
}
