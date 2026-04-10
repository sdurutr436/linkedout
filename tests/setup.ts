import { vi } from "vitest";

// Mock Next.js server APIs
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

// Set test environment variables
process.env.JWT_SECRET = "test-secret-for-unit-tests-only-must-be-32-chars-min";
process.env.DATABASE_URL = "file:./data/test.db";
process.env.ANTHROPIC_API_KEY = "sk-test-placeholder";
