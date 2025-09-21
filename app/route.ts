import { Ebay } from "@/lib/ebay/ebayClass";

export async function GET(_request: Request) {
  const ebay = new Ebay();
  const instance = await ebay.auth.instance();
  console.log(instance);
  return new Response("homepage page ssr");
}
