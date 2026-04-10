import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production"
);

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/register"];

// In-memory rate limiter: 60 requests per minute per IP (resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) return false;

  return true;
}

// Security headers applied to every response
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval required by Next.js dev
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self'",
    ].join("; ")
  );

  // CORS for API routes: restrict to same origin
  const origin = response.headers.get("Origin");
  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  if (origin && origin === allowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting on API routes
  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip)) {
      return applySecurityHeaders(
        new NextResponse("Too Many Requests", { status: 429 })
      );
    }
  }

  // CORS preflight
  if (request.method === "OPTIONS") {
    return applySecurityHeaders(new NextResponse(null, { status: 204 }));
  }

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (isPublic) {
    return applySecurityHeaders(NextResponse.next());
  }

  const token = request.cookies.get("linkedout_token")?.value;
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return applySecurityHeaders(
        Response.json({ error: "Unauthorized" }, { status: 401 }) as NextResponse
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, secret);
    return applySecurityHeaders(NextResponse.next());
  } catch {
    if (pathname.startsWith("/api/")) {
      return applySecurityHeaders(
        Response.json({ error: "Unauthorized" }, { status: 401 }) as NextResponse
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)", "/api/:path*"],
};
