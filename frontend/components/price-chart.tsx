"use client"

import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { readableAmount } from "@/utils/readableAmount"

export const description = "A line chart"

export interface Price {
  price: string;
  timestamp: string;
}

export interface Volume {
  thbAmount: string;
  timestamp: string;
}

interface PriceChartProps {

  prices: Price[];

  volumes: Volume[];

}
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const sevenHours = 7 * 3600;
const day = 24 * 3600;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PriceChart: React.FC<PriceChartProps> = ({ prices, volumes }) => {
  const chartData = prices.map((price) => ({
    time: (' ' + Math.floor(((Number(price.timestamp) + sevenHours) % day) / 3600) + ':' + (Math.floor((Number(price.timestamp)) % 3600 / 60) < 10 ? '0' + Math.floor((Number(price.timestamp)) % 3600 / 60) : Math.floor((Number(price.timestamp)) % 3600 / 60)) + ' '),
    THB: (Number(price.price) / 1e4).toFixed(2),
  }))

  let totalVolume = 0n;
  for (const volume of volumes) {
    totalVolume += BigInt(volume.thbAmount);
  }


  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>TVER / THB</CardTitle>
        <CardDescription>Total Volume Last 2 Hours: {readableAmount(totalVolume, 2)} THB</CardDescription>
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
