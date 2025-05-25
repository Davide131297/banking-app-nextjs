import { GET } from "@/app/api/money/transactions/route";
import * as jwtLib from "@/lib/jwt";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    transactions: {
      findMany: jest.fn(),
    },
  },
}));
jest.mock("@/lib/jwt");

describe("GET /api/money/transactions", () => {
  const user = {
    id: "user-123",
    username: "max",
  };

  const mockVerifyJwt = jwtLib.verifyJwt as jest.Mock;
  // eslint-disable-next-line
  const { prisma } = require("@/lib/prisma");
  const mockPrisma = prisma as {
    transactions: {
      findMany: jest.Mock;
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createRequest(token?: string) {
    return {
      cookies: {
        get: jest.fn(() => (token ? { value: token } : undefined)),
      },
    } as unknown as NextRequest;
  }

  test("Erfolgreiches Laden der Transaktionen", async () => {
    mockVerifyJwt.mockReturnValue({ user });

    const transactionsReceived = [
      {
        id: "t1",
        sender_id: "user-999",
        receiver_username: user.username,
        amount: 50,
        date: new Date().toISOString(),
        purpose: "Zahlung",
        category: "Transfer",
        type: "TRANSFER",
        user_transactions_sender_idTouser: { username: "senderUser" },
      },
    ];
    const transactionsSended = [
      {
        id: "t2",
        sender_id: user.id,
        receiver_username: "otherUser",
        amount: 30,
        date: new Date().toISOString(),
        purpose: "Aufladung",
        category: null,
        type: "UPLOAD",
      },
    ];

    mockPrisma.transactions.findMany
      // eslint-disable-next-line
      .mockResolvedValueOnce(transactionsReceived as any)
      // eslint-disable-next-line
      .mockResolvedValueOnce(transactionsSended as any);

    const req = createRequest("valid-token");
    const res = await GET(req);

    expect(mockVerifyJwt).toHaveBeenCalledWith("valid-token");
    expect(mockPrisma.transactions.findMany).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.transactions.transactions_received).toEqual(
      transactionsReceived
    );
    expect(json.transactions.transactions_sended).toEqual(transactionsSended);
  });

  test("Fehler: Kein Token", async () => {
    const req = createRequest(undefined);
    const res = await GET(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Kein Token vorhanden");
  });

  test("Fehler: Ungültiger Token", async () => {
    mockVerifyJwt.mockReturnValue(null);
    const req = createRequest("invalid-token");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Ungültiger Token");
  });

  test("Fehler: Transaktionen nicht gefunden", async () => {
    mockVerifyJwt.mockReturnValue({ user });

    mockPrisma.transactions.findMany
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const req = createRequest("valid-token");
    const res = await GET(req);

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Transaktionen nicht gefunden");
  });

  test("Fehler: Exception im Try-Catch", async () => {
    mockVerifyJwt.mockImplementation(() => {
      throw new Error("JWT Fehler");
    });
    const req = createRequest("any-token");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("JWT Fehler");
  });
});
