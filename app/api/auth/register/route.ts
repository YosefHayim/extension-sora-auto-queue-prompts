import { NextResponse } from "next/server";
import { adminRole } from "@/lib/server/server-config";
import { ResponseStatus } from "@/types/api/request";

export async function POST(request: Request, _res: NextResponse) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phoneNumber } = body;

    // Basic guard (prevents Admin call with empty values)
    if (!(email && password && firstName && lastName)) {
      return NextResponse.json({ status: ResponseStatus.BAD_REQUEST, message: "Missing required fields" }, { status: 400 });
    }

    const user = await adminRole.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
      disabled: false,
      emailVerified: false,
      phoneNumber, // optional; remove if not always present
    });

    return NextResponse.json({ data: user }, { status: ResponseStatus.SUCCESS });
  } catch (error) {
    return NextResponse.json(null, { status: (error as Error).status, statusText: (error as Error).message });
  }
}
