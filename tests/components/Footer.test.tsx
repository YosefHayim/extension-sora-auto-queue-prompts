import "@testing-library/jest-dom";

import * as React from "react";

import { render, screen } from "@testing-library/react";

import { Footer } from "../../src/components/Footer";

describe("Footer", () => {
  it("should render the attribution text", () => {
    render(<Footer />);
    expect(screen.getByText(/made with/i)).toBeInTheDocument();
    expect(screen.getByText(/yosef sabag/i)).toBeInTheDocument();
  });

  it("should render GitHub link with correct URL", () => {
    render(<Footer />);
    const githubLink = screen.getByLabelText("GitHub profile");
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute("href", "https://github.com/YosefHayim");
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("should render LinkedIn link with correct URL", () => {
    render(<Footer />);
    const linkedinLink = screen.getByLabelText("LinkedIn profile");
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/yosef-hayim-sabag/",
    );
    expect(linkedinLink).toHaveAttribute("target", "_blank");
    expect(linkedinLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("should render GitHub icon", () => {
    const { container } = render(<Footer />);
    const githubLink = screen.getByLabelText("GitHub profile");
    const githubIcon = githubLink.querySelector("svg");
    expect(githubIcon).toBeInTheDocument();
  });

  it("should render LinkedIn icon", () => {
    const { container } = render(<Footer />);
    const linkedinLink = screen.getByLabelText("LinkedIn profile");
    const linkedinIcon = linkedinLink.querySelector("svg");
    expect(linkedinIcon).toBeInTheDocument();
  });

  it("should render heart icon", () => {
    const { container } = render(<Footer />);
    const heartIcons = container.querySelectorAll("svg");
    // Should have at least 3 icons: GitHub, LinkedIn, and Heart
    expect(heartIcons.length).toBeGreaterThanOrEqual(3);
  });

  it("should have proper accessibility attributes", () => {
    render(<Footer />);
    const githubLink = screen.getByLabelText("GitHub profile");
    const linkedinLink = screen.getByLabelText("LinkedIn profile");

    expect(githubLink).toHaveAttribute("aria-label", "GitHub profile");
    expect(linkedinLink).toHaveAttribute("aria-label", "LinkedIn profile");
  });

  it("should have hover styles on links", () => {
    render(<Footer />);
    const githubLink = screen.getByLabelText("GitHub profile");
    const linkedinLink = screen.getByLabelText("LinkedIn profile");

    expect(githubLink).toHaveClass("hover:text-foreground");
    expect(linkedinLink).toHaveClass("hover:text-foreground");
  });

  it("should render version number", () => {
    render(<Footer />);
    const versionText = screen.getByText(/^v\d+\.\d+\.\d+$/);
    expect(versionText).toBeInTheDocument();
    // Version should match the pattern vX.Y.Z
    expect(versionText.textContent).toMatch(/^v\d+\.\d+\.\d+$/);
  });

  it("should display version below attribution", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer");
    expect(footer).toHaveClass("flex", "flex-col");

    const versionText = screen.getByText(/^v\d+\.\d+\.\d+$/);
    expect(versionText).toBeInTheDocument();
    const parentDiv = versionText.closest("div");
    expect(parentDiv).toHaveClass("text-xs");
  });

  it("should render Rate link for Chrome Web Store", () => {
    render(<Footer />);
    const rateLink = screen.getByLabelText("Rate on Chrome Web Store");
    expect(rateLink).toBeInTheDocument();
    expect(rateLink).toHaveAttribute(
      "href",
      "https://chromewebstore.google.com/detail/sora-auto-queue-prompts/kbpbdckjechbjmnjagfkgcplmhdkkgph",
    );
  });

  it("should render Report Bug link", () => {
    render(<Footer />);
    const bugLink = screen.getByLabelText("Report a bug");
    expect(bugLink).toBeInTheDocument();
    expect(bugLink).toHaveAttribute(
      "href",
      "https://github.com/YosefHayim/extension-sora-auto-queue-prompts/issues",
    );
  });

  it("should render Buy me a coffee link", () => {
    render(<Footer />);
    const coffeeLink = screen.getByLabelText("Buy me a coffee");
    expect(coffeeLink).toBeInTheDocument();
    expect(coffeeLink).toHaveAttribute(
      "href",
      "https://buymeacoffee.com/yosefhayim",
    );
  });
});
