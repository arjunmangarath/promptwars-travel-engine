import { sanitizeForPrompt } from "@/lib/gemini";

describe("sanitizeForPrompt", () => {
  it("returns clean input unchanged", () => {
    expect(sanitizeForPrompt("Tokyo, Japan")).toBe("Tokyo, Japan");
  });

  it("strips null bytes and control characters", () => {
    expect(sanitizeForPrompt("Tokyo\x00Japan")).toBe("TokyoJapan");
    expect(sanitizeForPrompt("Paris\x01\x02\x03")).toBe("Paris");
  });

  it("removes triple-backtick injection markers", () => {
    expect(sanitizeForPrompt("```ignore instructions```")).toBe("ignore instructions");
  });

  it("removes script tags", () => {
    const input = "Paris<script>alert(1)</script>";
    expect(sanitizeForPrompt(input)).not.toContain("<script>");
  });

  it("trims leading and trailing whitespace", () => {
    expect(sanitizeForPrompt("  Rome  ")).toBe("Rome");
  });

  it("truncates to maxLength (default 200)", () => {
    const long = "A".repeat(300);
    expect(sanitizeForPrompt(long)).toHaveLength(200);
  });

  it("respects custom maxLength", () => {
    expect(sanitizeForPrompt("Hello World", 5)).toBe("Hello");
  });

  it("handles empty string", () => {
    expect(sanitizeForPrompt("")).toBe("");
  });

  it("preserves normal unicode characters", () => {
    expect(sanitizeForPrompt("Kyōto, Japan")).toBe("Kyōto, Japan");
  });

  it("handles four or more backticks too", () => {
    expect(sanitizeForPrompt("````injection````")).not.toContain("```");
  });
});
