import { handle } from "@/lib/server/handler";
import { requireSession } from "@/lib/server/auth";
import { JobsService } from "@/lib/server/services/jobs.service";
import { searchJobsSchema } from "@/lib/server/validation/schemas";

export const POST = handle(async (request) => {
  const session = await requireSession();
  const body = searchJobsSchema.parse(await request.json());
  const jobs = await JobsService.search(session.sub, body);
  return Response.json({ jobs });
});
