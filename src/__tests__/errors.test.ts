import {
  AppError,
  ValidationError,
  GenerationError,
  ServiceUnavailableError,
  RateLimitError,
  isAppError,
} from "@/lib/errors";

describe("AppError", () => {
  it("sets name to class name", () => {
    const err = new AppError("base error");
    expect(err.name).toBe("AppError");
  });

  it("defaults statusCode to 500", () => {
    const err = new AppError("oops");
    expect(err.statusCode).toBe(500);
  });

  it("accepts a custom statusCode", () => {
    const err = new AppError("not found", 404);
    expect(err.statusCode).toBe(404);
  });

  it("is an instance of Error", () => {
    expect(new AppError("x")).toBeInstanceOf(Error);
  });

  it("carries the message", () => {
    const err = new AppError("test message");
    expect(err.message).toBe("test message");
  });
});

describe("ValidationError", () => {
  it("has statusCode 400", () => {
    const err = new ValidationError("bad input", "destination too short");
    expect(err.statusCode).toBe(400);
  });

  it("stores the details field", () => {
    const err = new ValidationError("Invalid params", "field: required");
    expect(err.details).toBe("field: required");
  });

  it("is an instance of AppError", () => {
    expect(new ValidationError("x", "y")).toBeInstanceOf(AppError);
  });

  it("sets name to ValidationError", () => {
    expect(new ValidationError("x", "y").name).toBe("ValidationError");
  });
});

describe("GenerationError", () => {
  it("has statusCode 502", () => {
    const err = new GenerationError("model failed");
    expect(err.statusCode).toBe(502);
  });

  it("is an instance of AppError", () => {
    expect(new GenerationError("x")).toBeInstanceOf(AppError);
  });

  it("attaches cause when provided", () => {
    const cause = new Error("underlying cause");
    const err = new GenerationError("wrapper", cause);
    expect(err.cause).toBe(cause);
  });

  it("works without a cause", () => {
    expect(() => new GenerationError("no cause")).not.toThrow();
  });
});

describe("ServiceUnavailableError", () => {
  it("has statusCode 503", () => {
    const err = new ServiceUnavailableError("Firestore");
    expect(err.statusCode).toBe(503);
  });

  it("stores the service name", () => {
    const err = new ServiceUnavailableError("Vertex AI");
    expect(err.service).toBe("Vertex AI");
  });

  it("includes service name in message", () => {
    const err = new ServiceUnavailableError("Firebase");
    expect(err.message).toContain("Firebase");
  });
});

describe("RateLimitError", () => {
  it("has statusCode 429", () => {
    const err = new RateLimitError(30);
    expect(err.statusCode).toBe(429);
  });

  it("stores retryAfterSeconds", () => {
    const err = new RateLimitError(45);
    expect(err.retryAfterSeconds).toBe(45);
  });

  it("message mentions waiting", () => {
    const err = new RateLimitError(10);
    expect(err.message.toLowerCase()).toContain("too many requests");
  });
});

describe("isAppError", () => {
  it("returns true for AppError instances", () => {
    expect(isAppError(new AppError("x"))).toBe(true);
  });

  it("returns true for subclass instances", () => {
    expect(isAppError(new ValidationError("x", "y"))).toBe(true);
    expect(isAppError(new GenerationError("x"))).toBe(true);
    expect(isAppError(new RateLimitError(10))).toBe(true);
  });

  it("returns false for plain Error", () => {
    expect(isAppError(new Error("plain"))).toBe(false);
  });

  it("returns false for null", () => {
    expect(isAppError(null)).toBe(false);
  });

  it("returns false for string", () => {
    expect(isAppError("not an error")).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isAppError(undefined)).toBe(false);
  });
});
