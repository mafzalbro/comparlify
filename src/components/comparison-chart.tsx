"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import React from "react";

interface ComparisonChartProps {
  chartData: any[];
  chartConfig: ChartConfig;
  platformAName: string;
  platformBName: string;
}

export const ComparisonChart = React.memo(function ComparisonChart({
  chartData,
  chartConfig,
  platformAName,
  platformBName,
}: ComparisonChartProps) {
  return (
    // 1. FIXED HEIGHT: h-[350px] guarantees Recharts has a concrete size to render
    <ChartContainer config={chartConfig} className="w-full h-[350px]">
      <BarChart
        data={chartData}
        accessibilityLayer
        // 2. MARGINS: Pushes the chart up so the legend doesn't get cut off
        margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          domain={[0, 5]}
          tickCount={6}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
        />

        {/* 3. SHADCN TOOLTIP: Using ChartTooltip instead of Recharts Tooltip */}
        <ChartTooltip content={<ChartTooltipContent />} />

        <Legend
          wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}
          iconType="circle"
        />

        {/* 4. EXACT COLOR MATCH: Uses the exact string (e.g., --color-HeyGen) */}
        <Bar
          dataKey={platformAName}
          fill={`var(--color-${platformAName})`}
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey={platformBName}
          fill={`var(--color-${platformBName})`}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
});
