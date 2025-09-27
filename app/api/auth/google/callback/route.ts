import type { GetTokenResponse } from "google-auth-library/build/src/auth/oauth2client";
import { type NextRequest, NextResponse } from "next/server";
import { formatExpiredDate } from "@/lib/client/utils";
import { oAuth2Client } from "@/lib/server/server-config";
import { ResponseStatus } from "@/types/api/request";

oAuth2Client.on("tokens", (tokens) => {
  if (tokens.refresh_token) {
    console.log("Storing refresh token:", tokens.refresh_token);
  }
  if (tokens.access_token) {
    console.log("New access token:", tokens.access_token);
  }
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ reason: "missing code" }, { status: ResponseStatus.BAD_REQUEST });
  }

  let r: GetTokenResponse | null = null;

  try {
    r = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(r.tokens);

    return NextResponse.json({
      accessTokenExpiresWithin: formatExpiredDate(r?.tokens?.expiry_date || 0),
      data: r.tokens,
    }, { status: ResponseStatus.SUCCESS, });
  } catch (error) {
    console.error("OAuth token exchange failed:", error);
    return NextResponse.json({ data: r }, { status: ResponseStatus.INTERNAL_ERROR });
  }
}
