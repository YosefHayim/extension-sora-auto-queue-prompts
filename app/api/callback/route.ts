import { type NextRequest, NextResponse } from "next/server";

const TOKEN_URL = "https://api.ebay.com/identity/v1/oauth2/token";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieState = req.cookies.get("ebay_oauth_state")?.value;

  if (!(code && state) || state !== cookieState) {
    return new NextResponse("Invalid state or missing code", { status: 400 });
  }

  const basic = Buffer.from(
    `${process?.env?.APP_ID_PROD || ""}:${process?.env?.CERT_ID_PROD || ""}`
  ).toString("base64");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: process?.env?.REDIRECT_URI_PROD || "",
  });

  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    return new NextResponse(`Token exchange failed: ${errText}`, {
      status: 400,
    });
  }

  const tokens = await tokenRes.json();
  // TODO: persist tokens securely (db/kv). Example cookie cleanup:
  return new NextResponse(tokens);
}
