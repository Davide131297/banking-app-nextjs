import { GET } from "@/app/api/money/history/route"; // Pfad ggf. anpassen
import * as jwtLib from "@/lib/jwt";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

//eslint-disable-next-line
const { prisma } = require("@/lib/prisma");
const mockPrisma = prisma as {
  user: {
    findUnique: jest.Mock;
  };
};
jest.mock("@/lib/jwt");

describe("GET /api/money/history", () => {
  const user = {
    id: "user-123",
    username: "max",
    created: new Date("2024-01-01T00:00:00.000Z"),
  };

  const mockVerifyJwt = jwtLib.verifyJwt as jest.Mock;

  function createRequest(token?: string) {
    return {
      cookies: {
        get: jest.fn(() => (token ? { value: token } : undefined)),
      },
    } as unknown as NextRequest;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("✅ Erfolgreich: Gibt cashProcess zurück", async () => {
    mockVerifyJwt.mockReturnValue({ user });

    const mockUser = {
      ...user,
      transactions_transactions_sender_idTouser: [
        {
          id: "tx1",
          date: new Date("2024-02-01T00:00:00.000Z"),
          sender_balance_after: 50,
        },
      ],
      transactions_transactions_receiver_usernameTouser: [
        {
          id: "tx2",
          date: new Date("2024-03-01T00:00:00.000Z"),
          receiver_balance_after: 120,
        },
      ],
    };

    //eslint-disable-next-line
    mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

    const req = createRequest("valid-token");
    const res = await GET(req);

    expect(mockVerifyJwt).toHaveBeenCalledWith("valid-token");
    expect(mockPrisma.user.findUnique).toHaveBeenCalled();

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.cashProcess).toEqual([
      { date: user.created.toISOString(), balance: 0 },
      {
        date: mockUser.transactions_transactions_sender_idTouser[0].date.toISOString(),
        balance: 50,
      },
      {
        date: mockUser.transactions_transactions_receiver_usernameTouser[0].date.toISOString(),
        balance: 120,
      },
    ]);
  });

  test("🚫 Kein Token", async () => {
    const req = createRequest(undefined);
    const res = await GET(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Kein Token vorhanden");
  });

  test("🚫 Ungültiger Token", async () => {
    mockVerifyJwt.mockReturnValue(null);
    const req = createRequest("invalid-token");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Ungültiger Token");
  });

  test("🚫 Benutzer nicht gefunden", async () => {
    mockVerifyJwt.mockReturnValue({ user });
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const req = createRequest("valid-token");
    const res = await GET(req);

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Benutzer nicht gefunden");
  });

  test("🔥 Fehler beim Verifizieren des Tokens (Exception)", async () => {
    mockVerifyJwt.mockImplementation(() => {
      throw new Error("Token kaputt");
    });

    const req = createRequest("any-token");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Token kaputt");
  });
});
