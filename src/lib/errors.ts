/**
 * Domain-specific error hierarchy for the Travel Planning Engine.
 * Typed errors allow callers to handle specific failure modes
 * without parsing error message strings.
 */

/** Base class for all application errors. Carries an HTTP status code. */
export class AppError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    // Maintain proper prototype chain in transpiled TypeScript
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when user-supplied request data fails schema validation.
 * Maps to HTTP 400 Bad Request.
 */
export class ValidationError extends AppError {
  readonly details: string;

  constructor(message: string, details: string) {
    super(message, 400);
    this.details = details;
  }
}

/**
 * Thrown when the AI model fails to generate a valid itinerary after all retries.
 * Maps to HTTP 502 Bad Gateway.
 */
export class GenerationError extends AppError {
  constructor(message: string, cause?: Error) {
    super(message, 502);
    if (cause) this.cause = cause;
  }
}

/**
 * Thrown when a required external service (Firestore, Vertex AI) is unavailable.
 * Maps to HTTP 503 Service Unavailable.
 */
export class ServiceUnavailableError extends AppError {
  readonly service: string;

  constructor(service: string, cause?: Error) {
    super(`Service unavailable: ${service}`, 503);
    this.service = service;
    if (cause) this.cause = cause;
  }
}

/**
 * Thrown when the rate limit for a client IP is exceeded.
 * Maps to HTTP 429 Too Many Requests.
 */
export class RateLimitError extends AppError {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super("Too many requests. Please wait before generating a new itinerary.", 429);
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/** Type guard — returns true when `err` is an AppError instance. */
export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
