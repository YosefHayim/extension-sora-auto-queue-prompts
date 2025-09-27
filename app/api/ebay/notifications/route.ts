import crypto from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { ResponseStatus } from "@/types/api/request";

function sha256Hex(s: string) {
  const h = crypto.createHash("sha256");
  h.update(s, "utf8");
  return h.digest("hex");
}

export async function GET(req: NextRequest) {
  const challengeCode = req.nextUrl.searchParams.get("challenge_code");
  if (!challengeCode) {
    return NextResponse.json({}, {
      status: ResponseStatus.BAD_REQUEST,
      statusText: "missing challenge_code",
      headers: { "content-type": "application/json" },
    });
  }

  // Absolute endpoint URL as eBay sees it
  const endpoint = req.nextUrl.origin + req.nextUrl.pathname;

  // Newer flow: token is absent, so hash is challengeCode + endpoint
  const toHash = `${challengeCode}${endpoint}`;
  const challengeResponse = sha256Hex(toHash);

  return NextResponse.json({ challengeResponse }, {
    status: ResponseStatus.SUCCESS,
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

  return new Response(null, { status: ResponseStatus.NO_CONTENT });
}
