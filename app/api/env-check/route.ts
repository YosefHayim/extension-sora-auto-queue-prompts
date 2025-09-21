import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    APP_ID_PROD: process.env.APP_ID_PROD,
    CERT_ID_PROD: process.env.CERT_ID_PROD,
    DEV_ID_PROD: process.env.DEV_ID_PROD,
    DOPPLER_CONFIG: process.env.DOPPLER_CONFIG,
    REDIRECT_URI_PROD: process.env.REDIRECT_URI_PROD,
  });
}
