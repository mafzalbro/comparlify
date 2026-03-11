"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createEmailCampaign,
  updateEmailCampaign,
  sendTestEmailAction,
} from "@/app/actions/emails";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type EmailCampaign, type User } from "@prisma/client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const Editor = dynamic(
  () => import("@/components/ui/editor").then((mod) => mod.Editor),
  { ssr: false },
);
import { Send, Mail, Save } from "lucide-react";
import { SendCampaignButton } from "./send-campaign-button";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { UserMultiSelect } from "./user-multi-select";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface EmailFormProps {
  campaign?: EmailCampaign | null;
  users: User[];
}

function SaveButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Save className="mr-2 h-4 w-4" />
      )}
      {isEditing ? "Save Changes" : "Save Draft"}
    </Button>
  );
}

export function EmailForm({ campaign, users }: EmailFormProps) {
  const router = useRouter();
  const isEditing = !!campaign;
  const formAction = isEditing
    ? updateEmailCampaign.bind(null, campaign.id)
    : createEmailCampaign;
  const [state, action] = useActionState(formAction, { error: null });
  const [content, setContent] = useState(campaign?.content ?? "");
  const { data: session } = useSession();
  const { toast } = useToast();

  const [excludedUsers, setExcludedUsers] = useState<string[]>(
    campaign?.excludedUserIds ? campaign.excludedUserIds.split(",") : [],
  );

  useEffect(() => {
    if (state.error) {
      toast({
        title: "Error",
        description:
          typeof state.error === "string"
            ? state.error
            : "There was an issue saving the campaign.",
        variant: "destructive",
      });
    }
  }, [state, toast]);

  const handleSendTest = async () => {
    if (!session?.user?.email) {
      toast({
        title: "Error",
        description: "Could not find your email address.",
        variant: "destructive",
      });
      return;
    }
    const form = document.querySelector("form");
    if (!form) return;

    const formData = new FormData(form);
    const subject = formData.get("subject") as string;

    const result = await sendTestEmailAction({
      to: session.user.email,
      subject,
      content,
    });

    if (result.success) {
      toast({
        title: "Test Email Sent",
        description: `A test email has been sent to ${session.user.email}.`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const isSent = campaign?.status === "SENT" || campaign?.status === "SENDING";

  return (
    <div>
      <form action={action}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Hidden inputs to pass state to the form action */}
                <input type="hidden" name="content" value={content} />
                {excludedUsers.map((userId) => (
                  <input
                    type="hidden"
                    name="excludedUserIds"
                    key={userId}
                    value={userId}
                  />
                ))}

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    defaultValue={campaign?.subject}
                    required
                    disabled={isSent}
                  />
                  {typeof state.error !== "string" && state?.error?.subject && (
                    <p className="text-destructive text-sm">
                      {state.error.subject[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Body (Markdown enabled)</Label>
                  <Editor initialContent={content} onChange={setContent} />
                  {typeof state.error !== "string" && state?.error?.content && (
                    <p className="text-destructive text-sm">
                      {state.error.content[0]}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exclude Recipients</CardTitle>
                <CardDescription>
                  Select users who should NOT receive this email campaign, even
                  if they are subscribed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserMultiSelect
                  allUsers={users}
                  selectedUsers={excludedUsers}
                  onSelectedUsersChange={setExcludedUsers}
                  disabled={isSent}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SaveButton isEditing={isEditing} />
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={handleSendTest}
                  disabled={isSent}
                >
                  <Mail className="mr-2 h-4 w-4" /> Send Test Email
                </Button>
              </CardContent>
              {isEditing && (
                <CardFooter className="flex-col gap-4">
                  <div className="w-full h-px bg-border" />
                  <SendCampaignButton
                    campaignId={campaign.id}
                    disabled={isSent}
                  />
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
