import jwt from "jsonwebtoken";

import type { Secret } from "jsonwebtoken";

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as Secret;
if (!JWT_SECRET_KEY) throw new Error("JWT_SECRET_KEY nicht gesetzt in .env");

import type { JwtPayload, SignOptions } from "jsonwebtoken";

export function signJwt(payload: JwtPayload, expiresIn: number = 3600) {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET_KEY, options);
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET_KEY);
  } catch {
    return null;
  }
}
