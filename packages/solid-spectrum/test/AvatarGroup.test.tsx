import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Avatar, AvatarGroup, AvatarGroupContext } from "../src";

describe("AvatarGroup", () => {
  it("labels the group and sizes child Avatars through context", () => {
    const { container } = render(() => (
      <AvatarGroup label="Project team" size={32}>
        <Avatar alt="Alana" />
        <Avatar alt="Kai" />
      </AvatarGroup>
    ));

    const group = screen.getByRole("group", { name: "Project team" });
    const avatars = container.querySelectorAll('[slot="avatar"]');

    expect(group).toHaveStyle({ "--size": "2rem" });
    expect(avatars).toHaveLength(2);
    expect(avatars[0]).toHaveStyle({ width: "2rem", height: "2rem" });
    expect(avatars[1]).toHaveStyle({ width: "2rem", height: "2rem" });
    expect(screen.getByText("Project team")).toBeInTheDocument();
  });

  it("supports aria-label when no visible label is supplied", () => {
    render(() => (
      <AvatarGroup aria-label="Reviewers">
        <Avatar alt="Alana" />
      </AvatarGroup>
    ));

    expect(screen.getByRole("group", { name: "Reviewers" })).toBeInTheDocument();
  });

  it("applies AvatarGroupContext to the group", () => {
    const { container } = render(() => (
      <AvatarGroupContext.Provider value={{ size: 40, label: "Context team" }}>
        <AvatarGroup>
          <Avatar alt="Alana" />
        </AvatarGroup>
      </AvatarGroupContext.Provider>
    ));

    const group = screen.getByRole("group", { name: "Context team" });
    const avatar = container.querySelector('[slot="avatar"]');

    expect(group).toHaveStyle({ "--size": "2.5rem" });
    expect(avatar).toHaveStyle({ width: "2.5rem", height: "2.5rem" });
  });
});
