/**
 * @vitest-environment jsdom
 *
 * The Form/Skeleton contract for the four buttons, mirrored from
 * solid-spectrum's `Form.test.tsx` onto this register's own twins. The
 * register themes the buttons; it does not get to change which layer wins,
 * so these are the same upstream orders solid-spectrum proves.
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { cleanup, render, screen } from "@solidjs/testing-library";
import {
  ActionButton,
  ActionButtonGroup,
  Button,
  Form,
  LinkButton,
  Menu,
  MenuItem,
  MenuTrigger,
  NotificationBadge,
  Skeleton,
  ToggleButton,
} from "../src";

describe("Form (viviana-ui) and the button family", () => {
  afterEach(() => {
    cleanup();
  });

  // The Form's size reaches all four buttons, and a local size still wins.
  // Upstream applies useFormProps before the size default in each of them.
  it.each([
    ["Button", Button],
    ["ActionButton", ActionButton],
    ["ToggleButton", ToggleButton],
    ["LinkButton", LinkButton],
  ] as const)("gives %s the Form's size", (_name, Component) => {
    const C = Component as (props: Record<string, unknown>) => ReturnType<typeof Button>;
    render(() => (
      <>
        <Form size="XL">
          <C>inherited</C>
          <C size="S">local</C>
        </Form>
        <C size="XL">xl</C>
        <C size="S">s</C>
        <C>m</C>
      </>
    ));
    const cls = (text: string) =>
      screen.getByText(text).closest('button, a, [role="link"]')!.className;

    expect(cls("xl")).not.toBe(cls("m"));
    expect(cls("inherited")).toBe(cls("xl"));
    expect(cls("local")).toBe(cls("s"));
  });

  // Upstream ends every button's isDisabled on the Form/Skeleton proxy:
  // `props = useFormProps(props)` and then `isDisabled={props.isDisabled ?? ctx.isDisabled}`
  // (`@react-spectrum/s2@1.7.0/src/ActionButton.tsx:334,358`; Button and
  // LinkButton just spread the proxied props).
  it.each([
    ["Button", Button],
    ["ActionButton", ActionButton],
    ["ToggleButton", ToggleButton],
    ["LinkButton", LinkButton],
  ] as const)("disables %s through the Form and the Skeleton", (_name, Component) => {
    const C = Component as (props: Record<string, unknown>) => ReturnType<typeof Button>;
    render(() => (
      <>
        <Form isDisabled>
          <C>inherited</C>
          <C isDisabled={false}>opted out</C>
        </Form>
        <Skeleton isLoading>
          <C isDisabled={false}>skeleton</C>
        </Skeleton>
      </>
    ));
    // A disabled button carries `disabled`; a disabled Link carries `data-disabled`.
    const isDisabled = (text: string) => {
      const control = screen.getByText(text).closest('button, a, [role="link"]')!;
      return control.hasAttribute("disabled") || control.hasAttribute("data-disabled");
    };

    expect(isDisabled("inherited")).toBe(true);
    expect(isDisabled("opted out")).toBe(false);
    expect(isDisabled("skeleton")).toBe(true);
  });

  // Upstream's ActionButtonGroup is the last resort for isDisabled, below the
  // button's own prop (`props.isDisabled ?? isDisabled`), while its size wins
  // (`size = props.size || 'M'` as the ctx destructuring default).
  it("keeps ActionButtonGroup's isDisabled below the button's own prop", () => {
    render(() => (
      <>
        <ActionButtonGroup isDisabled>
          <ActionButton>grouped</ActionButton>
          <ActionButton isDisabled={false}>opted out of the group</ActionButton>
        </ActionButtonGroup>
        <Form isDisabled>
          <ActionButtonGroup>
            <ActionButton>grouped in a form</ActionButton>
          </ActionButtonGroup>
        </Form>
      </>
    ));

    expect(screen.getByRole("button", { name: "grouped" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "opted out of the group" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "grouped in a form" })).toBeDisabled();
  });

  // ToggleButton is the one button that still hands the element a flag after the
  // proxy spread: `menuTriggerButtonProps()` carried the MenuTrigger's
  // `isDisabled`, which `MenuTrigger` publishes as a concrete boolean
  // (`packages/solidaria-components/src/Menu.tsx:417`), so a present `false`
  // shadowed the Form and the Skeleton.
  it("keeps the MenuTrigger's isDisabled below the Form and the Skeleton", () => {
    render(() => (
      <>
        <Form isDisabled>
          <MenuTrigger>
            <ToggleButton>in a form</ToggleButton>
            <Menu aria-label="Form actions">
              <MenuItem id="a">A</MenuItem>
            </Menu>
          </MenuTrigger>
        </Form>
        <Skeleton isLoading>
          <MenuTrigger>
            <ToggleButton isDisabled={false}>in a skeleton</ToggleButton>
            <Menu aria-label="Skeleton actions">
              <MenuItem id="a">A</MenuItem>
            </Menu>
          </MenuTrigger>
        </Skeleton>
        <MenuTrigger isDisabled>
          <ToggleButton>under a disabled trigger</ToggleButton>
          <Menu aria-label="Disabled actions">
            <MenuItem id="a">A</MenuItem>
          </Menu>
        </MenuTrigger>
        <MenuTrigger>
          <ToggleButton>under a plain trigger</ToggleButton>
          <Menu aria-label="Plain actions">
            <MenuItem id="a">A</MenuItem>
          </Menu>
        </MenuTrigger>
      </>
    ));

    const trigger = (text: string) => screen.getByText(text).closest("button")!;

    expect(trigger("in a form")).toBeDisabled();
    expect(trigger("in a skeleton")).toBeDisabled();
    expect(trigger("under a disabled trigger")).toBeDisabled();
    expect(trigger("under a plain trigger")).not.toBeDisabled();
  });

  // Upstream hands NotificationBadgeContext the RACButton render prop, which is
  // the resolved `props.isDisabled ?? ctx.isDisabled`
  // (`@react-spectrum/s2@1.7.0/src/ActionButton.tsx:358,436,432`), so the group
  // and the Form grey the badge as well as the button.
  it("gives ActionButton's NotificationBadge the resolved isDisabled", () => {
    render(() => (
      <>
        <ActionButton isDisabled>
          <NotificationBadge value={5} data-testid="own-badge" />
        </ActionButton>
        <ActionButton>
          <NotificationBadge value={5} data-testid="enabled-badge" />
        </ActionButton>
        <ActionButtonGroup isDisabled>
          <ActionButton>
            <NotificationBadge value={5} data-testid="grouped-badge" />
          </ActionButton>
        </ActionButtonGroup>
        <Form isDisabled>
          <ActionButton>
            <NotificationBadge value={5} data-testid="form-badge" />
          </ActionButton>
        </Form>
      </>
    ));

    const cls = (testId: string) => screen.getByTestId(testId).className;

    expect(cls("own-badge")).not.toBe(cls("enabled-badge"));
    expect(cls("grouped-badge")).toBe(cls("own-badge"));
    expect(cls("form-badge")).toBe(cls("own-badge"));
  });
});
