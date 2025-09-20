import * as z from "zod";

export const loginFormValidator = z.object({
  username: z
    .string()
    .regex(/^[a-zA-Z0-9]+$/, {
      error: "Username can only contain letters and numbers",
    }),
  passwrd: z.string().min(6),
});
