import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { AuthError } from "./errors";

const COOKIE_NAME = "linkedout_token";

function getSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET;
  if (!raw || raw.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }
  return new TextEncoder().encode(raw);
}

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
}

/** Sign a JWT token with 7-day expiry. */
export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

/** Verify and decode a JWT token. Returns null on failure. */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

/** Read the current session from the request cookie store. */
export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Require a valid session — throws AuthError if missing.
 * Use this inside API route handlers.
 */
export async function requireSession(): Promise<JWTPayload> {
  const session = await getSession();
  if (!session) throw new AuthError();
  return session;
}

/** Build a Set-Cookie header value that sets the session cookie. */
export function setTokenCookie(token: string): string {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

/** Build a Set-Cookie header value that clears the session cookie. */
export function clearTokenCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export { COOKIE_NAME };
