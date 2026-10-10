import type { JSX } from "@solidjs/web";
import { Provider } from "../../src/provider";
import { ActionButton, ToggleButton, LinkButton } from "../../src/button";
import { Badge } from "../../src/badge";
import { Radio, RadioGroup } from "../../src/radio";
import { SegmentedControl, SegmentedControlItem } from "../../src/segmentedcontrol";
import { Tag, TagGroup } from "../../src/tag-group";
import { SelectBox, SelectBoxGroup } from "../../src/selectboxgroup";
import { Text } from "../../src/text";

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

export function SelectBoxFixture(props: { count: () => number }): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <SelectBoxGroup aria-label="Plans">
        <SelectBox id="opt1">
          <Text slot="label">count: {props.count()}</Text>
        </SelectBox>
      </SelectBoxGroup>
    </Provider>
  );
}

// Private paired fixture: live ARIA props without replacing the collection owner.
export function TagGroupLabelFixture(props: {
  label: () => string | undefined;
  labelledBy: () => string;
  onEvent: () => void;
}): JSX.Element {
  const items = [
    { id: "label-one", name: "First tag" },
    { id: "label-two", name: "Second tag" },
  ];
  return (
    <Provider background="base" colorScheme="dark">
      <span id="taggroup-label-a">External A</span>
      <span id="taggroup-label-b">External B</span>
      <span id="taggroup-label-c">External C</span>
      <TagGroup
        items={items}
        label={props.label()}
        aria-labelledby={props.labelledBy()}
        selectionMode="multiple"
        onSelectionChange={props.onEvent}
        onRemove={props.onEvent}
        onAction={props.onEvent}
      >
        {(item) => <Tag id={item.id}>{item.name}</Tag>}
      </TagGroup>
    </Provider>
  );
}
