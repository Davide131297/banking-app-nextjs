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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { categories } from "@/utils/categories";

export default function TransferDialog() {
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [category, setCategory] = useState<string>("");
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
      const res = await fetch("/api/money/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_username: receiver,
          amount: Number(amount),
          purpose,
          category: category || null,
        }),
      });

      if (res.ok) {
        setSuccess("Überweisung erfolgreich!");
        await refreshUser();
      } else {
        const data = await res.json();
        setError(data.error || "Fehler bei der Überweisung.");
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
      setReceiver("");
      setAmount("");
      setPurpose("");
      setCategory("");
      setSuccess(null);
      setError(null);
      setLoading(false);
    }
  };

  const isDisabled = loading || !!success;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
          Überweisung
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Überweisung</span>
            <span role="img" aria-label="money">
              💸
            </span>
          </DialogTitle>
          <DialogDescription>
            Sende Geld an einen anderen Nutzer.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="receiver">
                Empfänger <span className="text-red-500">*</span>
              </Label>
              <Input
                id="receiver"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value.toLowerCase())}
                placeholder="Nutzername"
                required
                disabled={isDisabled}
                autoFocus
                className={`focus:ring-2 focus:ring-blue-400 ${
                  success ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
                }`}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">
                Betrag (€) <span className="text-red-500">*</span>
              </Label>
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
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Kategorie</Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={isDisabled}
                required
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="purpose">Verwendungszweck</Label>
              <Input
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="z.B. Miete, Essen, Geschenk..."
                maxLength={255}
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
              {loading ? "Sende..." : success ? "Überwiesen" : "Überweisen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
