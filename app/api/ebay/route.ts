import { NextResponse } from "next/server";
import { Ebay } from "@/lib/ebay/ebayClass";

export async function GET() {
  const ebay = new Ebay();
  try {
    const userAuthUrl = await ebay.auth.generateUserAuthUrl();

    return NextResponse.json({
      userAuthUrl: userAuthUrl ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}