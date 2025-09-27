import { clientConfig } from "../client-config";
import type { LoginValues } from "../client-definitions";

const loginUser = async (values: LoginValues) => {
  const r = await fetch(`${clientConfig.platform.baseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
  if (!r.ok) {
    console.log(r);
  }
};

export default loginUser