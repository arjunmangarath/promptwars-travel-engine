"use client";

import { memo, useState, useCallback } from "react";
import { trackItineraryViewed } from "@/lib/analytics";
import { buildGoogleCalendarUrl, buildGoogleCalendarDayUrl } from "@/lib/calendar";
import type { TripItinerary, DayPlan } from "@/types";

interface ItineraryViewProps {
  itinerary: TripItinerary;
  cached?: boolean;
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function GoogleMapEmbed({ destination, locations, compact }: { destination: string; locations: string[]; compact?: boolean }) {
  const encodedDestination = encodeURIComponent(destination);

  let embedSrc: string;
  let mapsUrl: string;

  if (locations.length > 1) {
    const capped = locations.slice(0, 10);
    const [first, ...rest] = capped;
    const daddr = rest.map((l) => encodeURIComponent(l)).join("+to:");
    embedSrc = `https://maps.google.com/maps?saddr=${encodeURIComponent(first)}&daddr=${daddr}&output=embed`;
    mapsUrl = `https://www.google.com/maps/dir/${capped.map((l) => encodeURIComponent(l)).join("/")}`;
  } else {
    embedSrc = `https://maps.google.com/maps?q=${encodedDestination}&output=embed&z=11`;
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedDestination}`;
  }

  return (
    <section aria-label={`Map of ${destination}`} className="rounded-xl overflow-hidden border border-slate-100 shadow-sm">
      <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-slate-100">
        <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
          <span aria-hidden="true">🗺️</span>{" "}
          {locations.length > 1
            ? `All Locations (${locations.length > 10 ? "first 10 shown" : `${locations.length} stops`})`
            : "Destination Map"}
        </h3>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
          aria-label={`Open ${destination} in Google Maps`}
        >
          {locations.length > 1 ? "View route ↗" : "Open in Google Maps ↗"}
        </a>
      </div>
      <iframe
        title={`Google Maps view of ${destination}`}
        src={embedSrc}
        width="100%"
        height={compact ? "200" : "300"}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        aria-label={`Interactive map showing ${locations.length > 1 ? "all activity locations" : destination}`}
        className="block"
      />
      {locations.length > 1 && (
        <div className="bg-slate-50 border-t border-slate-100 px-4 py-2.5 flex flex-wrap gap-1.5">
          {locations.slice(0, 10).map((loc, i) => (
            <a
              key={i}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-full px-2 py-0.5 transition-colors"
              aria-label={`Open ${loc} on Google Maps`}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[8px] font-bold shrink-0">{i + 1}</span>
              {loc.length > 25 ? loc.slice(0, 25) + "…" : loc}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

function DaySlide({ day, date, destination }: { day: DayPlan; date: string; destination: string }) {
  const dayCalendarUrl = buildGoogleCalendarDayUrl({
    title: `Day ${day.day}: ${day.theme} — ${destination}`,
    date: day.date,
    description: day.activities.map((a) => `${a.time} — ${a.activity} at ${a.location}`).join("\n"),
  });

  const dayLocations = Array.from(new Set(day.activities.map((a) => a.location)));

  return (
    <section aria-label={`Day ${day.day}: ${day.theme}`} className="min-h-[340px]">
      {/* Slide header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-md shrink-0" aria-hidden="true">
            {day.day}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-base leading-tight">{day.theme}</h4>
            <time dateTime={day.date} className="text-[11px] text-slate-400">
              {new Date(day.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </time>
          </div>
        </div>
        <a
          href={dayCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[10px] text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors whitespace-nowrap"
          aria-label={`Add Day ${day.day} to Google Calendar`}
        >
          <CalendarIcon />
          Add day
        </a>
      </div>

      {/* Per-day map */}
      <GoogleMapEmbed
        destination={destination}
        locations={dayLocations}
        compact
      />

      {/* Activities */}
      <ol className="mt-4 space-y-3" aria-label={`Activities for day ${day.day}`}>
        {day.activities.map((activity, idx) => {
          const activityCalendarUrl = buildGoogleCalendarUrl({
            title: activity.activity,
            date: day.date,
            startTime: activity.time,
            location: activity.location,
            description: `${activity.description}${activity.tips ? `\n\nTip: ${activity.tips}` : ""}`,
          });

          return (
            <li
              key={idx}
              className="flex gap-3 bg-slate-50/80 hover:bg-indigo-50/40 border border-slate-100 hover:border-indigo-100 rounded-xl px-3 py-3 transition-colors"
            >
              {/* Time */}
              <div className="shrink-0 pt-0.5">
                <time
                  className="text-[11px] font-mono font-bold text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg block text-center min-w-[44px]"
                  dateTime={activity.time}
                >
                  {activity.time}
                </time>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-800 text-sm leading-snug">{activity.activity}</p>
                  <a
                    href={activityCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-slate-300 hover:text-indigo-500 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
                    aria-label={`Add "${activity.activity}" to Google Calendar`}
                  >
                    <CalendarIcon />
                  </a>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 hover:underline focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded transition-colors"
                  aria-label={`View ${activity.location} on Google Maps`}
                >
                  <MapPinIcon />
                  {activity.location}
                </a>

                <p className="text-xs text-slate-500 leading-relaxed">{activity.description}</p>

                {activity.tips && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg" role="note">
                    <strong>💡 Tip:</strong> {activity.tips}
                  </p>
                )}
                {activity.accessibilityNotes && (
                  <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg" role="note">
                    <strong>♿ Accessibility:</strong> {activity.accessibilityNotes}
                  </p>
                )}
                <p className="text-[10px] text-slate-400 font-medium">Est. cost: {activity.estimatedCost}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function DaySlideshow({ days, destination }: { days: TripItinerary["days"]; destination: string }) {
  const [active, setActive] = useState(0);

  const prev = useCallback(() => setActive((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setActive((i) => Math.min(days.length - 1, i + 1)), [days.length]);

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  }, [prev, next]);

  return (
    <section aria-label="Day-by-day itinerary slideshow" onKeyDown={handleKey}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
          <span aria-hidden="true">📋</span> Your Itinerary
        </h3>
        <p className="text-[10px] text-slate-400">
          Day {active + 1} of {days.length}
        </p>
      </div>

      {/* Day tab strip */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4 scrollbar-hide" role="tablist" aria-label="Select day">
        {days.map((day, i) => (
          <button
            key={day.day}
            role="tab"
            aria-selected={i === active}
            aria-controls={`day-panel-${day.day}`}
            onClick={() => setActive(i)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              i === active
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            }`}
          >
            Day {day.day}
          </button>
        ))}
      </div>

      {/* Slide panel */}
      <div
        id={`day-panel-${days[active].day}`}
        role="tabpanel"
        aria-label={`Day ${days[active].day}: ${days[active].theme}`}
        className="border border-slate-100 rounded-2xl p-4 shadow-sm bg-white relative overflow-hidden"
      >
        {/* Subtle gradient accent */}
        <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 rounded-t-2xl" />
        <div className="pt-1">
          <DaySlide day={days[active]} date={days[active].date} destination={destination} />
        </div>
      </div>

      {/* Prev / Next controls */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={prev}
          disabled={active === 0}
          aria-label="Previous day"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        >
          <ChevronLeft /> Prev
        </button>

        {/* Dot indicators */}
        <div className="flex gap-1.5" aria-hidden="true">
          {days.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-hidden="true"
              tabIndex={-1}
              className={`rounded-full transition-all ${
                i === active ? "w-5 h-2 bg-indigo-600" : "w-2 h-2 bg-slate-200 hover:bg-indigo-300"
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={active === days.length - 1}
          aria-label="Next day"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        >
          Next <ChevronRight />
        </button>
      </div>
    </section>
  );
}

export const ItineraryView = memo(function ItineraryView({ itinerary, cached }: ItineraryViewProps) {
  if (typeof window !== "undefined") {
    trackItineraryViewed(itinerary.destination, itinerary.days.length);
  }

  const allDaysCalendarUrl = itinerary.days.length > 0
    ? buildGoogleCalendarDayUrl({
        title: itinerary.tripTitle,
        date: itinerary.days[0].date,
        description: `${itinerary.tripTitle} — ${itinerary.duration}. Planned with Travel Planning & Experience Engine.`,
      })
    : null;

  return (
    <article
      aria-label={`Itinerary for ${itinerary.tripTitle}`}
      className="bg-white rounded-2xl card-shadow overflow-hidden animate-fade-in-up"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-6 pt-6 pb-8 relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
            <h2 className="text-xl font-bold text-white leading-tight">{itinerary.tripTitle}</h2>
            <div className="flex items-center gap-2 flex-shrink-0">
              {cached && (
                <span
                  className="text-[10px] font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 rounded-full px-2.5 py-1 backdrop-blur-sm"
                  aria-label="Itinerary loaded from cache"
                >
                  ⚡ Cached
                </span>
              )}
              {allDaysCalendarUrl && (
                <a
                  href={allDaysCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold bg-white/15 text-white border border-white/25 rounded-full px-3 py-1 hover:bg-white/25 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                  aria-label="Add entire trip to Google Calendar"
                >
                  <CalendarIcon />
                  Add to Calendar
                </a>
              )}
            </div>
          </div>

          <dl className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
              <span aria-hidden="true" className="text-indigo-200">📍</span>
              <dt className="sr-only">Destination</dt>
              <dd className="text-white/90 text-xs font-medium">{itinerary.destination}</dd>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
              <span aria-hidden="true" className="text-indigo-200">🗓️</span>
              <dt className="sr-only">Duration</dt>
              <dd className="text-white/90 text-xs font-medium">{itinerary.duration}</dd>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
              <span aria-hidden="true" className="text-indigo-200">💰</span>
              <dt className="sr-only">Estimated budget</dt>
              <dd className="text-white/90 text-xs font-medium">{itinerary.estimatedBudget} {itinerary.currency}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Weather */}
        {itinerary.weatherConsiderations && (
          <section aria-label="Weather and seasonal context" className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-xl px-4 py-4">
            <h3 className="text-xs font-semibold text-sky-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <span aria-hidden="true">🌤️</span> Weather & Seasonal Context
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">{itinerary.weatherConsiderations}</p>
          </section>
        )}

        {/* Day slideshow */}
        <DaySlideshow days={itinerary.days} destination={itinerary.destination} />

        {/* Travel Tips */}
        {itinerary.travelTips.length > 0 && (
          <section aria-label="Travel tips">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <span aria-hidden="true">💡</span> Travel Tips
            </h3>
            <ul className="space-y-2" role="list">
              {itinerary.travelTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5" aria-hidden="true">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Packing List */}
        {itinerary.packingList.length > 0 && (
          <section aria-label="Packing list">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <span aria-hidden="true">🎒</span> Packing List
            </h3>
            <div className="flex flex-wrap gap-2" role="list">
              {itinerary.packingList.map((item, i) => (
                <span
                  key={i}
                  role="listitem"
                  className="inline-block bg-slate-100 hover:bg-indigo-50 text-slate-700 text-xs px-3 py-1.5 rounded-full border border-slate-200 hover:border-indigo-200 transition-colors"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Emergency Contacts */}
        {itinerary.emergencyContacts.length > 0 && (
          <section aria-label="Emergency contacts" className="bg-red-50/50 border border-red-100 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
              <span aria-hidden="true">🚨</span> Emergency Contacts
            </h3>
            <ul className="space-y-1" role="list">
              {itinerary.emergencyContacts.map((contact, i) => (
                <li key={i} className="text-xs text-red-700 font-medium">{contact}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
});
