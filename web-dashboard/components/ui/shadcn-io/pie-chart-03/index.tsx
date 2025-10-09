"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A pie chart showing fraud vs valid transactions";

const chartConfig = {
  transactions: {
    label: "Transactions",
  },
  fraud: {
    label: "Fraud",
    color: "#ef4444", // Direct red color for fraud
  },
  valid: {
    label: "Valid",
    color: "#3b82f6", // Direct blue color for valid
  },
} satisfies ChartConfig;

interface ChartPieLabelProps {
  fraudCount: number;
  validCount: number;
}

export function ChartPieLabel({
  fraudCount = 0,
  validCount = 0,
}: ChartPieLabelProps) {
  const totalTransactions = fraudCount + validCount;

  // Don't show chart if no data
  if (totalTransactions === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center">
        <div className="text-gray-400 text-sm">
          No transaction data available
        </div>
        <div className="text-xs text-gray-300 mt-1">
          Start streaming to see fraud analysis
        </div>
      </div>
    );
  }

  const chartData = [
    {
      type: "fraud",
      count: fraudCount,
      fill: "#ef4444", // Direct red color
      percentage: ((fraudCount / totalTransactions) * 100).toFixed(1),
    },
    {
      type: "valid",
      count: validCount,
      fill: "#3b82f6", // Direct blue color
      percentage: ((validCount / totalTransactions) * 100).toFixed(1),
    },
  ].filter((item) => item.count > 0); // Only show segments with data

  return (
    <div className="w-full flex flex-col">
      <div className="flex-1 flex items-center justify-center min-h-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground aspect-square w-40 h-40 px-5"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => [
                    `${value} transactions`,
                    name === "fraud" ? "Fraudulent" : "Valid",
                  ]}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="type"
              label={({ percentage }: any) => `${percentage}%`}
              labelLine={false}
              strokeWidth={2}
              stroke="white"
            />
          </PieChart>
        </ChartContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#ef4444" }}
          ></div>
          <span className="font-medium">Fraud ({fraudCount})</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#3b82f6" }}
          ></div>
          <span className="font-medium">Valid ({validCount})</span>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        <div>Total: {totalTransactions} transactions</div>
        {fraudCount > 0 && (
          <div className="text-red-600 font-medium">
            {((fraudCount / totalTransactions) * 100).toFixed(1)}% fraud rate
          </div>
        )}
      </div>
    </div>
  );
}
