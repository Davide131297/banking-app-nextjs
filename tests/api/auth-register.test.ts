import { POST } from "@/app/api/auth/registration/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

function createPostRequest(body: object) {
  return new NextRequest("http://localhost/api/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/register", () => {
  afterEach(() => jest.clearAllMocks());

  it("registriert neuen Benutzer erfolgreich", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: "user123",
      username: "newuser",
      money: 0,
    });

    const req = createPostRequest({
      username: "newuser",
      password: "securepassword",
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.message).toBe("Benutzer erfolgreich registriert");
    expect(body.user).toEqual({
      id: "user123",
      username: "newuser",
      money: 0,
    });
  });

  it("gibt Fehler zurück, wenn Benutzername bereits vergeben ist", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "exists" });

    const req = createPostRequest({
      username: "existinguser",
      password: "password123",
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Benutzername ist bereits vergeben");
  });

  it("gibt Fehler zurück bei fehlenden Feldern", async () => {
    const req = createPostRequest({ username: "onlyuser" });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Username und Passwort sind erforderlich");
  });

  it("gibt 500 zurück bei internem Serverfehler", async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(
      new Error("DB kaputt")
    );

    const req = createPostRequest({
      username: "newuser",
      password: "pw",
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Interner Serverfehler");
  });
});
