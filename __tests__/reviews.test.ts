import { describe, it, expect } from "vitest";
import { createProvenanceRecord } from "@/lib/data-sources/provenance";

describe("Data Sources & Provenance Engine", () => {
  it("creates valid provenance records for first party creator reviews", () => {
    const record = createProvenanceRecord(
      "Creator switched from Substack to Ghost due to 0% take fees",
      "First-Party Submission",
      "FIRST_PARTY",
      "https://comparlify.com/platform/ghost",
      "HIGH"
    );

    expect(record.sourceType).toBe("FIRST_PARTY");
    expect(record.confidence).toBe("HIGH");
    expect(record.retrievedAt).toBeDefined();
  });

  it("identifies seed reviews and flags them with non-contributing verification notes", () => {
    const record = createProvenanceRecord(
      "Initial baseline review",
      "Seed Generator",
      "SEED",
      undefined,
      "BASIC"
    );

    expect(record.sourceType).toBe("SEED");
    expect(record.verificationNotes).toContain("excluded from public aggregate rating math");
  });
});
