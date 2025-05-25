import { POST } from "@/app/api/auth/login/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/jwt", () => ({
  signJwt: jest.fn(() => "mocked.jwt.token"),
}));

function createPostRequest(body: object) {
  return new NextRequest("http://localhost/api/login", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/login", () => {
  afterEach(() => jest.clearAllMocks());

  it("loggt Benutzer erfolgreich ein", async () => {
    const mockUser = {
      id: "user123",
      username: "testuser",
      password: await bcrypt.hash("securepassword", 10),
      money: 100,
      created: new Date(),
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const req = createPostRequest({
      username: "testuser",
      password: "securepassword",
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Login erfolgreich");
    expect(body.token).toBe("mocked.jwt.token");
  });

  it("gibt Fehler zurück bei fehlenden Feldern", async () => {
    const req = createPostRequest({ username: "testuser" }); // kein Passwort

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Username und Passwort sind erforderlich");
  });

  it("gibt Fehler zurück, wenn Benutzer nicht existiert", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const req = createPostRequest({
      username: "nonexistent",
      password: "pass",
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Benutzer nicht gefunden");
  });

  it("gibt Fehler zurück bei falschem Passwort", async () => {
    const mockUser = {
      id: "user123",
      username: "testuser",
      password: await bcrypt.hash("correctpassword", 10),
      money: 100,
      created: new Date(),
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const req = createPostRequest({
      username: "testuser",
      password: "wrongpassword",
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Falsches Passwort");
  });

  it("gibt 500 zurück bei internem Fehler", async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(
      new Error("DB kaputt")
    );

    const req = createPostRequest({
      username: "testuser",
      password: "pw",
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Interner Serverfehler");
  });
});
