import { type NextRequest, NextResponse } from "next/server";
import { config, oAuth2Client } from "@/config";
import { GOOGLE_SCOPES } from "@/lib/definitions";

export async function GET(_req: NextRequest) {
  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: GOOGLE_SCOPES.join(" "),
    redirect_uri: config.google.redirectUri,
  });

  return NextResponse.json(authorizeUrl);
}
