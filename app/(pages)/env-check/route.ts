import { NextRequest, NextResponse } from "next/server";

export async function GET(_request:NextRequest){
  return new NextResponse({
    appId:process.env.NEXT_PUBLIC_APP_ID_PROD,
    devId:process.env.NEXT_PUBLIC_DEV_ID_PROD,
    certId:process.env.NEXT_PUBLIC_CERT_ID_PROD
  })
}