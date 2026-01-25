import * as React from "react";
import { LuSparkles } from "react-icons/lu";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface AuthLoginProps {
  onGoogleLogin?: () => void;
  className?: string;
}

export function AuthLogin({ onGoogleLogin, className }: AuthLoginProps) {
  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <div className="flex-1 flex flex-col items-center justify-center gap-8 py-10 px-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center">
            <LuSparkles className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground text-center">
            Sora Queue
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Automate your Sora AI workflow
          </p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <Button
            onClick={onGoogleLogin}
            variant="outline"
            className="w-full h-12 flex items-center justify-center gap-3"
          >
            <span className="text-base font-bold text-blue-500">G</span>
            <span className="text-sm font-medium">Continue with Google</span>
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground text-center leading-[1.4] max-w-[280px]">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
