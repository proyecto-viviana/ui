/**
 * Shared fixtures for Form SSR/hydration regression.
 *
 * Mirrors the effect-latam profile/foros pattern: Spectrum Form wrapping
 * TextField / Button (and a plain submit button). A hydration mismatch here
 * blanks the whole route — Solid aborts the tree on the first desync.
 */
import type { JSX } from "solid-js";
import { Provider } from "../../src/provider";
import { Form } from "../../src/form";
import { TextArea, TextField } from "../../src/textfield";
import { Button } from "../../src/button";
import { Picker, PickerItem } from "../../src/picker";

export function FormButtonFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <Form
        aria-label="Smoke form"
        onSubmit={(e) => e.preventDefault()}
        UNSAFE_className="el-form"
      >
        <Button type="submit" variant="primary">
          Go
        </Button>
      </Form>
    </Provider>
  );
}

export function FormTextFieldFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <Form
        aria-label="Profile form"
        onSubmit={(e) => e.preventDefault()}
        UNSAFE_className="el-form"
      >
        <TextField label="Nombre" maxLength={80} />
        <TextField
          label="Username"
          isRequired
          description="3–20 caracteres"
        />
        <Button type="submit" variant="primary">
          Guardar
        </Button>
      </Form>
    </Provider>
  );
}

export function FormTextAreaFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <Form aria-label="Thread form" onSubmit={(e) => e.preventDefault()}>
        <TextField label="Título" isRequired maxLength={200} />
        <TextArea label="Contenido" isRequired />
        <Button type="submit" variant="primary">
          Publicar
        </Button>
      </Form>
    </Provider>
  );
}

const COUNTRY_ITEMS = [
  { id: "AR", name: "Argentina" },
  { id: "MX", name: "México" },
  { id: "UY", name: "Uruguay" },
] as const;

export function FormPickerFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <Form aria-label="Country form" onSubmit={(e) => e.preventDefault()}>
        <Picker
          label="País"
          items={[...COUNTRY_ITEMS]}
          selectedKey="UY"
          getKey={(c) => c.id}
          getTextValue={(c) => c.name}
        >
          {(c) => (
            <PickerItem id={c.id} textValue={c.name}>
              {c.name}
            </PickerItem>
          )}
        </Picker>
        <Button type="submit" variant="primary">
          Guardar
        </Button>
      </Form>
    </Provider>
  );
}

export function FormNativeButtonFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <Form aria-label="Native button form" onSubmit={(e) => e.preventDefault()}>
        <button type="submit">Go native</button>
      </Form>
    </Provider>
  );
}

export function FormTwoButtonsFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <Form aria-label="Two button form" onSubmit={(e) => e.preventDefault()}>
        <Button type="button" variant="secondary">
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Go
        </Button>
      </Form>
    </Provider>
  );
}

export function FormButtonInFragmentFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <Form aria-label="Fragment form" onSubmit={(e) => e.preventDefault()}>
        <>
          <Button type="submit" variant="primary">
            Go
          </Button>
        </>
      </Form>
    </Provider>
  );
}
