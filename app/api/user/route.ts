import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Kein Token vorhanden" },
      { status: 401 }
    );
  }

  try {
    const decoded = verifyJwt(token);
    if (!decoded || typeof decoded === "string" || !decoded.user) {
      return NextResponse.json({ error: "Ungültiger Token" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.user.id },
      select: { id: true, username: true, money: true, created: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { user },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("Fehler beim Verifizieren des Tokens", err);
    return NextResponse.json({ error: err }, { status: 401 });
  }
}
