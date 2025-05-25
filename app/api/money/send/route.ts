import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { amount, receiver_username, purpose, category } = await req.json();

  if (!token) {
    return NextResponse.json(
      { error: "Kein Token vorhanden" },
      { status: 401 }
    );
  }

  if (!amount || !receiver_username) {
    return NextResponse.json(
      { error: "Empfänger und Betrag sind erforderlich." },
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

  // Sender auslesen
  const sender = await prisma.user.findUnique({
    where: { id: decoded.user.id },
  });

  if (!sender) {
    return NextResponse.json(
      { error: "Sender nicht gefunden" },
      { status: 404 }
    );
  }

  if (
    sender.money === null ||
    sender.money === undefined ||
    sender.money < amount
  ) {
    return NextResponse.json(
      { error: "Nicht genug Guthaben" },
      { status: 400 }
    );
  }

  // Empfänger auslesen
  const receiver = await prisma.user.findUnique({
    where: { username: receiver_username },
  });

  if (!receiver) {
    return NextResponse.json(
      { error: "Empfänger nicht gefunden" },
      { status: 404 }
    );
  }

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: sender.id },
        data: { money: { decrement: amount } },
      }),
      prisma.user.update({
        where: { id: receiver.id },
        data: { money: { increment: amount } },
      }),
      prisma.transactions.create({
        data: {
          sender_id: sender.id,
          receiver_username: receiver.username,
          amount: amount,
          purpose: purpose,
          type: "TRANSFER",
          category: category || null,
          sender_balance_after: sender.money - amount,
          receiver_balance_after: receiver.money + amount,
        },
      }),
    ]);
  } catch (error) {
    console.error("Transaktion Fehler:", error);
    return NextResponse.json(
      {
        error: "Transaktion fehlgeschlagen",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Geld erfolgreich gesendet" });
}
