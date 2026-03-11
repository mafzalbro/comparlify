"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ComparisonChartProps {
  chartData: any[];
  chartConfig: ChartConfig;
  platformAName: string;
  platformBName: string;
}

import React from "react";

export const ComparisonChart = React.memo(function ComparisonChart({
  chartData,
  chartConfig,
  platformAName,
  platformBName,
}: ComparisonChartProps) {
  return (
    <ChartContainer config={chartConfig} className="w-full h-80">
      <BarChart data={chartData} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis domain={[0, 5]} />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend />
        <Bar dataKey={platformAName} fill="var(--color-platformA)" radius={4} />
        <Bar dataKey={platformBName} fill="var(--color-platformB)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
});
