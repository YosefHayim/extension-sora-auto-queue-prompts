import { type NextRequest, NextResponse } from "next/server";
import { ResponseStatus } from "@/lib/definitions";
import { EbayService } from "@/lib/ebayApiClient/ebay-api-client";

export async function GET(req: NextRequest) {
  const ebay = new EbayService();
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ status: "error", reason: "missing code" }, { status: ResponseStatus.BAD_REQUEST });
  }

  ebay.code = code;
  const { data, accessTokenExpiresWithin, refreshTokenExpiresWithin } = await ebay.auth.getUserAccessTokenPayload();

  return NextResponse.json({
    status: "success",
    accessTokenExpiresWithin,
    refreshTokenExpiresWithin,
    data,
  });
}
