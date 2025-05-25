import LoginDialog from "./login-dialog";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full flex items-center justify-between px-8 py-4 bg-black text-white border-b border-white">
      <Link href="/" className="text-2xl font-bold">
        Online Banking
      </Link>
      <LoginDialog />
    </header>
  );
}
