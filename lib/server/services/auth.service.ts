import bcrypt from "bcryptjs";
import { prisma } from "../db";
import { signToken, setTokenCookie } from "../auth";
import { AuthError, ConflictError } from "../errors";
import type { z } from "zod";
import type { loginSchema, registerSchema } from "../validation/schemas";

const BCRYPT_ROUNDS = 12;

export const AuthService = {
  async login(input: z.infer<typeof loginSchema>) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw new AuthError("Incorrect credentials");

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) throw new AuthError("Incorrect credentials");

    const token = await signToken({ sub: user.id, email: user.email, name: user.name });
    return {
      token,
      cookie: setTokenCookie(token),
      user: { id: user.id, email: user.email, name: user.name },
    };
  },

  async register(input: z.infer<typeof registerSchema>) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ConflictError("Email already registered");

    const password = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await prisma.user.create({
      data: { email: input.email, password, name: input.name },
    });

    const token = await signToken({ sub: user.id, email: user.email, name: user.name });
    return {
      token,
      cookie: setTokenCookie(token),
      user: { id: user.id, email: user.email, name: user.name },
    };
  },
};
