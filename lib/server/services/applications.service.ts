import { prisma } from "../db";
import { appendRow } from "../sheets/client";
import { NotFoundError } from "../errors";
import logger from "../logger";
import type { z } from "zod";
import type { createApplicationSchema, updateApplicationStatusSchema } from "../validation/schemas";

const STATUS_SENT = "enviado";

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
        status: STATUS_SENT,
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
        status: STATUS_SENT,
      }).catch((err) => logger.error({ err, applicationId: application.id }, "Google Sheets sync failed"));
    }

    return application;
  },

  async updateStatus(userId: string, id: string, input: z.infer<typeof updateApplicationStatusSchema>) {
    const existing = await prisma.application.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundError("Application");

    const updated = await prisma.application.update({
      where: { id },
      data: { status: input.status },
    });

    logger.info({ userId, applicationId: id, status: input.status }, "application status updated");
    return updated;
  },

  async delete(userId: string, id: string) {
    const existing = await prisma.application.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundError("Application");

    await prisma.application.delete({ where: { id } });
    logger.info({ userId, applicationId: id }, "application deleted");
  },
};
