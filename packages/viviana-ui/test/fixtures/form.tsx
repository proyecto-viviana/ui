/**
 * Shared fixtures for the viviana-ui Form SSR/hydration twin of the
 * solid-spectrum Form+TextField profile shape.
 *
 * The `isRequired + description` Username field is the case that desynced
 * hydration keys in solid-spectrum (#184). viviana-ui copies the same
 * necessity nest and must stay green on the same input.
 */
import type { JSX } from "solid-js";
import { Provider } from "../../src/provider";
import { Form } from "../../src/form";
import { TextField } from "../../src/textfield";
import { Button } from "../../src/button";

export function FormTextFieldFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <Form
        aria-label="Profile form"
        onSubmit={(e) => e.preventDefault()}
        UNSAFE_className="el-form"
      >
        <TextField label="Nombre" maxLength={80} />
        <TextField label="Username" isRequired description="3–20 caracteres" />
        <Button type="submit" variant="primary">
          Guardar
        </Button>
      </Form>
    </Provider>
  );
}
