import { render } from "@solidjs/web";
import { Button, Heading, Provider, Text } from "../../../src";
// The only stylesheet the page loads, and no font rule of its own: what a
// consumer gets from the package's full CSS entry.
import "../../../src/components.css";

render(
  () => (
    <>
      <Heading level={2} data-proof="heading">
        Register heading
      </Heading>
      <Text data-proof="text">Register text</Text>
      <Button data-proof="button">Register button</Button>
      <div style={{ "--s2-font-family-sans": '"Consumer Sans"' }}>
        <Text data-proof="override">Consumer text</Text>
        {/* A nested scheme repeats the token layer's scheme block; the consumer's
            narrower face must survive it. */}
        <Provider colorScheme="dark">
          <Text data-proof="override-in-scheme">Consumer text in a nested scheme</Text>
        </Provider>
      </div>
    </>
  ),
  document.getElementById("root")!,
);
