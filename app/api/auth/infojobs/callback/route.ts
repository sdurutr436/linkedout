import { NextRequest, NextResponse } from "next/server";
import { handle } from "@/lib/server/handler";
import { requireSession } from "@/lib/server/auth";
import { exchangeCode } from "@/lib/server/infojobs/oauth";
import { ProfileService } from "@/lib/server/services/profile.service";
import { ValidationError } from "@/lib/server/errors";

export const GET = handle(async (request: NextRequest) => {
  const session = await requireSession();
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  if (!code) throw new ValidationError("Missing OAuth code");

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/infojobs/callback`;
  const tokens = await exchangeCode(code, redirectUri);

  await ProfileService.saveInfojobsToken(session.sub, tokens.accessToken, tokens.expiresAt);

  return NextResponse.redirect(new URL("/profile?infojobs=connected", request.url));
});
