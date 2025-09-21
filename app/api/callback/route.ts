import { type NextRequest, NextResponse } from "next/server";
import { Ebay } from "@/lib/ebay/ebayClass";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieState = req.cookies.get("ebay_oauth_state")?.value;

  if (!(code && state) || state !== cookieState) {
    return new NextResponse("Invalid state or missing code", { status: 400 });
  }

  try {
    const ebay = new Ebay();
    const tokens = await ebay.getUserAccessToken(code);

    console.log("tokens received: ", tokens);

    // TODO: persist tokens securely in DB or KV store
    const res = NextResponse.redirect(`${origin}/dashboard`);
    res.cookies.set("ebay_oauth_state", "", { maxAge: 0, path: "/" });
    return res;
  } catch (err) {
    return new NextResponse(
      `Token exchange failed: ${(err as Error & { message: string }).message}`,
      {
        status: 400,
      }
    );
  }
}
