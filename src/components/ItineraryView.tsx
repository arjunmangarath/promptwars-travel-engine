import type { TripItinerary } from "@/types";

interface ItineraryViewProps {
  itinerary: TripItinerary;
}

export function ItineraryView({ itinerary }: ItineraryViewProps) {
  return (
    <article
      aria-label={`Itinerary for ${itinerary.tripTitle}`}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-8"
    >
      <header className="border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-900">{itinerary.tripTitle}</h2>
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

      <section aria-label="Day-by-day itinerary">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Your Itinerary</h3>
        <div className="space-y-6">
          {itinerary.days.map((day) => (
            <section
              key={day.day}
              aria-label={`Day ${day.day}: ${day.theme}`}
              className="border border-slate-100 rounded-xl overflow-hidden"
            >
              <header className="bg-blue-50 px-4 py-3 flex items-center justify-between">
                <h4 className="font-semibold text-blue-900">
                  Day {day.day} — {day.theme}
                </h4>
                <time dateTime={day.date} className="text-xs text-blue-700">
                  {new Date(day.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              </header>
              <ol className="divide-y divide-slate-100" aria-label={`Activities for day ${day.day}`}>
                {day.activities.map((activity, idx) => (
                  <li key={idx} className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <time
                        className="text-xs font-mono text-slate-500 mt-0.5 shrink-0 w-12"
                        dateTime={activity.time}
                      >
                        {activity.time}
                      </time>
                      <div className="space-y-1 flex-1">
                        <p className="font-medium text-slate-800">{activity.activity}</p>
                        <p className="text-sm text-slate-500">{activity.location}</p>
                        <p className="text-sm text-slate-600">{activity.description}</p>
                        {activity.tips && (
                          <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                            <span className="font-medium">Tip:</span> {activity.tips}
                          </p>
                        )}
                        {activity.accessibilityNotes && (
                          <p className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                            <span className="font-medium">Accessibility:</span> {activity.accessibilityNotes}
                          </p>
                        )}
                        <p className="text-xs text-slate-400">Est. cost: {activity.estimatedCost}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
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
}
