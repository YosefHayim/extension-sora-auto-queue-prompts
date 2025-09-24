import { type NextRequest, NextResponse } from "next/server";
import { ResponseStatus } from "@/types/api/request";


export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const seller = url.searchParams.get("_ssn");
  const page = url.searchParams.get("_pgn") ?? "1";

  if (!seller) {
    return NextResponse.json({
      status: "error",
      message: "Missing _ssn (seller ID).",
    });
  }

  const ebayUrl = `https://www.ebay.com/sch/i.html?_ssn=${encodeURIComponent(seller)}&_ipg=240&_pgn=${encodeURIComponent(page)}&LH_Sold=1&_sacat=0`;

  try {
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-User": "1",
      "Sec-Fetch-Dest": "document",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
      "Referer": "https://www.ebay.com/",
    };

    const r = await fetch(ebayUrl, {
      cache: "no-store",
      headers,
      redirect: "follow",
    });

    if (!r.ok) {
      return NextResponse.json({
        status: ResponseStatus.BAD_REQUEST,
        message: `eBay request failed: ${r.status}`,
      });
    }

    const html = await r.text();
    return NextResponse.json({ status: ResponseStatus.SUCCESS, data: html });
  } catch (e) {
    return NextResponse.json({
      status: ResponseStatus.INTERNAL_ERROR,
      message: "Fetch failed.",
      error: String(e),
    });
  }
}