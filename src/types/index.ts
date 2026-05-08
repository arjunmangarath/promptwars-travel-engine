export interface TripPreferences {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: "low" | "medium" | "high";
  interests: string[];
  dietaryRestrictions: string;
  mobilityConstraints: string;
  accommodationType: "hotel" | "hostel" | "airbnb" | "resort";
}

export interface Activity {
  time: string;
  activity: string;
  location: string;
  description: string;
  estimatedCost: string;
  tips: string;
  accessibilityNotes?: string;
}

export interface DayPlan {
  day: number;
  date: string;
  theme: string;
  activities: Activity[];
}

export interface TripItinerary {
  tripTitle: string;
  destination: string;
  duration: string;
  estimatedBudget: string;
  currency: string;
  days: DayPlan[];
  packingList: string[];
  travelTips: string[];
  emergencyContacts: string[];
}

export interface PlanRequest {
  preferences: TripPreferences;
}

export interface PlanResponse {
  itinerary: TripItinerary;
  generatedAt: string;
  cached?: boolean;
}

export interface ApiError {
  error: string;
  details?: string;
}
