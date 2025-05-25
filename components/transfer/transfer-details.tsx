import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { TransactionsWithType } from "@/app/dashboard/page";
import { categories } from "@/utils/categories";

type TransferDetailsProps = {
  selectedTx: TransactionsWithType | null;
  setSelectedTx: (tx: TransactionsWithType | null) => void;
};

export default function TransferDetails({
  selectedTx,
  setSelectedTx,
}: TransferDetailsProps) {
  return (
    <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transaktionsdetails</DialogTitle>
        </DialogHeader>
        {selectedTx && (
          <div className="space-y-2">
            <div>
              <strong>Typ:</strong>{" "}
              {selectedTx.direction === "received"
                ? selectedTx.type === "UPLOAD"
                  ? "Aufgeladen"
                  : "Empfangen"
                : "Gesendet"}
            </div>
            {!(
              selectedTx.direction === "received" &&
              selectedTx.type === "UPLOAD"
            ) && (
              <div>
                <strong>Beteiligter:</strong>{" "}
                {selectedTx.direction === "received"
                  ? selectedTx.sender_username
                  : selectedTx.receiver_username}
              </div>
            )}
            <div>
              <strong>Betrag:</strong> {Number(selectedTx.amount).toFixed(2)} €
            </div>
            {selectedTx.category && (
              <div>
                <strong>Kategorie:</strong>{" "}
                {categories.find((cat) => cat.value === selectedTx.category)
                  ?.label ?? selectedTx.category}
              </div>
            )}
            <div>
              <strong>Datum:</strong>{" "}
              {format(new Date(selectedTx.date), "dd.MM.yyyy HH:mm")}
            </div>
            {selectedTx.purpose && (
              <div>
                <strong>Verwendungszweck:</strong> {selectedTx.purpose}
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button onClick={() => setSelectedTx(null)}>Schließen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
