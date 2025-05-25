"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isToday, isThisYear } from "date-fns";

type CashLineChartProps = {
  chartData: { date: string; balance: number }[];
};

export default function CashLineChart({ chartData }: CashLineChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Verlauf</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[255px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ left: 12, right: 12, top: 10, bottom: 10 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  if (isToday(date)) return format(date, "HH:mm");
                  if (isThisYear(date)) return format(date, "dd.MM");
                  return format(date, "dd.MM.yy");
                }}
              />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                }}
                formatter={(value: unknown) => [`${value} €`, "Kontostand"]}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return format(date, "dd.MM.yyyy HH:mm");
                }}
              />
              <Line
                dataKey="balance"
                type="monotone"
                stroke="#2563eb"
                strokeWidth={2}
                dot={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
