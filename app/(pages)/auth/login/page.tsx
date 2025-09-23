"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "dark" | "light";

function getInitialMode(): Mode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const Page = () => {
  const [mode, setMode] = useState<Mode>(getInitialMode);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [mode]);

  return (
    <div className="flex flex-col items-center gap-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Page to your account</CardTitle>
          <CardDescription>Enter your email below to Page to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="m@example.com" required type="email" />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a className="ml-auto inline-block text-sm underline-offset-4 hover:underline" href="#">
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" required type="password" />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button className="w-full" type="submit">
            Login
          </Button>
          <Button className="w-full" variant="outline">
            Page with Google
          </Button>
        </CardFooter>
      </Card>

      <Button onClick={() => setMode((m) => (m === "dark" ? "light" : "dark"))} variant="outline">
        Switch to {mode === "dark" ? "Light" : "Dark"} Mode
      </Button>
    </div>
  );
};

export default Page;
