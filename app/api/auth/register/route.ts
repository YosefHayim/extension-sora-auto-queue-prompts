import { NextResponse } from "next/server";
import { fireBaseAdminApp } from "@/lib/server-config";
import { ResponseStatus } from "@/types/api/request";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, firstName, lastName, phoneNumber } = body;

  const admin = fireBaseAdminApp.auth();

  const user = await admin.createUser({
    email,
    password,
    displayName: `${firstName} ${lastName}`,
    disabled: false,
    emailVerified: false,
    phoneNumber,
  });

  if (!user) {
    return NextResponse.json({ status: ResponseStatus.BAD_REQUEST, message: "Register user failed" });
  }

  console.log("user created: ", user);

  return NextResponse.json({ status: ResponseStatus.SUCCESS, data: user });
}
