/**
 * Client-side Telemetry Helper for Comparlify Tools
 * Privacy-first event tracking for tool usage performance & conversions.
 */

export type ToolEventType = "view" | "start" | "operation" | "download" | "error";

export interface TrackToolEventParams {
  toolId: string;
  category?: string;
  event: ToolEventType;
  metadata?: Record<string, any>;
}

export async function trackToolEvent({
  toolId,
  category = "general",
  event,
  metadata,
}: TrackToolEventParams): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    await fetch("/api/telemetry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        toolId,
        category,
        event,
        metadata,
      }),
    }).catch(() => {
      // Silently fail to ensure telemetry errors never interrupt user workflow
    });
  } catch (err) {
    // Ignore errors
  }
}
