import crypto from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";

function sha256Hex(s: string) {
  const h = crypto.createHash("sha256");
  h.update(s, "utf8");
  return h.digest("hex");
}

export async function GET(req: NextRequest) {
  const challengeCode = req.nextUrl.searchParams.get("challenge_code");
  if (!challengeCode) {
    return new NextResponse(JSON.stringify({ error: "missing challenge_code" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  // Absolute endpoint URL as eBay sees it
  const endpoint = req.nextUrl.origin + req.nextUrl.pathname;

  // Newer flow: token is absent, so hash is challengeCode + endpoint
  const toHash = `${challengeCode}${endpoint}`;
  const challengeResponse = sha256Hex(toHash);

  return new NextResponse(JSON.stringify({ challengeResponse }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-ebay-signature") || "";

  console.log("eBay deletion notification received:", raw);
  console.log("x-ebay-signature:", signature);

  // TODO: implement signature verification using Notification API public key
  // TODO: delete user data by userId/eiasToken, log/audit

  return new Response(null, { status: 204 });
}

