"use client";

import { useState } from "react";
import type { TripPreferences } from "@/types";

const INTERESTS = [
  { label: "Culture & History", emoji: "🏛️" },
  { label: "Food & Cuisine", emoji: "🍜" },
  { label: "Adventure & Sports", emoji: "🧗" },
  { label: "Nature & Wildlife", emoji: "🌿" },
  { label: "Art & Museums", emoji: "🎨" },
  { label: "Nightlife", emoji: "🌃" },
  { label: "Shopping", emoji: "🛍️" },
  { label: "Beaches", emoji: "🏖️" },
  { label: "Architecture", emoji: "🏗️" },
  { label: "Wellness & Spa", emoji: "🧘" },
];

interface TripFormProps {
  onSubmit: (prefs: TripPreferences) => void;
  loading: boolean;
}

export function TripForm({ onSubmit, loading }: TripFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const [customInterest, setCustomInterest] = useState("");
  const [customInterestError, setCustomInterestError] = useState("");
  const [form, setForm] = useState<TripPreferences>({
    originLocation: "",
    destination: "",
    startDate: today,
    endDate: "",
    travelers: 2,
    budget: "medium",
    interests: [],
    dietaryRestrictions: "",
    mobilityConstraints: "",
    accommodationType: "hotel",
    transportMode: "flight",
    departureTime: "08:00",
    returnTime: "18:00",
  });

  function toggleInterest(interest: string) {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));
  }

  function addCustomInterest() {
    const trimmed = customInterest.trim();
    if (!trimmed) return;
    const words = trimmed.split(/\s+/);
    if (words.length > 2) {
      setCustomInterestError("Max 2 words");
      return;
    }
    if (form.interests.includes(trimmed)) {
      setCustomInterestError("Already added");
      return;
    }
    setForm((f) => ({ ...f, interests: [...f.interests, trimmed] }));
    setCustomInterest("");
    setCustomInterestError("");
  }

  function handleCustomInterestKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomInterest();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Trip planning form"
      className="bg-white rounded-2xl card-shadow p-6 space-y-5"
    >
      {/* Header */}
      <div className="pb-1">
        <h2 className="text-lg font-bold text-slate-900">Plan your trip</h2>
        <p className="text-xs text-slate-400 mt-0.5">Fill in the details below to generate your itinerary</p>
      </div>

      {/* Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="originLocation" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
            🛫 Current Location <span className="text-red-400">*</span>
          </label>
          <input
            id="originLocation"
            type="text"
            required
            aria-required="true"
            placeholder="e.g. New York, USA"
            value={form.originLocation}
            onChange={(e) => setForm((f) => ({ ...f, originLocation: e.target.value }))}
            className="input-field"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="destination" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
            📍 Destination <span className="text-red-400">*</span>
          </label>
          <input
            id="destination"
            type="text"
            required
            aria-required="true"
            placeholder="e.g. Kyoto, Japan"
            value={form.destination}
            onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
            className="input-field"
          />
        </div>
      </div>

      {/* Dates */}
      <fieldset className="space-y-1.5">
        <legend className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          📅 Travel Dates <span className="text-red-400">*</span>
        </legend>
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
              className="input-field"
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
              className="input-field"
            />
          </div>
        </div>
      </fieldset>

      {/* Transport and Timings */}
      <fieldset className="space-y-1.5">
        <legend className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          🚆 Transport & Timings <span className="text-red-400">*</span>
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label htmlFor="transportMode" className="sr-only">Mode of Transport</label>
            <select
              id="transportMode"
              value={form.transportMode}
              onChange={(e) => setForm((f) => ({ ...f, transportMode: e.target.value as TripPreferences["transportMode"] }))}
              className="input-field"
            >
              <option value="flight">✈️ Flight</option>
              <option value="train">🚆 Train</option>
              <option value="bus">🚌 Bus</option>
              <option value="car">🚗 Car</option>
              <option value="ship">🚢 Ship/Ferry</option>
              <option value="other">✨ Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="departureTime" className="sr-only">Departure Time</label>
            <input
              id="departureTime"
              type="time"
              required
              aria-required="true"
              value={form.departureTime}
              onChange={(e) => setForm((f) => ({ ...f, departureTime: e.target.value }))}
              className="input-field"
              title="Time of Departure"
            />
          </div>
          <div>
            <label htmlFor="returnTime" className="sr-only">Return Time</label>
            <input
              id="returnTime"
              type="time"
              required
              aria-required="true"
              value={form.returnTime}
              onChange={(e) => setForm((f) => ({ ...f, returnTime: e.target.value }))}
              className="input-field"
              title="Time of Return"
            />
          </div>
        </div>
      </fieldset>

      {/* Travelers + Budget */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="travelers" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
            👥 Travelers
          </label>
          <input
            id="travelers"
            type="number"
            min={1}
            max={20}
            value={form.travelers}
            onChange={(e) => setForm((f) => ({ ...f, travelers: Number(e.target.value) }))}
            aria-describedby="travelers-hint"
            className="input-field"
          />
          <p id="travelers-hint" className="text-[10px] text-slate-400">1–20 people</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="budget" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
            💰 Budget
          </label>
          <select
            id="budget"
            value={form.budget}
            onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value as TripPreferences["budget"] }))}
            className="input-field"
          >
            <option value="low">🎒 Low — Budget travel</option>
            <option value="medium">✈️ Medium — Comfortable</option>
            <option value="high">💎 High — Luxury</option>
          </select>
        </div>
      </div>

      {/* Accommodation */}
      <div className="space-y-1.5">
        <label htmlFor="accommodation" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
          🏨 Accommodation
        </label>
        <select
          id="accommodation"
          value={form.accommodationType}
          onChange={(e) => setForm((f) => ({ ...f, accommodationType: e.target.value as TripPreferences["accommodationType"] }))}
          className="input-field"
        >
          <option value="hotel">🏨 Hotel</option>
          <option value="hostel">🛏️ Hostel</option>
          <option value="airbnb">🏠 Airbnb / Apartment</option>
          <option value="resort">🌴 Resort</option>
        </select>
      </div>

      {/* Interests */}
      <fieldset>
        <legend className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
          🎯 Interests
        </legend>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Select your travel interests">
          {INTERESTS.map(({ label, emoji }) => {
            const selected = form.interests.includes(label);
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleInterest(label)}
                aria-pressed={selected}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
                  selected
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                }`}
              >
                <span aria-hidden="true">{emoji}</span>
                {label}
              </button>
            );
          })}
          {form.interests
            .filter((i) => !INTERESTS.some(({ label }) => label === i))
            .map((custom) => (
              <span
                key={custom}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-violet-600 text-white shadow-sm shadow-violet-200"
              >
                {custom}
                <button
                  type="button"
                  onClick={() => toggleInterest(custom)}
                  aria-label={`Remove ${custom}`}
                  className="ml-0.5 hover:text-violet-200 focus:outline-none focus:ring-1 focus:ring-white rounded-full"
                >
                  ×
                </button>
              </span>
            ))}
        </div>

        <div className="mt-2 flex gap-2 items-start">
          <div className="flex-1 space-y-1">
            <input
              type="text"
              value={customInterest}
              onChange={(e) => {
                setCustomInterest(e.target.value);
                setCustomInterestError("");
              }}
              onKeyDown={handleCustomInterestKeyDown}
              placeholder="Add your own (e.g. Street Art)"
              maxLength={30}
              aria-label="Add custom interest"
              aria-describedby={customInterestError ? "custom-interest-error" : undefined}
              className="input-field text-xs py-2"
            />
            {customInterestError && (
              <p id="custom-interest-error" className="text-[10px] text-red-500" role="alert">
                {customInterestError}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={addCustomInterest}
            className="shrink-0 px-3 py-2 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            + Add
          </button>
        </div>
      </fieldset>

      {/* Dietary + Mobility */}
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="dietary" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
            🍽️ Dietary Restrictions
          </label>
          <input
            id="dietary"
            type="text"
            placeholder="e.g. vegetarian, gluten-free, nut allergy"
            value={form.dietaryRestrictions}
            onChange={(e) => setForm((f) => ({ ...f, dietaryRestrictions: e.target.value }))}
            className="input-field"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="mobility" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
            ♿ Accessibility Needs
          </label>
          <input
            id="mobility"
            type="text"
            placeholder="e.g. wheelchair accessible, limited walking"
            value={form.mobilityConstraints}
            onChange={(e) => setForm((f) => ({ ...f, mobilityConstraints: e.target.value }))}
            aria-describedby="mobility-hint"
            className="input-field"
          />
          <p id="mobility-hint" className="text-[10px] text-slate-400">
            We&apos;ll tailor activities to your needs
          </p>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-md shadow-indigo-200/50 hover:shadow-lg hover:shadow-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-[0.99]"
      >
        {loading ? (
          <span aria-live="polite" className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
            Generating your itinerary…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span aria-hidden="true">✈️</span>
            Plan My Trip
          </span>
        )}
      </button>
    </form>
  );
}
