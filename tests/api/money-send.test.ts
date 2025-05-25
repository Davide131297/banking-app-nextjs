import { POST } from "@/app/api/money/send/route";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transactions: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock("@/lib/jwt", () => ({
  verifyJwt: jest.fn(),
}));

function createPostRequest(body: object, token?: string) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (token) {
    headers.set("cookie", `token=${token}`);
  }

  return new NextRequest("http://localhost/api/send", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    //eslint-disable-next-line
  } as any);
}

describe("POST /api/send", () => {
  const mockSender = {
    id: "sender-id",
    username: "sender",
    money: 100,
  };

  const mockReceiver = {
    id: "receiver-id",
    username: "receiver",
    money: 50,
  };

  afterEach(() => jest.clearAllMocks());

  it("führt erfolgreiche Transaktion durch", async () => {
    (verifyJwt as jest.Mock).mockReturnValue({ user: { id: mockSender.id } });
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce(mockSender) // sender
      .mockResolvedValueOnce(mockReceiver); // receiver

    (prisma.$transaction as jest.Mock).mockResolvedValue(true);

    const req = createPostRequest(
      {
        amount: 20,
        receiver_username: "receiver",
        purpose: "Testzahlung",
      },
      "valid.token"
    );

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Geld erfolgreich gesendet");
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it("gibt Fehler zurück wenn kein Token vorhanden", async () => {
    const req = createPostRequest({
      amount: 20,
      receiver_username: "receiver",
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Kein Token vorhanden");
  });

  it("gibt Fehler zurück bei ungültigem Token", async () => {
    (verifyJwt as jest.Mock).mockReturnValue(null);

    const req = createPostRequest(
      { amount: 20, receiver_username: "receiver" },
      "invalid.token"
    );

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Ungültiges Token");
  });

  it("gibt Fehler zurück wenn amount oder Empfänger fehlen", async () => {
    const req = createPostRequest({ purpose: "Test" }, "valid.token");

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Empfänger und Betrag sind erforderlich.");
  });

  it("gibt Fehler zurück wenn Sender nicht gefunden", async () => {
    (verifyJwt as jest.Mock).mockReturnValue({ user: { id: mockSender.id } });
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null); // sender

    const req = createPostRequest(
      {
        amount: 20,
        receiver_username: "receiver",
      },
      "valid.token"
    );

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Sender nicht gefunden");
  });

  it("gibt Fehler zurück wenn Sender zu wenig Geld hat", async () => {
    const armSender = { ...mockSender, money: 5 };
    (verifyJwt as jest.Mock).mockReturnValue({ user: { id: armSender.id } });
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(armSender);

    const req = createPostRequest(
      {
        amount: 20,
        receiver_username: "receiver",
      },
      "valid.token"
    );

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Nicht genug Guthaben");
  });

  it("gibt Fehler zurück wenn Empfänger nicht gefunden", async () => {
    (verifyJwt as jest.Mock).mockReturnValue({ user: { id: mockSender.id } });
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce(mockSender) // sender
      .mockResolvedValueOnce(null); // receiver

    const req = createPostRequest(
      {
        amount: 20,
        receiver_username: "receiver",
      },
      "valid.token"
    );

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Empfänger nicht gefunden");
  });

  it("gibt Fehler zurück bei Datenbankfehler", async () => {
    (verifyJwt as jest.Mock).mockReturnValue({ user: { id: mockSender.id } });
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce(mockSender)
      .mockResolvedValueOnce(mockReceiver);

    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error("DB down"));

    const req = createPostRequest(
      {
        amount: 20,
        receiver_username: "receiver",
      },
      "valid.token"
    );

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Transaktion fehlgeschlagen");
    expect(body.details).toBe("DB down");
  });
});
