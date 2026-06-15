import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { Chip } from "../src/custom/chip";
import { ConversationPreview } from "../src/custom/conversation";
import { EventListItem } from "../src/custom/event-card";
import { NavHeader } from "../src/custom/nav-header";

describe("Custom interaction bridges", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
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

  it("NavHeader menu trigger has default aria-label and forwards onMenuClick", async () => {
    const onMenuClick = vi.fn();
    render(() => (
      <NavHeader logoText="PV" menuIcon={<span>Menu</span>} onMenuClick={onMenuClick} />
    ));

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });
});
