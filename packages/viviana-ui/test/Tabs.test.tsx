import { render, screen, waitFor } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { describe, expect, it } from "vite-plus/test";
import { Tab, TabList, TabPanel, Tabs } from "../src/tabs";

describe("Tabs", () => {
  it("tabs directly into a tabbable panel child in both directions", async () => {
    const user = setupUser();

    render(() => (
      <>
        <button type="button">Before tabs</button>
        <Tabs aria-label="Writing sections" defaultSelectedKey="draft">
          <TabList>
            <Tab id="draft">Draft</Tab>
          </TabList>
          <TabPanel id="draft">
            <textarea aria-label="Synopsis" />
          </TabPanel>
        </Tabs>
        <button type="button">After tabs</button>
      </>
    ));

    const before = screen.getByRole("button", { name: "Before tabs" });
    const tab = screen.getByRole("tab", { name: "Draft" });
    const panel = screen.getByRole("tabpanel");
    const textarea = screen.getByRole("textbox", { name: "Synopsis" });
    const after = screen.getByRole("button", { name: "After tabs" });

    await waitFor(() => expect(panel).not.toHaveAttribute("tabindex"));

    before.focus();
    await user.tab();
    expect(document.activeElement).toBe(tab);
    await user.tab();
    expect(document.activeElement).toBe(textarea);
    await user.tab();
    expect(document.activeElement).toBe(after);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(textarea);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(tab);
  });

  it("keeps a panel with no tabbable descendants in sequential focus order", () => {
    render(() => (
      <Tabs aria-label="Reference sections" defaultSelectedKey="notes">
        <TabList>
          <Tab id="notes">Notes</Tab>
        </TabList>
        <TabPanel id="notes">Plain notes</TabPanel>
      </Tabs>
    ));

    expect(screen.getByRole("tabpanel")).toHaveAttribute("tabindex", "0");
  });

  it("tabs into a force-mounted panel control after changing selection", async () => {
    const user = setupUser();

    render(() => (
      <>
        <Tabs aria-label="Writing sections" defaultSelectedKey="draft">
          <TabList>
            <Tab id="draft">Draft</Tab>
            <Tab id="review">Review</Tab>
          </TabList>
          <TabPanel id="draft" shouldForceMount>
            Draft content
          </TabPanel>
          <TabPanel id="review" shouldForceMount>
            <button type="button" data-testid="review-control">
              Continue
            </button>
          </TabPanel>
        </Tabs>
        <button type="button">After tabs</button>
      </>
    ));

    const reviewTab = screen.getByRole("tab", { name: "Review" });
    const reviewControl = screen.getByTestId("review-control");
    const reviewPanel = reviewControl.parentElement;
    const after = screen.getByRole("button", { name: "After tabs" });
    expect(reviewPanel).toHaveAttribute("data-inert", "true");

    await user.click(reviewTab);
    await waitFor(() => {
      expect(reviewPanel).not.toHaveAttribute("data-inert");
      expect(reviewPanel).not.toHaveAttribute("tabindex");
    });

    reviewTab.focus();
    await user.tab();
    expect(document.activeElement).toBe(reviewControl);
    await user.tab();
    expect(document.activeElement).toBe(after);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(reviewControl);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(reviewTab);
  });
});
