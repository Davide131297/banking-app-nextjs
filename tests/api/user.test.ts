import { GET } from "@/app/api/user/route";
import { NextRequest } from "next/server";
import { signJwt } from "@/lib/jwt";

// Prisma mocken
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma } = require("@/lib/prisma");

function mockRequestWithCookie(token?: string) {
  const headers = new Headers();
  if (token) {
    headers.set("cookie", `token=${token}`);
  }

  return new NextRequest("http://localhost/api/user", { headers });
}

describe("GET /api/user", () => {
  afterEach(() => jest.clearAllMocks());

  const userPayload = { user: { id: "user123" } };
  const token = signJwt(userPayload);

  it("gibt Userdaten bei gültigem Token zurück", async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: "user123",
      username: "max",
      money: 100,
      created: new Date("2024-01-01T00:00:00Z"),
    });

    const req = mockRequestWithCookie(token);
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user).toMatchObject({
      id: "user123",
      username: "max",
      money: 100,
    });
  });

  it("gibt 401 zurück bei fehlendem Token", async () => {
    const req = mockRequestWithCookie();
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Kein Token vorhanden");
  });

  it("gibt 401 zurück bei ungültigem Token", async () => {
    const req = mockRequestWithCookie("invalid.token.value");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Ungültiger Token");
  });

  it("gibt 404 zurück wenn User nicht gefunden wird", async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);

    const req = mockRequestWithCookie(token);
    const res = await GET(req);

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Benutzer nicht gefunden");
  });
});
