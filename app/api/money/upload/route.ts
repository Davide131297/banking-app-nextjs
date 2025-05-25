import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { amount } = await req.json();

  if (!token) {
    return NextResponse.json(
      { error: "Kein Token vorhanden" },
      { status: 401 }
    );
  }

  if (!amount) {
    return NextResponse.json(
      { error: "Betrag ist erforderlich." },
      { status: 400 }
    );
  }

  const decoded = verifyJwt(token);
  if (
    !decoded ||
    typeof decoded === "string" ||
    !("user" in decoded) ||
    !decoded.user
  ) {
    return NextResponse.json({ error: "Ungültiges Token" }, { status: 401 });
  }

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: decoded.user.id },
        data: {
          money: {
            increment: amount,
          },
        },
      }),
      prisma.transactions.create({
        data: {
          receiver_username: decoded.user.username,
          amount,
          purpose: `Aufladung von ${amount} Euro`,
          type: "UPLOAD",
          receiver_balance_after: decoded.user.money + amount,
        },
      }),
    ]);
  } catch (error) {
    console.error("Transaktion Fehler:", error);
    return NextResponse.json(
      {
        error: "Aufladung fehlgeschlagen",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
  return NextResponse.json({ message: "Geld erfolgreich aufgeladen" });
}
