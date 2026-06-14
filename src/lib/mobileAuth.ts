/**
 * mobileAuth.ts
 * Helper to validate Bearer JWT tokens from the Dart mobile app.
 * Used by all protected /api/mobile/* routes.
 */

import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export interface MobileTokenPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Extracts and verifies the Bearer token from the Authorization header.
 * Returns the decoded payload or throws if invalid / missing.
 */
export function getMobileSession(req: Request | NextRequest): MobileTokenPayload {
  const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing Authorization header");
  }

  const token = authHeader.slice(7).trim();
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error("Server misconfiguration: NEXTAUTH_SECRET not set");
  }

  const payload = jwt.verify(token, secret) as MobileTokenPayload;
  return payload;
}

/**
 * Convenience wrapper — returns null instead of throwing, for optional auth.
 */
export function getMobileSessionSafe(req: Request | NextRequest): MobileTokenPayload | null {
  try {
    return getMobileSession(req);
  } catch {
    return null;
  }
}
