"use client";

import { useUser } from "@/hooks/useUser";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import TransferDialog from "@/components/transfer/transfer-dialog";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import type { Transactions } from "@/hooks/useUser";
import { useState } from "react";
import TransferDetails from "@/components/transfer/transfer-details";

type TransactionsWithType = Transactions & {
  type: "received" | "sended";
};

export default function DashboardPage() {
  const { user, loading, refreshUser } = useUser();
  const [selectedTx, setSelectedTx] = useState<TransactionsWithType | null>(
    null
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Lade...</p>
      </div>
    );
  }

  // Transaktionen zusammenführen und nach Datum sortieren
  const allTransactions: TransactionsWithType[] = [
    ...(user?.transactions?.transactions_received || []).map((tx) => ({
      ...tx,
      type: "received" as const,
    })),
    ...(user?.transactions?.transactions_sended || []).map((tx) => ({
      ...tx,
      type: "sended" as const,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  function refreshPage() {
    refreshUser();
  }

  return (
    <div className="p-8 w-full">
      <h1 className="text-2xl font-bold mb-6">Willkommen, {user?.username}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Linke Spalte: Kontostand & Schnellaktionen */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-blue-100 rounded-lg p-6">
            <p className="text-lg">Aktuelles Guthaben:</p>
            <p className="text-3xl font-semibold">
              {user?.money?.toFixed(2) ?? "0.00"} €
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Schnellaktionen</h2>
            <div className="flex flex-col gap-3">
              <TransferDialog />
              <Button className="w-full" onClick={refreshPage}>
                <RotateCw /> Seite neuladen
              </Button>
            </div>
          </div>
        </div>
        {/* Rechte Spalte: Transaktionen */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-2">Letzte Transaktionen</h2>
          <div className="max-h-[70vh] overflow-y-auto w-full rounded-md border p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Typ</TableHead>
                  <TableHead>Beteiligter</TableHead>
                  <TableHead>Betrag</TableHead>
                  <TableHead>Datum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allTransactions.map((tx) => (
                  <TableRow
                    key={tx.type + tx.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedTx(tx)}
                  >
                    <TableCell>
                      {tx.type === "received" ? (
                        <span className="text-green-600">Empfangen</span>
                      ) : (
                        <span className="text-red-600">Gesendet</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {tx.type === "received"
                        ? tx.sender_username
                        : tx.receiver_username}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          tx.type === "received"
                            ? "text-green-600 font-mono"
                            : "text-red-600 font-mono"
                        }
                      >
                        {tx.type === "received" ? "+" : "-"}
                        {Number(tx.amount).toFixed(2)} €
                      </span>
                    </TableCell>
                    <TableCell>{format(tx.date, "dd.MM.yyyy HH:mm")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        {/* Dialog für Transaktionsdetails */}
        <TransferDetails
          selectedTx={selectedTx}
          setSelectedTx={setSelectedTx}
        />
      </div>
    </div>
  );
}
