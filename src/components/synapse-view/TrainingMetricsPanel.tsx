
"use client"

import type { MetricPoint } from "@/app/page"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Expand } from "lucide-react";

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

const MetricsChartContent = ({ data, isModal = false }: { data: MetricPoint[], isModal?: boolean }) => {
  const heightClass = isModal ? "h-full" : "h-64 md:h-80";
  return (
    <ChartContainer config={chartConfig} className={`w-full ${heightClass}`}>
      <LineChart
        accessibilityLayer
        data={data}
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
          type="number"
          domain={['dataMin', 'dataMax']}
        />
        <YAxis
          yAxisId="left"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          domain={[0, (dataMax: number) => Math.max(0.1, parseFloat((dataMax * 1.1).toFixed(1)))]}
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
          isAnimationActive={false}
        />
        <Line
          dataKey="accuracy"
          type="monotone"
          stroke="var(--color-accuracy)"
          strokeWidth={2}
          dot={false}
          yAxisId="right"
          name="Accuracy"
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
};

export default function TrainingMetricsPanel({ data }: TrainingMetricsPanelProps) {
  return (
    <Dialog>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Training Metrics</CardTitle>
              <CardDescription>Loss and accuracy progression over training epochs.</CardDescription>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-auto flex-shrink-0">
                    <Expand className="h-5 w-5" />
                    <span className="sr-only">View Fullscreen</span>
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Fullscreen</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent>
          <MetricsChartContent data={data} />
        </CardContent>
      </Card>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Training Metrics</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto px-6 pb-6">
          <MetricsChartContent data={data} isModal={true} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
