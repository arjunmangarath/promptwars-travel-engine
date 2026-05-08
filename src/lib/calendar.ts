/**
 * Google Calendar event URL builder using the Calendar API URL scheme.
 * Opens Google Calendar pre-filled with event details — no OAuth required.
 * @see https://calendar.google.com/calendar/render?action=TEMPLATE
 */

/** Converts YYYY-MM-DD + HH:MM into YYYYMMDDTHHMMSS (Calendar API format). */
function toCalendarDate(date: string, time: string): string {
  const [year, month, day] = date.split("-");
  const [hour, minute] = time.split(":");
  return `${year}${month}${day}T${hour}${minute}00`;
}

/** Returns a time string one hour ahead, wrapping midnight correctly. */
function addHour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const newH = (h + 1) % 24;
  return `${String(newH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export interface CalendarEventOptions {
  title: string;
  /** ISO date string in YYYY-MM-DD format */
  date: string;
  /** 24-hour time in HH:MM format */
  startTime: string;
  location?: string;
  description?: string;
}

/**
 * Builds a Google Calendar URL for a timed activity event (1-hour default duration).
 * @param opts - Event options including title, date, start time, and optional location/description
 * @returns Full Google Calendar render URL that pre-fills the event creation form
 */
export function buildGoogleCalendarUrl(opts: CalendarEventOptions): string {
  const start = toCalendarDate(opts.date, opts.startTime);
  const end = toCalendarDate(opts.date, addHour(opts.startTime));

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${start}/${end}`,
    ...(opts.location && { location: opts.location }),
    ...(opts.description && { details: opts.description }),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Builds a Google Calendar URL for an all-day event (full trip day or entire trip).
 * @param opts - Event options including title, date, and optional description
 * @returns Full Google Calendar render URL that pre-fills an all-day event
 */
export function buildGoogleCalendarDayUrl(opts: {
  title: string;
  /** ISO date string in YYYY-MM-DD format */
  date: string;
  description?: string;
}): string {
  const [year, month, day] = opts.date.split("-");
  const dateStr = `${year}${month}${day}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${dateStr}/${dateStr}`,
    ...(opts.description && { details: opts.description }),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
