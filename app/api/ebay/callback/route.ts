import { type NextRequest, NextResponse } from "next/server";
import { EbayService } from "@/lib/ebay/ebay-api-client";

function toBasicAuth(id: string, secret: string) {
  // Works in Node runtime. If you run on edge, replace with btoa(TextEncoder...).
  return Buffer.from(`${id}:${secret}`).toString("base64");
}

export async function GET(req: NextRequest) {
  const ebay = new EbayService();
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "missing code" }, { status: 400 });
  }

  if (!(ebay.clientId && ebay.clientSecret && ebay.redirectUri)) {
    return NextResponse.json(
      {
        error: "misconfigured_env",
        details:
          "CLIENT_ID_PROD, CLIENT_SECRET_PROD, REDIRECT_URI_PROD are required",
      },
      { status: 500 }
    );
  }

  const form = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: ebay.redirectUri,
  });

  try {
    const res = await fetch(ebay.identityBaseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${toBasicAuth(ebay.clientId, ebay.clientSecret)}`,
      },
      body: form.toString(),
      cache: "no-store",
    });

    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { error: "token_exchange_failed", status: res.status, body: text },
        { status: 502 }
      );
    }

    const json = JSON.parse(text) as {
      access_token: string;
      expires_in: number;
      refresh_token?: string;
      refresh_token_expires_in?: number;
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
