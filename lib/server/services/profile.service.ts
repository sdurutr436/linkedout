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
      preferences: input.preferences ? JSON.stringify(input.preferences) : undefined,
    };

    return prisma.profile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  },

  async saveInfojobsToken(userId: string, accessToken: string, expiresAt: Date) {
    return prisma.profile.upsert({
      where: { userId },
      update: { infojobsToken: accessToken, infojobsTokenExpiry: expiresAt },
      create: { userId, infojobsToken: accessToken, infojobsTokenExpiry: expiresAt },
    });
  },

  async getOrThrow(userId: string) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError("Profile");
    return profile;
  },

};
