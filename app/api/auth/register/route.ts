import { createUserWithEmailAndPassword, getAuth, updateProfile } from "firebase/auth";
import { NextResponse } from "next/server";
import { ResponseStatus } from "@/types/api/request";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, firstName, lastName } = body;

  const auth = getAuth();

  const { user } = await createUserWithEmailAndPassword(auth, email, password)

  await updateProfile(user, { displayName: `${firstName} ${lastName}` })

  if (!user) {
    return NextResponse.json({ status: ResponseStatus.BAD_REQUEST, message: 'Register user failed' });
  }

  return NextResponse.json({ status: ResponseStatus.SUCCESS, data: user });
}
