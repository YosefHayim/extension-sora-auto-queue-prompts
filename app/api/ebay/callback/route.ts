// app/api/ebay/callback/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { Ebay } from "@/lib/ebay/ebayClass";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  // Flow A: Standard eBay OAuth (code/state)
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.cookies.get("ebay_oauth_state")?.value;

  // Flow B: Direct token handoff (?ebaytkn=&tknexp=YYYY-MM-DD+HH%3AMM%3ASS&username=...)
  const ebaytkn = url.searchParams.get("ebaytkn");
  const tknexpRaw = url.searchParams.get("tknexp");
  const username = url.searchParams.get("username");

  // Prefer Flow A when present; otherwise try Flow B
  if (code || state) {
    if (!(code && state)) {
      return new NextResponse("Invalid state and missing code", {
        status: 400,
      });
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

      const res = NextResponse.redirect("/");
      res.cookies.set("ebay_oauth_state", "", { maxAge: 0, path: "/" });

      // Optional: surface access/refresh in httpOnly cookies if your app expects it
      // Adjust names/retention to your storage strategy.
      if (tokens?.access_token) {
        res.cookies.set("ebay_access_token", tokens.access_token, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
          // If tokens.expires_in is seconds from now, persist accordingly
          maxAge:
            typeof tokens.expires_in === "number"
              ? tokens.expires_in
              : undefined,
        });
      }
      if (
        tokens?.refresh_token &&
        typeof tokens?.refresh_token_expires_in === "number"
      ) {
        res.cookies.set("ebay_refresh_token", tokens.refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
          maxAge: tokens.refresh_token_expires_in,
        });
      }

      return res;
    } catch (err) {
      const message = (err as Error)?.message || "Unknown error";
      return new NextResponse(`Token exchange failed: ${message}`, {
        status: 400,
      });
    }
  }

  // Flow B
  if (ebaytkn || tknexpRaw || username) {
    if (!(ebaytkn && tknexpRaw && username)) {
      return new NextResponse("Missing ebaytkn, tknexp, or username", {
        status: 400,
      });
    }

    // tknexp example: "2027-03-16 20:19:40" (space may arrive as '+')
    const decodedExp = decodeURIComponent(tknexpRaw).replace("+", " ");
    const expMs = Date.parse(decodedExp);
    if (Number.isNaN(expMs)) {
      return new NextResponse("Invalid tknexp format", { status: 400 });
    }

    const maxAge = Math.max(0, Math.floor((expMs - Date.now()) / 1000));

    const res = NextResponse.redirect("/");

    // Clear any prior state cookie defensively
    res.cookies.set("ebay_oauth_state", "", { maxAge: 0, path: "/" });

    // Persist token + metadata (httpOnly)
    res.cookies.set("ebay_access_token", ebaytkn, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    res.cookies.set("ebay_token_exp", String(expMs), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    res.cookies.set("ebay_username", username, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return res;
  }

  return new NextResponse("Unsupported callback parameters", { status: 400 });
}
