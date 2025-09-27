import { clientConfig } from "../client-config";
import type { RegisterValues } from "../client-definitions";

const registerUser = async (values: RegisterValues) => {
  const r = await fetch(`${clientConfig.platform.baseUrl}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  if (!r.ok) {
    throw new Error('Something went wrong');
  }
};

export default registerUser;
