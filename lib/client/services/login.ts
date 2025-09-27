import { clientConfig } from "../client-config";
import type { LoginValues } from "../client-definitions";

const loginUser = async (values: LoginValues) => {
  try {
    const r = await fetch(`${clientConfig.platform.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const data = await r.json()

    if (!r.ok) {
      throw new Error(data?.message || r.statusText);
    }
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(String(err));
  }
};

export default loginUser