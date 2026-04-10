import { handle } from "@/lib/server/handler";
import { requireSession } from "@/lib/server/auth";

export const GET = handle(async () => {
  const session = await requireSession();
  return Response.json({ user: { id: session.sub, email: session.email, name: session.name } });
});
