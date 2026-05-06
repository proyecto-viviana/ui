// Proyecto Viviana - Multiple Components
import {
  Button,
  TextField,
  Checkbox,
  Select,
  SelectOption,
} from "@proyecto-viviana/solid-spectrum";

export function App() {
  return (
    <div>
      <Button>Submit</Button>
      <TextField label="Email" />
      <Checkbox>Accept terms</Checkbox>
      <Select label="Choose option">
        <SelectOption id="1">Option 1</SelectOption>
        <SelectOption id="2">Option 2</SelectOption>
      </Select>
    </div>
  );
}
