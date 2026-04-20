import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UploadPanel } from "./UploadPanel";

describe("UploadPanel", () => {
  it("renders upload controls", () => {
    render(<UploadPanel />);
    expect(screen.getByRole("button", { name: /upload pdf/i })).toBeTruthy();
    expect(screen.getByText(/upload a pdf to start chatting/i)).toBeTruthy();
  });
});
