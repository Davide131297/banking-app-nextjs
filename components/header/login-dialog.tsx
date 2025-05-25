"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";

import LoginForm from "./login-form";
import RegisterForm from "./register-form";
import { useRouter } from "next/navigation";

export default function LoginDialog() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [open, setOpen] = useState<boolean>(false);
  const { user, logout, refreshUser } = useUser();
  const router = useRouter();

  function handleLogout() {
    logout();
  }

  useEffect(() => {
    console.log("User state changed:", user);
  }, [user]);

  const handleLoginSuccess = async () => {
    if (refreshUser) {
      await refreshUser();
    }
  };

  return (
    <>
      {user ? (
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="text-black"
            onClick={() => {
              router.push("/dashboard");
            }}
          >
            Dashboard
          </Button>
          <Button
            variant="outline"
            className="text-black"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="text-black">
              Login
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {mode === "login" ? "Login" : "Registrieren"}
              </DialogTitle>
            </DialogHeader>
            {mode === "login" ? (
              <LoginForm
                onSwitch={() => setMode("register")}
                setOpen={setOpen}
                onLoginSuccess={handleLoginSuccess}
              />
            ) : (
              <RegisterForm
                onSwitch={() => setMode("login")}
                setOpen={setOpen}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
