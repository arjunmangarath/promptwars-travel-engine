"use client";

import { useState } from "react";
import type { TripPreferences } from "@/types";

const INTERESTS = [
  "Culture & History",
  "Food & Cuisine",
  "Adventure & Sports",
  "Nature & Wildlife",
  "Art & Museums",
  "Nightlife",
  "Shopping",
  "Beaches",
  "Architecture",
  "Wellness & Spa",
];

interface TripFormProps {
  onSubmit: (prefs: TripPreferences) => void;
  loading: boolean;
}

export function TripForm({ onSubmit, loading }: TripFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState<TripPreferences>({
    destination: "",
    startDate: today,
    endDate: "",
    travelers: 2,
    budget: "medium",
    interests: [],
    dietaryRestrictions: "",
    mobilityConstraints: "",
    accommodationType: "hotel",
  });

  function toggleInterest(interest: string) {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Trip planning form"
      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6"
    >
      <div className="space-y-1">
        <label htmlFor="destination" className="block text-sm font-medium text-slate-700">
          Destination <span aria-hidden="true">*</span>
        </label>
        <input
          id="destination"
          type="text"
          required
          aria-required="true"
          placeholder="e.g. Kyoto, Japan"
          value={form.destination}
          onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <fieldset className="space-y-1">
        <legend className="text-sm font-medium text-slate-700">Travel Dates <span aria-hidden="true">*</span></legend>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="startDate" className="sr-only">Start date</label>
            <input
              id="startDate"
              type="date"
              required
              aria-required="true"
              min={today}
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="sr-only">End date</label>
            <input
              id="endDate"
              type="date"
              required
              aria-required="true"
              min={form.startDate}
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="travelers" className="block text-sm font-medium text-slate-700">
            Travelers
          </label>
          <input
            id="travelers"
            type="number"
            min={1}
            max={20}
            value={form.travelers}
            onChange={(e) => setForm((f) => ({ ...f, travelers: Number(e.target.value) }))}
            aria-describedby="travelers-hint"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p id="travelers-hint" className="text-xs text-slate-500">1–20 people</p>
        </div>

        <div className="space-y-1">
          <label htmlFor="budget" className="block text-sm font-medium text-slate-700">Budget</label>
          <select
            id="budget"
            value={form.budget}
            onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value as TripPreferences["budget"] }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low (budget travel)</option>
            <option value="medium">Medium (comfortable)</option>
            <option value="high">High (luxury)</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="accommodation" className="block text-sm font-medium text-slate-700">Accommodation</label>
        <select
          id="accommodation"
          value={form.accommodationType}
          onChange={(e) => setForm((f) => ({ ...f, accommodationType: e.target.value as TripPreferences["accommodationType"] }))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="hotel">Hotel</option>
          <option value="hostel">Hostel</option>
          <option value="airbnb">Airbnb / Apartment</option>
          <option value="resort">Resort</option>
        </select>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-slate-700 mb-2">Interests</legend>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Select your travel interests">
          {INTERESTS.map((interest) => {
            const selected = form.interests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                aria-pressed={selected}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                  selected
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-1">
        <label htmlFor="dietary" className="block text-sm font-medium text-slate-700">
          Dietary Restrictions
        </label>
        <input
          id="dietary"
          type="text"
          placeholder="e.g. vegetarian, gluten-free, nut allergy"
          value={form.dietaryRestrictions}
          onChange={(e) => setForm((f) => ({ ...f, dietaryRestrictions: e.target.value }))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="mobility" className="block text-sm font-medium text-slate-700">
          Mobility or Accessibility Needs
        </label>
        <input
          id="mobility"
          type="text"
          placeholder="e.g. wheelchair accessible, limited walking"
          value={form.mobilityConstraints}
          onChange={(e) => setForm((f) => ({ ...f, mobilityConstraints: e.target.value }))}
          aria-describedby="mobility-hint"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p id="mobility-hint" className="text-xs text-slate-500">
          We'll tailor recommendations to your needs
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {loading ? (
          <span aria-live="polite">Generating your itinerary…</span>
        ) : (
          "Plan My Trip"
        )}
      </button>
    </form>
  );
}
