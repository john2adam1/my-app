// services/authService.ts
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret";
const TOKEN_NAME = "token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 kun

export function createToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: MAX_AGE });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function createAuthResponse(data: object) {
  const token = createToken(data);
  const res = NextResponse.json({ ok: true });
  // httpOnly cookie
  res.cookies.set({
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

export function clearAuthCookie() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: TOKEN_NAME,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
