import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted runs before module imports, making mockCreate available inside vi.mock
const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn().mockResolvedValue({
    content: [
      {
        type: "text",
        text: "# John Doe\n\n## Summary\nExperienced developer.",
      },
    ],
  }),
}));

vi.mock("@anthropic-ai/sdk", () => {
  class Anthropic {
    messages = { create: mockCreate };
    constructor(_opts: unknown) {}
  }
  return { default: Anthropic };
});

import { optimizeCV } from "@/lib/server/cv/optimizer";

describe("optimizeCV", () => {
  beforeEach(() => {
    mockCreate.mockClear();
  });

  it("returns a markdown string", async () => {
    const result = await optimizeCV({
      cvContent: "My current CV",
      titulaciones: "BSc Computer Science",
      experiencia: "3 years at Acme",
      jobTitle: "Frontend Developer",
      company: "TechCorp",
      jobDescription: "We need a React developer",
    });

    expect(typeof result).toBe("string");
    expect(result).toContain("#");
  });

  it("calls Anthropic messages.create with claude model", async () => {
    await optimizeCV({
      cvContent: "My CV",
      titulaciones: "BSc",
      experiencia: "2 years",
      jobTitle: "Backend Engineer",
      company: "Startup",
      jobDescription: "Node.js backend role",
    });

    expect(mockCreate).toHaveBeenCalledOnce();
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.stringContaining("claude"),
        messages: expect.arrayContaining([
          expect.objectContaining({ role: "user" }),
        ]),
      })
    );
  });

  it("includes job title and company in the prompt", async () => {
    await optimizeCV({
      cvContent: "My CV",
      titulaciones: "BSc",
      experiencia: "5 years",
      jobTitle: "Data Scientist",
      company: "AI Corp",
      jobDescription: "Python ML role",
    });

    const callArgs = mockCreate.mock.calls[0][0];
    const userMessage = callArgs.messages[0].content as string;
    expect(userMessage).toContain("Data Scientist");
    expect(userMessage).toContain("AI Corp");
  });
});
