"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { signInWithPopup } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ButtonWithLoading from "@/custom-components/button-with-loading-state/ButtonWithLoading";
import { clientAuth, clientConfig, googleProvider } from "@/lib/client/client-config";
import type { RegisterValues } from "@/lib/client/client-definitions";
import { clientFeatureFlagsConfig } from "@/lib/client/client-feature-flags";
import { registerSchema } from "@/lib/client/schemas/register-schema";
import registerUser from "@/lib/client/services/register-service";


export default function RegisterPage() {
  clientAuth.useDeviceLanguage();

  const {
    isPending,
    isError,
    isSuccess,
    mutateAsync: regRegisterMutation,
  } = useMutation({
    mutationFn: async (values: RegisterValues) => registerUser(values),
    onSuccess: () => {
      if (isSuccess) {
        redirect("/dashboard");
      }
    },
    onError: (error) => {
      if (isError) {
        console.log(`error received on client: ${error}`);
      }
    },
  });

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", firstName: "", lastName: "", phoneNumber: "", confirmPassword: "" },
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
    const r = await signInWithPopup(clientAuth, googleProvider);
    if (r.user) {
      console.log(r);
      redirect("/dashboard");
    }
    form.reset();
  };

  return (
    <div className="grid min-h-screen w-full grid-cols-1 space-y-2 lg:grid-cols-2">
      {/* Left side: Register/Login Form */}
      <div className="flex flex-col justify-between">
        <div className="flex flex-col items-center justify-center p-6">
          <div className="justify-items-center">
            <Image alt={"logo"} height={125} src={"/logo/logo.png"} width={125} />
          </div>
          <div className="flex w-full min-w-sm max-w-sm flex-col items-center gap-y-4 rounded-lg border px-6 py-12">
            <Button className="hover:text flex w-full items-center bg-white text-black hover:bg-white/90" onClick={handleGoogleRegister} type="submit">
              <FcGoogle />
              Continue with Google
            </Button>
            <Form {...form}>
              <form className="w-full space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="relative flex w-full items-center justify-center py-2">
                  <div className="absolute h-[1px] w-full border-border border-t" />
                  <span className="relative bg-background px-2 text-muted-foreground text-xs">OR</span>
                </div>
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col gap-2">
                      <FormLabel className="font-medium text-sm">First Name</FormLabel>
                      <FormControl>
                        <Input autoComplete="name" className="h-9 text-sm" placeholder="John" type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col gap-2">
                      <FormLabel className="font-medium text-sm" htmlFor="lastName">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input autoComplete="family-name" className="h-9 text-sm" id="lastName" placeholder="Doe" type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col gap-2">
                      <FormLabel className="font-medium text-sm">Email</FormLabel>
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
                    <FormItem className="flex w-full flex-col gap-2">
                      <FormLabel className="font-medium text-sm">Phone</FormLabel>
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
                    <FormItem className="flex w-full flex-col gap-2">
                      <FormLabel className="font-medium text-sm">Password</FormLabel>
                      <FormControl>
                        <Input autoComplete="new-password" className="h-9 text-sm" placeholder="Password" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col gap-2">
                      <FormLabel className="font-medium text-sm">Confirm Password</FormLabel>
                      <FormControl>
                        <Input autoComplete="current-password" className="h-9 text-sm" placeholder="Confirm Password" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <ButtonWithLoading className={"w-full"} loading={isPending} text="Register" type="submit" variant="secondary" />
              </form>
            </Form>
          </div>
          <div className="mt-4 flex justify-center gap-1 text-muted-foreground text-sm">
            <p>Already have an account?</p>
            <a className="font-medium text-accent-foreground hover:underline" href={`${clientConfig.platform.baseUrl}/auth/login`}>
              Login
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
        <Image alt="login-register-v2" className="h-full w-full object-fill" height={600} src={"/login-register-v2.png"} width={800} />
      </div>
    </div>
  );
}
