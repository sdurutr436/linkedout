import { describe, it, expect } from "vitest";
import { signToken, verifyToken, setTokenCookie, clearTokenCookie } from "@/lib/server/auth";

const SAMPLE_PAYLOAD = { sub: "user-123", email: "test@example.com", name: "Test User" };

describe("auth helpers", () => {
  describe("signToken / verifyToken", () => {
    it("signs and verifies a valid token", async () => {
      const token = await signToken(SAMPLE_PAYLOAD);
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // JWT format

      const payload = await verifyToken(token);
      expect(payload).not.toBeNull();
      expect(payload?.sub).toBe("user-123");
      expect(payload?.email).toBe("test@example.com");
      expect(payload?.name).toBe("Test User");
    });

    it("returns null for an invalid token", async () => {
      const payload = await verifyToken("invalid.token.here");
      expect(payload).toBeNull();
    });

    it("returns null for an expired token", async () => {
      // Manually create a token with past expiry
      const { SignJWT } = await import("jose");
      const secret = new TextEncoder().encode("test-secret-for-unit-tests-only");
      const expiredToken = await new SignJWT({ ...SAMPLE_PAYLOAD })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(Math.floor(Date.now() / 1000) - 3600) // 1h ago
        .sign(secret);

      const payload = await verifyToken(expiredToken);
      expect(payload).toBeNull();
    });

    it("returns null for a token signed with wrong secret", async () => {
      const { SignJWT } = await import("jose");
      const wrongSecret = new TextEncoder().encode("wrong-secret");
      const token = await new SignJWT({ ...SAMPLE_PAYLOAD })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(wrongSecret);

      const payload = await verifyToken(token);
      expect(payload).toBeNull();
    });
  });

  describe("cookie helpers", () => {
    it("setTokenCookie returns a Set-Cookie header string", () => {
      const cookie = setTokenCookie("my-token");
      expect(cookie).toContain("linkedout_token=my-token");
      expect(cookie).toContain("HttpOnly");
      expect(cookie).toContain("Path=/");
    });

    it("clearTokenCookie sets Max-Age=0", () => {
      const cookie = clearTokenCookie();
      expect(cookie).toContain("Max-Age=0");
      expect(cookie).toContain("linkedout_token=");
    });
  });
});
