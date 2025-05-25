"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({
  onSwitch,
  setOpen,
}: {
  onSwitch: () => void;
  setOpen: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const password = formData.get("password");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();

      if (data.status === 200) {
        setOpen(false);
        toast.success(data.message);
        router.push("/dashboard");
      } else {
        setError(data.error || "Login fehlgeschlagen");
      }
    } catch {
      setError("Network Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="username">Nutzername</Label>
        <Input
          id="username"
          name="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Passwort</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Einloggen..." : "Login"}
      </Button>
      <div className="mt-2 text-center text-sm">
        Noch keinen Account?{" "}
        <Button variant="link" className="p-0" onClick={onSwitch}>
          Registrieren
        </Button>
      </div>
    </form>
  );
}
