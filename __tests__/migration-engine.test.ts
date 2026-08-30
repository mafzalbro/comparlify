import { describe, it, expect } from "vitest";
import { calculateMigrationAnalysis } from "@/lib/migration-engine";

describe("Migration Engine", () => {
  it("calculates lower effort and risk for newsletter to newsletter transitions", () => {
    const source = { name: "Substack" };
    const target = { name: "Ghost" };

    const analysis = calculateMigrationAnalysis(source, target);

    expect(analysis.estimatedHours).toBe(4);
    expect(analysis.overallRisk).toBe("LOW");
    expect(analysis.subscriberChurnRisk).toBe("LOW");
    expect(analysis.keySteps).toHaveLength(4);
  });

  it("calculates medium effort and risk for LMS to LMS transitions", () => {
    const source = { name: "Teachable" };
    const target = { name: "Kajabi" };

    const analysis = calculateMigrationAnalysis(source, target);

    expect(analysis.estimatedHours).toBe(12);
    expect(analysis.overallRisk).toBe("MEDIUM");
    expect(analysis.subscriberChurnRisk).toBe("MEDIUM");
  });

  it("calculates higher effort and risk for cross-category complex transitions", () => {
    const source = { name: "Custom WordPress" };
    const target = { name: "Kajabi" };

    const analysis = calculateMigrationAnalysis(source, target);

    expect(analysis.estimatedHours).toBe(20);
    expect(analysis.overallRisk).toBe("HIGH");
  });
});
