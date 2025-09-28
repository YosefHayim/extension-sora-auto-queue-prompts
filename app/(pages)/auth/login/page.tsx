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
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left: brand + centered form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* Brand row */}
        <div className="flex justify-center gap-2 md:justify-start">
          <Link className="flex items-center gap-2 font-medium" href="/">
            <div className="flex size-6 items-center justify-center overflow-hidden rounded-md bg-primary text-primary-foreground">
              {/* Small brand mark */}
              <Image alt="logo" height={24} src="/logo/logo.png" width={24} />
            </div>
            <span className="sr-only">Home</span>
            <span className="hidden sm:inline">AutoBay</span>
          </Link>
        </div>

        {/* Centered form card width */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {/* Google button */}
            <Button className="w-full" onClick={handleGoogleRegister} type="button" variant="outline">
              <FcGoogle />
              <span className="ml-2">Login with Google</span>
            </Button>

            {/* Divider */}
            <div className="relative my-6 text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>

            {/* Email/password form (unchanged logic) */}
            <Form {...form}>
              <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="font-bold text-2xl">Login to your account</h1>
                  <p className="text-balance text-muted-foreground text-sm">Enter your email below to login to your account
                  </p>
                </div>

                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="grid gap-3">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input autoComplete="email" className="h-9 text-sm" placeholder="m@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="grid gap-3">
                        <div className="flex items-center">
                          <FormLabel>Password</FormLabel>
                          <Link className="ml-auto text-sm underline-offset-4 hover:underline" href="/forgot-password">
                            Forgot your password?
                          </Link>
                        </div>
                        <FormControl>
                          <Input autoComplete="current-password" className="h-9 text-sm" placeholder="••••••••" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <ButtonWithLoading className="w-full" loading={isPending} text="Login" type="submit" variant="default" />
                </div>

                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <a className="underline underline-offset-4" href={`${clientConfig.platform.baseUrl}/auth/register`}>
                    Sign up
                  </a>
                </div>
              </form>
            </Form>

            <div className="mt-6 flex items-center justify-between text-muted-foreground text-xs">
              <Link className="hover:underline" href="/privacy-policy">
                Privacy Policy
              </Link>
              <Link className="hover:underline" href="/terms-of-service">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right: muted full-bleed image */}
      <div className="relative hidden bg-muted lg:block">
        <Image alt="auth-wallpaper" className="absolute inset-0 object-cover dark:brightness-[0.2] dark:grayscale" fill priority src="/auth-wallpaper.png" />
      </div>
    </div>
  );
}
