import { NextRequest } from "next/server";
import { handle } from "@/lib/server/handler";
import { requireSession } from "@/lib/server/auth";
import { ApplicationsService } from "@/lib/server/services/applications.service";
import { updateApplicationStatusSchema } from "@/lib/server/validation/schemas";

type Params = { params: Promise<{ id: string }> };

export const PATCH = handle(async (request: NextRequest, context: unknown) => {
  const session = await requireSession();
  const { id } = await (context as Params).params;
  const body = updateApplicationStatusSchema.parse(await request.json());
  const application = await ApplicationsService.updateStatus(session.sub, id, body);
  return Response.json({ application });
});

export const DELETE = handle(async (_request: NextRequest, context: unknown) => {
  const session = await requireSession();
  const { id } = await (context as Params).params;
  await ApplicationsService.delete(session.sub, id);
  return Response.json({ ok: true });
});
