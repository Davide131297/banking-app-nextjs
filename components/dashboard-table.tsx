import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { format } from "date-fns";
import type { User } from "@/hooks/useUser";
import type { TransactionsWithType } from "@/app/dashboard/page";

type DashboardTableProps = {
  user: User;
  setSelectedTx: (tx: TransactionsWithType | null) => void;
};

export default function DashboardTable({
  user,
  setSelectedTx,
}: DashboardTableProps) {
  // Transaktionen zusammenführen und nach Datum sortieren
  const allTransactions: TransactionsWithType[] = [
    ...(user?.transactions?.transactions_received || []).map((tx) => ({
      ...tx,
      direction: "received" as const,
    })),
    ...(user?.transactions?.transactions_sended || []).map((tx) => ({
      ...tx,
      direction: "sended" as const,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
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
            key={tx.direction + tx.id}
            className="cursor-pointer"
            onClick={() => setSelectedTx(tx)}
          >
            <TableCell>
              {tx.direction === "received" ? (
                tx.type === "UPLOAD" ? (
                  <span className="text-green-600">Aufgeladen</span>
                ) : (
                  <span className="text-green-600">Empfangen</span>
                )
              ) : (
                <span className="text-red-600">Gesendet</span>
              )}
            </TableCell>
            <TableCell>
              {tx.direction === "received"
                ? tx.sender_username
                : tx.receiver_username}
            </TableCell>
            <TableCell>
              <span
                className={
                  tx.direction === "received"
                    ? "text-green-600 font-mono"
                    : "text-red-600 font-mono"
                }
              >
                {tx.direction === "received" ? "+" : "-"}
                {Number(tx.amount).toFixed(2)} €
              </span>
            </TableCell>
            <TableCell>{format(tx.date, "dd.MM.yyyy HH:mm")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
