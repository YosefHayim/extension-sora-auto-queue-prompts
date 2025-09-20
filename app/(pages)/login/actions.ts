"use server";

import { redirect } from "next/navigation";
import { loginFormValidator } from "@/lib/form-validations/login";

export async function loginAction(formData: FormData) {
  const { success, error,data} = loginFormValidator.safeParse({
    username: formData.get("Username"),
    password: formData.get("Password"),
  });

  console.log('username: ',data?.username)
  console.log('password: ',data?.password)
}
