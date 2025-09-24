import type { GetTokenResponse } from "google-auth-library/build/src/auth/oauth2client";
import { type NextRequest, NextResponse } from "next/server";
import { oAuth2Client } from "@/config";
import { ResponseStatus } from "@/lib/definitions";
import { formatExpiredDate } from "@/lib/utils";

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
    return NextResponse.json({ status: ResponseStatus.BAD_REQUEST, reason: "missing code" });
  }

  let r: GetTokenResponse | null = null;

  try {
    r = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(r.tokens);

    return NextResponse.json({
      status: ResponseStatus.SUCCESS,
      accessTokenExpiresWithin: formatExpiredDate(r?.tokens?.expiry_date || 0),
      data: r.tokens,
    });
  } catch (error) {
    console.error("OAuth token exchange failed:", error);
    return NextResponse.json({ status: ResponseStatus.INTERNAL_ERROR, data: r });
  }
}
