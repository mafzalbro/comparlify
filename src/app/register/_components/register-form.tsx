"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useSearchParams } from "next/navigation";

export function RegisterForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSignIn = (provider: "google" | "github") => {
    signIn(provider, { callbackUrl });
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <Button
          className="w-full h-12 rounded-xl bg-white border border-border/10 text-foreground hover:bg-neutral-50 shadow-md shadow-black/5 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-black"
          variant="outline"
          onClick={() => handleSignIn("google")}
        >
          <FcGoogle className="mr-3 h-5 w-5" />
          Continue with Google
        </Button>
        <Button
          className="w-full h-12 rounded-xl bg-[#24292e] border-none text-white hover:bg-[#1a1e22] shadow-md shadow-black/10 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          variant="default"
          onClick={() => handleSignIn("github")}
        >
          <Github className="mr-3 h-5 w-5" />
          Continue with GitHub
        </Button>
      </div>
    </>
  );
}
