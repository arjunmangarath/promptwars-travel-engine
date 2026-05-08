/**
 * Structured logging utility for Google Cloud Logging.
 * Emits JSON-formatted entries that Cloud Logging picks up automatically
 * when running on Cloud Run (stdout = structured log ingestion).
 * @see https://cloud.google.com/logging/docs/structured-logging
 */

type LogLevel = "DEBUG" | "INFO" | "WARNING" | "ERROR";

interface LogEntry {
  severity: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  [key: string]: unknown;
}

/**
 * Writes a structured JSON log entry to stdout/stderr.
 * Cloud Run captures stdout and forwards it to Cloud Logging automatically.
 *
 * @param level - Log severity level
 * @param message - Human-readable log message
 * @param data - Additional structured fields for filtering/searching in Cloud Logging
 */
export function log(
  level: LogLevel,
  message: string,
  data?: Record<string, unknown>
): void {
  const entry: LogEntry = {
    severity: level,
    message,
    timestamp: new Date().toISOString(),
    ...data,
  };

  const line = JSON.stringify(entry);
  if (level === "ERROR" || level === "WARNING") {
    console.error(line);
  } else {
    console.log(line);
  }
}

/** Shorthand for INFO-level log entries. */
export const logInfo = (msg: string, data?: Record<string, unknown>) =>
  log("INFO", msg, data);

/** Shorthand for WARNING-level log entries. */
export const logWarn = (msg: string, data?: Record<string, unknown>) =>
  log("WARNING", msg, data);

/** Shorthand for ERROR-level log entries. */
export const logError = (msg: string, data?: Record<string, unknown>) =>
  log("ERROR", msg, data);
