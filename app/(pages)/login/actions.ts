"use server";

import { redirect } from "next/navigation";
import { loginFormValidator } from "@/lib/form-validations/login";

export async function loginAction(formData: FormData) {
  const { success, error, data } = loginFormValidator.safeParse({
    username: formData.get("Username"),
    passwrd: formData.get("Password"),
  });

  const { username, password } = data;

  if (success) {
  } else {
    redirect("/login");
  }

  redirect("/");
}
