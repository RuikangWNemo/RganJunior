import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import EditorialSectionNav from "./EditorialSectionNav";

describe("shared chapter navigation", () => {
  it("centers within its track without scrolling the document past the Hero", () => {
    const scroll = vi.fn();
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "scrollTo",
    );
    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      configurable: true,
      value: scroll,
    });
    const pageScroll = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => {});
    try {
      const select = vi.fn();
      render(
        <MemoryRouter>
          <EditorialSectionNav
            activeId="visits"
            ariaLabel="Chapters"
            indicatorLayoutId="test"
            items={[
              {
                id: "visits",
                href: "/impact#website-visits",
                label: "Website visits",
              },
            ]}
            onSelect={select}
          />
        </MemoryRouter>,
      );
      expect(scroll).toHaveBeenCalled();
      expect(pageScroll).not.toHaveBeenCalled();
      const link = screen.getByRole("link", { name: "Website visits" });
      expect(link).toHaveAttribute("aria-current", "location");
      fireEvent.click(link);
      expect(select).toHaveBeenCalledWith("visits");
    } finally {
      if (descriptor)
        Object.defineProperty(HTMLElement.prototype, "scrollTo", descriptor);
      else Reflect.deleteProperty(HTMLElement.prototype, "scrollTo");
      pageScroll.mockRestore();
    }
  });
});
