import { prisma } from "../db";
import { optimizeCV } from "../cv/optimizer";
import { markdownToPdf } from "../cv/pdf";
import { ProfileService } from "./profile.service";
import { NotFoundError, AppError } from "../errors";
import logger from "../logger";
import type { z } from "zod";
import type { optimizeCVSchema } from "../validation/schemas";

export const CVService = {
  async optimize(userId: string, input: z.infer<typeof optimizeCVSchema>) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new AppError("ANTHROPIC_API_KEY is not configured", 500, "MISSING_CONFIG");
    }

    const profile = await ProfileService.getOrThrow(userId);

    logger.info({ userId, company: input.company, jobTitle: input.jobTitle }, "optimizing CV");

    const content = await optimizeCV({
      cvContent: profile.cvContent ?? "",
      titulaciones: profile.titulaciones ?? "",
      experiencia: profile.experiencia ?? "",
      jobTitle: input.jobTitle,
      company: input.company,
      jobDescription: input.jobDescription,
    });

    return prisma.optimizedCV.create({
      data: { userId, jobTitle: input.jobTitle, company: input.company, content },
    });
  },

  async list(userId: string) {
    return prisma.optimizedCV.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getMarkdown(userId: string, id: string): Promise<{ cv: { content: string; company: string; jobTitle: string } }> {
    const cv = await prisma.optimizedCV.findFirst({ where: { id, userId } });
    if (!cv) throw new NotFoundError("CV");
    return { cv };
  },

  async getPdf(userId: string, id: string): Promise<{ buffer: Buffer; filename: string }> {
    const cv = await prisma.optimizedCV.findFirst({ where: { id, userId } });
    if (!cv) throw new NotFoundError("CV");

    logger.info({ userId, cvId: id }, "generating PDF");
    const buffer = await markdownToPdf(cv.content);
    const filename = `cv-${cv.company}-${cv.jobTitle}.pdf`
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "-");

    return { buffer, filename };
  },
};
