"use client";

import { useActionState, useEffect, useRef } from "react";
import { updateUserProfileAction } from "@/app/actions/user";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { DeleteAccountDialog } from "./_components/delete-account-dialog";
import { getContent } from "@/lib/content";
import { useState } from "react";

export default function UserSettingsPage() {
  const { data: session, update } = useSession();
  const [state, formAction, isPending] = useActionState(
    updateUserProfileAction,
    { error: null, success: false },
  );
  const { toast } = useToast();
  const hasUpdated = useRef(false);
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchContent() {
      const siteContent = await getContent();
      setContent(siteContent);
    }
    fetchContent();
  }, []);

  useEffect(() => {
    if (state.success && !hasUpdated.current) {
      toast({
        title: "Success!",
        description: "Your profile has been updated successfully.",
      });
      // Trigger a session update to reflect the new name in the UI
      update();
      hasUpdated.current = true;
    }
    if (state.error) {
      hasUpdated.current = false;
    }
  }, [state.success, state.error?.toString(), toast, update]);

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { user } = session;
  const siteName = content["global.siteName"] || "The Site";

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      <header className="space-y-4 px-4">
        <h2 className="text-3xl font-black text-foreground tracking-tight uppercase">
          Account <span className="text-primary italic">Settings</span>
        </h2>
        <p className="text-sm text-muted-foreground font-medium">
          Manage your profile information and preferences.
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <form action={formAction}>
            <Card className="bg-card/40 backdrop-blur-3xl border-border/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <CardHeader className="p-10 border-b border-border/5">
                <CardTitle className="text-2xl font-black uppercase tracking-tight">
                  Public <span className="text-primary">Identity</span>
                </CardTitle>
                <CardDescription className="text-base">
                  This information appears on your profile and comments.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="space-y-3">
                  <Label
                    htmlFor="name"
                    className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                  >
                    Display Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={user.name ?? ""}
                    className="h-14 rounded-2xl border-border/10 bg-background/50 focus:bg-background transition-all"
                  />
                  {typeof state.error !== "string" && state.error?.name && (
                    <p className="text-xs font-bold text-destructive uppercase tracking-widest pl-2">
                      {state.error.name[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="email"
                    className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    value={user.email ?? ""}
                    disabled
                    className="h-14 rounded-2xl border-border/10 bg-muted/20 opacity-50 cursor-not-allowed"
                  />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-2">
                    Your email address cannot be changed.
                  </p>
                </div>
              </CardContent>

              <div className="h-px bg-border/5" />

              <CardHeader className="p-10 pb-4">
                <CardTitle className="text-2xl font-black uppercase tracking-tight">
                  Email <span className="text-primary">Preferences</span>
                </CardTitle>
                <CardDescription className="text-base">
                  Manage your email notification and newsletter settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-10 pt-0">
                <div className="flex items-center justify-between rounded-3xl bg-secondary/5 border border-border/5 p-8 group hover:border-primary/20 transition-all">
                  <div className="space-y-2">
                    <Label
                      htmlFor="newsletter"
                      className="text-lg font-black tracking-tight group-hover:text-primary transition-colors"
                    >
                      Newsletter
                    </Label>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                      Receive updates from {siteName} about new comparisons, tools, and platform insights.
                    </p>
                  </div>
                  <Switch
                    id="newsletter"
                    name="newsletter"
                    defaultChecked={user.newsletter}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </CardContent>

              <CardFooter className="p-10 bg-secondary/5 border-t border-border/5 flex justify-end">
                <SubmitButton
                  isEditing={true}
                  editingText="Save Changes"
                  // className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                />
              </CardFooter>
            </Card>
          </form>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <Card className="border-destructive/20 bg-destructive/2 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl group min-h-[200px]">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-2xl font-black uppercase tracking-tight text-destructive flex items-center gap-3">
                <Loader2 className="h-6 w-6 group-hover:animate-spin transition-all" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-6">
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                Permanently delete your account and all of your data. This action cannot be undone.
              </p>
              <DeleteAccountDialog />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
