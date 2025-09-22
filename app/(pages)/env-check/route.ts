import { type NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  return new NextResponse({
    appId: process.env.APP_ID_PROD,
    devId: process.env.DEV_ID_PROD,
    certId: process.env.CERT_ID_PROD,
  });
}
