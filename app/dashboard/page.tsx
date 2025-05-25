"use client";

import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import type { Transactions } from "@/hooks/useUser";
import { useState } from "react";
import TransferDetails from "@/components/transfer/transfer-details";
import TransferDialog from "@/components/transfer/transfer-dialog";
import DashboardTable from "@/components/dashboard-table";
import TransferUpload from "@/components/transfer/transfer-upload";

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

export type TransactionsWithType = Transactions & {
  direction: "received" | "sended";
};

export default function DashboardPage() {
  const { user, loading, refreshUser } = useUser();
  const [selectedTx, setSelectedTx] = useState<TransactionsWithType | null>(
    null
  );

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Lade...</p>
      </div>
    );
  }

  function refreshPage() {
    refreshUser();
  }

  const cashProcess = Array.isArray(user?.cashProcess) ? user.cashProcess : [];

  // Daten für die Chart aufbereiten (Datum als Tag formatieren)
  const chartData = cashProcess.map((entry) => ({
    date: entry.date,
    balance: entry.balance,
  }));

  return (
    <div className="p-8 w-full">
      <h1 className="text-2xl font-bold mb-6">Willkommen, {user?.username}</h1>
      {/* Obere Hälfte: Zwei Spalten */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        style={{ height: "50vh", minHeight: 320 }}
      >
        {/* Linke Spalte */}
        <div className="md:col-span-1 flex flex-col gap-6 h-full">
          <div className="bg-blue-100 rounded-lg p-6 flex-1 flex flex-col justify-center items-center">
            <p className="text-lg">Aktuelles Guthaben:</p>
            <p className="text-3xl font-semibold">
              {user?.money?.toFixed(2) ?? "0.00"} €
            </p>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <h2 className="text-xl font-semibold mb-2">Schnellaktionen</h2>
            <div className="flex flex-col gap-3">
              <TransferDialog />
              <TransferUpload />
              <Button className="w-full" onClick={refreshPage}>
                <RotateCw /> Seite neuladen
              </Button>
            </div>
          </div>
        </div>
        {/* Rechte Spalte */}
        <div className="md:col-span-2 flex flex-col h-full">
          <h2 className="text-xl font-semibold mb-2">Letzte Transaktionen</h2>
          <div className="flex-1 max-h-full overflow-y-auto w-full rounded-md border p-4 bg-white">
            <DashboardTable user={user} setSelectedTx={setSelectedTx} />
          </div>
        </div>
        <TransferDetails
          selectedTx={selectedTx}
          setSelectedTx={setSelectedTx}
        />
      </div>
      {/* Untere Hälfte: Chart in voller Breite */}
      <div className="w-full mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Cash Verlauf</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 260 }}>
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
      </div>
    </div>
  );
}
