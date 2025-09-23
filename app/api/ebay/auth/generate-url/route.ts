import { NextResponse } from "next/server";
import { EbayService } from "@/lib/ebayApiClient/ebay-api-client";

export function GET() {
  const ebay = new EbayService();
  const userAuthUrl = ebay.auth.generateUserAuthUrl();

  return NextResponse.json({
    userAuthUrl,
  });
}
