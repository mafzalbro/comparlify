
'use client';

import { useActionState, useState } from 'react';
import { createEmailCampaign, updateEmailCampaign, sendTestEmailAction } from '@/app/actions/emails';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type EmailCampaign, type User } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { SubmitButton } from '@/components/submit-button';
import { Editor } from '@/components/ui/editor';
import { Send, Mail } from 'lucide-react';
import { SendCampaignButton } from './send-campaign-button';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { UserMultiSelect } from './user-multi-select';

interface EmailFormProps {
  campaign?: (EmailCampaign & { excludedUsers: User[] }) | null;
  users: User[];
}

export function EmailForm({ campaign, users }: EmailFormProps) {
  const router = useRouter();
  const isEditing = !!campaign;
  const formAction = isEditing ? updateEmailCampaign.bind(null, campaign.id) : createEmailCampaign;
  const [state, action] = useActionState(formAction, { error: null });
  const [content, setContent] = useState(campaign?.content ?? '');
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [excludedUsers, setExcludedUsers] = useState<string[]>(campaign?.excludedUsers.map(u => u.id) ?? []);

  const handleSendTest = async () => {
    if (!session?.user?.email) {
      toast({ title: "Error", description: "Could not find your email address.", variant: 'destructive' });
      return;
    }
    const form = document.querySelector('form');
    if (!form) return;

    const formData = new FormData(form);
    const subject = formData.get('subject') as string;

    const result = await sendTestEmailAction({ to: session.user.email, subject, content });
    
    if (result.success) {
      toast({ title: "Test Email Sent", description: `A test email has been sent to ${session.user.email}.`});
    } else {
      toast({ title: "Error", description: result.error, variant: 'destructive' });
    }
  };

  return (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                <form action={action}>
                    <input type="hidden" name="content" value={content} />
                    {excludedUsers.map(userId => (
                        <input type="hidden" name="excludedUserIds" key={userId} value={userId} />
                    ))}
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Content</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" name="subject" defaultValue={campaign?.subject} required />
                            {typeof state.error !== 'string' && state?.error?.subject && <p className="text-destructive text-sm">{state.error.subject[0]}</p>}
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="content">Body (Markdown enabled)</Label>
                            <Editor initialContent={content} onChange={setContent} />
                            {typeof state.error !== 'string' && state?.error?.content && <p className="text-destructive text-sm">{state.error.content[0]}</p>}
                            </div>
                        </CardContent>
                    </Card>
                </form>
                <Card>
                    <CardHeader>
                        <CardTitle>Exclude Recipients</CardTitle>
                        <CardDescription>Select users who should NOT receive this email campaign, even if they are subscribed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserMultiSelect 
                            allUsers={users}
                            selectedUsers={excludedUsers}
                            onSelectedUsersChange={setExcludedUsers}
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
                        <Button
                            onClick={() => {
                                const form = document.querySelector('form');
                                if (form) {
                                    form.requestSubmit();
                                }
                            }}
                            className="w-full"
                        >
                            {isEditing ? 'Save Changes' : 'Save Draft'}
                        </Button>
                        <Button type="button" variant="secondary" className="w-full" onClick={handleSendTest}>
                            <Mail className="mr-2 h-4 w-4" /> Send Test Email
                        </Button>
                    </CardContent>
                    {isEditing && campaign.status === 'PENDING' && (
                        <CardFooter className="flex-col gap-4">
                            <div className="w-full h-px bg-border" />
                            <SendCampaignButton campaignId={campaign.id} />
                        </CardFooter>
                    )}
                </Card>
            </div>
        </div>
    </div>
  );
}
