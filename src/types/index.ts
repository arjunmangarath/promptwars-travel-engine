export interface TripPreferences {
  readonly destination: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly travelers: number;
  readonly budget: "low" | "medium" | "high";
  readonly interests: readonly string[];
  readonly dietaryRestrictions: string;
  readonly mobilityConstraints: string;
  readonly accommodationType: "hotel" | "hostel" | "airbnb" | "resort";
}

export interface Activity {
  readonly time: string;
  readonly activity: string;
  readonly location: string;
  readonly description: string;
  readonly estimatedCost: string;
  readonly tips: string;
  readonly accessibilityNotes?: string;
}

export interface DayPlan {
  readonly day: number;
  readonly date: string;
  readonly theme: string;
  readonly activities: readonly Activity[];
}

export interface TripItinerary {
  readonly tripTitle: string;
  readonly destination: string;
  readonly duration: string;
  readonly estimatedBudget: string;
  readonly currency: string;
  /** Real-time seasonal weather context for the travel dates, provided by the AI. */
  readonly weatherConsiderations?: string;
  readonly days: readonly DayPlan[];
  readonly packingList: readonly string[];
  readonly travelTips: readonly string[];
  readonly emergencyContacts: readonly string[];
}

export interface PlanRequest {
  readonly preferences: TripPreferences;
}

export interface PlanResponse {
  readonly itinerary: TripItinerary;
  readonly generatedAt: string;
  readonly cached?: boolean;
}

export interface ApiError {
  readonly error: string;
  readonly details?: string;
}
