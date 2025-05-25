process.env.JWT_SECRET_KEY = "testsecret";
import { signJwt, verifyJwt } from "../lib/jwt";
import jwt from "jsonwebtoken";

describe("JWT Utility Functions", () => {
  const payload = { userId: "12345", role: "user" };

  it("signJwt should create a valid JWT", () => {
    const token = signJwt(payload);
    expect(typeof token).toBe("string");

    const decoded = jwt.decode(token);
    expect(decoded).toMatchObject(payload);
  });

  it("verifyJwt should verify a valid token", () => {
    const token = signJwt(payload);
    const verified = verifyJwt(token);

    expect(verified).toMatchObject(payload);
  });

  it("verifyJwt should return null for invalid token", () => {
    const fakeToken = "invalid.token.value";
    const verified = verifyJwt(fakeToken);

    expect(verified).toBeNull();
  });

  it("verifyJwt should return null for expired token", (done) => {
    const shortLivedToken = signJwt(payload, 1); // 1 Sekunde gültig

    // warte >1 Sekunde, damit Token abläuft
    setTimeout(() => {
      const verified = verifyJwt(shortLivedToken);
      expect(verified).toBeNull();
      done();
    }, 1100);
  });
});
