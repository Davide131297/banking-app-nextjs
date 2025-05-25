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
      select: {
        id: true,
        username: true,
        created: true,
        transactions_transactions_sender_idTouser: {
          select: {
            id: true,
            date: true,
            sender_balance_after: true,
          },
        },
        transactions_transactions_receiver_usernameTouser: {
          select: {
            id: true,
            date: true,
            receiver_balance_after: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    // Alle Transaktionen zusammenführen
    const allTx = [
      ...(user.transactions_transactions_sender_idTouser || []).map((tx) => ({
        date: tx.date,
        balance: tx.sender_balance_after,
      })),
      ...(user.transactions_transactions_receiver_usernameTouser || []).map(
        (tx) => ({
          date: tx.date,
          balance: tx.receiver_balance_after,
        })
      ),
    ];

    // Nach Datum sortieren
    allTx.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let cashProcess = allTx.filter((tx) => typeof tx.balance === "number");

    if (
      user.created &&
      (cashProcess.length === 0 ||
        new Date(user.created).getTime() <
          new Date(cashProcess[0].date).getTime())
    ) {
      cashProcess = [{ date: user.created, balance: 0 }, ...cashProcess];
    }

    return NextResponse.json(
      { cashProcess },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 401 }
    );
  }
}
