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
    <div className="min-h-screen bg-[#f8faff]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Nav */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
              <span aria-hidden="true" className="text-lg">✈️</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-none">Travel Planning Engine</h1>
              <p className="text-[10px] text-slate-400 mt-0.5">Powered by Gemini AI · Firebase · Google Maps</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            AI Ready
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 pt-16 pb-24 px-5">
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs text-indigo-200 mb-5 backdrop-blur-sm">
            <span aria-hidden="true">✨</span> Gemini 2.5 Flash · Real-time AI Planning
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            Plan your perfect trip<br />
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-blue-300 bg-clip-text text-transparent">
              with AI in seconds
            </span>
          </h2>
          <p className="text-indigo-200/80 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Tell us your destination, budget, and travel style — get a personalised
            day-by-day itinerary with maps, calendar links, and seasonal tips.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-indigo-300/70">
            <span className="flex items-center gap-1.5"><span aria-hidden="true">🗺️</span> Google Maps</span>
            <span className="w-px h-3 bg-indigo-700" aria-hidden="true" />
            <span className="flex items-center gap-1.5"><span aria-hidden="true">📅</span> Google Calendar</span>
            <span className="w-px h-3 bg-indigo-700" aria-hidden="true" />
            <span className="flex items-center gap-1.5"><span aria-hidden="true">⚡</span> Instant Cache</span>
          </div>
        </div>
      </div>

      {/* Main content — overlaps hero */}
      <main id="main-content" className="max-w-6xl mx-auto px-4 -mt-10 pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6 items-start">
          <div className="animate-fade-in-up">
            <TripForm onSubmit={handlePlan} loading={loading} />
          </div>

          <div
            ref={resultsRef}
            tabIndex={-1}
            aria-live="polite"
            aria-atomic="true"
            className="focus:outline-none animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            {loading && (
              <div
                role="status"
                className="bg-white rounded-2xl card-shadow p-12 text-center"
              >
                <div className="relative w-16 h-16 mx-auto mb-5" aria-hidden="true">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                  <div className="absolute inset-2 rounded-full bg-indigo-50 flex items-center justify-center text-xl">
                    ✈️
                  </div>
                </div>
                <p className="text-slate-800 font-semibold text-lg">Crafting your itinerary…</p>
                <p className="text-slate-400 text-sm mt-1.5">Gemini AI is planning your perfect trip</p>
                <div className="mt-5 flex justify-center gap-1.5" aria-hidden="true">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div role="alert" className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-lg" aria-hidden="true">
                    ⚠️
                  </div>
                  <div>
                    <p className="font-semibold text-red-800">Something went wrong</p>
                    <p className="text-red-700 text-sm mt-0.5">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {itinerary && (
              <ErrorBoundary>
                <ItineraryView itinerary={itinerary} cached={cached} />
              </ErrorBoundary>
            )}

            {!loading && !error && !itinerary && (
              <div className="bg-white rounded-2xl card-shadow p-12 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4 animate-float" aria-hidden="true">
                  <span className="text-4xl">🗺️</span>
                </div>
                <p className="font-semibold text-slate-700 text-lg">Your itinerary will appear here</p>
                <p className="text-slate-400 text-sm mt-1.5 max-w-xs mx-auto">
                  Fill in your trip details and click <strong className="text-indigo-600">Plan My Trip</strong>
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3 max-w-xs mx-auto">
                  {["🌏 Anywhere", "🎒 Any budget", "📅 Any dates"].map((label) => (
                    <div key={label} className="text-xs text-slate-500 bg-slate-50 rounded-lg py-2 px-1 border border-slate-100">
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Travel Planning & Experience Engine · PromptWars Bengaluru 2026</span>
          <span className="flex items-center gap-3">
            <span>Next.js 15</span>
            <span aria-hidden="true">·</span>
            <span>Google Gemini AI</span>
            <span aria-hidden="true">·</span>
            <span>Firebase</span>
            <span aria-hidden="true">·</span>
            <span>Google Maps</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
