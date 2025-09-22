// app/api/ebay/callback/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { Ebay } from "@/lib/ebay/ebayClass";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.cookies.get("ebay_oauth_state")?.value;

  if (!(code && state)) {
    return new NextResponse("Invalid state and missing code", { status: 400 });
  }
  if (!cookieState) {
    return new NextResponse(
      "State cookie missing; check cookie settings/domain/SameSite",
      { status: 400 }
    );
  }

  if (state !== cookieState) {
    return new NextResponse("Invalid state", { status: 400 });
  }

  try {
    const ebay = new Ebay();
    const tokens = await ebay.auth.getUserAccessToken(code);
    console.log('tokens: ', tokens)

    const res = NextResponse.redirect('/');

    res.cookies.set("ebay_oauth_state", "", { maxAge: 0, path: "/" });
    return res;
  } catch (err) {
    const message = (err as Error)?.message || "Unknown error";
    return new NextResponse(`Token exchange failed: ${message}`, {
      status: 400,
    });
  }
}
