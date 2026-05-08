import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("@/lib/analytics", () => ({
  trackTripPlanned: jest.fn(),
  trackItineraryViewed: jest.fn(),
  initAnalytics: jest.fn().mockResolvedValue(null),
}));

jest.mock("@/lib/calendar", () => ({
  buildGoogleCalendarUrl: jest.fn(() => "https://calendar.google.com/mock"),
  buildGoogleCalendarDayUrl: jest.fn(() => "https://calendar.google.com/mock-day"),
}));

import { TripForm } from "@/components/TripForm";
import { ItineraryView } from "@/components/ItineraryView";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { TripItinerary } from "@/types";

const mockItinerary: TripItinerary = {
  tripTitle: "Tokyo Adventure",
  destination: "Tokyo, Japan",
  duration: "6 nights",
  estimatedBudget: "¥150,000",
  currency: "JPY",
  days: [
    {
      day: 1,
      date: "2026-06-01",
      theme: "Arrival & Asakusa",
      activities: [
        {
          time: "14:00",
          activity: "Visit Senso-ji Temple",
          location: "Senso-ji, Asakusa, Tokyo",
          description: "Explore Japan's oldest temple district.",
          estimatedCost: "Free",
          tips: "Arrive early to avoid crowds",
          accessibilityNotes: "Wheelchair accessible main path",
        },
      ],
    },
  ],
  packingList: ["Passport", "JR Pass", "Portable WiFi"],
  travelTips: ["Get a Suica card", "Learn basic Japanese phrases"],
  emergencyContacts: ["Police: 110", "Embassy: +81-3-3224-5000"],
};

// ── TripForm ──────────────────────────────────────────────────────────────────

describe("TripForm", () => {
  it("renders the destination input", () => {
    render(<TripForm onSubmit={jest.fn()} loading={false} />);
    expect(screen.getByLabelText(/destination/i)).toBeInTheDocument();
  });

  it("renders the Plan My Trip submit button", () => {
    render(<TripForm onSubmit={jest.fn()} loading={false} />);
    expect(screen.getByRole("button", { name: /plan my trip/i })).toBeInTheDocument();
  });

  it("disables submit button when loading", () => {
    render(<TripForm onSubmit={jest.fn()} loading={true} />);
    const buttons = screen.getAllByRole("button");
    const submit = buttons.find((b) => b.getAttribute("type") === "submit");
    expect(submit).toBeDisabled();
  });

  it("shows generating state text when loading", () => {
    render(<TripForm onSubmit={jest.fn()} loading={true} />);
    expect(screen.getByText(/generating your itinerary/i)).toBeInTheDocument();
  });

  it("renders all interest toggle buttons", () => {
    render(<TripForm onSubmit={jest.fn()} loading={false} />);
    expect(screen.getByRole("button", { name: /culture & history/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /food & cuisine/i })).toBeInTheDocument();
  });

  it("toggles interest selection on click", () => {
    render(<TripForm onSubmit={jest.fn()} loading={false} />);
    const btn = screen.getByRole("button", { name: /culture & history/i });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });

  it("renders budget select with all options", () => {
    render(<TripForm onSubmit={jest.fn()} loading={false} />);
    const select = screen.getByLabelText(/budget/i);
    expect(select).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /low/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /medium/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /high/i })).toBeInTheDocument();
  });

  it("renders accommodation select", () => {
    render(<TripForm onSubmit={jest.fn()} loading={false} />);
    expect(screen.getByLabelText(/accommodation/i)).toBeInTheDocument();
  });

  it("renders dietary restrictions input", () => {
    render(<TripForm onSubmit={jest.fn()} loading={false} />);
    expect(screen.getByLabelText(/dietary restrictions/i)).toBeInTheDocument();
  });

  it("renders mobility needs input", () => {
    render(<TripForm onSubmit={jest.fn()} loading={false} />);
    expect(screen.getByLabelText(/mobility or accessibility needs/i)).toBeInTheDocument();
  });

  it("calls onSubmit with preferences when form is submitted", () => {
    const onSubmit = jest.fn();
    render(<TripForm onSubmit={onSubmit} loading={false} />);
    const destination = screen.getByLabelText(/destination/i);
    fireEvent.change(destination, { target: { value: "Paris, France" } });
    const form = screen.getByRole("form", { name: /trip planning form/i });
    fireEvent.submit(form);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ destination: "Paris, France" })
    );
  });
});

