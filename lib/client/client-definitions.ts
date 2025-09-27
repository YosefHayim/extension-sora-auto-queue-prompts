import type z from "zod";
import type { loginSchema } from "./schemas/login-schema";
import type { registerSchema } from "./schemas/register-schema";

export type ClientFeatureFlags = {
  reactFormHooksModeLogin: "onBlur" | "onChange" | "onSubmit" | "onTouched" | "all" | undefined;
  reactFormHooksModeRegister: "onBlur" | "onChange" | "onSubmit" | "onTouched" | "all" | undefined;
};

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
