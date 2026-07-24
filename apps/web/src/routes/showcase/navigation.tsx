/* Panel 07 — Navigation. Ways through: tabs, breadcrumbs, links, disclosure,
   steps. Nav rows are mono on the mono face (the handoff draws them that way);
   the component layer already owns that via `fontFamily: "code"` on Tabs and
   disclosure headers, so this route just composes, never restyles. */
import { createFileRoute } from "@tanstack/solid-router";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeader,
  AccordionItemPanel,
  AccordionItemTitle,
  Breadcrumb,
  BreadcrumbItem,
  Breadcrumbs,
  Disclosure,
  DisclosureGroup,
  DisclosureHeader,
  DisclosurePanel,
  DisclosureTitle,
  DisclosureTrigger,
  Link,
  NotificationBadge,
  PixelHomeIcon,
  PixelMapIcon,
  PixelPlayIcon,
  PixelUserIcon,
  PixelZapIcon,
  Step,
  StepList,
  StepListItem,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Well,
} from "@proyecto-viviana/ui";
import { Demo, Panel, Row } from "@/components/showcase/chrome";
import { panelBySlug } from "@/components/showcase/registry";

export const Route = createFileRoute("/showcase/navigation")({
  component: Page,
});

const CRUMBS = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "glasselated", label: "Glasselated" },
];

const TRAIL = [
  { id: "root", label: "Root" },
  { id: "docs", label: "Docs" },
];

const STEPS = [
  { key: "details", label: "Details" },
  { key: "review", label: "Review" },
  { key: "confirm", label: "Confirm" },
];

