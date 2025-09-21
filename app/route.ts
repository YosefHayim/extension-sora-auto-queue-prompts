import { Ebay } from "@/lib/ebay/ebayClass";

export async function GET(_request: Request) {
  return new Response({
    clientId: process?.env?.APP_ID_PROD || "",
    clientSecret: process?.env?.CERT_ID_PROD || "",
    redirectUri: process?.env?.REDIRECT_URI_PROD || "",
  });
}
