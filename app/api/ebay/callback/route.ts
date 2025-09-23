import { type NextRequest, NextResponse } from "next/server";

function basicAuth() {
  const id = process.env.APP_ID_PROD || "";
  const secret = process.env.CERT_ID_PROD || "";
  return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  // Flow A: Standard eBay OAuth (code/state)
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "missing code" }, { status: 400 });
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.REDIRECT_URI_PROD || "",
  });

  try {
    const res = await fetch(
      `${process.env.APP_ID_PROD}/identity/v1/oauth2/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: basicAuth(),
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
