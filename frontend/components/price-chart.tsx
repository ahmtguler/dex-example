"use client"

import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A line chart"

const chartData = [
  { time: " 21:04 ", THB: 186 },
  { time: " 21:05 ", THB: 305 },
  { time: " 21:06 ", THB: 237 },
  { time: " 21:07 ", THB: 73 },
  { time: " 21:08 ", THB: 209 },
  { time: " 21:09 ", THB: 214 },
  { time: " 21:10 ", THB: 186 },
  { time: " 21:11 ", THB: 305 },
  { time: " 21:12 ", THB: 237 },
  { time: " 21:13 ", THB: 73 },
  { time: " 21:14 ", THB: 209 },
  { time: " 21:15 ", THB: 214 },
  { time: " 21:16 ", THB: 186 },
  { time: " 21:17 ", THB: 305 },
  { time: " 21:18 ", THB: 237 },
  { time: " 21:04 ", THB: 186 },
  { time: " 21:05 ", THB: 305 },
  { time: " 21:06 ", THB: 237 },
  { time: " 21:07 ", THB: 73 },
  { time: " 21:08 ", THB: 209 },
  { time: " 21:09 ", THB: 214 },
  { time: " 21:10 ", THB: 186 },
  { time: " 21:11 ", THB: 305 },
  { time: " 21:12 ", THB: 237 },
  { time: " 21:13 ", THB: 73 },
  { time: " 21:14 ", THB: 209 },
  { time: " 21:15 ", THB: 214 },
  { time: " 21:16 ", THB: 186 },
  { time: " 21:17 ", THB: 305 },
  { time: " 21:18 ", THB: 237 },
  { time: " 21:05 ", THB: 305 },
  { time: " 21:06 ", THB: 237 },
  { time: " 21:07 ", THB: 73 },
  { time: " 21:08 ", THB: 209 },
  { time: " 21:09 ", THB: 214 },
  { time: " 21:10 ", THB: 186 },
  { time: " 21:11 ", THB: 305 },
  { time: " 21:12 ", THB: 237 },
  { time: " 21:13 ", THB: 73 },
  { time: " 21:14 ", THB: 209 },
  { time: " 21:15 ", THB: 214 },
  { time: " 21:16 ", THB: 186 },
  { time: " 21:17 ", THB: 305 },
  { time: " 21:18 ", THB: 237 },
  { time: " 21:05 ", THB: 305 },
  { time: " 21:06 ", THB: 237 },
  { time: " 21:07 ", THB: 73 },
  { time: " 21:08 ", THB: 209 },
  { time: " 21:09 ", THB: 214 },
  { time: " 21:10 ", THB: 186 },
  { time: " 21:11 ", THB: 305 },
  { time: " 21:12 ", THB: 237 },
  { time: " 21:13 ", THB: 73 },
  { time: " 21:14 ", THB: 209 },
  { time: " 21:15 ", THB: 214 },
  { time: " 21:16 ", THB: 186 },
  { time: " 21:17 ", THB: 305 },
  { time: " 21:18 ", THB: 237 },
  { time: " 21:05 ", THB: 305 },
  { time: " 21:06 ", THB: 237 },
  { time: " 21:07 ", THB: 73 },
  { time: " 21:08 ", THB: 209 },
  { time: " 21:09 ", THB: 214 },
  { time: " 21:10 ", THB: 186 },
  { time: " 21:11 ", THB: 305 },
  { time: " 21:12 ", THB: 237 },
  { time: " 21:13 ", THB: 73 },
  { time: " 21:14 ", THB: 209 },
  { time: " 21:15 ", THB: 214 },
  { time: " 21:16 ", THB: 186 },
  { time: " 21:17 ", THB: 305 },
  { time: " 21:18 ", THB: 237 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function PriceChart() {

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>TVER / THB</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 2,
              right: 2,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent hideLabel hideIndicator />}
            />
            <Line
              dataKey="THB"
              type="natural"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
