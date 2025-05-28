"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

const chartData = [
    { time: 0, loss: 1.0, accuracy: 0.1 },
    { time: 1, loss: 0.85, accuracy: 0.25 },
    { time: 2, loss: 0.65, accuracy: 0.45 },
    { time: 3, loss: 0.4, accuracy: 0.72 },
    { time: 4, loss: 0.22, accuracy: 0.88 },
    { time: 5, loss: 0.1, accuracy: 0.95 },
];

const chartConfig = {
    loss: {
        label: "Loss",
        color: "hsl(var(--chart-1))",
    },
    accuracy: {
        label: "Accuracy",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

export default function TrainingMetricsPanel() {
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Training Metrics</CardTitle>
                <CardDescription>
                    Loss and accuracy progression over training epochs.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="w-full h-64 md:h-80">
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 10,
                            left: 10,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="time"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `Epoch ${value}`}
                        />
                        <YAxis
                            yAxisId="left"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            domain={[0, "dataMax + 0.1"]}
                            tickFormatter={(value) => value.toFixed(2)}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            domain={[0, 1]}
                            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line
                            dataKey="loss"
                            type="monotone"
                            stroke="var(--color-loss)"
                            strokeWidth={2}
                            dot={false}
                            yAxisId="left"
                            name="Loss"
                        />
                        <Line
                            dataKey="accuracy"
                            type="monotone"
                            stroke="var(--color-accuracy)"
                            strokeWidth={2}
                            dot={false}
                            yAxisId="right"
                            name="Accuracy"
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
