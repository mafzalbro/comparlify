
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PostsChartProps {
    data: { date: string; posts: number }[];
}

export function PostsChart({ data }: PostsChartProps) {
  return (
    <Card className="rounded-[2.5rem] border border-border/10 bg-card/40 backdrop-blur-xl shadow-sm overflow-hidden">
        <CardHeader className="pb-6">
            <CardTitle className="text-xl font-black tracking-tight">Post Momentum</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                />
                <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                allowDecimals={false}
                />
                <Bar dataKey="posts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
  )
}
