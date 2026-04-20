import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatPanel } from "./ChatPanel";

describe("ChatPanel", () => {
  it("renders chat section", () => {
    render(<ChatPanel />);
    expect(screen.getByText(/current pdf/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /send/i })).toBeTruthy();
  });
});
