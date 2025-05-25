import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username und Passwort sind erforderlich" },
        { status: 400 }
      );
    }

    // Prüfen, ob Nutzername schon existiert
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Benutzername ist bereits vergeben" },
        { status: 400 }
      );
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Neuen User anlegen
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        money: 0,
      },
    });

    // Antwort ohne Passwort zurückgeben
    return NextResponse.json({
      message: "Benutzer erfolgreich registriert",
      user: {
        id: newUser.id,
        username: newUser.username,
        money: newUser.money,
      },
      status: 201,
    });
  } catch (err) {
    console.error("Fehler bei der Registrierung:", err);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
