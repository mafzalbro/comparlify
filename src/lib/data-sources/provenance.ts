export type ProvenanceSourceType =
  | "FIRST_PARTY"
  | "OFFICIAL_API"
  | "PARTNER"
  | "PUBLIC_PAGE"
  | "MANUAL_RESEARCH"
  | "SEED";

export interface EvidenceProvenance {
  claim: string;
  sourceName: string;
  sourceType: ProvenanceSourceType;
  sourceUrl?: string;
  retrievedAt: string; // ISO string
  verifiedAt: string; // ISO string
  confidence: "HIGH" | "MODERATE" | "BASIC";
  verificationNotes?: string;
}

/**
 * Normalizes provenance metadata for evidence tracking across Comparlify.
 */
export function createProvenanceRecord(
  claim: string,
  sourceName: string,
  sourceType: ProvenanceSourceType,
  sourceUrl?: string,
  confidence: "HIGH" | "MODERATE" | "BASIC" = "HIGH"
): EvidenceProvenance {
  const nowStr = new Date().toISOString();

  return {
    claim,
    sourceName,
    sourceType,
    sourceUrl,
    retrievedAt: nowStr,
    verifiedAt: nowStr,
    confidence,
    verificationNotes: sourceType === "SEED"
      ? "Seed fixture for testing/initialization; excluded from public aggregate rating math."
      : `Verified via ${sourceType.toLowerCase().replace("_", " ")} adapter.`
  };
}
