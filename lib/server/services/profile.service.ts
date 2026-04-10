import { prisma } from "../db";
import { NotFoundError } from "../errors";
import type { z } from "zod";
import type { updateProfileSchema } from "../validation/schemas";

export const ProfileService = {
  async get(userId: string) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    return profile;
  },

  async upsert(userId: string, input: z.infer<typeof updateProfileSchema>) {
    const data = {
      cvContent: input.cvContent,
      cvFileName: input.cvFileName,
      titulaciones: input.titulaciones,
      experiencia: input.experiencia,
      linkedinEmail: input.linkedinEmail,
      linkedinPassword: input.linkedinPassword,
      infojobsEmail: input.infojobsEmail,
      infojobsPassword: input.infojobsPassword,
      preferences: input.preferences ? JSON.stringify(input.preferences) : undefined,
    };

    return prisma.profile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  },

  /** Retrieve profile and throw if not found (used by services that require it). */
  async getOrThrow(userId: string) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError("Profile");
    return profile;
  },
};
