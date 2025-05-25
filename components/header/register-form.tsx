"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import React, { useState } from "react";

export default function RegisterForm({
  onSwitch,
  setOpen,
}: {
  onSwitch: () => void;
  setOpen: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const password = formData.get("password");
    try {
      const res = await fetch("/api/auth/registration", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Registrierung fehlgeschlagen");
      const data = await res.json();
      if (data.status === 201) {
        //setOpen(false);
        setOpen(false);
        toast.success(
          "Registrierung erfolgreich, du kannst dich jetzt einloggen"
        );
      } else {
        setError(data.error || "Registrierung fehlgeschlagen");
      }
    } catch {
      setError("Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="reg-username">Nutzername</Label>
        <Input
          id="reg-username"
          name="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="reg-password">Passwort</Label>
        <Input id="reg-password" name="password" type="password" required />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Registrieren..." : "Registrieren"}
      </Button>
      <div className="mt-2 text-center text-sm">
        Bereits einen Account?{" "}
        <Button variant="link" className="p-0" onClick={onSwitch}>
          Login
        </Button>
      </div>
    </form>
  );
}
