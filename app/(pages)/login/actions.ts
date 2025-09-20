"use server";

import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const username = formData.get("Username") as string;
  const password = formData.get("Password") as string;

  if (!(username && password)) {
    throw new Error("Missing credentials");
  }

  redirect("/login");
}
