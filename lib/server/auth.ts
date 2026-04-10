import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { AuthError } from "./errors";

const COOKIE_NAME = "linkedout_token";

let _secret: Uint8Array | null = null;
function getSecret(): Uint8Array {
  if (!_secret) {
    const raw = process.env.JWT_SECRET;
    if (!raw || raw.length < 32) {
      throw new Error("JWT_SECRET must be at least 32 characters long");
    }
    _secret = new TextEncoder().encode(raw);
  }
  return _secret;
}

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireSession(): Promise<JWTPayload> {
  const session = await getSession();
  if (!session) throw new AuthError();
  return session;
}

export function setTokenCookie(token: string): string {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function clearTokenCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export { COOKIE_NAME };
