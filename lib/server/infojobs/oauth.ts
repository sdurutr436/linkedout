import { ExternalServiceError } from "../errors";

const AUTH_URL = "https://www.infojobs.net/api/oauth/user-authorize/index.xhtml";
const TOKEN_URL = "https://api.infojobs.net/oauth/authorize";
const SCOPE = "basic candidate_read candidate_write";

export function buildAuthUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.INFOJOBS_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}

export async function exchangeCode(code: string, redirectUri: string): Promise<OAuthTokens> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.INFOJOBS_CLIENT_ID ?? "",
      client_secret: process.env.INFOJOBS_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ExternalServiceError("Infojobs", `Token exchange failed: ${res.status} ${body}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  const expiresAt = new Date(Date.now() + (data.expires_in ?? 3600) * 1000);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
  };
}
