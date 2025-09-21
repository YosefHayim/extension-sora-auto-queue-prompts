import { getEnv } from "@daniel-rose/envex/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  const allEnv = getEnv();

  return new NextResponse({
    APP_ID_PROD: allEnv.APP_ID_PROD || "",
    DEV_ID_PROD: allEnv.DEV_ID_PROD || "",
    CERT_ID_PROD: allEnv.CERT_ID_PROD || "",
    DOPPLER_CONFIG: allEnv.DOPPLER_CONFIG || "",
    DOPPLER_ENVIRONMENT: allEnv.DOPPLER_ENVIRONMENT || "",
    REDIRECT_URI_PROD: allEnv.REDIRECT_URI_PROD || "",
  });
}
