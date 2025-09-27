import { type NextRequest, NextResponse } from "next/server";
import ebayService from "@/lib/ebayApiClient/ebay-api-client";
import { ResponseStatus } from "@/types/api/request";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json(null, { status: ResponseStatus.BAD_REQUEST, statusText: "missing code" });
  }

  ebayService.code = code;
  const { data, accessTokenExpiresWithin, refreshTokenExpiresWithin } = await ebayService.auth.getUserAccessTokenPayload();

  return NextResponse.json({
    accessTokenExpiresWithin,
    refreshTokenExpiresWithin,
    data,
  }, { status: ResponseStatus.SUCCESS });
}
