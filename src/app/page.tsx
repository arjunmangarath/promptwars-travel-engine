"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { TripForm } from "@/components/TripForm";
import { ItineraryView } from "@/components/ItineraryView";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { trackTripPlanned } from "@/lib/analytics";
import type { TripPreferences, TripItinerary } from "@/types";

export default function Home() {
  const [itinerary, setItinerary] = useState<TripItinerary | null>(null);
  const [cached, setCached] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (itinerary && resultsRef.current) {
      resultsRef.current.focus();
    }
  }, [itinerary]);

  const handlePlan = useCallback(async (preferences: TripPreferences) => {
    setLoading(true);
    setError(null);
    setItinerary(null);
    setCached(false);

    trackTripPlanned(preferences.destination, preferences.budget);

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to generate itinerary");
      }

      setItinerary(data.itinerary);
      setCached(data.cached ?? false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md"
      >
        Skip to main content
      </a>

      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <span aria-hidden="true" className="text-2xl">✈️</span>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Travel Planning & Experience Engine
            </h1>
            <p className="text-xs text-slate-500">
              Powered by Google Gemini AI · Firebase · Google Maps
            </p>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Plan your perfect trip
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Tell us your preferences, constraints, and travel style. Our AI will
            generate a personalised, day-by-day itinerary in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <TripForm onSubmit={handlePlan} loading={loading} />
          </div>

          <div
            ref={resultsRef}
            tabIndex={-1}
            aria-live="polite"
            aria-atomic="true"
            className="focus:outline-none"
          >
            {loading && (
              <div
                role="status"
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center"
              >
                <div
                  aria-hidden="true"
                  className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mx-auto mb-4"
                />
                <p className="text-slate-600 font-medium">
                  Gemini is crafting your itinerary…
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  This usually takes 5–10 seconds
                </p>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 rounded-2xl p-6"
              >
                <h3 className="font-semibold text-red-800 mb-1">
                  Something went wrong
                </h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {itinerary && (
              <ErrorBoundary>
                <ItineraryView itinerary={itinerary} cached={cached} />
              </ErrorBoundary>
            )}

            {!loading && !error && !itinerary && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center text-slate-400">
                <span aria-hidden="true" className="text-5xl block mb-4">🗺️</span>
                <p className="font-medium">Your itinerary will appear here</p>
                <p className="text-sm mt-1">
                  Fill in the form and click Plan My Trip
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-16 border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        Built with Next.js · Google Gemini AI · Firebase · Google Maps ·{" "}
        <span>PromptWars Bengaluru 2026</span>
      </footer>
    </div>
  );
}
