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
import CategoryPieChart from "@/components/category-pie";
import CashLineChart from "@/components/cash-line";

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
      {/* Untere Hälfte: Chart und Pie nebeneinander */}
      <div className="w-full mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 w-full">
            <CashLineChart chartData={chartData} />
          </div>
          <div className="md:col-span-1 w-full">
            <CategoryPieChart
              transactions={user.transactions?.transactions_sended || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
