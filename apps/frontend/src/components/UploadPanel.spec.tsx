import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UploadPanel } from "./UploadPanel";

describe("UploadPanel", () => {
  it("renders upload controls", () => {
    render(<UploadPanel />);
    expect(screen.getByText("Upload PDF")).toBeTruthy();
    expect(screen.getByText("Upload")).toBeTruthy();
  });
});
