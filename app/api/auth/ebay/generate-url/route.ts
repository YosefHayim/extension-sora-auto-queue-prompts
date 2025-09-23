import { NextResponse } from "next/server";
import ebayService from "@/lib/ebayApiClient/ebay-api-client";

export function GET() {
  const userAuthUrl = ebayService.auth.generateUserAuthUrl();
  return NextResponse.json({
    userAuthUrl,
  });
}