// ── ItineraryView ─────────────────────────────────────────────────────────────

describe("ItineraryView", () => {
  it("renders the trip title", () => {
    render(<ItineraryView itinerary={mockItinerary} />);
    expect(screen.getByText("Tokyo Adventure")).toBeInTheDocument();
  });

  it("renders the destination", () => {
    render(<ItineraryView itinerary={mockItinerary} />);
    expect(screen.getByText("Tokyo, Japan")).toBeInTheDocument();
  });

  it("renders the estimated budget", () => {
    render(<ItineraryView itinerary={mockItinerary} />);
    expect(screen.getByText(/¥150,000/)).toBeInTheDocument();
  });

  it("renders day theme", () => {
    render(<ItineraryView itinerary={mockItinerary} />);
    expect(screen.getByText(/Arrival & Asakusa/)).toBeInTheDocument();
  });

  it("renders activity name", () => {
    render(<ItineraryView itinerary={mockItinerary} />);
    expect(screen.getByText("Visit Senso-ji Temple")).toBeInTheDocument();
  });

  it("renders activity location as a Google Maps link", () => {
    render(<ItineraryView itinerary={mockItinerary} />);
    const mapLink = screen.getByRole("link", { name: /view senso-ji.*on google maps/i });
    expect(mapLink).toHaveAttribute("href", expect.stringContaining("google.com/maps"));
  });

  it("renders accessibility notes", () => {
    render(<ItineraryView itinerary={mockItinerary} />);
    expect(screen.getByText(/wheelchair accessible/i)).toBeInTheDocument();
  });

  it("renders travel tips section", () => {
    render(<ItineraryView itinerary={mockItinerary} />);
    expect(screen.getByRole("region", { name: /travel tips/i })).toBeInTheDocument();
    expect(screen.getByText("Get a Suica card")).toBeInTheDocument();
  });

  it("renders packing list section", () => {
    render(<ItineraryView itinerary={mockItinerary} />);
    expect(screen.getByRole("region", { name: /packing list/i })).toBeInTheDocument();
    expect(screen.getByText("Passport")).toBeInTheDocument();
  });

  it("renders emergency contacts section", () => {
    render(<ItineraryView itinerary={mockItinerary} />);
    expect(screen.getByRole("region", { name: /emergency contacts/i })).toBeInTheDocument();
    expect(screen.getByText("Police: 110")).toBeInTheDocument();
  });

  it("shows Cached badge when cached prop is true", () => {
    render(<ItineraryView itinerary={mockItinerary} cached={true} />);
    expect(screen.getByLabelText(/itinerary loaded from cache/i)).toBeInTheDocument();
  });

  it("does not show Cached badge when cached prop is false", () => {
    render(<ItineraryView itinerary={mockItinerary} cached={false} />);
    expect(screen.queryByLabelText(/itinerary loaded from cache/i)).not.toBeInTheDocument();
  });

  it("renders Add trip to Google Calendar link", () => {
    render(<ItineraryView itinerary={mockItinerary} />);
    expect(screen.getByRole("link", { name: /add entire trip to google calendar/i })).toBeInTheDocument();
  });

  it("renders activity tip note when tips are present", () => {
    render(<ItineraryView itinerary={mockItinerary} />);
    expect(screen.getByText(/Arrive early to avoid crowds/)).toBeInTheDocument();
  });
});

// ── ErrorBoundary ─────────────────────────────────────────────────────────────

describe("ErrorBoundary", () => {
  const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) throw new Error("Test render error");
    return <div>Content rendered successfully</div>;
  };

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Content rendered successfully")).toBeInTheDocument();
  });

  it("renders error fallback when child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback UI</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Custom fallback UI")).toBeInTheDocument();
  });

  it("shows the error message in default fallback", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Test render error/)).toBeInTheDocument();
  });
});
