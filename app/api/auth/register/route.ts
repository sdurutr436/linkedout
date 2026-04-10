import { handle } from "@/lib/server/handler";
import { AuthService } from "@/lib/server/services/auth.service";
import { registerSchema } from "@/lib/server/validation/schemas";

export const POST = handle(async (request) => {
  const body = registerSchema.parse(await request.json());
  const { cookie, user } = await AuthService.register(body);

  return Response.json(
    { ok: true, user },
    { status: 201, headers: { "Set-Cookie": cookie } }
  );
});
