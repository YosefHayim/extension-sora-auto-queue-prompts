import { type NextRequest, NextResponse } from "next/server";
import { EbayService } from "@/lib/ebayApiClient/ebay-api-client";


export async function GET(req: NextRequest) {
  const ebay = new EbayService();
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "missing code" }, { status: 400 });
  }

  const data = await ebay.auth.getUserAccessToken(code)
  const accessTokenExpiresIn = new Date(Date.now() + data.expires_in * 1000).toString()
  const refreshTokenExpiresIn = new Date(Date.now() + data.refresh_token_expires_in * 1000).toString()

  return NextResponse.json({ status: "success", accessTokenExpiresIn, refreshTokenExpiresIn, data });
}
