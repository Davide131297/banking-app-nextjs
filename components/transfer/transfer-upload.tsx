import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, BanknoteArrowDown } from "lucide-react";
import { useUser } from "@/hooks/useUser";

export default function TransferUpload() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { refreshUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch("/api/money/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
        }),
      });

      if (res.ok) {
        setSuccess("Aufladen erfolgreich!");
        await refreshUser();
      } else {
        const data = await res.json();
        setError(data.error || "Fehler beim Aufladen.");
      }
    } catch {
      setError("Netzwerkfehler.");
    } finally {
      setLoading(false);
    }
  };

  // Reset states beim Schließen
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setAmount("");
      setSuccess(null);
      setError(null);
      setLoading(false);
    }
  };

  const isDisabled = loading || !!success;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 shadow-md">
          <BanknoteArrowDown /> Geld aufladen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Aufladung</span>
            <span role="img" aria-label="money">
              💸
            </span>
          </DialogTitle>
          <DialogDescription>
            Lade dein Konto in echtzeit auf, um sofort Geld zu überweisen.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Betrag (€)</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(",", "."))}
                placeholder="z.B. 10.00"
                required
                disabled={isDisabled}
                className={`focus:ring-2 focus:ring-blue-400 ${
                  success ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
                }`}
              />
            </div>
            {success && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded px-2 py-1">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded px-2 py-1">
                <XCircle size={18} />
                <span>{error}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isDisabled}
              className={`w-full ${
                success
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Sende..." : success ? "Aufladen" : "Aufgeladen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
