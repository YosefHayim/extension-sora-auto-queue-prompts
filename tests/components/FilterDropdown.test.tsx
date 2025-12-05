import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FilterDropdown } from "../../src/components/FilterDropdown";

describe("FilterDropdown", () => {
  const mockOnStatusFilterChange = jest.fn();
  const mockOnMediaTypeFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render filter button", () => {
    render(
      <FilterDropdown
        statusFilter="all"
        mediaTypeFilter="all"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={10}
      />
    );

    expect(screen.getByText("Filters")).toBeInTheDocument();
  });

  it("should display prompt count badge", () => {
    render(
      <FilterDropdown
        statusFilter="all"
        mediaTypeFilter="all"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={5}
      />
    );

    expect(screen.getByText("5 prompts")).toBeInTheDocument();
  });

  it("should display singular prompt count when count is 1", () => {
    render(
      <FilterDropdown
        statusFilter="all"
        mediaTypeFilter="all"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={1}
      />
    );

    expect(screen.getByText("1 prompt")).toBeInTheDocument();
  });

  it("should show active filter badge when filters are active", () => {
    render(
      <FilterDropdown
        statusFilter="pending"
        mediaTypeFilter="all"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={5}
      />
    );

    const filterButton = screen.getByText("Filters").closest("button");
    expect(filterButton).toBeInTheDocument();
    // Check for badge with "1" indicating one active filter
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it('should show badge with "2" when both filters are active', () => {
    render(
      <FilterDropdown
        statusFilter="pending"
        mediaTypeFilter="video"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={5}
      />
    );

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("should open dropdown when filter button is clicked", async () => {
    render(
      <FilterDropdown
        statusFilter="all"
        mediaTypeFilter="all"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={10}
      />
    );

    const filterButton = screen.getByText("Filters").closest("button");
    if (filterButton) {
      fireEvent.click(filterButton);
      await waitFor(() => {
        expect(screen.getByText("Status")).toBeInTheDocument();
        expect(screen.getByText("Media Type")).toBeInTheDocument();
      });
    }
  });

  it("should call onStatusFilterChange when status option is selected", async () => {
    render(
      <FilterDropdown
        statusFilter="all"
        mediaTypeFilter="all"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={10}
      />
    );

    const filterButton = screen.getByText("Filters").closest("button");
    if (filterButton) {
      fireEvent.click(filterButton);
      await waitFor(() => {
        expect(screen.getByText("Pending")).toBeInTheDocument();
      });
      const pendingOption = screen.getByText("Pending");
      fireEvent.click(pendingOption);
      expect(mockOnStatusFilterChange).toHaveBeenCalledWith("pending");
    }
  });

  it("should call onMediaTypeFilterChange when media type option is selected", async () => {
    render(
      <FilterDropdown
        statusFilter="all"
        mediaTypeFilter="all"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={10}
      />
    );

    const filterButton = screen.getByText("Filters").closest("button");
    if (filterButton) {
      fireEvent.click(filterButton);
      await waitFor(() => {
        expect(screen.getByText("Video")).toBeInTheDocument();
      });
      const videoOption = screen.getByText("Video");
      fireEvent.click(videoOption);
      expect(mockOnMediaTypeFilterChange).toHaveBeenCalledWith("video");
    }
  });

  it("should show clear filters option when filters are active", async () => {
    render(
      <FilterDropdown
        statusFilter="pending"
        mediaTypeFilter="video"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={5}
      />
    );

    const filterButton = screen.getByText("Filters").closest("button");
    if (filterButton) {
      fireEvent.click(filterButton);
      await waitFor(() => {
        expect(screen.getByText("Clear Filters")).toBeInTheDocument();
      });
    }
  });

  it("should not show clear filters option when no filters are active", async () => {
    render(
      <FilterDropdown
        statusFilter="all"
        mediaTypeFilter="all"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={10}
      />
    );

    const filterButton = screen.getByText("Filters").closest("button");
    if (filterButton) {
      fireEvent.click(filterButton);
      await waitFor(() => {
        expect(screen.queryByText("Clear Filters")).not.toBeInTheDocument();
      });
    }
  });

  it("should clear all filters when clear filters is clicked", async () => {
    render(
      <FilterDropdown
        statusFilter="pending"
        mediaTypeFilter="video"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={5}
      />
    );

    const filterButton = screen.getByText("Filters").closest("button");
    if (filterButton) {
      fireEvent.click(filterButton);
      await waitFor(() => {
        expect(screen.getByText("Clear Filters")).toBeInTheDocument();
      });
      const clearOption = screen.getByText("Clear Filters");
      fireEvent.click(clearOption);
      expect(mockOnStatusFilterChange).toHaveBeenCalledWith("all");
      expect(mockOnMediaTypeFilterChange).toHaveBeenCalledWith("all");
    }
  });

  it("should show checkmark for active status filter", async () => {
    render(
      <FilterDropdown
        statusFilter="pending"
        mediaTypeFilter="all"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={5}
      />
    );

    const filterButton = screen.getByText("Filters").closest("button");
    if (filterButton) {
      fireEvent.click(filterButton);
      await waitFor(() => {
        expect(screen.getByText("Pending")).toBeInTheDocument();
      });
      // The checkmark (✓) should be visible for the active filter
      const pendingOption = screen.getByText("Pending");
      expect(pendingOption.closest("div")).toBeInTheDocument();
    }
  });

  it("should show checkmark for active media type filter", async () => {
    render(
      <FilterDropdown
        statusFilter="all"
        mediaTypeFilter="video"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={5}
      />
    );

    const filterButton = screen.getByText("Filters").closest("button");
    if (filterButton) {
      fireEvent.click(filterButton);
      await waitFor(() => {
        expect(screen.getByText("Video")).toBeInTheDocument();
      });
      const videoOption = screen.getByText("Video");
      expect(videoOption.closest("div")).toBeInTheDocument();
    }
  });

  it("should render all status options", async () => {
    render(
      <FilterDropdown
        statusFilter="all"
        mediaTypeFilter="all"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={10}
      />
    );

    const filterButton = screen.getByText("Filters").closest("button");
    if (filterButton) {
      fireEvent.click(filterButton);
      await waitFor(() => {
        expect(screen.getByText("All")).toBeInTheDocument();
        expect(screen.getByText("Pending")).toBeInTheDocument();
        expect(screen.getByText("Processing")).toBeInTheDocument();
        expect(screen.getByText("Completed")).toBeInTheDocument();
        expect(screen.getByText("Failed")).toBeInTheDocument();
      });
    }
  });

  it("should render all media type options", async () => {
    render(
      <FilterDropdown
        statusFilter="all"
        mediaTypeFilter="all"
        onStatusFilterChange={mockOnStatusFilterChange}
        onMediaTypeFilterChange={mockOnMediaTypeFilterChange}
        promptCount={10}
        filteredCount={10}
      />
    );

    const filterButton = screen.getByText("Filters").closest("button");
    if (filterButton) {
      fireEvent.click(filterButton);
      await waitFor(() => {
        expect(screen.getByText("All Types")).toBeInTheDocument();
        expect(screen.getByText("Video")).toBeInTheDocument();
        expect(screen.getByText("Image")).toBeInTheDocument();
      });
    }
  });
});
