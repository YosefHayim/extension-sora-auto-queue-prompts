export async function GET(_request: Request) {
  return new Response("ebay page ssr");
}

export async function POST(request: Request): Promise<Response> {
  if (request.body) {
    console.log("eBay API request received:", await request.text());
    return new Response("Notification received", { status: 200 });
  }
  return new Response("No request body found", { status: 400 });
}
