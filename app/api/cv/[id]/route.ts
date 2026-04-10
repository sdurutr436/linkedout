import { NextRequest } from "next/server";
import { handle } from "@/lib/server/handler";
import { requireSession } from "@/lib/server/auth";
import { CVService } from "@/lib/server/services/cv.service";

type Params = { params: Promise<{ id: string }> };

export const GET = handle(async (request: NextRequest, context: unknown) => {
  const session = await requireSession();
  const { id } = await (context as Params).params;
  const { searchParams } = new URL(request.url);

  if (searchParams.get("format") === "pdf") {
    const { buffer, filename } = await CVService.getPdf(session.sub, id);
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  const { cv } = await CVService.getMarkdown(session.sub, id);
  const filename = `cv-${cv.company}-${cv.jobTitle}.md`
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-");

  return new Response(cv.content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
});
