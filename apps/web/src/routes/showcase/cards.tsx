/* Panel 12 — Cards & Media. The Card family and its supporting media
   primitives: plain Card sweeps, the three purpose-built cards (Asset, User,
   Product), the collection preview, Avatar/AvatarGroup, and the empty-state
   IllustratedMessage. Composed from the shared Panel/Demo/Row chrome. */
import { createFileRoute } from "@tanstack/solid-router";
import { For } from "solid-js";
import {
  ActionButton,
  ActionMenu,
  AssetCard,
  Avatar,
  AvatarGroup,
  Button,
  Card,
  CardPreview,
  CollectionCardPreview,
  Content,
  Footer,
  Image,
  ImageCoordinator,
  IllustratedMessage,
  MenuItem,
  ProductCard,
  Text,
  UserCard,
  BellIcon,
  SearchIcon,
} from "@proyecto-viviana/ui";
import { Demo, Panel, Row } from "@/components/showcase/chrome";
import { panelBySlug } from "@/components/showcase/registry";

export const Route = createFileRoute("/showcase/cards")({
  component: Page,
});

const CARD_VARIANTS = ["primary", "secondary", "tertiary", "quiet"] as const;
const CARD_SIZES = ["XS", "S", "M", "L", "XL"] as const;

function Page() {
  const def = panelBySlug("cards")!;

  return (
    <Panel def={def}>
      <Demo label="Card · fill variants — quiet drops the fill and blur">
        <Row>
          <For each={CARD_VARIANTS}>
            {(variant) => (
              <Card id={`variant-${variant}`} variant={variant}>
                <CardPreview>
                  <Image src="/glasselated/thumb-1.png" alt="" />
                </CardPreview>
                <Content>
                  <Text slot="title">{variant.charAt(0).toUpperCase() + variant.slice(1)}</Text>
                  <Text slot="description">Card variant preview</Text>
                </Content>
              </Card>
            )}
          </For>
        </Row>
      </Demo>

      <Demo label="Card · sizes">
        <Row>
          <For each={CARD_SIZES}>
            {(size) => (
              <Card id={`size-${size}`} size={size}>
                <CardPreview>
                  <Image src="/glasselated/thumb-1.png" alt="" />
                </CardPreview>
                <Content>
                  <Text slot="title">{size}</Text>
                </Content>
              </Card>
            )}
          </For>
        </Row>
      </Demo>

      <Demo label="AssetCard · image preview">
        <Row>
          <AssetCard id="asset-image">
            <CardPreview>
              <Image src="/glasselated/bg-scene.png" alt="" />
            </CardPreview>
            <Content>
              <Text slot="title">Desert Scene</Text>
              <ActionMenu>
                <MenuItem id="edit">Edit</MenuItem>
                <MenuItem id="share">Share</MenuItem>
                <MenuItem id="delete">Delete</MenuItem>
              </ActionMenu>
              <Text slot="description">PNG · 2.6 MB</Text>
            </Content>
          </AssetCard>
        </Row>
      </Demo>

      <Demo label="AssetCard · icon preview — stands in for an illustration slot">
        <Row>
          <AssetCard id="asset-icon">
            <CardPreview>
              <BellIcon />
            </CardPreview>
            <Content>
              <Text slot="title">Notifications</Text>
              <ActionMenu>
                <MenuItem id="edit">Edit</MenuItem>
                <MenuItem id="delete">Delete</MenuItem>
              </ActionMenu>
              <Text slot="description">12 items</Text>
            </Content>
          </AssetCard>
        </Row>
      </Demo>

      <Demo label="UserCard">
        <Row>
          <UserCard id="user-simone">
            <CardPreview>
              <Image src="/glasselated/bg-scene-night.png" alt="" />
            </CardPreview>
            <Avatar src="/glasselated/avatar-1.png" />
            <Content>
              <Text slot="title">Simone Carter</Text>
              <Text slot="description">Art director, visual storyteller.</Text>
            </Content>
            <Footer>
              <ActionButton isQuiet>Message</ActionButton>
            </Footer>
          </UserCard>
        </Row>
      </Demo>

      <Demo label="ProductCard">
        <Row>
          <ProductCard id="product-command-r">
            <CardPreview>
              <Image slot="preview" src="/glasselated/bg-scene.png" alt="" />
            </CardPreview>
            <Image slot="thumbnail" src="/glasselated/thumb-1.png" alt="" />
            <Content>
              <Text slot="title">Command + R</Text>
              <Text slot="description">Your all-in-one shortcut for apps and devices.</Text>
            </Content>
            <Footer>
              <Button variant="primary">Buy now</Button>
            </Footer>
          </ProductCard>
        </Row>
      </Demo>

      <Demo label="Card · CollectionCardPreview">
        <Row>
          <Card id="collection-travel">
            <CollectionCardPreview>
              <Image alt="" src="/glasselated/thumb-1.png" />
              <Image alt="" src="/glasselated/bg-scene.png" />
              <Image alt="" src="/glasselated/bg-scene-night.png" />
              <Image alt="" src="/glasselated/thumb-1.png" />
            </CollectionCardPreview>
            <Content>
              <Text slot="title">Travel</Text>
              <Text slot="description">4 photos</Text>
            </Content>
          </Card>
        </Row>
      </Demo>

      <Demo label="Avatar · sizes">
        <Row>
          <Avatar src="/glasselated/avatar-1.png" size={24} />
          <Avatar src="/glasselated/avatar-2.png" size={32} />
          <Avatar src="/glasselated/avatar-3.png" size={48} />
          <Avatar src="/glasselated/avatar-1.png" size={64} />
          <Avatar size={48} isOverBackground />
        </Row>
      </Demo>

      <Demo label="AvatarGroup">
        <Row>
          <AvatarGroup label="3 collaborators" size={30}>
            <Avatar src="/glasselated/avatar-1.png" />
            <Avatar src="/glasselated/avatar-2.png" />
            <Avatar src="/glasselated/avatar-3.png" />
          </AvatarGroup>
        </Row>
      </Demo>

      <Demo label="ImageCoordinator · Image">
        <Row>
          <ImageCoordinator>
            <Image src="/glasselated/thumb-1.png" alt="Thumbnail" width={120} height={80} />
            <Image src="/glasselated/avatar-2.png" alt="Avatar" width={80} height={80} />
          </ImageCoordinator>
        </Row>
      </Demo>

      <Demo label="IllustratedMessage · orientations">
        <Row>
          <IllustratedMessage
            size="M"
            orientation="vertical"
            illustration={<SearchIcon />}
            heading="No results"
            description="Try a different search term."
          />
          <IllustratedMessage
            size="M"
            orientation="horizontal"
            illustration={<BellIcon />}
            heading="No notifications"
            description="You're all caught up."
          />
        </Row>
      </Demo>
    </Panel>
  );
}
