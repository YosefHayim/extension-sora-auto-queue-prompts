import type { GetTokenResponse } from "google-auth-library/build/src/auth/oauth2client";
import { type NextRequest, NextResponse } from "next/server";
import { oAuth2Client } from "@/lib/config";
import { ResponseStatus } from "@/lib/definitions";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ status: "error", reason: "missing code" }, { status: ResponseStatus.BAD_REQUEST });
  }

  let r: GetTokenResponse | null = null;

  try {
    r = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(r.tokens);
    return NextResponse.json({ status: ResponseStatus.SUCCESS, data: r });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: ResponseStatus.INTERNAL_ERROR, data: r });
  }
}
