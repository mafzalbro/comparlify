'use client';

import { logout } from "@/app/actions";
import { useTransition } from "react";

export function LogoutButton({ children }: { children: React.ReactNode }) {
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        startTransition(async () => {
            await logout();
        });
    };

    return (
        <div onClick={handleClick} className="w-full cursor-pointer">
            {children}
        </div>
    );
}
