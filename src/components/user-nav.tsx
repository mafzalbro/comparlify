"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  LogOut,
  UserCircle,
  LayoutDashboard,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { Session } from "next-auth";

export function UserNav({ user }: { user: Session["user"] }) {
  if (!user) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 shrink-0 select-none overflow-hidden"
        >
          <Avatar key={user?.image} className="h-full w-full">
            <AvatarImage src={user?.image || ""} alt={user.name ?? ""} />
            <AvatarFallback>
              {(user.name ? user.name : "User")?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 rounded-[2.5rem] border-primary/20 bg-card/60 backdrop-blur-3xl shadow-2xl p-4"
        align="end"
        sideOffset={12}
        forceMount
      >
        <DropdownMenuLabel className="font-normal px-5 pt-4 pb-5">
          <div className="flex flex-col space-y-1.5">
            <p className="text-base font-black leading-none tracking-tight truncate">
              {user.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground font-medium truncate opacity-70">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-primary/10 mb-2" />
        <DropdownMenuGroup className="space-y-1">
          <DropdownMenuItem
            asChild
            className="rounded-xl px-4 py-3 cursor-pointer"
          >
            <Link href="/panel">
              <LayoutDashboard className="mr-3 h-4 w-4 text-primary" />
              <span className="font-black uppercase tracking-widest text-[10px]">
                Dashboard
              </span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="rounded-xl px-4 py-3 cursor-pointer"
          >
            <Link href="/panel/profile">
              <UserCircle className="mr-3 h-4 w-4 text-primary" />
              <span className="font-black uppercase tracking-widest text-[10px]">
                Profile
              </span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="rounded-xl px-4 py-3 cursor-pointer"
          >
            <Link href="/panel/settings">
              <Settings className="mr-3 h-4 w-4 text-primary" />
              <span className="font-black uppercase tracking-widest text-[10px]">
                Settings
              </span>
            </Link>
          </DropdownMenuItem>
          {user.role === "ADMIN" && (
            <DropdownMenuItem
              asChild
              className="rounded-xl px-4 py-3 cursor-pointer group hover:bg-red-500/10"
            >
              <Link href="/admin">
                <ShieldCheck className="mr-3 h-4 w-4 text-red-500" />
                <span className="font-black uppercase tracking-widest text-[10px] text-red-500">
                  Admin Arena
                </span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-primary/10 my-2" />
        <DropdownMenuItem
          className="rounded-xl px-4 py-3 cursor-pointer hover:bg-foreground/5"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-3 h-4 w-4 text-muted-foreground" />
          <span className="font-black uppercase tracking-widest text-[10px]">
            Log out
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
