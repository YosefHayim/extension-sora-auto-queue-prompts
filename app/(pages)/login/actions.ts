"use server";

import { loginFormValidator } from "@/lib/form-validations/login";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const {success,error,data} = loginFormValidator.safeParse({
    username: formData.get("Username"),
    passwrd: formData.get("Password"),
  })

  const {username,password} = data

  if (!success) {
    console.log(error)
  } else {
    console.log(data)
  }


  redirect("/login");
}
