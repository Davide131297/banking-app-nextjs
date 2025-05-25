import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type TransferDetailsProps = {
  selectedTx: {
    id: number;
    sender_id: number;
    sender_username?: string;
    receiver_username: string;
    amount: number;
    date: string;
    purpose?: string;
    type: "received" | "sended";
  } | null;
  setSelectedTx: (tx: TransferDetailsProps["selectedTx"]) => void;
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
              {selectedTx.type === "received" ? "Empfangen" : "Gesendet"}
            </div>
            <div>
              <strong>Beteiligter:</strong>{" "}
              {selectedTx.type === "received"
                ? selectedTx.sender_username
                : selectedTx.receiver_username}
            </div>
            <div>
              <strong>Betrag:</strong> {Number(selectedTx.amount).toFixed(2)} €
            </div>
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
