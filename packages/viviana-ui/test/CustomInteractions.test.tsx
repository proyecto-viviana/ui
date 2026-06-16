import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
// Import through the package's PUBLIC barrels (the same surface consumers reach
// via `@proyecto-viviana/ui/Chip` etc.), not deep `src/custom/*` paths. A native
// that is not exported from its barrel cannot be imported here, so these tests
// can only pass for components that are actually part of the public API.
import * as ChipModule from "../src/Chip";
import * as ConversationModule from "../src/Conversation";
import * as EventCardModule from "../src/EventCard";

const { Chip } = ChipModule;
const { ConversationPreview } = ConversationModule;
const { EventListItem } = EventCardModule;

describe("Custom interaction bridges", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
  });

  it("exposes the interactive natives through their public barrels", () => {
    // Guard the public surface itself: if any of these is demoted out of its
    // `export *` barrel, this fails instead of silently passing on a private path.
    expect(typeof Chip).toBe("function");
    expect(typeof ConversationPreview).toBe("function");
    expect(typeof EventListItem).toBe("function");
  });

  it("Chip forwards onClick through headless button press", async () => {
    const onClick = vi.fn();
    render(() => <Chip text="Demo" onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: "Demo" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("ConversationPreview forwards onClick through headless button press", async () => {
    const onClick = vi.fn();
    render(() => (
      <ConversationPreview user={{ name: "Ana" }} lastMessage="Hello" onClick={onClick} />
    ));

    await user.click(screen.getByRole("button", { name: /Ana/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("EventListItem forwards onClick through headless button press", async () => {
    const onClick = vi.fn();
    render(() => <EventListItem title="Evento" onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: /Evento/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
