import { prisma } from "../db";
import { appendRow } from "../sheets/client";
import { NotFoundError, ForbiddenError } from "../errors";
import logger from "../logger";
import type { z } from "zod";
import type { createApplicationSchema, updateApplicationStatusSchema } from "../validation/schemas";

export const ApplicationsService = {
  async list(userId: string) {
    return prisma.application.findMany({
      where: { userId },
      orderBy: { appliedAt: "desc" },
      include: { optimizedCV: { select: { id: true, jobTitle: true } } },
    });
  },

  async create(userId: string, input: z.infer<typeof createApplicationSchema>) {
    const now = new Date();

    const application = await prisma.application.create({
      data: {
        userId,
        company: input.company,
        position: input.position,
        platform: input.platform,
        jobUrl: input.jobUrl,
        jobId: input.jobId,
        salary: input.salary,
        contactPerson: input.contactPerson,
        companySummary: input.companySummary,
        optimizedCVId: input.optimizedCVId,
        status: "enviado",
        appliedAt: now,
      },
    });

    logger.info({ userId, applicationId: application.id, company: input.company }, "application created");

    // Sync to Google Sheets (non-blocking — failure does not affect response)
    const sheetsId = process.env.GOOGLE_SHEETS_ID;
    if (sheetsId) {
      appendRow(sheetsId, {
        company: input.company,
        platform: input.platform,
        date: now.toLocaleDateString("es-ES"),
        time: now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        contactPerson: input.contactPerson ?? "",
        companySummary: input.companySummary ?? "",
        position: input.position,
        salary: input.salary ?? "",
        status: "enviado",
      }).catch((err) => logger.error({ err, applicationId: application.id }, "Google Sheets sync failed"));
    }

    return application;
  },

  async updateStatus(userId: string, id: string, input: z.infer<typeof updateApplicationStatusSchema>) {
    const existing = await prisma.application.findFirst({ where: { id } });
    if (!existing) throw new NotFoundError("Application");
    if (existing.userId !== userId) throw new ForbiddenError();

    const updated = await prisma.application.update({
      where: { id },
      data: { status: input.status },
    });

    logger.info({ userId, applicationId: id, status: input.status }, "application status updated");
    return updated;
  },

  async delete(userId: string, id: string) {
    const existing = await prisma.application.findFirst({ where: { id } });
    if (!existing) throw new NotFoundError("Application");
    if (existing.userId !== userId) throw new ForbiddenError();

    await prisma.application.delete({ where: { id } });
    logger.info({ userId, applicationId: id }, "application deleted");
  },
};
