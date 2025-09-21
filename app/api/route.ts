import { NextResponse } from "next/server";
import { Ebay } from "@/lib/ebay/ebayClass";

export async function GET() {
  const ebay = new Ebay();
  try {
    const userAuthUrl = await ebay.generateUserAuthUrl();
    // const tokenInstance = await ebay.ebayAuthTokenInstance();
    // const currentPaymentPolicies = await ebay.getPaymentPolicies();
    // const currentFulfillmentPolicies = await ebay.getFulfillmentPolicies();
    // const currentReturnPolicies = await ebay.getReturnPolicies();
    // const currentAppToken = await ebay.generateClientCredentialToken();

    return NextResponse.redirect(userAuthUrl.toString());

    // return NextResponse.json({
    //   userAuthUrl: userAuthUrl ?? null,
    //   // tokenInstance: tokenInstance ?? null,
    //   // currentPaymentPolicies: currentPaymentPolicies ?? null,
    //   // currentReturnPolicies: currentReturnPolicies ?? null,
    //   // currentFulfillmentPolicies: currentFulfillmentPolicies ?? null,
    //   // currentAppToken: currentAppToken ?? null,
    // });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ received: body }, { status: 201 });
}
