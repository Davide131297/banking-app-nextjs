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

    const transactions_received = await prisma.transactions.findMany({
      where: { receiver_username: decoded.user.username },
      select: {
        id: true,
        sender_id: true,
        receiver_username: true,
        amount: true,
        date: true,
        purpose: true,
        type: true,
        user_transactions_sender_idTouser: {
          select: {
            username: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    if (!transactions_received) {
      return NextResponse.json(
        { error: "Transaktionen nicht gefunden" },
        { status: 404 }
      );
    }

    const transactions_sended = await prisma.transactions.findMany({
      where: { sender_id: decoded.user.id },
      select: {
        id: true,
        sender_id: true,
        receiver_username: true,
        amount: true,
        date: true,
      },
      orderBy: { date: "desc" },
    });

    if (!transactions_sended) {
      return NextResponse.json(
        { error: "Transaktionen nicht gefunden" },
        { status: 404 }
      );
    }

    const transactions = {
      transactions_received,
      transactions_sended,
    };

    return NextResponse.json(
      { transactions },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("Fehler beim Verifizieren des Tokens", err);
    return NextResponse.json({ error: err }, { status: 401 });
  }
}
