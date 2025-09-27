import { type NextRequest, NextResponse } from "next/server";
import { GOOGLE_SCOPES } from "@/lib/definitions";
import { config, oAuth2Client } from "@/lib/server-config";

export async function GET(_req: NextRequest) {
  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: GOOGLE_SCOPES.join(" "),
    redirect_uri: config.google.redirectUri,
  });

  return NextResponse.json(authorizeUrl);
}
