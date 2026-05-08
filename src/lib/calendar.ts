/**
 * Generates Google Calendar event URLs using the Calendar API URL scheme.
 * Opens Google Calendar with a pre-filled event — no OAuth required.
 * Ref: https://calendar.google.com/calendar/render?action=TEMPLATE
 */

function toCalendarDate(date: string, time: string): string {
  // Combines YYYY-MM-DD + HH:MM into YYYYMMDDTHHMMSS format
  const [year, month, day] = date.split("-");
  const [hour, minute] = time.split(":");
  return `${year}${month}${day}T${hour}${minute}00`;
}

function addHour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const newH = (h + 1) % 24;
  return `${String(newH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export interface CalendarEventOptions {
  title: string;
  date: string;        // YYYY-MM-DD
  startTime: string;   // HH:MM
  location?: string;
  description?: string;
}

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

export function buildGoogleCalendarDayUrl(opts: {
  title: string;
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
