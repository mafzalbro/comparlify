"use client";

import { signOut } from "next-auth/react";
// import { signOut } from "@/lib/auth";
// import { logout } from "@/app/actions";
import { useTransition } from "react";

export function LogoutButton({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      // await logout();
      signOut({ callbackUrl: "/", redirect: true });
    });
  };

  return (
    <div onClick={handleClick} className="w-full cursor-pointer">
      {children}
    </div>
  );
}
