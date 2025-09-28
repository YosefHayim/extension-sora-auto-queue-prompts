"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { signInWithPopup } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ButtonWithLoading from "@/custom-components/button-with-loading-state/ButtonWithLoading";
import { clientConfig, fireBaseClientAuth, googleProvider } from "@/lib/client/client-config";
import type { LoginValues } from "@/lib/client/client-definitions";
import { clientFeatureFlagsConfig } from "@/lib/client/client-feature-flags";
import { loginSchema } from "@/lib/client/schemas/login-schema";
import loginUser from "@/lib/client/services/login";

export default function LoginPage() {
  fireBaseClientAuth.useDeviceLanguage();
  const router = useRouter();

  const { isPending, mutateAsync: loginMutate } = useMutation({
    mutationFn: async (values: LoginValues) => loginUser(values),
    onSuccess: async () => {
      router.push("/dashboard");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : String(e));
    },
  });

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: clientFeatureFlagsConfig.formMode.login,
  });

  const onSubmit = async (values: LoginValues) => {
    await loginMutate(values);
  };

  const handleGoogleRegister = async () => {
    const r = await signInWithPopup(fireBaseClientAuth, googleProvider);
    if (r.user.email) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="grid min-h-screen w-full grid-cols-1 space-y-2 lg:grid-cols-2">
      {/* Left side: Register/Login Form */}
      <div className="flex flex-col items-center justify-around p-6">
        <div>
          <div className="justify-items-center">
            <Image alt={"logo"} height={125} src={"/logo/logo.png"} width={125} />
          </div>
          <div className="flex w-full min-w-sm max-w-sm flex-col items-center gap-y-4 rounded-lg border px-6 py-12">
            <Button className="hover:text flex w-full items-center bg-white text-black hover:bg-white/90" onClick={handleGoogleRegister} type="submit">
              <FcGoogle />
              Login with Google
            </Button>
            <Form {...form}>
              <form className="w-full space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="relative flex w-full items-center justify-center py-2">
                  <div className="absolute h-[1px] w-full border-border border-t" />
                  <span className="relative bg-background px-2 text-muted-foreground text-xs">OR</span>
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col gap-2">
                      <FormLabel className="font-medium text-sm">Email</FormLabel>
                      <FormControl>
                        <Input autoComplete="email" className="h-9 text-sm" placeholder="Email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col gap-2">
                      <FormLabel className="font-medium text-sm">Password</FormLabel>
                      <FormControl>
                        <Input autoComplete="current-password" className="h-9 text-sm" placeholder="Password" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <ButtonWithLoading className="w-full" loading={isPending} text="Login" type="submit" variant="secondary" />
              </form>
            </Form>
          </div>
          <div className="mt-4 flex justify-center gap-1 text-muted-foreground text-sm">
            <p>Need an account?</p>
            <a className="font-medium text-accent-foreground hover:underline" href={`${clientConfig.platform.baseUrl}/auth/register`}>
              Register
            </a>
          </div>
        </div>
        <div className="flex w-full justify-between px-20">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-of-service">Terms of Service</Link>
        </div>
      </div>

      {/* Right side: Placeholder image */}
      <div className="hidden items-center justify-center bg-gray-100 lg:flex">
        <Image alt="login-register" className="h-full w-full object-fill" height={600} src={"/login-register.png"} width={800} />
      </div>
    </div>
  );
}
