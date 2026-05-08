import { memo } from "react";
import { trackItineraryViewed } from "@/lib/analytics";
import { buildGoogleCalendarUrl, buildGoogleCalendarDayUrl } from "@/lib/calendar";
import type { TripItinerary } from "@/types";

interface ItineraryViewProps {
  itinerary: TripItinerary;
  cached?: boolean;
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function GoogleMapEmbed({ destination }: { destination: string }) {
  const encodedDestination = encodeURIComponent(destination);
  const embedSrc = `https://maps.google.com/maps?q=${encodedDestination}&output=embed&z=11`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedDestination}`;

  return (
    <section aria-label={`Map of ${destination}`} className="rounded-xl overflow-hidden border border-slate-200">
      <div className="bg-slate-50 px-4 py-2 flex items-center justify-between border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <span aria-hidden="true">🗺️</span> Destination Map
        </h3>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label={`Open ${destination} in Google Maps`}
        >
          Open in Google Maps ↗
        </a>
      </div>
      <iframe
        title={`Google Maps view of ${destination}`}
        src={embedSrc}
        width="100%"
        height="280"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        aria-label={`Interactive map showing ${destination}`}
        className="block"
      />
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
      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-8"
    >
      <header className="border-b border-slate-100 pb-6">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <h2 className="text-2xl font-bold text-slate-900">{itinerary.tripTitle}</h2>
          <div className="flex items-center gap-2">
            {cached && (
              <span
                className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5"
                aria-label="Itinerary loaded from cache"
              >
                Cached
              </span>
            )}
            {allDaysCalendarUrl && (
              <a
                href={allDaysCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Add entire trip to Google Calendar"
              >
                <CalendarIcon />
                Add trip to Google Calendar
              </a>
            )}
          </div>
        </div>
        <dl className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
          <div>
            <dt className="sr-only">Destination</dt>
            <dd className="flex items-center gap-1">
              <span aria-hidden="true">📍</span> {itinerary.destination}
            </dd>
          </div>
          <div>
            <dt className="sr-only">Duration</dt>
            <dd className="flex items-center gap-1">
              <span aria-hidden="true">🗓️</span> {itinerary.duration}
            </dd>
          </div>
          <div>
            <dt className="sr-only">Estimated budget</dt>
            <dd className="flex items-center gap-1">
              <span aria-hidden="true">💰</span> {itinerary.estimatedBudget} {itinerary.currency}
            </dd>
          </div>
        </dl>
      </header>

      {/* Google Maps embed — powered by Google Maps */}
      <GoogleMapEmbed destination={itinerary.destination} />

      <section aria-label="Day-by-day itinerary">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Your Itinerary</h3>
        <div className="space-y-6">
          {itinerary.days.map((day) => {
            const dayCalendarUrl = buildGoogleCalendarDayUrl({
              title: `Day ${day.day}: ${day.theme} — ${itinerary.destination}`,
              date: day.date,
              description: day.activities.map((a) => `${a.time} — ${a.activity} at ${a.location}`).join("\n"),
            });

            return (
              <section
                key={day.day}
                aria-label={`Day ${day.day}: ${day.theme}`}
                className="border border-slate-100 rounded-xl overflow-hidden"
              >
                <header className="bg-blue-50 px-4 py-3 flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-blue-900">
                    Day {day.day} — {day.theme}
                  </h4>
                  <div className="flex items-center gap-3">
                    <time dateTime={day.date} className="text-xs text-blue-700">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    <a
                      href={dayCalendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                      aria-label={`Add Day ${day.day} to Google Calendar`}
                    >
                      <CalendarIcon />
                      <span className="hidden sm:inline">Add to Calendar</span>
                    </a>
                  </div>
                </header>

                <ol className="divide-y divide-slate-100" aria-label={`Activities for day ${day.day}`}>
                  {day.activities.map((activity, idx) => {
                    const activityCalendarUrl = buildGoogleCalendarUrl({
                      title: activity.activity,
                      date: day.date,
                      startTime: activity.time,
                      location: activity.location,
                      description: `${activity.description}${activity.tips ? `\n\nTip: ${activity.tips}` : ""}`,
                    });

                    return (
                      <li key={idx} className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          <time
                            className="text-xs font-mono text-slate-500 mt-0.5 shrink-0 w-12"
                            dateTime={activity.time}
                          >
                            {activity.time}
                          </time>
                          <div className="space-y-1 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-slate-800">{activity.activity}</p>
                              <a
                                href={activityCalendarUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                                aria-label={`Add "${activity.activity}" to Google Calendar`}
                              >
                                <CalendarIcon />
                              </a>
                            </div>
                            <p className="text-sm text-slate-500">
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-600 hover:underline focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                                aria-label={`View ${activity.location} on Google Maps`}
                              >
                                {activity.location}
                              </a>
                            </p>
                            <p className="text-sm text-slate-600">{activity.description}</p>
                            {activity.tips && (
                              <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded" role="note">
                                <span className="font-medium">Tip:</span> {activity.tips}
                              </p>
                            )}
                            {activity.accessibilityNotes && (
                              <p className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded" role="note">
                                <span className="font-medium">Accessibility:</span> {activity.accessibilityNotes}
                              </p>
                            )}
                            <p className="text-xs text-slate-400">Est. cost: {activity.estimatedCost}</p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>
      </section>

      {itinerary.travelTips.length > 0 && (
        <section aria-label="Travel tips">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Travel Tips</h3>
          <ul className="space-y-2" role="list">
            {itinerary.travelTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span aria-hidden="true" className="text-blue-500 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </section>
      )}

      {itinerary.packingList.length > 0 && (
        <section aria-label="Packing list">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Packing List</h3>
          <ul className="flex flex-wrap gap-2" role="list">
            {itinerary.packingList.map((item, i) => (
              <li key={i}>
                <span className="inline-block bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {itinerary.emergencyContacts.length > 0 && (
        <section aria-label="Emergency contacts">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Emergency Contacts</h3>
          <ul className="space-y-1" role="list">
            {itinerary.emergencyContacts.map((contact, i) => (
              <li key={i} className="text-sm text-slate-600">{contact}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
});
