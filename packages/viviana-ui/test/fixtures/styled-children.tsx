import type { JSX } from "@solidjs/web";
import { Provider } from "../../src/provider";
import { ActionButton, ToggleButton, LinkButton } from "../../src/button";
import { Badge } from "../../src/badge";
import { Radio, RadioGroup } from "../../src/radio";
import { SegmentedControl, SegmentedControlItem } from "../../src/segmentedcontrol";
import { Tag, TagGroup } from "../../src/tag-group";

export function ActionButtonFixture(props: { count: () => number }): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <ActionButton>count: {props.count()}</ActionButton>
    </Provider>
  );
}

export function ToggleButtonFixture(props: { count: () => number }): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <ToggleButton>count: {props.count()}</ToggleButton>
    </Provider>
  );
}

export function LinkButtonFixture(props: { count: () => number }): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <LinkButton href="#test">count: {props.count()}</LinkButton>
    </Provider>
  );
}

export function BadgeFixture(props: { count: () => number }): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <Badge>count: {props.count()}</Badge>
    </Provider>
  );
}

export function RadioFixture(props: { count: () => number }): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <RadioGroup label="Group" value="opt1">
        <Radio value="opt1">count: {props.count()}</Radio>
      </RadioGroup>
    </Provider>
  );
}

export function SegmentedControlFixture(props: { count: () => number }): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <SegmentedControl aria-label="View">
        <SegmentedControlItem id="opt1">count: {props.count()}</SegmentedControlItem>
      </SegmentedControl>
    </Provider>
  );
}

export function TagGroupFixture(props: { count: () => number }): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <TagGroup aria-label="Tags" items={[{ id: "1" }]}>
        {(item) => <Tag id={item.id}>count: {props.count()}</Tag>}
      </TagGroup>
    </Provider>
  );
}
