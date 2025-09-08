
'use client';

import { useActionState, useEffect } from 'react';
import { updateUserProfileAction } from '@/app/actions';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/submit-button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function UserSettingsPage() {
  const { data: session, update } = useSession();
  const [state, formAction] = useActionState(updateUserProfileAction, { error: null, success: false });
  const { toast } = useToast();

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success!',
        description: 'Your profile has been updated successfully.',
      });
      // Trigger a session update to reflect the new name in the UI
      update();
    }
  }, [state.success, toast, update]);

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { user } = session;

  return (
    <div>
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
                <form action={formAction}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Public Profile</CardTitle>
                            <CardDescription>This information may be displayed publicly.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" defaultValue={user.name ?? ''} />
                                {typeof state.error !== 'string' && state.error?.name && <p className="text-sm text-destructive mt-2">{state.error.name[0]}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" value={user.email ?? ''} disabled />
                                <p className="text-xs text-muted-foreground">Your email address cannot be changed.</p>
                            </div>
                        </CardContent>
                        <CardHeader className="border-t pt-6">
                             <CardTitle>Notifications</CardTitle>
                            <CardDescription>Manage your email notification preferences.</CardDescription>
                        </CardHeader>
                         <CardContent className="pt-6">
                             <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <Label htmlFor="newsletter" className="font-medium">Email Newsletter</Label>
                                    <p className="text-sm text-muted-foreground">Receive updates about new tools and content.</p>
                                </div>
                                <Switch id="newsletter" name="newsletter" defaultChecked={user.newsletter} />
                             </div>
                        </CardContent>
                        <CardFooter className="border-t pt-6">
                            <SubmitButton isEditing={true} editingText="Save All Changes" />
                        </CardFooter>
                    </Card>
                </form>
            </div>
            <div className="md:col-span-1">
                 <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                         <Button variant="destructive" className="w-full" disabled>
                            Delete My Account
                        </Button>
                    </CardContent>
                 </Card>
            </div>
        </div>
    </div>
  );
}
