import { POST } from "@/app/api/money/upload/route";
import { prisma } from "@/lib/prisma";
import * as jwtLib from "@/lib/jwt";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: jest.fn(),
    user: {
      update: jest.fn(),
    },
    transactions: {
      create: jest.fn(),
    },
  },
}));
jest.mock("@/lib/jwt");

describe("POST /api/money/upload", () => {
  const user = {
    id: "user-123",
    username: "max",
    money: 100,
  };

  const mockVerifyJwt = jwtLib.verifyJwt as jest.Mock;

  const mockPrisma = prisma as jest.Mocked<typeof prisma>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createRequest(token?: string, body?: object) {
    // Mock NextRequest mit Cookies und json()
    return {
      cookies: {
        get: jest.fn(() => (token ? { value: token } : undefined)),
      },
      json: jest.fn(async () => body || {}),
    } as unknown as NextRequest;
  }

  test("Erfolgreiches Aufladen", async () => {
    mockVerifyJwt.mockReturnValue({ user });

    //eslint-disable-next-line
    mockPrisma.$transaction.mockResolvedValue([{}, {}] as any);

    const req = createRequest("valid-token", { amount: 50 });

    const res = await POST(req);

    expect(mockVerifyJwt).toHaveBeenCalledWith("valid-token");
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toBe("Geld erfolgreich aufgeladen");
  });

  test("Fehler: Kein Token", async () => {
    const req = createRequest(undefined, { amount: 50 });

    const res = await POST(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Kein Token vorhanden");
  });

  test("Fehler: Betrag fehlt", async () => {
    const req = createRequest("valid-token", {});

    mockVerifyJwt.mockReturnValue({ user });

    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Betrag ist erforderlich.");
  });

  test("Fehler: Ungültiges Token", async () => {
    const req = createRequest("invalid-token", { amount: 50 });

    mockVerifyJwt.mockReturnValue(null);

    const res = await POST(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Ungültiges Token");
  });

  test("Fehler: Transaktion schlägt fehl", async () => {
    mockVerifyJwt.mockReturnValue({ user });
    mockPrisma.$transaction.mockRejectedValue(new Error("DB Fehler"));

    const req = createRequest("valid-token", { amount: 50 });

    const res = await POST(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Aufladung fehlgeschlagen");
    expect(json.details).toBe("DB Fehler");
  });
});
