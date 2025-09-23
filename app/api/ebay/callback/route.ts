import { type NextRequest, NextResponse } from "next/server";
import { EbayService } from "@/lib/ebay/ebay-api-client";

export async function GET(req: NextRequest) {
  const ebay = new EbayService();

  const url = new URL(req.url);

  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "missing code" }, { status: 400 });
  }

  const body = {
    grant_type: "authorization_code",
    code,
    redirect_uri: ebay.redirectUri,
  };

  try {
    const res = await fetch(
      `${process.env.CLIENT_ID_PROD}/identity/v1/oauth2/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${ebay.clientId}:${ebay.clientSecret}`).toString("base64")}`,
        },
        body,
        cache: "no-store",
      }
    );

    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        {
          error: "token exchange failed",
          status: res.status,
          body: text,
        },
        { status: 502 }
      );
    }

    const json = JSON.parse(text) as {
      access_token: string;
      expires_in: number;
      refresh_token: string;
      refresh_token_expires_in: number;
      token_type: string;
    };

    return NextResponse.json({ status: "success", data: json });
  } catch (err) {
    return NextResponse.json(
      { error: "exception", message: String(err) },
      { status: 500 }
    );
  }
}
