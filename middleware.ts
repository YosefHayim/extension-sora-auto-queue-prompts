import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  console.log("--- Incoming Request ---");
  console.log("Method:", request.method);
  console.log("URL:", request.nextUrl.href);
  console.log("Headers:");
  request.headers.forEach((value, key) => {
    console.log(`  ${key}: ${value}`);
  });

  console.log("------------------------");

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*"],
};
