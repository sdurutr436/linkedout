import { handle } from "@/lib/server/handler";
import { requireSession } from "@/lib/server/auth";
import { CVService } from "@/lib/server/services/cv.service";
import { optimizeCVSchema } from "@/lib/server/validation/schemas";

export const POST = handle(async (request) => {
  const session = await requireSession();
  const body = optimizeCVSchema.parse(await request.json());
  const cv = await CVService.optimize(session.sub, body);
  return Response.json({ cv }, { status: 201 });
});

export const GET = handle(async () => {
  const session = await requireSession();
  const cvs = await CVService.list(session.sub);
  return Response.json({ cvs });
});
