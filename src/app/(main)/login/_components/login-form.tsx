"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { Github } from "lucide-react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSignIn = (provider: "google" | "github") => {
    signIn(provider, { callbackUrl });
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <Button
          variant="default"
          className="w-full h-12 rounded-xl shadow-md shadow-primary/10 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => handleSignIn("google")}
        >
          <FcGoogle className="mr-3 h-5 w-5" />
          Continue with Google
        </Button>
        <Button
          className="w-full h-12 rounded-xl shadow-md shadow-primary/10 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
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
