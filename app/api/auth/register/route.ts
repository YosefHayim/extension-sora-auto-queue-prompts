import { NextResponse } from "next/server";
export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  console.log('recieved on backend: ', { email, password });

  return NextResponse.json({ email, password });
}