"use client";

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
import { CheckCircle2, XCircle } from "lucide-react";
import { useUser } from "@/hooks/useUser";

export default function TransferDialog() {
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
        }),
      });

      if (res.ok) {
        setSuccess("Überweisung erfolgreich!");
        setReceiver("");
        setAmount("");
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

  return (
    <Dialog>
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
              <Label htmlFor="receiver">Empfänger</Label>
              <Input
                id="receiver"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                placeholder="Nutzername"
                required
                disabled={loading}
                autoFocus
                className="focus:ring-2 focus:ring-blue-400"
              />
            </div>
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
                disabled={loading}
                className="focus:ring-2 focus:ring-blue-400"
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
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Sende..." : "Überweisen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
