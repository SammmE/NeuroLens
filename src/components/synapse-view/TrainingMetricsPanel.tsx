
"use client"

import type { MetricPoint } from "@/app/page"; // Import the MetricPoint type
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

// chartData is now passed as a prop

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

interface TrainingMetricsPanelProps {
  data: MetricPoint[];
}

export default function TrainingMetricsPanel({ data }: TrainingMetricsPanelProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Training Metrics</CardTitle>
        <CardDescription>Loss and accuracy progression over training epochs.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-64 md:h-80">
          <LineChart
            accessibilityLayer
            data={data} // Use data from props
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
              type="number" // Ensure XAxis treats time as a number for proper scaling
              domain={['dataMin', 'dataMax']} // Allow dynamic domain based on time values
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, (dataMax: number) => Math.max(1, (dataMax * 1.1).toFixed(1))]} // Dynamic domain for loss
              tickFormatter={(value) => value.toFixed(2)}
              allowDataOverflow={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, 1]}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              allowDataOverflow={false}
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
              isAnimationActive={false} // Disable animation for smoother live updates
            />
            <Line
              dataKey="accuracy"
              type="monotone"
              stroke="var(--color-accuracy)"
              strokeWidth={2}
              dot={false}
              yAxisId="right"
              name="Accuracy"
              isAnimationActive={false} // Disable animation for smoother live updates
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
