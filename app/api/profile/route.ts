import { handle } from "@/lib/server/handler";
import { requireSession } from "@/lib/server/auth";
import { ProfileService } from "@/lib/server/services/profile.service";
import { updateProfileSchema } from "@/lib/server/validation/schemas";

export const GET = handle(async () => {
  const session = await requireSession();
  const profile = await ProfileService.get(session.sub);
  return Response.json({ profile });
});

export const PUT = handle(async (request) => {
  const session = await requireSession();
  const body = updateProfileSchema.parse(await request.json());
  const profile = await ProfileService.upsert(session.sub, body);
  return Response.json({ profile });
});
