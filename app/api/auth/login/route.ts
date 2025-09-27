import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { type NextRequest, NextResponse } from "next/server";
import { ResponseStatus } from "@/types/api/request";

export const POST = async (req: NextRequest, _res: NextResponse) => {
  try {
    const body = await req.json();
    const { email, password } = body;

    const auth = getAuth();

    const { user } = await signInWithEmailAndPassword(auth, email, password);
    console.log(user)

    if (!user) {
      return NextResponse.json({ error: "Register user failed" }, { status: ResponseStatus.BAD_REQUEST });
    }

    return NextResponse.json({ data: user }, { status: ResponseStatus.SUCCESS });
  } catch (error) {
    return NextResponse.json(null, {
      status: (error as Error).status, statusText: (error as Error).message
    })
  }
};

