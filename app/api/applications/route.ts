import { handle } from "@/lib/server/handler";
import { requireSession } from "@/lib/server/auth";
import { ApplicationsService } from "@/lib/server/services/applications.service";
import { createApplicationSchema } from "@/lib/server/validation/schemas";

export const GET = handle(async () => {
  const session = await requireSession();
  const applications = await ApplicationsService.list(session.sub);
  return Response.json({ applications });
});

export const POST = handle(async (request) => {
  const session = await requireSession();
  const body = createApplicationSchema.parse(await request.json());
  const application = await ApplicationsService.create(session.sub, body);
  return Response.json({ application }, { status: 201 });
});
