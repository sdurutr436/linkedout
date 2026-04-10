import { NextRequest, NextResponse } from "next/server";
import { handle } from "@/lib/server/handler";
import { requireSession } from "@/lib/server/auth";
import { buildAuthUrl } from "@/lib/server/infojobs/oauth";

export const GET = handle(async (request: NextRequest) => {
  await requireSession();
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/infojobs/callback`;
  return NextResponse.redirect(buildAuthUrl(redirectUri));
});