function Page() {
  const def = panelBySlug("navigation")!;

  return (
    <Panel def={def}>
      <Demo label="Tabs · vertical — the register rail: Well-mounted rows, caret ghosts in on hover and pins on the active row, count pill parks flush right">
        <Tabs aria-label="Rail sections" orientation="vertical" defaultSelectedKey="home">
          <Well style={{ width: "250px", flex: "0 0 auto", "margin-inline-end": "20px" }}>
            {/* Inside a Well the rail needs no strip-to-panel margin of its own —
                the well edge is the separation. */}
            <TabList UNSAFE_style={{ "margin-inline-end": "0" }}>
              <Tab id="home">Home</Tab>
              <Tab id="explore">Explore</Tab>
              <Tab id="review">
                <Text>Review</Text>
                <NotificationBadge value={4} />
              </Tab>
              <Tab id="live">Live</Tab>
            </TabList>
          </Well>
          <TabPanels>
            <TabPanel id="home">Continue where you left off.</TabPanel>
            <TabPanel id="explore">Wander the catalog.</TabPanel>
            <TabPanel id="review">Four items are waiting on you.</TabPanel>
            <TabPanel id="live">Sessions running right now.</TabPanel>
          </TabPanels>
        </Tabs>
      </Demo>

      <Demo label="Tabs · pill — the glass tab bar: stacked pixel icon over micro label, spread space-around, never collapses">
        <Tabs
          aria-label="App tab bar"
          variant="pill"
          defaultSelectedKey="home"
          UNSAFE_style={{ "max-width": "340px" }}
        >
          <TabList>
            <Tab id="home">
              <PixelHomeIcon />
              <Text>Home</Text>
            </Tab>
            <Tab id="map">
              <PixelMapIcon />
              <Text>Map</Text>
            </Tab>
            <Tab id="play">
              <PixelPlayIcon />
              <Text>Play</Text>
            </Tab>
            <Tab id="boost">
              <PixelZapIcon />
              <Text>Boost</Text>
            </Tab>
            <Tab id="you">
              <PixelUserIcon />
              <Text>You</Text>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel id="home">Home feed.</TabPanel>
            <TabPanel id="map">World map.</TabPanel>
            <TabPanel id="play">Playground.</TabPanel>
            <TabPanel id="boost">Boosts and streaks.</TabPanel>
            <TabPanel id="you">Your profile.</TabPanel>
          </TabPanels>
        </Tabs>
      </Demo>

      <Demo label="Tabs · 3 tabs — accent underline on select, mono labels">
        <Tabs aria-label="Project sections" defaultSelectedKey="overview">
          <TabList>
            <Tab id="overview">Overview</Tab>
            <Tab id="activity">Activity</Tab>
            <Tab id="settings">Settings</Tab>
          </TabList>
          <TabPanels>
            <TabPanel id="overview">Project summary and status.</TabPanel>
            <TabPanel id="activity">Recent commits and events.</TabPanel>
            <TabPanel id="settings">Panel visibility and access.</TabPanel>
          </TabPanels>
        </Tabs>
      </Demo>

      <Demo label="Breadcrumbs · items collection — children is a per-item render function (Breadcrumb ≡ BreadcrumbItem)">
        <Row>
          <Breadcrumbs aria-label="Path" items={CRUMBS} getKey={(item) => item.id}>
            {(item) => <Breadcrumb>{item.label}</Breadcrumb>}
          </Breadcrumbs>
        </Row>
        <Row>
          <Breadcrumbs
            aria-label="Path — BreadcrumbItem alias"
            items={TRAIL}
            getKey={(item) => item.id}
          >
            {(item) => <BreadcrumbItem>{item.label}</BreadcrumbItem>}
          </Breadcrumbs>
        </Row>
      </Demo>

      <Demo label="Link · standalone, quiet">
        <Row>
          <Link href="#">Primary link</Link>
          <Link href="#" variant="secondary">
            Secondary link
          </Link>
          <Link href="#" isStandalone>
            Standalone
          </Link>
          <Link href="#" isStandalone isQuiet>
            Quiet standalone
          </Link>
        </Row>
      </Demo>

      <Demo label="Accordion · 3 items — header/title/panel pieces">
        <Accordion defaultExpandedKeys={["overview"]}>
          <AccordionItem id="overview">
            <AccordionItemHeader>
              <AccordionItemTitle>Overview</AccordionItemTitle>
            </AccordionItemHeader>
            <AccordionItemPanel>Register goals and scope.</AccordionItemPanel>
          </AccordionItem>
          <AccordionItem id="tokens">
            <AccordionItemHeader>
              <AccordionItemTitle>Tokens</AccordionItemTitle>
            </AccordionItemHeader>
            <AccordionItemPanel>Color, type, and radius atoms.</AccordionItemPanel>
          </AccordionItem>
          <AccordionItem id="components">
            <AccordionItemHeader>
              <AccordionItemTitle>Components</AccordionItemTitle>
            </AccordionItemHeader>
            <AccordionItemPanel>The panels this showcase walks.</AccordionItemPanel>
          </AccordionItem>
        </Accordion>
      </Demo>

      <Demo label="Disclosure · single">
        <Disclosure>
          <DisclosureTrigger>Show details</DisclosureTrigger>
          <DisclosurePanel>Hidden content revealed on expand.</DisclosurePanel>
        </Disclosure>
      </Demo>

      <Demo label="DisclosureGroup · explicit header/title">
        <DisclosureGroup>
          <Disclosure id="s1">
            <DisclosureHeader>
              <DisclosureTitle>Section one</DisclosureTitle>
            </DisclosureHeader>
            <DisclosurePanel>First section content.</DisclosurePanel>
          </Disclosure>
          <Disclosure id="s2">
            <DisclosureHeader>
              <DisclosureTitle>Section two</DisclosureTitle>
            </DisclosureHeader>
            <DisclosurePanel>Second section content.</DisclosurePanel>
          </Disclosure>
        </DisclosureGroup>
      </Demo>

      <Demo label="StepList · selected step — first step keeps the completed fill off">
        <StepList aria-label="Checkout progress" items={STEPS} defaultSelectedKey="details" />
      </Demo>

      <Demo label="StepList · Step / StepListItem primitives — bespoke step rendering escape hatch">
        <Row>
          <StepList aria-label="Bare steps (Step)" items={STEPS} defaultSelectedKey="details">
            {(item, state) => (
              <Step item={item} stepNumber={state.stepNumber}>
                {state.stepNumber}. {item.label}
              </Step>
            )}
          </StepList>
          <StepList
            aria-label="Bare steps (StepListItem alias)"
            items={STEPS}
            defaultSelectedKey="details"
          >
            {(item, state) => (
              <StepListItem item={item} stepNumber={state.stepNumber}>
                {state.stepNumber}. {item.label}
              </StepListItem>
            )}
          </StepList>
        </Row>
      </Demo>
    </Panel>
  );
}
