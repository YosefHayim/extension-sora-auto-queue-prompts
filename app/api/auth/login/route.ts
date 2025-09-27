import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { type NextRequest, NextResponse } from "next/server";
import { ResponseStatus } from "@/types/api/request";

const POST = async (req: NextRequest, _res: NextResponse) => {
  const body = await req.json();
  const { email, password } = body;

  const auth = getAuth();

  const { user } = await signInWithEmailAndPassword(auth, email, password);

  if (!user) {
    return NextResponse.json({ error: "Register user failed" }, { status: ResponseStatus.BAD_REQUEST });
  }

  return NextResponse.json({ data: user }, { status: ResponseStatus.SUCCESS });
};

export default POST;
