import { type NextRequest, NextResponse } from "next/server";
import { , oAuth2Client, serverConfig } from "@/lib/server/server-config";

export async function GET(_req: NextRequest) {
  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"].join(" "),
    redirect_uri: serverConfig.google.redirectUri,
  });

  return NextResponse.json(authorizeUrl);
}