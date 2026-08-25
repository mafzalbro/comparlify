import { NextResponse } from "next/server";

interface TelemetryPayload {
  toolId: string;
  category: string;
  event: "view" | "start" | "operation" | "download" | "error";
  metadata?: Record<string, any>;
}

// In-memory stats tracker for development & offline environments
const eventStatsBuffer: Array<{
  toolId: string;
  category: string;
  event: string;
  timestamp: string;
}> = [];

export async function POST(req: Request) {
  try {
    const body: TelemetryPayload = await req.json();

    if (!body.toolId || !body.event) {
      return NextResponse.json(
        { error: "toolId and event are required" },
        { status: 400 }
      );
    }

    const record = {
      toolId: body.toolId,
      category: body.category || "general",
      event: body.event,
      timestamp: new Date().toISOString(),
    };

    // Buffer event in memory (up to 1000 items)
    eventStatsBuffer.push(record);
    if (eventStatsBuffer.length > 1000) {
      eventStatsBuffer.shift();
    }

    return NextResponse.json({
      success: true,
      tracked: record,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process telemetry payload" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Simple aggregated breakdown by tool
  const summary: Record<string, Record<string, number>> = {};

  for (const item of eventStatsBuffer) {
    if (!summary[item.toolId]) {
      summary[item.toolId] = { view: 0, operation: 0, download: 0, error: 0 };
    }
    summary[item.toolId][item.event] = (summary[item.toolId][item.event] || 0) + 1;
  }

  return NextResponse.json({
    totalEvents: eventStatsBuffer.length,
    summary,
  });
}
