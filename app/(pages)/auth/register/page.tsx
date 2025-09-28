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
import type { RegisterValues } from "@/lib/client/client-definitions";
import { clientFeatureFlagsConfig } from "@/lib/client/client-feature-flags";
import { registerSchema } from "@/lib/client/schemas/register-schema";
import registerUser from "@/lib/client/services/register";

export default function RegisterPage() {
  fireBaseClientAuth.useDeviceLanguage();
  const router = useRouter();

  const { isPending, mutateAsync: regRegisterMutation } = useMutation({
    mutationFn: async (values: RegisterValues) => registerUser(values),
    retry: false,
    onSuccess: async () => {
      toast.success("Account Created");
      router.push("/dashboard");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : String(e));
    },
  });

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      // firstName: "",
      // lastName: "",
      phoneNumber: "",
      confirmPassword: "",
    },
    mode: clientFeatureFlagsConfig.formMode.register,
  });

  const onSubmit = async (values: RegisterValues) => {
    if (values.password !== values.confirmPassword) {
      form.setError("confirmPassword", { message: "Passwords do not match" });
      return;
    }
    await regRegisterMutation(values);
  };

  const handleGoogleRegister = async () => {
    const r = await signInWithPopup(fireBaseClientAuth, googleProvider);
    if (r.user) {
      router.push("/dashboard");
    }
    form.reset();
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left: brand + centered form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* Brand row */}
        <div className="flex justify-center gap-2 md:justify-start">
          <Link className="flex items-center gap-2 font-medium" href="/">
            <div className="flex size-6 items-center justify-center overflow-hidden rounded-md bg-primary text-primary-foreground">
              <Image alt="logo" height={24} src="/logo/logo.png" width={24} />
            </div>
            <span className="hidden sm:inline">AutoBay</span>
          </Link>
        </div>

        {/* Centered form column */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {/* Social auth */}
            <Button className="w-full" onClick={handleGoogleRegister} type="button" variant="outline">
              <FcGoogle />
              <span className="ml-2">Continue with Google</span>
            </Button>

            {/* Divider */}
            <div className="relative my-6 text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>

            {/* Register form (logic unchanged) */}
            <Form {...form}>
              <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="font-bold text-2xl">Create your account</h1>
                  <p className="text-balance text-muted-foreground text-sm">Enter details to get started</p>
                </div>

                <div className="grid gap-6">
                  {/* <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="grid gap-3">
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input autoComplete="given-name" className="h-9 text-sm" placeholder="John" type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="grid gap-3">
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input autoComplete="family-name" className="h-9 text-sm" placeholder="Doe" type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="grid gap-3">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input autoComplete="email" className="h-9 text-sm" placeholder="example@gmail.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="grid gap-3">
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input autoComplete="tel" className="h-9 text-sm" placeholder="+1 (555) 555-5555" type="text" {...field} />
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
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input autoComplete="new-password" className="h-9 text-sm" placeholder="••••••••" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="grid gap-3">
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input autoComplete="new-password" className="h-9 text-sm" placeholder="••••••••" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <ButtonWithLoading className="w-full" loading={isPending} text="Register" type="submit" variant="default" />
                </div>

                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <a className="underline underline-offset-4" href={`${clientConfig.platform.baseUrl}/auth/login`}>
                    Login
                  </a>
                </div>
              </form>
            </Form>

            {/* Footer links condensed */}
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
        <Image alt="auth-wallpaper" className="absolute inset-0 object-cover" fill priority src="/auth-wallpaper.png" />
      </div>
    </div>
  );
}
