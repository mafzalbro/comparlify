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
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <header className="space-y-1">
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight uppercase">
          Account <span className="text-primary italic">Settings</span>
        </h2>
        <p className="text-xs text-muted-foreground font-medium">
          Manage your profile information and preferences.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <form action={formAction}>
            <Card className="bg-card/40 backdrop-blur-md border border-border/40 hover:border-border/60 transition-colors rounded-2xl overflow-hidden shadow-md">
              <CardHeader className="p-6 border-b border-border/20">
                <CardTitle className="text-xl font-extrabold uppercase tracking-tight">
                  Public <span className="text-primary">Identity</span>
                </CardTitle>
                <CardDescription className="text-xs font-medium">
                  This information appears on your profile and comments.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground"
                  >
                    Display Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={user.name ?? ""}
                    className="h-10 rounded-xl border-border/30 bg-background/50 focus:bg-background transition-all text-xs font-medium"
                  />
                  {typeof state.error !== "string" && state.error?.name && (
                    <p className="text-[10px] font-bold text-destructive uppercase tracking-widest pl-1">
                      {state.error.name[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    value={user.email ?? ""}
                    disabled
                    className="h-10 rounded-xl border-border/20 bg-muted/20 opacity-60 cursor-not-allowed text-xs font-medium"
                  />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                    Your email address cannot be changed.
                  </p>
                </div>
              </CardContent>

              <div className="h-px bg-border/20" />

              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xl font-extrabold uppercase tracking-tight">
                  Email <span className="text-primary">Preferences</span>
                </CardTitle>
                <CardDescription className="text-xs font-medium">
                  Manage your email notification and newsletter settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <div className="flex items-center justify-between rounded-xl bg-background/50 border border-border/20 p-4">
                  <div className="space-y-1">
                    <Label
                      htmlFor="newsletter"
                      className="text-sm font-extrabold tracking-tight"
                    >
                      Newsletter
                    </Label>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-md font-medium">
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

              <CardFooter className="p-6 bg-secondary/10 border-t border-border/20 flex justify-end">
                <SubmitButton
                  isEditing={true}
                  editingText="Save Changes"
                />
              </CardFooter>
            </Card>
          </form>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="border-destructive/30 bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-md group">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-lg font-extrabold uppercase tracking-tight text-destructive flex items-center gap-2">
                <Loader2 className="h-5 w-5 group-hover:animate-spin transition-all" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-4">
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
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
