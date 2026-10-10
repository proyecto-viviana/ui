/** Diagnostic minimization of the linked landing cards; not the production route. */
import { For } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  Card,
  CardPreview,
  Image,
  Grid,
  Content,
  Heading,
  Text,
  typeRoles,
  TextField,
} from "../../src/index";
import { LAND_CARDS } from "../../../../apps/web/src/components/examples/data";

export { LAND_CARDS };

export function LandingLinkedCardsFixture(): JSX.Element {
  return (
    <>
      {/* Exact preceding route input props; surrounding route structure is not simulated. */}
      <TextField aria-label="Email address" type="email" size="S" placeholder="you@school.edu" />
      <Grid class="ex-land-journeys" columns="repeat(3, minmax(0, 1fr))" gap="12px">
        <For each={LAND_CARDS}>
          {(card) => (
            <Card
              id={`landing-${card.slug}`}
              class="ex-panel"
              href={`/examples/${card.slug}`}
              variant="secondary"
              size="M"
            >
              <CardPreview tag={card.tag}>
                <Image src={card.thumb} alt="" isPixelated />
              </CardPreview>
              <Content>
                <Heading level={2} styles={typeRoles.title}>
                  {card.title}
                </Heading>
                <Text styles={typeRoles.meta}>{card.meta}</Text>
              </Content>
            </Card>
          )}
        </For>
      </Grid>
      {/* No explicit ID: this following field observes generated-ID allocation. */}
      <TextField label="Following landing cards" />
    </>
  );
}
