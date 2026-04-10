import { handle } from "@/lib/server/handler";
import { AuthService } from "@/lib/server/services/auth.service";
import { loginSchema } from "@/lib/server/validation/schemas";

export const POST = handle(async (request) => {
  const body = loginSchema.parse(await request.json());
  const { cookie, user } = await AuthService.login(body);

  return Response.json(
    { ok: true, user },
    { headers: { "Set-Cookie": cookie } }
  );
});
