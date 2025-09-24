import { type NextRequest, NextResponse } from "next/server";
import ebayService from "@/lib/ebayApiClient/ebay-api-client";
import { ResponseStatus } from "@/types/api/request";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ status: "error", reason: "missing code" }, { status: ResponseStatus.BAD_REQUEST });
  }

  ebayService.code = code;
  const { data, accessTokenExpiresWithin, refreshTokenExpiresWithin } = await ebayService.auth.getUserAccessTokenPayload();

  return NextResponse.json({
    status: "success",
    accessTokenExpiresWithin,
    refreshTokenExpiresWithin,
    data,
  });
}
