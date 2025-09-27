import { clientConfig } from "../client-config";
import type { RegisterValues } from "../client-definitions";

const registerUser = async (values: RegisterValues) => {
  try {
    const r = await fetch(`${clientConfig.platform.baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await r.json();

    if (!r.ok) {
      throw new Error(data?.message || r.statusText);
    }

    return data;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(String(err));
  }
};

export default registerUser;
