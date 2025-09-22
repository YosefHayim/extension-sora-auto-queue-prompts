import { NextResponse } from "next/server";
import { Ebay } from "@/lib/ebay/ebayClass";

export async function GET() {
  const ebay = new Ebay();
  try {
    const userAuthUrl = await ebay.auth.generateUserAuthUrl();
    const tokenInstance = await ebay.auth.instance();
    const currentPaymentPolicies =
      await ebay.endpoints.accountV1.getPaymentPolicies();
    const currentFulfillmentPolicies =
      await ebay.endpoints.accountV1.getFulfillmentPolicies();
    const currentReturnPolicies =
      await ebay.endpoints.accountV1.getReturnPolicies();
    const currentAppToken = await ebay.auth.generateClientCredentialToken();

    return NextResponse.json({
      userAuthUrl: userAuthUrl ?? null,
      tokenInstance: tokenInstance ?? null,
      currentPaymentPolicies: currentPaymentPolicies ?? null,
      currentReturnPolicies: currentReturnPolicies ?? null,
      currentFulfillmentPolicies: currentFulfillmentPolicies ?? null,
      currentAppToken: currentAppToken ?? null,
    });
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
