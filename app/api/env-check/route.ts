import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_APP_ID_PROD: process.env.NEXT_PUBLIC_APP_ID_PROD,
    NEXT_PUBLIC_CERT_ID_PROD: process.env.NEXT_PUBLIC_CERT_ID_PROD,
    NEXT_PUBLIC_DEV_ID_PROD: process.env.NEXT_PUBLIC_DEV_ID_PROD,
    DOPPLER_CONFIG: process.env.DOPPLER_CONFIG,
    NEXT_PUBLIC_REDIRECT_URI_PROD: process.env.NEXT_PUBLIC_REDIRECT_URI_PROD,
  });
}
